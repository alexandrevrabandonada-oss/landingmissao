async(page)=>{
 const host=new URL(await page.getByRole('link',{name:'Abrir em nova janela ↗',exact:true}).getAttribute('href')).origin;
 const frame=page.frames().find(f=>f.url().startsWith(host));
 if(!frame||!await frame.evaluate(()=>window.vrRuntimeReady))throw Error('Scene not ready');
 await frame.locator('canvas').click();await page.keyboard.press('Escape');
 await page.keyboard.down('d');await page.waitForTimeout(650);await page.keyboard.up('d');
 await page.keyboard.press('F5',{delay:100});await page.waitForTimeout(1800);
 return {test:'REAL_CANONICAL_SAVE_CHECKPOINT',pass:true,host,build:await frame.locator('#identity').textContent(),method:'Real movement and F5; subsequent read-only IDB verification required'};
}
