const db = require('../_db')

export default async function handler(req, res){
  const { id } = req.query
  const authHeader = req.headers.authorization || ''
  const { verifyToken } = require('../../../lib/auth')
  const payload = verifyToken(authHeader)
  if(!payload) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'GET'){
    try{
      // ensure the habit belongs to the user
      const habit = await db.get('SELECT * FROM habits WHERE id = ? AND user_id = ?', [id, payload.id])
      if(!habit) return res.status(404).json({ error: 'not found' })
      
      // get all checkins for this habit
      const checkins = await db.all('SELECT * FROM checkins WHERE habit_id = ? ORDER BY created_at DESC', [id])
      res.status(200).json(checkins)
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else{
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
