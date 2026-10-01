"""Private Playwright auth helper. Bypass stays in .vercel; never in public assets or QA report."""
import json,subprocess,sys
from pathlib import Path
from urllib.parse import urlsplit
url,project=sys.argv[1:3]
subprocess.run(['vercel.cmd','curl','/','--deployment',url,'--','--silent','--output','NUL'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
r=subprocess.check_output(['vercel.cmd','api','/v9/projects/'+project,'--scope','alexandrevrabandonada-oss-projects','--raw'],text=True,encoding='utf-8')
j=json.loads(r); secret=next(iter(j['protectionBypass']))
origin=urlsplit(url).scheme+'://'+urlsplit(url).netloc
code='async(page)=>{await page.route('+json.dumps(origin+'/**')+',r=>r.continue({headers:{...r.request().headers(),"x-vercel-protection-bypass":'+json.dumps(secret)+'}}));await page.goto('+json.dumps(url)+');return {test:"PROTECTED_PREVIEW_AUTH",url:page.url()};}'
Path('.vercel/auth-qa.js').write_text(code,encoding='utf-8')
print('Private preview access prepared; protection stays enabled.')
