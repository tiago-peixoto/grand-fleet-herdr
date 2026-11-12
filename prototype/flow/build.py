from pathlib import Path
import base64
import json

root = Path(__file__).resolve().parent
assets = root.parent / "custom-trial/assets"
paths = {name: assets / (name + ".png") for name in ["sunny", "luffy"]}
paths["workerStates"] = root / "assets/worker-states-v1.png"
paths["flag"] = root / "assets/straw-hat-flag.png"
urls = {name: "data:image/png;base64," + base64.b64encode(path.read_bytes()).decode() for name, path in paths.items()}
page = (root / "screen.html").read_text()
page = page.replace("__ART_URLS__", json.dumps(urls)).replace("__APP_SCRIPT__", (root / "app.js").read_text())
(root.parent / "index.html").write_text(page)
print("Built portable daily-flow prototype with custom character states and ship sprites.")
