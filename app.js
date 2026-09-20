(function(){
'use strict';

// --- 1. INICIALIZAR SUPABASE ---
const supabaseUrl = 'https://fvowpkbezdiyhxuflqbp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2b3dwa2JlemRpeWh4dWZscWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjU0NjYsImV4cCI6MjEwNTUwMTQ2Nn0.m5x8WpOASKkJVDeC5yO8xPCkwLkQ6_cKrc-IGmZSD0A';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* ---------- Datos de referencia ---------- */
const SIT={
  irregular:{t:'Sin autorización de residencia',s:'Sin autorización',c:'rojo'},
  pi:{t:'Solicitante de protección internacional',s:'Solicitante de protección',c:'azul'},
  estudios:{t:'Estancia por estudios',s:'Estancia por estudios',c:'azul'},
  temporal:{t:'Autorización de residencia temporal',s:'Residencia temporal',c:'verde'},
  larga:{t:'Residencia de larga duración',s:'Larga duración',c:'verde'},
  refugio:{t:'Protección internacional concedida',s:'Protección concedida',c:'verde'},
  menor:{t:'Menor extranjero o extutelado',s:'Menor o extutelado',c:'ambar'},
  ue:{t:'Ciudadano de la UE o familiar',s:'Régimen UE',c:'verde'},
  nacional:{t:'Nacionalidad española',s:'Nacionalidad española',c:'verde'},
  otra:{t:'Sin determinar',s:'Sin determinar',c:'ambar'}
};
const ARR=[
  'Pasaporte o título de viaje en vigor (copia completa)',
  'Certificado de empadronamiento e histórico que acredite la permanencia continuada',
  'Antecedentes penales del país de origen y de países de residencia anteriores (legalizados o apostillados, y traducidos)',
  'Formulario oficial de solicitud (comprobar el modelo vigente)',
  'Justificante de pago de la tasa',
  'Pruebas complementarias de permanencia (informes médicos, envíos de dinero, billetes, matrículas)'
];
const TRAM={
  ninguno:{t:'Sin trámite en curso',items:[]},
  arraigo_social:{t:'Arraigo social',items:ARR.concat(['Informe de arraigo o de inserción social','Contrato de trabajo o acreditación de medios económicos'])},
  arraigo_sociolaboral:{t:'Arraigo sociolaboral',items:ARR.concat(['Contrato de trabajo firmado','Documentación de la empresa contratante'])},
  arraigo_sociofamiliar:{t:'Arraigo sociofamiliar',items:ARR.concat(['Documentos que acreditan el vínculo familiar (legalizados y traducidos)','Documento de identidad o tarjeta del familiar'])},
  arraigo_socioformativo:{t:'Arraigo socioformativo',items:ARR.concat(['Matrícula o compromiso de formación reglada','Acreditación de la formación realizada'])},
  proteccion:{t:'Solicitud de protección internacional',items:[
    'Documento de identidad o pasaporte (si lo tiene)',
    'Cita para manifestar la voluntad de solicitar protección',
    'Copia de la solicitud y resguardo o documento acreditativo',
    'Relato de los motivos y pruebas disponibles',
    'Valoración de acceso al sistema de acogida',
    'Empadronamiento',
    'Tarjeta sanitaria',
    'Asistencia letrada',
    'Control de fecha de renovación del documento de solicitante'
  ]},
  renovacion:{t:'Renovación de autorización',items:[
    'Tarjeta de identidad de extranjero actual',
    'Pasaporte en vigor',
    'Documentos que acreditan el cumplimiento de los requisitos (contrato, cotizaciones, medios económicos)',
    'Formulario oficial de solicitud (comprobar el modelo vigente)',
    'Justificante de pago de la tasa'
  ]},
  reagrupacion:{t:'Reagrupación familiar',items:[
    'Autorización de residencia del reagrupante en vigor (comprobar tiempo de residencia exigido)',
    'Vivienda adecuada (informe)',
    'Medios económicos suficientes',
    'Documentos del vínculo familiar (legalizados y traducidos)',
    'Pasaportes de los familiares',
    'Formulario oficial y justificante de la tasa'
  ]},
  violencia:{t:'Circunstancias excepcionales por violencia de género',items:[
    'Denuncia, orden de protección o informe que acredite los indicios',
    'Informe de servicios sociales o de atención especializada',
    'Pasaporte',
    'Certificado de empadronamiento',
    'Derivación a recurso especializado (centro de la mujer, casa de acogida)',
    'Asistencia letrada'
  ]},
  nacionalidad:{t:'Nacionalidad española',items:[
    'Comprobar el plazo de residencia legal exigido según el caso',
    'Certificado de antecedentes penales del país de origen',
    'Certificado de nacimiento (legalizado y traducido)',
    'Pasaporte y tarjeta de residencia',
    'Prueba CCSE (Instituto Cervantes)',
    'Prueba DELE A2 (si no es hispanohablante)',
    'Justificante de pago de la tasa'
  ]},
  derechos:{t:'Empadronamiento y tarjeta sanitaria',items:[
    'Documento de identidad o pasaporte',
    'Justificante del domicilio o autorización de la persona titular',
    'Solicitud de empadronamiento en el ayuntamiento',
    'Solicitud de tarjeta sanitaria en el centro de salud',
    'Si no hay domicilio: informe de servicios sociales para empadronamiento sin domicilio fijo'
  ]},
  homologacion:{t:'Homologación de estudios',items:[
    'Título original legalizado o apostillado',
    'Certificación académica',
    'Traducción jurada',
    'Pasaporte',
    'Solicitud y justificante de la tasa'
  ]}
};
const VUL=[
  ['menores','Menores a cargo'],['vg','Violencia de género'],['trata','Posible víctima de trata'],
  ['vivienda','Sin vivienda o vivienda precaria'],['salud','Problemas de salud que condicionan la intervención'],
  ['red','Sin red de apoyo'],['idioma','Barrera idiomática'],['alfab','Baja alfabetización'],['ingresos','Sin ingresos']
];
const VIV=[['','Sin datos'],['estable','Vivienda estable (propia o alquilada)'],['compartida','Habitación o vivienda compartida'],['temporal','Alojamiento temporal (recurso o familiares)'],['sin','Sin alojamiento']];
const EMP=[['','Sin datos'],['regular','Empleo con contrato'],['informal','Empleo sin contrato'],['paro','Sin empleo, busca trabajo'],['estudia','Estudiando o en formación'],['inactivo','Sin ingresos ni actividad']];
const GENS=[['','Sin datos'],['mujer','Mujer'],['hombre','Hombre'],['otro','Otro o no binario']];
const SEGT=['Entrevista','Llamada','Visita','Gestión','Acompañamiento','Coordinación','Otro'];
const DERE=['Pendiente','En curso','Cerrada'];
const PLZ={
  subsanacion:{t:'Requerimiento de subsanación',regla:'10 días hábiles',h:10},
  reposicion:{t:'Recurso potestativo de reposición',regla:'1 mes',m:1},
  alzada:{t:'Recurso de alzada',regla:'1 mes',m:1},
  contencioso:{t:'Recurso contencioso-administrativo',regla:'2 meses',m:2},
  caducidad:{t:'Caducidad de documento'},
  cita:{t:'Cita previa'},
  renovacion:{t:'Solicitud de renovación'},
  otro:{t:'Otro plazo'}
};

/* ---------- Utilidades ---------- */
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2]);};
const hoy=()=>iso(new Date());
const diff=(a,b)=>Math.round((parse(b)-parse(a))/86400000);
const fmt=s=>s?parse(s).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}):'';
const fmtLargo=s=>s?parse(s).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
const opts=(list,sel)=>list.map(o=>`<option value="${esc(o[0])}"${o[0]===sel?' selected':''}>${esc(o[1])}</option>`).join('');
const plural=(n,a,b)=>n===1?a:b;

