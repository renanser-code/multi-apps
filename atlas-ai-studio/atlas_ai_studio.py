import os
import re
import shutil
import subprocess
import threading
import queue
import zipfile
from pathlib import Path
import tkinter as tk
from tkinter import ttk, messagebox, filedialog

import requests
from faster_whisper import WhisperModel
from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parent
TOOLS = ROOT / "tools"
DOWNLOAD_DIR = ROOT / "downloads"
TOOLS.mkdir(exist_ok=True)
DOWNLOAD_DIR.mkdir(exist_ok=True)

YTDLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
FFMPEG_URL = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

class Pipeline:
    def __init__(self, log, browser_cookies=None):
        self.log = log
        self.browser_cookies = browser_cookies

    def log_line(self, text):
        self.log(text)

    def download_file(self, url, dest):
        self.log_line(f"Baixando: {url}")
        with requests.get(url, stream=True, timeout=180) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)

    def ensure_tools(self):
        ytdlp = TOOLS / "yt-dlp.exe"
        ffmpeg = TOOLS / "ffmpeg.exe"
        ffprobe = TOOLS / "ffprobe.exe"

        if not ytdlp.exists():
            try:
                self.download_file(YTDLP_URL, ytdlp)
            except Exception as e:
                self.log_line(f"Nota: Não foi possível baixar yt-dlp.exe ({e}), usando módulo Python.")
        else:
            self.log_line("yt-dlp.exe encontrado.")

        if not ffmpeg.exists():
            zip_path = TOOLS / "ffmpeg.zip"
            self.download_file(FFMPEG_URL, zip_path)
            self.log_line("Extraindo FFmpeg...")
            with zipfile.ZipFile(zip_path, "r") as z:
                names = z.namelist()
                ffmpeg_name = next(n for n in names if n.endswith("/bin/ffmpeg.exe"))
                ffprobe_name = next((n for n in names if n.endswith("/bin/ffprobe.exe")), None)
                ffmpeg.write_bytes(z.read(ffmpeg_name))
                if ffprobe_name:
                    ffprobe.write_bytes(z.read(ffprobe_name))
            zip_path.unlink(missing_ok=True)
        else:
            self.log_line("ffmpeg.exe encontrado.")

        return str(ytdlp), str(ffmpeg)

    def run(self, cmd, cwd=None):
        self.log_line("")
        self.log_line("Executando:")
        self.log_line(" ".join(f'"{c}"' if " " in str(c) else str(c) for c in cmd))
        self.log_line("")

        p = subprocess.Popen(
            cmd,
            cwd=str(cwd) if cwd else None,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace"
        )
        for line in p.stdout:
            self.log_line(line.rstrip())
        code = p.wait()
        if code != 0:
            raise RuntimeError(f"Comando finalizou com erro: {code}")

    def newest_mp4(self):
        videos = sorted(DOWNLOAD_DIR.glob("*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
        raw_videos = [v for v in videos if "_AAC" not in v.name and "_FINAL" not in v.name]
        if raw_videos:
            return raw_videos[0]
        if videos:
            return videos[0]
        raise FileNotFoundError("Nenhum MP4 encontrado na pasta downloads.")

    def download_youtube(self, url):
        _, ffmpeg = self.ensure_tools()
        out_template = str(DOWNLOAD_DIR / "%(title).180s.%(ext)s")

        cmd = [
            "python", "-m", "yt_dlp",
            "--ffmpeg-location", str(Path(ffmpeg).parent),
            "-f", "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b",
            "--merge-output-format", "mp4",
            "--postprocessor-args", "ffmpeg:-c:v copy -c:a aac -b:a 192k",
            "-o", out_template,
        ]

        if self.browser_cookies and self.browser_cookies != "Nenhum (Público)":
            self.log_line(f"[+] Extraindo cookies do navegador: {self.browser_cookies}")
            self.log_line("[*] Nota: se der erro de banco bloqueado, feche o navegador temporariamente.")
            cmd.extend(["--cookies-from-browser", self.browser_cookies.lower()])

        cmd.append(url)
        self.run(cmd)
        video = self.newest_mp4()
        self.log_line(f"Vídeo baixado: {video}")
        return video

    def fix_audio_aac(self, video):
        _, ffmpeg = self.ensure_tools()
        video = Path(video)
        out = video.with_name(video.stem + "_AAC.mp4")

        self.run([
            ffmpeg, "-y",
            "-i", str(video),
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            str(out)
        ])

        self.log_line(f"Vídeo AAC criado: {out}")
        return out

    def extract_wav(self, video):
        _, ffmpeg = self.ensure_tools()
        video = Path(video)
        wav = video.with_suffix(".wav")

        self.run([
            ffmpeg, "-y",
            "-i", str(video),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",
            str(wav)
        ])

        return wav

    def srt_time(self, seconds):
        ms = int((seconds - int(seconds)) * 1000)
        total = int(seconds)
        return f"{total//3600:02}:{(total%3600)//60:02}:{total%60:02},{ms:03}"

    def transcribe(self, video, model_name="small", language="en"):
        wav = self.extract_wav(video)

        self.log_line(f"Carregando Whisper: {model_name}")
        self.log_line("Na primeira execução, o modelo pode demorar para baixar.")

        model = WhisperModel(model_name, device="cpu", compute_type="int8")
        kwargs = {"vad_filter": True}
        if language and language != "auto":
            kwargs["language"] = language

        segments, info = model.transcribe(str(wav), **kwargs)
        srt = Path(video).with_suffix(".srt")

        with srt.open("w", encoding="utf-8") as f:
            idx = 1
            for seg in segments:
                text = seg.text.strip()
                if not text:
                    continue
                f.write(f"{idx}\n{self.srt_time(seg.start)} --> {self.srt_time(seg.end)}\n{text}\n\n")
                idx += 1

        self.log_line(f"Legenda criada: {srt}")
        return srt

    def split_srt_blocks(self, content):
        content = content.replace("\r\n", "\n").replace("\r", "\n").strip()
        return re.split(r"\n\s*\n", content) if content else []

    def translate_srt(self, srt):
        srt = Path(srt)
        content = srt.read_text(encoding="utf-8", errors="ignore")
        blocks = self.split_srt_blocks(content)
        translator = GoogleTranslator(source="auto", target="pt")
        out_blocks = []
        total = len(blocks)

        for pos, block in enumerate(blocks, 1):
            lines = block.split("\n")
            if len(lines) < 3:
                out_blocks.append(block)
                continue

            number = lines[0]
            timing = lines[1]
            text = " ".join(line.strip() for line in lines[2:] if line.strip())

            self.log_line(f"Traduzindo {pos}/{total}...")

            try:
                translated = translator.translate(text)
            except Exception as e:
                self.log_line(f"Falha ao traduzir bloco {pos}: {e}")
                translated = text

            out_blocks.append(f"{number}\n{timing}\n{translated}")

        out = srt.with_suffix(".pt-BR.srt")
        out.write_text("\n\n".join(out_blocks) + "\n", encoding="utf-8")
        self.log_line(f"Legenda PT-BR criada: {out}")
        return out

    def burn_subtitle(self, video, srt):
        _, ffmpeg = self.ensure_tools()
        video = Path(video)
        srt = Path(srt)
        
        # Copy subtitle to a temporary file with simple name to bypass spaces, colons and single quote errors in FFmpeg path parser
        temp_sub = video.parent / "temp_ptbr.srt"
        shutil.copy2(srt, temp_sub)
        
        out_name = video.stem + "_FINAL_PTBR.mp4"
        out_file = video.parent / out_name

        cmd = [
            ffmpeg, "-y",
            "-i", video.name,
            "-vf", "subtitles=temp_ptbr.srt",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "20",
            "-c:a", "aac",
            "-b:a", "192k",
            out_name
        ]

        try:
            # Run in the same directory as the video/subtitle files
            self.run(cmd, cwd=video.parent)
        finally:
            # Clean up the temp subtitle
            if temp_sub.exists():
                temp_sub.unlink(missing_ok=True)

        self.log_line(f"MP4 final com legenda criado: {out_file}")
        return out_file

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("Atlas AI Studio - Download & Legendas")
        self.root.geometry("940x720")
        self.q = queue.Queue()

        self.url = tk.StringVar()
        self.model = tk.StringVar(value="small")
        self.language = tk.StringVar(value="en")
        self.browser_cookies = tk.StringVar(value="Nenhum (Público)")
        self.fix_audio = tk.BooleanVar(value=True)
        self.generate_sub = tk.BooleanVar(value=True)
        self.translate_sub = tk.BooleanVar(value=True)
        self.burn_sub = tk.BooleanVar(value=True)

        tk.Label(root, text="Atlas AI Studio", font=("Segoe UI", 24, "bold")).pack(pady=12)
        tk.Label(root, text="YouTube & SharePoint → MP4 AAC → Legendas → PT-BR", font=("Segoe UI", 10)).pack()

        frame = ttk.Frame(root, padding=12)
        frame.pack(fill="x")

        ttk.Label(frame, text="Link do Vídeo (YouTube, SharePoint, Stream, etc.):").grid(row=0, column=0, sticky="w")
        ttk.Entry(frame, textvariable=self.url, width=110).grid(row=1, column=0, columnspan=4, sticky="we", pady=5)

        ttk.Checkbutton(frame, text="Corrigir áudio para AAC", variable=self.fix_audio).grid(row=2, column=0, sticky="w")
        ttk.Checkbutton(frame, text="Gerar legenda", variable=self.generate_sub).grid(row=2, column=1, sticky="w")
        ttk.Checkbutton(frame, text="Traduzir para PT-BR", variable=self.translate_sub).grid(row=2, column=2, sticky="w")
        ttk.Checkbutton(frame, text="Embutir legenda PT-BR no vídeo final", variable=self.burn_sub).grid(row=2, column=3, sticky="w")

        # Row 3: Model and Language
        ttk.Label(frame, text="Modelo Whisper:").grid(row=3, column=0, sticky="w", pady=8)
        ttk.Combobox(frame, textvariable=self.model, values=["tiny", "base", "small", "medium", "large-v3"], state="readonly", width=18).grid(row=3, column=1, sticky="w")

        ttk.Label(frame, text="Idioma do áudio:").grid(row=3, column=2, sticky="w")
        ttk.Combobox(frame, textvariable=self.language, values=["auto", "en", "pt", "es"], state="readonly", width=18).grid(row=3, column=3, sticky="w")

        # Row 4: Cookies for authenticated downloads (SharePoint, private)
        ttk.Label(frame, text="Cookies (autenticação):").grid(row=4, column=0, sticky="w", pady=8)
        ttk.Combobox(frame, textvariable=self.browser_cookies, values=["Nenhum (Público)", "edge", "chrome", "firefox", "opera"], state="readonly", width=18).grid(row=4, column=1, sticky="w")
        
        ttk.Label(frame, text="* Requisitado para SharePoint/Stream (deve estar logado no navegador escolhido)", font=("Segoe UI", 8, "italic"), foreground="#888888").grid(row=4, column=2, columnspan=2, sticky="w")

        buttons = ttk.Frame(root, padding=12)
        buttons.pack(fill="x")

        ttk.Button(buttons, text="PROCESSAR COMPLETO", command=self.process_full).pack(side="left", padx=4)
        ttk.Button(buttons, text="Finalizar MP4 existente", command=self.finalize_existing).pack(side="left", padx=4)
        ttk.Button(buttons, text="Baixar/Verificar ferramentas", command=self.ensure_tools_clicked).pack(side="left", padx=4)
        ttk.Button(buttons, text="Abrir downloads", command=self.open_downloads).pack(side="left", padx=4)
        ttk.Button(buttons, text="Limpar log", command=lambda: self.log.delete("1.0", "end")).pack(side="left", padx=4)

        self.log = tk.Text(root, height=27, bg="#111111", fg="#eeeeee", wrap="word")
        self.log.pack(fill="both", expand=True, padx=12, pady=12)

        self.root.after(100, self.poll)

    def log_line(self, text):
        self.q.put(text)

    def poll(self):
        try:
            while True:
                self.log.insert("end", self.q.get_nowait() + "\n")
                self.log.see("end")
        except queue.Empty:
            pass
        self.root.after(100, self.poll)

    def worker(self, func):
        threading.Thread(target=func, daemon=True).start()

    def process_full(self):
        url = self.url.get().strip()
        if not url:
            messagebox.showwarning("Atlas", "Cole o link do vídeo primeiro.")
            return

        def task():
            try:
                p = Pipeline(self.log_line, self.browser_cookies.get())
                video = p.download_youtube(url)

                if self.fix_audio.get():
                    video = p.fix_audio_aac(video)

                srt = None
                if self.generate_sub.get():
                    srt = p.transcribe(video, self.model.get(), self.language.get())

                if self.translate_sub.get():
                    if not srt:
                        candidate = Path(video).with_suffix(".srt")
                        if candidate.exists():
                            srt = candidate
                        else:
                            raise RuntimeError("Não encontrei uma legenda SRT para traduzir.")
                    srt = p.translate_srt(srt)

                if self.burn_sub.get():
                    if not srt:
                        raise RuntimeError("Não há legenda para embutir no vídeo.")
                    final = p.burn_subtitle(video, srt)
                    self.log_line("")
                    self.log_line(f"FINAL PRONTO: {final}")

                self.log_line("")
                self.log_line("Concluído com sucesso!")
                messagebox.showinfo("Atlas", "Processamento concluído com sucesso!")

            except Exception as e:
                self.log_line(f"ERRO: {e}")
                messagebox.showerror("Atlas", str(e))

        self.worker(task)

    def finalize_existing(self):
        video = filedialog.askopenfilename(title="Selecione o MP4 com áudio", filetypes=[("Vídeos", "*.mp4 *.mkv *.webm *.mov"), ("Todos", "*.*")])
        if not video:
            return
        srt = filedialog.askopenfilename(title="Selecione a legenda PT-BR .srt", filetypes=[("Legendas", "*.srt"), ("Todos", "*.*")])
        if not srt:
            return

        def task():
            try:
                p = Pipeline(self.log_line, self.browser_cookies.get())
                fixed = p.fix_audio_aac(Path(video))
                final = p.burn_subtitle(fixed, Path(srt))
                self.log_line("")
                self.log_line(f"FINAL PRONTO: {final}")
                messagebox.showinfo("Atlas", "MP4 final criado com sucesso!")
            except Exception as e:
                self.log_line(f"ERRO: {e}")
                messagebox.showerror("Atlas", str(e))

        self.worker(task)

    def ensure_tools_clicked(self):
        def task():
            try:
                p = Pipeline(self.log_line, self.browser_cookies.get())
                p.ensure_tools()
                self.log_line("Ferramentas prontas.")
                messagebox.showinfo("Atlas", "Ferramentas prontas.")
            except Exception as e:
                self.log_line(f"ERRO: {e}")
                messagebox.showerror("Atlas", str(e))
        self.worker(task)

    def open_downloads(self):
        DOWNLOAD_DIR.mkdir(exist_ok=True)
        os.startfile(str(DOWNLOAD_DIR))

if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()
