@echo off
title Atlas AI Studio - Instalar
echo ============================================
echo        ATLAS AI STUDIO - INSTALAR
echo ============================================
echo.
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
echo.
echo Baixando ferramentas se necessario...
python bootstrap_tools.py
echo.
echo Instalacao concluida.
pause
