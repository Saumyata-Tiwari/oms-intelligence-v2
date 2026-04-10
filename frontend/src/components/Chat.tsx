import React,{useState,useRef,useEffect} from 'react';
import{sendMessage}from'../api';
import Otto from'./Otto';
interface Message{role:'user'|'assistant';content:string;timestamp:string;sentiment?:number}
const SUGG=["Show me today's orders summary","Which orders are at SLA risk?","What's the fulfillment rate this week?","Show sentiment trends"];
const Chat:React.FC<{userRole:string;isDark?:boolean;cardBg?:string}>=({userRole,isDark=false,cardBg})=>{
  const[msgs,setMsgs]=useState<Message[]>([]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const bottomRef=useRef<HTMLDivElement>(null);
  const textareaRef=useRef<HTMLTextAreaElement>(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[msgs,loading]);
  const send=async(text:string)=>{
    if(!text.trim()||loading)return;
    const ts=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    setMsgs(p=>[...p,{role:'user',content:text,timestamp:ts}]);
    setInput('');setLoading(true);
    if(textareaRef.current)textareaRef.current.style.height='auto';
    try{
      const r=await sendMessage(text,userRole);
      setMsgs(p=>[...p,{role:'assistant',content:r.data.response,timestamp:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),sentiment:r.data.sentiment_score}]);
    }catch{
      setMsgs(p=>[...p,{role:'assistant',content:'Oops! Something went wrong. Please try again.',timestamp:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}]);
    }finally{setLoading(false);}
  };
  const handleKey=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send(input);}};
  const handleInput=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{setInput(e.target.value);e.target.style.height='auto';e.target.style.height=Math.min(e.target.scrollHeight,120)+'px';};
  const getMood=(s?:number)=>{if(!s)return'default';if(s>0.3)return'happy';if(s<-0.3)return'alert';return'default';};
  const card=cardBg||(isDark?'rgba(50,48,28,0.95)':'rgba(253,250,224,0.9)');
  const border=isDark?'rgba(204,213,174,0.12)':'rgba(70,55,30,0.11)';
  const text=isDark?'#FDFAE0':'#1E1A14';
  const muted=isDark?'#8A8E6A':'#8A7E6C';
  const inputBg=isDark?'rgba(58,56,32,0.95)':'#F5F0D0';
  const inputBorder=isDark?'rgba(204,213,174,0.25)':'#CCD5AE';
  const loaderBg=isDark?'rgba(42,41,24,0.9)':'rgba(249,246,228,0.9)';
  const aiBubble=isDark?'rgba(148,159,110,0.14)':'rgba(204,213,174,0.35)';
  const aiBorder=isDark?'rgba(204,213,174,0.2)':'#E9EDCA';

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',gap:'10px',minHeight:0,position:'relative'}}>
      {/* LOADER */}
      {loading&&(
        <div style={{position:'fixed',inset:0,zIndex:999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:0,background:loaderBg,backdropFilter:'blur(8px)'}}>
          <svg width="300" height="275" viewBox="-25 -15 150 140" fill="none" overflow="visible" style={{display:'block'}}>
            <g style={{animation:'tentA 1.8s ease-in-out infinite',transformOrigin:'15px 52px'}}><path d="M15 52 Q2 62 -1 76" stroke="#A3B893" strokeWidth="4.5" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 1.8s ease-in-out infinite'}}><circle cx="-2" cy="84" r="9" fill="#96BF48"/><text x="-2" y="87" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">SH</text></g>
            <g style={{animation:'tentB 2s ease-in-out infinite',transformOrigin:'25px 54px'}}><path d="M25 54 Q15 65 14 77" stroke="#C0D6B0" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 2s ease-in-out infinite 0.15s'}}><circle cx="13" cy="85" r="8.5" fill="#25D366"/><text x="13" y="88" textAnchor="middle" fontSize="6.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">WA</text></g>
            <g style={{animation:'tentC 2.2s ease-in-out infinite',transformOrigin:'36px 56px'}}><path d="M36 56 Q31 67 30 78" stroke="#A3B893" strokeWidth="3.5" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 2.2s ease-in-out infinite 0.25s'}}><circle cx="29" cy="86" r="8" fill="#EA4335"/><text x="29" y="89" textAnchor="middle" fontSize="6" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">GM</text></g>
            <g style={{animation:'tentD 2s ease-in-out infinite',transformOrigin:'46px 57px'}}><path d="M46 57 Q45 68 45 78" stroke="#C0D6B0" strokeWidth="3.5" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 2s ease-in-out infinite 0.35s'}}><circle cx="45" cy="86" r="8" fill="#EA4B35"/><text x="45" y="89" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">n8n</text></g>
            <g style={{animation:'tentA 2s ease-in-out infinite',transformOrigin:'54px 57px'}}><path d="M54 57 Q55 68 55 78" stroke="#C0D6B0" strokeWidth="3.5" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 2s ease-in-out infinite 0.4s'}}><circle cx="55" cy="86" r="8" fill="#949F6E"/><text x="55" y="89" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">AN</text></g>
            <g style={{animation:'tentB 2.2s ease-in-out infinite',transformOrigin:'64px 56px'}}><path d="M64 56 Q69 67 70 78" stroke="#A3B893" strokeWidth="3.5" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 2.2s ease-in-out infinite 0.25s'}}><circle cx="71" cy="86" r="8" fill="#F22F46"/><text x="71" y="89" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">TW</text></g>
            <g style={{animation:'tentC 2s ease-in-out infinite',transformOrigin:'75px 54px'}}><path d="M75 54 Q85 65 86 77" stroke="#C0D6B0" strokeWidth="4" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 2s ease-in-out infinite 0.15s'}}><circle cx="87" cy="85" r="8.5" fill="#4A154B"/><text x="87" y="88" textAnchor="middle" fontSize="6" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">SL</text></g>
            <g style={{animation:'tentD 1.8s ease-in-out infinite',transformOrigin:'85px 52px'}}><path d="M85 52 Q99 62 103 76" stroke="#A3B893" strokeWidth="4.5" fill="none" strokeLinecap="round"/></g>
            <g style={{animation:'lf 1.8s ease-in-out infinite 0.05s'}}><circle cx="104" cy="84" r="9" fill="#FF4A00"/><text x="104" y="87" textAnchor="middle" fontSize="5.5" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">ZAP</text></g>
            <ellipse cx="50" cy="32" rx="36" ry="38" fill="#8BAE3C"/>
            <ellipse cx="50" cy="36" rx="30" ry="32" fill="#A8C45A"/>
            <circle cx="36" cy="24" r="13" fill="white" stroke="#E9EDCA" strokeWidth="2"/>
            <circle cx="64" cy="24" r="13" fill="white" stroke="#E9EDCA" strokeWidth="2"/>
            <g style={{animation:'ottoPupilRoll 2.5s ease-in-out infinite'}}>
              <circle cx="36" cy="24" r="9" fill="#1E1A14"/>
              <circle cx="64" cy="24" r="9" fill="#1E1A14"/>
              <circle cx="33" cy="21" r="3.5" fill="white"/>
              <circle cx="61" cy="21" r="3.5" fill="white"/>
            </g>
            <ellipse cx="24" cy="42" rx="9" ry="5" fill="#C8784A" opacity="0.2"/>
            <ellipse cx="76" cy="42" rx="9" ry="5" fill="#C8784A" opacity="0.2"/>
            <path d="M40 52 Q50 58 60 52" stroke="#3D5A14" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <rect x="28" y="0" width="44" height="8" rx="4" fill="#3D5A14"/>
            <rect x="33" y="-10" width="34" height="15" rx="5" fill="#3D5A14"/>
            <rect x="34" y="-9" width="32" height="4" rx="2" fill="#6B9428" opacity="0.4"/>
          </svg>
          <div style={{display:'flex',gap:'7px',marginTop:'4px'}}>
            {[0,1,2].map(i=><div key={i} style={{width:'10px',height:'10px',borderRadius:'50%',background:'#949F6E',animation:'bounceDot 1.2s ease infinite',animationDelay:`${i*0.2}s`}}/>)}
          </div>
          <p style={{fontSize:'14px',color:isDark?'#CCD5AE':'#5A6840',fontFamily:'var(--font-display)',fontStyle:'italic',marginTop:'8px'}}>Otto is scanning all channels...</p>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{flex:1,overflowY:'auto',padding:'18px',display:'flex',flexDirection:'column',gap:'16px',minHeight:0,background:card,backdropFilter:'blur(20px)',border:`1.5px solid ${border}`,borderRadius:'16px'}}>
        {msgs.length===0&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:'8px',opacity:0.5}}>
            <div style={{overflow:'visible'}}><Otto mood="default" size={80} floating={true}/></div>
            <p style={{fontSize:'13px',color:muted,fontFamily:'var(--font-display)',fontStyle:'italic'}}>Ask Otto anything about your orders 🐙</p>
          </div>
        )}
        {msgs.map((msg,i)=>(
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:msg.role==='user'?'flex-end':'flex-start',animation:'msgSlideIn 0.3s ease forwards',opacity:0,animationDelay:`${Math.min(i*0.03,0.2)}s`}}>
            {msg.role==='assistant'&&(
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px',overflow:'visible'}}>
                <div style={{overflow:'visible',marginBottom:'-14px',marginLeft:'-11px',marginRight:'-11px'}}><Otto mood={getMood(msg.sentiment) as any} size={32} floating={false}/></div>
                <span style={{fontSize:'12px',fontWeight:600,color:isDark?'#CCD5AE':'#5A6840',fontFamily:'var(--font-display)'}}>Otto</span>
              </div>
            )}
            <div style={msg.role==='user'?{background:'#949F6E',borderRadius:'14px 14px 3px 14px',padding:'12px 15px',maxWidth:'72%'}:{background:aiBubble,border:`1.5px solid ${aiBorder}`,borderRadius:'14px 14px 14px 3px',padding:'12px 15px',maxWidth:'80%'}}>
              <p style={{fontSize:'13px',lineHeight:'1.75',color:msg.role==='user'?'#FDFAE0':text,whiteSpace:'pre-wrap',fontFamily:'var(--font-body)'}}>{msg.content}</p>
            </div>
            <span style={{fontSize:'10px',color:muted,marginTop:'4px',fontFamily:'var(--font-mono)'}}>{msg.timestamp}</span>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* CHIPS */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',flexShrink:0}}>
        {SUGG.map((s,i)=>(
          <button key={i} onClick={()=>send(s)} style={{padding:'6px 14px',borderRadius:'20px',border:`1.5px solid ${border}`,background:card,color:isDark?'#C8C4A8':'#5A5040',fontSize:'12px',cursor:'pointer',whiteSpace:'nowrap',fontFamily:'var(--font-body)',transition:'all 0.2s'}}>{s}</button>
        ))}
      </div>

      {/* INPUT */}
      <div style={{background:inputBg,border:`1.5px solid ${inputBorder}`,borderRadius:'14px',padding:'12px 16px',display:'flex',gap:'12px',alignItems:'flex-end',flexShrink:0}}>
        <textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={handleKey}
          placeholder="Ask Otto about orders, SLA, fulfillment... (Enter to send, Shift+Enter for new line)"
          rows={1} style={{flex:1,background:'transparent',border:'none',outline:'none',color:text,fontFamily:'var(--font-body)',fontSize:'14px',resize:'none',lineHeight:'1.5',padding:'4px 0',maxHeight:'120px',overflowY:'auto'}}/>
        <button onClick={()=>send(input)} disabled={loading||!input.trim()} style={{background:'#949F6E',color:'#FDFAE0',border:'none',borderRadius:'10px',padding:'10px 22px',fontFamily:'var(--font-body)',fontSize:'13px',fontWeight:500,cursor:'pointer',flexShrink:0,opacity:loading||!input.trim()?0.45:1}}>Send ↑</button>
      </div>

      <style>{`
        @keyframes ottoPupilRoll{0%,10%{transform:translate(0,0)}20%{transform:translate(4px,0)}40%{transform:translate(4px,4px)}60%{transform:translate(-4px,2px)}80%{transform:translate(-4px,-2px)}95%,100%{transform:translate(0,0)}}
        @keyframes tentA{0%,100%{transform:rotate(0deg)}50%{transform:rotate(12deg)}}
        @keyframes tentB{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-12deg)}}
        @keyframes tentC{0%,100%{transform:rotate(0deg)}50%{transform:rotate(9deg)}}
        @keyframes tentD{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-9deg)}}
        @keyframes lf{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
      `}</style>
    </div>
  );
};
export default Chat;