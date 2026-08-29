# DoL 环境 API 静态扫描器：提取所有浏览器环境交互点，用于对表 GeckoView 102（Firefox 102）
import io, os, re, collections

ROOT = r'C:\Users\Selena\Desktop\dol-mod\DoL-Genesis-LTS'
SCAN_DIRS = ['game', 'modules']
JS_EXTS = ('.js',)

patterns = {
    # Canvas 2D 方法/属性（ctx 命名 + this.ctx + canvas.ctx）
    'canvas.ctx': r'(?:ctx|this\.ctx|canvas\.ctx|\.ctx)\.([a-zA-Z_$][a-zA-Z0-9_$]*)',
    # CanvasRenderingContext2D.prototype 直接引用
    'c2d.proto': r'CanvasRenderingContext2D\.prototype\.([a-zA-Z_$]+)',
    # Math.*
    'Math': r'Math\.([a-zA-Z_$][a-zA-Z0-9_$]*)',
    # 静态类方法（新 API 高发区）
    'statics': r'\b(Array|Object|Promise|String|Number|JSON|Reflect|RegExp|Intl|AggregateError)\.([a-zA-Z_$][a-zA-Z0-9_$]*)',
    # 原型方法（新 API 高发区：at/toSorted/replaceAll 等）
    'proto': r'\.(at|toSorted|toReversed|toSpliced|with|findLast|findLastIndex|groupBy|groupByToMap|isWellFormed|toWellFormed|replaceAll|matchAll|flatMap|flat|padStart|padEnd|trimStart|trimEnd|includes|closest|matches|replaceChildren|append|prepend|before|after|remove|animate|scrollIntoView|scrollTo|requestFullscreen|createImageBitmap|getComputedStyle|structuredClone|queueMicrotask)\s*\(',
    # Web API 全局
    'webapi': r'\b(fetch|structuredClone|queueMicrotask|requestAnimationFrame|cancelAnimationFrame|requestIdleCallback|ResizeObserver|IntersectionObserver|MutationObserver|PointerEvent|ClipboardEvent|CSS|navigator\.[a-zA-Z_$]+|localStorage|sessionStorage|indexedDB|crypto\.[a-zA-Z_$]+|URL\.[a-zA-Z_$]+|URLSearchParams|Blob|FileReader|ImageCapture|OffscreenCanvas|Worker|SharedWorker|AudioContext|Audio\(|Notification|DeviceOrientationEvent|orientationchange|visualViewport|matchMedia|print)\b',
    # CSS 特性（.css 与内联样式字符串）
    'css': r'\b(filter|backdrop-filter|aspect-ratio|clip-path|mask-image|mix-blend-mode|isolation|contain|container-type|gap|row-gap|column-gap|place-content|place-items|overscroll-behavior|scroll-behavior|position:\s*sticky|dvh|svh|lvh|oklch?|lab\(|color-mix|:has\(|@container|@layer|env\(|min\(|max\(|clamp\(|inset)',
}

hits = collections.defaultdict(lambda: collections.defaultdict(int))  # pattern -> api -> count
files_scan = 0

for base in SCAN_DIRS:
    for dirpath, dirs, fnames in os.walk(os.path.join(ROOT, base)):
        dirs[:] = [d for d in dirs if d not in ('node_modules',)]
        for fn in fnames:
            if not fn.endswith(JS_EXTS):
                continue
            path = os.path.join(dirpath, fn)
            try:
                with io.open(path, encoding='utf-8', errors='replace') as f:
                    content = f.read()
            except Exception:
                continue
            files_scan += 1
            for name, pat in patterns.items():
                for m in re.finditer(pat, content):
                    key = m.group(2) if name == 'statics' else (m.group(1) if m.groups() else m.group(0))
                    hits[name][key] += 1

print(f'扫描文件数: {files_scan}')
print()
for name, apis in hits.items():
    print(f'=== {name}（{sum(apis.values())} 次调用 / {len(apis)} 个 API）===')
    for api, cnt in sorted(apis.items(), key=lambda x: -x[1]):
        print(f'  {api}: {cnt}')
    print()
