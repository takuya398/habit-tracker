const db = require('../_db')
const bcrypt = require('bcryptjs')
const { sign } = require('../../../lib/auth')

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const { email, password } = req.body
    if(!email || !password) return res.status(400).json({ error: 'email and password required' })
    const hash = await bcrypt.hash(password, 10)
    const result = await db.run('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, datetime("now"))', [email, hash])
    const user = await db.get('SELECT id, email FROM users WHERE id = ?', [result.lastID])
    const token = sign(user)
    res.status(200).json({ token, user })
  }catch(e){
    if(e && e.message && e.message.includes('UNIQUE')) return res.status(400).json({ error: 'email already exists' })
    res.status(500).json({ error: e.message })
  }
}
