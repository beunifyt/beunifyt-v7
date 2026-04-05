#!/usr/bin/env python3
"""BeUnifyT PRE-DEPLOY VALIDATOR v1.0 — Ejecutar antes de cada deploy."""
import os, re, sys, collections, subprocess

DIR = sys.argv[1] if len(sys.argv) > 1 else '.'
ERRORS = 0
WARNS = 0

def ok(msg): print(f"  ✅ {msg}")
def fail(msg):
    global ERRORS; ERRORS += 1; print(f"  ❌ {msg}")
def warn(msg):
    global WARNS; WARNS += 1; print(f"  ⚠️  {msg}")

def get_exports(fp):
    if not os.path.exists(fp): return set()
    with open(fp) as f: c = f.read()
    ex = set()
    for m in re.finditer(r'export\s+(?:async\s+)?function\s+(\w+)', c): ex.add(m.group(1))
    for m in re.finditer(r'export\s+(?:const|let|var)\s+(\w+)', c): ex.add(m.group(1))
    for m in re.finditer(r'export\s*\{([^}]+)\}', c):
        for n in m.group(1).split(','): 
            n = n.strip().split(' as ')[0].strip()
            if n: ex.add(n)
    return ex

def all_js():
    for root, _, files in os.walk(f"{DIR}/js"):
        for fn in files:
            if fn.endswith('.js'):
                yield os.path.join(root, fn)

print("═" * 60)
print("  BeUnifyT PRE-DEPLOY VALIDATOR")
print("═" * 60)

# 1. ARCHIVOS REQUERIDOS
print("\n1️⃣  ARCHIVOS REQUERIDOS")
for f in ["index.html","js/app.js","js/state.js","js/utils.js","js/auth.js","js/firestore.js",
          "js/modules/operator.js","js/core/context.js","js/core/shared.js","js/core/db.js","js/core/shell.js","js/core/fields.js"]:
    (ok if os.path.exists(f"{DIR}/{f}") else fail)(f)

# 2. SYNTAX CHECK
print("\n2️⃣  SYNTAX CHECK")
for fp in sorted(all_js()):
    r = subprocess.run(["node","--check",fp], capture_output=True, text=True)
    if r.returncode != 0:
        fail(f"{fp.replace(DIR+'/','')}:  {r.stderr.strip()}")
ok("Syntax check completo")

# 3. IMPORT PATHS
print("\n3️⃣  IMPORT → ARCHIVO EXISTE")
for fp in all_js():
    rel = fp.replace(DIR+'/', '')
    with open(fp) as f: c = f.read()
    for m in re.finditer(r"from\s+['\"]([^'\"]+)['\"]", c):
        imp = m.group(1)
        if imp.startswith('http'): continue
        resolved = os.path.normpath(os.path.join(os.path.dirname(fp), imp))
        if not os.path.exists(resolved):
            fail(f"{rel} → {imp} (no existe)")
ok("Import paths completo")

# 4. IMPORTS ↔ EXPORTS
print("\n4️⃣  IMPORT NAMES ↔ EXPORTS")
for fp in all_js():
    rel = fp.replace(DIR+'/', '')
    with open(fp) as f: c = f.read()
    for m in re.finditer(r'import\s*\{([^}]+)\}\s*from\s*[\'"]([^\'"]+)[\'"]', c):
        if m.group(2).startswith('http'): continue
        names = [n.strip().split(' as ')[0].strip() for n in m.group(1).split(',')]
        resolved = os.path.normpath(os.path.join(os.path.dirname(fp), m.group(2)))
        exports = get_exports(resolved)
        for name in names:
            if name and name not in exports:
                fail(f"{rel}: '{name}' no exportado en {m.group(2)}")
ok("Imports ↔ Exports completo")

# 5. ONCLICK → WINDOW
print("\n5️⃣  ONCLICK → WINDOW FUNCTIONS")
wfns = set()
for fp in all_js():
    with open(fp) as f: c = f.read()
    for m in re.finditer(r'window\.(\w+)\s*=', c): wfns.add(m.group(1))
    for m in re.finditer(r'window\._op\s*=\s*\{([^}]+)\}', c, re.DOTALL):
        for k in re.finditer(r'(\w+)\s*[,:\n]', m.group(1)): wfns.add(k.group(1))
oc = set()
for fp in all_js():
    with open(fp) as f: c = f.read()
    for m in re.finditer(r'on(?:click|input|change)="(?:window\.(?:_op\.)?)?(\w+)\(', c):
        oc.add(m.group(1))
skip = {'this','if','document','event','confirm','alert','prompt','location','JSON','parseInt','parseFloat',
        'Math','Date','String','Array','Object','console','setTimeout','window','function','return',
        'close','print','open','focus','blur','scroll','Number'}
missing = sorted(f for f in oc if f not in skip and f not in wfns and not f.startswith('_'))
for m in missing: fail(f"onclick='{m}()' sin window.*")
if not missing: ok("0 onclick huérfanos")

