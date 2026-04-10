import React,{useState,useEffect} from 'react';
import{getOrders}from'../api';
interface Order{id:number;shopify_order_id:string;customer_name:string;customer_email:string;status:string;sla_status:string;total_price:number;created_at:string}
const Orders:React.FC<{isDark?:boolean;cardBg?:string}>=({isDark=false,cardBg})=>{
  const[orders,setOrders]=useState<Order[]>([]);
  const[load,setLoad]=useState(true);
  const[search,setSearch]=useState('');
  const[statusF,setStatusF]=useState('all');
  const[slaF,setSlaF]=useState('all');
  const[page,setPage]=useState(1);
  const PER=15;
  useEffect(()=>{fetchOrders();},[]);
  const fetchOrders=async()=>{
    setLoad(true);
    try{const r=await getOrders();const data=Array.isArray(r.data)?r.data:r.data?.orders||r.data?.data||r.data?.items||[];setOrders(data);}
    catch{setOrders([]);}finally{setLoad(false);}
  };
  const filtered=orders.filter(o=>{
    const matchS=!search||o.customer_name?.toLowerCase().includes(search.toLowerCase())||o.shopify_order_id?.includes(search);
    const matchSt=statusF==='all'||o.status===statusF;
    const matchSla=slaF==='all'||o.sla_status===slaF;
    return matchS&&matchSt&&matchSla;
  });
  const paged=filtered.slice((page-1)*PER,page*PER);
  const totalPages=Math.ceil(filtered.length/PER);
  const card=cardBg||(isDark?'rgba(50,48,28,0.95)':'rgba(253,250,224,0.9)');
  const border=isDark?'rgba(204,213,174,0.12)':'rgba(70,55,30,0.11)';
  const border2=isDark?'rgba(204,213,174,0.2)':'rgba(70,55,30,0.18)';
  const text=isDark?'#FDFAE0':'#1E1A14';
  const muted=isDark?'#8A8E6A':'#8A7E6C';
  const inputBg=isDark?'rgba(58,56,32,0.8)':'#F5F0D0';
  const rowAlt=isDark?'rgba(148,159,110,0.06)':'rgba(204,213,174,0.15)';
  const rowHover=isDark?'rgba(148,159,110,0.12)':'#E9EDCA';
  const slaStyle=(s:string)=>s==='breached'?{bg:'rgba(176,80,32,0.12)',color:'#B05020',border:'rgba(176,80,32,0.25)'}:s==='at_risk'?{bg:'rgba(200,120,74,0.14)',color:'#7A4010',border:'rgba(200,120,74,0.3)'}:{bg:isDark?'rgba(148,159,110,0.14)':'rgba(204,213,174,0.35)',color:isDark?'#CCD5AE':'#5A6840',border:isDark?'rgba(204,213,174,0.2)':'#CCD5AE'};
  const stStyle=(s:string)=>['delivered','shipped'].includes(s)?{bg:isDark?'rgba(148,159,110,0.14)':'rgba(204,213,174,0.35)',color:isDark?'#CCD5AE':'#5A6840',border:isDark?'rgba(204,213,174,0.2)':'#CCD5AE'}:['cancelled','refunded'].includes(s)?{bg:'rgba(176,80,32,0.1)',color:'#B05020',border:'rgba(176,80,32,0.2)'}:{bg:isDark?'rgba(148,159,110,0.1)':'rgba(204,213,174,0.25)',color:isDark?'#CCD5AE':'#5A6840',border:isDark?'rgba(204,213,174,0.15)':'#CCD5AE'};
  const pill=(st:{bg:string,color:string,border:string},label:string)=>(
    <span style={{display:'inline-flex',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:500,fontFamily:'var(--font-mono)',background:st.bg,color:st.color,border:`1px solid ${st.border}`}}>{label}</span>
  );
  const fmt=(d:string)=>new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',gap:'14px',minHeight:0}}>
      {/* Filters */}
      <div style={{background:card,border:`1.5px solid ${border}`,borderRadius:'14px',padding:'12px 16px',display:'flex',gap:'10px',alignItems:'center',flexWrap:'wrap',flexShrink:0}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search by name or order ID..." style={{flex:'1',minWidth:'180px',maxWidth:'300px',background:inputBg,border:`1.5px solid ${border2}`,borderRadius:'10px',padding:'9px 13px',color:text,fontFamily:'var(--font-body)',fontSize:'13px',outline:'none'}}/>
        <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} style={{width:'135px',background:inputBg,border:`1.5px solid ${border2}`,borderRadius:'10px',padding:'9px 13px',color:text,fontFamily:'var(--font-body)',fontSize:'13px',outline:'none'}}>
          <option value="all">All Status</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
        <select value={slaF} onChange={e=>{setSlaF(e.target.value);setPage(1);}} style={{width:'130px',background:inputBg,border:`1.5px solid ${border2}`,borderRadius:'10px',padding:'9px 13px',color:text,fontFamily:'var(--font-body)',fontSize:'13px',outline:'none'}}>
          <option value="all">All SLA</option>
          <option value="on_time">On Time</option>
          <option value="at_risk">At Risk</option>
          <option value="breached">Breached</option>
        </select>
        <button onClick={()=>{setSearch('');setStatusF('all');setSlaF('all');setPage(1);}} style={{background:'transparent',border:`1.5px solid ${border2}`,color:muted,borderRadius:'8px',padding:'8px 14px',fontFamily:'var(--font-body)',fontSize:'12px',cursor:'pointer'}}>Clear</button>
        <button onClick={fetchOrders} style={{background:'#949F6E',color:'#FDFAE0',border:'none',borderRadius:'8px',padding:'8px 16px',fontFamily:'var(--font-body)',fontSize:'12px',cursor:'pointer',fontWeight:500}}>↻ Refresh</button>
        <span style={{marginLeft:'auto',fontSize:'12px',color:muted,fontFamily:'var(--font-mono)',whiteSpace:'nowrap'}}>Showing {filtered.length} of {orders.length}</span>
      </div>

      {/* Table */}
      <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',background:card,border:`1.5px solid ${border}`,borderRadius:'14px',minHeight:0}}>
        {load?(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div style={{width:'28px',height:'28px',border:`3px solid ${isDark?'rgba(204,213,174,0.2)':'#E9EDCA'}`,borderTopColor:'#949F6E',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
          </div>
        ):paged.length===0?(
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',opacity:0.5}}>
            <span style={{fontSize:'32px'}}>📦</span>
            <p style={{fontFamily:'var(--font-display)',color:text,fontSize:'15px'}}>No orders found</p>
            <p style={{fontSize:'12px',color:muted}}>Orders from Shopify will appear here</p>
          </div>
        ):(
          <>
            <div style={{overflowX:'auto',flex:1,overflowY:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px',fontFamily:'var(--font-body)'}}>
                <thead style={{position:'sticky',top:0,background:isDark?'rgba(42,41,24,0.98)':'rgba(253,250,224,0.98)',zIndex:1}}>
                  <tr style={{borderBottom:`1.5px solid ${border2}`}}>
                    {['Order ID','Customer','Status','SLA','Total','Date'].map(h=>(
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontWeight:600,color:muted,fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.4px',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o,i)=>(
                    <tr key={o.id} style={{borderBottom:`1px solid ${border}`,background:i%2===0?'transparent':rowAlt,transition:'background 0.15s',cursor:'default'}}
                      onMouseEnter={e=>(e.currentTarget.style.background=rowHover)}
                      onMouseLeave={e=>(e.currentTarget.style.background=i%2===0?'transparent':rowAlt)}>
                      <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',color:'#949F6E',fontSize:'12px'}}>{o.shopify_order_id||`#${o.id}`}</td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{fontWeight:500,color:text}}>{o.customer_name}</div>
                        <div style={{fontSize:'11px',color:muted}}>{o.customer_email}</div>
                      </td>
                      <td style={{padding:'12px 16px'}}>{pill(stStyle(o.status),o.status)}</td>
                      <td style={{padding:'12px 16px'}}>{pill(slaStyle(o.sla_status),o.sla_status?.replace('_',' '))}</td>
                      <td style={{padding:'12px 16px',fontWeight:500,color:text}}>₹{o.total_price?.toLocaleString('en-IN')}</td>
                      <td style={{padding:'12px 16px',color:muted,fontFamily:'var(--font-mono)',fontSize:'11px'}}>{fmt(o.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages>1&&(
              <div style={{padding:'10px 16px',borderTop:`1px solid ${border}`,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',flexShrink:0}}>
                <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{background:'transparent',border:`1.5px solid ${border2}`,color:muted,borderRadius:'8px',padding:'5px 12px',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-body)'}}>← Prev</button>
                {Array.from({length:Math.min(totalPages,7)},(_,i)=>{const p=totalPages<=7?i+1:page<=4?i+1:page>=totalPages-3?totalPages-6+i:page-3+i;return<button key={p} onClick={()=>setPage(p)} style={{width:'30px',height:'30px',borderRadius:'8px',border:`1.5px solid ${page===p?'#949F6E':border2}`,background:page===p?'#949F6E':'transparent',color:page===p?'#FDFAE0':muted,fontSize:'12px',cursor:'pointer'}}>{p}</button>;})}
                <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} style={{background:'transparent',border:`1.5px solid ${border2}`,color:muted,borderRadius:'8px',padding:'5px 12px',fontSize:'12px',cursor:'pointer',fontFamily:'var(--font-body)'}}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Orders;