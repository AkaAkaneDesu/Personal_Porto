import base64
import re

# Read and encode the image
with open('profile_picture.jpg', 'rb') as f:
    data = base64.b64encode(f.read()).decode('utf-8')

img_data_uri = f"data:image/jpeg;base64,{data}"

# Read the HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Read the CSS
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Read the JS
with open('script.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace image src with base64
html = html.replace('src="profile_picture.jpg"', f'src="{img_data_uri}"')

# Remove existing external CSS link tags for style.css and replace with inline style
html = re.sub(r'<link[^>]+style\.css[^>]*/?>', f'<style>\n{css}\n</style>', html)

# Inline script.js - replace external script src tag with inline
html = re.sub(r'<script[^>]+script\.js[^>]*>\s*</script>', f'<script>\n{js}\n</script>', html)

# Write the result
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

size_kb = len(html.encode('utf-8')) // 1024
print(f'Done! index.html is now fully self-contained.')
print(f'Size: {size_kb} KB')
