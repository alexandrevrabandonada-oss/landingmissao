import { ImageResponse } from "next/og";

const SITE = "https://www.alexandrevrabandonada.online";

export const runtime = "edge";
export const alt = "Climatização nas escolas de Volta Redonda";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type School = {
  slug:string; name:string; network:string; category:string;
  report_count:number; support_count:number; activity_count:number;
};

async function getSchool(slug:string):Promise<School|null>{
  try{
    const response=await fetch(SITE+"/api/climatizacao?action=snapshot",{cache:"no-store"});
    if(!response.ok) return null;
    const snapshot=await response.json();
    return (snapshot.schools||[]).find((item:School)=>item.slug===slug)||null;
  }catch{return null;}
}

export default async function Image({ params }:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const school=await getSchool(slug);

  const name=school?.name || "Climatização nas escolas";
  const network=school?.network || "VOLTA REDONDA";
  const reports=Number(school?.report_count||0);
  const supports=Number(school?.support_count||0);
  const activity=Number(school?.activity_count||0);

  return new ImageResponse(
    <div style={{
      width:"100%",height:"100%",display:"flex",flexDirection:"column",
      background:"#0b0b0b",color:"#f5f2e8",fontFamily:"Arial, Helvetica, sans-serif",
      padding:"58px 68px",position:"relative"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{background:"#ffe600",color:"#050505",fontSize:24,fontWeight:900,padding:"10px 16px",letterSpacing:2}}>
          ESCOLA NÃO É SAUNA
        </div>
        <div style={{fontSize:24,fontWeight:900,color:"#ffe600"}}>{network}</div>
      </div>

      <div style={{display:"flex",flexDirection:"column",flex:1,justifyContent:"center"}}>
        <div style={{fontSize:24,fontWeight:900,color:"#aaa497",letterSpacing:2,marginBottom:12}}>CLIMATIZAÇÃO · VOLTA REDONDA</div>
        <div style={{fontSize:name.length>48?58:72,fontWeight:900,lineHeight:.92,letterSpacing:-3,textTransform:"uppercase",maxWidth:1030}}>
          {name}
        </div>
      </div>

      <div style={{display:"flex",gap:18,borderTop:"3px solid #34322d",paddingTop:22}}>
        <div style={{display:"flex",flexDirection:"column",minWidth:180}}>
          <b style={{fontSize:42,color:"#ffe600"}}>{reports}</b><span style={{fontSize:20}}>relatos</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",minWidth:180}}>
          <b style={{fontSize:42,color:"#ffe600"}}>{supports}</b><span style={{fontSize:20}}>apoios ligados</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",minWidth:180}}>
          <b style={{fontSize:42,color:"#ffe600"}}>{activity}</b><span style={{fontSize:20}}>atividades</span>
        </div>
        <div style={{display:"flex",alignItems:"end",marginLeft:"auto",fontSize:20,fontWeight:900}}>
          alexandrevrabandonada.online
        </div>
      </div>
    </div>,
    size,
  );
}
