/* ═══════════════════════════════════════════════════════════
   口袋大脑-U · 求必应 ｜ 高保真原型 v1（赛博鎏金）
   纯静态，零依赖，双击 index.html 即可跑
   依据：《7-20 需求更新（游戏化流程）》+《老板对齐 5.1（C端赛博鎏金、任务=打怪）》
        + U盘 0.0.34 原版信息架构（角色/智能体市场/技能市场/签到/成就/排行/需求/模型消耗/设置）
   ═══════════════════════════════════════════════════════════ */

/* ══════════ 状态 ══════════ */
const S = {
  view: 'chat',
  roleId: 'default',
  points: 1280,
  level: 3,
  exp: 62,
  streak: 4,
  signedToday: false,
  onboarded: false,
  identity: null,        // 首次进入选的身份
  tone: null,            // 沟通风格
  skillsOn: ['daily-reflection', 'cn-writing-polish', 'wechat-article-creator',
             'data-assistant', 'docx-butler', 'efficiency-toolkit'],
  msgs: [],
  model: 'qwen-plus（百炼）',
  calls: 128,
  tokens: '186.4k',
  cost: '2.36',
  balance: '47.64'
};

/* ══════════ 数据 ══════════ */
const ROLES = [
  { id:'default', em:'🐱', nm:'小盈',  tag:'全能助手',       duty:'什么都能搭一把手：写东西、理资料、查信息、看数据、做规划。先接住，再拆解，给你能直接用的结果。', grp:'默认', skl:['daily-reflection','cn-writing-polish','efficiency-toolkit'] },
  { id:'workplace',em:'💼', nm:'阿正',  tag:'职场人士 · 汇报与沟通', duty:'帮你把职场里要交出去的东西交好：周报汇报、会议纪要、邮件沟通、方案材料、数据图表。', grp:'生活与工作', skl:['docx-butler','meeting-secretary','cn-writing-polish'] },
  { id:'parent',  em:'🍼', nm:'小暖',  tag:'宝爸宝妈 · 育儿与家庭', duty:'帮一个家把日常理顺：孩子的吃穿学、家里的采购安排、夫妻分工的沟通、跟老师长辈打交道。', grp:'生活与工作', skl:['meal-planner','daily-reflection'] },
  { id:'creator', em:'🔥', nm:'阿燃',  tag:'个人IP · 内容与变现', duty:'帮做自己 IP 的人把内容持续做出来、把路子走通：选题、口播稿、公众号、小红书图文。', grp:'生活与工作', skl:['wechat-article-creator','xiaohongshu-writing','image-prompt-generator'] },
  { id:'owner',   em:'🏪', nm:'阿盛',  tag:'个体老板 · 经营与客户', duty:'帮开店、做小生意的人把经营的账和事算清楚：算成本利润、定价、客户跟进、招人和管人。', grp:'生活与工作', skl:['data-assistant','docx-butler'] },
  { id:'jobhunt', em:'🎯', nm:'阿捷',  tag:'求职面试 · 简历与对答', duty:'帮正在找工作的人把这一关过掉：改简历、写自我介绍、准备面试问答、谈薪、写跟进邮件。', grp:'生活与工作', skl:['cn-writing-polish','email-expert'] },
  { id:'study',   em:'📚', nm:'小书',  tag:'学习考试 · 计划与记忆', duty:'帮备考和想自学的人把计划排明白、把知识点记住：拆目标、排进度、出题自测、做错题本。', grp:'生活与工作', skl:['daily-reflection','academic-research'] },
  { id:'finance', em:'📊', nm:'小衡',  tag:'财务 · 账目与归类',   duty:'帮个人和小店把钱的来去理清楚：记账归类别、算占比、看趋势、出能看懂的表。', grp:'专业', skl:['data-assistant','data-viz-assistant'] },
  { id:'lawyer',  em:'⚖️', nm:'言律',  tag:'法律 · 条款与文书',   duty:'帮你把合同和文书里容易出事的地方先挑出来：条款清单、风险排序、文书草稿，标注待核项。', grp:'专业', skl:['docx-butler','academic-research'] },
  { id:'hr',      em:'🧑‍💼', nm:'阿聘',  tag:'招聘 · JD 与筛选',    duty:'帮招聘的人把岗位写清楚、把简历筛明白：先对齐四要素再写 JD，按硬条件筛人。', grp:'专业', skl:['docx-butler','email-expert'] },
  { id:'ec',      em:'🛒', nm:'阿销',  tag:'电商 · 选品与详情页',  duty:'帮做电商的人把货选对、把详情页写好：先问平台/价格带/参数，再出标题卖点和详情。', grp:'生意', skl:['data-assistant','image-prompt-generator'] },
  { id:'retail',  em:'🏬', nm:'阿店',  tag:'零售 · 门店与活动',    duty:'帮门店把日常经营数据变成动作：先要四个数再出方案，含活动、陈列、复购。', grp:'生意', skl:['data-assistant','data-viz-assistant'] },
  { id:'realtor', em:'🏠', nm:'安家',  tag:'房产 · 带看与沟通',    duty:'帮房产从业者把带看和沟通做扎实：房源卖点、话术、跟进节奏，敏感说法会提醒你。', grp:'生意', skl:['cn-writing-polish','data-assistant'] },
  { id:'business',em:'🏢', nm:'荣盈业务', tag:'公司业务 · 京东/闲鱼/RPO', duty:'公司业务专属：京东店群招商、闲鱼电商、RPO 招聘的内部口径与对外讲法。', grp:'生意', skl:['docx-butler','wechat-article-creator'], biz:true }
];

