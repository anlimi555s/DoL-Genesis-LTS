# 打包 genesis-compat.mod.zip（结构与原 zip 一致：boot.json 在根）
import zipfile, os

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'genesis-compat')
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'genesis-compat.mod.zip')

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for base in ['boot.json', 'README.md']:
        z.write(os.path.join(root, base), base)
    for dirpath, _, files in os.walk(os.path.join(root, 'dist')):
        for f in files:
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, root).replace(os.sep, '/')
            z.write(full, rel)

print('packed', os.path.getsize(out), 'bytes')
with zipfile.ZipFile(out) as z:
    for n in z.namelist():
        print(' ', n)
