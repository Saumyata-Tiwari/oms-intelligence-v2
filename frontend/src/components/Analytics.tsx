import React,{useState,useEffect} from 'react';
import\{getAnalyticsSummary,getAnalyticsCharts\}from'../api'; // eslint-disable-line
import{LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer}from'recharts';
const Analytics:React.FC<{isDark?:boolean;cardBg?:string}>=({isDark=false,cardBg})=>{
  const[sum,setSum]=useState<any>(null);
  const[charts,setCharts]=useState<any>(null);
  const[period,setPeriod]=useState('7d');
  const[load,setLoad]=useState(true);
  useEffect(()=>{fetchData();},[period]); // eslint-disable-line // eslint-disable-line
  const fetchData=async()=>{
    setLoad(true);
    try{const[sR,cR]=await Promise.all([import('../api').then(m=>m.getAnalyticsSummary(period)),import('../api').then(m=>m.getAnalyticsCharts(period))]);setSum(sR.data);setCharts(cR.data);}
    catch{}finally{setLoad(false);}
  };
  const card=cardBg||(isDark?'rgba(50,48,28,0.95)':'rgba(253,250,224,0.9)');
  const border=isDark?'rgba(204,213,174,0.12)':'rgba(70,55,30,0.11)';
  const text=isDark?'#FDFAE0':'#1E1A14';
  const muted=isDark?'#8A8E6A':'#8A7E6C';
  const kpis=[
    {label:'Total Orders',value:sum?.total_orders||0,icon:'📦',color:'#949F6E'},
    {label:'Revenue',value:`₹${(sum?.revenue||0).toLocaleString('en-IN')}`,icon:'💰',color:'#C8784A'},
    {label:'SLA Breached',value:sum?.sla_breached||0,icon:'⚠️',color:'#B05020'},
    {label:'Escalations',value:sum?.escalations||0,icon:'🚨',color:'#C8784A'},
    {label:'Chat Sessions',value:sum?.chat_sessions||0,icon:'💬',color:isDark?'#CCD5AE':'#5A6840'},
    {label:'Avg Sentiment',value:(sum?.avg_sentiment||0).toFixed(2),icon:'😊',color:'#949F6E'},
  ];
  const ttStyle={background:isDark?'#2E2D1A':'#FDFAE0',border:`1px solid ${border}`,borderRadius:'10px',fontSize:'12px',fontFamily:'var(--font-mono)',color:text,padding:'8px 12px'};
  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',gap:'14px',overflow:'auto',minHeight:0}}>
      {/* Period */}
      <div style={{display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
        {['24h','7d','30d','90d'].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} style={{padding:'6px 16px',borderRadius:'20px',border:`1.5px solid ${period===p?'#949F6E':border}`,background:period===p?'#949F6E':'transparent',color:period===p?'#FDFAE0':muted,fontSize:'12px',fontFamily:'var(--font-mono)',cursor:'pointer',transition:'all 0.2s'}}>{p}</button>
        ))}
        {load&&<div style={{width:'18px',height:'18px',border:`2px solid ${isDark?'rgba(204,213,174,0.2)':'#E9EDCA'}`,borderTopColor:'#949F6E',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>}
      </div>
      {/* KPIs — 3 columns, 2 rows, never cuts off */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',flexShrink:0}}>
        {kpis.map((k,i)=>(
          <div key={i} style={{background:card,border:`1.5px solid ${border}`,borderRadius:'14px',padding:'16px',transition:'transform 0.2s'}}>
            <div style={{fontSize:'18px',marginBottom:'8px'}}>{k.icon}</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'26px',color:k.color}}>{k.value}</div>
            <div style={{fontSize:'11px',color:muted,marginTop:'4px'}}>{k.label}</div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',flexShrink:0}}>
        <div style={{background:card,border:`1.5px solid ${border}`,borderRadius:'14px',padding:'18px'}}>
          <h3 style={{fontSize:'13px',color:text,marginBottom:'14px',fontFamily:'var(--font-display)'}}>Orders Over Time</h3>
          {charts?.orders_over_time?.length?(
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts.orders_over_time} margin={{top:4,right:4,left:0,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                <XAxis dataKey="timestamp" tick={{fontSize:10,fill:muted}} tickFormatter={v=>new Date(v).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}/>
                <YAxis tick={{fontSize:10,fill:muted}}/>
                <Tooltip contentStyle={ttStyle}/>
                <Bar dataKey="value" fill="#949F6E" radius={[4,4,0,0]} name="Orders"/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:muted,fontSize:'13px',fontStyle:'italic'}}>No data yet</div>}
        </div>
        <div style={{background:card,border:`1.5px solid ${border}`,borderRadius:'14px',padding:'18px'}}>
          <h3 style={{fontSize:'13px',color:text,marginBottom:'14px',fontFamily:'var(--font-display)'}}>Sentiment Trend</h3>
          {charts?.sentiment_over_time?.length?(
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={charts.sentiment_over_time} margin={{top:4,right:4,left:0,bottom:4}}>
                <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                <XAxis dataKey="timestamp" tick={{fontSize:10,fill:muted}} tickFormatter={v=>new Date(v).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}/>
                <YAxis domain={[-1,1]} tick={{fontSize:10,fill:muted}}/>
                <Tooltip contentStyle={ttStyle}/>
                <Line type="monotone" dataKey="value" stroke="#949F6E" strokeWidth={2} dot={false} name="Sentiment"/>
              </LineChart>
            </ResponsiveContainer>
          ):<div style={{height:'180px',display:'flex',alignItems:'center',justifyContent:'center',color:muted,fontSize:'13px',fontStyle:'italic'}}>No data yet</div>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',flexShrink:0,paddingBottom:'8px'}}>
        <div style={{background:card,border:`1.5px solid ${border}`,borderRadius:'14px',padding:'18px'}}>
          <h3 style={{fontSize:'13px',color:text,marginBottom:'14px',fontFamily:'var(--font-display)'}}>SLA Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={[{name:'On Time',value:charts?.sla_distribution?.on_time||0},{name:'At Risk',value:charts?.sla_distribution?.at_risk||0},{name:'Breached',value:charts?.sla_distribution?.breached||0}]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {['#949F6E','#C8784A','#B05020'].map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <Tooltip contentStyle={ttStyle}/>
              <Legend iconType="circle" iconSize={9} wrapperStyle={{fontSize:'11px',color:text}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:card,border:`1.5px solid ${border}`,borderRadius:'14px',padding:'18px'}}>
          <h3 style={{fontSize:'13px',color:text,marginBottom:'14px',fontFamily:'var(--font-display)'}}>Channel Split</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={Object.entries(charts?.channel_split||{}).map(([k,v])=>({name:k.charAt(0).toUpperCase()+k.slice(1),value:v as number}))} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {['#949F6E','#CCD5AE','#E9EDCA','#C8784A','#D4895A'].map((c,i)=><Cell key={i} fill={c}/>)}
              </Pie>
              <Tooltip contentStyle={ttStyle}/>
              <Legend iconType="circle" iconSize={9} wrapperStyle={{fontSize:'11px',color:text}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Analytics;

