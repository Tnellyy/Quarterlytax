import { useState, useEffect } from "react";

const B={single:[{n:0,x:11925,r:.10},{n:11925,x:48475,r:.12},{n:48475,x:103350,r:.22},{n:103350,x:197300,r:.24},{n:197300,x:250525,r:.32},{n:250525,x:626350,r:.35},{n:626350,x:1/0,r:.37}],married_jointly:[{n:0,x:23850,r:.10},{n:23850,x:96950,r:.12},{n:96950,x:206700,r:.22},{n:206700,x:394600,r:.24},{n:394600,x:501050,r:.32},{n:501050,x:752800,r:.35},{n:752800,x:1/0,r:.37}],married_separately:[{n:0,x:11925,r:.10},{n:11925,x:48475,r:.12},{n:48475,x:103350,r:.22},{n:103350,x:197300,r:.24},{n:197300,x:250525,r:.32},{n:250525,x:376400,r:.35},{n:376400,x:1/0,r:.37}],head_of_household:[{n:0,x:17000,r:.10},{n:17000,x:64850,r:.12},{n:64850,x:103350,r:.22},{n:103350,x:197300,r:.24},{n:197300,x:250500,r:.32},{n:250500,x:626350,r:.35},{n:626350,x:1/0,r:.37}]};
const SD={single:15000,married_jointly:30000,married_separately:15000,head_of_household:22500};
const S={AL:{n:"Alabama",r:.05},AK:{n:"Alaska",r:0},AZ:{n:"Arizona",r:.025},AR:{n:"Arkansas",r:.039},CA:{n:"California",r:.0725},CO:{n:"Colorado",r:.044},CT:{n:"Connecticut",r:.05},DE:{n:"Delaware",r:.055},FL:{n:"Florida",r:0},GA:{n:"Georgia",r:.0549},HI:{n:"Hawaii",r:.065},ID:{n:"Idaho",r:.058},IL:{n:"Illinois",r:.0495},IN:{n:"Indiana",r:.0305},IA:{n:"Iowa",r:.038},KS:{n:"Kansas",r:.046},KY:{n:"Kentucky",r:.04},LA:{n:"Louisiana",r:.0425},ME:{n:"Maine",r:.055},MD:{n:"Maryland",r:.05},MA:{n:"Massachusetts",r:.05},MI:{n:"Michigan",r:.0425},MN:{n:"Minnesota",r:.0585},MS:{n:"Mississippi",r:.047},MO:{n:"Missouri",r:.048},MT:{n:"Montana",r:.059},NE:{n:"Nebraska",r:.0396},NV:{n:"Nevada",r:0},NH:{n:"New Hampshire",r:0},NJ:{n:"New Jersey",r:.055},NM:{n:"New Mexico",r:.049},NY:{n:"New York",r:.0685},NC:{n:"North Carolina",r:.045},ND:{n:"North Dakota",r:.0195},OH:{n:"Ohio",r:.035},OK:{n:"Oklahoma",r:.0475},OR:{n:"Oregon",r:.0875},PA:{n:"Pennsylvania",r:.0307},RI:{n:"Rhode Island",r:.0475},SC:{n:"South Carolina",r:.064},SD2:{n:"South Dakota",r:0},TN:{n:"Tennessee",r:0},TX:{n:"Texas",r:0},UT:{n:"Utah",r:.0465},VT:{n:"Vermont",r:.055},VA:{n:"Virginia",r:.0575},WA:{n:"Washington",r:0},WV:{n:"West Virginia",r:.052},WI:{n:"Wisconsin",r:.053},WY:{n:"Wyoming",r:0},DC:{n:"Washington, D.C.",r:.065}};
const Q=[{q:"Q1",p:"Jan–Mar",d:"Apr 15",dd:new Date(2025,3,15)},{q:"Q2",p:"Apr–May",d:"Jun 16",dd:new Date(2025,5,16)},{q:"Q3",p:"Jun–Aug",d:"Sep 15",dd:new Date(2025,8,15)},{q:"Q4",p:"Sep–Dec",d:"Jan 15",dd:new Date(2026,0,15)}];
const ft=(i,s)=>{let t=0;for(const b of B[s]){if(i<=b.n)break;t+=(Math.min(i,b.x)-b.n)*b.r}return t};
const mr=(i,s)=>{const b=B[s];for(let j=b.length-1;j>=0;j--)if(i>b[j].n)return b[j].r;return b[0].r};
const se=n=>{const b=n*.9235;if(b<=0)return{t:0,d:0};const s=Math.min(b,176100)*.124,m=b*.029+Math.max(0,b-200000)*.009;return{t:s+m,d:(s+m)/2}};
const $=n=>n===0?"$0":"$"+Math.round(n).toLocaleString("en-US");
const P=n=>(n*100).toFixed(1)+"%";
const nxt=()=>{const n=new Date();for(const d of Q)if(d.dd>n)return d;return Q[0]};
const dtu=d=>Math.max(0,Math.ceil((d-new Date())/864e5));

