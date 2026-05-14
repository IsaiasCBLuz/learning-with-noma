// AREA DO ALUNO (noma-* IDs)
var _nomaUser=null,_nomaPlano=null,_nomaIsAdm=false,_nomaWeekOffset=0,_nomaStart=null,_nomaFim=null;
var _nomaPendingDate=null,_nomaPendingTime=null;
var _SLOTS=["07:30","09:00","10:30","12:00","14:30","16:00","17:30","19:00","20:30","22:00"];
var _BLOCKED=["07:30","09:00","10:30","12:00","14:30","16:00","17:30"];
var _DIAS=["Seg","Ter","Qua","Qui","Sex"];
// Feriados nacionais + locais 2025 e 2026 (sem aulas)
var _FERIADOS=[
  // 2025
  "2025-01-01", // Ano Novo
  "2025-03-03","2025-03-04", // Carnaval
  "2025-04-18","2025-04-19","2025-04-21", // Semana Santa + Tiradentes
  "2025-05-01", // Dia do Trabalho
  "2025-06-04","2025-06-05", // Corpus Christi + emenda
  "2025-06-19", // Corpus Christi (nacional)
  "2025-09-07", // Independência
  "2025-10-12", // Nossa Sra. Aparecida
  "2025-11-02", // Finados
  "2025-11-15", // Proclamação da República
  "2025-11-20", // Consciência Negra
  "2025-12-24","2025-12-25","2025-12-26","2025-12-31", // Natal + recesso
  // 2026
  "2026-01-01","2026-01-02", // Ano Novo + emenda
  "2026-02-16","2026-02-17", // Carnaval
  "2026-04-03","2026-04-04","2026-04-05", // Semana Santa
  "2026-04-21", // Tiradentes
  "2026-05-01", // Dia do Trabalho
  "2026-06-04","2026-06-05", // Corpus Christi
  "2026-09-07", // Independência
  "2026-10-12", // Nossa Sra. Aparecida
  "2026-11-02", // Finados
  "2026-11-15", // Proclamação da República
  "2026-11-20"  // Consciência Negra
];
// Períodos de recesso/férias (sem aulas)
var _RECESSOS=[
  {from:"2025-07-06",to:"2025-07-17"}, // Férias julho (06/07 dom a 16/07 qua + folga 17)
  {from:"2025-12-22",to:"2026-01-05"}  // Recesso fim de ano
];
function _isDiaUtil(dateStr){
  if(_FERIADOS.indexOf(dateStr)>=0) return false;
  for(var i=0;i<_RECESSOS.length;i++){
    if(dateStr>=_RECESSOS[i].from&&dateStr<=_RECESSOS[i].to) return false;
  }
  var d=new Date(dateStr+"T12:00:00");
  var dow=d.getDay();
  return dow>=1&&dow<=5; // seg-sex
}
// Calcula quantas aulas cabem em N semanas corridas pulando feriados/recessos
function _contarAulasUteis(startDate, semanas){
  var count=0;
  var d=new Date(startDate+"T12:00:00");
  var fim=new Date(d); fim.setDate(fim.getDate()+semanas*7);
  var cur=new Date(d);
  while(cur<fim){
    var iso=cur.toISOString().split("T")[0];
    if(_isDiaUtil(iso)) count++;
    cur.setDate(cur.getDate()+1);
  }
  return count;
}
// Calcula a data final real do plano dado o início e o nº de aulas
function _calcularFimPlano(startDateStr, numAulas, aulasPerSemana){
  // Avança dia a dia adicionando aulas úteis até completar numAulas
  var usadas=0;
  var d=new Date(startDateStr+"T12:00:00");
  var maxDays=365*2;
  for(var i=0;i<maxDays;i++){
    var iso=d.toISOString().split("T")[0];
    if(_isDiaUtil(iso)){
      usadas++;
      if(usadas>=numAulas) return iso;
    }
    d.setDate(d.getDate()+1);
  }
  return null;
}
// Número de aulas por plano
var _AULAS_PLANO={
  "light":4,"light+":12,"light++":24,"lightstar":48,
  "full":8,"full+":24,"full++":48,"fullstar":96,
  "bee":4
};
function nomaLogin(){
  var u=document.getElementById("noma-login-email").value.trim();
  var p=document.getElementById("noma-login-senha").value.trim();
  var err=document.getElementById("noma-login-erro");
  if(!u||!p){err.style.display="block";err.textContent="Preencha usuario e senha.";return;}
  err.style.display="none";
  sbq("noma_alunos?usuario=eq."+encodeURIComponent(u)+"&senha=eq."+encodeURIComponent(p)+"&select=*").then(function(r){return r.json();}).then(function(d){
    if(!d||!d.length){err.style.display="block";err.textContent="Usuario ou senha incorretos.";return;}
    _nomaUser=d[0].usuario;_nomaPlano=d[0].plano;_nomaIsAdm=d[0].plano==="admin";_nomaStart=d[0].data_inicio||null;_nomaFim=d[0].data_fim||null;
    document.getElementById("noma-login-box").style.display="none";
    document.getElementById("noma-painel").style.display="block";
    document.getElementById("noma-ola").textContent="Ola, "+_nomaUser+"!";
    _nomaWeekOffset=0;nomaTab("agendar",document.getElementById("tab-agendar"));
  }).catch(function(){err.style.display="block";err.textContent="Erro de conexao.";});
}
function nomaSair(){_nomaUser=null;_nomaPlano=null;_nomaIsAdm=false;_nomaWeekOffset=0;document.getElementById("noma-login-box").style.display="block";document.getElementById("noma-painel").style.display="none";document.getElementById("noma-login-email").value="";document.getElementById("noma-login-senha").value="";document.getElementById("noma-login-erro").style.display="none";}
function nomaTab(tab,btn){
  document.getElementById("noma-view-agendar").style.display=tab==="agendar"?"block":"none";
  document.getElementById("noma-view-minhas").style.display=tab==="minhas"?"block":"none";
  var btns=[document.getElementById("tab-agendar"),document.getElementById("tab-minhas")];
  btns.forEach(function(b){if(!b)return;b.style.background=b===btn?"var(--green)":"transparent";b.style.color=b===btn?"var(--cream)":"var(--green-dark)";});
  if(tab==="agendar")nomaRenderGrid();
  if(tab==="minhas")nomaRenderMinhas();
}
function nomaWeek(dir){_nomaWeekOffset+=dir;nomaRenderGrid();}
function _nomaGetWeekDates(){
  var now=new Date(),mon=new Date(now);mon.setHours(0,0,0,0);
  var d=mon.getDay(),diff=d===0?-6:1-d;mon.setDate(mon.getDate()+diff+_nomaWeekOffset*7);
  var days=[];for(var i=0;i<5;i++){var dt=new Date(mon);dt.setDate(mon.getDate()+i);days.push({date:dt.toISOString().split("T")[0],label:_DIAS[i]});}
  return days;
}
function nomaRenderGrid(){
  var days=_nomaGetWeekDates();
  var s=days[0].date.split("-").slice(1).join("/"),e=days[4].date.split("-").slice(1).join("/");
  document.getElementById("noma-week-label").textContent="Semana de "+s+" a "+e;
  Promise.all([sbq("noma_agendamentos?select=*").then(function(r){return r.json();}),sbq("noma_liberados?select=*").then(function(r){return r.json();})]).then(function(res){_nomaRenderGridHtml(days,res[0]||[],(res[1]||[]).map(function(l){return l.chave;}));}).catch(function(){_nomaRenderGridHtml(days,[],[]);});
}
function _nomaRenderGridHtml(days,bookings,liberados){
  var now=new Date();
  var cols="<div style='display:grid;grid-template-columns:50px repeat(5,1fr);gap:4px;'>";
  cols+="<div></div>";
  days.forEach(function(day){var p=day.date.split("-");cols+="<div style='text-align:center;font-size:.72rem;font-weight:600;color:var(--green-dark);padding:4px'>"+day.label+"<br><span style='font-size:.65rem;opacity:.6'>"+p[2]+"/"+p[1]+"</span></div>";});
  _SLOTS.forEach(function(slot){
    cols+="<div style='font-size:.7rem;color:var(--text-muted);padding:6px 4px;display:flex;align-items:center'>"+slot+"</div>";
    days.forEach(function(day){
      var key=day.date+"_"+slot;
      var dt=new Date(day.date+"T"+slot+":00"),isPast=dt<=now;
      var isOffDay=!_isDiaUtil(day.date);
      var isBlk=_BLOCKED.indexOf(slot)>=0,isLib=liberados.indexOf(key)>=0;
      if(isOffDay||isPast){cols+="<div style='background:#f0ece4;border-radius:6px;height:32px;border:1px solid #e0dbd0'></div>";return;}
      var bk=null;bookings.forEach(function(b){if(b.data===day.date&&b.horario===slot)bk=b;});
      if(_nomaIsAdm){
        if(bk){cols+="<div data-id='"+bk.id+"' onclick='nomaCancelarSlot(this)' style='background:rgba(220,80,80,.15);border:1px solid rgba(220,80,80,.3);border-radius:6px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#c0392b;text-align:center'>"+bk.usuario+" x</div>";}
        else if(isBlk&&!isLib){cols+="<div data-key='"+key+"' onclick='nomaLiberarSlot(this)' style='background:#e8e4dc;border:1px solid #ccc;border-radius:6px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#aaa'>Fixo x</div>";}
        else{cols+="<div style='background:#f0ece4;border:1px solid #e0dbd0;border-radius:6px;height:32px'></div>";}
        return;
      }
      if(bk){if(bk.usuario===_nomaUser){cols+="<div style='background:var(--green-dark);border-radius:6px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:var(--cream)'>Minha</div>";}else{cols+="<div style='background:#e8e4dc;border:1px solid #ccc;border-radius:6px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#aaa'>Ocupado</div>";}return;}
      if(isBlk&&!isLib){cols+="<div style='background:#e8e4dc;border:1px solid #ccc;border-radius:6px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.65rem;color:#aaa'>Ocupado</div>";return;}
      // Check contract end date
      if(_nomaFim && day.date>_nomaFim){
        cols+="<div style='background:#f5f2ec;border-radius:6px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#bbb' title='Fora do contrato'>—</div>";
        return;
      }
      // Weekly limit (light=1x/sem, full=2x/sem)
      var lim=(_nomaPlano&&(_nomaPlano.indexOf("full")===0))?2:1;
      var myWk=0;
      var wkDays=_nomaGetWeekDates();
      wkDays.forEach(function(wd){bookings.forEach(function(b){if(b.data===wd.date&&b.usuario===_nomaUser)myWk++;});});
      if(myWk>=lim){
        cols+="<div style='background:#f5f2ec;border:1px dashed #ccc;border-radius:6px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#bbb;font-style:italic'>Limite</div>";
        return;
      }
      // Daily limit: only 1 slot per day per student
      var myDay=0;
      bookings.forEach(function(b){if(b.data===day.date&&b.usuario===_nomaUser)myDay++;});
      if(myDay>=1){
        cols+="<div style='background:#f5f2ec;border:1px dashed #ccc;border-radius:6px;height:32px;display:flex;align-items:center;justify-content:center;font-size:.6rem;color:#bbb;font-style:italic'>Ocupado</div>";
        return;
      }
      cols+="<div data-date='"+day.date+"' data-slot='"+slot+"' onclick='nomaOpenModal(this)' style='background:#C0DD97;border:1px solid rgba(74,94,58,.25);border-radius:6px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.72rem;color:var(--green-dark);font-weight:500;transition:all .15s' onmouseover='this.style.background=\"#a8cc7a\"' onmouseout='this.style.background=\"#C0DD97\"'>Livre</div>";
    });
  });
  cols+="</div>";
  document.getElementById("noma-grid").innerHTML=cols;
}
function nomaCancelarSlot(el){var id=el.getAttribute("data-id");if(!confirm("Cancelar esta aula?"))return;sbq("noma_agendamentos?id=eq."+id,{method:"DELETE"}).then(function(){nomaRenderGrid();renderAdminAgend();});}
function nomaLiberarSlot(el){var key=el.getAttribute("data-key");if(!confirm("Liberar este horario fixo?"))return;sbq("noma_liberados",{method:"POST",body:JSON.stringify({chave:key})}).then(function(){nomaRenderGrid();});}
function nomaOpenModal(el){
  _nomaPendingDate=el.getAttribute("data-date");_nomaPendingTime=el.getAttribute("data-slot");
  var p=_nomaPendingDate.split("-");
  document.getElementById("noma-modal-title").textContent=p[2]+"/"+p[1]+"/"+p[0]+" as "+_nomaPendingTime;
  document.getElementById("noma-modal").style.display="flex";
}
function nomaCloseModal(){document.getElementById("noma-modal").style.display="none";_nomaPendingDate=null;_nomaPendingTime=null;}
function nomaConfirm(){
  if(!_nomaPendingDate||!_nomaPendingTime)return;
  // Double-check vacation/holiday before saving
  if(!_isDiaUtil(_nomaPendingDate)){
    alert("Esta data está bloqueada (férias ou feriado). Por favor escolha outro dia.");
    nomaCloseModal(); return;
  }
  sbq("noma_agendamentos",{method:"POST",body:JSON.stringify({usuario:_nomaUser,data:_nomaPendingDate,horario:_nomaPendingTime})}).then(function(){nomaCloseModal();nomaRenderGrid();});
}
function nomaRenderMinhas(){
  sbq("noma_agendamentos?usuario=eq."+encodeURIComponent(_nomaUser)+"&select=*&order=data.asc,horario.asc").then(function(r){return r.json();}).then(function(d){
    var now=new Date(),html="";
    if(!d||!d.length){html="<p style='font-size:.9rem;color:var(--text-muted);text-align:center;padding:2rem'>Nenhuma aula agendada.</p>";}
    else{html="<div style='display:flex;flex-direction:column;gap:.75rem'>";d.forEach(function(a){var dt=new Date(a.data+"T"+a.horario+":00"),up=dt>now;var p=a.data.split("-");html+="<div style='background:white;border-radius:14px;padding:1rem 1.25rem;display:flex;justify-content:space-between;align-items:center;gap:12px;border:1px solid rgba(74,94,58,.1);flex-wrap:wrap'><div><p style='font-size:.9rem;font-weight:500;color:var(--green-dark);margin-bottom:3px'>"+p[2]+"/"+p[1]+"/"+p[0]+" as "+a.horario+"</p><p style='font-size:.75rem;color:var(--text-muted)'>Aula online - 1h30</p></div><div style='display:flex;gap:8px;align-items:center'><span style='font-size:.72rem;padding:.25rem .75rem;border-radius:100px;font-weight:500;"+(up?"background:rgba(74,94,58,.12);color:var(--green-dark)":"background:#f0ece4;color:var(--text-muted)")+"'>"+(up?"Confirmada":"Realizada")+"</span>"+(up?"<button data-id='"+a.id+"' onclick='nomaCancelarMinhas(this)' style='background:transparent;border:1.5px solid rgba(200,50,50,.3);color:#c0392b;border-radius:100px;padding:.25rem .75rem;font-size:.72rem;cursor:pointer;font-family:DM Sans,sans-serif'>Cancelar</button>":"")+"</div></div>";});html+="</div>";}
    document.getElementById("noma-minhas-list").innerHTML=html;
  });
}
function nomaCancelarMinhas(btn){var id=btn.getAttribute("data-id");if(!confirm("Cancelar esta aula?"))return;sbq("noma_agendamentos?id=eq."+id,{method:"DELETE"}).then(function(){nomaRenderMinhas();});}