const SKILLS = [
  { id:'wechat-article-creator', nm:'公众号写作',   cat:'写作', d:'从选题到成稿，含标题/摘要/正文结构', hot:true },
  { id:'xiaohongshu-writing',    nm:'小红书文案',   cat:'写作', d:'图文笔记标题、正文、标签一次出' },
  { id:'cn-writing-polish',      nm:'中文润色',     cat:'写作', d:'去 AI 味、改口语、调语气' },
  { id:'prompt-optimizer',       nm:'提示词优化',   cat:'写作', d:'把一句话需求变成能用的提示词' },
  { id:'data-assistant',         nm:'数据分析',     cat:'数据', d:'读表、算数、出结论，带口径说明', hot:true },
  { id:'data-viz-assistant',     nm:'数据可视化',   cat:'数据', d:'把数字变成图表和看板' },
  { id:'docx-butler',            nm:'文档管家',     cat:'办公', d:'Word/合同/报告排版与生成', hot:true },
  { id:'office-doc-generator',   nm:'办公文档生成', cat:'办公', d:'批量出通知、模板、表格' },
  { id:'meeting-secretary',      nm:'会议秘书',     cat:'办公', d:'纪要、行动项、责任人拆解' },
  { id:'email-expert',           nm:'邮件专家',     cat:'办公', d:'对外邮件措辞、跟进、催办' },
  { id:'efficiency-toolkit',     nm:'效率工具',     cat:'办公', d:'重复动作批处理、文件整理' },
  { id:'academic-research',      nm:'学术研究',     cat:'研究', d:'文献检索、综述、引用规范' },
  { id:'web-search-extraction',  nm:'网页抓取',     cat:'研究', d:'把网页正文抓下来整理成要点' },
  { id:'multi-search-engine',    nm:'多引擎搜索',   cat:'研究', d:'多个来源交叉核对再给结论' },
  { id:'daily-reflection',       nm:'每日复盘',     cat:'成长', d:'今天干了啥、卡在哪、明天做啥' },
  { id:'image-prompt-generator', nm:'图像提示词',   cat:'创作', d:'出图/出封面的提示词' },
  { id:'video-prompt-generator', nm:'视频提示词',   cat:'创作', d:'口播/短视频脚本与分镜提示' },
  { id:'meal-planner',           nm:'家庭菜谱',     cat:'生活', d:'按人数口味排一周饭' },
  { id:'travel-planner',         nm:'出行规划',     cat:'生活', d:'行程、预算、带娃方案' },
  { id:'fitness-coach',          nm:'健身教练',     cat:'生活', d:'按体能排训练与饮食' },
  { id:'weather-forecast',       nm:'天气',         cat:'生活', d:'出门前查天气与穿衣' }
];

const MK_AGENTS = [
  { em:'🧾', nm:'报销小助手', by:'官方', star:'4.9', d:'拍照识别票据 → 自动归类 → 出报销单', tag:'办公' },
  { em:'📈', nm:'店铺诊断师', by:'官方', star:'4.8', d:'给一组经营数据，出问题清单加动作建议', tag:'生意' },
  { em:'🎬', nm:'口播脚本师', by:'创作者联盟', star:'4.7', d:'从选题直接出口播稿 + 拍摄提示', tag:'内容' },
  { em:'🧑‍🏫', nm:'陪读老师',   by:'官方', star:'4.8', d:'拆知识点、出题、批改、讲错题', tag:'教育' },
  { em:'📦', nm:'选品参谋',   by:'电商联盟', star:'4.6', d:'四个平台交叉比价，出选品评分表', tag:'生意' },
  { em:'🎙️', nm:'会议复盘官', by:'官方', star:'4.9', d:'录音转写 → 决议 → 谁在什么时候交什么', tag:'办公' },
  { em:'🧠', nm:'面试教练',   by:'官方', star:'4.8', d:'模拟面试、追问、给改进点', tag:'成长' },
  { em:'🏡', nm:'家庭总管',   by:'官方', star:'4.7', d:'家务分工、采购清单、亲子日程', tag:'生活' }
];

const QUESTS = [
  { t:'帮我写一篇公众号初稿（选题自定）', tag:'内容', lv:'普通怪', rw:120, time:'约 3 分钟', steps:['接单','AI 交付','你验收','结算'], cur:1, from:'官方' },
  { t:'把这份表格整理成能看懂的月报', tag:'数据', lv:'精英怪', rw:260, time:'约 6 分钟', steps:['接单','AI 交付','你验收','结算'], cur:0, from:'个体老板 李' },
  { t:'给门店做一套中秋活动方案', tag:'经营', lv:'精英怪', rw:300, time:'约 8 分钟', steps:['接单','AI 交付','你验收','结算'], cur:0, from:'门店 王' },
  { t:'帮我把这份简历改到能投大厂', tag:'求职', lv:'普通怪', rw:150, time:'约 4 分钟', steps:['接单','AI 交付','你验收','结算'], cur:2, from:'求职者 陈' },
  { t:'竞品公众号近 30 天选题拆解', tag:'内容', lv:'BOSS', rw:480, time:'约 15 分钟', steps:['接单','AI 交付','你验收','结算'], cur:0, from:'自媒体 张' },
  { t:'一周家庭菜谱 + 采购清单', tag:'生活', lv:'普通怪', rw:90, time:'约 2 分钟', steps:['接单','AI 交付','你验收','结算'], cur:0, from:'宝妈 周' }
];

const ACH = [
  { em:'🌱', nm:'初来乍到', d:'完成新手村', got:true },
  { em:'⚡', nm:'第一次实操', d:'亲手用一次并拿到结果', got:true },
  { em:'🔥', nm:'连续签到 7 天', d:'当前 4 / 7 天', got:false },
  { em:'🧰', nm:'技能收集者', d:'装了 6 / 10 个技能', got:false },
  { em:'💬', nm:'百问不烦', d:'累计 100 次对话', got:true },
  { em:'🧠', nm:'记忆大师', d:'它记住你 20 条以上', got:false },
  { em:'🏆', nm:'首次通关', d:'完成第一个需求悬赏', got:true },
  { em:'💎', nm:'积分破千', d:'RY 积分到 1000', got:true }
];

const RANK = [
  { nm:'安叔（你）', p:1280, me:true },
  { nm:'林**', p:1160 }, { nm:'周**', p:980 }, { nm:'陈**', p:870 }, { nm:'王**', p:760 }, { nm:'李**', p:640 }
];

const USAGE_DAYS = [22,31,18,44,39,52,28,47,61,35,58,42,66,128];
const ROLE_SPLIT = [
  { nm:'小盈 全能助手', v:42, c:'#8088fb' },
  { nm:'阿燃 个人IP',   v:24, c:'#e6b35a' },
  { nm:'阿正 职场',     v:16, c:'#4cc38a' },
  { nm:'阿销 电商',     v:11, c:'#f09a5a' },
  { nm:'其他',          v:7,  c:'#6d7387' }
];

const ONBOARD_IDENT = [
  { em:'🧑‍💼', nm:'职场人',   d:'汇报、会议、方案、数据',    to:'workplace' },
  { em:'🔥',    nm:'自媒体IP', d:'选题、写稿、涨粉、变现',    to:'creator' },
  { em:'🌱',    nm:'个人小白', d:'什么都想试试，需要人带',    to:'default' },
  { em:'🍼',    nm:'宝妈宝爸', d:'带娃、家务、副业两手抓',    to:'parent' },
  { em:'🛒',    nm:'电商运营', d:'选品、详情页、客服、投流',  to:'ec' },
  { em:'🏪',    nm:'个体老板', d:'算账、定价、客户、招人',    to:'owner' }
];

const ONBOARD_TONE = [
  { id:'brief',  em:'⚡', nm:'简洁明了', d:'能一句说完不写三句' },
  { id:'humor',  em:'😄', nm:'幽默风趣', d:'讲人话，偶尔抖个机灵' },
  { id:'steady', em:'🧱', nm:'成熟稳重', d:'先结论后细节，不废话' }
];

