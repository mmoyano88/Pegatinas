'use strict';
const $ = selector => document.querySelector(selector);
const menuScreen = $('#menuScreen'), gameScreen = $('#gameScreen'), adultScreen = $('#adultScreen');
const gamesGrid = $('#gamesGrid'), homeButton = $('#homeButton'), soundButton = $('#soundButton');
let games = [], stickers = [], soundOn = true, currentGame = null, toastTimer = null;
const COLORS = ['#e53935','#ff7043','#ff9800','#ffc107','#ffeb3b','#cddc39','#8bc34a','#4caf50','#009688','#00bcd4','#4fc3f7','#2196f3','#3f51b5','#673ab7','#9c27b0','#e91e63','#f48fb1','#ce93d8','#ffccbc','#a1887f','#795548','#bdbdbd','#757575','#263238'];
function notify(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}
function beep(freq=600,duration=.09){if(!soundOn)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.07,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);osc.onended=()=>ctx.close()}catch(e){}}
function updateSoundButton(){soundButton.textContent=soundOn?'🔊':'🔇';soundButton.title=soundOn?'Sonido activado':'Sonido desactivado';soundButton.setAttribute('aria-label',soundOn?'Silenciar sonidos':'Activar sonidos')}
soundButton.addEventListener('click',()=>{soundOn=!soundOn;updateSoundButton();if(soundOn)beep(660);notify(soundOn?'Sonidos activados':'Sonidos silenciados')});
function showScreen(screen){[menuScreen,gameScreen,adultScreen].forEach(s=>s.classList.add('hidden'));screen.classList.remove('hidden');$('#app').classList.toggle('is-drawing',screen===gameScreen&&!!currentGame&&currentGame.id==='dibujar')}
function makeTile(game){const b=document.createElement('button');b.className='game-tile';b.style.setProperty('--tile-bg',game.color);b.innerHTML=`<span class="tile-art" aria-hidden="true">${game.icon}</span><span class="tile-label">${game.name}</span>`;b.addEventListener('click',()=>openGame(game));return b}
function renderMenu(){gamesGrid.innerHTML='';games.forEach(g=>gamesGrid.appendChild(makeTile(g)));}
function openGame(game){currentGame=game;showScreen(gameScreen);beep(520);if(game.id==='dibujar'){renderDrawingGame();return}if(game.id==='globos'){renderBalloons();return}if(game.id==='jardin'){renderGarden();return}if(game.id==='parejas'){renderMemory();return}renderPlaceholder(game)}
function renderPlaceholder(game){gameScreen.innerHTML=`<div class="game-panel"><h1 class="game-title">${game.name}</h1><div class="placeholder-card"><div class="placeholder-hero">${game.icon}</div><h2>¡Este juego está en preparación!</h2><p>Estamos construyendo Pegatinas poco a poco. Este juego tendrá botones grandes, dibujos divertidos y nada de puntuaciones ni castigos.</p><div class="pill-row"><button class="primary-button" id="backToMenu">Volver a jugar</button></div></div></div>`;$('#backToMenu').addEventListener('click',goHome)}
function goHome(){currentGame=null;showScreen(menuScreen);gameScreen.innerHTML='';beep(440)}
// La casita vuelve al menú con un toque y abre la zona adulta manteniéndola pulsada.
let homeLongPress=false,homePressTimer=null;
homeButton.addEventListener('pointerdown',()=>{homeLongPress=false;homePressTimer=setTimeout(()=>{homeLongPress=true;openAdultZone()},1100)});
['pointerup','pointerleave','pointercancel'].forEach(ev=>homeButton.addEventListener(ev,()=>clearTimeout(homePressTimer)));
homeButton.addEventListener('click',()=>{if(homeLongPress){homeLongPress=false;return}if(!adultScreen.classList.contains('hidden')){goHome();return}if(!gameScreen.classList.contains('hidden'))goHome();else notify('Mantén pulsada la casita para la zona de adultos')});
function openAdultZone(){showScreen(adultScreen);$('#adultMessage').textContent='Aquí se irán reuniendo las creaciones, las fotos y los ajustes. Los archivos personales permanecen en el dispositivo.';beep(360)}
$('#adultBack').addEventListener('click',goHome);
document.querySelectorAll('[data-adult]').forEach(button=>button.addEventListener('click',()=>{const which=button.dataset.adult;const messages={drawings:'Los dibujos que guardes se podrán consultar aquí. De momento, usa “Guardar dibujo” en el juego Dibujar.',photos:'La selección de fotos y la creación de puzles se añadirán en una siguiente fase.',coloring:'Aquí incorporaremos dibujos preparados para colorear, con zonas cerradas.',content:'Las colecciones se organizarán en archivos de catálogo para poder ampliarlas sin rehacer la app.'};$('#adultMessage').textContent=messages[which]||'Próximamente.';beep(480)}));
function renderDrawingGame(){
 gameScreen.innerHTML=`<div class="game-panel drawing-panel" id="drawPanel">
  <div class="draw-side draw-left">
   <div class="draw-group" id="modeGroup">
    <button id="brushMode" class="tool-btn selected" aria-label="Pincel">🖍️</button>
    <button id="eraserButton" class="tool-btn" aria-label="Goma de borrar">🧽</button>
    <button id="stickerMode" class="tool-btn" aria-label="Pegatinas">⭐</button>
   </div>
   <div class="draw-group" id="sizeGroup">
    <button class="tool-btn size-btn" data-brush="6" aria-label="Pincel fino"><i style="--d:8px"></i></button>
    <button class="tool-btn size-btn selected" data-brush="14" aria-label="Pincel mediano"><i style="--d:17px"></i></button>
    <button class="tool-btn size-btn" data-brush="28" aria-label="Pincel grueso"><i style="--d:28px"></i></button>
   </div>
   <div class="draw-group hidden" id="stickerActions">
    <button id="biggerSticker" class="tool-btn" aria-label="Pegatina más grande">➕</button>
    <button id="smallerSticker" class="tool-btn" aria-label="Pegatina más pequeña">➖</button>
    <button id="deleteSticker" class="tool-btn" aria-label="Quitar pegatina">🗑️</button>
   </div>
  </div>
  <div class="draw-center">
   <div class="canvas-wrap"><canvas id="drawingCanvas" aria-label="Lienzo para dibujar con el dedo"></canvas></div>
   <div class="draw-bottom">
    <div id="colorBar" class="scroll-bar" aria-label="Colores. Desliza para ver más"></div>
    <div id="stickerBar" class="scroll-bar hidden" aria-label="Pegatinas. Desliza para ver más"></div>
   </div>
  </div>
  <div class="draw-side draw-right">
   <button id="undoButton" class="tool-btn" aria-label="Deshacer">↩️</button>
   <button id="clearButton" class="tool-btn" aria-label="Limpiar todo">🧹</button>
   <button id="saveButton" class="tool-btn save-btn" aria-label="Guardar dibujo">💾</button>
  </div>
 </div>`;
 const panel=$('#drawPanel'),canvas=$('#drawingCanvas'),ctx=canvas.getContext('2d');
 const state={color:COLORS[0],brush:14,mode:'brush',erasing:false,selectedId:null,items:[],history:[],nextId:1,drawing:false,drawingPointer:null,currentStroke:null};
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const dimensions=()=>({w:canvas.clientWidth,h:canvas.clientHeight});
 const minDim=()=>Math.max(1,Math.min(canvas.clientWidth,canvas.clientHeight));
 const selectedItem=()=>state.items.find(x=>x.type==='sticker'&&x.id===state.selectedId)||null;
 // Cada trazo y cada pegatina son elementos independientes; el historial guarda copias para poder deshacer.
 function saveHistory(){state.history.push(JSON.stringify({items:state.items,nextId:state.nextId}));if(state.history.length>40)state.history.shift()}
 function drawStroke(item){if(!item.points.length)return;const {w,h}=dimensions();ctx.save();ctx.beginPath();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=item.color;ctx.lineWidth=item.width*minDim();ctx.moveTo(item.points[0].x*w,item.points[0].y*h);for(let i=1;i<item.points.length;i++)ctx.lineTo(item.points[i].x*w,item.points[i].y*h);if(item.points.length===1)ctx.lineTo(item.points[0].x*w+.1,item.points[0].y*h+.1);ctx.stroke();ctx.restore()}
 function drawSticker(item){const {w,h}=dimensions(),size=item.size*minDim();ctx.save();if(item.id===state.selectedId){ctx.beginPath();ctx.arc(item.x*w,item.y*h,size*.66,0,Math.PI*2);ctx.strokeStyle='#f3a342';ctx.lineWidth=4;ctx.setLineDash([7,5]);ctx.stroke();ctx.setLineDash([])}ctx.font=`${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(item.symbol,item.x*w,item.y*h);ctx.restore()}
 function redraw(){const {w,h}=dimensions();if(!w||!h)return;const dpr=window.devicePixelRatio||1;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(dpr,0,0,dpr,0,0);state.items.forEach(item=>item.type==='stroke'?drawStroke(item):drawSticker(item));if(state.currentStroke)drawStroke(state.currentStroke)}
 function resizeCanvas(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=window.devicePixelRatio||1;canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);redraw()}
 new ResizeObserver(resizeCanvas).observe(canvas.parentElement);setTimeout(resizeCanvas,0);
 function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height}}
 function pixelDist(a,b){const {w,h}=dimensions();return Math.hypot((a.x-b.x)*w,(a.y-b.y)*h)}
 function findSticker(p){const {w,h}=dimensions();for(let i=state.items.length-1;i>=0;i--){const item=state.items[i];if(item.type!=='sticker')continue;const radius=Math.max(item.size*minDim()*.62,30);if(Math.hypot((p.x-item.x)*w,(p.y-item.y)*h)<=radius)return item}return null}
 // Muestra solo lo que hace falta en cada modo.
 function updateTools(){
  const stk=state.mode==='sticker';
  $('#brushMode').classList.toggle('selected',state.mode==='brush'&&!state.erasing);
  $('#eraserButton').classList.toggle('selected',state.erasing);
  $('#stickerMode').classList.toggle('selected',stk);
  $('#sizeGroup').classList.toggle('hidden',stk);
  $('#stickerActions').classList.toggle('hidden',!stk);
  $('#colorBar').classList.toggle('hidden',stk);
  $('#stickerBar').classList.toggle('hidden',!stk);
  panel.style.setProperty('--cur',state.erasing?'#9fb4c0':state.color);
 }
 function useBrush(){state.mode='brush';state.erasing=false;state.selectedId=null;updateTools();redraw()}
 $('#brushMode').addEventListener('click',()=>{useBrush();beep(560,.05)});
 $('#eraserButton').addEventListener('click',()=>{state.mode='brush';state.erasing=true;state.selectedId=null;updateTools();redraw();beep(480,.05)});
 $('#stickerMode').addEventListener('click',()=>{state.mode='sticker';state.erasing=false;state.drawing=false;state.currentStroke=null;updateTools();redraw();beep(620,.05)});
 const colorBar=$('#colorBar');
 COLORS.forEach((c,i)=>{const b=document.createElement('button');b.className='color-dot'+(i===0?' selected':'');b.style.background=c;b.setAttribute('aria-label','Color '+(i+1));b.addEventListener('click',()=>{state.color=c;colorBar.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');useBrush();beep(700,.04)});colorBar.appendChild(b)});
 document.querySelectorAll('[data-brush]').forEach(b=>b.addEventListener('click',()=>{state.brush=Number(b.dataset.brush);document.querySelectorAll('[data-brush]').forEach(x=>x.classList.toggle('selected',x===b));state.mode='brush';state.selectedId=null;updateTools();redraw();beep(560,.04)}));
 // Al tocar una pegatina de la bandeja aparece en el lienzo, ya seleccionada. Cada toque añade una pegatina nueva.
 const stickerBar=$('#stickerBar');
 stickers.forEach(sticker=>{const b=document.createElement('button');b.className='sticker-choice';b.textContent=sticker.symbol;b.setAttribute('aria-label',sticker.name);b.addEventListener('click',()=>{saveHistory();const n=state.items.filter(x=>x.type==='sticker').length;const item={type:'sticker',id:state.nextId++,symbol:sticker.symbol,name:sticker.name,x:clamp(.5+((n%5)-2)*.05,.1,.9),y:clamp(.5+((n%3)-1)*.06,.1,.9),size:.14};state.items.push(item);state.selectedId=item.id;redraw();beep(640,.06)});stickerBar.appendChild(b)});
 // Dedos sobre el lienzo.
 const pointers=new Map();let drag=null,pinch=null;
 canvas.addEventListener('pointerdown',e=>{
  e.preventDefault();try{canvas.setPointerCapture(e.pointerId)}catch(_){}
  const p=point(e);pointers.set(e.pointerId,p);
  if(state.mode==='sticker'){
   if(pointers.size===2){const sel=selectedItem();if(sel){const [a,b]=[...pointers.values()];pinch={startDist:Math.max(1,pixelDist(a,b)),startSize:sel.size,moved:false};drag=null}return}
   if(pointers.size>1)return;
   const found=findSticker(p);
   if(found){state.selectedId=found.id;drag={id:found.id,dx:found.x-p.x,dy:found.y-p.y,sx:p.x,sy:p.y,moved:false};beep(570,.05)}
   else{state.selectedId=null;drag=null}
   redraw();return;
  }
  if(state.drawing)return;
  state.selectedId=null;saveHistory();state.drawing=true;state.drawingPointer=e.pointerId;
  state.currentStroke={type:'stroke',color:state.erasing?'#fff':state.color,width:(state.erasing?state.brush*2:state.brush)/minDim(),points:[p]};redraw();
 });
 canvas.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;
  const p=point(e);pointers.set(e.pointerId,p);
  if(state.mode==='sticker'){
   e.preventDefault();
   if(pinch&&pointers.size>=2){const sel=selectedItem();if(!sel)return;const [a,b]=[...pointers.values()];if(!pinch.moved){saveHistory();pinch.moved=true}sel.size=clamp(pinch.startSize*pixelDist(a,b)/pinch.startDist,.035,.45);redraw();return}
   if(drag&&pointers.size===1){const sel=selectedItem();if(!sel)return;if(!drag.moved){if(pixelDist(p,{x:drag.sx,y:drag.sy})<6)return;saveHistory();drag.moved=true}sel.x=clamp(p.x+drag.dx,0,1);sel.y=clamp(p.y+drag.dy,0,1);redraw()}
   return;
  }
  if(state.drawing&&state.drawingPointer===e.pointerId&&state.currentStroke){e.preventDefault();state.currentStroke.points.push(p);redraw()}
 });
 function endPointer(e){
  pointers.delete(e.pointerId);
  if(state.drawing&&state.drawingPointer===e.pointerId){state.drawing=false;state.drawingPointer=null;if(state.currentStroke){state.items.push(state.currentStroke);state.currentStroke=null;redraw()}}
  if(pointers.size<2)pinch=null;
  if(pointers.size===0)drag=null;
 }
 canvas.addEventListener('pointerup',endPointer);canvas.addEventListener('pointercancel',endPointer);
 $('#undoButton').addEventListener('click',()=>{if(!state.history.length){notify('Todavía no hay nada que deshacer.');return}const previous=JSON.parse(state.history.pop());state.items=previous.items;state.nextId=previous.nextId;state.selectedId=null;state.currentStroke=null;state.drawing=false;redraw();updateTools();beep(430)});
 function resizeSelected(amount){const item=selectedItem();if(!item){notify('Toca una pegatina del lienzo para elegirla.');return}saveHistory();item.size=clamp(item.size+amount,.035,.45);redraw();beep(620,.05)}
 $('#smallerSticker').addEventListener('click',()=>resizeSelected(-.03));$('#biggerSticker').addEventListener('click',()=>resizeSelected(.03));
 $('#deleteSticker').addEventListener('click',()=>{const i=state.items.findIndex(x=>x.type==='sticker'&&x.id===state.selectedId);if(i<0){notify('Toca una pegatina del lienzo para elegirla.');return}saveHistory();state.items.splice(i,1);state.selectedId=null;redraw();beep(400)});
 $('#clearButton').addEventListener('click',()=>{if(!state.items.length){notify('El lienzo ya está vacío.');return}saveHistory();state.items=[];state.selectedId=null;redraw();notify('Lienzo limpio. ¡A crear!');beep(390)});
 $('#saveButton').addEventListener('click',()=>{state.selectedId=null;redraw();const a=document.createElement('a');a.download=`pegatinas-${new Date().toISOString().slice(0,10)}.png`;a.href=canvas.toDataURL('image/png');a.click();notify('¡Tu dibujo está listo para guardar!');beep(720,.13)});
 updateTools();
}
function renderBalloons(){gameScreen.innerHTML=`<div class="game-panel"><h1 class="game-title">¡Globos!</h1><p class="game-subtitle">Toca los globos para hacerlos desaparecer.</p><div id="balloonArea" style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(5,minmax(45px,1fr));grid-template-rows:repeat(3,minmax(45px,1fr));gap:8px;padding:10px"></div></div>`;const area=$('#balloonArea');['🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈'].forEach((x,i)=>{const b=document.createElement('button');b.textContent=x;b.style.cssText='border:0;background:#ffffff9c;border-radius:24px;font-size:clamp(35px,6vw,65px);animation:floaty '+(1.7+(i%4)*.25)+'s ease-in-out infinite alternate';b.addEventListener('click',()=>{if(!b.textContent)return;b.textContent='✨';b.style.transform='scale(1.25)';beep(780,.07);setTimeout(()=>{b.textContent='';b.disabled=true;checkBalloons()},180)});area.appendChild(b)});function checkBalloons(){if([...area.children].every(b=>b.disabled)){celebrate();const p=document.createElement('p');p.textContent='¡Muy bien! 🎉';p.style.cssText='position:absolute;inset:45% 0 auto;text-align:center;font-size:36px;font-weight:900';gameScreen.appendChild(p);setTimeout(()=>p.remove(),1700)}}}
function renderGarden(){gameScreen.innerHTML=`<div class="game-panel"><h1 class="game-title">Mi jardín</h1><p class="game-subtitle">Toca una flor o un elemento para ponerlo en el jardín.</p><div id="garden" style="flex:1;min-height:0;border-radius:25px;background:linear-gradient(#c9efff 0 53%,#b7e59a 53%);position:relative;overflow:hidden;box-shadow:var(--tile-shadow)"></div><div class="pill-row" id="gardenTools"></div></div>`;const garden=$('#garden'),tools=$('#gardenTools');['🌷','🌻','🌼','🌳','🦋','🐞','☀️','☁️'].forEach(symbol=>{const b=document.createElement('button');b.className='secondary-button';b.textContent=symbol;b.addEventListener('click',()=>{const item=document.createElement('button');item.textContent=symbol;item.setAttribute('aria-label','Mover '+symbol);item.style.cssText=`position:absolute;left:${8+Math.random()*78}%;top:${8+Math.random()*72}%;font-size:clamp(28px,5vw,55px);border:0;background:transparent;touch-action:none`;garden.appendChild(item);let drag=null;item.addEventListener('pointerdown',e=>{drag={x:e.clientX-item.offsetLeft,y:e.clientY-item.offsetTop};item.setPointerCapture(e.pointerId)});item.addEventListener('pointermove',e=>{if(!drag)return;const r=garden.getBoundingClientRect();item.style.left=Math.max(0,Math.min(90,(e.clientX-r.left-item.offsetWidth/2)/r.width*100))+'%';item.style.top=Math.max(0,Math.min(85,(e.clientY-r.top-item.offsetHeight/2)/r.height*100))+'%'});item.addEventListener('pointerup',()=>drag=null);beep(520)});tools.appendChild(b)})}
function renderMemory(){gameScreen.innerHTML=`<div class="game-panel"><h1 class="game-title">Parejas</h1><p class="game-subtitle">Encuentra dos dibujos iguales.</p><div id="memoryGrid" style="margin:auto;width:min(100%,760px);display:grid;grid-template-columns:repeat(4,minmax(55px,1fr));gap:12px"></div></div>`;const symbols=['🐰','🐰','🐸','🐸','🐱','🐱','🐶','🐶'];for(let i=symbols.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[symbols[i],symbols[j]]=[symbols[j],symbols[i]]}const grid=$('#memoryGrid');let opened=[],matched=0;symbols.forEach(symbol=>{const b=document.createElement('button');b.textContent='❔';b.style.cssText='aspect-ratio:1;border:0;border-radius:22px;background:#fff;box-shadow:var(--tile-shadow);font-size:clamp(30px,5vw,56px)';b.dataset.symbol=symbol;b.addEventListener('click',()=>{if(b.dataset.done||opened.includes(b)||opened.length===2)return;b.textContent=symbol;opened.push(b);beep(540);if(opened.length===2){if(opened[0].dataset.symbol===opened[1].dataset.symbol){opened.forEach(x=>{x.dataset.done='1';x.style.background='#dff5d7'});matched+=2;opened=[];beep(780);if(matched===symbols.length){celebrate();notify('¡Has encontrado todas las parejas!')}}else{const pair=opened.slice();opened=[];setTimeout(()=>pair.forEach(x=>{if(!x.dataset.done)x.textContent='❔'}),750)}}});grid.appendChild(b)})}
function celebrate(){if(!soundOn)return;[660,790,920].forEach((f,i)=>setTimeout(()=>beep(f,.12),i*100));}
async function start(){try{const [g,s]=await Promise.all([fetch('./content/games.json').then(r=>r.json()),fetch('./content/stickers.json').then(r=>r.json())]);games=g;stickers=s;renderMenu()}catch(e){games=[{id:'dibujar',name:'Dibujar',icon:'🖍️',color:'#ffe7d4'}];stickers=[];renderMenu();notify('No se pudo cargar todo el contenido; prueba a recargar la app.')}updateSoundButton();if('serviceWorker'in navigator&&location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(()=>{})}}
start();
