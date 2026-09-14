const ADMIN_CODE = "F57-ADM-7Q2M-9X4K"; // Demo front-end code. For real security move auth to a Vercel API.

const products = [
  {id:"iphone",name:"Мефедрон",category:"phone",label:"Mef / F57-001",image:"phone.png",description:"Лучший порошок для получения эйфории",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
  {id:"pixel",name:"Кокаин",category:"phone",label:"Koks / F57-002",image:"phone-pro.png",description:"Позволяет расслабиться.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
  {id:"airpods",name:"Героин",category:"audio",label:"Geroin / F57-004",image:"headphones.png",description:"Лучший наркотик в шприце.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
  {id:"sony",name:"Дезоморфин",category:"audio",label:"Morphine / F57-005",image:"headphones-pro.png",description:"Снимает стресс.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
  {id:"computer",name:"Марихуанна",category:"computer",label:"Marihuanna / F57-007",image:"computer.png",description:"Хотите пересесть с сигарет на потяжелее? Это для вас.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
];

const tasks = {
  S:["Выпейте воду из унитаза и съешьте фекалии на камеру."],
  M:["Накакать около входа в любой департамент полиции."],
  L:["Ударить человека ножом с криками: Слава F57!"]
};
const sizes = [{code:"S",name:"Маленький (10 г.)"},{code:"M",name:"Средний (100 г.)"},{code:"L",name:"Большой (1000 г.)"}];
let selectedProduct=null, selectedSize="S", selectedPoint=null;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const modals={product:$("#productModal"),map:$("#mapModal"),order:$("#orderModal"),success:$("#successModal"),about:$("#aboutModal"),admin:$("#adminLoginModal")};
function openModal(m){m.classList.add("active");document.body.style.overflow="hidden"}
function closeModal(m){m.classList.remove("active");if(!$(".modal.active"))document.body.style.overflow=""}
function closeAll(){Object.values(modals).forEach(closeModal)}
function renderProducts(filter="all"){$("#productsGrid").innerHTML=products.filter(p=>filter==="all"||p.category===filter).map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-img"><img src="${p.image}" alt="${p.name}"></div><div class="card-category">${p.label}</div><h3>${p.name}</h3><div class="card-foot"><span class="free-label">FREE</span><button class="open-btn">Открыть</button></div></article>`).join("")}
function openProduct(id){selectedProduct=products.find(p=>p.id===id);selectedSize="S";$("#modalImage").src=selectedProduct.image;$("#modalCategory").textContent=selectedProduct.label;$("#modalName").textContent=selectedProduct.name;$("#modalDescription").textContent=selectedProduct.description;$("#modalSpecs").innerHTML=selectedProduct.specs.map(s=>`<div class="spec"><span>${s[0]}</span><span>${s[1]}</span></div>`).join("");renderSizes();openModal(modals.product)}
function renderSizes(){$("#sizeOptions").innerHTML=sizes.map(s=>`<button class="size-btn ${s.code===selectedSize?"active":""}" data-size="${s.code}">${s.name}</button>`).join("");$("#taskText").textContent=tasks[selectedSize][0]}

$("#productsGrid").addEventListener("click",e=>{const card=e.target.closest(".product-card");if(card)openProduct(card.dataset.id)});
$$('.nav-item[data-category]').forEach(b=>b.addEventListener('click',()=>{$$('.nav-item[data-category]').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.category)}));
$("#sizeOptions").addEventListener("click",e=>{if(e.target.matches(".size-btn")){selectedSize=e.target.dataset.size;renderSizes()}});
$("#continueOrder").addEventListener("click",()=>{closeModal(modals.product);resetMap();openModal(modals.map)});

// GTA map: fit whole image initially, then zoom/pan and place a marker by clicking.
const wrap=$("#mapWrap"), stage=$("#mapStage"), map=$("#gtaMap"), marker=$("#mapMarker");
let scale=1, minScale=1, maxScale=5, panX=0, panY=0, dragging=false, lastX=0,lastY=0;
function applyTransform(){stage.style.transform=`translate(calc(-50% + ${panX}px),calc(-50% + ${panY}px)) scale(${scale})`}
function resetMap(){selectedPoint=null;marker.classList.add("hidden");$("#selectedLocation").textContent="Точка не выбрана";panX=panY=0;scale=minScale||1;applyTransform()}
function fitMap(){const iw=map.naturalWidth||1,ih=map.naturalHeight||1;const s=Math.min(wrap.clientWidth/iw,wrap.clientHeight/ih);minScale=s;scale=s;applyTransform()}
map.addEventListener("load",fitMap);window.addEventListener("resize",()=>{if(!dragging)fitMap()});
$("#zoomIn").onclick=()=>{scale=Math.min(maxScale,scale*1.25);applyTransform()};$("#zoomOut").onclick=()=>{scale=Math.max(minScale,scale/1.25);applyTransform()};$("#zoomReset").onclick=resetMap;
wrap.addEventListener("wheel",e=>{e.preventDefault();const old=scale;scale=Math.max(minScale,Math.min(maxScale,scale*(e.deltaY<0?1.12:.89)));const r=wrap.getBoundingClientRect();const cx=e.clientX-r.left-r.width/2,cy=e.clientY-r.top-r.height/2;panX=cx-(cx-panX)*(scale/old);panY=cy-(cy-panY)*(scale/old);applyTransform()},{passive:false});
wrap.addEventListener("pointerdown",e=>{if(e.button!==0)return;dragging=true;lastX=e.clientX;lastY=e.clientY;wrap.setPointerCapture(e.pointerId)});
wrap.addEventListener("pointermove",e=>{if(!dragging)return;panX+=e.clientX-lastX;panY+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;applyTransform()});
wrap.addEventListener("pointerup",e=>{dragging=false;wrap.releasePointerCapture?.(e.pointerId)});
wrap.addEventListener("click",e=>{if(Math.abs(e.clientX-lastX)>4||Math.abs(e.clientY-lastY)>4)return;const sr=stage.getBoundingClientRect(),x=(e.clientX-sr.left)/scale,y=(e.clientY-sr.top)/scale;if(x<0||y<0||x>map.naturalWidth||y>map.naturalHeight)return;selectedPoint={x,y,nx:x/map.naturalWidth,ny:y/map.naturalHeight};marker.style.left=`${x}px`;marker.style.top=`${y}px`;marker.classList.remove("hidden");$("#selectedLocation").textContent=`Точка выбрана · X ${Math.round(x)} / Y ${Math.round(y)}`;$("#confirmLocation").disabled=false});
$("#confirmLocation").addEventListener("click",()=>{closeModal(modals.map);const size=sizes.find(s=>s.code===selectedSize);$("#orderSummary").innerHTML=`<b>${selectedProduct.name}</b><br>Размер: ${size.name}<br>Задание: ${tasks[selectedSize][0]}<br>Точка: X ${Math.round(selectedPoint.x)} / Y ${Math.round(selectedPoint.y)}`;openModal(modals.order)});

$("#orderForm").addEventListener("submit",e=>{e.preventDefault();const id=$("#oocId").value.trim();if(!/^\d{2,3}$/.test(id)){alert("OOC ID должен содержать 2–3 цифры.");return}const order={id:"F57-"+Math.floor(100000+Math.random()*900000),createdAt:new Date().toISOString(),oocId:id,product:selectedProduct.name,productId:selectedProduct.id,size:sizes.find(s=>s.code===selectedSize).name,task:tasks[selectedSize][0],point:selectedPoint,status:"WAITING"};const orders=JSON.parse(localStorage.getItem("f57_orders")||"[]");orders.unshift(order);localStorage.setItem("f57_orders",JSON.stringify(orders));closeModal(modals.order);$("#successText").textContent=`Заявка ${order.product} зарегистрирована. Срок выполнения задания — 3 дня. После проверки администратором курьер передаст технику на выбранной точке.`;$("#orderCode").textContent=order.id;openModal(modals.success);e.target.reset()});

$("#aboutButton").onclick=()=>openModal(modals.about);$("#adminButton").onclick=()=>{$("#adminCode").value="";$("#loginError").textContent="";openModal(modals.admin)};
$("#adminLoginForm").addEventListener("submit",e=>{e.preventDefault();if($("#adminCode").value===ADMIN_CODE){sessionStorage.setItem("f57_admin","1");location.href="admin.html"}else $("#loginError").textContent="Неверный код доступа."});
$$('.close-modal').forEach(b=>b.onclick=()=>closeModal(b.closest('.modal')));$('.close-success').onclick=()=>closeModal(modals.success);$$('.modal-overlay').forEach(o=>o.onclick=()=>closeModal(o.closest('.modal')));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
renderProducts();
