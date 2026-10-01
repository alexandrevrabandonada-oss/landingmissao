async (page)=>{
 const network=[];page.on('request',r=>network.push(r.url()));
 const unexpected=()=>network.filter(u=>/\.wasm|\.data(?:\.|$)|framework\.js/.test(u));
 await page.reload();await page.waitForTimeout(1800);
 const prior=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(u=>/\.wasm|\.data(?:\.|$)|framework\.js/.test(u)));
 if(prior.length||unexpected().length)throw Error('Unity downloaded on home');
 const card=page.getByRole('region',{name:'VR: CIDADE EM DISPUTA'});await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(img=>img.decode());
 await page.screenshot({path:'output/playwright/beta-home-desktop.png',fullPage:true});await card.screenshot({path:'output/playwright/beta-card.png'});
 await page.getByRole('link',{name:'JOGAR AGORA',exact:true}).click();await page.waitForTimeout(2000);
 if(await page.locator('iframe').count()||unexpected().length)throw Error('Player downloaded before start');
 await page.screenshot({path:'output/playwright/beta-preload-desktop.png',fullPage:true});
 const viewports=[];
 for(const [width,height] of [[1280,720],[1366,768],[1920,1080],[390,844],[412,915],[360,800]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(250);
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,start:!!document.querySelector('button')}));
  if(layout.scrollWidth>width+1)throw Error('Horizontal overflow');
  await page.screenshot({path:`output/playwright/beta-preload-${width}x${height}.png`,fullPage:true});viewports.push(layout);
 }
 await page.setViewportSize({width:390,height:844});await page.getByRole('link',{name:'Voltar à home'}).click();await page.waitForTimeout(1000);await page.screenshot({path:'output/playwright/beta-home-mobile.png',fullPage:true});
 await page.getByRole('link',{name:'JOGAR AGORA',exact:true}).click();await page.setViewportSize({width:1280,height:720});
 return {test:'BETA_PRELOAD',pass:true,homeUnityResources:prior,unityRequestsBeforeStart:unexpected(),viewports};
}
