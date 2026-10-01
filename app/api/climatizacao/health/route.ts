import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Check = {
  ok: boolean;
  status?: number;
  detail?: string;
  latency_ms?: number;
};

async function timedJson(url:string):Promise<{check:Check;data:any}>{
  const start=Date.now();
  try{
    const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(8000)});
    const latency=Date.now()-start;
    if(!response.ok) return {check:{ok:false,status:response.status,latency_ms:latency},data:null};
    const data=await response.json();
    return {check:{ok:true,status:response.status,latency_ms:latency},data};
  }catch(error){
    return {check:{ok:false,detail:error instanceof Error?error.name:"fetch_error",latency_ms:Date.now()-start},data:null};
  }
}

async function timedText(url:string):Promise<Check>{
  const start=Date.now();
  try{
    const response=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(8000)});
    return {ok:response.ok,status:response.status,latency_ms:Date.now()-start};
  }catch(error){
    return {ok:false,detail:error instanceof Error?error.name:"fetch_error",latency_ms:Date.now()-start};
  }
}

export async function GET(request:NextRequest){
  const origin=request.nextUrl.origin;
  const [snapshot,ledger,evidence,data,manifest,worker,rss,push,cases,metrics,resolution]=await Promise.all([
    timedJson(origin+"/api/climatizacao?action=snapshot"),
    timedJson(origin+"/api/climatizacao?action=ledger&limit=1&direction=desc"),
    timedJson(origin+"/api/climatizacao?action=evidence&limit=1"),
    timedJson(origin+"/api/climatizacao/dados?format=json"),
    timedText(origin+"/climatizacao-manifest.webmanifest"),
    timedText(origin+"/climatizacao-sw.js"),
    timedText(origin+"/climatizacao/feed.xml"),
    timedJson(origin+"/api/climatizacao?action=push_key"),
    timedJson(origin+"/api/climatizacao?action=case_overview"),
    timedJson(origin+"/api/climatizacao?action=metrics&school=colegio-prof-themis-de-almeida-vieira&days=30"),
    timedText(origin+"/climatizacao/resolucao"),
  ]);

  const schoolCount=Number(snapshot.data?.summary?.total_schools||0);
  const ledgerHead=ledger.data?.ledger?.head||null;
  const checks={
    public_api:{...snapshot.check,detail:schoolCount===101?"101 escolas":"contagem="+schoolCount},
    ledger:{...ledger.check,detail:ledgerHead?"head #"+ledgerHead.id:"sem head"},
    evidence:{...evidence.check,detail:"catálogo público"},
    open_data:{...data.check,detail:data.data?.schema_version?"schema "+data.data.schema_version:"schema ausente"},
    pwa_manifest:manifest,
    service_worker:worker,
    rss_feed:rss,
    push_public_key:{...push.check,detail:push.data?.public_key?"chave pública configurada":"chave ausente"},
    resolution_cases:{...cases.check,detail:typeof cases.data?.summary?.total==="number"?cases.data.summary.total+" caso(s) público(s)":"resumo ausente"},
    aggregate_metrics:{...metrics.check,detail:metrics.data?.privacy?"série agregada disponível":"série ausente"},
    resolution_page:resolution,
  };

  const ok=Object.values(checks).every((item)=>item.ok) && schoolCount===101;

  return Response.json({
    ok,
    generated_at:new Date().toISOString(),
    school_count:schoolCount,
    ledger_head:ledgerHead,
    checks,
  },{
    status:ok?200:503,
    headers:{
      "Cache-Control":"no-store",
      "Access-Control-Allow-Origin":"*",
    },
  });
}
