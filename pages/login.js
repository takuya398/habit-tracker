import { useState } from 'react'
import { useRouter } from 'next/router'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()

  async function submit(e){
    e.preventDefault()
    const url = isRegister ? '/api/auth/register' : '/api/auth/login'
    const res = await fetch(url, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
    const data = await res.json()
    if(res.ok){
      localStorage.setItem('token', data.token)
      try{ localStorage.setItem('user', JSON.stringify(data.user || data.user)) }catch(e){}
      router.push('/')
    }else{
      alert(data.error || 'error')
    }
  }

  return (
    <main style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:'16px'
    }}>
      <div style={{
        backgroundColor:'white',
        borderRadius:'12px',
        boxShadow:'0 10px 40px rgba(0,0,0,0.2)',
        padding:'32px',
        width:'100%',
        maxWidth:'400px'
      }}>
        <h1 style={{fontSize:'28px',fontWeight:'bold',textAlign:'center',marginBottom:'24px',color:'#333'}}>
          {isRegister ? 'アカウント作成' : 'ログイン'}
        </h1>
        
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <input 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="メールアドレス" 
            type="email" 
            required 
            style={{padding:'12px',border:'1px solid #ddd',borderRadius:'6px'}}
          />
          <input 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            placeholder="パスワード" 
            type="password" 
            required 
            style={{padding:'12px',border:'1px solid #ddd',borderRadius:'6px'}}
          />
          
          <div style={{display:'flex',gap:'12px',paddingTop:'8px'}}>
            <button 
              type="submit"
              style={{
                flex:1,
                padding:'12px',
                backgroundColor:'#0066cc',
                color:'white',
                fontWeight:'bold',
                borderRadius:'6px'
              }}
            >
              {isRegister ? '登録' : 'ログイン'}
            </button>
            <button 
              type="button" 
              onClick={()=>setIsRegister(!isRegister)}
              style={{
                flex:1,
                padding:'12px',
                border:'1px solid #ddd',
                color:'#333',
                fontWeight:'bold',
                borderRadius:'6px',
                backgroundColor:'#f5f5f5'
              }}
            >
              {isRegister ? '既存アカウント' : '新規登録'}
            </button>
          </div>
        </form>
        
        <p style={{textAlign:'center',color:'#666',fontSize:'14px',marginTop:'24px'}}>
          {isRegister 
            ? 'アカウントをお持ちですか？ ' 
            : 'アカウントをお持ちでないですか？ '}
          <button 
            onClick={()=>setIsRegister(!isRegister)}
            style={{color:'#0066cc',fontWeight:'bold',background:'none',border:'none',cursor:'pointer'}}
          >
            {isRegister ? 'ログインする' : '登録する'}
          </button>
        </p>
      </div>
    </main>
  )
}
