import { NextRequest,NextResponse } from 'next/server';
export const dynamic='force-dynamic';
const UPSTREAM='https://blimjnitngthldhazvwh.supabase.co/functions/v1/game-beta-public';
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 if(origin!==req.nextUrl.origin)return NextResponse.json({ok:false},{status:403});
 const text=await req.text();if(text.length>10000)return NextResponse.json({ok:false},{status:413});
 try{const result=await fetch(UPSTREAM,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://www.alexandrevrabandonada.online'},body:text,signal:AbortSignal.timeout(10000),cache:'no-store'});return new NextResponse(await result.text(),{status:result.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});}catch{return NextResponse.json({ok:false,error:'temporarily_unavailable'},{status:503});}
}
