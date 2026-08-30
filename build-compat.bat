@echo off
:: GenesisCompat build: pack zip -> insert2html -> copy to final HTML.
:: Run from anywhere. Input: existing "DoL-Genesis-LTS v0.2.html.sc2patch.html".
:: If game/ sources changed, run compile.bat + sc2PatchTool first.
setlocal
pushd "%~dp0"

set TOOLS=%~dp0..\tools\modloader-build
set SCPATCH=DoL-Genesis-LTS v0.2.html.sc2patch.html
set FINAL=DoL-Genesis-LTS v0.2.html

if not exist "%TOOLS%\node_modules\json5" (
    echo [err] json5 missing under %TOOLS%\node_modules
    echo       copy it from ..\sugarcube-2-ModLoader-master\node_modules\json5
    exit /b 1
)
if not exist "%SCPATCH%" (
    echo [err] %SCPATCH% not found - run compile.bat + sc2PatchTool first
    exit /b 1
)

echo === [1/3] pack compat zip ===
python compat\pack-compat.py || goto :err

echo === [2/3] insert2html ===
pushd mods
node "%TOOLS%\insert2html.cjs" "..\%SCPATCH%" modList.json "%TOOLS%\BeforeSC2.js" || goto :err
popd

echo === [3/3] copy to final ===
copy /y "%SCPATCH%.mod.html" "%FINAL%" >nul || goto :err

echo === build ok: %FINAL% ===
popd
exit /b 0

:err
popd
echo BUILD FAILED
exit /b 1