/* ---------- Almacenamiento Local Temporal ---------- */
const KEY='cuaderno-migratorio-v1';
function semillas(){
  return [
    ['Oficina de Extranjería','Administración'],
    ['Servicios Sociales Comunitarios de la zona','Servicios sociales'],
    ['Centro de salud de referencia','Sanidad'],
    ['Asistencia jurídica gratuita (turno de oficio)','Jurídico'],
    ['Registro Civil','Administración'],
    ['Instituto Cervantes (pruebas DELE y CCSE)','Nacionalidad'],
    ['Entidad de acogida o atención humanitaria','Tercer sector']
  ].map(r=>({id:uid(),nombre:r[0],tipo:r[1],contacto:'',notas:'Añade teléfono, dirección y horario.'}));
}
function vacio(){return {v:1,casos:[],plazos:[],recursos:semillas()};}
function normalizar(s){
  const b=Object.assign(vacio(),s||{});
  const hoyStr = hoy();
  
  b.casos=(b.casos||[]).map(c => {
    // Si el caso está cerrado y tiene fecha de cierre registrada...
    if(c.estado === 'cerrado' && c.cierre) {
      const diasPasados = diff(c.cierre, hoyStr);
      // Si han pasado 15 días o más, se archiva automáticamente
      if(diasPasados >= 15) {
        c.estado = 'archivado';
      }
    }
    return Object.assign({seg:[],docs:[],der:[],vul:[],idiomas_lista:[],estado:'abierto',situacion:'otra',tramite:'ninguno',creado:hoy(),actualizado:new Date().toISOString()}, c);
  });

  b.plazos=b.plazos||[];
  b.recursos=b.recursos||[];
  return b;
}
function cargar(){
  try{const raw=localStorage.getItem(KEY);if(raw)return normalizar(JSON.parse(raw));}catch(e){}
  return normalizar(null);
}
let state=cargar();
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

/* ---------- Estado de Interfaz y Archivados ---------- */
const ui={loggedIn:false, view:'inicio',caseId:null,tab:'ficha',q:'',f:'abiertos',desde:hoy().slice(0,4)+'-01-01',hasta:hoy(), archivadosDesbloqueados:false};
const getCaso=id=>state.casos.find(c=>c.id===id);
const nombreCaso=c=>c.nombre||c.codigo||'Caso sin nombre';
function tocar(c){if(c)c.actualizado=new Date().toISOString();guardar();}
function ultimoContacto(c){const f=c.seg.map(x=>x.fecha).sort().pop();return f||null;}
function diasSinContacto(c){return diff(ultimoContacto(c)||c.creado,hoy());}
function plazosPend(){return state.plazos.filter(p=>!p.hecho&&getCaso(p.caso)).sort((a,b)=>a.fecha.localeCompare(b.fecha));}
function diasTxt(f){
  const n=diff(hoy(),f);
  if(n<0)return {t:'Vencido hace '+(-n)+' '+plural(-n,'día','días'),c:'rojo',n};
  if(n===0)return {t:'Vence hoy',c:'rojo',n};
  if(n===1)return {t:'Vence mañana',c:'rojo',n};
  return {t:'Vence en '+n+' días ('+habilesHasta(f)+' hábiles)',c:n<=7?'rojo':n<=30?'ambar':'neutro',n};
}
function habilesHasta(f){
  const a=parse(hoy()),b=parse(f);
  if(a.getTime()===b.getTime())return 0;
  const sg=b>a?1:-1;let n=0;const d=new Date(a.getTime());
  while(sg>0?d<b:d>b){d.setDate(d.getDate()+sg);const w=d.getDay();if(w!==0&&w!==6)n++;}
  return sg*n;
}
function habTxt(f){
  const n=habilesHasta(f);
  if(n<0)return 'vencido hace '+(-n)+' '+plural(-n,'día hábil','días hábiles');
  if(n===0)return 'vence hoy';
  return 'quedan '+n+' '+plural(n,'día hábil','días hábiles');
}
function avisoPlazos(c){
  const ps=state.plazos.filter(p=>p.caso===c.id&&!p.hecho).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  if(!ps.length)return '';
  const urg=ps.some(p=>habilesHasta(p.fecha)<=3);
  return '<div class="aviso'+(urg?' urgente':'')+'" role="status"><strong>Plazos pendientes</strong><ul>'+ps.slice(0,4).map(p=>'<li>'+esc(PLZ[p.tipo]?PLZ[p.tipo].t:p.tipo)+': finaliza el '+esc(fmtLargo(p.fecha))+' ('+esc(habTxt(p.fecha))+')</li>').join('')+'</ul>'+(ps.length>4?'<p class="nota">y '+(ps.length-4)+' más en la pestaña Plazos.</p>':'')+'<p class="nota">Cálculo orientativo: no descuenta festivos.</p></div>';
}
function calcPlazo(tipo,notif){
  const r=PLZ[tipo];
  if(!r||!notif||(!r.h&&!r.m))return null;
  const d=parse(notif);
  if(r.h){
    let n=0;
    while(n<r.h){d.setDate(d.getDate()+1);const w=d.getDay();if(w!==0&&w!==6)n++;}
  }else{
    const dia=d.getDate();
    d.setDate(1);d.setMonth(d.getMonth()+r.m);
    const ult=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
    d.setDate(Math.min(dia,ult));
    while(d.getDay()===0||d.getDay()===6)d.setDate(d.getDate()+1);
  }
  return iso(d);
}

/* ---------- Avisos y Modales ---------- */
let tt=null,ultimoFoco=null,pendiente=null;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),2400);}
function modal(html){
  ultimoFoco=document.activeElement;
  $('#modal-root').innerHTML='<div class="velo" data-a="velo"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-t">'+html+'</div></div>';
  const f=$('#modal-root textarea')||$('#modal-root button')||$('#modal-root input');
  if(f)f.focus();
}
function cerrarModal(){
  $('#modal-root').innerHTML='';pendiente=null;
  if(ultimoFoco&&ultimoFoco.focus&&document.contains(ultimoFoco))ultimoFoco.focus();
}
function confirmar(titulo,msg,etiqueta,fn){
  pendiente=fn;
  modal('<h2 id="m-t">'+esc(titulo)+'</h2><p>'+esc(msg)+'</p><div class="acciones"><button class="btn" data-a="modal-cerrar">Cancelar</button><button class="btn peligro" data-a="confirmar-ok">'+esc(etiqueta)+'</button></div>');
}

/* ---------- Componentes Visuales ---------- */
const sello=c=>{const s=SIT[c.situacion]||SIT.otra;return '<span class="sello '+s.c+'" id="h-sello">'+esc(s.s)+'</span>';};
function inp(c,f,label,type,hint){
  return '<label class="campo"><span>'+label+'</span><input type="'+(type||'text')+'" data-f="'+f+'" value="'+esc(c[f])+'">'+(hint?'<small>'+hint+'</small>':'')+'</label>';
}

