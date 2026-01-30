const db = require('../_db')

export default async function handler(req, res){
  const authHeader = req.headers.authorization || ''
  const { verifyToken } = require('../../../lib/auth')
  const payload = verifyToken(authHeader)
  if(!payload) return res.status(401).json({ error: 'unauthorized' })

  if(req.method === 'GET'){
    const userId = payload.id
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    try {
      // すべての習慣を取得
      const habits = await db.all('SELECT id FROM habits WHERE user_id = ?', [userId])
      
      // 昨日のチェックインを取得
      const checkins = await db.all(
        `SELECT DISTINCT habit_id FROM checkins 
         WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?) 
         AND DATE(created_at) = ?`,
        [userId, yesterdayStr]
      )
      
      const checkedHabitIds = new Set(checkins.map(c => c.habit_id))
      
      // チェックインされていない習慣を取得
      const uncheckedHabits = habits
        .filter(h => !checkedHabitIds.has(h.id))
        .map(h => h.id)
      
      res.json({ uncheckedHabits })
    } catch(err){
      res.status(500).json({ error: err.message })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