const NAV = [
  { id:'chat',     ic:'💬', nm:'智能体' },
  { id:'roles',    ic:'🎭', nm:'角色中心' },
  { id:'agents',   ic:'🧩', nm:'智能体市场' },
  { id:'skills',   ic:'🧰', nm:'技能市场' },
  { id:'hall',     ic:'📋', nm:'需求大厅' },
  { id:'growth',   ic:'🏆', nm:'成长中心' },
  { id:'usage',    ic:'📊', nm:'模型消耗' },
  { id:'wallet',   ic:'💎', nm:'充值中心' },
  { id:'settings', ic:'⚙️', nm:'设置' }
];

const TITLES = {
  chat:['智能体','跟它说话就行，它会记住你'],
  roles:['角色中心','6 类客群 · 一人一套推荐技能'],
  agents:['智能体市场','装一个，它就多会一件事'],
  skills:['技能市场','21 个技能，命中哪个用它哪个'],
  hall:['需求大厅','任务=打怪，交付=通关'],
  growth:['成长中心','签到、每日任务、成就、排行'],
  usage:['模型消耗','你的 AI 使用概览（C 端面板）'],
  wallet:['充值中心','RY 积分 · 硬件买断 + 算力订阅'],
  settings:['设置','本机的东西，你说了算']
};

/* ══════════ 工具 ══════════ */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function toast(msg, gold) {
  const t = $('toast');
  t.innerHTML = `<div class="toast${gold ? ' gold' : ''}">${msg}</div>`;
  clearTimeout(window.__tt);
  window.__tt = setTimeout(() => { t.innerHTML = ''; }, 2200);
}

function addPoints(n, why) {
  S.points += n;
  const gained = S.exp + 18;
  if (gained >= 100) { S.exp = gained - 100; S.level++; toast(`🎉 升级！现在是 Lv.${S.level} · ${why}`, true); }
  else S.exp = gained;
  syncTop();
}

function syncTop() {
  $('tp-points').textContent = S.points.toLocaleString();
  $('tp-level').textContent = `Lv.${S.level}`;
  $('tp-model').textContent = S.model;
}

/* ══════════ 导航 ══════════ */
function renderRail() {
  $('rail').innerHTML = '<div class="rail-logo">应</div>' + NAV.map(n => `
    <button class="rail-btn${S.view === n.id ? ' on' : ''}" data-nav="${n.id}">
      <i>${n.ic}</i>${n.nm}${n.id === 'growth' && !S.signedToday ? '<span class="dot"></span>' : ''}
    </button>`).join('') + '<div class="rail-sp"></div>' +
    '<button class="rail-btn" data-nav="onboard"><i>🎮</i>新手村</button>';
  document.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => go(b.dataset.nav));
}

function go(id) {
  if (id === 'onboard') return openOnboard(0);
  S.view = id;
  const [t, s] = TITLES[id];
  $('pg-title').innerHTML = `${t} <span>${s}</span>`;
  renderRail();
  render();
  try { history.replaceState(null, '', '#' + id); } catch (e) {}
}

function render() {
  const v = $('view');
  v.innerHTML = ({
    chat: viewChat, roles: viewRoles, agents: viewAgents, skills: viewSkills,
    hall: viewHall, growth: viewGrowth, usage: viewUsage, wallet: viewWallet,
    settings: viewSettings
  }[S.view] || viewChat)();
  bindView();
}

