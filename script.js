const products = [
  {
    id:"phone", category:"phones", categoryName:"Синтетика",
    name:"Мефедрон", price:200, image:"phone.png",
    description:"Поможет зарядиться энергией на весь день и забыть о внешних проблемах.",
  },
  {
    id:"phone-pro", category:"phones", categoryName:"Синтетика",
    name:"Метамфетамин", price:200, image:"phone-pro.png",
    description:"Хочешь покайфовать от стекла? Это для тебя.",
  },
  {
    id:"audio", category:"audio", categoryName:"Шприцы и прочее",
    name:"Героин", price:200, image:"headphones.png",
    description:"Лучший наркотик в шприце.",
  },
  {
    id:"audio", category:"audio", categoryName:"Шприцы и прочее",
    name:"Кокаин", price:200, image:"headphones.png",
    description:"Настроение на весь день!",
  },
  {
    id:"computer", category:"computers", categoryName:"Трава",
    name:"Марихуанна", price:200, image:"computer.png",
    description:"Подходит для тех, кто хочет снизить напряжение.",
  },
];

const sizes = [
  {name:"Маленький (10 г.)", code:"S", price:100},
  {name:"Средний (20 г.)", code:"M", price:200},
  {name:"Большой (50 г.)", code:"L", price:500}
];

function getSizePrice(code){
  return sizes.find(s => s.code === code)?.price ?? 200;
}

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let currentProduct = null;
let selectedSize = "M";
let selectedPoint = null;

function money(v){return "$" + v.toLocaleString("en-US");}

