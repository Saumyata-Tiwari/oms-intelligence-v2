import React,{useState,useEffect} from 'react';
import{login}from'../api';
import Otto from'./Otto';
interface LoginProps{onLogin:(t:string,r:string)=>void}
const Login:React.FC<LoginProps>=({onLogin})=>{
  const[un,setUn]=useState('');const[pw,setPw]=useState('');
  const[err,setErr]=useState('');const[load,setLoad]=useState(false);
  const[theme,setTheme]=useState<'light'|'dark'>('light');
  const[mounted,setMounted]=useState(false);
  const[showSignup,setShowSignup]=useState(false);
  useEffect(()=>{setMounted(true);const s=localStorage.getItem('theme') as 'light'|'dark';if(s){setTheme(s);document.documentElement.setAttribute('data-theme',s);}},[]); 
  const toggleTheme=()=>{const n=theme==='light'?'dark':'light';setTheme(n);localStorage.setItem('theme',n);document.documentElement.setAttribute('data-theme',n);};
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setLoad(true);setErr('');try{const r=await login(un,pw);onLogin(r.data.access_token,r.data.user.role);}catch{setErr('Invalid credentials. Please try again.');}finally{setLoad(false);}};
  const isDark=theme==='dark';
  return(
    <div style={{minHeight:'100vh',background:'var(--beige)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',position:'relative',overflow:'hidden'}}>
      <div className="orb orb-g" style={{width:'420px',height:'420px',top:'-100px',right:'-80px'}}/>
      <div className="orb orb-o" style={{width:'300px',height:'300px',bottom:'-80px',left:'-60px'}}/>

      {/* Theme toggle — top right, pill-shaped */}
      <div style={{position:'absolute',top:'18px',right:'22px',display:'flex',alignItems:'center',gap:'8px',zIndex:10,background:isDark?'rgba(50,48,28,0.85)':'rgba(253,250,224,0.85)',backdropFilter:'blur(12px)',border:`1px solid ${isDark?'rgba(204,213,174,0.2)':'rgba(70,55,30,0.14)'}`,borderRadius:'20px',padding:'5px 10px 5px 8px'}}>
        <span style={{fontSize:'13px',lineHeight:'1'}}>{isDark?'🌙':'☀️'}</span>
        <div onClick={toggleTheme} style={{width:'34px',height:'18px',background:isDark?'rgba(148,159,110,0.25)':'#E9EDCA',border:`1px solid ${isDark?'rgba(204,213,174,0.3)':'#CCD5AE'}`,borderRadius:'9px',cursor:'pointer',position:'relative',transition:'background 0.3s',flexShrink:0}}>
          <div style={{position:'absolute',width:'13px',height:'13px',background:'#949F6E',borderRadius:'50%',top:'2px',left:isDark?'18px':'2px',transition:'left 0.3s'}}/>
        </div>
      </div>

      <div style={{width:'100%',maxWidth:'860px',display:'flex',borderRadius:'20px',overflow:'visible',border:'2px solid var(--border2)',boxShadow:'0 20px 60px rgba(70,55,30,0.1)',opacity:mounted?1:0,transition:'opacity 0.4s',position:'relative',zIndex:1,minHeight:'440px'}}>
        {/* Left */}
        <div style={{flex:'1.1',padding:'32px',background:isDark?'linear-gradient(150deg,rgba(90,104,64,0.35),rgba(70,80,44,0.25))':'linear-gradient(150deg,rgba(204,213,174,0.5),rgba(148,159,110,0.3))',backdropFilter:'blur(20px)',display:'flex',flexDirection:'column',justifyContent:'space-between',borderRadius:'18px 0 0 18px',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',width:'180px',height:'180px',borderRadius:'50%',background:'rgba(255,255,255,0.08)',top:'-50px',right:'-30px',filter:'blur(28px)'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{marginBottom:'12px'}}><h1 style={{fontFamily:'var(--font-display)',fontSize:'32px',color:isDark?'#FDFAE0':'#1E1A14',lineHeight:'1.1',margin:0}}>OMS Intelligence</h1></div>
            <p style={{fontFamily:'var(--font-display)',fontSize:'15px',color:isDark?'#CCD5AE':'#5A6840',lineHeight:'1.4',marginBottom:'10px'}}>Orders, tracked.<br/><em>Intelligence, built in.</em></p>
            <p style={{fontSize:'13px',color:isDark?'rgba(220,215,200,0.65)':'rgba(30,26,20,0.6)',lineHeight:'1.7',marginBottom:'16px'}}>AI-powered omnichannel order management. Real-time SLA alerts, RAG intelligence, and smart automation.</p>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {['Shopify Live','RAG · AI','SLA Alerts','WhatsApp','N8N'].map(p=>(
                <span key={p} style={{padding:'3px 9px',borderRadius:'20px',border:`1px solid ${isDark?'rgba(204,213,174,0.2)':'rgba(30,26,20,0.18)'}`,fontSize:'11px',color:isDark?'rgba(204,213,174,0.7)':'rgba(30,26,20,0.65)',background:isDark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.22)',fontFamily:'var(--font-mono)'}}>{p}</span>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0px',position:'relative',zIndex:1,paddingTop:'8px'}}>
            <div style={{overflow:'visible',marginBottom:'-44px'}}><Otto mood="happy" size={110} floating={true}/></div>
            <span style={{fontFamily:'var(--font-display)',fontSize:'12px',color:isDark?'rgba(204,213,174,0.55)':'rgba(30,26,20,0.5)',fontStyle:'italic'}}>Hi! I'm Otto, your omnichannel buddy 🐙</span>
          </div>
        </div>
        {/* Right */}
        <div style={{flex:1,padding:'32px',background:isDark?'rgba(48,54,30,0.97)':'rgba(253,250,224,0.97)',backdropFilter:'blur(20px)',display:'flex',flexDirection:'column',justifyContent:'center',borderRadius:'0 18px 18px 0'}}>
          <h2 style={{fontFamily:'var(--font-display)',fontSize:'24px',color:'var(--text)',marginBottom:'4px'}}>{showSignup?'Create account':'Welcome back'}</h2>
          <p style={{fontSize:'13px',color:'var(--text3)',marginBottom:'24px'}}>{showSignup?'Sign up to get started':'Sign in to your workspace'}</p>
          {err&&<div style={{background:'rgba(176,80,32,0.1)',border:'1px solid rgba(176,80,32,0.25)',color:'var(--danger)',padding:'10px 14px',borderRadius:'10px',fontSize:'13px',marginBottom:'16px'}}>{err}</div>}
          <form onSubmit={submit}>
            <div style={{marginBottom:'14px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:500,color:'var(--text2)',marginBottom:'6px'}}>Username</label>
              <input type="text" value={un} onChange={e=>setUn(e.target.value)} className="input-field" placeholder="Enter your username" required/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block',fontSize:'12px',fontWeight:500,color:'var(--text2)',marginBottom:'6px'}}>Password</label>
              <input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="input-field" placeholder="Enter your password" required/>
            </div>
            <button type="submit" className="btn-primary" disabled={load} style={{width:'100%',padding:'13px',fontSize:'14px'}}>
              {load?<span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}><span style={{width:'14px',height:'14px',border:'2px solid rgba(253,250,224,0.3)',borderTopColor:'#FDFAE0',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite'}}/>{showSignup?'Creating...':'Signing in...'}</span>:(showSignup?'Create account →':'Sign in →')}
            </button>
          </form>
          <div style={{marginTop:'16px',textAlign:'center'}}>
            <span style={{fontSize:'13px',color:'var(--text3)',fontFamily:'var(--font-body)'}}>{showSignup?'Already have an account? ':'New here? '}</span>
            <button className="signup-link" onClick={()=>{setShowSignup(!showSignup);setErr('');}}>{showSignup?'Sign in':'Create account'}</button>
          </div>
          {!showSignup&&<div style={{marginTop:'16px',padding:'10px',background:'var(--m3)',borderRadius:'10px',textAlign:'center'}}><p style={{fontSize:'11px',color:'var(--mdark)',fontFamily:'var(--font-mono)'}}>demo: <strong>saumyata</strong> / <strong>password123</strong></p></div>}
        </div>
      </div>
    </div>
  );
};
export default Login;