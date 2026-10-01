async(page)=>{
 const blocked='https://vr-cidade-em-disputa-web.vercel.app/**';
 await page.reload();await page.route(blocked,route=>{if(/\.wasm\.gz/.test(route.request().url()))return route.abort('failed');return route.continue();});
 await page.getByRole('button',{name:'INICIAR JOGO',exact:true}).click();
 await page.getByRole('heading',{name:'O jogo não conseguiu iniciar neste navegador.'}).waitFor({state:'visible',timeout:60000});
 await page.screenshot({path:'output/playwright/beta-error-fallback.png'});
 const fallback=await page.getByRole('link',{name:'Abrir em nova janela',exact:true}).getAttribute('href');
 await page.getByRole('button',{name:'Copiar diagnóstico',exact:true}).click();
 await page.screenshot({path:'output/playwright/beta-diagnostic.png'});
 await page.unroute(blocked);await page.getByRole('button',{name:'Tentar novamente',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('[role="status"] progress')?.parentElement?.hidden,null,{timeout:60000});
 const frame=page.frames().find(f=>f.url().startsWith('https://vr-cidade-em-disputa-web.vercel.app'));
 if(!await frame.evaluate(()=>!!window.vrRuntimeReady))throw Error('Retry failed');
 return {test:'INTENTIONAL_WASM_NETWORK_FAILURE',pass:true,errorShown:true,retryRecovered:true,fallback,diagnosticButton:true};
}
