import { useState } from 'react'
import './App.css'

type ShortenResult = {
  code: string
  shortUrl: string
  originalUrl: string
}

function App() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<ShortenResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const r = await fetch('http://localhost:3001/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.error || '生成失败')
        return
      }
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '网络错误')
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!result) return
    await navigator.clipboard.writeText(result.shortUrl)
  }

  return (
    <main className="container">
      <h1>短链服务</h1>
      <p className="lead">输入长链接，生成短码 + 302 跳转（教学用）</p>

      <div className="row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very/long/path..."
        />
        <button onClick={submit} disabled={loading || !url}>
          {loading ? '生成中…' : '生成短链'}
        </button>
      </div>

      {error && <div className="error">⚠ {error}</div>}

      {result && (
        <div className="result">
          <div className="result-row">
            <span className="label">短码：</span>
            <code>{result.code}</code>
          </div>
          <div className="result-row">
            <span className="label">短链：</span>
            <a href={result.shortUrl} target="_blank" rel="noopener noreferrer">
              {result.shortUrl}
            </a>
          </div>
          <button className="copy" onClick={copyToClipboard}>
            📋 复制短链
          </button>
        </div>
      )}

      <footer>
        <small>后端 Express · 内存存储 · 重启清空 · W2 进行中</small>
      </footer>
    </main>
  )
}

export default App
