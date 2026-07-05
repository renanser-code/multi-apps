import os
import sys
import re
import shutil
import subprocess
import threading
import queue
from pathlib import Path

import numpy as np
import cv2

from PySide6.QtCore import Qt, QThread, Signal, Slot
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QFileDialog, QSlider, QComboBox, QProgressBar,
    QTextEdit, QFrame, QStyle, QMessageBox
)

# Load YOLOv8 only when needed to keep startup fast
def get_yolo_model():
    from ultralytics import YOLO
    # Downloads yolov8n.pt (6MB) on first use
    return YOLO("yolov8n.pt")

class EquirectangularToPerspective:
    """
    Handles math projections to transform equirectangular 360 images/frames 
    to flat perspective (rectilinear) views using OpenCV remap.
    """
    def __init__(self, height, width, fov_deg, out_h, out_w):
        self.height = height
        self.width = width
        self.fov_deg = fov_deg
        self.out_h = out_h
        self.out_w = out_w
        
        # Calculate focal length
        fov_rad = np.deg2rad(fov_deg)
        self.f = 0.5 * out_w / np.tan(0.5 * fov_rad)
        
        # Create grid in 3D camera coordinate space
        x = np.arange(out_w) - 0.5 * out_w
        y = np.arange(out_h) - 0.5 * out_h
        xx, yy = np.meshgrid(x, y)
        zz = np.ones_like(xx) * self.f
        
        # Normalize to unit vectors on sphere
        self.xyz = np.stack([xx, yy, zz], axis=-1)
        self.xyz = self.xyz / np.linalg.norm(self.xyz, axis=-1, keepdims=True)

    def get_remap_coords(self, yaw_deg, pitch_deg, roll_deg=0):
        # Convert degrees to radians
        yaw = np.deg2rad(yaw_deg)
        pitch = np.deg2rad(pitch_deg)
        roll = np.deg2rad(roll_deg)
        
        # Rotation matrices
        # Yaw (horizontal pan)
        R_yaw = np.array([
            [np.cos(yaw), 0, -np.sin(yaw)],
            [0, 1, 0],
            [np.sin(yaw), 0, np.cos(yaw)]
        ], dtype=np.float32)
        
        # Pitch (vertical tilt)
        R_pitch = np.array([
            [1, 0, 0],
            [0, np.cos(pitch), np.sin(pitch)],
            [0, -np.sin(pitch), np.cos(pitch)]
        ], dtype=np.float32)
        
        # Roll (horizon level adjustment)
        R_roll = np.array([
            [np.cos(roll), np.sin(roll), 0],
            [-np.sin(roll), np.cos(roll), 0],
            [0, 0, 1]
        ], dtype=np.float32)
        
        # Combined rotation matrix
        R = R_yaw @ R_pitch @ R_roll
        
        # Rotate all rays
        rotated_xyz = self.xyz @ R.T
        
        rx = rotated_xyz[..., 0]
        ry = rotated_xyz[..., 1]
        rz = rotated_xyz[..., 2]
        
        # Map 3D rays to spherical longitude (theta) and latitude (phi)
        theta = np.arctan2(rx, rz)
        phi = np.arcsin(np.clip(ry, -1.0, 1.0))
        
        # Normalize to [0, 1] range relative to equirectangular dimensions
        u = (theta + np.pi) / (2 * np.pi)
        v = (phi + np.pi/2) / np.pi
        
        # Scale to input image size
        map_x = (u * self.width).astype(np.float32)
        map_y = (v * self.height).astype(np.float32)
        
        # Wrap longitude horizontally
        map_x = map_x % self.width
        # Clip latitude to prevent out of bounds
        map_y = np.clip(map_y, 0, self.height - 1)
        
        return map_x, map_y

