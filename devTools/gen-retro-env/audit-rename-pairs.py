# audit-rename-pairs：未命中路径与 git rename 记录配对，输出 old→new 样本供规则归纳。
import json
import subprocess
from collections import defaultdict

# 1. git rename 全量表
out = subprocess.run(
    ['git', 'log', '0.5.8.10..0.5.11.9', '--diff-filter=R', '--name-status', '--format=', '--', 'img/'],
    capture_output=True, text=True, cwd='C:/Users/Selena/Desktop/dol-mod/DoL-Genesis-LTS'
)
rename_map = {}
for line in out.stdout.splitlines():
    parts = line.split('\t')
    if len(parts) == 3 and parts[0].startswith('R'):
        old, new = parts[1], parts[2]
        rename_map[old] = new
print('git rename 记录:', len(rename_map))

# 2. 未命中清单(从审计脚本逻辑重算:0.5.8 独有且翻译未命中)
data = json.load(open('devTools/gen-retro-env/img-manifests.json'))
p58 = set('img/' + p for p in data['p58'])
p511 = set('img/' + p for p in data['p511'])
diff = sorted(p for p in p58 if p not in p511)

# 3. 配对:未命中且 rename 表里有映射
paired = defaultdict(list)
unpaired = []
for p in diff:
    if p in rename_map:
        d = '/'.join(p.split('/')[:3])
        paired[d].append((p, rename_map[p]))
    else:
        unpaired.append(p)
print('未命中总数:', len(diff))
print('rename 表能配对:', sum(len(v) for v in paired.values()))
print('rename 表无记录(删除/新增类):', len(unpaired))

# 4. 输出样本:每目录最多 6 对
for d, pairs in sorted(paired.items(), key=lambda kv: -len(kv[1])):
    print(f'\n--- {d} ({len(pairs)}) ---')
    for old, new in pairs[:6]:
        of, nf = old.split('/')[-1], new.split('/')[-1]
        print(f'  {of}  ->  {nf}   [{old} -> {new}]' if old != new else f'  {of} (不变)')
