const db = require('../_db')

export default async function handler(req, res){
  const { id } = req.query
  const authHeader = req.headers.authorization || ''
  const { verifyToken } = require('../../../lib/auth')
  const payload = verifyToken(authHeader)
  if(!payload) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'DELETE'){
    try{
      // get the checkin and verify it belongs to a habit owned by the user
      const checkin = await db.get('SELECT c.* FROM checkins c JOIN habits h ON c.habit_id = h.id WHERE c.id = ? AND h.user_id = ?', [id, payload.id])
      if(!checkin) return res.status(404).json({ error: 'not found' })
      
      await db.run('DELETE FROM checkins WHERE id = ?', [id])
      res.status(200).json({ ok: true })
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else{
    res.setHeader('Allow', ['DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