/* ══════════ 2. 智能体（三栏 IM）══════════ */
function viewChat() {
  const cur = ROLES.find(r => r.id === S.roleId) || ROLES[0];
  const grps = [...new Set(ROLES.map(r => r.grp))];
  const list = grps.map(g => `<div class="grp">${g}</div>` + ROLES.filter(r => r.grp === g).map(r => `
    <div class="ri${r.id === S.roleId ? ' on' : ''}" data-role="${r.id}">
      <div class="rav">${r.em}</div>
      <div class="rt"><b>${r.nm}</b><span>${r.tag}</span></div>
    </div>`).join('')).join('');

  const msgs = S.msgs.length ? S.msgs.map(m => `
    <div class="msg ${m.who}"><div class="bub">${m.t}</div></div>`).join('') : `
    <div style="margin:auto;max-width:600px;text-align:center">
      <div style="font-size:34px;margin-bottom:10px">${cur.em}</div>
      <div style="font-size:17px;font-weight:600;margin-bottom:6px">${cur.nm}
        <span class="muted small" style="font-weight:400">${cur.tag}</span></div>
      <p class="muted" style="line-height:1.7;margin:0 0 18px">${cur.duty}</p>
      <div class="col" style="gap:8px;text-align:left">
        ${['我有个想法，你帮我理清并给落地步骤','帮我写一份简洁的工作汇报','帮我把这份材料润色一下，更适合给客户看','我有一份资料，帮我整理成能直接用的东西']
          .map(q => `<button class="btn" style="justify-content:flex-start" data-q="${q}">▸ ${q}</button>`).join('')}
      </div>
      <div style="margin-top:26px;padding-top:18px;border-top:1px dashed rgba(255,255,255,.1);text-align:left">
        <div class="row"><span>🤝</span><b>默契度</b>
          <span class="muted small">已记住你 4 条 · 用 1 天</span></div>
        <div class="bar" style="margin:9px 0 7px"><i style="width:${S.exp}%"></i></div>
        <div class="small muted">距「熟手」还差：记忆 6 条 / 再用 2 天</div>
      </div>
    </div>`;

  return `<div class="im">
    <div class="im-left">
      <div class="im-left-head">
        <input class="im-search" placeholder="搜角色…" id="im-search" />
        <div class="row small muted" style="margin-top:8px">
          <span>${ROLES.length} 个角色</span><span class="grow"></span>
          <a href="#" data-nav="roles">角色中心 →</a>
        </div>
      </div>
      <div class="list-scroll" id="role-scroll">${list}</div>
    </div>
    <div class="im-main">
      <div class="msgs" id="msgs">${msgs}</div>
      <div class="composer">
        <textarea id="in-msg" rows="1" placeholder="说点什么…（Enter 发送）"></textarea>
        <button class="btn primary" id="btn-send">发送</button>
      </div>
    </div>
    <div class="im-right">
      <div class="blk"><div class="side-title small muted">它记住了你什么</div>
        <div class="rec">🏢 <span>做京东店群招商</span></div>
        <div class="rec">🙅 <span>不喜欢客套话</span></div>
        <div class="rec">📝 <span>要执行清单，不要长篇分析</span></div>
        <div class="rec b"><span>已用 4 条 · 越用越准</span></div>
      </div>
      <div class="blk"><div class="side-title small muted">本次用了哪几条</div>
        <div class="rec">📚 知识：<b>1 段</b></div>
        <div class="rec">🧠 记忆：<b>2 条</b></div>
        <div class="rec">🧰 技能：<b>cn-writing-polish</b></div>
        <div class="rec">🧩 模型：<b>qwen-plus</b></div>
      </div>
      <div class="blk"><div class="side-title small muted">这个角色挂了什么</div>
        ${cur.skl.map(s => `<span class="chip pri" style="margin:0 5px 5px 0">${(SKILLS.find(x => x.id === s) || {}).nm || s}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ══════════ 3. 角色中心 ══════════ */
function viewRoles() {
  const grps = [...new Set(ROLES.map(r => r.grp))];
  const ident = S.identity ? `<span class="badge gold">你的身份：${S.identity}</span>` : '';
  return `<div class="scroll">
    <div class="phead">
      <div><h2>角色中心</h2><p>选一个身份，它给你的推荐技能就换一套 —— 不是千篇一律的对话框</p></div>
      <div class="top-sp"></div>${ident}
      <button class="btn sm" data-act="pick-ident">重新选身份</button>
    </div>
    ${grps.map(g => `
      <div class="sec-title">${g}</div>
      <div class="grid g2">
        ${ROLES.filter(r => r.grp === g).map(r => `
          <div class="card hover role-card ${r.biz ? 'gold-line' : ''}" data-role-card="${r.id}">
            <div class="role-top">
              <div class="role-av">${r.em}</div>
              <div class="grow">
                <div class="role-nm">${r.nm} ${r.id === S.roleId ? '<span class="badge ok">当前</span>' : ''}</div>
                <div class="role-tag">${r.tag}</div>
              </div>
              ${r.biz ? '<span class="badge gold">公司业务</span>' : ''}
            </div>
            <div class="role-duty">${r.duty}</div>
            <div class="role-skl">${r.skl.map(s => `<span class="chip pri">${(SKILLS.find(x => x.id === s) || {}).nm || s}</span>`).join('')}</div>
            <div class="row" style="gap:8px">
              <button class="btn primary sm" data-use="${r.id}">用它对话</button>
              <button class="btn sm" data-detail="${r.id}">看它能干什么</button>
            </div>
          </div>`).join('')}
      </div>`).join('')}
  </div>`;
}

/* ══════════ 4. 智能体市场 ══════════ */
function viewAgents() {
  return `<div class="scroll">
    <div class="phead">
      <div><h2>智能体市场</h2><p>装一个，它就多会一件事。装完进角色中心，随时能卸</p></div>
      <div class="top-sp"></div>
      <span class="badge dim">官方 ${MK_AGENTS.filter(a => a.by === '官方').length}</span>
      <span class="badge dim">创作者联盟 ${MK_AGENTS.filter(a => a.by !== '官方').length}</span>
    </div>
    <div class="grid g3">
      ${MK_AGENTS.map((a, i) => `
        <div class="card hover mk-card">
          <div class="mk-head">
            <div class="mk-ico">${a.em}</div>
            <div class="grow"><div class="mk-nm">${a.nm}</div>
              <div class="tiny dim">${a.by} · <span class="stars">★ ${a.star}</span></div></div>
          </div>
          <div class="mk-desc">${a.d}</div>
          <div class="mk-foot"><span class="chip">${a.tag}</span>
            <span class="grow"></span>
            <button class="btn primary sm" data-install="agent" data-i="${i}">安装</button></div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ══════════ 5. 技能市场 ══════════ */
function viewSkills() {
  const cats = [...new Set(SKILLS.map(s => s.cat))];
  return `<div class="scroll">
    <div class="phead">
      <div><h2>技能市场</h2><p>技能不是越多越好 —— 命中哪个才展开哪个，省字省钱也少出错</p></div>
      <div class="top-sp"></div>
      <span class="badge ok">已装 ${S.skillsOn.length}</span>
      <span class="badge dim">共 ${SKILLS.length}</span>
    </div>
    <div class="row wrap" style="margin-bottom:6px">
      ${cats.map(c => `<span class="chip">${c}</span>`).join('')}
    </div>
    <div class="grid g3" style="margin-top:12px">
      ${SKILLS.map(s => {
        const on = S.skillsOn.includes(s.id);
        return `<div class="card hover mk-card">
          <div class="mk-head">
            <div class="mk-ico">${on ? '✅' : '🧩'}</div>
            <div class="grow"><div class="mk-nm">${s.nm}${s.hot ? ' <span class="badge gold">热门</span>' : ''}</div>
              <div class="tiny dim mono">${s.id}</div></div>
          </div>
          <div class="mk-desc">${s.d}</div>
          <div class="mk-foot"><span class="chip">${s.cat}</span><span class="grow"></span>
            <button class="btn ${on ? '' : 'primary'} sm" data-install="skill" data-id="${s.id}">${on ? '已安装' : '装到本机'}</button></div>
        </div>`; }).join('')}
    </div>
  </div>`;
}

/* ══════════ 6. 需求大厅 ══════════ */
function viewHall() {
  const lvMap = { '普通怪':'dim', '精英怪':'', 'BOSS':'bad' };
  return `<div class="scroll">
    <div class="phead">
      <div><h2>需求大厅</h2><p>任务=打怪 · 交付=通关 · 经验=信用等级 · 订单=副本。接一个，AI 帮你打完</p></div>
      <div class="top-sp"></div>
      <button class="btn gold sm">＋ 发布需求</button>
    </div>
    <div class="grid g2">
      ${QUESTS.map((q, i) => `
        <div class="card q-card">
          <div class="q-head">
            <div class="grow"><div class="q-title">${q.t}</div>
              <div class="q-meta" style="margin-top:6px">
                <span>来自 ${q.from}</span><span>${q.time}</span><span>信用 Lv.${S.level} 可接</span></div></div>
            <div style="text-align:right"><div class="q-reward">+${q.rw} RY</div>
              <span class="badge ${lvMap[q.lv]}">${q.lv}</span></div>
          </div>
          <div class="q-tags"><span class="chip pri">${q.tag}</span><span class="chip">AI 自动验收</span></div>
          <div class="q-steps">
            ${q.steps.map((s, j) => `<em class="${j < q.cur ? 'done' : j === q.cur ? 'cur' : ''}">${s}</em>${j < q.steps.length - 1 ? '<s>›</s>' : ''}`).join('')}
          </div>
          <div class="row"><span class="grow"></span>
            <button class="btn sm" data-quest="${i}">看要求</button>
            <button class="btn primary sm" data-accept="${i}">${q.cur > 0 ? '继续这个' : '接单'}</button></div>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ══════════ 7. 成长中心 ══════════ */
function viewGrowth() {
  const week = ['一','二','三','四','五','六','日'];
  const todayIdx = 3; // 演示：周四
  return `<div class="scroll">
    <div class="phead"><div><h2>成长中心</h2><p>不是签到打卡，是「你真的用起来了」的证明</p></div></div>

    <div class="grow-hero">
      <div class="lv-ring"><b>${S.level}</b></div>
      <div class="lv-info">
        <h3>信用等级 Lv.${S.level} · ${S.level >= 3 ? '熟手' : '新人'}</h3>
        <div class="muted small">经验 ${S.exp} / 100 · 越高价的任务越对你开门</div>
        <div class="bar" style="margin:10px 0 6px"><i style="width:${S.exp}%"></i></div>
        <div class="small dim">累计 386 次对话 · 通关 12 个任务 · 被记住 4 条</div>
      </div>
      <div style="text-align:center">
        <div class="mono" style="font-size:24px;color:var(--gold)">${S.points}</div>
        <div class="tiny dim">RY 积分</div>
      </div>
    </div>

    <div class="sec-title">每日签到 · 已连签 ${S.streak} 天</div>
    <div class="sign-grid">
      ${week.map((d, i) => {
        const done = i < todayIdx, today = i === todayIdx;
        return `<div class="sign-cell${done ? ' done' : ''}${today && !S.signedToday ? ' today' : ''}${today && S.signedToday ? ' done' : ''}">
          <span>${d}</span><b>${done || (today && S.signedToday) ? '✓' : '+'+(20 + i * 5)}</b></div>`; }).join('')}
    </div>
    <div class="row" style="margin-top:12px">
      <button class="btn gold" data-act="sign" ${S.signedToday ? 'disabled' : ''}>${S.signedToday ? '今天已签 ✓' : '签到领 45 RY'}</button>
      <span class="muted small">连签 7 天额外送 200 RY + 「连续签到」成就</span>
    </div>

    <div class="sec-title">每日任务</div>
    <div class="col" style="gap:9px">
      ${[
        { ic:'💬', t:'跟它说一句话', r:20, done:true },
        { ic:'🧰', t:'用一个技能（任意）', r:30, done:true },
        { ic:'📋', t:'接一个需求大厅任务', r:40, done:false },
        { ic:'🧠', t:'告诉它一条关于你的事', r:25, done:false }
      ].map(x => `<div class="task${x.done ? ' done' : ''}">
        <div class="tk-ico">${x.ic}</div>
        <div class="tk-t"><b>${x.t}</b><span class="tiny dim">${x.done ? '已完成' : '还没做'}</span></div>
        <span class="tk-r">+${x.r} RY</span>
        ${x.done ? '<span class="badge ok">✓</span>' : '<button class="btn sm" data-act="task">去做</button>'}
      </div>`).join('')}
    </div>

    <div class="sec-title">成就墙 · ${ACH.filter(a => a.got).length}/${ACH.length}</div>
    <div class="grid g4">
      ${ACH.map(a => `<div class="ach${a.got ? ' got' : ''}">
        <div class="ai">${a.em}</div><b>${a.nm}</b><span>${a.d}</span></div>`).join('')}
    </div>

    <div class="sec-title">排行榜 · 本机/团队</div>
    <div class="col" style="gap:7px">
      ${RANK.map((r, i) => `<div class="rank${r.me ? ' me' : ''}">
        <div class="no${i === 0 ? ' g1' : i === 1 ? ' g2' : i === 2 ? ' g3' : ''}">${i + 1}</div>
        <div class="rn">${r.nm}</div>
        <span class="mono" style="color:var(--gold)">${r.p} RY</span></div>`).join('')}
    </div>
  </div>`;
}

/* ══════════ 8. 模型消耗 ══════════ */
function viewUsage() {
  const max = Math.max(...USAGE_DAYS);
  const donut = (() => {
    let acc = 0;
    return ROLE_SPLIT.map(s => {
      const from = acc; acc += s.v * 3.6;
      return `${s.c} ${from}deg ${acc}deg`;
    }).join(', ');
  })();
  return `<div class="scroll">
    <div class="phead"><div><h2>我的使用概览</h2><p>C 端面板：调用量 · 角色分布 · 算力消耗（不是只给运营看的后台）</p></div>
      <div class="top-sp"></div>
      <select class="inp"><option>近 14 天</option><option>近 7 天</option><option>本月</option></select>
    </div>

    <div class="grid g4">
      <div class="kpi"><div class="k">📞 今日调用</div><div class="v">${S.calls}</div><div class="d">比昨天 +32%</div></div>
      <div class="kpi"><div class="k">🔢 Token 消耗</div><div class="v">${S.tokens}</div><div class="d">输入 142k / 输出 44k</div></div>
      <div class="kpi"><div class="k">💰 折算花费</div><div class="v">¥${S.cost}</div><div class="d">按当前模型单价</div></div>
      <div class="kpi"><div class="k">💎 算力余额</div><div class="v" style="color:var(--gold)">¥${S.balance}</div><div class="d">约可用 21 天</div></div>
    </div>

    <div class="sec-title">近 14 天调用量</div>
    <div class="card"><div class="spark">
      ${USAGE_DAYS.map((v, i) => `<i style="height:${Math.round(v / max * 100)}%" title="第${i + 1}天：${v} 次"></i>`).join('')}
    </div>
    <div class="row tiny dim" style="margin-top:8px"><span>14 天前</span><span class="grow"></span><span>今天</span></div>
    </div>

    <div class="sec-title">角色使用分布</div>
    <div class="card split">
      <div class="donut" style="background:conic-gradient(${donut})"><div class="donut-c">
        <div><div class="mono" style="font-size:17px">386</div><div class="tiny dim">次对话</div></div></div></div>
      <div class="leg">
        ${ROLE_SPLIT.map(s => `<div><i style="background:${s.c}"></i><span class="grow">${s.nm}</span>
          <span class="mono muted">${s.v}%</span></div>`).join('')}
      </div>
    </div>

    <div class="sec-title">最近调用明细</div>
    <div class="card" style="padding:6px 12px">
      <table class="tb">
        <tr><th>时间</th><th>角色</th><th>技能</th><th>模型</th><th class="num">Token</th><th class="num">费用</th></tr>
        ${[
          ['18:12','小盈 全能助手','cn-writing-polish','qwen-plus','3.2k','¥0.041'],
          ['17:58','阿燃 个人IP','wechat-article-creator','qwen-plus','8.6k','¥0.112'],
          ['17:40','阿正 职场','meeting-secretary','qwen-plus','4.1k','¥0.053'],
          ['17:22','小盈 全能助手','data-assistant','qwen-plus','2.4k','¥0.031'],
          ['16:50','阿销 电商','image-prompt-generator','qwen-plus','1.8k','¥0.023']
        ].map(r => `<tr>${r.map((c, i) => `<td class="${i > 3 ? 'num' : ''}">${c}</td>`).join('')}</tr>`).join('')}
      </table>
    </div>
    <p class="small dim" style="margin-top:10px">口径：无密钥/断网时不产生费用，也不编造回答；每次调用都留痕，可对账。</p>
  </div>`;
}

/* ══════════ 9. 充值中心 ══════════ */
function viewWallet() {
  const pks = [
    { n:'体验包', v:'¥9.9',  o:'', d:'约 30 万 Token · 尝一口', tag:'' },
    { n:'标准包', v:'¥49',   o:'¥59', d:'约 200 万 Token · 日常用两个月', tag:'最省' },
    { n:'加速包', v:'¥199',  o:'¥249', d:'约 1000 万 Token · 重度用', tag:'' },
    { n:'硬件+1年算力', v:'¥800', o:'', d:'实体 U 盘（PUF 芯片）+ 1 年云端算力', tag:'交付形态' }
  ];
  return `<div class="scroll">
    <div class="phead"><div><h2>充值中心</h2><p>RY 积分（荣银）—— 不是币，就是你在这台机器上的算力余额</p></div></div>
    <div class="grow-hero" style="border-color:rgba(128,136,251,.28);background:linear-gradient(135deg,rgba(128,136,251,.12),transparent)">
      <div style="flex:1;min-width:220px">
        <div class="muted small">当前算力余额</div>
        <div class="mono" style="font-size:34px;font-weight:700;color:var(--gold)">¥${S.balance}</div>
        <div class="tiny dim">约可用 21 天 · 到期前 3 天会提醒你</div>
        <div class="row" style="margin-top:12px">
          <span class="badge">RY 积分 ${S.points}</span><span class="badge gold">License 有效</span>
        </div>
      </div>
      <div style="text-align:right">
        <button class="btn primary lg">立即充值</button>
        <div class="tiny dim" style="margin-top:8px">走监管账户 · 平台不经手资金</div>
      </div>
    </div>
    <div class="sec-title">套餐</div>
    <div class="grid g4">
      ${pks.map(p => `<div class="pk${p.tag === '最省' ? ' best' : ''}">
        ${p.tag ? `<div class="p-tag">${p.tag}</div>` : ''}
        <div class="p-n">${p.n}</div>
        <div class="p-v">${p.v}${p.o ? `<s>${p.o}</s>` : ''}</div>
        <div class="small muted" style="min-height:38px;line-height:1.5">${p.d}</div>
        <button class="btn ${p.tag === '最省' ? 'gold' : ''} full sm" style="margin-top:10px">选它</button>
      </div>`).join('')}
    </div>
    <div class="sec-title">交付清单（客户端「关于/交付」页同步展示）</div>
    <div class="card">
      <div class="grid g4">
        ${['实体 U 盘 ×1（PUF 芯片）','1 年云端算力','电子使用指南','专属售后群'].map(x =>
          `<div class="row"><span>✅</span><span class="small">${x}</span></div>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ══════════ 10. 设置 ══════════ */
function viewSettings() {
  const rows = [
    { t:'我的身份', s:'决定推荐角色和技能组合', ctl:`<select class="inp" id="set-ident">${ONBOARD_IDENT.map(i => `<option${S.identity === i.nm ? ' selected' : ''}>${i.nm}</option>`).join('')}</select>` },
    { t:'沟通风格', s:'它跟你说话的方式', ctl:`<select class="inp" id="set-tone">${ONBOARD_TONE.map(t => `<option>${t.nm}</option>`).join('')}</select>` },
    { t:'模型通道', s:S.model, ctl:`<select class="inp"><option>qwen-plus（百炼）</option><option>deepseek-chat</option><option>本机 Ollama</option></select>` },
    { t:'服务端代理地址', s:'短信/模型走我们的服务端，密钥不进这台机器', ctl:'<input class="inp" value="https://api.rongyinghudong.com/sms" />' },
    { t:'记忆导出', s:'换机器、换盘、发下一台都能带走', ctl:'<button class="btn sm">导出 json</button>' },
    { t:'每日自动备份', s:'留最近 7 份到 data/backup/', ctl:'<div class="switch on"></div>' },
    { t:'开机自动启动', s:'插上就用，不用找图标', ctl:'<div class="switch on"></div>' },
    { t:'场景化音效 / BGM', s:'任务=打怪、交付=通关的反馈音（可关）', ctl:'<div class="switch on"></div>' },
    { t:'新手引导', s:'重新走一遍新手村', ctl:'<button class="btn sm" id="set-ob">重看新手村</button>' }
  ];
  return `<div class="scroll">
    <div class="phead"><div><h2>设置</h2><p>本机的东西你说了算：数据不出这台机器</p></div></div>
    <div class="col" style="gap:9px">
      ${rows.map(r => `<div class="set-row">
        <div class="sr-t"><b>${r.t}</b><span>${r.s}</span></div>${r.ctl}</div>`).join('')}
    </div>
    <div class="sec-title">关于 / 交付</div>
    <div class="card">
      <div class="grid g4">
        <div class="small">产品：口袋大脑-U（求必应）</div>
        <div class="small">版本：0.0.34-prototype</div>
        <div class="small">主体：深圳市荣盈互动科技有限公司</div>
        <div class="small">服务：400-989-7768</div>
      </div>
      <p class="small dim" style="margin:12px 0 0">数据全部存在这台机器/U 盘上；聊天与记忆不自动上传。算法备案与生成式 AI 备案由主体申请中。</p>
    </div>
  </div>`;
}

/* ══════════ 新手村（首次进入流程）══════════ */
let obStep = 0, obSel = { ident:null, tone:null, quest:null, questDone:false };

function openOnboard(step) {
  obStep = step;
  $('ob').classList.remove('hidden');
  renderOnboard();
}

function renderOnboard() {
  const b = $('ob-body');
  const dots = `<div class="ob-steps">${[0,1,2,3].map(i => `<i class="${i <= obStep ? 'on' : ''}"></i>`).join('')}</div>`;

  if (obStep === 0) {
    b.innerHTML = `${dots}
      <h2>先认识一下 —— 双向身份确认</h2>
      <p class="sub">你告诉我你是谁，我告诉你我会用哪种方式跟你说话</p>
      <div class="id-grid">
        ${ONBOARD_IDENT.map((i, k) => `<div class="id-card${obSel.ident === k ? ' on' : ''}" data-ident="${k}">
          <div class="ii">${i.em}</div><b>${i.nm}</b><span>${i.d}</span></div>`).join('')}
      </div>
      <div class="sec-title" style="margin-top:22px">希望我怎么跟你说话</div>
      <div class="style-grid">
        ${ONBOARD_TONE.map((t, k) => `<div class="st-card${obSel.tone === k ? ' on' : ''}" data-tone="${k}">
          <div style="font-size:20px">${t.em}</div><b>${t.nm}</b><span>${t.d}</span></div>`).join('')}
      </div>
      <div class="ob-foot">
        <button class="btn primary lg" id="ob-next" ${obSel.ident === null || obSel.tone === null ? 'disabled' : ''}>
          开启我的智算钥匙 →</button>
        <button class="btn ghost lg" id="ob-skip">先跳过</button>
      </div>`;
  }

  if (obStep === 1) {
    const ident = ONBOARD_IDENT[obSel.ident];
    const role = ROLES.find(r => r.id === ident.to) || ROLES[0];
    b.innerHTML = `${dots}
      <div style="text-align:center;font-size:44px;margin-bottom:6px">${role.em}</div>
      <h2>${role.nm} 在这儿</h2>
      <p class="sub">${role.tag} · 按「${ONBOARD_TONE[obSel.tone].nm}」的方式跟你说话</p>
      <div class="sec-title">我能帮你做什么（${ROLES.filter(r => r.grp === role.grp || r.id === role.id).length + 4} 件事，先从这几件开始）</div>
      ${[
        ['1','把你说的一句话，变成能干活的方案','比如「我想做副业」→ 三条路 + 每条第一步'],
        ['2','把你手里的烂材料整理成能直接用的东西','表格/文档/汇报，一次成稿'],
        ['3','看数据、算账、找问题','给一组数就出结论，算不清会说算不清'],
        ['4','写东西：公众号、小红书、口播、邮件','按你的语气写，不是模板味'],
        ['5','记住你、越用越准','你说过的偏好，下次不用重复']
      ].map(([n, t, s]) => `<div class="abil"><div class="an">${n}</div>
        <div><b style="font-size:13px">${t}</b><div class="small muted">${s}</div></div></div>`).join('')}
      <div class="ob-foot">
        <button class="btn primary lg" id="ob-next">下一步：亲手用一次 →</button>
        <button class="btn ghost lg" id="ob-back">返回</button>
      </div>`;
  }

  if (obStep === 2) {
    const qs = [
      { t:'帮我把这段话改成朋友圈文案', need:'（你随手贴一段就行）' },
      { t:'帮我总结这篇文档', need:'（丢一个文件或贴一段）' },
      { t:'帮我把今天的乱七八糟理成三条明天要做的事', need:'（直接说，不用整理）' }
    ];
    b.innerHTML = `${dots}
      <h2>⭐ 第一次实操：选一件小事，现在就用</h2>
      <p class="sub">亲手用一次、拿到结果，才算真的会了 —— 看完教程不算</p>
      ${qs.map((q, i) => `<div class="card hover${obSel.quest === i ? ' gold-line' : ''}"
          style="margin-bottom:10px;cursor:pointer;border-color:${obSel.quest === i ? 'rgba(230,179,90,.55)' : ''}"
          data-quest-pick="${i}">
        <div class="row"><b class="grow">${q.t}</b>${obSel.quest === i ? '<span class="badge gold">选它</span>' : ''}</div>
        <div class="small dim" style="margin-top:4px">${q.need}</div>
      </div>`).join('')}
      ${obSel.quest !== null ? `
        <div class="quest-box" id="quest-run">
          <div class="qb-t">任务已发出 · 看它怎么干活</div>
          ${obSel.questDone ? `
            <div style="font-size:13px;line-height:1.85">
              <b>结果给你了（这就是成品，能直接复制走）：</b><br/>
              「今天把三件事干成了：① 把客户那版报价表核完，差两个数他补；② 公众号初稿写完了，标题还没定；
              ③ 跟人资对完下周面试名单。<br/>
              明天就三件：① 早上催客户补那两个数；② 定标题、发给设计排版；③ 面试名单确认到人到时间。」<br/><br/>
              <span class="muted small">它记住了：你做京东店群招商、要执行清单、不听客套话。下次直接说「理成三条」就行。</span>
            </div>
            <div class="row" style="margin-top:12px"><span class="badge gold">+25 RY</span>
              <span class="badge ok">成就解锁：第一次实操</span></div>
          ` : `<div class="row"><span class="typing-dots"><i></i><i></i><i></i></span>
              <span class="muted small">它正在写…</span></div>
            <button class="btn primary sm" id="quest-finish" style="margin-top:12px">看结果</button>`}
        </div>` : ''}
      <div class="ob-foot">
        <button class="btn primary lg" id="ob-next" ${obSel.questDone ? '' : 'disabled'}>继续 →</button>
        <button class="btn ghost lg" id="ob-back">返回</button>
      </div>`;
  }

  if (obStep === 3) {
    b.innerHTML = `${dots}
      <h2>你不止能问它这一件事</h2>
      <p class="sub">新手村通关。下面这些随时能在左边点开用</p>
      <div class="grid g2">
        ${[
          { em:'💬', t:'直接说人话', d:'不用学提示词，不用挑模型，说清楚要什么就行' },
          { em:'🧩', t:'智能体市场', d:'装一个它就多会一件事，装完随时能卸' },
          { em:'🧰', t:'技能市场', d:'21 个技能，碰到哪个用哪个，不会瞎调' },
          { em:'📋', t:'需求大厅', d:'任务=打怪、交付=通关，接单赚积分' },
          { em:'🏆', t:'成长中心', d:'签到、每日任务、成就、排行榜' },
          { em:'📊', t:'模型消耗', d:'你的调用量、Token、花费，随时对账' },
          { em:'🧠', t:'它记得住你', d:'换机器、换盘都能把记忆带走' }
        ].map(x => `<div class="card hover" style="display:flex;gap:12px;align-items:flex-start">
          <div class="mk-ico">${x.em}</div>
          <div><b style="font-size:13.5px">${x.t}</b><div class="small muted" style="margin-top:3px">${x.d}</div></div>
        </div>`).join('')}
      </div>
      <div class="ob-foot">
        <button class="btn gold lg" id="ob-done">进主界面 →</button>
        <button class="btn ghost lg" id="ob-back">返回</button>
      </div>`;
  }
  bindOnboard();
}

function bindOnboard() {
  document.querySelectorAll('[data-ident]').forEach(e => e.onclick = () => {
    obSel.ident = +e.dataset.ident; renderOnboard();
  });
  document.querySelectorAll('[data-tone]').forEach(e => e.onclick = () => {
    obSel.tone = +e.dataset.tone; renderOnboard();
  });
  document.querySelectorAll('[data-quest-pick]').forEach(e => e.onclick = () => {
    obSel.quest = +e.dataset.questPick; obSel.questDone = false; renderOnboard();
  });
  const fin = $('quest-finish');
  if (fin) fin.onclick = () => { obSel.questDone = true; S.points += 25; syncTop(); renderOnboard(); };
  const nx = $('ob-next');
  if (nx) nx.onclick = () => {
    if (obStep === 0) return transit(ONBOARD_IDENT[obSel.ident], 1);
    obStep++; renderOnboard();
  };
  const bk = $('ob-back');
  if (bk) bk.onclick = () => { obStep = Math.max(0, obStep - 1); renderOnboard(); };
  const sk = $('ob-skip');
  if (sk) sk.onclick = () => closeOnboard();
  const dn = $('ob-done');
  if (dn) dn.onclick = () => { addPoints(60, '通关新手村'); closeOnboard(); go('growth'); toast('🎮 新手村通关！+60 RY', true); };
}

/* 身份确认过渡动画 */
function transit(ident, nextStep) {
  const role = ROLES.find(r => r.id === ident.to) || ROLES[0];
  const t = $('transit');
  S.identity = ident.nm;
  t.innerHTML = `<div class="transit">
    <div class="spark-fx">${Array.from({ length: 18 }, (_, i) =>
      `<i style="left:${(i * 5.6 + Math.random() * 4).toFixed(1)}%;animation-delay:${(i * 0.17).toFixed(2)}s"></i>`).join('')}</div>
    <div class="tt">
      <div class="tring"><span>${role.em}</span></div>
      <h2>恭喜选择「${ident.nm}」身份</h2>
      <p>即将开启你的 ${role.nm} 之旅 · 已为你配好 ${role.skl.length} 个技能</p>
      <div class="row" style="justify-content:center;margin-top:18px">
        <span class="badge gold">+50 RY 见面礼</span><span class="badge">默认角色已切换</span></div>
    </div>
  </div>`;
  S.points += 50; S.roleId = role.id; syncTop();
  setTimeout(() => { t.innerHTML = ''; obStep = nextStep; renderOnboard(); }, 2200);
}

function closeOnboard() {
  $('ob').classList.add('hidden');
  S.onboarded = true;
  renderRail(); render();
}

/* ══════════ 事件绑定 ══════════ */
function bindView() {
  // 角色切换
  document.querySelectorAll('[data-role]').forEach(e => e.onclick = () => {
    S.roleId = e.dataset.role; S.msgs = []; render();
  });
  document.querySelectorAll('[data-role-card]').forEach(e => e.onclick = ev => {
    if (ev.target.dataset.use || ev.target.dataset.detail) return;
  });
  document.querySelectorAll('[data-use]').forEach(e => e.onclick = ev => {
    ev.stopPropagation(); S.roleId = e.dataset.use; S.msgs = []; toast('已切换角色，去对话'); go('chat');
  });
  document.querySelectorAll('[data-detail]').forEach(e => e.onclick = ev => {
    ev.stopPropagation();
    const r = ROLES.find(x => x.id === e.dataset.detail);
    toast(`${r.nm}：${r.duty.slice(0, 40)}…`);
  });

  // 快捷提问
  document.querySelectorAll('[data-q]').forEach(e => e.onclick = () => {
    const ta = $('in-msg'); if (ta) { ta.value = e.dataset.q; ta.focus(); }
  });

  // 发送
  const send = $('btn-send'), ta = $('in-msg');
  const doSend = () => {
    const v = (ta.value || '').trim(); if (!v) return;
    S.msgs.push({ who:'user', t:esc(v) });
    ta.value = '';
    const cur = ROLES.find(r => r.id === S.roleId);
    S.msgs.push({ who:'bot', t:`<b>先说结论：</b>这件事能办，分三步。<br/>1）先确认你要的结果长什么样（给谁看、什么时候要）；<br/>2）我按你的口径出第一版，缺的信息我标【待填】不编；<br/>3）你看完只要说改哪里，我改到你满意为止。<br/><span class="muted small">— ${cur.nm} ｜ 本次用了 1 段知识 · 2 条记忆 · 技能 cn-writing-polish</span>` });
    S.calls++; render();
    setTimeout(() => { const m = $('msgs'); if (m) m.scrollTop = m.scrollHeight; }, 30);
  };
  if (send) send.onclick = doSend;
  if (ta) ta.onkeydown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  // 安装
  document.querySelectorAll('[data-install]').forEach(e => e.onclick = () => {
    const kind = e.dataset.install;
    if (kind === 'agent') {
      const a = MK_AGENTS[+e.dataset.i];
      e.textContent = '已安装 ✓'; e.classList.remove('primary');
      toast(`🧩 已安装「${a.nm}」，去角色中心看它`);
    } else {
      const id = e.dataset.id, s = SKILLS.find(x => x.id === id);
      if (S.skillsOn.includes(id)) { toast('已经装过了'); return; }
      S.skillsOn.push(id);
      e.textContent = '已安装 ✓'; e.classList.remove('primary');
      addPoints(10, '装了个技能');
      toast(`🧰 装上「${s.nm}」 · +10 RY`);
    }
  });

  // 需求大厅
  document.querySelectorAll('[data-accept]').forEach(e => e.onclick = () => {
    const q = QUESTS[+e.dataset.accept];
    toast(`📋 接单成功：${q.t.slice(0, 16)}…（AI 交付中）`, true);
    setTimeout(() => toast(`✅ 交付完成，待你验收 · +${q.rw} RY`, true), 1400);
  });
  document.querySelectorAll('[data-quest]').forEach(e => e.onclick = () => toast('要求：AI 自动比对 Checklist 验收，不满意 3 天内可退'));

  // 成长中心
  document.querySelectorAll('[data-act]').forEach(e => e.onclick = () => {
    const a = e.dataset.act;
    if (a === 'sign') {
      if (S.signedToday) return;
      S.signedToday = true; S.streak++; addPoints(45, '每日签到');
      toast('🔥 签到成功！+45 RY，已连签 ' + S.streak + ' 天', true);
      render(); renderRail();
    } else if (a === 'task') {
      e.textContent = '✓'; e.classList.add('sm'); addPoints(25, '每日任务');
      toast('任务完成 · +25 RY');
    } else if (a === 'pick-ident') {
      openOnboard(0);
    }
  });

  // 设置
  const ob = $('set-ob'); if (ob) ob.onclick = () => openOnboard(0);
}

/* ══════════ 启动 ══════════ */
renderRail();
syncTop();
/* 支持 #roles / #growth 这类直链（方便截图、演示、分享单页） */
const __hash = (location.hash || '').replace('#', '');
if (__hash && TITLES[__hash]) { S.onboarded = true; go(__hash); }
else { render(); openOnboard(0); }
/* 手改地址栏 hash 也能切页（演示/截图/分享单页用） */
window.addEventListener('hashchange', () => {
  const h = (location.hash || '').replace('#', '');
  if (h && TITLES[h] && h !== S.view) {
    $('ob').classList.add('hidden'); S.onboarded = true; go(h);
  }
});
