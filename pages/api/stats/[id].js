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
      
      // total checkin count
      const totalRow = await db.get('SELECT COUNT(*) as count FROM checkins WHERE habit_id = ?', [id])
      const totalCount = totalRow.count
      
      // this month checkin count
      const thisMonthRow = await db.get(
        "SELECT COUNT(*) as count FROM checkins WHERE habit_id = ? AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
        [id]
      )
      const thisMonthCount = thisMonthRow.count
      
      // streak (consecutive days)
      const allCheckins = await db.all(
        "SELECT DISTINCT DATE(created_at) as date FROM checkins WHERE habit_id = ? ORDER BY date DESC",
        [id]
      )
      let streak = 0
      if(allCheckins.length > 0){
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        let checkDate = new Date(allCheckins[0].date)
        while(checkDate <= today){
          const dateStr = checkDate.toISOString().split('T')[0]
          const found = allCheckins.find(c => c.date === dateStr)
          if(!found) break
          streak++
          checkDate.setDate(checkDate.getDate() + 1)
        }
      }
      
      res.status(200).json({ totalCount, thisMonthCount, streak })
    }catch(e){ res.status(500).json({ error: e.message }) }
  }else{
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
