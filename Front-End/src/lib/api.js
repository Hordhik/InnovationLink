// Simple fetch wrapper for the frontend
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function parseJSON(res) {
    const text = await res.text()
    if (!text) return {}
    try { return JSON.parse(text) } catch { return { raw: text } }
}

export async function post(path, body) {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await parseJSON(res)
    if (!res.ok) {
        const msg = data?.message || data?.error || 'Request failed'
        throw new Error(msg)
    }
    return data
}
