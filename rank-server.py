#!/usr/bin/env python3
"""闲鱼考试排名服务器 — 考试时运行，自动同步到GitHub"""
import json, os, threading, subprocess
from http.server import HTTPServer, BaseHTTPRequestHandler

DATA_FILE = os.path.join(os.path.dirname(__file__), 'exam_results.json')
PORT = 8899

# 查找本地仓库路径
REPO_DIR = None
for d in ['/tmp/xianyu-learning', os.path.expanduser('~/xianyu-learning')]:
    if os.path.exists(d):
        REPO_DIR = d
        break

RANK_HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>闲鱼培训 · 成绩排名</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,"PingFang SC",sans-serif;background:#f0f2f5;color:#1d1d1f;min-height:100vh}
  .header{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:30px 20px 24px;text-align:center}
  .header h1{font-size:1.3em;margin-bottom:4px}.header p{font-size:0.82em;opacity:0.6}
  .container{max-width:600px;margin:0 auto;padding:20px 16px}
  .rank-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
  .rank-item{display:flex;align-items:center;padding:14px 18px;border-bottom:1px solid #f1f5f9}
  .rank-num{width:40px;font-weight:700;font-size:1.1em;color:#94a3b8;flex-shrink:0}
  .rank-num.top1{color:#f59e0b}.rank-num.top2{color:#94a3b8}.rank-num.top3{color:#b45309}
  .rank-name{flex:1;font-weight:600;font-size:0.95em}
  .rank-score{font-size:0.9em;color:#1e293b;font-weight:600}
  .rank-pct{font-size:0.75em;color:#94a3b8;margin-left:6px}
  .rank-pass{font-size:0.75em;padding:2px 8px;border-radius:10px;margin-left:8px}
  .rank-pass.pass{background:#f0fdf4;color:#16a34a}.rank-pass.fail{background:#fef2f2;color:#dc2626}
  .loading{text-align:center;padding:40px;color:#94a3b8}
  .refresh-btn{background:#d97706;color:#fff;border:none;padding:8px 24px;border-radius:20px;font-size:0.85em;font-weight:600;cursor:pointer;margin:16px auto 0;display:block}
</style></head>
<body>
<div class="header"><h1>🏆 闲鱼培训 · 成绩排名</h1><p>数据自动同步，所有人可见</p></div>
<div class="container">
  <div id="rankList" class="loading">加载中...</div>
  <button class="refresh-btn" onclick="loadRank()">🔄 刷新排名</button>
</div>
<script>
const R='https://raw.githubusercontent.com/vincent5612/xianyu-learning/main/exam_results.json';
async function loadRank(){
  document.getElementById('rankList').innerHTML='<div class="loading">加载中...</div>';
  try{
    let r=await fetch(R+'?t='+Date.now());let d=await r.json();
    let l=d.results||[];l.sort((a,b)=>b.pct-a.pct);
    if(!l.length){document.getElementById('rankList').innerHTML='<div class="loading">暂无成绩</div>';return;}
    let h='<div class="rank-card">';
    l.forEach((r,i)=>{
      let m=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';let nc=i===0?'top1':i===1?'top2':i===2?'top3':'';
      h+='<div class="rank-item"><div class="rank-num '+nc+'">'+m+' '+(i+1)+'</div><div class="rank-name">'+r.name+'</div>';
      h+='<div class="rank-score">'+r.score+'<span class="rank-pct">/'+r.total+'分（'+r.pct+'%）</span></div>';
      h+='<div class="rank-pass '+(r.pass?'pass':'fail')+'">'+(r.pass?'✅通过':'❌未过')+'</div></div>';
    });h+='</div>';document.getElementById('rankList').innerHTML=h;
  }catch(e){document.getElementById('rankList').innerHTML='<div class="loading">❌ 排名加载失败</div>';}
}
loadRank();
</script></body></html>"""

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path in ('/rank', '/rank.html'):
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(RANK_HTML.encode('utf-8'))
            return
        if self.path == '/exam':
            p = os.path.join(os.path.dirname(__file__), 'exam-final.html')
            if os.path.exists(p):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(p, 'rb') as f: self.wfile.write(f.read())
                return
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        d = {"results": []}
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE) as f: d = json.load(f)
        self.wfile.write(json.dumps(d).encode())

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            new = json.loads(body)
            d = {"results": []}
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE) as f: d = json.load(f)
            # 去重，保留最高分
            idx = next((i for i, r in enumerate(d["results"]) if r.get('name') == new.get('name')), -1)
            if idx >= 0:
                if new.get('pct', 0) > d["results"][idx].get('pct', 0):
                    d["results"][idx] = new
            else:
                d["results"].append(new)
            d["results"].sort(key=lambda r: r.get('pct', 0), reverse=True)
            with open(DATA_FILE, 'w') as f:
                json.dump(d, f, ensure_ascii=False, indent=2)
            
            # 后台同步到GitHub
            if REPO_DIR:
                def sync():
                    dest = os.path.join(REPO_DIR, 'exam_results.json')
                    subprocess.run(['cp', DATA_FILE, dest], capture_output=True)
                    subprocess.run(['git', '-C', REPO_DIR, 'add', 'exam_results.json'], capture_output=True)
                    subprocess.run(['git', '-C', REPO_DIR, 'commit', '-m', f'成绩 {new.get("name","")} {new.get("pct",0)}%'], capture_output=True)
                    subprocess.run(['git', '-C', REPO_DIR, 'push'], capture_output=True)
                threading.Thread(target=sync).start()
            
            self.send_response(200)
        except:
            self.send_response(400)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status":"ok"}).encode())

    def log_message(self, *a):
        print(f"[排名] {a[1]} {a[2]}")

import socket
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)
print(f"\n🏆 闲鱼考试排名服务器")
print(f"  考试页: http://{local_ip}:{PORT}/exam")
print(f"  排名页: http://{local_ip}:{PORT}/rank")
print(f"  云端排名: https://vincent5612.github.io/xianyu-learning/rank.html")
print(f"  按 Ctrl+C 停止\n")
HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
