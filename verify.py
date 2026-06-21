with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print("profile_picture.jpg still in html?", 'profile_picture.jpg' in html)
print("style.css link still in html?", 'style.css' in html)
print("script.js src still in html?", 'script.js' in html)
print("base64 image embedded?", 'data:image/jpeg;base64,' in html)
print("inline style tag present?", '<style>' in html)
print("inline script present?", '<script>' in html)
