import { useEffect, useState } from 'react'

export default function Home(){
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [stats, setStats] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [expandedHabitId, setExpandedHabitId] = useState(null)
  const [checkins, setCheckins] = useState({}) // habit_id => stats

  async function load(){
    setLoading(true)
    const t = localStorage.getItem('token')
    setToken(t)
    const res = await fetch('/api/habits', { headers: t ? { Authorization: `Bearer ${t}` } : {} })
    const data = await res.json()
    if(!res.ok){
      setHabits([])
      if(res.status !== 401){
        console.error('Failed to load habits', data)
        alert(data.error || '習慣の読み込みに失敗しました')
      }
    }else{
      const habitsArray = Array.isArray(data) ? data : []
      setHabits(habitsArray)
      // load stats for each habit
      if(t && habitsArray.length > 0){
        const newStats = {}
        for(const h of habitsArray){
          const statsRes = await fetch(`/api/stats/${h.id}`, { headers: { Authorization: `Bearer ${t}` } })
          const statsData = await statsRes.json()
          if(statsRes.ok){
            newStats[h.id] = statsData
          }
        }
        setStats(newStats)
      }
    }
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  async function add(e){
    e.preventDefault()
    if(!name.trim()) return
    if(!token){ alert('ログインしてください'); return }
    await fetch('/api/habits', { method: 'POST', headers:{'Content-Type':'application/json','Authorization': `Bearer ${token}`}, body: JSON.stringify({ name }) })
    setName('')
    load()
  }

  async function deleteHabit(id, name){
    const confirmed = confirm(`「${name}」を削除しますか？チェックイン情報も同時に削除されます。`)
    if(!confirmed) return
    
    const t = localStorage.getItem('token')
    if(!t){ alert('ログインしてください'); return }
    const res = await fetch(`/api/habits/delete?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } })
    if(res.ok){
      alert('削除しました')
      load()
    }else{
      const data = await res.json()
      alert(data.error || '削除に失敗しました')
    }
  }

  async function startEdit(id, currentName){
    setEditingId(id)
    setEditingName(currentName)
  }

  async function saveEdit(id){
    if(!editingName.trim()) return alert('習慣名を入力してください')
    const t = localStorage.getItem('token')
    if(!t) return alert('ログインしてください')
    
    const res = await fetch(`/api/habits/edit?id=${id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ name: editingName })
    })
    if(res.ok){
      setEditingId(null)
      load()
    }else{
      const data = await res.json()
      alert(data.error || '更新に失敗しました')
    }
  }

  async function cancelEdit(){
    setEditingId(null)
    setEditingName('')
  }

  async function toggleCheckinList(id){
    if(expandedHabitId === id){
      setExpandedHabitId(null)
      return
    }
    setExpandedHabitId(id)
    const t = localStorage.getItem('token')
    if(!t) return
    const res = await fetch(`/api/checkins/list?id=${id}`, { headers: { Authorization: `Bearer ${t}` } })
    if(res.ok){
      const data = await res.json()
      setCheckins({...checkins, [id]: data})
    }
  }

  async function deleteCheckin(checkinId, habitId){
    const confirmed = confirm('このチェックインを削除しますか？')
    if(!confirmed) return
    const t = localStorage.getItem('token')
    if(!t) return alert('ログインしてください')
    const res = await fetch(`/api/checkins/delete?id=${checkinId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } })
    if(res.ok){
      // reload checkins and stats
      toggleCheckinList(habitId)
      load()
    }else{
      const data = await res.json()
      alert(data.error || '削除に失敗しました')
    }
  }

  async function checkin(id){
    const t = localStorage.getItem('token')
    if(!t){ alert('ログインしてください'); return }
    await fetch(`/api/habits/${id}/checkin`, { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
    alert('チェックインしました')
    load()
  }

  return (
    <main style={{maxWidth:'800px',margin:'0 auto',padding:'0 16px',fontFamily:'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'}}>
      <h1 style={{fontSize:'32px',fontWeight:'bold',color:'#333',marginBottom:'24px'}}>習慣トラッカー</h1>
      
      <form onSubmit={add} style={{display:'flex',gap:'12px',marginBottom:'32px'}}>
        <input 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          placeholder="習慣名を入力" 
          required 
          style={{flex:1}}
        />
        <button type="submit" style={{backgroundColor:'#0066cc',color:'white',padding:'8px 24px'}}>
          追加
        </button>
      </form>

      <div style={{display:'flex',gap:'12px',marginBottom:'24px'}}>
        <h2 style={{fontSize:'24px',fontWeight:'bold',color:'#333',margin:0,flex:1}}>習慣一覧</h2>
        <a href="/calendar" style={{backgroundColor:'#10b981',color:'white',padding:'10px 20px',borderRadius:'4px',textDecoration:'none',display:'flex',alignItems:'center',fontSize:'14px',fontWeight:'bold'}}>
          📅 カレンダービュー
        </a>
      </div>
      
      {loading ? (
        <p style={{color:'#999'}}>読み込み中…</p>
      ) : habits.length===0 ? (
        <div style={{textAlign:'center',padding:'48px 0'}}>
          <p style={{color:'#999',marginBottom:'16px'}}>習慣がありません。</p>
          {!token && <a href="/login" style={{color:'#0066cc'}}>ログイン / 登録</a>}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {habits.map(h=> {
            const s = stats[h.id] || {}
            const isEditing = editingId === h.id
            return (
              <div key={h.id} style={{
                padding:'16px',
                backgroundColor:'#fff',
                border:'1px solid #ddd',
                borderRadius:'8px',
                boxShadow:'0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{flex:1}}>
                    {isEditing ? (
                      <input 
                        value={editingName}
                        onChange={e=>setEditingName(e.target.value)}
                        autoFocus
                        style={{padding:'8px',borderRadius:'4px',border:'2px solid #0066cc',fontSize:'16px',fontWeight:'bold',width:'100%'}}
                      />
                    ) : (
                      <>
                        <div style={{fontWeight:'bold',fontSize:'16px',color:'#333'}}>{h.name}</div>
                        <div style={{fontSize:'13px',color:'#666',marginTop:'8px',display:'flex',gap:'16px'}}>
                          <span>今月: <span style={{fontWeight:'bold',color:'#0066cc'}}>{s.thisMonthCount || 0}回</span></span>
                          <span>連続: <span style={{fontWeight:'bold',color:'#16a34a'}}>{s.streak || 0}日</span></span>
                          <span>合計: <span style={{fontWeight:'bold',color:'#666'}}>{s.totalCount || 0}回</span></span>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{display:'flex',gap:'8px',marginLeft:'16px'}}>
                    {isEditing ? (
                      <>
                        <button 
                          onClick={()=>saveEdit(h.id)}
                          style={{backgroundColor:'#16a34a',color:'white',padding:'8px 12px',whiteSpace:'nowrap'}}
                        >
                          保存
                        </button>
                        <button 
                          onClick={cancelEdit}
                          style={{backgroundColor:'#6b7280',color:'white',padding:'8px 12px',whiteSpace:'nowrap'}}
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={()=>checkin(h.id)}
                          style={{backgroundColor:'#16a34a',color:'white',padding:'8px 16px',whiteSpace:'nowrap'}}
                        >
                          ✓ チェック
                        </button>
                        <button 
                          onClick={()=>startEdit(h.id,h.name)}
                          style={{backgroundColor:'#3b82f6',color:'white',padding:'8px 16px',whiteSpace:'nowrap'}}
                        >
                          編集
                        </button>
                        <button 
                          onClick={()=>deleteHabit(h.id,h.name)}
                          style={{backgroundColor:'#dc2626',color:'white',padding:'8px 16px',whiteSpace:'nowrap'}}
                        >
                          削除
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={()=>toggleCheckinList(h.id)}
                  style={{marginTop:'12px',backgroundColor:'#f3f4f6',color:'#374151',padding:'8px 12px',width:'100%',border:'1px solid #e5e7eb',borderRadius:'4px',cursor:'pointer'}}
                >
                  {expandedHabitId === h.id ? '▼ チェック履歴を隠す' : '▶ チェック履歴を表示'}
                </button>
                {expandedHabitId === h.id && checkins[h.id] && (
                  <div style={{marginTop:'12px',maxHeight:'300px',overflowY:'auto',backgroundColor:'#f9fafb',padding:'12px',borderRadius:'4px',border:'1px solid #e5e7eb'}}>
                    {checkins[h.id].length === 0 ? (
                      <p style={{color:'#999',fontSize:'14px'}}>チェック履歴がありません</p>
                    ) : (
                      <ul style={{listStyle:'none',margin:0,padding:0}}>
                        {checkins[h.id].map(c=>(
                          <li key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #e5e7eb',fontSize:'14px'}}>
                            <span>{new Date(c.created_at).toLocaleDateString('ja-JP')}</span>
                            <button
                              onClick={()=>deleteCheckin(c.id,h.id)}
                              style={{backgroundColor:'#fee2e2',color:'#dc2626',padding:'4px 8px',fontSize:'12px',border:'1px solid #fca5a5',borderRadius:'3px',cursor:'pointer'}}
                            >
                              削除
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
