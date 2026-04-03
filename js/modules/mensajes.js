// BeUnifyT v7 — mensajes.js
// Chat interno operadores/supervisores. Fase 1.
import { AppState }    from '../state.js';
import { getDB }       from '../firestore.js';
import { toast, safeHtml, formatDateTime } from '../utils.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.0';
let _unsubMsg=null, _canal='general', _canales=[];

export async function initMensajes(container){
  const el=typeof container==='string'?document.getElementById(container):container;
  if(!el)return;
  const user=AppState.get('currentUser');
  const ev=AppState.get('currentEvent');
  _canales=[
    {id:'general',   lbl:'📢 General',    desc:'Todos los operadores'},
    {id:'supervisors',lbl:'👔 Supervisores',desc:'Solo supervisores y admin'},
    {id:'incidencias',lbl:'⚠️ Incidencias', desc:'Alertas y problemas'},
  ];
  el.innerHTML=`
<div style="display:flex;height:calc(100vh - 88px);background:var(--bg);overflow:hidden">
  <!-- SIDEBAR CANALES -->
  <div style="width:200px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column">
    <div style="padding:10px 12px;font-size:10px;font-weight:800;text-transform:uppercase;color:var(--text3);letter-spacing:.08em;border-bottom:1px solid var(--border)">
      💬 Canales
    </div>
    <div id="canalList" style="flex:1;overflow-y:auto;padding:6px">
      ${_canales.map(c=>`
        <div class="canal-item${c.id===_canal?' active':''}" data-id="${c.id}" onclick="window._msgCanal('${c.id}')"
          style="padding:8px 10px;border-radius:var(--r);cursor:pointer;margin-bottom:2px;transition:background .15s;
          background:${c.id===_canal?'var(--bll)':'transparent'};
          border:1px solid ${c.id===_canal?'#bfdbfe':'transparent'}">
          <div style="font-size:13px;font-weight:${c.id===_canal?'700':'500'};color:${c.id===_canal?'var(--blue)':'var(--text)'}">${c.lbl}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:1px">${c.desc}</div>
          <div class="unread-dot" id="unread_${c.id}" style="display:none;width:8px;height:8px;background:var(--red);border-radius:50%;float:right;margin-top:-18px"></div>
        </div>`).join('')}
    </div>
    <div style="padding:10px 12px;border-top:1px solid var(--border)">
      <div style="font-size:11px;font-weight:600;color:var(--text2)">${safeHtml(user.name)}</div>
      <div style="font-size:10px;color:var(--text3)">${safeHtml(user.role||'operador')}</div>
    </div>
  </div>

  <!-- AREA CHAT -->
  <div style="flex:1;display:flex;flex-direction:column;min-width:0">
    <div style="padding:10px 14px;border-bottom:1px solid var(--border);background:var(--bg2);display:flex;align-items:center;gap:8px">
      <div id="canalTitle" style="font-size:14px;font-weight:700"></div>
      <div id="canalDesc" style="font-size:11px;color:var(--text3)"></div>
      <span style="flex:1"></span>
      <div id="onlineCount" style="font-size:11px;color:var(--green);font-weight:600"></div>
    </div>

    <div id="msgList" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:6px">
      <div style="text-align:center;color:var(--text3);font-size:13px">Cargando mensajes...</div>
    </div>

    <!-- INPUT -->
    <div style="padding:10px 14px;border-top:1px solid var(--border);background:var(--bg2);display:flex;gap:8px;align-items:flex-end">
      <textarea id="msgInput" placeholder="Escribe un mensaje..." rows="1"
        style="flex:1;resize:none;min-height:38px;max-height:120px;padding:8px 12px;font-size:13px;border-radius:var(--r2)"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();window._sendMsg();}"
        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'">
      </textarea>
      <button onclick="window._sendMsg()" style="padding:8px 16px;background:var(--blue);color:#fff;border:none;border-radius:var(--r2);font-weight:700;font-size:13px;cursor:pointer;height:38px;flex-shrink:0">
        Enviar →
      </button>
    </div>
  </div>
</div>`;

  _loadCanal('general');
}

