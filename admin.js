if(sessionStorage.getItem("f57_admin")!=="1") location.href="index.html";

const $=s=>document.querySelector(s);
const ordersEl=$("#orders");
const mapWrap=$("#adminMapWrap");
const stage=$("#adminMapStage");
const map=$("#adminMap");
const marker=$("#adminMarker");

let scale=1;
let minScale=1;
let maxScale=6;
let panX=0;
let panY=0;
let drag=false;
let moved=false;
let lx=0;
let ly=0;
let selectedOrder=null;

function orders(){
  return JSON.parse(localStorage.getItem("f57_orders")||"[]");
}

function render(){
  const data=orders();
  $("#count").textContent=`${data.length} ЗАКАЗ${data.length===1?'':'ОВ'}`;

  ordersEl.innerHTML=data.length
    ? data.map((o,i)=>`
      <button class="order-row" data-index="${i}">
        <span>
          <b>${o.id}</b>
          <small>${new Date(o.createdAt).toLocaleString('ru-RU')}</small>
        </span>
        <span>
          <b>${o.product}</b>
          <small>${o.size} · OOC ${o.oocId}</small>
        </span>
        <span class="order-status">${o.status}</span>
      </button>`).join("")
    : `<div class="empty">Заявок пока нет.</div>`;
}

function apply(){
  stage.style.transform=`translate(calc(-50% + ${panX}px),calc(-50% + ${panY}px)) scale(${scale})`;
}

function fit(){
  const iw=map.naturalWidth||1;
  const ih=map.naturalHeight||1;
  minScale=Math.min(mapWrap.clientWidth/iw,mapWrap.clientHeight/ih);
  scale=minScale;
  panX=0;
  panY=0;
  apply();

  // If an order was already selected, keep its marker correctly positioned.
  if(selectedOrder) positionMarker(selectedOrder,false);
}

function getPoint(o){
  // New orders store normalized coordinates so the point survives
  // different screen sizes and map rendering dimensions.
  if(o.point && Number.isFinite(Number(o.point.nx)) && Number.isFinite(Number(o.point.ny))){
    return {
      x:Number(o.point.nx)*(map.naturalWidth||1),
      y:Number(o.point.ny)*(map.naturalHeight||1)
    };
  }

  // Backwards compatibility with old orders that stored raw pixels.
  if(o.point && Number.isFinite(Number(o.point.x)) && Number.isFinite(Number(o.point.y))){
    return {x:Number(o.point.x),y:Number(o.point.y)};
  }
  return null;
}

function positionMarker(o,center=true){
  const p=getPoint(o);
  if(!p){
    marker.classList.add("hidden");
    $("#adminPoint").textContent="ТОЧКА НЕ СОХРАНЕНА";
    return;
  }

  marker.style.left=`${p.x}px`;
  marker.style.top=`${p.y}px`;
  marker.classList.remove("hidden");
  $("#adminPoint").textContent=`X ${Math.round(p.x)} / Y ${Math.round(p.y)} · OOC ${o.oocId}`;
  $(".admin-map").classList.add("has-point");

  if(center){
    // Put the chosen delivery point near the center of the admin viewport.
    const r=mapWrap.getBoundingClientRect();
    panX=r.width/2 - (p.x*scale);
    panY=r.height/2 - (p.y*scale);
    apply();
  }
}

function showOrder(o,row){
  selectedOrder=o;
  document.querySelectorAll('.order-row').forEach(x=>x.classList.remove('selected'));
  if(row) row.classList.add('selected');
  positionMarker(o,true);
}

ordersEl.addEventListener('click',e=>{
  const row=e.target.closest('.order-row');
  if(!row)return;
  const o=orders()[Number(row.dataset.index)];
  if(o) showOrder(o,row);
});

map.addEventListener('load',fit);
window.addEventListener('resize',()=>{
  const current=selectedOrder;
  fit();
  if(current) positionMarker(current,false);
});

mapWrap.addEventListener('wheel',e=>{
  e.preventDefault();
  const old=scale;
  const next=Math.max(minScale,Math.min(maxScale,scale*(e.deltaY<0?1.12:.89)));
  const r=mapWrap.getBoundingClientRect();
  const cx=e.clientX-r.left-r.width/2;
  const cy=e.clientY-r.top-r.height/2;
  panX=cx-(cx-panX)*(next/old);
  panY=cy-(cy-panY)*(next/old);
  scale=next;
  apply();
},{passive:false});

mapWrap.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  drag=true;
  moved=false;
  lx=e.clientX;
  ly=e.clientY;
  mapWrap.setPointerCapture(e.pointerId);
});

mapWrap.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-lx;
  const dy=e.clientY-ly;
  if(Math.abs(dx)>2||Math.abs(dy)>2)moved=true;
  panX+=dx;
  panY+=dy;
  lx=e.clientX;
  ly=e.clientY;
  apply();
});

mapWrap.addEventListener('pointerup',e=>{
  drag=false;
  mapWrap.releasePointerCapture?.(e.pointerId);
});

// Keep the admin list in sync when another F57 tab creates a new order.
window.addEventListener('storage',e=>{
  if(e.key!=="f57_orders")return;
  render();
  const data=orders();
  if(data.length && !selectedOrder) showOrder(data[0]);
});

$("#logout").onclick=()=>{
  sessionStorage.removeItem('f57_admin');
  location.href='index.html';
};

render();

// Automatically display the newest order on login.
const initial=orders();
if(initial.length) showOrder(initial[0]);
