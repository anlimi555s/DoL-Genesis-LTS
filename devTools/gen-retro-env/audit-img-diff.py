# audit-img-diff：两版 img 目录文件集差异统计（0.5.8.10 vs 0.5.11.9）。
# 目的：估算人模路径翻译规则的数量规模。
import os
from collections import Counter

OLD = 'C:/Users/Selena/Desktop/dol-mod/compat-study/dol-0.5.8.10-src/img'
NEW = 'C:/Users/Selena/Desktop/dol-mod/degrees-of-lewdity-0.5.11.9/img'


def walk(base):
    out = {}
    for root, dirs, files in os.walk(base):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), base).replace('\\', '/')
            out[rel] = 1
    return out


o = walk(OLD)
n = walk(NEW)
print('0.5.8 文件数:', len(o), ' 0.5.11 文件数:', len(n))

missing_in_new = Counter()
missing_in_old = Counter()
for p in o:
    if p not in n:
        parts = p.split('/')
        missing_in_new[parts[0] + '/' + parts[1] if len(parts) > 1 else p] += 1
for p in n:
    if p not in o:
        parts = p.split('/')
        missing_in_old[parts[0] + '/' + parts[1] if len(parts) > 1 else p] += 1

print('\n=== 0.5.8 有但 0.5.11 没有(旧请求需翻译)按目录 ===')
for d, c in missing_in_new.most_common(30):
    print(f'  {d}: {c}')
print('\n=== 0.5.11 有但 0.5.8 没有(新版新增)按目录 top15 ===')
for d, c in missing_in_old.most_common(15):
    print(f'  {d}: {c}')
