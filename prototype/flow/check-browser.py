from pathlib import Path
import subprocess
import shutil
cli = shutil.which("chrome-devtools-axi")
if cli is None:
    raise SystemExit("Install chrome-devtools-axi and put it on PATH before running this check.")
source = Path(__file__).with_name("check.js").read_text()
result = subprocess.run([str(cli), "eval", source], capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
if result.returncode or '"passed"' not in result.stdout.replace('\\',''):
    raise SystemExit(1)