const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
const inic=c=>{const t=(c.nombre||c.codigo||'?').trim().split(/\s+/);return ((t[0]||'?').charAt(0)+(t.length>1?t[t.length-1].charAt(0):'')).toUpperCase();};
const tono=c=>(SIT[c.situacion]||SIT.otra).c;
const avatar=(c,g)=>'<span class="av '+tono(c)+(g?' grande" id="h-avatar':'')+'" aria-hidden="true">'+esc(inic(c))+'</span>';
function anios(c){
  if(!c.nacimiento)return null;
  const n=parse(c.nacimiento),f=new Date();
  let a=f.getFullYear()-n.getFullYear();
  if(f.getMonth()<n.getMonth()||(f.getMonth()===n.getMonth()&&f.getDate()<n.getDate()))a--;
  return a>=0&&a<120?a:null;
}
const hace=n=>n<=0?'Hoy':'Hace '+n+' '+plural(n,'día','días');
function saludo(){const h=new Date().getHours();return h<14?'Buenos días':h<21?'Buenas tardes':'Buenas noches';}
const ICO_BUSCAR='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';

function vInicio(){
  const abiertos=state.casos.filter(c=>c.estado==='abierto');
  const pend=plazosPend().map(p=>Object.assign({},p,{d:diasTxt(p.fecha)}));
  const venc=pend.filter(p=>p.d.n<0).length;
  const prox=pend.filter(p=>p.d.n>=0&&p.d.n<=7).length;
  const frios=abiertos.filter(c=>diasSinContacto(c)>=30).sort((a,b)=>diasSinContacto(b)-diasSinContacto(a));
  const urg=venc+prox;
  const tile=(num,lab,cls,acc,attr)=>'<button class="tile '+cls+'" data-a="'+acc+'" '+attr+'><span class="num">'+num+'</span><span class="lab">'+lab+'</span></button>';
  const bloque=(t,acc,cuerpo)=>'<section class="bloque"><div class="bloque-cab"><h2>'+t+'</h2>'+(acc||'')+'</div>'+cuerpo+'</section>';
  
  let h='<section class="hero"><p class="fecha">'+esc(cap(fmtLargo(hoy())))+'</p><h1>'+saludo()+'</h1>';
  if(state.casos.length){
    const partes=[];
    if(venc)partes.push(venc+' '+plural(venc,'plazo vencido','plazos vencidos'));
    if(prox)partes.push(prox+' '+plural(prox,'plazo que vence','plazos que vencen')+' en 7 días');
    if(frios.length)partes.push(frios.length+' '+plural(frios.length,'caso sin contacto','casos sin contacto')+' desde hace 30 días o más');
    h+='<p class="resumen">Tienes '+abiertos.length+' '+plural(abiertos.length,'caso abierto','casos abiertos')+'. '+(partes.length?'Requieren atención: '+partes.join(', ')+'.':'No hay plazos urgentes ni casos desatendidos.')+'</p>';
  }else h+='<p class="resumen">Tu cuaderno de casos, plazos y documentos en un solo sitio.</p>';
  
  h+='<button class="btn primario solo-esc" data-a="nuevo">+ Nuevo caso</button></section>';
  
  if(!state.casos.length){
    h+='<section class="tarjeta"><h2>Empieza en tres pasos</h2><ol class="pasos">'
      +'<li><strong>Crea un caso</strong><span>Registra a la persona con un alias o un código.</span></li>'
      +'<li><strong>Anota cada intervención</strong><span>Entrevistas, llamadas y gestiones quedan en un historial.</span></li>'
      +'<li><strong>Controla documentos y plazos</strong><span>El cuaderno avisa de lo que vence y calcula los días hábiles.</span></li></ol>'
      +'<button class="btn primario" data-a="nuevo">Crear el primer caso</button></section>';
  }else{
    h+='<div class="tiles">'
      +tile(abiertos.length,'Casos abiertos','neutro','ir-casos','data-f="abiertos"')
      +tile(urg,'Plazos urgentes',urg?'rojo':'neutro','ir-plazos','')
      +tile(frios.length,'Sin contacto 30+ días',frios.length?'ambar':'neutro','ir-casos','data-f="sincontacto"')
      +'</div>';
    const vig=pend.filter(p=>p.d.n<=30).slice(0,8);
    h+=bloque('Plazos a vigilar','<button class="btn texto chico" data-a="ir-plazos">Ver todos los plazos</button>',
      vig.length?'<div class="tarjeta plana"><ul class="lista">'+vig.map(p=>{
        const c=getCaso(p.caso);
        return '<li><button class="fila" data-a="abrir" data-id="'+c.id+'" data-tab="plz">'+avatar(c)+'<span class="cuerpo"><span class="nombre">'+esc(PLZ[p.tipo]?PLZ[p.tipo].t:p.tipo)+'</span><span class="meta">'+esc(nombreCaso(c))+', '+esc(fmt(p.fecha))+'</span></span><span class="der"><span class="tag '+p.d.c+'">'+esc(p.d.t)+'</span></span></button></li>';
      }).join('')+'</ul></div>':'<p class="nota">No hay plazos en los próximos 30 días.</p>');
    if(frios.length){
      h+=bloque('Sin contacto reciente','','<div class="tarjeta plana"><ul class="lista">'+frios.slice(0,6).map(c=>'<li><button class="fila" data-a="abrir" data-id="'+c.id+'" data-tab="seg">'+avatar(c)+'<span class="cuerpo"><span class="nombre">'+esc(nombreCaso(c))+'</span><span class="meta">'+(ultimoContacto(c)?'Último contacto: '+esc(fmt(ultimoContacto(c))):'Sin intervenciones registradas')+'</span></span><span class="der"><span class="tag ambar">'+diasSinContacto(c)+' días</span></span></button></li>').join('')+'</ul></div>');
    }
  }
  return h;
}

function listaCasos(){
  const q=ui.q.trim().toLowerCase();
  
  if(ui.f==='archivados'){
    if(!ui.archivadosDesbloqueados){
      return '<div class="tarjeta" style="text-align:center; padding:3rem 1rem;">'
        +'<h3>Sección protegida</h3>'
        +'<p class="nota" style="margin-bottom:1rem;">Introduce la contraseña para ver los casos archivados.</p>'
        +'<div style="max-width:20rem; margin:0 auto; display:flex; gap:.5rem;">'
          +'<input id="pass-archivados" type="password" placeholder="Contraseña">'
          +'<button class="btn primario" data-a="desbloquear-archivados">Entrar</button>'
        +'</div>'
      +'</div>';
    }
    let cs=state.casos.filter(c=>c.estado==='archivado');
    if(q)cs=cs.filter(c=>[c.nombre,c.codigo,c.pais,c.contacto].join(' ').toLowerCase().includes(q));
    if(!cs.length)return '<div class="vacio">No hay casos archivados.</div>';
    return '<div class="tarjeta plana"><ul class="lista">'+cs.map(c=>{
      const s=SIT[c.situacion]||SIT.otra;
      return '<li><button class="fila" data-a="abrir" data-id="'+c.id+'">'+avatar(c)+'<span class="cuerpo"><span class="nombre">'+esc(nombreCaso(c))+' (Archivado)</span><span class="meta">'+esc(c.pais||'País sin indicar')+'</span></span><span class="der"><span class="tag rojo">Archivado</span></span></button></li>';
    }).join('')+'</ul></div>';
  }

  let cs=state.casos.filter(c=>ui.f==='cerrados'?c.estado==='cerrado':c.estado==='abierto');
  if(ui.f==='sincontacto')cs=cs.filter(c=>diasSinContacto(c)>=30);
  if(q)cs=cs.filter(c=>[c.nombre,c.codigo,c.pais,c.idiomas,c.contacto].join(' ').toLowerCase().includes(q));
  cs.sort((a,b)=>b.actualizado.localeCompare(a.actualizado));
  if(!cs.length)return '<div class="vacio">'+(state.casos.length?'Ningún caso coincide con la búsqueda o el filtro.':'Aún no hay casos. Usa «Nuevo caso» para empezar.')+'</div>';
  const planes=plazosPend();
  return '<div class="tarjeta plana"><ul class="lista">'+cs.map(c=>{
    const s=SIT[c.situacion]||SIT.otra;
    const np=planes.find(p=>p.caso===c.id);
    const d=np?diasTxt(np.fecha):null;
    const frio=c.estado==='abierto'&&diasSinContacto(c)>=30;
    return '<li><button class="fila" data-a="abrir" data-id="'+c.id+'">'+avatar(c)+'<span class="cuerpo"><span class="nombre">'+esc(nombreCaso(c))+(c.estado==='cerrado'?' (cerrado)':'')+'</span><span class="meta">'+esc(c.pais||'País sin indicar')+', '+esc((TRAM[c.tramite]||TRAM.ninguno).t)+'</span></span><span class="der"><span class="tag '+s.c+'">'+esc(s.s)+'</span>'+(d?'<span class="tag '+d.c+'">'+esc(d.t)+'</span>':(frio?'<span class="tag ambar">Sin contacto '+diasSinContacto(c)+' d</span>':''))+'</span></button></li>';
  }).join('')+'</ul></div>';
}

