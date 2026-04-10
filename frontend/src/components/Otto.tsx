import React from 'react';
interface OttoProps{mood?:'default'|'thinking'|'alert'|'happy'|'loading';size?:number;floating?:boolean}
const Otto:React.FC<OttoProps>=({mood='default',size=80,floating=true})=>{
  const s=size/200;
  const isLoad=mood==='loading';
  const eyes=()=>{
    if(mood==='happy')return(<><circle cx="78" cy="52" r="16" fill="white" stroke="#E9EDCA" strokeWidth="2"/><circle cx="122" cy="52" r="16" fill="white" stroke="#E9EDCA" strokeWidth="2"/><path d="M64 50 Q78 40 92 50" stroke="#1E1A14" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M108 50 Q122 40 136 50" stroke="#1E1A14" strokeWidth="4" fill="none" strokeLinecap="round"/></>);
    if(mood==='alert')return(<><circle cx="78" cy="52" r="16" fill="white" stroke="#E9EDCA" strokeWidth="2"/><circle cx="122" cy="52" r="16" fill="white" stroke="#E9EDCA" strokeWidth="2"/><circle cx="78" cy="48" r="11" fill="#1E1A14"/><circle cx="122" cy="48" r="11" fill="#1E1A14"/><circle cx="73" cy="43" r="4" fill="white"/><circle cx="117" cy="43" r="4" fill="white"/></>);
    const anim=mood==='thinking'?'ottoPupilThink 3s ease-in-out infinite':'ottoPupilRoll 5s ease-in-out infinite';
    return(<><circle cx="78" cy="52" r="16" fill="white" stroke="#E9EDCA" strokeWidth="2"/><circle cx="122" cy="52" r="16" fill="white" stroke="#E9EDCA" strokeWidth="2"/><g style={{animation:anim}}><circle cx="78" cy="52" r="11" fill="#1E1A14"/><circle cx="122" cy="52" r="11" fill="#1E1A14"/><circle cx="73" cy="47" r="4" fill="white"/><circle cx="117" cy="47" r="4" fill="white"/><circle cx="75" cy="49" r="1.5" fill="white" opacity="0.5"/><circle cx="119" cy="49" r="1.5" fill="white" opacity="0.5"/></g></>);
  };
  const mouth=()=>{
    if(mood==='thinking')return<path d="M88 82 Q100 85 112 82" stroke="#3D5A14" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    if(mood==='alert')return<path d="M90 82 Q100 79 110 82" stroke="#3D5A14" strokeWidth="2.5" fill="none" strokeLinecap="round"/>;
    if(mood==='happy')return<path d="M84 80 Q100 94 116 80" stroke="#3D5A14" strokeWidth="3" fill="none" strokeLinecap="round"/>;
    return<path d="M84 80 Q100 92 116 80" stroke="#3D5A14" strokeWidth="3" fill="none" strokeLinecap="round"/>;
  };
  const wrapAnim=isLoad?{animation:'ottoLoadBounce 1.8s ease-in-out infinite'}:floating?{animation:'ottoFloat 3.5s ease-in-out infinite'}:{};
  return(<>
    <style>{`
      @keyframes ottoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @keyframes ottoLoadBounce{0%{transform:translateY(0) rotate(-4deg)}25%{transform:translateY(-14px) rotate(5deg)}50%{transform:translateY(-20px) rotate(-3deg)}75%{transform:translateY(-8px) rotate(4deg)}100%{transform:translateY(0) rotate(-4deg)}}
      @keyframes ottoPupilRoll{0%,10%{transform:translate(0,0)}20%{transform:translate(5px,0)}35%{transform:translate(5px,5px)}50%{transform:translate(0,5px)}65%{transform:translate(-5px,2px)}80%{transform:translate(-5px,-3px)}93%,100%{transform:translate(0,0)}}
      @keyframes ottoPupilThink{0%,15%{transform:translate(0,0)}30%,65%{transform:translate(1px,-7px)}80%{transform:translate(-2px,-7px)}95%,100%{transform:translate(0,0)}}
      @keyframes tentA{0%,100%{transform:rotate(0deg)}50%{transform:rotate(13deg)}}
      @keyframes tentB{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-13deg)}}
      @keyframes tentC{0%,100%{transform:rotate(0deg)}50%{transform:rotate(10deg)}}
      @keyframes tentD{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-10deg)}}
      @keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    `}</style>
    <div style={{display:'inline-block',padding:`0 ${70*s}px ${90*s}px ${70*s}px`,...wrapAnim}}>
      <svg width={200*s} height={190*s} viewBox="-70 -10 340 290" overflow="visible" fill="none">
        <g style={{animation:'tentA 2s ease-in-out infinite',transformOrigin:'38px 110px'}}><path d="M38 110 Q8 132 -2 168 Q-5 182 5 182" stroke="#A3B893" strokeWidth="7" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2s ease-in-out infinite'}}><circle cx="2" cy="194" r="17" fill="#96BF48"/><rect x="-7" y="188" width="18" height="12" rx="2" fill="white"/><path d="M-4 188 Q2 183 8 188" stroke="white" strokeWidth="1.8" fill="none"/></g>
        <g style={{animation:'tentB 2.3s ease-in-out infinite 0.15s',transformOrigin:'55px 112px'}}><path d="M55 112 Q36 137 34 164 Q33 176 42 176" stroke="#C0D6B0" strokeWidth="6.5" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2.3s ease-in-out infinite 0.2s'}}><circle cx="38" cy="188" r="16" fill="#25D366"/><path d="M30 182 Q38 178 46 182 Q51 187 48 194 Q46 199 40 200 L33 202 L34 197 Q30 192 30 187 Z" fill="white"/></g>
        <g style={{animation:'tentC 2.5s ease-in-out infinite 0.3s',transformOrigin:'72px 114px'}}><path d="M72 114 Q65 137 63 157 Q62 167 68 168" stroke="#A3B893" strokeWidth="6" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2.5s ease-in-out infinite 0.35s'}}><circle cx="65" cy="180" r="14" fill="#EA4335"/><rect x="57" y="174" width="16" height="11" rx="2" fill="white"/><path d="M57 174 L65 181 L73 174" stroke="#EA4335" strokeWidth="1.5" fill="none"/></g>
        <g style={{animation:'tentD 2.2s ease-in-out infinite 0.45s',transformOrigin:'88px 115px'}}><path d="M88 115 Q86 133 85 150 Q84 160 89 161" stroke="#C0D6B0" strokeWidth="6" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2.2s ease-in-out infinite 0.5s'}}><circle cx="88" cy="173" r="14" fill="#EA4B35"/><text x="88" y="177" textAnchor="middle" fontSize="10" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">n8n</text></g>
        <g style={{animation:'tentA 2.2s ease-in-out infinite 0.5s',transformOrigin:'112px 115px'}}><path d="M112 115 Q114 133 115 150 Q116 160 111 161" stroke="#C0D6B0" strokeWidth="6" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2.2s ease-in-out infinite 0.55s'}}><circle cx="112" cy="173" r="14" fill="#949F6E"/><path d="M104 179 L107 174 L110 176 L113 171 L116 173 L119 168" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'tentB 2.5s ease-in-out infinite 0.35s',transformOrigin:'128px 114px'}}><path d="M128 114 Q135 137 137 157 Q138 167 132 168" stroke="#A3B893" strokeWidth="6" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2.5s ease-in-out infinite 0.4s'}}><circle cx="135" cy="180" r="14" fill="#F22F46"/><rect x="127" y="174" width="16" height="11" rx="2" fill="white"/><line x1="129" y1="177" x2="141" y2="177" stroke="#F22F46" strokeWidth="1.2"/><line x1="129" y1="181" x2="138" y2="181" stroke="#F22F46" strokeWidth="1.2"/></g>
        <g style={{animation:'tentC 2.3s ease-in-out infinite 0.2s',transformOrigin:'145px 112px'}}><path d="M145 112 Q164 137 166 164 Q167 176 158 176" stroke="#C0D6B0" strokeWidth="6.5" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2.3s ease-in-out infinite 0.25s'}}><circle cx="162" cy="188" r="16" fill="#4A154B"/><line x1="154" y1="184" x2="170" y2="184" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="154" y1="189" x2="170" y2="189" stroke="white" strokeWidth="2" strokeLinecap="round"/><line x1="154" y1="194" x2="164" y2="194" stroke="white" strokeWidth="2" strokeLinecap="round"/></g>
        <g style={{animation:'tentD 2s ease-in-out infinite 0.05s',transformOrigin:'162px 110px'}}><path d="M162 110 Q192 132 202 168 Q205 182 195 182" stroke="#A3B893" strokeWidth="7" fill="none" strokeLinecap="round"/></g>
        <g style={{animation:'logoFloat 2s ease-in-out infinite 0.1s'}}><circle cx="198" cy="194" r="17" fill="#FF4A00"/><text x="198" y="198" textAnchor="middle" fontSize="9" fill="white" fontFamily="DM Mono,monospace" fontWeight="700">zap</text></g>
        <ellipse cx="100" cy="68" rx="64" ry="70" fill="#8BAE3C"/>
        <ellipse cx="100" cy="72" rx="54" ry="60" fill="#A8C45A"/>
        <ellipse cx="100" cy="84" rx="30" ry="34" fill="#C8DC8E" opacity="0.38"/>
        {eyes()}
        <ellipse cx="56" cy="88" rx="14" ry="8" fill="#C8784A" opacity="0.2"/>
        <ellipse cx="144" cy="88" rx="14" ry="8" fill="#C8784A" opacity="0.2"/>
        {mouth()}
        <rect x="60" y="4" width="80" height="12" rx="6" fill="#3D5A14"/>
        <rect x="70" y="-8" width="60" height="18" rx="8" fill="#3D5A14"/>
        <rect x="72" y="-6" width="56" height="5" rx="2.5" fill="#6B9428" opacity="0.4"/>
        {mood==='thinking'&&<><circle cx="148" cy="16" r="5" fill="#E9EDCA" stroke="#949F6E" strokeWidth="1"/><circle cx="157" cy="8" r="7" fill="#E9EDCA" stroke="#949F6E" strokeWidth="1"/><circle cx="168" cy="2" r="9" fill="#E9EDCA" stroke="#949F6E" strokeWidth="1.5"/><text x="168" y="6" textAnchor="middle" fontSize="11" fill="#5A6840">?</text></>}
        {mood==='alert'&&<><path d="M152 18 L165 8" stroke="#C8784A" strokeWidth="2" strokeLinecap="round"/><circle cx="170" cy="5" r="9" fill="#FAF0E8" stroke="#C8784A" strokeWidth="1.5"/><text x="170" y="9" textAnchor="middle" fontSize="12" fill="#C8784A">!</text></>}
        {mood==='happy'&&<><path d="M152 18 L165 8" stroke="#949F6E" strokeWidth="2" strokeLinecap="round"/><circle cx="170" cy="5" r="9" fill="#E9EDCA" stroke="#949F6E" strokeWidth="1.5"/><text x="170" y="9" textAnchor="middle" fontSize="12" fill="#5A6840">✓</text></>}
      </svg>
    </div>
  </>);
};
export default Otto;