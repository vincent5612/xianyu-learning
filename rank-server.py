#!/usr/bin/env python3
"""闲鱼考试排名服务器 — 同时提供API和排名页面"""
import json, os
from http.server import HTTPServer, BaseHTTPRequestHandler

DATA_FILE = os.path.join(os.path.dirname(__file__), 'exam_results.json')
PORT = 8899

RANK_HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>闲鱼培训 · 成绩排名</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,"PingFang SC",sans-serif;background:#f0f2f5;color:#1d1d1f;min-height:100vh}
  .header{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:30px 20px 24px;text-align:center}
  .header h1{font-size:1.3em}
  .header p{font-size:0.82em;opacity:0.6;margin-top:4px}
  .container{max-width:600px;margin:0 auto;padding:20px 16px}
  .rank-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)}
  .rank-item{display:flex;align-items:center;padding:14px 18px;border-bottom:1px solid #f1f5f9}
  .rank-num{width:40px;font-weight:700;font-size:1.1em;color:#94a3b8;flex-shrink:0}
  .rank-num.top1{color:#f59e0b}.rank-num.top2{color:#94a3b8}.rank-num.top3{color:#b45309}
  .rank-name{flex:1;font-weight:600;font-size:0.95em}
  .rank-score{font-size:0.9em;color:#1e293b;font-weight:600}
  .rank-pct{font-size:0.75em;color:#94a3b8;margin-left:6px}
  .rank-pass{font-size:0.75em;padding:2px 8px;border-radius:10px;margin-left:8px}
  .rank-pass.pass{background:#f0fdf4;color:#16a34a}
  .rank-pass.fail{background:#fef2f2;color:#dc2626}
  .loading{text-align:center;padding:40px;color:#94a3b8}
  .refresh-btn{background:#d97706;color:#fff;border:none;padding:8px 24px;border-radius:20px;font-size:0.85em;font-weight:600;cursor:pointer;margin:16px auto 0;display:block}
</style>
</head>
<body>
<div class="header"><h1>🏆 闲鱼培训 · 成绩排名</h1><p>实时更新 · 讲师电脑提供</p></div>
<div class="container">
  <div id="rankList" class="loading">加载中...</div>
  <button class="refresh-btn" onclick="loadRank()">🔄 刷新排名</button>
</div>
<script>
async function loadRank(){
  document.getElementById('rankList').innerHTML='<div class=\"loading\">加载中...</div>';
  try{
    let resp=await fetch('/api/results');
    let data=await resp.json();
    let list=data.results||[];
    list.sort((a,b)=>b.pct-a.pct);
    if(list.length===0){
      document.getElementById('rankList').innerHTML='<div class=\"loading\">暂无成绩记录</div>';return;
    }
    let h='<div class=\"rank-card\">';
    list.forEach((r,i)=>{
      let medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
      let nc=i===0?'top1':i===1?'top2':i===2?'top3':'';
      h+='<div class=\"rank-item\"><div class=\"rank-num '+nc+'\">'+medal+' '+(i+1)+'</div>';
      h+='<div class=\"rank-name\">'+r.name+'</div>';
      h+='<div class=\"rank-score\">'+r.score+'<span class=\"rank-pct\">/'+r.total+'分（'+r.pct+'%）</span></div>';
      h+='<div class=\"rank-pass '+(r.pass?'pass':'fail')+'\">'+(r.pass?'✅通过':'❌未过')+'</div></div>';
    });
    h+='</div>';
    document.getElementById('rankList').innerHTML=h;
  }catch(e){
    document.getElementById('rankList').innerHTML='<div class=\"loading\">❌ 无法连接服务器<br><span style="font-size:0.85em;color:#64748b">请让老师在电脑上启动排名服务器</span></div>';
  }
}
loadRank();
</script>
</body>
</html>"""

class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        # 排名页面
        if self.path == '/rank' or self.path == '/rank.html':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(RANK_HTML.encode('utf-8'))
            return
        
        # 考试页面（如果本地有的话）
        if self.path == '/exam':
            exam_path = os.path.join(os.path.dirname(__file__), 'exam-final.html')
            if os.path.exists(exam_path):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(exam_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
        
        # API: 获取排名数据
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
            # 去重：同一个人保留最高分
            existing = next((i for i, r in enumerate(data["results"]) if r.get('name') == new.get('name')), -1)
            if existing >= 0:
                if new.get('pct', 0) > data["results"][existing].get('pct', 0):
                    data["results"][existing] = new
            else:
                data["results"].append(new)
            data["results"].sort(key=lambda r: r.get('pct', 0), reverse=True)
            with open(DATA_FILE, 'w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self.send_response(200)
        except Exception as e:
            self.send_response(400)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status":"ok"}).encode())

    def log_message(self, format, *args):
        print(f"[排名服务器] {args[0]} {args[1]} {args[2]}")

print(f"🏆 闲鱼考试排名服务器已启动")
print(f"   📝 考试页: http://localhost:{PORT}/exam")
print(f"   🏆 排名页: http://localhost:{PORT}/rank")
print(f"   📡 API:    http://localhost:{PORT}/api/results")
print(f"")
print(f"   同WiFi下的学员用你的电脑IP访问:")
import socket
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)
print(f"   📝 考试: http://{local_ip}:{PORT}/exam")
print(f"   🏆 排名: http://{local_ip}:{PORT}/rank")
print(f"按 Ctrl+C 停止")
HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