function vCasos(){
  const f=(k,t)=>'<button class="chip" data-a="filtro" data-v="'+k+'" aria-pressed="'+(ui.f===k)+'">'+t+'</button>';
  return '<div class="cabecera"><div><h1>Casos</h1><p class="sub">Gestión integral de expedientes</p></div><button class="btn primario solo-esc" data-a="nuevo">+ Nuevo caso</button></div>'
  +'<label class="buscar">'+ICO_BUSCAR+'<input id="q" type="search" autocomplete="off" placeholder="Buscar por nombre, código, país..." aria-label="Buscar casos" value="'+esc(ui.q)+'"></label>'
  +'<div class="chips" role="group" aria-label="Filtrar casos">'+f('abiertos','Abiertos')+f('cerrados','Cerrados')+f('sincontacto','Sin contacto')+f('archivados','Archivados 🔒')+'</div>'
  +'<div id="lista-casos">'+listaCasos()+'</div>';
}

function chipsCaso(c){
  const a=anios(c),x=[];
  if(c.pais)x.push(c.pais);
  if(a!==null)x.push(a+' '+plural(a,'año','años'));
  if(c.llegada)x.push('En España desde '+fmt(c.llegada));
  if(c.idiomas_lista && c.idiomas_lista.length) x.push(c.idiomas_lista.map(i=>i.idioma+' ('+i.nivel+')').join(', '));
  return x.length?x.map(t=>'<span class="dato">'+esc(t)+'</span>').join(''):'<span class="nota">Completa la ficha para ver aquí los datos clave.</span>';
}

function indCaso(c){
  const p=progresoDocs(c);
  const ps=state.plazos.filter(x=>x.caso===c.id&&!x.hecho).sort((a,b)=>a.fecha.localeCompare(b.fecha));
  const uc=ultimoContacto(c);
  return '<div><span class="k">Documentos</span><span class="v">'+(c.docs.length?c.docs.filter(d=>d.ok).length+' de '+c.docs.length:'Sin lista')+'</span><span class="barra"><i style="width:'+p.pct+'%"></i></span></div>'
    +'<div><span class="k">Próximo plazo</span><span class="v">'+(ps.length?esc(fmt(ps[0].fecha)):'Ninguno')+'</span>'+(ps.length?'<span class="k">'+esc(habTxt(ps[0].fecha))+'</span>':'')+'</div>'
    +'<div><span class="k">Último contacto</span><span class="v">'+(uc?hace(diff(uc,hoy())):'Sin registrar')+'</span></div>';
}

function vCaso(c){
  const pend=state.plazos.filter(p=>p.caso===c.id&&!p.hecho).length;
  const dok=c.docs.filter(d=>d.ok).length;
  const T=(k,t,n)=>'<button role="tab" aria-selected="'+(ui.tab===k)+'" data-a="tab" data-t="'+k+'">'+t+(n!==''?' <span class="ins">'+n+'</span>':'')+'</button>';
  let cuerpo='';
  if(ui.tab==='seg')cuerpo=tSeg(c);
  else if(ui.tab==='docs')cuerpo=tDocs(c);
  else if(ui.tab==='plz')cuerpo=tPlz(c);
  else if(ui.tab==='der')cuerpo=tDer(c);
  else cuerpo=tFicha(c);

  const btnEstadoTxt = c.estado==='abierto' ? 'Cerrar caso' : c.estado==='cerrado' ? 'Archivar caso' : 'Reabrir caso';

  return '<button class="btn texto" data-a="volver">← Volver a casos</button>'
  +'<section class="tarjeta exp"><div class="exp-cab">'+avatar(c,true)+'<div class="exp-id"><h1 id="h-nombre">'+esc(nombreCaso(c))+'</h1><p class="sub" id="h-sub">'+esc(c.pais||'País sin indicar')+', código '+esc(c.codigo||'sin código')+(c.estado!=='abierto'?', '+c.estado:'')+'</p></div>'+sello(c)+'</div>'
  +'<div class="chips-info" id="h-chips">'+chipsCaso(c)+'</div><div class="ind" id="h-ind">'+indCaso(c)+'</div>'
  +'<div class="acciones">'
    +'<button class="btn primario" data-a="resumen">Generar informe (PDF)</button>'
    +'<button class="btn" data-a="estado">'+btnEstadoTxt+'</button>'
  +'</div></section>'
  +avisoPlazos(c)
  +'<div class="tabs" role="tablist">'+T('ficha','Ficha','')+T('seg','Seguimiento',c.seg.length)+T('docs','Documentos',dok+'/'+c.docs.length)+T('plz','Plazos',pend)+T('der','Derivaciones',c.der.length)+'</div>'
  +'<div id="tab" role="tabpanel">'+cuerpo+'</div>';
}