# 6. DEPENDENCIAS CIRCULARES
print("\n6️⃣  DEPENDENCIAS CIRCULARES")
graph = {}
for fp in all_js():
    rel = fp.replace(DIR+'/js/', '')
    deps = set()
    with open(fp) as f: c = f.read()
    for m in re.finditer(r"from\s+['\"]([^'\"]+)['\"]", c):
        if m.group(1).startswith('http'): continue
        resolved = os.path.normpath(os.path.join(os.path.dirname(fp), m.group(1)))
        deps.add(resolved.replace(DIR+'/js/', ''))
    graph[rel] = deps
visited, stack = set(), set()
cycles_found = []
def dfs(node, path):
    if node in stack:
        cycles_found.append(path[path.index(node):])
        return
    if node in visited: return
    visited.add(node); stack.add(node)
    for dep in graph.get(node, []): dfs(dep, path + [dep])
    stack.discard(node)
for n in graph: dfs(n, [n])
if cycles_found:
    seen = set()
    for c in cycles_found:
        k = '→'.join(c[:3])
        if k not in seen: seen.add(k); warn(f"Ciclo: {' → '.join(c)}")
else: ok("0 ciclos")

# 7. TEMPLATE LITERALS (backticks pares)
print("\n7️⃣  TEMPLATE LITERALS")
for fp in all_js():
    rel = fp.replace(DIR+'/', '')
    with open(fp) as f: c = f.read()
    if c.count('`') % 2 != 0:
        fail(f"{rel}: backticks impares = template roto")
ok("Template literals check completo")

# 8. FUNCIONES DUPLICADAS
print("\n8️⃣  FUNCIONES DUPLICADAS (entre módulos nuevos)")
fns = collections.defaultdict(list)
new_files = [fp for fp in all_js() if '/core/' in fp or '/tabs/' in fp or fp.endswith('operator.js')]
for fp in new_files:
    rel = fp.replace(DIR+'/js/', '')
    with open(fp) as f: c = f.read()
    for m in re.finditer(r'(?:export\s+)?(?:async\s+)?function\s+(\w+)', c):
        fns[m.group(1)].append(rel)
dupes = {k:v for k,v in fns.items() if len(v) > 1}
for name, locs in sorted(dupes.items()): warn(f"{name}() en: {', '.join(locs)}")
if not dupes: ok("0 duplicadas")

# 9. registerFn vs callFn
print("\n9️⃣  registerFn vs callFn")
registered, called = set(), set()
for fp in all_js():
    with open(fp) as f: c = f.read()
    for m in re.finditer(r"registerFn\(['\"](\w+)['\"]", c): registered.add(m.group(1))
    for m in re.finditer(r"callFn\(['\"](\w+)['\"]", c): called.add(m.group(1))
orphans = called - registered
for fn in sorted(orphans): fail(f"callFn('{fn}') nunca registrada")
if not orphans: ok("Todas las callFn registradas")

# 10. INDEX.HTML
print("\n🔟  INDEX.HTML")
with open(f"{DIR}/index.html") as f: idx = f.read()
for check, label in [('type="module"','type=module'),('app.js','app.js ref'),('BEU_CONFIG','Firebase config'),('charset="UTF-8"','UTF-8'),('viewport','viewport')]:
    (ok if check in idx else fail)(label)

# 11. LOCALSTORAGE KEYS
print("\n1️⃣1️⃣  LOCALSTORAGE KEYS")
writes, reads = set(), set()
for fp in all_js():
    with open(fp) as f: c = f.read()
    for m in re.finditer(r"localStorage\.setItem\(['\"]([^'\"]+)['\"]", c): writes.add(m.group(1))
    for m in re.finditer(r"localStorage\.getItem\(['\"]([^'\"]+)['\"]", c): reads.add(m.group(1))
for k in sorted(reads - writes): warn(f"'{k}' se lee pero nunca se escribe")
for k in sorted(writes - reads): warn(f"'{k}' se escribe pero nunca se lee")
if not (reads - writes) and not (writes - reads): ok("Keys consistentes")

# 12. FIRESTORE PATHS
print("\n1️⃣2️⃣  FIRESTORE PATHS")
for fp in all_js():
    rel = fp.replace(DIR+'/', '')
    with open(fp) as f: c = f.read()
    for m in re.finditer(r"(?:fsGet|fsSet|fsDel|fsGetAll|fsListen)\(['\"]([^'\"]*)['\"]", c):
        if '//' in m.group(1): fail(f"{rel}: path '{m.group(1)}' tiene //")
ok("Paths Firestore OK")

# RESULTADO
print("\n" + "═" * 60)
print(f"  RESULTADO: {ERRORS} errores, {WARNS} warnings")
print(f"  {'🟢 LISTO PARA DEPLOY' if ERRORS == 0 else '🔴 NO DEPLOYAR — corregir errores'}")
print("═" * 60)
sys.exit(ERRORS)
