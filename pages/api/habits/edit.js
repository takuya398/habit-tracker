const db = require('../_db')

export default async function handler(req, res){
  const { id } = req.query
  const authHeader = req.headers.authorization || ''
  const { verifyToken } = require('../../../lib/auth')
  const payload = verifyToken(authHeader)
  if(!payload) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'PUT'){
    try{
      const { name } = req.body
      if(!name || !name.trim()) return res.status(400).json({ error: 'name required' })
      
      const habit = await db.get('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, payload.id])
      if(!habit) return res.status(404).json({ error: 'not found' })
      
      await db.run('UPDATE habits SET name = ? WHERE id = ? AND user_id = ?', [name.trim(), id, payload.id])
      const updated = await db.get('SELECT * FROM habits WHERE id = ?', [id])
      
      res.status(200).json(updated)
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else{
    res.setHeader('Allow', ['PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