const sn={single:"Single",married_jointly:"Married filing jointly",married_separately:"Married filing separately",head_of_household:"Head of household"};

export default function App(){
  const[status,setStatus]=useState("single");
  const[state,setState]=useState("CA");
  const[inc,setInc]=useState([0,0,0,0]);
  const[ded,setDed]=useState([0,0,0,0]);
  const[w2,setW2]=useState(0);
  const[w2w,setW2w]=useState(0);
  const[lt,setLt]=useState(0);
  const[aq,setAq]=useState(0);
  const[bk,setBk]=useState(false);
  const[adv,setAdv]=useState(false);
  const[wif,setWif]=useState(0);
  const[pd,setPd]=useState(()=>{try{return JSON.parse(localStorage.getItem("qp")||"[]")}catch{return[]}});
  const[editFiling,setEditFiling]=useState(false);
  useEffect(()=>{try{localStorage.setItem("qp",JSON.stringify(pd))}catch{}},[pd]);

  const si=(i,v)=>{const n=[...inc];n[i]=v;setInc(n)};
  const sd=(i,v)=>{const n=[...ded];n[i]=v;setDed(n)};
  const aa=()=>{setInc([inc[aq],inc[aq],inc[aq],inc[aq]]);setDed([ded[aq],ded[aq],ded[aq],ded[aq]])};

  const ti2=inc.reduce((a,b)=>a+b,0)+wif;
  const td=ded.reduce((a,b)=>a+b,0);
  const net=Math.max(0,ti2-td);
  const s2=se(net);
  const qbi=net*.2;
  const agi=net+w2-s2.d;
  const ti=Math.max(0,agi-SD[status]-qbi);
  const fi=ft(ti,status);
  const tf=fi+s2.t;
  const sr=S[state]?.r||0;
  const st=Math.max(0,agi-SD[status])*sr;
  const tt=tf+st;
  const aw=Math.max(0,tt-w2w);
  const m=mr(ti,status);
  const er=net+w2>0?tt/(net+w2):0;
  const has=ti2>0||w2>0;

  const qp=inc.map(q=>{if(ti2===0)return{f:0,s:0,t:0,m:0};const p=(q+(wif>0?wif/4:0))/Math.max(1,ti2);const f=Math.round(Math.max(0,tf*p-w2w/4));const s2=Math.round(st*p);return{f,s:s2,t:f+s2,m:Math.round((f+s2)/3)}});
  const te=qp.reduce((a,q)=>a+q.t,0);
  const sh=agi>150000?lt*1.1:lt;
  const isSH=lt>0&&te>=sh;
  const shG=lt>0?Math.max(0,sh-te):0;
  const tp=pd.reduce((a,i)=>a+(qp[i]?.t||0),0);
  const nd=nxt();const dl=dtu(nd.dd);

  // hints
  const h=[];
  if(ti2>0&&(ti2>0?td/ti2:0)<.1)h.push("Most freelancers deduct 15–25% of gross income. Home office, software, internet, health insurance, and professional development are commonly missed.");
  if(ti2>50000&&td<2000)h.push(`At your income, a $5,000 deduction saves ~$${Math.round(5000*.22).toLocaleString()} in federal tax. Are you tracking mileage, equipment, or contractor payments?`);
  if(net>60000)h.push("Consider a Solo 401(k) — shelter up to $23,500 plus 25% of net SE income from both federal and state tax.");
  if(["CA","NY","NJ","OR","MN"].includes(state)&&net>40000)h.push(`In ${S[state].n} (${P(S[state].r)} state rate), every $1,000 deducted saves $${Math.round(1000*(.22+S[state].r))} combined.`);

  const exp=()=>{const l=["QuarterlyTax Estimate — "+new Date().getFullYear(),"",`${sn[status]} · ${S[state]?.n}`,`Net SE income: ${$(net)}`,`Total tax: ${$(tt)}`,w2w>0?`W-2 withholding: −${$(w2w)}`:"",`Estimated payments: ${$(aw)}`,"","Quarterly breakdown:",...qp.map((q,i)=>`  ${Q[i].q}  ${$(q.t)}  (${$(q.m)}/mo)  Due ${Q[i].d}`),"","Estimate only. Not tax advice."].filter(Boolean).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([l],{type:"text/plain"}));a.download=`quarterly-tax-${new Date().getFullYear()}.txt`;a.click()};

  const so=Object.entries(S).sort((a,b)=>a[1].n.localeCompare(b[1].n));

  const NI=({label,value,onChange,note})=>{
    const[f,setF]=useState(false);
    const[r,setR]=useState(value===0?"":String(value));
    useEffect(()=>{if(!f)setR(value===0?"":value.toLocaleString("en-US"))},[value,f]);
    return(
      <div style={{marginBottom:24}}>
        <label style={{display:"block",fontSize:14,color:"#444",marginBottom:8}}>{label}</label>
        <div style={{display:"flex",alignItems:"center",borderBottom:f?"2px solid #000":"1.5px solid #e0e0e0",paddingBottom:8,transition:"border-color .2s"}}>
          <span style={{fontSize:20,color:"#999",marginRight:4,fontWeight:300}}>$</span>
          <input type="text" inputMode="numeric" value={r} placeholder="0"
            onFocus={()=>{setF(true);setR(value===0?"":String(value))}}
            onBlur={()=>{setF(false);onChange(parseInt(r.replace(/\D/g,""),10)||0)}}
            onChange={e=>setR(e.target.value.replace(/[^0-9]/g,""))}
            style={{flex:1,border:"none",outline:"none",fontSize:20,fontWeight:500,color:"#000",fontFamily:"inherit",background:"transparent",fontVariantNumeric:"tabular-nums"}}/>
        </div>
        {note&&<div style={{fontSize:12,color:"#aaa",marginTop:6,lineHeight:1.4}}>{note}</div>}
      </div>
    )};

  const rule=<div style={{height:1,background:"#eee",margin:"32px 0"}}/>;

  return(
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',color:"#000",background:"#fff",minHeight:"100vh",WebkitFontSmoothing:"antialiased"}}>

      {/* Disclaimer */}
      <div style={{borderBottom:"1px solid #f0e6c8",padding:"10px 20px",fontSize:12,color:"#8a6d3b",textAlign:"center",background:"#fdf8ed"}}>
        Estimates only — not tax advice. Uses simplified 2025 rates. Consult a professional before making payments.
      </div>

      {/* Nav */}
      <div style={{borderBottom:"1px solid #eee"}}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"16px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:15,fontWeight:600,letterSpacing:"-.02em",color:"#000"}}>QuarterlyTax</span>
          <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer"
            style={{fontSize:12,color:"#666",textDecoration:"none"}}>IRS Direct Pay ↗</a>
        </div>
      </div>

      <div style={{maxWidth:600,margin:"0 auto",padding:"40px 24px 160px"}}>

        {/* Filing info */}
        {!editFiling?(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,color:"#000"}}>{sn[status]} · {S[state]?.n}</span>
            <button onClick={()=>setEditFiling(true)} style={{fontSize:12,color:"#999",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>Change</button>
          </div>
        ):(
          <div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:14,color:"#444",marginBottom:8}}>Filing status</label>
              <select value={status} onChange={e=>setStatus(e.target.value)} style={{width:"100%",padding:"10px 0",fontSize:16,fontWeight:500,border:"none",borderBottom:"1.5px solid #e0e0e0",outline:"none",fontFamily:"inherit",color:"#000",background:"transparent",cursor:"pointer"}}>
                {Object.entries(sn).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{display:"block",fontSize:14,color:"#444",marginBottom:8}}>State</label>
              <select value={state} onChange={e=>setState(e.target.value)} style={{width:"100%",padding:"10px 0",fontSize:16,fontWeight:500,border:"none",borderBottom:"1.5px solid #e0e0e0",outline:"none",fontFamily:"inherit",color:"#000",background:"transparent",cursor:"pointer"}}>
                {so.map(([c,s])=><option key={c} value={c}>{s.n}</option>)}
              </select>
            </div>
            <button onClick={()=>setEditFiling(false)} style={{fontSize:13,color:"#000",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Done</button>
          </div>
        )}

        {rule}

        {/* Quarter selector */}
        <div style={{display:"flex",gap:0,marginBottom:24}}>
          {Q.map((q,i)=>(
            <button key={i} onClick={()=>setAq(i)} style={{flex:1,padding:"12px 0",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",
              borderBottom:aq===i?"2px solid #000":"2px solid transparent",
              color:aq===i?"#000":"#bbb",fontWeight:aq===i?600:400,fontSize:14,transition:"all .15s"}}>
              {q.q}<span style={{display:"block",fontSize:11,fontWeight:400,marginTop:2,color:aq===i?"#666":"#ccc"}}>{q.p}</span>
            </button>
          ))}
        </div>

        <NI label="Freelance income this quarter" value={inc[aq]} onChange={v=>si(aq,v)} note="Gross 1099 income before expenses"/>
        <NI label="Business deductions" value={ded[aq]} onChange={v=>sd(aq,v)} note="Home office, software, supplies, travel, health insurance"/>

        <button onClick={aa} style={{fontSize:13,color:"#999",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline",marginBottom:8}}>
          Apply to all quarters
        </button>

        {rule}

        {/* ═══ THE NUMBER ═══ */}
        {!has?(
          <div style={{padding:"40px 0",textAlign:"center"}}>
            <div style={{fontSize:13,color:"#ccc"}}>Enter your income above</div>
          </div>
        ):(
          <>
            {/* Deadline */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:24}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:dl>30?"#22c55e":dl>14?"#eab308":"#ef4444"}}/>
              <span style={{fontSize:13,color:"#666"}}>{nd.q} due in {dl} day{dl!==1?"s":""}</span>
              <span style={{fontSize:13,color:"#ccc"}}>·</span>
              <span style={{fontSize:13,color:"#666"}}>{nd.d}</span>
            </div>

            <div style={{marginBottom:8}}>
              <div style={{fontSize:13,color:"#999",marginBottom:12}}>Estimated quarterly payments</div>
              <div style={{fontSize:56,fontWeight:700,letterSpacing:"-.04em",lineHeight:1,color:"#000",fontVariantNumeric:"tabular-nums"}}>{$(aw)}</div>
              <div style={{fontSize:14,color:"#666",marginTop:14,lineHeight:1.7}}>
                {P(er)} effective rate · {P(m)} marginal bracket
                {er<m*.8&&<><br/><span style={{color:"#16a34a"}}>You pay {P(er)} overall — not {P(m)} on every dollar.</span></>}
              </div>
            </div>

            {lt>0&&(
              <div style={{marginTop:16,fontSize:13,fontWeight:500,color:isSH?"#16a34a":"#dc2626"}}>
                {isSH?"✓ Safe harbor — you're penalty-protected this year":`⚠ ${$(shG)} short of safe harbor — consider increasing payments`}
              </div>
            )}

            {rule}

            {/* Quarter table */}
            <div>
              {qp.map((q,i)=>(
                <div key={i} onClick={()=>setAq(i)}
                  style={{display:"flex",alignItems:"center",padding:"16px 0",borderBottom:"1px solid #f5f5f5",cursor:"pointer",opacity:pd.includes(i)?.45:1}}>
                  <div style={{width:36,fontSize:13,fontWeight:600,color:aq===i?"#000":"#999"}}>{Q[i].q}</div>
                  <div style={{flex:1}}>
                    <span style={{fontSize:20,fontWeight:600,fontVariantNumeric:"tabular-nums",color:q.t>0?"#000":"#ddd",
                      textDecoration:pd.includes(i)?"line-through":"none"}}>
                      {q.t>0?$(q.t):"—"}
                    </span>
                    {q.t>0&&<span style={{fontSize:13,color:"#aaa",marginLeft:12}}>{$(q.m)}/mo</span>}
                  </div>
                  <div style={{fontSize:12,color:"#bbb",marginRight:16}}>Due {Q[i].d}</div>
                  <button onClick={e=>{e.stopPropagation();setPd(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])}}
                    style={{width:20,height:20,borderRadius:4,border:pd.includes(i)?"2px solid #16a34a":"1.5px solid #ddd",
                      background:pd.includes(i)?"#16a34a":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:11,color:"#fff",fontWeight:700,flexShrink:0}}>
                    {pd.includes(i)&&"✓"}
                  </button>
                </div>
              ))}
            </div>

            {pd.length>0&&(
              <div style={{fontSize:13,color:"#16a34a",fontWeight:500,marginTop:12}}>
                {$(tp)} paid · {$(Math.max(0,te-tp))} remaining
              </div>
            )}

            {rule}

            {/* Total */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
              <span style={{fontSize:14,color:"#666"}}>Total for {new Date().getFullYear()}</span>
              <span style={{fontSize:24,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{$(tt)}</span>
            </div>

            {rule}

            {/* Actions */}
            <div style={{display:"flex",gap:12}}>
              <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer"
                style={{flex:1,textAlign:"center",padding:"14px",background:"#000",color:"#fff",borderRadius:8,fontWeight:600,fontSize:14,textDecoration:"none",fontFamily:"inherit"}}>
                Pay now →
              </a>
              <button onClick={exp} style={{padding:"14px 24px",background:"#fff",border:"1.5px solid #e0e0e0",borderRadius:8,fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit",color:"#666"}}>
                Export
              </button>
            </div>

            {/* ─── Expandable sections ─── */}

            {/* What-if */}
            <div style={{marginTop:32}}>
              <div style={{fontSize:13,color:"#999",marginBottom:12}}>What if your income changes?</div>
              <input type="range" min={-Math.round(ti2*.5)} max={Math.round(ti2*.5)} step={500} value={wif}
                onChange={e=>setWif(Number(e.target.value))}
                style={{width:"100%",accentColor:"#000",height:2,opacity:.6}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#ccc",marginTop:8}}>
                <span>−{$(Math.round(ti2*.5))}</span>
                <span style={{fontWeight:600,color:wif===0?"#ccc":wif>0?"#ef4444":"#16a34a"}}>
                  {wif===0?"No change":(wif>0?"+":"")+$(wif)}
                </span>
                <span>+{$(Math.round(ti2*.5))}</span>
              </div>
            </div>

            {/* Insights */}
            {h.length>0&&(
              <div style={{marginTop:32}}>
                <div style={{fontSize:13,color:"#999",marginBottom:12}}>Tax-saving opportunities</div>
                {h.map((t,i)=>(
                  <div key={i} style={{fontSize:13,color:"#444",lineHeight:1.7,padding:"12px 0",borderBottom:i<h.length-1?"1px solid #f5f5f5":"none"}}>
                    {t}
                  </div>
                ))}
              </div>
            )}

            {/* Advanced */}
            <div style={{marginTop:32}}>
              <button onClick={()=>setAdv(!adv)} style={{fontSize:13,color:"#999",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                {adv?"Hide":"Show"} W-2 offset & safe harbor
              </button>
              {adv&&(
                <div style={{marginTop:20}}>
                  <NI label="W-2 annual income" value={w2} onChange={setW2} note="Day job income — offsets quarterly payments"/>
                  <NI label="W-2 taxes withheld" value={w2w} onChange={setW2w} note="Federal withholding from pay stubs"/>
                  <NI label="Last year's total tax (1040 Line 24)" value={lt} onChange={setLt} note="For safe harbor — pay 100% of this to avoid penalties"/>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div style={{marginTop:32}}>
              <button onClick={()=>setBk(!bk)} style={{fontSize:13,color:"#999",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>
                {bk?"Hide":"Show"} full breakdown
              </button>
              {bk&&(
                <div style={{marginTop:16}}>
                  {[
                    {l:"Gross 1099 income",v:$(ti2)},
                    {l:"Deductions",v:"−"+$(td),d:1},
                    {l:"Net SE income",v:$(net),b:1},
                    w2>0&&{l:"W-2 income",v:$(w2)},
                    {l:"SE tax (15.3%)",v:$(s2.t)},
                    {l:"½ SE deduction",v:"−"+$(s2.d),d:1},
                    {l:"AGI",v:$(agi)},
                    {l:"Standard deduction",v:"−"+$(SD[status]),d:1},
                    {l:"QBI deduction (20%)",v:"−"+$(Math.round(qbi)),d:1},
                    {l:"Taxable income",v:$(ti),b:1},
                    {l:"Federal income tax",v:$(fi)},
                    {l:`${S[state]?.n} (${P(sr)})`,v:$(st)},
                    {l:"Total tax",v:$(tt),b:1},
                    w2w>0&&{l:"W-2 withholding",v:"−"+$(w2w),d:1},
                    {l:"Estimated payments",v:$(aw),b:1,g:1},
                  ].filter(Boolean).map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:13,
                      borderBottom:i<13?"1px solid #fafafa":"none"}}>
                      <span style={{color:r.b?"#000":"#888",fontWeight:r.b?600:400}}>{r.l}</span>
                      <span style={{fontWeight:r.b?600:400,fontVariantNumeric:"tabular-nums",
                        color:r.g?"#16a34a":r.d?"#bbb":"#000"}}>{r.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div style={{marginTop:48,fontSize:12,color:"#aaa",lineHeight:1.7}}>
              <strong style={{color:"#888"}}>Not tax advice.</strong> Simplified 2025 federal brackets and flat state rates. Does not account for AMT, Medicare surtax, state-specific deductions, credits, or local taxes. Consult a CPA for your specific situation.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
