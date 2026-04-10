import React,{useState,useEffect} from 'react';
import Chat from'./Chat';
import Analytics from'./Analytics';
import Orders from'./Orders';
import{getAnalyticsSummary}from'../api';

const DashboardTab:React.FC<{isDark:boolean;cardBg:string;bC:string;textC:string;mutedC:string;role:any;setActiveTab:(t:string)=>void}>=({isDark,cardBg,bC,textC,mutedC,role,setActiveTab})=>{
  const[sum,setSum]=useState<any>(null);
  useEffect(()=>{getAnalyticsSummary('7d').then(r=>setSum(r.data)).catch(()=>{});},[]);
  const kpis=[
    {icon:'📦',label:'Total Orders',value:sum?.total_orders??0,color:'#949F6E'},
    {icon:'💰',label:'Revenue',value:`₹${(sum?.revenue||0).toLocaleString('en-IN')}`,color:'#C8784A'},
    {icon:'⚠️',label:'SLA Breached',value:sum?.sla_breached??0,color:'#B05020'},
    {icon:'🚨',label:'Escalations',value:sum?.escalations??0,color:'#C8784A'},
    {icon:'💬',label:'Chat Sessions',value:sum?.total_sessions??0,color:isDark?'#CCD5AE':'#5A6840'},
    {icon:'😊',label:'Avg Sentiment',value:(sum?.avg_sentiment||0).toFixed(2),color:'#949F6E'},
  ];
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',gap:'14px',overflow:'auto',minHeight:0}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:'var(--font-display)',fontSize:'20px',color:textC}}>Good {new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}, {role.label} 👋</div>
          <div style={{fontSize:'12px',color:mutedC,marginTop:'2px'}}>Here's your operations overview</div>
        </div>
        <div style={{fontSize:'11px',color:mutedC,fontFamily:'var(--font-mono)'}}>{new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',flexShrink:0}}>
        {kpis.map((k,i)=>(
          <div key={i} style={{background:cardBg,border:`1.5px solid ${bC}`,borderRadius:'14px',padding:'16px'}}>
            <div style={{fontSize:'18px',marginBottom:'8px'}}>{k.icon}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'26px',color:k.color}}>{k.value}</div>
            <div style={{fontSize:'11px',color:mutedC,marginTop:'4px'}}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',flex:1}}>
        <div style={{background:cardBg,border:`1.5px solid ${bC}`,borderRadius:'14px',padding:'18px',display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{fontSize:'13px',fontWeight:600,color:textC,fontFamily:'var(--font-display)'}}>Quick Actions</div>
          {[{icon:'💬',label:'Open Chat with Otto',tab:'chat'},{icon:'📦',label:'View All Orders',tab:'orders'},{icon:'📊',label:'View Analytics',tab:'analytics'}].map((a,i)=>(
            <button key={i} onClick={()=>setActiveTab(a.tab)} style={{background:isDark?'rgba(148,159,110,0.15)':'rgba(148,159,110,0.12)',border:`1px solid ${bC}`,borderRadius:'8px',padding:'9px 14px',fontSize:'12px',color:isDark?'#CCD5AE':'#5A6840',cursor:'pointer',textAlign:'left',fontFamily:'var(--font-body)'}}>{a.icon} {a.label}</button>
          ))}
        </div>
        <div style={{background:cardBg,border:`1.5px solid ${bC}`,borderRadius:'14px',padding:'18px',display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{fontSize:'13px',fontWeight:600,color:textC,fontFamily:'var(--font-display)'}}>SLA Status</div>
          {[
            {label:'On Time',value:sum?.sla_on_time??0,color:isDark?'#CCD5AE':'#5A6840',bg:isDark?'rgba(148,159,110,0.15)':'rgba(148,159,110,0.12)'},
            {label:'At Risk',value:sum?.sla_at_risk??0,color:'#C8784A',bg:'rgba(200,120,74,0.14)'},
            {label:'Breached',value:sum?.sla_breached??0,color:'#B05020',bg:'rgba(176,80,32,0.12)'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:s.bg,borderRadius:'8px'}}>
              <span style={{fontSize:'12px',color:mutedC}}>{s.label}</span>
              <span style={{fontSize:'13px',fontWeight:600,color:s.color}}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DashboardProps{userRole:string;onLogout:()=>void}
const roleConfig:any={
  store_associate:{label:'Store Associate',color:'#2E7D32',bg:'rgba(46,125,50,0.12)'},
  fulfillment_manager:{label:'Fulfillment Mgr',color:'#A0521A',bg:'rgba(160,82,26,0.12)'},
  ops_lead:{label:'Ops Lead',color:'#5A6840',bg:'rgba(90,104,64,0.12)'},
  admin:{label:'Admin',color:'#8B1A1A',bg:'rgba(139,26,26,0.12)'},
};
const tabs=[{id:'dashboard',label:'Dashboard'},{id:'chat',label:'Chat'},{id:'orders',label:'Orders'},{id:'analytics',label:'Analytics'}];

const Dashboard:React.FC<DashboardProps>=({userRole:initRole,onLogout})=>{
  const[activeTab,setActiveTab]=useState('dashboard');
  const[theme,setTheme]=useState<'light'|'dark'>('light');
  const[userRole,setUserRole]=useState(initRole);
  const[showRoles,setShowRoles]=useState(false);
  const role=roleConfig[userRole]||roleConfig['ops_lead'];

  useEffect(()=>{
    const s=localStorage.getItem('theme') as 'light'|'dark';
    if(s){setTheme(s);document.documentElement.setAttribute('data-theme',s);}
  },[]);

  const toggleTheme=()=>{
    const n=theme==='light'?'dark':'light';
    setTheme(n);localStorage.setItem('theme',n);
    document.documentElement.setAttribute('data-theme',n);
  };

  const isDark=theme==='dark';

  // Inline theme values — bypass CSS variable loading issues
  const bg=isDark?'#2E2D1A':'#FDFAE0';
  const hBg=isDark?'#1A1A0E':'rgba(240,237,215,0.99)';
  const bC=isDark?'rgba(204,213,174,0.2)':'rgba(70,55,30,0.12)';
  const textC=isDark?'#FDFAE0':'#1E1A14';
  const mutedC=isDark?'#8A8E6A':'#8A7E6C';
  const cardBg=isDark?'rgba(50,48,28,0.95)':'rgba(253,250,224,0.9)';

  return(
    <div style={{position:'fixed',inset:0,background:bg,transition:'background 0.3s'}}>
      {/* orbs */}
      <div style={{position:'absolute',width:'500px',height:'500px',top:'-150px',right:'-100px',borderRadius:'50%',background:isDark?'rgba(120,130,80,0.12)':'rgba(148,159,110,0.18)',filter:'blur(60px)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'absolute',width:'380px',height:'380px',bottom:'-120px',left:'-80px',borderRadius:'50%',background:'rgba(200,120,74,0.1)',filter:'blur(55px)',pointerEvents:'none',zIndex:0}}/>

      {/* HEADER — fixed, always on top */}
      <header style={{position:'fixed',top:0,left:0,right:0,background:hBg,borderBottom:`2px solid ${isDark?'rgba(148,159,110,0.4)':'rgba(148,159,110,0.25)'}`,zIndex:200,overflow:'visible'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',height:'60px',padding:'0 24px',overflow:'visible'}}>

          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',overflow:'visible'}}>
            <div style={{animation:'ottoFloat 3.5s ease-in-out infinite',display:'inline-block',overflow:'visible',flexShrink:0}}>
              <svg width="110" height="60" viewBox="-25 -15 160 115" fill="none" overflow="visible" style={{display:'block'}}>
                <g style={{animation:'tentA 2s ease-in-out infinite',transformOrigin:'15px 52px'}}><path d="M15 52 Q2 60 -1 72" stroke="#A3B893" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2s ease-in-out infinite'}}><circle cx="-2" cy="79" r="8" fill="#96BF48"/><rect x="-7" y="75" width="10" height="7" rx="1.5" fill="white"/></g>
                <g style={{animation:'tentB 2.2s ease-in-out infinite',transformOrigin:'25px 54px'}}><path d="M25 54 Q16 63 15 73" stroke="#C0D6B0" strokeWidth="3.5" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2.2s ease-in-out infinite 0.15s'}}><circle cx="14" cy="80" r="7" fill="#25D366"/></g>
                <g style={{animation:'tentC 2.4s ease-in-out infinite',transformOrigin:'36px 55px'}}><path d="M36 55 Q32 64 31 73" stroke="#A3B893" strokeWidth="3" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2.4s ease-in-out infinite 0.25s'}}><circle cx="30" cy="79" r="6.5" fill="#EA4335"/><rect x="25" y="75" width="10" height="7" rx="1" fill="white"/><path d="M25 75 L30 79 L35 75" stroke="#EA4335" strokeWidth="0.8" fill="none"/></g>
                <g style={{animation:'tentD 2.2s ease-in-out infinite',transformOrigin:'45px 56px'}}><path d="M45 56 Q44 65 44 73" stroke="#C0D6B0" strokeWidth="3" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2.2s ease-in-out infinite 0.35s'}}><circle cx="44" cy="79" r="6" fill="#EA4B35"/><text x="44" y="82" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">n8n</text></g>
                <g style={{animation:'tentA 2.2s ease-in-out infinite',transformOrigin:'55px 56px'}}><path d="M55 56 Q56 65 56 73" stroke="#C0D6B0" strokeWidth="3" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2.2s ease-in-out infinite 0.4s'}}><circle cx="56" cy="79" r="6" fill="#949F6E"/><path d="M52 82 L54 80 L56 81 L58 78 L60 80" stroke="white" strokeWidth="0.8" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'tentB 2.4s ease-in-out infinite',transformOrigin:'64px 55px'}}><path d="M64 55 Q68 64 69 73" stroke="#A3B893" strokeWidth="3" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2.4s ease-in-out infinite 0.3s'}}><circle cx="70" cy="79" r="6.5" fill="#F22F46"/><rect x="65" y="75" width="10" height="7" rx="1" fill="white"/><line x1="66" y1="77" x2="74" y2="77" stroke="#F22F46" strokeWidth="0.8"/></g>
                <g style={{animation:'tentC 2.2s ease-in-out infinite',transformOrigin:'75px 54px'}}><path d="M75 54 Q84 63 85 73" stroke="#C0D6B0" strokeWidth="3.5" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2.2s ease-in-out infinite 0.15s'}}><circle cx="86" cy="80" r="7" fill="#4A154B"/><line x1="81" y1="77" x2="91" y2="77" stroke="white" strokeWidth="1.2" strokeLinecap="round"/><line x1="81" y1="81" x2="89" y2="81" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></g>
                <g style={{animation:'tentD 2s ease-in-out infinite',transformOrigin:'85px 52px'}}><path d="M85 52 Q98 60 101 72" stroke="#A3B893" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
                <g style={{animation:'lf 2s ease-in-out infinite 0.05s'}}><circle cx="102" cy="79" r="8" fill="#FF4A00"/><text x="102" y="82" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">zap</text></g>
                <ellipse cx="50" cy="32" rx="30" ry="32" fill="#8BAE3C"/>
                <ellipse cx="50" cy="35" rx="24" ry="26" fill="#A8C45A"/>
                <circle cx="38" cy="26" r="10" fill="white" stroke="#E9EDCA" strokeWidth="1.5"/>
                <circle cx="62" cy="26" r="10" fill="white" stroke="#E9EDCA" strokeWidth="1.5"/>
                <g style={{animation:'ottoPupilRoll 5s ease-in-out infinite'}}>
                  <circle cx="38" cy="26" r="7" fill="#1E1A14"/>
                  <circle cx="62" cy="26" r="7" fill="#1E1A14"/>
                  <circle cx="35" cy="23" r="2.5" fill="white"/>
                  <circle cx="59" cy="23" r="2.5" fill="white"/>
                </g>
                <ellipse cx="28" cy="40" rx="6" ry="3.5" fill="#C8784A" opacity="0.2"/>
                <ellipse cx="72" cy="40" rx="6" ry="3.5" fill="#C8784A" opacity="0.2"/>
                <path d="M41 46 Q50 52 59 46" stroke="#3D5A14" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <rect x="33" y="2" width="34" height="6" rx="3" fill="#3D5A14"/>
                <rect x="37" y="-6" width="26" height="12" rx="4" fill="#3D5A14"/>
                <rect x="38" y="-5" width="24" height="3" rx="1.5" fill="#6B9428" opacity="0.4"/>
              </svg>
            </div>
            <span style={{fontFamily:'var(--font-display)',fontSize:'21px',color:textC,letterSpacing:'-0.3px',whiteSpace:'nowrap',marginLeft:'-4px'}}>OMS Intelligence</span>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#949F6E',boxShadow:`0 0 0 3px ${isDark?'rgba(148,159,110,0.25)':'#E9EDCA'}`}}/>
              <span style={{fontSize:'11px',color:isDark?'#A8B87E':'#5A6840',fontFamily:'var(--font-mono)'}}>live</span>
            </div>
            <div style={{position:'relative'}}>
              <button onClick={()=>setShowRoles(!showRoles)} style={{fontSize:'11px',padding:'4px 11px',borderRadius:'20px',border:`1.5px solid ${isDark?'rgba(204,213,174,0.25)':'#CCD5AE'}`,color:role.color,background:isDark?'rgba(148,159,110,0.12)':role.bg,fontFamily:'var(--font-mono)',cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}>
                {role.label}<span style={{fontSize:'9px'}}>▾</span>
              </button>
              {showRoles&&(
                <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:isDark?'#2E2D1A':'#FDFAE0',border:`1.5px solid ${bC}`,borderRadius:'12px',padding:'6px',zIndex:200,minWidth:'185px',boxShadow:'0 8px 24px rgba(70,55,30,0.14)'}}>
                  {Object.entries(roleConfig).map(([k,v]:any)=>(
                    <button key={k} onClick={()=>{setUserRole(k);setShowRoles(false);}} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',borderRadius:'8px',border:'none',background:userRole===k?v.bg:'transparent',color:userRole===k?v.color:mutedC,fontSize:'12px',fontFamily:'var(--font-body)',cursor:'pointer'}}>
                      {v.label}{userRole===k&&<span style={{float:'right',fontSize:'10px'}}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'7px',background:isDark?'rgba(50,48,28,0.85)':'rgba(253,250,224,0.88)',border:`1px solid ${isDark?'rgba(204,213,174,0.2)':'rgba(70,55,30,0.14)'}`,borderRadius:'20px',padding:'4px 10px 4px 8px'}}>
              <span style={{fontSize:'13px',lineHeight:'1'}}>{isDark?'🌙':'☀️'}</span>
              <div onClick={toggleTheme} style={{width:'34px',height:'18px',background:isDark?'rgba(148,159,110,0.25)':'#E9EDCA',border:`1px solid ${isDark?'rgba(204,213,174,0.3)':'#CCD5AE'}`,borderRadius:'9px',cursor:'pointer',position:'relative',transition:'background 0.3s',flexShrink:0}}>
                <div style={{position:'absolute',width:'13px',height:'13px',background:'#949F6E',borderRadius:'50%',top:'2px',left:isDark?'18px':'2px',transition:'left 0.3s'}}/>
              </div>
            </div>
            <button onClick={onLogout} style={{background:'transparent',border:`1.5px solid ${bC}`,color:mutedC,borderRadius:'8px',padding:'6px 14px',fontFamily:'var(--font-body)',fontSize:'12px',cursor:'pointer'}}>Sign out</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'2px',padding:'0 24px'}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:'10px 20px',fontFamily:'var(--font-body)',fontSize:'13px',fontWeight:500,cursor:'pointer',border:'none',background:'transparent',color:activeTab===t.id?(isDark?'#CCD5AE':'#5A6840'):mutedC,borderBottom:`2px solid ${activeTab===t.id?'#949F6E':'transparent'}`,transition:'color 0.2s,border-color 0.2s'}}>{t.label}</button>
          ))}
        </div>
      </header>

      {/* MAIN — fixed below header */}
      <main style={{position:'fixed',top:'102px',left:0,right:0,bottom:0,overflow:'hidden',padding:'16px 20px',zIndex:1,display:'flex',flexDirection:'column',minHeight:0,boxSizing:'border-box'}}>
        {activeTab==='dashboard'&&(
          <DashboardTab isDark={isDark} cardBg={cardBg} bC={bC} textC={textC} mutedC={mutedC} role={role} setActiveTab={setActiveTab}/>
        )}
        {activeTab==='chat'&&<Chat userRole={userRole} isDark={isDark} cardBg={cardBg}/>}
        {activeTab==='orders'&&<Orders isDark={isDark} cardBg={cardBg}/>}
        {activeTab==='analytics'&&<Analytics isDark={isDark} cardBg={cardBg}/>}
      </main>

      {showRoles&&<div onClick={()=>setShowRoles(false)} style={{position:'fixed',inset:0,zIndex:99}}/>}
      <style>{`
        @keyframes ottoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes ottoPupilRoll{0%,10%{transform:translate(0,0)}20%{transform:translate(4px,0)}40%{transform:translate(4px,4px)}60%{transform:translate(-4px,2px)}80%{transform:translate(-4px,-2px)}95%,100%{transform:translate(0,0)}}
        @keyframes tentA{0%,100%{transform:rotate(0deg)}50%{transform:rotate(12deg)}}
        @keyframes tentB{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-12deg)}}
        @keyframes tentC{0%,100%{transform:rotate(0deg)}50%{transform:rotate(9deg)}}
        @keyframes tentD{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-9deg)}}
        @keyframes lf{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes bounceDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}
        @keyframes msgSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        body,#root{margin:0;padding:0;width:100%;height:100%}
      `}</style>
    </div>
  );
};
export default Dashboard;