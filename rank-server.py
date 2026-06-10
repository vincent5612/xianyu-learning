#!/usr/bin/env python3
"""闲鱼考试排名服务器 — 考试时运行即可"""
import json, os
from http.server import HTTPServer, BaseHTTPRequestHandler

DATA_FILE = os.path.join(os.path.dirname(__file__), 'exam_results.json')

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE) as f:
                data = json.load(f)
        else:
            data = {"results": []}
        self.wfile.write(json.dumps(data).encode())

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            new = json.loads(body)
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE) as f:
                    data = json.load(f)
            else:
                data = {"results": []}
            data["results"].append(new)
            data["results"].sort(key=lambda r: r.get('pct', 0), reverse=True)
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self.send_response(200)
        except:
            self.send_response(400)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status":"ok"}).encode())

    def log_message(self, format, *args):
        print(f"[排名服务器] {args[0]} {args[1]} {args[2]}")

port = 8899
print(f"闲鱼考试排名服务器已启动 → http://localhost:{port}")
print(f"考试页面请用: http://localhost:{port}/exam")
print("按 Ctrl+C 停止")
HTTPServer(('0.0.0.0', port), Handler).serve_forever()
