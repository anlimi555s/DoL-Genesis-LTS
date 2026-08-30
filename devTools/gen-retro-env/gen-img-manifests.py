# gen-img-manifests：生成两版 img 文件清单 JSON（供 audit-translate-coverage.cjs 用）。
# 附带 git rename 全量表（区分"规则缺"与"删除类"）。
import os
import json
import subprocess

OLD = 'C:/Users/Selena/Desktop/dol-mod/compat-study/dol-0.5.8.10-src/img'
NEW = 'C:/Users/Selena/Desktop/dol-mod/degrees-of-lewdity-0.5.11.9/img'
CWD = 'C:/Users/Selena/Desktop/dol-mod/DoL-Genesis-LTS'


def walk(base):
    out = []
    for root, dirs, files in os.walk(base):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), base).replace('\\', '/')
            out.append(rel)
    return out


o = walk(OLD)
n = walk(NEW)
out = subprocess.run(
    ['git', 'log', '0.5.8.10..0.5.11.9', '--diff-filter=R', '--name-status', '--format=', '--', 'img/'],
    capture_output=True, text=True, cwd=CWD
)
renames = {}
for line in out.stdout.splitlines():
    parts = line.split('\t')
    if len(parts) == 3 and parts[0].startswith('R'):
        renames[parts[1]] = parts[2]
json.dump({'p58': o, 'p511': n, 'renames': renames}, open('devTools/gen-retro-env/img-manifests.json', 'w'))
print('清单已生成:', len(o), len(n), ' rename:', len(renames))
