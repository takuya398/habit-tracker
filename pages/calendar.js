import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Calendar(){
  const [token, setToken] = useState(null)
  const [habits, setHabits] = useState([])
  const [selectedHabitId, setSelectedHabitId] = useState(null)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [checkinsByDate, setCheckinsByDate] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if(!t) window.location.href = '/login'
    else setToken(t)
  }, [])

  useEffect(() => {
    if(token) load()
  }, [token])

  useEffect(() => {
    if(selectedHabitId && token) loadCheckins(selectedHabitId)
  }, [selectedHabitId, year, month])

  async function load(){
    setLoading(true)
    const t = localStorage.getItem('token')
    if(!t) return
    const res = await fetch('/api/habits', { headers: { Authorization: `Bearer ${t}` } })
    if(res.ok){
      const data = await res.json()
      setHabits(data)
      if(data.length > 0) setSelectedHabitId(data[0].id)
    }
    setLoading(false)
  }

  async function loadCheckins(habitId){
    setLoading(true)
    const t = localStorage.getItem('token')
    if(!t) return
    const res = await fetch(`/api/checkins/list?id=${habitId}`, { headers: { Authorization: `Bearer ${t}` } })
    if(res.ok){
      const data = await res.json()
      const byDate = {}
      data.forEach(c => {
        const dateStr = new Date(c.created_at).toISOString().split('T')[0]
        byDate[dateStr] = (byDate[dateStr] || 0) + 1
      })
      setCheckinsByDate(byDate)
    }
    setLoading(false)
  }

  function getDaysInMonth(y, m){
    return new Date(y, m + 1, 0).getDate()
  }

  function getFirstDayOfMonth(y, m){
    return new Date(y, m, 1).getDay()
  }

  function prevMonth(){
    if(month === 0){
      setYear(year - 1)
      setMonth(11)
    }else{
      setMonth(month - 1)
    }
  }

  function nextMonth(){
    if(month === 11){
      setYear(year + 1)
      setMonth(0)
    }else{
      setMonth(month + 1)
    }
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const days = []
  
  for(let i = 0; i < firstDay; i++) days.push(null)
  for(let i = 1; i <= daysInMonth; i++) days.push(i)

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <main style={{maxWidth:'1000px',margin:'0 auto',padding:'0 16px',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      <h1 style={{fontSize:'32px',fontWeight:'bold',color:'#333',marginBottom:'24px'}}>カレンダービュー</h1>
      
      <div style={{marginBottom:'24px',display:'flex',gap:'16px',alignItems:'center'}}>
        <label style={{fontWeight:'bold',color:'#333'}}>習慣を選択：</label>
        <select 
          value={selectedHabitId || ''} 
          onChange={e => setSelectedHabitId(parseInt(e.target.value))}
          style={{padding:'8px 12px',borderRadius:'4px',border:'1px solid #ddd',fontSize:'16px'}}
        >
          {habits.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      <div style={{backgroundColor:'#fff',borderRadius:'8px',padding:'24px',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
          <button 
            onClick={prevMonth}
            style={{backgroundColor:'#3b82f6',color:'white',padding:'8px 16px',borderRadius:'4px',border:'none',cursor:'pointer'}}
          >
            ← 前月
          </button>
          <h2 style={{fontSize:'24px',fontWeight:'bold',color:'#333'}}>
            {year}年 {monthNames[month]}
          </h2>
          <button 
            onClick={nextMonth}
            style={{backgroundColor:'#3b82f6',color:'white',padding:'8px 16px',borderRadius:'4px',border:'none',cursor:'pointer'}}
          >
            来月 →
          </button>
        </div>

        {loading ? (
          <p style={{textAlign:'center',color:'#999'}}>読み込み中…</p>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:'4px',marginBottom:'16px'}}>
              {weekDays.map(day => (
                <div key={day} style={{textAlign:'center',fontWeight:'bold',color:'#666',padding:'12px 0'}}>
                  {day}
                </div>
              ))}
            </div>
            
            <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',gap:'4px'}}>
              {days.map((day, idx) => {
                const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
                const count = day ? (checkinsByDate[dateStr] || 0) : 0
                const isToday = day && new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day
                
                return (
                  <div
                    key={idx}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      backgroundColor: day ? (isToday ? '#e0f2fe' : '#f9fafb') : 'transparent',
                      border: day ? (isToday ? '2px solid #0284c7' : '1px solid #e5e7eb') : 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: day ? 'bold' : 'normal',
                      color: day ? '#333' : 'transparent',
                      cursor: day ? 'default' : 'default'
                    }}
                  >
                    {day && (
                      <>
                        <div style={{fontSize:'16px'}}>{day}</div>
                        {count > 0 && (
                          <div style={{
                            marginTop: '4px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {count}回
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{marginTop:'24px',padding:'16px',backgroundColor:'#f3f4f6',borderRadius:'4px',fontSize:'14px',color:'#666'}}>
              <p style={{margin:'0 0 8px 0'}}>📊 凡例：</p>
              <ul style={{margin:0,paddingLeft:'20px'}}>
                <li>各セルは1日を表します</li>
                <li>緑色の数字は、その日のチェックイン回数を表します</li>
                <li>水色の枠線は本日を表します</li>
              </ul>
            </div>
          </>
        )}
      </div>

      <div style={{marginTop:'24px',textAlign:'center'}}>
        <a href="/" style={{color:'#0066cc',textDecoration:'none'}}>ダッシュボードに戻る</a>
      </div>
    </main>
  )
}
