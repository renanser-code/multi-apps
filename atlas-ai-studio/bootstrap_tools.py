import zipfile
import requests
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TOOLS = ROOT / "tools"
TOOLS.mkdir(exist_ok=True)
(ROOT / "downloads").mkdir(exist_ok=True)

YTDLP_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
FFMPEG_URL = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

def download(url, dest):
    print(f"Baixando: {url}")
    with requests.get(url, stream=True, timeout=180) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)

def install_ytdlp():
    dest = TOOLS / "yt-dlp.exe"
    if dest.exists():
        print("yt-dlp.exe ja existe.")
    else:
        download(YTDLP_URL, dest)

def install_ffmpeg():
    ffmpeg_dest = TOOLS / "ffmpeg.exe"
    ffprobe_dest = TOOLS / "ffprobe.exe"

    if ffmpeg_dest.exists():
        print("ffmpeg.exe ja existe.")
        return

    zip_path = TOOLS / "ffmpeg.zip"
    download(FFMPEG_URL, zip_path)

    print("Extraindo FFmpeg...")
    with zipfile.ZipFile(zip_path, "r") as z:
        names = z.namelist()
        ffmpeg_name = next(n for n in names if n.endswith("/bin/ffmpeg.exe"))
        ffprobe_name = next((n for n in names if n.endswith("/bin/ffprobe.exe")), None)

        ffmpeg_dest.write_bytes(z.read(ffmpeg_name))
        if ffprobe_name:
            ffprobe_dest.write_bytes(z.read(ffprobe_name))

    zip_path.unlink(missing_ok=True)
    print("FFmpeg pronto.")

if __name__ == "__main__":
    install_ytdlp()
    install_ffmpeg()
    print("Ferramentas prontas.")