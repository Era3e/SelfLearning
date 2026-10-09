import json
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "inbox", "jd-inbox.json")
SOURCE_HEALTH = os.path.join(ROOT, "inbox", "source-health.json")
SOURCE_STATUSES = {"available", "manual", "captcha", "login", "timeout", "deprecated", "unknown"}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def end_headers(self):
        self._cors()
        if self.path in ("/app", "/app/"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/jd":
            try:
                with open(INBOX, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except (OSError, ValueError):
                data = {"entries": []}
            self._json(200, data)
            return
        if self.path == "/api/source-health":
            try:
                with open(SOURCE_HEALTH, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except (OSError, ValueError):
                data = {"version": "", "sources": []}
            self._json(200, data)
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/source-health":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = json.loads(self.rfile.read(length).decode("utf-8"))
                sources = body.get("sources", [])
                if not isinstance(sources, list):
                    raise ValueError("sources must be a list")
                for item in sources:
                    if not isinstance(item, dict) or not item.get("id"):
                        raise ValueError("each source health item requires id")
                    if item.get("status") not in SOURCE_STATUSES:
                        raise ValueError("invalid source status: %s" % item.get("status"))
                os.makedirs(os.path.dirname(SOURCE_HEALTH), exist_ok=True)
                tmp = SOURCE_HEALTH + ".tmp"
                payload = {
                    "version": str(body.get("version") or ""),
                    "checkedAt": str(body.get("checkedAt") or ""),
                    "sources": sources,
                }
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(payload, f, ensure_ascii=False, indent=2)
                os.replace(tmp, SOURCE_HEALTH)
                self._json(200, {"ok": True, "count": len(sources)})
            except Exception as e:
                self._json(400, {"error": str(e)})
            return
        if self.path != "/api/jd":
            self._json(404, {"error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            entries = body.get("entries", [])
            if not isinstance(entries, list):
                raise ValueError("entries must be a list")
            os.makedirs(os.path.dirname(INBOX), exist_ok=True)
            tmp = INBOX + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump({"entries": entries}, f, ensure_ascii=False, indent=2)
            os.replace(tmp, INBOX)
            self._json(200, {"ok": True, "count": len(entries)})
        except Exception as e:
            self._json(400, {"error": str(e)})

    def _json(self, code, obj):
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


if __name__ == "__main__":
    port = int(os.environ.get("LEARNING_PORT", "8000"))
    print(f"Serving http://127.0.0.1:{port}/app/ (JD inbox API: /api/jd)")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