function renderProducts(list = products){
  $("#productGrid").innerHTML = list.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='assets/placeholder.png'">
      </div>
      <div class="product-info">
        <div class="product-cat">${p.categoryName}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">${money(p.price)}</div>
      </div>
    </article>
  `).join("");
  $$(".product-card").forEach(card => card.addEventListener("click", () => openProduct(card.dataset.id)));
}

function openPage(name){
  $$(".page").forEach(p=>p.classList.remove("active-page"));
  const page = ({catalog:"catalogPage",about:"aboutPage",donate:"donatePage"})[name];
  if(page) $("#"+page).classList.add("active-page");
  $$(".nav-item").forEach(x=>x.classList.remove("active"));
  const btn = $(`.nav-item[data-page="${name}"]`);
  if(btn) btn.classList.add("active");
}

function openProduct(id){
  currentProduct = products.find(p=>p.id===id);
  selectedSize = "M";
  $("#productDetail").innerHTML = `
    <div class="product-detail">
      <div class="detail-image"><img src="${currentProduct.image}" onerror="this.src='assets/placeholder.png'" alt=""></div>
      <div class="detail-copy">
        <div class="eyebrow">${currentProduct.categoryName} / F57</div>
        <h2>${currentProduct.name}</h2>
        <div class="detail-description">${currentProduct.description}</div>
        <div class="detail-price" id="detailPrice">${money(getSizePrice(selectedSize))}</div>
        <div class="size-label">Размер</div>
        <div class="size-options">
          ${sizes.map(s=>`<button class="size-option ${s.code==="M"?"active":""}" data-size="${s.code}">${s.name}</button>`).join("")}
        </div>
        <button class="primary-btn" id="buyProduct">Перейти к получению</button>
      </div>
    </div>
  `;
  $$(".size-option").forEach(b=>b.addEventListener("click",()=>{
    selectedSize=b.dataset.size;
    $$(".size-option").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    $("#detailPrice").textContent = money(getSizePrice(selectedSize));
  }));
  $("#buyProduct").addEventListener("click",()=>openMap());
  $("#productModal").classList.add("open");
}

function closeModal(id){$("#"+id).classList.remove("open");}
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));

$$(".nav-item[data-category]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const cat=btn.dataset.category;
    openPage("catalog");
    $$(".nav-item").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(products.filter(p=>p.category===cat));
  });
});
$$(".nav-item[data-page]").forEach(btn=>btn.addEventListener("click",()=>openPage(btn.dataset.page)));

$("#donateForm").addEventListener("submit",e=>{
  e.preventDefault();
  $("#successText").textContent="Пожертвование принято. Спасибо за поддержку проекта.";
  $("#successModal").classList.add("open");
  e.target.reset();
});

$("#checkoutForm").addEventListener("submit",e=>{
  e.preventDefault();
  if($("#wallet").value.trim()!==$("#walletConfirm").value.trim()){
    alert("Адреса кошелька не совпадают.");
    return;
  }
  closeModal("checkoutModal");
  $("#successText").textContent=`Заказ ${currentProduct.name} (${sizes.find(s=>s.code===selectedSize).name}) на сумму ${money(getSizePrice(selectedSize))} принят. Вы получите уведомление, когда курьер прибудет к выбранной точке.`;
  $("#successModal").classList.add("open");
  e.target.reset();
});

/* ---------------- GTA V MAP: fit + zoom + pan + point selection ---------------- */
const viewport = $("#mapViewport");
const world = $("#mapWorld");
const mapImg = $("#gtaMap");
let mapScale=1, mapX=0, mapY=0, dragging=false, startX=0, startY=0, startMapX=0, startMapY=0;
const IMG_W=1536, IMG_H=2048;

function fitMap(){
  const r=viewport.getBoundingClientRect();
  mapScale=Math.min((r.width-30)/IMG_W,(r.height-30)/IMG_H);
  mapScale=Math.max(mapScale,.15);
  mapX=(r.width-IMG_W*mapScale)/2;
  mapY=(r.height-IMG_H*mapScale)/2;
  applyMap();
}
function applyMap(){world.style.transform=`translate(${mapX}px,${mapY}px) scale(${mapScale})`;}
function zoomAt(factor,cx,cy){
  const old=mapScale;
  const next=Math.max(.2,Math.min(5,old*factor));
  const ratio=next/old;
  mapX=cx-(cx-mapX)*ratio;
  mapY=cy-(cy-mapY)*ratio;
  mapScale=next;
  applyMap();
}
function openMap(){
  closeModal("productModal");
  $("#mapModal").classList.add("open");
  selectedPoint=null;
  $("#selectedPoint").textContent="Не выбрана";
  $("#confirmPoint").disabled=true;
  setTimeout(fitMap,30);
}
$("#zoomIn").addEventListener("click",()=>zoomAt(1.25,viewport.clientWidth/2,viewport.clientHeight/2));
$("#zoomOut").addEventListener("click",()=>zoomAt(.8,viewport.clientWidth/2,viewport.clientHeight/2));
$("#zoomReset").addEventListener("click",fitMap);
viewport.addEventListener("wheel",e=>{
  e.preventDefault();
  const r=viewport.getBoundingClientRect();
  zoomAt(e.deltaY<0?1.14:.88,e.clientX-r.left,e.clientY-r.top);
},{passive:false});
viewport.addEventListener("pointerdown",e=>{
  dragging=true;viewport.setPointerCapture(e.pointerId);
  startX=e.clientX;startY=e.clientY;startMapX=mapX;startMapY=mapY;
});
viewport.addEventListener("pointermove",e=>{
  if(!dragging)return;
  mapX=startMapX+(e.clientX-startX);mapY=startMapY+(e.clientY-startY);applyMap();
});
viewport.addEventListener("pointerup",e=>{dragging=false;try{viewport.releasePointerCapture(e.pointerId)}catch{}});
viewport.addEventListener("pointercancel",()=>dragging=false);
viewport.addEventListener("click",e=>{
  if(Math.hypot(e.clientX-startX,e.clientY-startY)>6)return;
  const r=viewport.getBoundingClientRect();
  const px=(e.clientX-r.left-mapX)/mapScale;
  const py=(e.clientY-r.top-mapY)/mapScale;
  if(px<0||py<0||px>IMG_W||py>IMG_H)return;
  selectedPoint={x:px,y:py};
  const marker=$("#mapMarker");
  marker.style.left=px+"px";marker.style.top=py+"px";marker.style.display="block";
  $("#selectedPoint").textContent=`Точка: X ${Math.round(px)} / Y ${Math.round(py)}`;
  $("#confirmPoint").disabled=false;
});
window.addEventListener("resize",()=>{if($("#mapModal").classList.contains("open"))fitMap()});
$("#confirmPoint").addEventListener("click",()=>{
  $("#mapModal").classList.remove("open");
  $("#checkoutProduct").textContent=`${currentProduct.name} · ${sizes.find(s=>s.code===selectedSize).name} · ${money(getSizePrice(selectedSize))} · точка ${Math.round(selectedPoint.x)}, ${Math.round(selectedPoint.y)}`;
  $("#checkoutModal").classList.add("open");
});
mapImg.addEventListener("load",fitMap);

/* ---------------- Fictional police RP panel ---------------- */
$("#policeTrigger").addEventListener("click",()=>$("#policePanel").classList.add("open"));
$("#closePolice").addEventListener("click",()=>$("#policePanel").classList.remove("open"));

function policeLog(lines){
  $("#policeOutput").innerHTML=lines.map(x=>`<div class="terminal-line ${x.type||""}">${x.text||x}</div>`).join("");
}
$$(".investigate-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const action=btn.dataset.action;
    if(action==="hack"){startHack();return}
    if(action==="server"){
      policeLog([
        "[LSPD] SERVER ADDRESS CHECK",
        "Endpoint: F57 / CLOSED NODE",
        "Result: узел находится за многоуровневым русскоязычным VPN.",
        "Public DNS: unavailable",
        "Direct attribution: FAILED"
      ].map(text=>({text})));
    }
    if(action==="ip"){
      policeLog([
        "[LSPD] IP TRACE",
        "Запрос отправлен...",
        "Relay 01 ........ OK",
        "Relay 02 ........ OK",
        "Relay 03 ........ OK",
        "Origin .......... MASKED",
        "Result: вычисление IP невозможно без компрометации закрытого узла."
      ].map((text,i)=>({text,type:i===6?"warn":""})));
    }
    if(action==="trace"){
      policeLog([
        "[LSPD] ROUTE ANALYSIS",
        "CLIENT → RELAY → CLOSED VPN → F57",
        "Маршрут обрывается на внутреннем VPN-шлюзе.",
        "Следующая попытка потребует доступа к панели администрирования."
      ].map(text=>({text})));
    }
  });
});

/* ---------------- Memory sequence minigame ---------------- */
let hackLevel=1, sequence=[], inputIndex=0, accepting=false, hackTimer=null;
function randomSequence(length){
  const arr=[];
  while(arr.length<length){
    const n=Math.floor(Math.random()*6);
    if(arr.length===0 || arr[arr.length-1]!==n) arr.push(n);
  }
  return arr;
}
function startHack(){
  $("#policePanel").classList.remove("open");
  $("#hackModal").classList.add("open");
  hackLevel=1;
  beginHackLevel();
}
function beginHackLevel(){
  accepting=false;inputIndex=0;sequence=randomSequence(hackLevel);
  $("#hackLevel").textContent=`LEVEL ${hackLevel} / 6`;
  $("#hackInstruction").textContent="Запомните последовательность.";
  $("#hackStatus").textContent="SEQUENCE PLAYBACK";
  $("#sequenceGrid").innerHTML=Array.from({length:6},(_,i)=>`<button class="seq-cell" data-index="${i}"></button>`).join("");
  const cells=$$(".seq-cell");
  let i=0;
  clearInterval(hackTimer);
  hackTimer=setInterval(()=>{
    if(i>=sequence.length){
      clearInterval(hackTimer);
      accepting=true;
      $("#hackInstruction").textContent="Теперь повторите её. Ошибка сбросит уровень.";
      $("#hackStatus").textContent="INPUT READY";
      return;
    }
    cells[sequence[i]].classList.add("lit");
    setTimeout(()=>cells[sequence[i]]?.classList.remove("lit"),320);
    i++;
  },650);
  cells.forEach(cell=>cell.addEventListener("click",()=>handleCell(Number(cell.dataset.index))));
}
function handleCell(index){
  if(!accepting)return;
  const cells=$$(".seq-cell");
  if(index===sequence[inputIndex]){
    cells[index].classList.add("correct");
    setTimeout(()=>cells[index].classList.remove("correct"),160);
    inputIndex++;
    if(inputIndex===sequence.length){
      accepting=false;
      if(hackLevel===6){
        $("#hackStatus").textContent="ACCESS GRANTED";
        $("#hackInstruction").textContent="Административный кеш восстановлен.";
        setTimeout(openMessenger,700);
      }else{
        hackLevel++;
        setTimeout(beginHackLevel,500);
      }
    }
  }else{
    cells[index].classList.add("wrong");
    $("#hackStatus").textContent="WRONG SEQUENCE — LEVEL RESET";
    accepting=false;
    setTimeout(beginHackLevel,900);
  }
}
$("#hackExit").addEventListener("click",()=>{
  clearInterval(hackTimer);
  $("#hackModal").classList.remove("open");
  $("#policePanel").classList.add("open");
});

/* ---------------- Fictional internal messenger ---------------- */
const chats = [
  {name:"Waer",sub:"NO MESSAGES",messages:[]},
  {name:"Sand",sub:"5 messages",messages:[
    ["LETO","Точка по пустыне чистая?"],
    ["SAND","Да. На время поставили запасной пункт. Главное — не светиться на трассе."],
    ["LETO","Где именно?"],
    ["SAND","В Sandy. Блок 3013. Не пиши это больше нигде."],
    ["LETO","Принял. После доставки меняем маршрут."]
  ]},
  {name:"Cito",sub:"6 messages",messages:[
    ["LETO","У меня под домом копы! Помоги! Джек надышался и сдох! Что делать!?"],
    ["CITO","Смывай товар."],
    ["LETO","Это самая большая партия! Я не буду! Пришли людей!"],
    ["CITO","Это приказ."],
    ["LETO","Пошел ты!"],
    ["CITO","Я понял. Если тебя не застрелят, это сделают мои люди."],
    ["CITO","Ты больше не часть F57."]
  ]}
];
function openMessenger(){
  $("#hackModal").classList.remove("open");
  $("#messengerPage").classList.add("open");
  renderChats();
  selectChat("Sand");
}
function renderChats(){
  $("#chatList").innerHTML=chats.map(c=>`<div class="chat-item" data-chat="${c.name}">${c.name}<small>${c.sub}</small></div>`).join("");
  $$(".chat-item").forEach(item=>item.addEventListener("click",()=>selectChat(item.dataset.chat)));
}
function selectChat(name){
  const chat=chats.find(c=>c.name===name);
  $$(".chat-item").forEach(x=>x.classList.toggle("active",x.dataset.chat===name));
  $("#chatTitle").textContent=`LETO / ${name}`;
  $("#chatMessages").innerHTML=chat.messages.length
    ? chat.messages.map(m=>`<div class="message"><div class="who">${m[0]}</div><div class="text">${m[1]}</div></div>`).join("")
    : `<div class="empty-chat">NO MESSAGES</div>`;
}

renderProducts();
openPage("catalog");
