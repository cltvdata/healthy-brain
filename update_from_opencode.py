import os
import shutil
import filecmp

SOURCE_DIR = r"d:\C.L.T.V\open code c,l,t,v\healthy-brain"
DEST_DIR = r"d:\C.L.T.V\healthy + brain"

# Directories to ignore during the copy
IGNORE_DIRS = {'.git', 'node_modules', '.expo', 'android', 'ios'}
# File extensions to sync
VALID_EXTS = {'.html', '.js', '.css', '.md', '.json'}

def sync_folders():
    print(f"Sincronizando desde {SOURCE_DIR} hacia {DEST_DIR}...")
    copied_count = 0
    for root, dirs, files in os.walk(SOURCE_DIR):
        # Remove ignored dirs
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in VALID_EXTS:
                src_path = os.path.join(root, file)
                rel_path = os.path.relpath(src_path, SOURCE_DIR)
                dest_path = os.path.join(DEST_DIR, rel_path)

                # Ensure destination directory exists
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)

                # Copy if destination doesn't exist, or if files are different
                if not os.path.exists(dest_path) or not filecmp.cmp(src_path, dest_path, shallow=False):
                    shutil.copy2(src_path, dest_path)
                    print(f"✓ Actualizado: {rel_path}")
                    copied_count += 1
    
    print(f"\nSincronizacion completada! {copied_count} archivos actualizados.")

if __name__ == "__main__":
    sync_folders()
