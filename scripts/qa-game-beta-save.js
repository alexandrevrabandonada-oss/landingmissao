async(page)=>{
 const host=new URL(await page.getByRole('link',{name:'Abrir em nova janela ↗',exact:true}).getAttribute('href')).origin;
 async function state(frame){return await frame.evaluate(()=>new Promise((resolve,reject)=>{const open=indexedDB.open('/idbfs');open.onerror=()=>reject(Error('IDB'));open.onsuccess=()=>{const db=open.result;const request=db.transaction('FILE_DATA','readonly').objectStore('FILE_DATA').getAll();request.onsuccess=()=>{db.close();for(const record of request.result){if(!record.contents)continue;const text=new TextDecoder().decode(record.contents),key=text.indexOf('vr-cidade-slot-1');if(key<0)continue;const start=text.indexOf('{',key);let depth=0,quoted=false,escaped=false;for(let i=start;i<text.length;i++){const c=text[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='{')depth++;else if(c==='}'&&--depth===0){resolve(JSON.parse(text.slice(start,i+1)));return;}}}reject(Error('Real PlayerPrefs slot absent'));};};}));}
 let frame=page.frames().find(f=>f.url().startsWith(host));const before=await state(frame);
 await page.reload();await page.getByRole('button',{name:'INICIAR JOGO',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[role="status"] progress')?.parentElement?.hidden,null,{timeout:60000});frame=page.frames().find(f=>f.url().startsWith(host));
 await frame.waitForFunction(()=>!!document.querySelector('#vr-accessible-status')?.textContent.trim(),null,{timeout:60000});
 await frame.locator('canvas').click();await page.keyboard.press('F9',{delay:100});await page.waitForTimeout(800);await page.keyboard.press('F5',{delay:100});await page.waitForTimeout(1800);const after=await state(frame);
 const changed=Object.keys(before).filter(k=>k!=='playSeconds'&&JSON.stringify(before[k])!==JSON.stringify(after[k]));
 if(changed.length)throw Error('Embedded save lost '+changed.join(','));
 await page.screenshot({path:'output/playwright/beta-embedded-save-reloaded.png'});
 return {test:'REAL_EMBEDDED_SAVE_REFRESH_F9_F5',pass:true,comparedFields:Object.keys(before).length-1,differences:changed,position:[after.x,after.z],schema:after.schemaVersion,storage:'Readonly IndexedDB inspection; save/load only via real keyboard'};
}
