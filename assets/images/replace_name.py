import os
import re

dir_path = r'd:\C.L.T.V\healthy + brain'
for root, dirs, files in os.walk(dir_path):
    for filename in files:
        if filename.endswith('.html'):
            filepath = os.path.join(root, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                
                # Case insensitive replace "healthy + brain"
                new_content = re.sub(r'(?i)healthy \+ brain', 'HEALTHY + BRAIN', content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as file:
                        file.write(new_content)
                    print(f"Updated {filepath}")
            except Exception as e:
                print(f"Error processing {filepath}: {e}")
