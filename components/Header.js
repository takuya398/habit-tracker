import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header(){
  const [user, setUser] = useState(null)
  const [notificationEnabled, setNotificationEnabled] = useState(false)

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('user')
      if(raw) setUser(JSON.parse(raw))
    }catch(e){ setUser(null) }
  }, [])

  useEffect(() => {
    if(!user) return
    
    // 通知許可をリクエスト
    if('Notification' in window && Notification.permission === 'default'){
      Notification.requestPermission()
    }
    if('Notification' in window) {
      setNotificationEnabled(Notification.permission === 'granted')
    }

    // 1時間ごとに未チェック習慣をチェック
    const checkUncheckedHabits = async () => {
      const token = localStorage.getItem('token')
      if(!token) return
      
      try {
        const res = await fetch('/api/notifications/unchecked', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if(res.ok) {
          const data = await res.json()
          if(data.uncheckedHabits.length > 0) {
            const lastNotifyDate = localStorage.getItem('lastNotifyDate')
            const today = new Date().toISOString().split('T')[0]
            
            // 同じ日に1回だけ通知
            if(lastNotifyDate !== today && notificationEnabled) {
              new Notification('チェック漏れのお知らせ', {
                body: `昨日チェックインされていない習慣があります。今日もチェックしましょう！`,
                icon: '📅'
              })
              localStorage.setItem('lastNotifyDate', today)
            }
          }
        }
      } catch(err) {
        console.error('通知チェックエラー:', err)
      }
    }

    // ページロード時に1回チェック
    checkUncheckedHabits()
    
    // その後1時間ごとにチェック
    const interval = setInterval(checkUncheckedHabits, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user, notificationEnabled])

  function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <header style={{
      display:'flex',
      justifyContent:'space-between',
      alignItems:'center',
      padding:'16px',
      borderBottom:'2px solid #0066cc',
      backgroundColor:'#fff',
      marginBottom:'24px',
      boxShadow:'0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{fontSize:'24px',fontWeight:'bold',color:'#0066cc'}}>
        <Link href="/">Habit Tracker</Link>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        {user ? (
          <>
            <span style={{fontSize:'14px',color:'#666'}}>{user.email}</span>
            <button 
              onClick={logout}
              style={{backgroundColor:'#dc2626',color:'white',padding:'8px 16px'}}
            >
              ログアウト
            </button>
          </>
        ) : (
          <Link href="/login" style={{color:'#0066cc',fontWeight:'600'}}>
            ログイン / 登録
          </Link>
        )}
      </div>
    </header>
  )
}
