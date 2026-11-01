// Isolated appearance trial. No app imports, storage, randomness or simulation.
const stage=document.getElementById('roughStage'),svg=document.getElementById('roughScene'),toggle=document.getElementById('roughToggle'),close=document.getElementById('closeUp'),full=document.getElementById('roughFullscreen');
let patch=true,zoom=false,fallback=false;
function frame(){const narrow=stage.clientWidth<=600;svg.setAttribute('viewBox',zoom?'510 320 380 250':narrow?'200 210 680 420':'0 130 960 450');}
toggle.addEventListener('click',()=>{patch=!patch;document.getElementById('heavyPatch').style.display=patch?'':'none';document.getElementById('heavyLabel').style.display=patch?'':'none';toggle.setAttribute('aria-pressed',String(patch));toggle.textContent='Heavy rough: '+(patch?'on':'off');});
close.addEventListener('click',()=>{zoom=!zoom;close.setAttribute('aria-pressed',String(zoom));close.textContent=zoom?'Whole hole':'Close-up';frame();});
function syncFull(){const active=!!document.fullscreenElement||fallback;stage.classList.toggle('fullscreen',active);document.body.classList.toggle('no-scroll',active);full.setAttribute('aria-pressed',String(active));full.textContent=active?'Exit full screen':'Full screen';frame();}
async function exit(){fallback=false;if(document.fullscreenElement)await document.exitFullscreen();syncFull();full.focus();}
full.addEventListener('click',async()=>{if(fallback||document.fullscreenElement){await exit();return;}try{if(!stage.requestFullscreen)throw Error('Use page filling view');await stage.requestFullscreen();}catch{fallback=true;}syncFull();});
document.addEventListener('fullscreenchange',syncFull);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fallback)exit();});new ResizeObserver(frame).observe(stage);frame();