function tFicha(c){
  const g=(t,sub,cont)=>'<section class="grupo"><div class="grupo-cab"><h3>'+t+'</h3>'+(sub?'<p class="nota">'+sub+'</p>':'')+'</div>'+cont+'</section>';
  if(!Array.isArray(c.idiomas_lista)) c.idiomas_lista = [];
  const nivelesIdiomas = [['bajo','Bajo'],['medio','Medio'],['alto','Alto'],['nativo','Nativo']];
  
  return '<p class="nota">Modifica los datos y pulsa el botón de guardar al final de la página.</p>'
  +g('Datos personales','','<div class="grid dos">'
    +inp(c,'nombre','Nombre o alias','text','Puedes usar iniciales si prefieres no guardar el nombre completo.')
    +inp(c,'codigo','Código interno')
    +inp(c,'pais','País de origen')
    +inp(c,'nacimiento','Fecha de nacimiento','date')
    +inp(c,'llegada','Fecha de llegada a España','date')
    +'<label class="campo"><span>Género</span><select data-f="genero">'+opts(GENS,c.genero||'')+'</select></label>'
    +inp(c,'contacto','Teléfono o contacto')+'</div>')

  +g('Idiomas y niveles','Añade los idiomas que habla la persona y selecciona su nivel.',''
    +'<div class="fila-add" style="margin-bottom:1rem;">'
      +'<input id="nuevo-idioma-input" type="text" placeholder="Ej. Inglés, Francés..." style="flex:1 1 12rem;">'
      +'<select id="nuevo-nivel-select" style="flex:1 1 10rem;">'+opts(nivelesIdiomas, 'medio')+'</select>'
      +'<button class="btn" data-a="idioma-add">Añadir idioma</button>'
    +'</div>'
    +'<div id="lista-idiomas-container">'
      +(c.idiomas_lista.length ? '<ul class="lista" style="border:1px solid var(--linea); border-radius:6px; overflow:hidden;">' + c.idiomas_lista.map((item, idx) => 
        '<li style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 1rem; background:var(--hoja); border-bottom:1px solid var(--linea);">'
          +'<span><strong>'+esc(item.idioma)+'</strong> — <span class="tag neutro">'+esc(item.nivel)+'</span></span>'
          +'<button class="btn texto chico peligro" data-a="idioma-del" data-idx="'+idx+'">Eliminar</button>'
        +'</li>'
      ).join('') + '</ul>' : '<p class="nota">No hay idiomas añadidos todavía.</p>')
    +'</div>'
  )

  +g('Situación administrativa','Determina el sello que aparece en la cabecera del caso.','<div class="grid dos">'
    +'<label class="campo"><span>Situación administrativa</span><select data-f="situacion">'+opts(Object.keys(SIT).map(k=>[k,SIT[k].t]),c.situacion)+'</select></label>'
    +'<label class="campo"><span>Trámite en curso</span><select data-f="tramite">'+opts(Object.keys(TRAM).map(k=>[k,TRAM[k].t]),c.tramite)+'</select></label></div>')
  
  +g('Situación social','','<div class="grid dos">'
    +'<label class="campo"><span>Vivienda</span><select data-f="vivienda">'+opts(VIV,c.vivienda||'')+'</select></label>'
    +'<label class="campo"><span>Situación laboral</span><select data-f="empleo">'+opts(EMP,c.empleo||'')+'</select></label>'
    +'<label class="campo full"><span>Composición familiar y convivencia</span><textarea rows="3" data-f="familia">'+esc(c.familia||'')+'</textarea></label></div>')
  
  +g('Factores de vulnerabilidad','Marca los que apliquen.','<fieldset><div class="checks">'+VUL.map(v=>'<label class="check"><input type="checkbox" data-vul="'+v[0]+'"'+(c.vul.includes(v[0])?' checked':'')+'><span>'+v[1]+'</span></label>').join('')+'</div></fieldset>')
  
  +g('Observaciones','','<label class="campo"><span class="nota">Cualquier dato útil que no encaje en otro campo</span><textarea rows="4" data-f="notas">'+esc(c.notas||'')+'</textarea></label>')
  
  // Botones fijos al pie del formulario
  +'<div class="acciones" style="background:var(--hoja); padding:1rem; border:1px solid var(--linea); border-radius:var(--r); margin-top:2rem; display:flex; justify-content:space-between; align-items:center;">'
    +'<button class="btn primario" data-a="guardar-caso">Guardar cambios del caso</button>'
    +'<button class="btn peligro" data-a="borrar-caso">Eliminar caso</button>'
  +'</div>';
}

function tSeg(c){
  const lista=c.seg.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return '<section class="tarjeta"><h3>Nueva intervención</h3><div class="grid dos"><label class="campo"><span>Fecha</span><input id="seg-fecha" type="date" value="'+hoy()+'"></label>'
  +'<label class="campo"><span>Tipo de intervención</span><select id="seg-tipo">'+opts(SEGT.map(t=>[t,t]),'Entrevista')+'</select></label>'
  +'<label class="campo full"><span>Qué se ha hecho o acordado</span><textarea id="seg-texto" rows="4"></textarea></label></div>'
  +'<div class="acciones"><button class="btn primario" data-a="seg-add">Añadir intervención</button></div><p id="seg-msg" class="nota" role="alert"></p></section>'
  +(lista.length?'<ul class="linea">'+lista.map(x=>'<li><div class="cab"><strong>'+esc(fmt(x.fecha))+'</strong><span class="tag neutro">'+esc(x.tipo)+'</span><button class="btn texto chico" data-a="seg-del" data-id="'+x.id+'">Eliminar</button></div><p class="txt">'+esc(x.texto)+'</p></li>').join('')+'</ul>':'<div class="vacio" style="margin-top:1rem">Aún no hay intervenciones. Registra aquí cada entrevista, llamada o gestión para tener el historial completo del caso.</div>');
}

function progresoDocs(c){
  const t=c.docs.length,o=c.docs.filter(d=>d.ok).length;
  return {txt:t?o+' de '+t+' documentos aportados':'Sin documentos en la lista',pct:t?Math.round(o/t*100):0};
}
function tDocs(c){
  const p=progresoDocs(c);
  return '<section class="tarjeta"><p id="docs-txt"><strong>'+p.txt+'</strong></p><div class="barra" aria-hidden="true"><i id="docs-barra" style="width:'+p.pct+'%"></i></div>'
  +(c.docs.length?'<ul class="lista" style="margin:0 -1rem -1rem;border-top:1px solid var(--linea)">'+c.docs.map(d=>'<li class="doc"><label><input type="checkbox" data-doc="'+d.id+'"'+(d.ok?' checked':'')+'><span style="flex:1;">'+esc(d.t)+(d.url?' <a href="'+d.url+'" target="_blank" class="btn texto chico" style="margin-left:.5rem">Ver archivo 📎</a>':'')+'</span></label><button class="btn texto chico peligro" data-a="doc-del" data-id="'+d.id+'">Quitar</button></li>').join('')+'</ul>':'<div class="vacio">La lista está vacía. Sube documentos reales o carga listas orientativas.</div>')+'</section>'
  
  // SECCIÓN PARA SUBIR ARCHIVOS REALES
  +'<section class="tarjeta"><h3>Subir documento real (PDF o imagen)</h3><div class="grid dos">'
    +'<label class="campo"><span>Nombre o descripción del documento</span><input id="doc-nombre-archivo" type="text" placeholder="Ej. Contrato de trabajo firmado"></label>'
    +'<label class="campo"><span>Seleccionar archivo</span><input id="doc-file-input" type="file" accept=".pdf,image/*" style="padding:.35rem;"></label>'
  +'</div>'
  +'<div class="acciones"><button class="btn primario" data-a="doc-upload">Subir y adjuntar archivo</button></div><p id="doc-subida-msg" class="nota"></p></section>'

  +'<section class="tarjeta"><h3>Cargar lista orientativa de requisitos</h3><div class="fila-add"><select id="doc-tram" aria-label="Trámite">'+opts(Object.keys(TRAM).filter(k=>TRAM[k].items.length).map(k=>[k,TRAM[k].t]),TRAM[c.tramite]&&TRAM[c.tramite].items.length?c.tramite:'arraigo_social')+'</select><button class="btn" data-a="doc-load">Cargar lista</button></div>'
  +'<div class="aviso">Las listas son orientativas. Los archivos reales que subas se almacenarán de forma segura vinculados a este expediente.</div></section>';
}

