// Load the complete app from the same release directory; expose startup errors.
export async function startGame(load=()=>import('./app.js')){
 const panel=document.getElementById('startupError');
 try{
  await load();
  if(!document.getElementById('course')?.innerHTML.includes('id="surfaceRelief"'))throw new Error('The course did not finish rendering.');
  if(panel)panel.hidden=true;
 }catch(error){
  console.error('Target Practice startup failed:',error);
  if(panel){panel.hidden=false;document.getElementById('startupErrorDetail').textContent=error?.message||String(error);document.getElementById('reloadGame').onclick=()=>{const url=new URL(location.href);url.searchParams.set('reload',Date.now());location.replace(url.href);};}
 }
}
await startGame();
