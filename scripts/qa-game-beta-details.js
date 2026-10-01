async(page)=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const frame=page.frames().find(f=>f.url().startsWith('https://vr-cidade-em-disputa-web.vercel.app'));
 if(!frame||!await frame.evaluate(()=>!!window.vrRuntimeReady))throw Error('Real scene not ready');
 await page.getByRole('button',{name:'ABRIR EM TELA CHEIA',exact:true}).click();
 await page.waitForFunction(()=>!!document.fullscreenElement);
 await frame.locator('canvas').click();await page.keyboard.press('Escape');
 await page.waitForFunction(()=>!document.fullscreenElement);
 await page.locator('#versao').scrollIntoViewIfNeeded();
 await page.screenshot({path:'output/playwright/beta-version.png'});
 await page.locator('#feedback').scrollIntoViewIfNeeded();
 await page.screenshot({path:'output/playwright/beta-feedback.png'});
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);
 await page.getByRole('button',{name:'COPIAR INFORMAÇÕES TÉCNICAS',exact:true}).click();
 await page.getByText('Informações técnicas copiadas.',{exact:true}).waitFor();
 const diagnostic=await page.evaluate(()=>navigator.clipboard.readText());
 const parsed=JSON.parse(diagnostic);
 if(parsed.buildId!=='2026.10.01-public-d'||parsed.webgl!==true||parsed.saveSchema!==4||Object.keys(parsed).length!==8)throw Error('Invalid technical copy');
 if(errors.length)throw Error(JSON.stringify(errors));
 return {test:'BETA_VERSION_FEEDBACK_AND_FOCUSED_ESCAPE',pass:true,canvasFocusedEscapeExited:true,diagnosticCopied:true,diagnostic,errors};
}