function filaPlazo(p,conCaso){
  const d=diasTxt(p.fecha),c=getCaso(p.caso);
  const tipo=PLZ[p.tipo]?PLZ[p.tipo].t:p.tipo;
  return '<li class="plz'+(p.hecho?' hecho':'')+'"><div class="info-p"><strong>'+esc(tipo)+'</strong>, '+esc(fmt(p.fecha))+(p.notif?' <span class="nota">(notificado el '+esc(fmt(p.notif))+')</span>':'')+(p.nota?'<br><span class="nota">'+esc(p.nota)+'</span>':'')+(conCaso&&c?'<br><button class="btn texto chico" data-a="abrir" data-id="'+c.id+'" data-tab="plz">'+esc(nombreCaso(c))+'</button>':'')+'</div>'
  +(p.hecho?'<span class="tag verde">Hecho</span>':'<span class="tag '+d.c+'">'+esc(d.t)+'</span>')
  +'<div><button class="btn chico" data-a="plz-hecho" data-id="'+p.id+'">'+(p.hecho?'Reabrir':'Marcar como hecho')+'</button> <button class="btn texto chico" data-a="plz-del" data-id="'+p.id+'">Eliminar</button></div></li>';
}

function tPlz(c){
  const lista=state.plazos.filter(p=>p.caso===c.id).sort((a,b)=>(a.hecho-b.hecho)||a.fecha.localeCompare(b.fecha));
  return '<section class="tarjeta"><h3>Nuevo plazo</h3><p class="nota">Para subsanaciones y recursos basta con la fecha de notificación: la fecha límite se calcula sola.</p><div class="grid dos"><label class="campo"><span>Tipo de plazo</span><select id="plz-tipo">'+opts(Object.keys(PLZ).map(k=>[k,PLZ[k].t]),'subsanacion')+'</select></label>'
  +'<label class="campo"><span>Fecha de notificación</span><input id="plz-notif" type="date"></label>'
  +'<label class="campo"><span>Fecha límite</span><input id="plz-fecha" type="date"><small>Se rellena al calcular, o escríbela tú.</small></label>'
  +'<label class="campo"><span>Nota</span><input id="plz-nota" type="text"></label></div>'
  +'<div class="acciones"><button class="btn" data-a="plz-calc">Calcular fecha límite</button><button class="btn primario" data-a="plz-add">Añadir plazo</button></div><p id="plz-msg" class="nota" role="alert"></p></section>'
  +(lista.length?'<div class="tarjeta plana" style="margin-top:1rem"><ul class="lista">'+lista.map(p=>filaPlazo(p,false)).join('')+'</ul></div>':'<div class="vacio" style="margin-top:1rem">No hay plazos para este caso. Añade citas, caducidades de documentos, requerimientos o recursos para no perder ninguna fecha.</div>');
}

function tDer(c){
  const lista=c.der.slice().sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return '<section class="tarjeta"><h3>Nueva derivación</h3><div class="grid dos"><label class="campo"><span>Recurso o entidad</span><input id="der-rec" type="text" list="lista-rec" autocomplete="off"><datalist id="lista-rec">'+state.recursos.map(r=>'<option value="'+esc(r.nombre)+'">').join('')+'</datalist><small id="der-info">Elige uno de tus recursos o escribe otro.</small></label>'
  +'<label class="campo"><span>Fecha</span><input id="der-fecha" type="date" value="'+hoy()+'"></label>'
  +'<label class="campo full"><span>Motivo de la derivación</span><textarea id="der-motivo" rows="2"></textarea></label></div>'
  +'<div class="acciones"><button class="btn primario" data-a="der-add">Añadir derivación</button></div><p id="der-msg" class="nota" role="alert"></p></section>'
  +(lista.length?'<div class="tarjeta plana" style="margin-top:1rem"><ul class="lista">'+lista.map(d=>{
    const r=state.recursos.find(x=>x.nombre.toLowerCase()===d.recurso.toLowerCase());
    return '<li class="plz"><div class="info-p"><strong>'+esc(d.recurso)+'</strong>, '+esc(fmt(d.fecha))+(d.motivo?'<br><span class="nota">'+esc(d.motivo)+'</span>':'')+(r&&r.contacto?'<br><span class="nota">'+esc(r.contacto)+'</span>':'')+'</div><label class="campo"><span class="nota">Estado</span><select data-der="'+d.id+'">'+opts(DERE.map(x=>[x,x]),d.estado)+'</select></label><button class="btn texto chico" data-a="der-del" data-id="'+d.id+'">Eliminar</button></li>';
  }).join('')+'</ul></div>':'<div class="vacio" style="margin-top:1rem">Sin derivaciones. Anota aquí a qué recursos se ha derivado a la persona y cómo evoluciona cada una.</div>');
}

function vPlazos(){
  const pend=plazosPend(),hechos=state.plazos.filter(p=>p.hecho&&getCaso(p.caso)).sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return '<button class="btn texto" data-a="nav" data-v="inicio">← Volver al inicio</button>'
  +'<div class="cabecera"><div><h1>Plazos</h1><p class="sub">Todos los plazos pendientes de tus casos</p></div></div>'
  +(pend.length?'<div class="tarjeta plana"><ul class="lista">'+pend.map(p=>filaPlazo(p,true)).join('')+'</ul></div>':'<div class="vacio">No hay plazos pendientes. Puedes añadirlos desde la pestaña Plazos de cada caso.</div>')
  +(hechos.length?'<div class="tarjeta plana" style="margin-top:1rem"><details class="rec"><summary>Plazos cerrados ('+hechos.length+')</summary><ul class="lista">'+hechos.map(p=>filaPlazo(p,true)).join('')+'</ul></details></div>':'')
  +'<section class="tarjeta" style="margin-top:1rem"><h3>Calculadora de plazos</h3><div class="grid dos"><label class="campo"><span>Tipo</span><select id="calc-tipo">'+opts(Object.keys(PLZ).filter(k=>PLZ[k].h||PLZ[k].m).map(k=>[k,PLZ[k].t+' ('+PLZ[k].regla+')']),'subsanacion')+'</select></label>'
  +'<label class="campo"><span>Fecha de notificación</span><input id="calc-fecha" type="date" value="'+hoy()+'"></label></div>'
  +'<div class="acciones"><button class="btn primario" data-a="calc-global">Calcular</button></div><p id="calc-res" role="status"></p>'
  +'<div class="aviso">Cálculo orientativo: los sábados y domingos no cuentan y, si el último día es inhábil, pasa al siguiente hábil. No descuenta festivos. Comprueba siempre el plazo indicado en la propia notificación.</div></section>';
}

function vRecursos(){
  return '<div class="cabecera"><div><h1>Recursos</h1><p class="sub">Tu agenda de entidades y servicios de referencia</p></div></div>'
  +'<div class="info">Guarda aquí teléfono, dirección, horario y notas de las entidades con las que trabajas. Al añadir una derivación en un caso, te sugerirá estos nombres y mostrará su contacto.</div>'
  +'<section class="tarjeta"><h3>Añadir recurso</h3><div class="fila-add"><input id="rec-nombre" type="text" aria-label="Nombre del recurso" placeholder="Nombre del recurso"><input id="rec-tipo" type="text" aria-label="Tipo" placeholder="Tipo (sanidad, jurídico…)"><button class="btn primario" data-a="rec-add">Añadir recurso</button></div><p id="rec-msg" class="nota" role="alert"></p></section>'
  +(state.recursos.length?'<div class="tarjeta plana" style="margin-top:1rem">'+state.recursos.map(r=>'<details class="rec"><summary><span>'+esc(r.nombre)+'</span><span class="nota">'+esc(r.tipo)+'</span></summary><div class="cuerpo-d"><div class="grid dos">'
    +'<label class="campo"><span>Nombre</span><input data-r="nombre" data-rid="'+r.id+'" value="'+esc(r.nombre)+'"></label>'
    +'<label class="campo"><span>Tipo</span><input data-r="tipo" data-rid="'+r.id+'" value="'+esc(r.tipo)+'"></label>'
    +'<label class="campo full"><span>Contacto</span><textarea rows="2" data-r="contacto" data-rid="'+r.id+'">'+esc(r.contacto)+'</textarea></label>'
    +'<label class="campo full"><span>Notas</span><textarea rows="2" data-r="notas" data-rid="'+r.id+'">'+esc(r.notas)+'</textarea></label></div>'
    +'<div class="acciones"><button class="btn peligro chico" data-a="rec-del" data-id="'+r.id+'">Eliminar</button></div></div></details>').join('')+'</div>':'<div class="vacio" style="margin-top:1rem">No hay recursos. Añade los servicios con los que trabajas habitualmente.</div>');
}

