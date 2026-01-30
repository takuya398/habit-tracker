const db = require('../_db')

export default async function handler(req, res){
  const authHeader = req.headers.authorization || ''
  const { verifyToken } = require('../../../lib/auth')
  const payload = verifyToken(authHeader)
  if(!payload) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'GET'){
    try{
      const rows = await db.all('SELECT * FROM habits WHERE user_id = ? ORDER BY id DESC', [payload.id])
      res.status(200).json(rows)
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else if(req.method === 'POST'){
    try{
      const { name } = req.body
      if(!name) return res.status(400).json({ error: 'name required' })
      const result = await db.run('INSERT INTO habits (user_id, name, created_at) VALUES (?, ?, datetime("now"))', [payload.id, name])
      const habit = await db.get('SELECT * FROM habits WHERE id = ? AND user_id = ?', [result.lastID, payload.id])
      res.status(200).json(habit)
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else{
    res.setHeader('Allow', ['GET','POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
