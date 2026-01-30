const db = require('../_db')

export default async function handler(req, res){
  const { id } = req.query
  const authHeader = req.headers.authorization || ''
  const { verifyToken } = require('../../../lib/auth')
  const payload = verifyToken(authHeader)
  if(!payload) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'DELETE'){
    try{
      // ensure the habit belongs to the user
      const habit = await db.get('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, payload.id])
      if(!habit) return res.status(404).json({ error: 'not found' })
      
      // delete associated checkins first
      await db.run('DELETE FROM checkins WHERE habit_id = ?', [id])
      
      // then delete the habit
      await db.run('DELETE FROM habits WHERE id = ? AND user_id = ?', [id, payload.id])
      
      res.status(200).json({ ok: true })
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else{
    res.setHeader('Allow', ['DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
