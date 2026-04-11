import { useState, useEffect, useCallback } from "react";

// ─── Tax Engine ───
const BK={single:[{n:0,x:11925,r:.10},{n:11925,x:48475,r:.12},{n:48475,x:103350,r:.22},{n:103350,x:197300,r:.24},{n:197300,x:250525,r:.32},{n:250525,x:626350,r:.35},{n:626350,x:1/0,r:.37}],married_jointly:[{n:0,x:23850,r:.10},{n:23850,x:96950,r:.12},{n:96950,x:206700,r:.22},{n:206700,x:394600,r:.24},{n:394600,x:501050,r:.32},{n:501050,x:752800,r:.35},{n:752800,x:1/0,r:.37}],married_separately:[{n:0,x:11925,r:.10},{n:11925,x:48475,r:.12},{n:48475,x:103350,r:.22},{n:103350,x:197300,r:.24},{n:197300,x:250525,r:.32},{n:250525,x:376400,r:.35},{n:376400,x:1/0,r:.37}],head_of_household:[{n:0,x:17000,r:.10},{n:17000,x:64850,r:.12},{n:64850,x:103350,r:.22},{n:103350,x:197300,r:.24},{n:197300,x:250500,r:.32},{n:250500,x:626350,r:.35},{n:626350,x:1/0,r:.37}]};
const SD={single:15000,married_jointly:30000,married_separately:15000,head_of_household:22500};
const STS={AL:{n:"Alabama",r:.05},AK:{n:"Alaska",r:0},AZ:{n:"Arizona",r:.025},AR:{n:"Arkansas",r:.039},CA:{n:"California",r:.0725},CO:{n:"Colorado",r:.044},CT:{n:"Connecticut",r:.05},DE:{n:"Delaware",r:.055},FL:{n:"Florida",r:0},GA:{n:"Georgia",r:.0549},HI:{n:"Hawaii",r:.065},ID:{n:"Idaho",r:.058},IL:{n:"Illinois",r:.0495},IN:{n:"Indiana",r:.0305},IA:{n:"Iowa",r:.038},KS:{n:"Kansas",r:.046},KY:{n:"Kentucky",r:.04},LA:{n:"Louisiana",r:.0425},ME:{n:"Maine",r:.055},MD:{n:"Maryland",r:.05},MA:{n:"Massachusetts",r:.05},MI:{n:"Michigan",r:.0425},MN:{n:"Minnesota",r:.0585},MS:{n:"Mississippi",r:.047},MO:{n:"Missouri",r:.048},MT:{n:"Montana",r:.059},NE:{n:"Nebraska",r:.0396},NV:{n:"Nevada",r:0},NH:{n:"New Hampshire",r:0},NJ:{n:"New Jersey",r:.055},NM:{n:"New Mexico",r:.049},NY:{n:"New York",r:.0685},NC:{n:"North Carolina",r:.045},ND:{n:"North Dakota",r:.0195},OH:{n:"Ohio",r:.035},OK:{n:"Oklahoma",r:.0475},OR:{n:"Oregon",r:.0875},PA:{n:"Pennsylvania",r:.0307},RI:{n:"Rhode Island",r:.0475},SC:{n:"South Carolina",r:.064},SD2:{n:"South Dakota",r:0},TN:{n:"Tennessee",r:0},TX:{n:"Texas",r:0},UT:{n:"Utah",r:.0465},VT:{n:"Vermont",r:.055},VA:{n:"Virginia",r:.0575},WA:{n:"Washington",r:0},WV:{n:"West Virginia",r:.052},WI:{n:"Wisconsin",r:.053},WY:{n:"Wyoming",r:0},DC:{n:"Washington, D.C.",r:.065}};
const DL=[{q:"Q1",d:"Apr 15",dd:new Date(2025,3,15)},{q:"Q2",d:"Jun 16",dd:new Date(2025,5,16)},{q:"Q3",d:"Sep 15",dd:new Date(2025,8,15)},{q:"Q4",d:"Jan 15",dd:new Date(2026,0,15)}];
const ft=(i,s)=>{let t=0;for(const b of BK[s]){if(i<=b.n)break;t+=(Math.min(i,b.x)-b.n)*b.r}return t};
const mrt=(i,s)=>{const b=BK[s];for(let j=b.length-1;j>=0;j--)if(i>b[j].n)return b[j].r;return b[0].rate};
const seT=n=>{const b=n*.9235;if(b<=0)return{t:0,d:0};return{t:Math.min(b,176100)*.124+b*.029+Math.max(0,b-200000)*.009,d:(Math.min(b,176100)*.124+b*.029+Math.max(0,b-200000)*.009)/2}};
const $=n=>"$"+Math.round(n).toLocaleString("en-US");
const P=n=>(n*100).toFixed(1)+"%";
const nDL=()=>{const n=new Date();for(const d of DL)if(d.dd>n)return d;return DL[0]};
const dTo=d=>Math.max(0,Math.ceil((d-new Date())/864e5));

