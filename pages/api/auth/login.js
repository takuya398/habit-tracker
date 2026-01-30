const db = require('../_db')
const bcrypt = require('bcryptjs')
const { sign } = require('../../../lib/auth')

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const { email, password } = req.body
    if(!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    if(!user) return res.status(400).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if(!ok) return res.status(400).json({ error: 'invalid credentials' })
    const payload = { id: user.id, email: user.email }
    const token = sign(payload)
    res.status(200).json({ token, user: payload })
  }catch(e){ res.status(500).json({ error: e.message }) }
}