class VideoProcessorThread(QThread):
    progress = Signal(int)
    status_message = Signal(str)
    finished_success = Signal(str)
    error_occurred = Signal(str)

    def __init__(self, input_path, output_path, target_class_id, fov, smoothing, aspect_ratio):
        super().__init__()
        self.input_path = input_path
        self.output_path = output_path
        self.target_class_id = target_class_id
        self.fov_deg = fov
        # Convert smoothing percent (1-100) to factor (0.01 - 1.0)
        # 1 smoothing => 1.0 (no smoothing, fast tracking)
        # 100 smoothing => 0.01 (extremely heavy smoothing, slow panning)
        self.smoothing_factor = max(0.01, min(1.0, (101 - smoothing) / 100.0))
        self.aspect_ratio = aspect_ratio
        self.is_running = True

    def run(self):
        try:
            self.status_message.emit("Carregando modelo de IA YOLOv8...")
            model = get_yolo_model()
            
            self.status_message.emit("Abrindo vídeo de entrada...")
            cap = cv2.VideoCapture(self.input_path)
            if not cap.isOpened():
                raise RuntimeError("Não foi possível abrir o vídeo de entrada.")

            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

            if total_frames <= 0:
                total_frames = 100 # Fallback

            # Determine output aspect ratio dimensions
            if self.aspect_ratio == "16:9 (Paisagem)":
                out_w, out_h = 1920, 1080
            else: # 9:16 (Retrato)
                out_w, out_h = 1080, 1920

            self.status_message.emit(f"Vídeo de entrada: {width}x{height} @ {fps:.2f}fps")
            self.status_message.emit(f"Resolução de saída: {out_w}x{out_h}")
            
            # Setup output writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(self.output_path, fourcc, fps, (out_w, out_h))
            if not out.isOpened():
                raise RuntimeError("Não foi possível criar o arquivo de saída.")

            # Create our custom projection mapping tool
            projector = EquirectangularToPerspective(height, width, self.fov_deg, out_h, out_w)

            # Initial camera pointing direction
            current_yaw = 0.0
            current_pitch = 0.0
            target_yaw = 0.0
            target_pitch = 0.0
            first_frame = True

            frame_idx = 0
            while self.is_running:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_idx += 1

                # Run object detection (downsize frame input to YOLO to speed up processing)
                # YOLOv8 handles sizing internally but passing a downsized frame makes pre-processing faster
                small_frame = cv2.resize(frame, (1280, 720)) if (width > 1920) else frame
                results = model.predict(small_frame, verbose=False, imgsz=640)

                best_box = None
                min_dist = float('inf')

                # Scale coordinates back if we resized the frame
                scale_w = width / 1280.0 if (width > 1920) else 1.0
                scale_h = height / 720.0 if (width > 1920) else 1.0

                for box in results[0].boxes:
                    cls_id = int(box.cls[0])
                    # If this matches our target class (e.g. 0 for person, 2 for car)
                    if cls_id == self.target_class_id:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        cx = ((x1 + x2) / 2.0) * scale_w
                        cy = ((y1 + y2) / 2.0) * scale_h

                        # Map (cx, cy) to spherical coordinates
                        # Yaw: horizontal [-180, 180] degrees
                        ty = (cx / width) * 360.0 - 180.0
                        # Pitch: vertical [-90, 90] degrees (positive is up, negative is down)
                        tp = 90.0 - (cy / height) * 180.0

                        # Calculate distance from current heading to find the closest matching target (tracking lock)
                        diff_y = ty - current_yaw
                        # Wrap Yaw
                        diff_y = (diff_y + 180.0) % 360.0 - 180.0
                        
                        dist = np.hypot(diff_y, tp - current_pitch)
                        if dist < min_dist:
                            min_dist = dist
                            best_box = (ty, tp)

                # Update target coordinates if object was detected
                if best_box is not None:
                    target_yaw, target_pitch = best_box
                    if first_frame:
                        current_yaw = target_yaw
                        current_pitch = target_pitch
                        first_frame = False

                # Handle 360 wrap-around for Yaw interpolation
                diff_yaw = target_yaw - current_yaw
                diff_yaw = (diff_yaw + 180.0) % 360.0 - 180.0
                
                # Apply smoothing (Exponential Moving Average)
                current_yaw = current_yaw + self.smoothing_factor * diff_yaw
                current_pitch = current_pitch + self.smoothing_factor * (target_pitch - current_pitch)

                # Keep coordinates normalized
                current_yaw = (current_yaw + 180.0) % 360.0 - 180.0
                current_pitch = np.clip(current_pitch, -85.0, 85.0)

                # Get warp maps
                map_x, map_y = projector.get_remap_coords(current_yaw, current_pitch)
                
                # Warp the frame
                warped = cv2.remap(frame, map_x, map_y, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
                
                # Write to output file
                out.write(warped)

                # Update progress
                p_val = int((frame_idx / total_frames) * 100)
                self.progress.emit(p_val)
                if frame_idx % 10 == 0:
                    self.status_message.emit(
                        f"Frame {frame_idx}/{total_frames} ({p_val}%) | "
                        f"Yaw: {current_yaw:.1f}º, Pitch: {current_pitch:.1f}º"
                    )

            cap.release()
            out.release()
            
            if self.is_running:
                self.finished_success.emit(self.output_path)
            else:
                self.status_message.emit("Processamento cancelado pelo usuário.")

        except Exception as e:
            self.error_occurred.emit(str(e))

    def stop(self):
        self.is_running = False

class App(QMainWindow):
    def __init__(self):
        super().__init__()
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Atlas AI 360º - AutoReframer")
        self.resize(800, 640)
        
        # Apply dark theme
        self.setStyleSheet("""
            QMainWindow {
                background-color: #121214;
            }
            QWidget {
                color: #e2e8f0;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 13px;
            }
            QLabel {
                font-weight: 500;
            }
            QFrame#card {
                background-color: #1a1a1e;
                border: 1px solid #2d2d34;
                border-radius: 12px;
            }
            QLineEdit, QComboBox, QSlider {
                background-color: #24242b;
                border: 1px solid #3f3f46;
                border-radius: 6px;
                padding: 6px;
                color: #ffffff;
            }
            QComboBox::drop-down {
                border: 0px;
            }
            QPushButton {
                background-color: #f59e0b;
                color: #121214;
                font-weight: bold;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
            }
            QPushButton:hover {
                background-color: #d97706;
            }
            QPushButton:disabled {
                background-color: #3f3f46;
                color: #a1a1aa;
            }
            QPushButton#btn-secondary {
                background-color: #27272a;
                color: #e2e8f0;
                border: 1px solid #3f3f46;
            }
            QPushButton#btn-secondary:hover {
                background-color: #3f3f46;
            }
            QProgressBar {
                border: 1px solid #2d2d34;
                border-radius: 6px;
                text-align: center;
                background-color: #1a1a1e;
            }
            QProgressBar::chunk {
                background-color: #f59e0b;
                border-radius: 5px;
            }
            QTextEdit {
                background-color: #0b0b0c;
                border: 1px solid #1a1a1e;
                border-radius: 8px;
                font-family: 'Consolas', monospace;
                color: #10b981;
            }
        """)

        # Main Layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QVBoxLayout(main_widget)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(16)

        # Header Title
        title_label = QLabel("Atlas AI 360º - AutoReframer")
        title_label.setStyleSheet("font-size: 22px; font-weight: bold; color: #f59e0b;")
        layout.addWidget(title_label)
        
        desc_label = QLabel("Reenquadramento automático inteligente via IA para vídeos equiretangulares de drones.")
        desc_label.setStyleSheet("color: #94a3b8; font-size: 12px; margin-top: -10px;")
        layout.addWidget(desc_label)

        # Card Widget for Settings
        card = QFrame()
        card.setObjectName("card")
        card_layout = QVBoxLayout(card)
        card_layout.setSpacing(12)
        card_layout.setContentsMargins(16, 16, 16, 16)

        # Row 1: File selection
        file_layout = QHBoxLayout()
        self.lbl_file = QLabel("Vídeo 360°:")
        self.lbl_file.setMinimumWidth(80)
        file_layout.addWidget(self.lbl_file)
        
        self.btn_select_file = QPushButton("Selecionar Vídeo 360", objectName="btn-secondary")
        self.btn_select_file.clicked.connect(self.select_file)
        file_layout.addWidget(self.btn_select_file)
        
        self.lbl_filename = QLabel("Nenhum arquivo selecionado")
        self.lbl_filename.setStyleSheet("color: #94a3b8;")
        file_layout.addWidget(self.lbl_filename, 1)
        card_layout.addLayout(file_layout)

        # Row 2: Aspect Ratio & Target
        settings_layout = QHBoxLayout()
        
        # Aspect Ratio Choice
        aspect_v = QVBoxLayout()
        aspect_v.addWidget(QLabel("Formato de Saída:"))
        self.combo_aspect = QComboBox()
        self.combo_aspect.addItems(["16:9 (Paisagem)", "9:16 (Retrato)"])
        aspect_v.addWidget(self.combo_aspect)
        settings_layout.addLayout(aspect_v, 1)

        # Target Selector
        target_v = QVBoxLayout()
        target_v.addWidget(QLabel("Alvo a Rastrear:"))
        
        target_row = QHBoxLayout()
        self.combo_target = QComboBox()
        self.combo_target.addItems(["Carregar vídeo primeiro..."])
        self.combo_target.setEnabled(False)
        target_row.addWidget(self.combo_target, 1)
        
        self.btn_analyze = QPushButton("Detectar Alvos", objectName="btn-secondary")
        self.btn_analyze.clicked.connect(self.analyze_targets)
        self.btn_analyze.setEnabled(False)
        target_row.addWidget(self.btn_analyze)
        
        target_v.addLayout(target_row)
        settings_layout.addLayout(target_v, 1)
        
        card_layout.addLayout(settings_layout)

        # Row 3: Sliders for FOV and Smoothing
        sliders_layout = QHBoxLayout()

        # FOV Slider
        fov_v = QVBoxLayout()
        self.lbl_fov = QLabel("Campo de Visão (FOV: 90º) - Zoom:")
        fov_v.addWidget(self.lbl_fov)
        self.slider_fov = QSlider(Qt.Horizontal)
        self.slider_fov.setRange(40, 120)
        self.slider_fov.setValue(90)
        self.slider_fov.valueChanged.connect(self.update_fov_label)
        fov_v.addWidget(self.slider_fov)
        sliders_layout.addLayout(fov_v, 1)

        # Smoothing Slider
        smooth_v = QVBoxLayout()
        self.lbl_smooth = QLabel("Suavização de Movimento (Inércia: 10):")
        smooth_v.addWidget(self.lbl_smooth)
        self.slider_smooth = QSlider(Qt.Horizontal)
        self.slider_smooth.setRange(1, 100)
        self.slider_smooth.setValue(10)
        self.slider_smooth.valueChanged.connect(self.update_smooth_label)
        smooth_v.addWidget(self.slider_smooth)
        sliders_layout.addLayout(smooth_v, 1)

        card_layout.addLayout(sliders_layout)
        layout.addWidget(card)

        # Controls Buttons Panel
        control_layout = QHBoxLayout()
        self.btn_process = QPushButton("Iniciar Edição Automática")
        self.btn_process.clicked.connect(self.start_processing)
        self.btn_process.setEnabled(False)
        control_layout.addWidget(self.btn_process, 2)

        self.btn_cancel = QPushButton("Cancelar", objectName="btn-secondary")
        self.btn_cancel.clicked.connect(self.cancel_processing)
        self.btn_cancel.setEnabled(False)
        control_layout.addWidget(self.btn_cancel, 1)
        layout.addLayout(control_layout)

        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)

        # Logs Window
        layout.addWidget(QLabel("Log de Processamento:"))
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        layout.addWidget(self.log_text, 1)

        # Initialize State Variables
        self.input_file = None
        self.processor_thread = None

    def update_fov_label(self, value):
        self.lbl_fov.setText(f"Campo de Visão (FOV: {value}º) - Zoom:")

    def update_smooth_label(self, value):
        self.lbl_smooth.setText(f"Suavização de Movimento (Inércia: {value}):")

    def select_file(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Selecionar Vídeo 360°", "", "Vídeos (*.mp4 *.mkv *.mov *.MOV *.avi *.webm)"
        )
        if file_path:
            self.input_file = file_path
            self.lbl_filename.setText(Path(file_path).name)
            self.log_text.append(f"[+] Vídeo carregado: {file_path}")
            
            # Enable target detection buttons
            self.btn_analyze.setEnabled(True)
            self.combo_target.setEnabled(True)
            self.combo_target.clear()
            self.combo_target.addItems(["Clique em 'Detectar Alvos' para buscar..."])

    def analyze_targets(self):
        """
        Runs YOLOv8 on the first second of the video to detect potential targets in the sphere.
        """
        if not self.input_file:
            return

        self.log_text.append("[*] Iniciando detecção de alvos no frame inicial...")
        self.btn_analyze.setEnabled(False)
        
        try:
            cap = cv2.VideoCapture(self.input_file)
            if not cap.isOpened():
                raise RuntimeError("Falha ao abrir o vídeo.")

            # Skip to 1st second (or frame 30) for a better shot
            for _ in range(30):
                ret, frame = cap.read()
                if not ret:
                    break
            
            if not ret:
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()

            cap.release()

            if not ret or frame is None:
                raise RuntimeError("Não foi possível extrair um quadro de imagem do vídeo.")

            model = get_yolo_model()
            results = model.predict(frame, verbose=False, imgsz=640)

            # Dictionary mapping coco class IDs to portuguese names
            coco_classes = {
                0: "Pessoa",
                1: "Bicicleta",
                2: "Carro",
                3: "Moto",
                5: "Ônibus",
                7: "Caminhão",
                15: "Gato",
                16: "Cachorro",
                18: "Cavalo",
                19: "Ovelha",
                20: "Vaca",
            }

            self.combo_target.clear()
            detected_classes = []

            # Populate combo box with detections
            for box in results[0].boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                if conf > 0.35: # Min threshold
                    label = coco_classes.get(cls_id, results[0].names[cls_id])
                    detected_classes.append((label, cls_id))
            
            # Remove duplicates for cleaner class-based selection
            unique_detections = []
            seen = set()
            for label, cid in detected_classes:
                if cid not in seen:
                    seen.add(cid)
                    unique_detections.append((label, cid))

            if unique_detections:
                for label, cid in unique_detections:
                    self.combo_target.addItem(f"Seguir {label}", cid)
                self.btn_process.setEnabled(True)
                self.log_text.append(f"[+] Detecção concluída. Encontrado {len(unique_detections)} tipos de alvos.")
            else:
                # Add default static trackings
                self.combo_target.addItem("Centro do Vídeo (Sem rastreamento - Yaw=0)", -1)
                self.combo_target.addItem("Seguir Pessoa (Padrão)", 0)
                self.combo_target.addItem("Seguir Veículo (Padrão)", 2)
                self.btn_process.setEnabled(True)
                self.log_text.append("[!] Nenhum alvo claro detectado no frame. Adicionados rastreadores padrão.")

        except Exception as e:
            self.log_text.append(f"[-] Erro ao analisar quadro: {e}")
            QMessageBox.critical(self, "Erro", f"Erro ao analisar o vídeo:\n{e}")
        
        self.btn_analyze.setEnabled(True)

    def start_processing(self):
        if not self.input_file:
            return

        input_path = Path(self.input_file)
        # Create output name
        output_name = input_path.stem + "_REFRAMED.mp4"
        output_file = str(input_path.parent / output_name)

        # Get settings values
        target_class_id = self.combo_target.currentData()
        fov = self.slider_fov.value()
        smoothing = self.slider_smooth.value()
        aspect_ratio = self.combo_aspect.currentText()

        # Disable controls during processing
        self.set_controls_enabled(False)
        self.btn_cancel.setEnabled(True)
        self.progress_bar.setValue(0)
        self.log_text.clear()

        # Start thread
        self.processor_thread = VideoProcessorThread(
            str(input_path), output_file, target_class_id, fov, smoothing, aspect_ratio
        )
        self.processor_thread.progress.connect(self.progress_bar.setValue)
        self.processor_thread.status_message.connect(self.log_text.append)
        self.processor_thread.finished_success.connect(self.on_success)
        self.processor_thread.error_occurred.connect(self.on_error)
        self.processor_thread.start()

    def cancel_processing(self):
        if self.processor_thread and self.processor_thread.isRunning():
            self.log_text.append("[*] Solicitando cancelamento pelo usuário...")
            self.processor_thread.stop()
            self.processor_thread.wait()
            self.set_controls_enabled(True)
            self.btn_cancel.setEnabled(False)
            self.progress_bar.setValue(0)

    def set_controls_enabled(self, enabled):
        self.btn_select_file.setEnabled(enabled)
        self.btn_analyze.setEnabled(enabled)
        self.combo_aspect.setEnabled(enabled)
        self.combo_target.setEnabled(enabled)
        self.slider_fov.setEnabled(enabled)
        self.slider_smooth.setEnabled(enabled)
        self.btn_process.setEnabled(enabled)

    @Slot(str)
    def on_success(self, output_path):
        self.set_controls_enabled(True)
        self.btn_cancel.setEnabled(False)
        self.progress_bar.setValue(100)
        self.log_text.append(f"\n[+] PROCESSO CONCLUÍDO COM SUCESSO!")
        self.log_text.append(f"[+] Vídeo reenquadrado exportado: {output_path}")
        QMessageBox.information(
            self, "Atlas AI 360", f"Vídeo renderizado com sucesso!\nSalvo em:\n{output_path}"
        )

    @Slot(str)
    def on_error(self, err_msg):
        self.set_controls_enabled(True)
        self.btn_cancel.setEnabled(False)
        self.progress_bar.setValue(0)
        self.log_text.append(f"\n[-] ERRO OCORRIDO: {err_msg}")
        QMessageBox.critical(self, "Erro", f"Ocorreu um erro no processador:\n{err_msg}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = App()
    window.show()
    sys.exit(app.exec())