export default function App(){
  // Pre-filled defaults — user sees a real number instantly
  const[income,setIncome]=useState(85000);
  const[state,setState]=useState("CA");
  const[status,setStatus]=useState("single");
  const[deductions,setDeductions]=useState(0);
  const[showDed,setShowDed]=useState(false);
  const[modal,setModal]=useState(false);

  // Tax calc
  const net=Math.max(0,income-deductions);
  const se=seT(net);
  const qbi=net*.2;
  const agi=net-se.d;
  const ti=Math.max(0,agi-SD[status]-qbi);
  const fi=ft(ti,status);
  const tf=fi+se.t;
  const sr=STS[state]?.r||0;
  const stx=Math.max(0,agi-SD[status])*sr;
  const tt=tf+stx;
  const quarterly=Math.round(tt/4);
  const monthly=Math.round(tt/12);
  const er=net>0?tt/net:0;
  const mg=mrt(ti,status);
  const nd=nDL();
  const days=dTo(nd.dd);

  // Input component
  const NI=({label,val,set})=>{
    const[f,setF]=useState(false);
    const[r,setR]=useState(val===0?"":val.toLocaleString("en-US"));
    useEffect(()=>{if(!f)setR(val===0?"":val.toLocaleString("en-US"))},[val,f]);
    return(<div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>{label}</label>
      <div style={{display:"flex",alignItems:"center",border:f?"1.5px solid #0e7490":"1.5px solid #e5e7eb",borderRadius:10,background:f?"#fff":"#f9fafb",padding:"0 14px",transition:"all .15s"}}>
        <span style={{color:"#9ca3af",fontSize:15,fontWeight:500}}>$</span>
        <input type="text" inputMode="numeric" value={r}
          onFocus={()=>{setF(true);setR(val===0?"":String(val))}}
          onBlur={()=>{setF(false);set(parseInt(r.replace(/\D/g,""),10)||0)}}
          onChange={e=>setR(e.target.value.replace(/[^0-9]/g,""))}
          style={{width:"100%",padding:"12px 8px",border:"none",outline:"none",fontSize:15,fontWeight:600,color:"#111827",background:"transparent",fontFamily:"inherit",fontVariantNumeric:"tabular-nums"}}/>
      </div>
    </div>)};

  return(
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',color:"#111827",background:"#fff",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <style>{`*{margin:0;padding:0;box-sizing:border-box}::selection{background:#0e7490;color:#fff}input::placeholder{color:#d1d5db}
      @media(max-width:860px){.qt-hero{flex-direction:column-reverse !important;gap:0 !important}.qt-left,.qt-right{width:100% !important;min-width:0 !important}}`}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{borderBottom:"1px solid #f3f4f6",padding:"0 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:52}}>
          <span style={{fontSize:15,fontWeight:700,letterSpacing:"-.02em",color:"#111827"}}>QuarterlyTax</span>
          <div style={{display:"flex",gap:20,alignItems:"center"}}>
            <span style={{fontSize:13,color:"#9ca3af",cursor:"pointer"}}>How it works</span>
            <button onClick={()=>setModal(true)} style={{fontSize:13,fontWeight:600,color:"#0e7490",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>Sign in</button>
          </div>
        </div>
      </nav>

      {/* ═══ DISCLAIMER ═══ */}
      <div style={{borderBottom:"1px solid #fef3c7",background:"#fffbeb",padding:"6px 24px",fontSize:11,color:"#92400e",textAlign:"center",fontWeight:500}}>
        Estimates only — not tax advice. Uses simplified 2025 federal rates. Consult a professional before making payments.
      </div>

      {/* ═══ HERO = THE PRODUCT ═══ */}
      <div style={{flex:1,maxWidth:1200,margin:"0 auto",width:"100%",padding:"32px 24px"}}>

        {/* Dynamic headline */}
        <div style={{marginBottom:24}}>
          <h1 style={{fontSize:26,fontWeight:800,letterSpacing:"-.03em",color:"#111827",lineHeight:1.2,marginBottom:4}}>
            {income>0
              ?<>You'll likely owe <span style={{color:"#0e7490"}}>{$(quarterly)}</span> on {nd.d}</>
              :<>How much do you owe this quarter?</>
            }
          </h1>
          <p style={{fontSize:14,color:"#6b7280"}}>Avoid IRS penalties. Know exactly what to pay.</p>
        </div>

        {/* Two-column grid */}
        <div className="qt-hero" style={{display:"flex",gap:24,alignItems:"flex-start"}}>

          {/* ─── LEFT: Calculator ─── */}
          <div className="qt-left" style={{width:400,flexShrink:0}}>
            <div style={{border:"1px solid #e5e7eb",borderRadius:12,padding:24,background:"#fff"}}>

              <NI label="Annual freelance income" val={income} set={setIncome}/>

              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>State</label>
                <select value={state} onChange={e=>setState(e.target.value)}
                  style={{width:"100%",padding:"12px 14px",fontSize:14,fontWeight:600,color:"#111827",background:"#f9fafb",border:"1.5px solid #e5e7eb",borderRadius:10,outline:"none",fontFamily:"inherit",cursor:"pointer",appearance:"none",
                    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>
                  {Object.entries(STS).sort((a,b)=>a[1].n.localeCompare(b[1].n)).map(([c,s])=><option key={c} value={c}>{s.n}</option>)}
                </select>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:5}}>Filing status</label>
                <select value={status} onChange={e=>setStatus(e.target.value)}
                  style={{width:"100%",padding:"12px 14px",fontSize:14,fontWeight:600,color:"#111827",background:"#f9fafb",border:"1.5px solid #e5e7eb",borderRadius:10,outline:"none",fontFamily:"inherit",cursor:"pointer",appearance:"none",
                    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center"}}>
                  <option value="single">Single</option>
                  <option value="married_jointly">Married filing jointly</option>
                  <option value="married_separately">Married filing separately</option>
                  <option value="head_of_household">Head of household</option>
                </select>
              </div>

              {/* Deductions accordion */}
              <button onClick={()=>setShowDed(!showDed)} style={{display:"flex",width:"100%",justifyContent:"space-between",alignItems:"center",background:"none",border:"none",cursor:"pointer",padding:"10px 0",fontFamily:"inherit",borderTop:"1px solid #f3f4f6"}}>
                <span style={{fontSize:13,fontWeight:600,color:"#6b7280"}}>Business deductions</span>
                <span style={{fontSize:12,color:"#9ca3af",transform:showDed?"rotate(90deg)":"none",transition:"transform .15s"}}>›</span>
              </button>
              {showDed&&<NI label="Annual deductions" val={deductions} set={setDeductions}/>}
            </div>
          </div>

          {/* ─── RIGHT: Results ─── */}
          <div className="qt-right" style={{flex:1,minWidth:0}}>
            <div style={{border:"1px solid #e5e7eb",borderRadius:12,background:"#fff",overflow:"hidden"}}>

              {/* Main result */}
              <div style={{padding:"28px 28px 20px"}}>
                <div style={{fontSize:12,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>Quarterly payment</div>
                <div style={{fontSize:48,fontWeight:800,letterSpacing:"-.04em",lineHeight:1,color:"#111827",fontVariantNumeric:"tabular-nums",transition:"all .15s"}}>{$(quarterly)}</div>
              </div>

              {/* Deadline */}
              <div style={{padding:"0 28px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:days>30?"#10b981":days>14?"#f59e0b":"#ef4444",
                    boxShadow:days<=14?`0 0 8px ${days>14?"#f59e0b":"#ef4444"}`:"none"}}/>
                  <span style={{fontSize:14,fontWeight:700,color:"#111827"}}>Due {nd.d}</span>
                  <span style={{fontSize:13,color:days<=14?"#ef4444":"#6b7280",fontWeight:days<=14?700:400}}>
                    {days===0?"Today":days===1?"Tomorrow":`${days} days`}
                  </span>
                </div>
              </div>

              {/* Metrics grid */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",borderTop:"1px solid #f3f4f6"}}>
                <div style={{padding:"18px 28px",borderRight:"1px solid #f3f4f6"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Monthly set-aside</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#111827",fontVariantNumeric:"tabular-nums"}}>{$(monthly)}</div>
                </div>
                <div style={{padding:"18px 28px"}}>
                  <div style={{fontSize:11,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Effective rate</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#111827"}}>{P(er)}</div>
                </div>
              </div>

              {/* All quarters */}
              <div style={{borderTop:"1px solid #f3f4f6",padding:"16px 28px"}}>
                <div style={{fontSize:11,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>All quarters</div>
                {DL.map((q,i)=>{
                  const isNext=q===nd;
                  return(
                    <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:i<3?"1px solid #f9fafb":"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13,fontWeight:700,color:isNext?"#0e7490":"#6b7280",width:24}}>{q.q}</span>
                        <span style={{fontSize:12,color:"#9ca3af"}}>Due {q.d}</span>
                      </div>
                      <span style={{fontSize:15,fontWeight:700,fontVariantNumeric:"tabular-nums",color:isNext?"#0e7490":"#111827"}}>{$(quarterly)}</span>
                    </div>
                  )})}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginTop:8,paddingTop:10,borderTop:"1px solid #e5e7eb"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#6b7280"}}>Total {new Date().getFullYear()}</span>
                  <span style={{fontSize:18,fontWeight:800,fontVariantNumeric:"tabular-nums"}}>{$(tt)}</span>
                </div>
              </div>

              {/* ─── Conversion trigger ─── */}
              <div style={{borderTop:"1px solid #f3f4f6",padding:"18px 28px",background:"#f9fafb"}}>
                <button onClick={()=>setModal(true)}
                  style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:0}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:"#111827",textAlign:"left"}}>Track this automatically</div>
                    <div style={{fontSize:12,color:"#6b7280",textAlign:"left"}}>Get reminders before every deadline</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:"#0e7490",flexShrink:0}}>$4/month →</span>
                </button>
              </div>

              {/* ─── Urgency ─── */}
              <div style={{borderTop:"1px solid #fde68a",padding:"12px 28px",background:"#fffbeb",display:"flex",alignItems:"center",gap:8}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L1 13h12L7 1z" fill="#f59e0b"/><text x="7" y="11" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800">!</text></svg>
                <span style={{fontSize:12,fontWeight:600,color:"#92400e"}}>Missing this deadline may result in IRS underpayment penalties</span>
              </div>
            </div>

            {/* Quick breakdown */}
            <div style={{marginTop:12,border:"1px solid #e5e7eb",borderRadius:12,background:"#fff",overflow:"hidden"}}>
              <div style={{padding:"14px 20px",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:0}}>
                <div style={{textAlign:"center",borderRight:"1px solid #f3f4f6",padding:"4px 0"}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".05em"}}>Federal</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{$(Math.round(tf/4))}</div>
                </div>
                <div style={{textAlign:"center",borderRight:"1px solid #f3f4f6",padding:"4px 0"}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".05em"}}>State</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{$(Math.round(stx/4))}</div>
                </div>
                <div style={{textAlign:"center",padding:"4px 0"}}>
                  <div style={{fontSize:10,fontWeight:600,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".05em"}}>SE Tax</div>
                  <div style={{fontSize:15,fontWeight:800,color:"#111827",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{$(Math.round(se.t/4))}</div>
                </div>
              </div>
            </div>

            {/* Pay button */}
            <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer"
              style={{display:"block",textAlign:"center",marginTop:12,padding:"14px",background:"#111827",color:"#fff",borderRadius:10,fontWeight:700,fontSize:14,textDecoration:"none",fontFamily:"inherit"}}>
              Pay {$(quarterly)} on IRS Direct Pay →
            </a>
          </div>
        </div>
      </div>

      {/* ═══ MODAL ═══ */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20}}
          onClick={()=>setModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:"36px 32px",maxWidth:420,width:"100%",position:"relative"}}>
            <button onClick={()=>setModal(false)} style={{position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:18,color:"#9ca3af",cursor:"pointer"}}>✕</button>
            <div style={{fontSize:22,fontWeight:800,color:"#111827",letterSpacing:"-.02em",marginBottom:6}}>Never miss a quarterly payment</div>
            <div style={{fontSize:14,color:"#6b7280",marginBottom:24,lineHeight:1.6}}>Join thousands of freelancers who stopped guessing.</div>

            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
              {[
                ["Automatic reminders before every IRS deadline","You'll never forget a payment date again"],
                ["Track all four quarters in one place","See your full year at a glance"],
                ["Avoid underpayment penalties","The IRS charges ~8% annually on missed payments"]
              ].map(([t,s],i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{width:20,height:20,borderRadius:6,background:"#ecfdf5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>{t}</div>
                    <div style={{fontSize:12,color:"#6b7280",marginTop:1}}>{s}</div>
                  </div>
                </div>
              ))}
            </div>

            <button style={{width:"100%",padding:"14px",background:"#0e7490",color:"#fff",borderRadius:10,fontWeight:800,fontSize:15,border:"none",cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
              Start tracking — $4/month
            </button>
            <button onClick={()=>setModal(false)} style={{width:"100%",padding:"10px",background:"none",border:"none",fontSize:13,color:"#9ca3af",cursor:"pointer",fontFamily:"inherit"}}>
              Continue without saving
            </button>
          </div>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <div style={{borderTop:"1px solid #f3f4f6",padding:"14px 24px",textAlign:"center",fontSize:11,color:"#9ca3af"}}>
        Not tax advice. Simplified 2025 rates. Consult a CPA. © {new Date().getFullYear()} QuarterlyTax
      </div>
    </div>
  );
}
