import shutil
import os

src = r"C:\Users\User\.gemini\antigravity\brain\72442543-9221-496a-8ee2-4d36262d247c\logo_healthy_brain_1774775829232.png"
dst = r"d:\C.L.T.V\healthy + brain\assets\images\logo.png"

try:
    shutil.copy(src, dst)
    print("Logo copiado exitosamente.")
except Exception as e:
    print(f"Error copying logo: {e}")