/* ---------- Generación de PDF Automática ---------- */
function generarPDFInforme(c) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const s = SIT[c.situacion]||SIT.otra;
  const t = TRAM[c.tramite]||TRAM.ninguno;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("INFORME SOCIAL - CUADERNO MIGRATORIO", 14, 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Fecha de emisión: " + fmt(hoy()), 14, 28);
  
  let y = 38;
  doc.setFont("helvetica", "bold");
  doc.text("1. Datos de Identificación", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Nombre / Alias: " + (c.nombre || c.codigo || 'Sin nombre'), 14, y); y += 6;
  doc.text("Código interno: " + (c.codigo || '-'), 14, y); y += 6;
  doc.text("País de origen: " + (c.pais || 'No especificado'), 14, y); y += 6;
  if(c.idiomas_lista && c.idiomas_lista.length) {
    doc.text("Idiomas: " + c.idiomas_lista.map(i => i.idioma + ' (' + i.nivel + ')').join(', '), 14, y);
    y += 6;
  }
  
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("2. Situación Administrativa", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("Situación: " + s.t, 14, y); y += 6;
  doc.text("Trámite en curso: " + t.t, 14, y); y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("3. Observaciones y Notas", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  const splitNotas = doc.splitTextToSize(c.notas || 'Sin observaciones registradas.', 180);
  doc.text(splitNotas, 14, y);
  
  doc.save("informe_" + (c.codigo || 'caso') + ".pdf");
  toast('¡Informe PDF descargado con éxito!');
}

/* ---------- Render Principal ---------- */
function render(conservar){
  if(ui.caseId&&!getCaso(ui.caseId))ui.caseId=null;
  
  const root = $('#app-root');
  const login = $('#login-screen');
  
  if (!ui.loggedIn) {
    if (login) login.hidden = false;
    if (root) root.hidden = true;
    return;
  } else {
    if (login) login.hidden = true;
    if (root) root.hidden = false;
  }

  let h;
  if(ui.view==='inicio')h=vInicio();
  else if(ui.view==='casos')h=ui.caseId?vCaso(getCaso(ui.caseId)):vCasos();
  else if(ui.view==='plazos')h=vPlazos();
  else if(ui.view==='memoria')h='<div class="cabecera"><h1>Memoria</h1></div><p class="nota">Módulo en optimización.</p>';
  else if(ui.view==='recursos')h=vRecursos();
  else h=vInicio();

  $('#main').innerHTML=h;
  const vv=ui.view==='plazos'?'inicio':ui.view;
  document.querySelectorAll('.nav button').forEach(b=>{if(b.dataset.v===vv)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  const fab=$('#fab');if(fab)fab.hidden=!(ui.view==='inicio'||(ui.view==='casos'&&!ui.caseId));
  if(!conservar)window.scrollTo(0,0);
}
const msg=(sel,t)=>{const e=$(sel);if(e)e.textContent=t;};

function nuevoCaso(){
  let n=state.casos.length+1;
  while(state.casos.some(c=>c.codigo==='C-'+String(n).padStart(3,'0')))n++;
  const c={id:uid(),codigo:'C-'+String(n).padStart(3,'0'),nombre:'',pais:'',idiomas_lista:[],nacimiento:'',llegada:'',contacto:'',situacion:'otra',tramite:'ninguno',vivienda:'',empleo:'',familia:'',vul:[],notas:'',estado:'abierto',creado:hoy(),actualizado:new Date().toISOString(),seg:[],docs:[],der:[]};
  state.casos.push(c);guardar();
  ui.view='casos';ui.caseId=c.id;ui.tab='ficha';render();
  const f=$('[data-f="nombre"]');if(f)f.focus();
}

function accion(a,el){
  const c=ui.caseId?getCaso(ui.caseId):null;
  switch(a){
    case 'nav':ui.view=el.dataset.v;ui.caseId=null;render();$('#main').focus({preventScroll:true});break;
    case 'ir-casos':ui.f=el.dataset.f||ui.f;ui.q='';ui.view='casos';ui.caseId=null;render();break;
    case 'ir-plazos':ui.view='plazos';ui.caseId=null;render();break;
    case 'nuevo':nuevoCaso();break;
    case 'abrir':ui.view='casos';ui.caseId=el.dataset.id;ui.tab=el.dataset.tab||'ficha';render();break;
    case 'volver':ui.caseId=null;render();break;
    case 'filtro':
      if(el.dataset.v==='archivados' && !ui.archivadosDesbloqueados){
        ui.f='archivados';
      } else {
        ui.f=el.dataset.v;
      }
      render(true);
      break;
    case 'tab':ui.tab=el.dataset.t;render(true);break;
    
    // Ciclo de estado: Abierto -> Cerrado -> Archivado
   case 'estado':
      if(c.estado==='abierto') {
        c.estado='cerrado';
        c.cierre=hoy(); // Guardamos el día exacto en que se cerró
      }
      else if(c.estado==='cerrado') {
        c.estado='archivado';
      }
      else {
        c.estado='abierto';
        c.cierre='';
      }
      tocar(c);
      render(true);
      toast('Estado actualizado a: '+c.estado);
      break;

    case 'desbloquear-archivados':
      const passInput = $('#pass-archivados');
      if(passInput && passInput.value === 'admin123'){ // Contraseña protegida de ejemplo
        ui.archivadosDesbloqueados = true;
        render(true);
        toast('Sección de archivados desbloqueada');
      } else {
        toast('Contraseña incorrecta');
        if(passInput) passInput.focus();
      }
      break;

    case 'borrar-caso':confirmar('Eliminar caso','Se borrarán también su seguimiento, documentos y plazos. Esta acción no se puede deshacer.','Eliminar caso',()=>{
      state.casos=state.casos.filter(x=>x.id!==c.id);state.plazos=state.plazos.filter(p=>p.caso!==c.id);guardar();ui.caseId=null;render();toast('Caso eliminado');});break;
    
    case 'resumen':
      generarPDFInforme(c);
      break;
      
    case 'modal-cerrar':cerrarModal();break;
    case 'velo':if(el===document.activeElement||true){/* clic */}break;
    case 'confirmar-ok':{const f=pendiente;cerrarModal();if(f)f();break;}

    case 'idioma-add': {
      const input = $('#nuevo-idioma-input');
      const select = $('#nuevo-nivel-select');
      const val = input.value.trim();
      if(!val) { input.focus(); return; }
      
      if(!Array.isArray(c.idiomas_lista)) c.idiomas_lista = [];
      c.idiomas_lista.push({ idioma: val, nivel: select.value });
      
      tocar(c);
      render(true);
      toast('Idioma añadido');
      break;
    }
    case 'idioma-del': {
      const idx = parseInt(el.dataset.idx, 10);
      c.idiomas_lista.splice(idx, 1);
      tocar(c);
      render(true);
      toast('Idioma eliminado');
      break;
    }
    case 'guardar-caso':
      tocar(c);
      toast('¡Caso guardado correctamente!');
      break;

    case 'seg-add':{
      const f=$('#seg-fecha').value,t=$('#seg-texto').value.trim();
      if(!f||!t){msg('#seg-msg','Indica la fecha y qué se ha hecho o acordado.');(t?$('#seg-fecha'):$('#seg-texto')).focus();return;}
      c.seg.push({id:uid(),fecha:f,tipo:$('#seg-tipo').value,texto:t});tocar(c);render(true);toast('Intervención añadida');$('#seg-texto').focus();break;}
    case 'seg-del':confirmar('Eliminar intervención','Se quitará esta entrada del seguimiento.','Eliminar',()=>{c.seg=c.seg.filter(x=>x.id!==el.dataset.id);tocar(c);render(true);toast('Intervención eliminada');});break;

    case 'doc-add':{
      const t=$('#doc-nuevo').value.trim();if(!t){$('#doc-nuevo').focus();return;}
      c.docs.push({id:uid(),t:t,ok:false});tocar(c);render(true);toast('Documento añadido');$('#doc-nuevo').focus();break;}
    case 'doc-del':c.docs=c.docs.filter(d=>d.id!==el.dataset.id);tocar(c);render(true);toast('Documento quitado');break;
    case 'doc-load':{
      const k=$('#doc-tram').value,items=(TRAM[k]&&TRAM[k].items)||[];let n=0;
      items.forEach(t=>{if(!c.docs.some(d=>d.t===t)){c.docs.push({id:uid(),t:t,ok:false});n++;}});
      tocar(c);render(true);toast(n?n+' '+plural(n,'documento añadido','documentos añadidos'):'Esa lista ya estaba cargada');break;}

    case 'plz-calc':{
      const f=calcPlazo($('#plz-tipo').value,$('#plz-notif').value);
      if(!f){msg('#plz-msg',PLZ[$('#plz-tipo').value].regla?'Indica la fecha de notificación.':'Introduce la fecha límite a mano.');return;}
      $('#plz-fecha').value=f;msg('#plz-msg','Fecha límite calculada: '+fmtLargo(f)+'.');break;}
    case 'plz-add':{
      const tipo=$('#plz-tipo').value,notif=$('#plz-notif').value;
      let f=$('#plz-fecha').value;
      if(!f&&notif)f=calcPlazo(tipo,notif)||'';
      if(!f){msg('#plz-msg','Indica la fecha.');return;}
      state.plazos.push({id:uid(),caso:c.id,tipo:tipo,fecha:f,notif:notif,nota:$('#plz-nota').value.trim(),hecho:false});tocar(c);render(true);toast('Plazo añadido');break;}
    case 'plz-hecho':{const p=state.plazos.find(x=>x.id===el.dataset.id);if(p){p.hecho=!p.hecho;guardar();render(true);}break;}
    case 'plz-del':confirmar('Eliminar plazo','Se quitará este plazo.','Eliminar',()=>{state.plazos=state.plazos.filter(x=>x.id!==el.dataset.id);guardar();render(true);toast('Plazo eliminado');});break;
    case 'calc-global':{
      const tipo=$('#calc-tipo').value,f=calcPlazo(tipo,$('#calc-fecha').value);
      $('#calc-res').innerHTML=f?'<strong>Fecha límite: '+esc(fmtLargo(f))+'</strong>':'Indica la fecha de notificación.';break;}

    case 'der-add':{
      const r=$('#der-rec').value.trim();
      if(!r){msg('#der-msg','Indica el recurso.');$('#der-rec').focus();return;}
      c.der.push({id:uid(),recurso:r,fecha:$('#der-fecha').value||hoy(),motivo:$('#der-motivo').value.trim(),estado:'Pendiente'});tocar(c);render(true);toast('Derivación añadida');break;}
    case 'der-del':confirmar('Eliminar derivación','Se quitará esta derivación.','Eliminar',()=>{c.der=c.der.filter(x=>x.id!==el.dataset.id);tocar(c);render(true);toast('Derivación eliminada');});break;

    case 'rec-add':{
      const n=$('#rec-nombre').value.trim();
      if(!n){msg('#rec-msg','Indica el nombre.');$('#rec-nombre').focus();return;}
      state.recursos.push({id:uid(),nombre:n,tipo:$('#rec-tipo').value.trim(),contacto:'',notas:''});guardar();render(true);toast('Recurso añadido');break;}
    case 'rec-del':confirmar('Eliminar recurso','Se quitará del directorio.','Eliminar',()=>{state.recursos=state.recursos.filter(x=>x.id!==el.dataset.id);guardar();render(true);toast('Recurso eliminado');});break;

    case 'logout':
      supabase.auth.signOut().then(() => {
        ui.loggedIn = false;
        ui.archivadosDesbloqueados = false;
        render();
        toast('Sesión cerrada');
      });
      break;
  }
}

// --- 2. LOGIN REAL ---
const loginForm = document.getElementById('login-form');
if(loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;
    const msg = $('#login-msg');
    
    msg.textContent = 'Iniciando sesión...';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass
    });

    if (error) {
      msg.textContent = 'Usuario o contraseña incorrectos.';
    } else {
      msg.textContent = '';
      ui.loggedIn = true;
      $('#login-email').value = '';
      $('#login-pass').value = '';
      render();
      toast('Bienvenido');
    }
  });
}

document.addEventListener('click',e=>{
  const velo=e.target.classList&&e.target.classList.contains('velo');
  if(velo){cerrarModal();return;}
  const el=e.target.closest('[data-a]');
  if(!el)return;
  accion(el.dataset.a,el);
});

document.addEventListener('change',e=>{
  const t=e.target;
  if(ui.view==='casos'&&ui.caseId){
    const c=getCaso(ui.caseId);if(!c)return;
    if(t.dataset.f){c[t.dataset.f]=t.value;tocar(c);actualizarCabecera(c);return;}
    if(t.dataset.vul){c.vul=c.vul.filter(x=>x!==t.dataset.vul);if(t.checked)c.vul.push(t.dataset.vul);tocar(c);return;}
    if(t.dataset.doc){const d=c.docs.find(x=>x.id===t.dataset.doc);if(d){d.ok=t.checked;tocar(c);actualizarCabecera(c);const p=progresoDocs(c);$('#docs-txt').innerHTML='<strong>'+p.txt+'</strong>';$('#docs-barra').style.width=p.pct+'%';}return;}
    if(t.dataset.der){const d=c.der.find(x=>x.id===t.dataset.der);if(d){d.estado=t.value;tocar(c);}return;}
  }
  if(t.dataset.r){const r=state.recursos.find(x=>x.id===t.dataset.rid);if(r){r[t.dataset.r]=t.value;guardar();}}
});

document.addEventListener('input',e=>{
  if(e.target.id==='q'){ui.q=e.target.value;$('#lista-casos').innerHTML=listaCasos();}
});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&$('#modal-root').firstChild){cerrarModal();return;}
  if(e.key==='Enter'&&e.target.id==='nuevo-idioma-input'){e.preventDefault();accion('idioma-add',e.target);}
});

// --- 3. ARRANQUE ---
async function arrancarApp() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    ui.loggedIn = true;
  }
  render();
}

arrancarApp();

})();
