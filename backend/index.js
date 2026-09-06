// 短链服务核心 - Express
// 内存存储（重启清空） + 简单 302 跳转 + 访问计数
const express = require('express');
const cors = require('cors');
const { customAlphabet } = require('nanoid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 短码字母表（去掉易混字符）
const generateCode = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 6);

// 内存数据：code → { url, clicks }
const store = new Map();

// 健康检查
app.get('/health', (_, res) => res.json({ ok: true, store: store.size }));

// 创建短链
app.post('/api/shorten', (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url required' });
  }
  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'url must start with http(s)://' });
  }
  const code = generateCode();
  store.set(code, { url, clicks: 0 });
  res.json({ code, shortUrl: `http://localhost:${PORT}/r/${code}`, originalUrl: url });
});

// 跳转
app.get('/r/:code', (req, res) => {
  const entry = store.get(req.params.code);
  if (!entry) return res.status(404).send('Short link not found');
  entry.clicks += 1;
  res.redirect(302, entry.url);
});

// 列表（用于查 short code）
app.get('/api/list', (_, res) => {
  const out = [];
  for (const [code, v] of store.entries()) {
    out.push({ code, ...v });
  }
  res.json(out);
});

app.listen(PORT, () => {
  console.log(`shortener backend running on http://localhost:${PORT}`);
});
