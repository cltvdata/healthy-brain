import os
import re

tailwind_config_content = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff8a00',
        neon: '#00d1ff',
        dark: '#0a0a0a',
      },
      fontFamily: { sans: ['Outfit', 'sans-serif'] },
    }
  },
  plugins: [],
}
"""

with open("tailwind.config.js", "w", encoding="utf-8") as f:
    f.write(tailwind_config_content)

# Update design-system.css
css_file = "assets/css/design-system.css"
if os.path.exists(css_file):
    with open(css_file, "r", encoding="utf-8") as f:
        content = f.read()
    if "@tailwind base;" not in content:
        content = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n" + content
        with open(css_file, "w", encoding="utf-8") as f:
            f.write(content)

# Process all HTML files
for file in os.listdir("."):
    if file.endswith(".html"):
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Remove Tailwind CDN script
        content = re.sub(r'<script src="https://cdn\.tailwindcss\.com"></script>', '', content)
        
        # Remove tailwind.config script block
        content = re.sub(r'<script>\s*tailwind\.config\s*=\s*{.*?}\s*</script>', '', content, flags=re.DOTALL)
        
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)

print("Tailwind configuration fixed!")