window._msgCanal=function(id){
  _canal=id;
  document.querySelectorAll('.canal-item').forEach(el=>{
    const active=el.dataset.id===id;
    el.style.background=active?'var(--bll)':'transparent';
    el.style.border=`1px solid ${active?'#bfdbfe':'transparent'}`;
    el.querySelector('div').style.fontWeight=active?'700':'500';
    el.querySelector('div').style.color=active?'var(--blue)':'var(--text)';
  });
  _loadCanal(id);
};

async function _loadCanal(canalId){
  _canal=canalId;
  const c=_canales.find(x=>x.id===canalId)||_canales[0];
  const title=document.getElementById('canalTitle');
  const desc=document.getElementById('canalDesc');
  if(title)title.textContent=c.lbl;
  if(desc)desc.textContent=c.desc;

  if(_unsubMsg){_unsubMsg();_unsubMsg=null;}

  const user=AppState.get('currentUser');
  const ev=AppState.get('currentEvent');
  if(!ev?.id)return;

  try{
    const db=getDB();
    const{collection,query,orderBy,limit,onSnapshot}=await import(`${FB}/firebase-firestore.js`);
    const q=query(
      collection(db,'events',ev.id,'mensajes',canalId,'msgs'),
      orderBy('ts','asc'),limit(100)
    );
    _unsubMsg=onSnapshot(q,(snap)=>{
      const msgs=snap.docs.map(d=>({id:d.id,...d.data()}));
      _renderMsgs(msgs,user);
    });
  }catch(err){
    const list=document.getElementById('msgList');
    if(list)list.innerHTML=`<div style="text-align:center;color:var(--text3);font-size:13px">Sin mensajes aún. ¡Sé el primero en escribir!</div>`;
  }
}

function _renderMsgs(msgs,user){
  const list=document.getElementById('msgList');
  if(!list)return;
  if(!msgs.length){
    list.innerHTML=`<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px">Sin mensajes aún. ¡Sé el primero en escribir!</div>`;
    return;
  }
  list.innerHTML=msgs.map(m=>{
    const isMe=m.uid===user.uid;
    const ts=m.ts?.toDate?formatDateTime(m.ts.toDate()):formatDateTime(m.ts);
    return`<div style="display:flex;flex-direction:column;align-items:${isMe?'flex-end':'flex-start'};gap:2px">
      <div style="font-size:10px;color:var(--text3)">${safeHtml(m.nombre||'?')} · ${ts}</div>
      <div style="max-width:75%;padding:8px 12px;border-radius:${isMe?'14px 14px 4px 14px':'14px 14px 14px 4px'};
        background:${isMe?'var(--blue)':'var(--bg3)'};
        color:${isMe?'#fff':'var(--text)'};
        font-size:13px;line-height:1.5;word-break:break-word;
        border:${isMe?'none':'1px solid var(--border)'}">
        ${m.tipo==='sistema'?`<span style="font-style:italic;opacity:.8">${safeHtml(m.texto)}</span>`:safeHtml(m.texto)}
        ${m.alerta?`<span style="display:block;margin-top:4px;font-size:10px;background:rgba(255,255,255,.2);border-radius:4px;padding:2px 6px;font-weight:700">⚠️ ALERTA</span>`:''}
      </div>
    </div>`;
  }).join('');
  list.scrollTop=list.scrollHeight;
}

window._sendMsg=async function(){
  const input=document.getElementById('msgInput');
  const texto=(input?.value||'').trim();
  if(!texto)return;
  const user=AppState.get('currentUser');
  const ev=AppState.get('currentEvent');
  if(!ev?.id)return;
  input.value='';input.style.height='38px';
  try{
    const db=getDB();
    const{collection,addDoc,serverTimestamp}=await import(`${FB}/firebase-firestore.js`);
    await addDoc(collection(db,'events',ev.id,'mensajes',_canal,'msgs'),{
      texto,uid:user.uid,nombre:user.name,role:user.role||'operator',ts:serverTimestamp(),tipo:'normal',
      alerta:texto.startsWith('!!')||texto.startsWith('ALERTA'),
    });
  }catch{toast('Error al enviar mensaje','var(--red)');}
};
