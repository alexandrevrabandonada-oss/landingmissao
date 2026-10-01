async(page)=>{
 const errors=[],warnings=[],requests=[];
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.reload();await page.waitForTimeout(1000);
 if(requests.some(u=>/\.wasm|\.data\.|framework\.js/.test(u)))throw Error('Early Unity request');
 await page.getByRole('button',{name:'INICIAR JOGO',exact:true}).click();
 await page.screenshot({path:'output/playwright/beta-loading.png'});
 await page.waitForFunction(()=>document.querySelector('iframe')&&document.querySelector('[role="status"] progress')?.parentElement?.hidden,null,{timeout:60000});
 const frame=page.frames().find(f=>f.url().startsWith('https://vr-cidade-em-disputa-web.vercel.app'));
 if(!frame||!await frame.evaluate(()=>!!window.vrRuntimeReady))throw Error('Unity not ready');
 await frame.waitForFunction(()=>!!document.querySelector('#vr-accessible-status')?.textContent.trim(),null,{timeout:60000});
 await page.screenshot({path:'output/playwright/beta-game-desktop.png'});
 const boot=await frame.evaluate(()=>window.vrBootMs);
 const results=[];for(const [width,height] of [[1280,720],[1366,768],[1920,1080],[390,844],[412,915],[360,800]]){await page.setViewportSize({width,height});await page.waitForTimeout(300);await page.locator('iframe').scrollIntoViewIfNeeded();const size=await frame.evaluate(()=>({width:innerWidth,height:innerHeight,canvasWidth:document.querySelector('canvas').clientWidth,canvasHeight:document.querySelector('canvas').clientHeight}));await page.screenshot({path:`output/playwright/beta-game-${width}x${height}.png`});results.push({width,height,size});}
 await page.setViewportSize({width:1280,height:720});await page.getByRole('button',{name:'ABRIR EM TELA CHEIA',exact:true}).click();
 await page.waitForTimeout(500);const full=await page.evaluate(()=>!!document.fullscreenElement);if(!full)throw Error('Fullscreen not entered');await page.screenshot({path:'output/playwright/beta-fullscreen.png'});await page.keyboard.press('Escape');await page.waitForTimeout(500);const exited=await page.evaluate(()=>!document.fullscreenElement);
 if(!exited)throw Error('Escape did not exit fullscreen');
 return {test:'BETA_EMBEDDED_PLAYER',pass:errors.length===0,errors,knownUnityWarnings:warnings.length,bootMs:boot,fullscreen:{entered:full,escapeExited:exited},viewports:results,runtimeRequests:requests.filter(u=>/\.wasm|\.data\.|framework\.js/.test(u))};
}
