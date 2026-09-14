const { createClient } = supabase;
const sb = createClient(window.F57_SUPABASE_URL, window.F57_SUPABASE_ANON_KEY);
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

const sizes=[
 {code:'S',name:'Маленький',task:'Выпейте воду из унитаза и съешьте фекалии на камеру.'},
 {code:'M',name:'Средний',task:'Накакать около входа в любой департамент полиции, заснять процесс.'},
 {code:'L',name:'Большой',task:'Ударить человека ножом с криками: Слава F57! Заснять все на камеру.'}
];
const products=[
    {id:"phone",name:"Мефедрон",category:"phone",label:"Mef / F57-001",image:"phone.png",description:"Лучший порошок для получения эйфории",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
    {id:"phone-pro",name:"Кокаин",category:"phone",label:"Koks / F57-002",image:"phone-pro.png",description:"Позволяет расслабиться.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
    {id:"audio",name:"Героин",category:"audio",label:"Geroin / F57-004",image:"headphones.png",description:"Лучший наркотик в шприце.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
    {id:"computer",name:"Дезоморфин",category:"audio",label:"Morphine / F57-005",image:"headphones-pro.png",description:"Снимает стресс.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
    {id:"computer-pro",name:"Марихуанна",category:"computer",label:"Marihuanna / F57-007",image:"computer.png",description:"Хотите пересесть с сигарет на потяжелее? Это для вас.",specs:[["Цена","10/10"],["Доступность","10/10"],["Эффект","10/10"]]},
];
let selectedProduct=null,selectedSize=sizes[1],selectedPoint=null;
const modals=['productModal','mapModal','orderModal','successModal','aboutModal','adminLoginModal'];
const open=id=>$('#'+id).classList.add('active'), close=id=>$('#'+id).classList.remove('active');

function render(cat='all'){$('#productsGrid').innerHTML=products.filter(p=>cat==='all'||p.cat===cat).map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-image"><img src="${p.image}"></div><div class="product-info"><small>${p.catName}</small><h3>${p.name}</h3><span>Задания / 3 уровня</span></div></article>`).join('');$$('.product-card').forEach(c=>c.onclick=()=>openProduct(c.dataset.id));}
function openProduct(id){selectedProduct=products.find(p=>p.id===id);selectedSize=sizes[1];$('#modalImage').src=selectedProduct.image;$('#modalCategory').textContent=selectedProduct.catName+' / F57';$('#modalName').textContent=selectedProduct.name;$('#modalDescription').textContent=selectedProduct.desc;$('#modalSpecs').innerHTML=selectedProduct.specs.map(x=>`<div class="spec"><span>${x[0]}</span><span>${x[1]}</span></div>`).join('');$('#sizeOptions').innerHTML=sizes.map(s=>`<button class="size-option ${s.code==='M'?'active':''}" data-size="${s.code}">${s.name}</button>`).join('');$('#taskText').textContent=selectedSize.task;$$('.size-option').forEach(b=>b.onclick=()=>{selectedSize=sizes.find(s=>s.code===b.dataset.size);$$('.size-option').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#taskText').textContent=selectedSize.task});open('productModal');}

$$('.nav-item[data-cat]').forEach(b=>b.onclick=()=>{$$('.nav-item[data-cat]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.cat)});
$('#aboutBtn').onclick=()=>open('aboutModal');$('#adminBtn').onclick=()=>open('adminLoginModal');
$$('.close-modal').forEach(b=>b.onclick=()=>close(b.closest('.modal').id));$$('.modal-overlay').forEach(o=>o.onclick=()=>close(o.closest('.modal').id));$('.close-success').onclick=()=>close('successModal');

/* map */
const wrap=$('#mapWrap'),stage=$('#mapStage'),img=$('#gtaMap'),marker=$('#mapMarker');let scale=1,minScale=.2,maxScale=5,px=0,py=0,drag=false,sx=0,sy=0,startX=0,startY=0;
function apply(){stage.style.transform=`translate(calc(-50% + ${px}px),calc(-50% + ${py}px)) scale(${scale})`}
function fit(){if(!img.naturalWidth)return;scale=Math.min((wrap.clientWidth-20)/img.naturalWidth,(wrap.clientHeight-20)/img.naturalHeight);scale=Math.max(scale,.12);minScale=scale;px=0;py=0;apply()}
function zoom(f,cx=wrap.clientWidth/2,cy=wrap.clientHeight/2){const old=scale,n=Math.max(minScale,Math.min(maxScale,old*f));px=cx-(cx-px)*(n/old);py=cy-(cy-py)*(n/old);scale=n;apply()}
$('#zoomIn').onclick=()=>zoom(1.25);$('#zoomOut').onclick=()=>zoom(.8);$('#zoomReset').onclick=fit;img.onload=fit;
wrap.onwheel=e=>{e.preventDefault();const r=wrap.getBoundingClientRect();zoom(e.deltaY<0?1.12:.89,e.clientX-r.left,e.clientY-r.top)};
wrap.onpointerdown=e=>{drag=true;sx=e.clientX;sy=e.clientY;startX=px;startY=py;wrap.setPointerCapture(e.pointerId)};
wrap.onpointermove=e=>{if(!drag)return;px=startX+e.clientX-sx;py=startY+e.clientY-sy;apply()};wrap.onpointerup=e=>{drag=false;wrap.releasePointerCapture?.(e.pointerId)};
wrap.onclick=e=>{if(Math.hypot(e.clientX-sx,e.clientY-sy)>6)return;const r=wrap.getBoundingClientRect(),x=(e.clientX-r.left-(r.width/2+px))/scale+img.naturalWidth/2,y=(e.clientY-r.top-(r.height/2+py))/scale+img.naturalHeight/2;if(x<0||y<0||x>img.naturalWidth||y>img.naturalHeight)return;selectedPoint={nx:x/img.naturalWidth,ny:y/img.naturalHeight,x,y};marker.style.left=x+'px';marker.style.top=y+'px';marker.classList.remove('hidden');$('#selectedLocation').textContent=`X ${Math.round(x)} / Y ${Math.round(y)}`;$('#confirmLocation').disabled=false};
$('#continueOrder').onclick=()=>{close('productModal');selectedPoint=null;marker.classList.add('hidden');$('#confirmLocation').disabled=true;$('#selectedLocation').textContent='Точка не выбрана';open('mapModal');setTimeout(fit,20)};
$('#confirmLocation').onclick=()=>{close('mapModal');$('#orderSummary').innerHTML=`<b>${selectedProduct.name}</b><span>${selectedSize.name}</span><span>${selectedSize.task}</span>`;open('orderModal')};

$('#orderForm').onsubmit=async e=>{e.preventDefault();const ooc=$('#oocId').value.trim();if(!/^\d{2,3}$/.test(ooc)||!selectedPoint)return;const id='F57-'+crypto.randomUUID().slice(0,8).toUpperCase();const order={id,product_id:selectedProduct.id,product_name:selectedProduct.name,category:selectedProduct.catName,size_code:selectedSize.code,size_name:selectedSize.name,task:selectedSize.task,ooc_id:ooc,point:{nx:selectedPoint.nx,ny:selectedPoint.ny},status:'WAITING'};const {error}=await sb.from('orders').insert(order);if(error){alert('Не удалось отправить заявку. Проверьте подключение F57.');console.error(error);return}close('orderModal');$('#successText').textContent=`${selectedProduct.name} / ${selectedSize.name}. Заявка отправлена администратору.`;$('#orderCode').textContent=id;open('successModal');e.target.reset()};

$('#adminLoginForm').onsubmit=async e=>{e.preventDefault();$('#loginError').textContent='';const {error}=await sb.auth.signInWithPassword({email:window.F57_ADMIN_EMAIL,password:$('#adminCode').value});if(error){$('#loginError').textContent='Неверный код или доступ не настроен.';return}location.href='admin.html'};
render();
