// Hamburger / Drawer
function openDrawer(){
  document.getElementById("nav-drawer").classList.add("open");
  document.getElementById("nav-overlay").classList.add("open");
  document.getElementById("hbg").classList.add("open");
  document.body.style.overflow="hidden";
}
function closeDrawer(){
  document.getElementById("nav-drawer").classList.remove("open");
  document.getElementById("nav-overlay").classList.remove("open");
  document.getElementById("hbg").classList.remove("open");
  document.body.style.overflow="";
}



// SUPABASE CONFIG
var SB = "https://dznzzlgwcnwckubpgwjk.supabase.co";
var SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bnp6bGd3Y253Y2t1YnBnd2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzAxMzQsImV4cCI6MjA5MzY0NjEzNH0.j-kgLIxqM1KWrk3thV_xtDMVdyvOKAc4IpA5lBDYgps";
function sbq(path,opts){
  var h={"apikey":SK,"Authorization":"Bearer "+SK,"Content-Type":"application/json","Prefer":"return=representation"};
  if(opts&&opts.headers)Object.assign(h,opts.headers);
  return fetch(SB+"/rest/v1/"+path,Object.assign({},opts,{headers:h}));
}
// NAV
document.getElementById("hbg").onclick=openDrawer;
document.getElementById("nav-drawer-close").onclick=closeDrawer;
// ADMIN TRIGGER
var _adminClicks=0,_adminTimer;
function adminSecretClick(){
  _adminClicks++;clearTimeout(_adminTimer);
  _adminTimer=setTimeout(function(){_adminClicks=0;},800);
  if(_adminClicks>=5){_adminClicks=0;document.getElementById("admin-pwd-bar").style.display="inline-flex";document.getElementById("admin-pwd-input").focus();}
}
function adminEntrar(){
  var pwd=document.getElementById("admin-pwd-input").value;
  if(pwd!=="noma2025"){document.getElementById("admin-pwd-input").style.borderColor="rgba(200,80,80,0.7)";document.getElementById("admin-pwd-input").value="";document.getElementById("admin-pwd-input").placeholder="Senha incorreta";return;}
  document.getElementById("admin-pwd-bar").style.display="none";
  document.getElementById("admin-pwd-input").value="";
  document.getElementById("admin-pwd-input").placeholder="Senha";
  document.getElementById("admin-panel").classList.add("on");
  adminAba("alunos",document.getElementById("aba-alunos"));
  adminLoadAlunos();renderAdminAgend();renderAdminQuiz();
}
function adminAba(nome,btn){
  ["alunos","agendamentos","quiz"].forEach(function(t){
    var panel=document.getElementById("admin-tab-"+t);
    var tabBtn=document.getElementById("aba-"+t);
    if(panel)panel.style.display=t===nome?"block":"none";
    if(tabBtn){tabBtn.style.background=t===nome?"var(--gold)":"transparent";tabBtn.style.color=t===nome?"white":"rgba(245,239,228,0.6)";tabBtn.style.fontWeight=t===nome?"500":"400";}
  });
}
function adminLoadAlunos(){
  sbq('noma_alunos?select=*&order=created_at.desc').then(function(r){return r.json();}).then(function(d){
    var el=document.getElementById('admin-alunos-list');
    if(!d||!d.length){el.innerHTML='<p style="color:rgba(245,239,228,.5);font-size:.85rem;padding:1rem 0">Nenhum aluno cadastrado ainda.</p>';return;}
    var planos=['light','light+','light++','lightstar','full','full+','full++','fullstar','bee','admin'];
    var labels={light:'Light 1x/sem (mensal)','light+':'Light+ 1x/sem (trim)','light++':'Light++ 1x/sem (sem)',lightstar:'Light \u2726 anual',full:'Full 2x/sem (mensal)','full+':'Full+ 2x/sem (trim)','full++':'Full++ 2x/sem (sem)',fullstar:'Full \u2726 anual',bee:'Bee',admin:'Admin'};
    var rows=d.map(function(a){
      var fc=!a.data_fim?'rgba(245,239,228,.4)':new Date(a.data_fim)<new Date()?'#ff9090':'#7ddc7d';
      var opts=planos.map(function(p){return '<option value="'+p+'"'+(a.plano===p?' selected':'')+'>'+labels[p]+'</option>';}).join('');
      return '<tr id="row-'+a.id+'" style="transition:background .4s">'
        +'<td style="padding:7px 8px;border-bottom:1px solid rgba(245,239,228,.06)">'
        +'<input value="'+a.usuario+'" data-field="usuario" data-id="'+a.id+'" style="background:rgba(245,239,228,.07);border:1px solid rgba(245,239,228,.15);border-radius:6px;padding:4px 7px;color:rgba(245,239,228,.9);font-size:.82rem;width:100%;outline:none">'
        +'</td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid rgba(245,239,228,.06)">'
        +'<input value="'+(a.senha||'')+'" data-field="senha" data-id="'+a.id+'" placeholder="nova senha" style="background:rgba(245,239,228,.07);border:1px solid rgba(245,239,228,.15);border-radius:6px;padding:4px 7px;color:rgba(245,239,228,.9);font-size:.82rem;width:100%;outline:none">'
        +'</td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid rgba(245,239,228,.06)">'
        +'<select data-field="plano" data-id="'+a.id+'" style="background:#1a2412;border:1px solid rgba(245,239,228,.15);border-radius:6px;padding:4px 7px;color:rgba(245,239,228,.9);font-size:.82rem;width:100%;outline:none">'+opts+'</select>'
        +'</td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid rgba(245,239,228,.06)">'
        +'<input type="date" value="'+(a.data_inicio||'')+'" data-field="data_inicio" data-id="'+a.id+'" style="background:rgba(245,239,228,.07);border:1px solid rgba(245,239,228,.15);border-radius:6px;padding:4px 7px;color:rgba(245,239,228,.9);font-size:.82rem;width:100%;outline:none;color-scheme:dark">'
        +'</td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid rgba(245,239,228,.06)">'
        +'<input type="date" value="'+(a.data_fim||'')+'" data-field="data_fim" data-id="'+a.id+'" style="background:rgba(245,239,228,.07);border:1px solid rgba(245,239,228,.15);border-radius:6px;padding:4px 7px;color:'+fc+';font-size:.82rem;width:100%;outline:none;color-scheme:dark">'
        +'</td>'
        +'<td style="padding:7px 8px;border-bottom:1px solid rgba(245,239,228,.06);text-align:right;white-space:nowrap">'
        +'<button onclick="adminSalvarAluno('+a.id+')" style="background:rgba(100,180,100,.15);color:#7ddc7d;border:none;border-radius:6px;padding:4px 9px;font-size:.75rem;cursor:pointer;margin-right:3px">Salvar</button>'
        +'<button onclick="adminRecalcFim('+a.id+')" style="background:rgba(200,136,26,.15);color:#e5a82a;border:none;border-radius:6px;padding:4px 9px;font-size:.75rem;cursor:pointer;margin-right:3px" title="Calcular fim pelo plano">Auto</button>'
        +'<button onclick="adminRemoverAluno({getAttribute:function(){return \"'+a.id+'\"}})" style="background:rgba(220,80,80,.12);color:#ff9090;border:none;border-radius:6px;padding:4px 9px;font-size:.75rem;cursor:pointer">✕</button>'
        +'</td></tr>';
    }).join('');
    el.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:.82rem">'
      +'<thead><tr>'
      +'<th style="text-align:left;padding:6px 8px;color:rgba(245,239,228,.4);font-weight:400;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(245,239,228,.1)">Usuário</th>'
      +'<th style="text-align:left;padding:6px 8px;color:rgba(245,239,228,.4);font-weight:400;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(245,239,228,.1)">Senha</th>'
      +'<th style="text-align:left;padding:6px 8px;color:rgba(245,239,228,.4);font-weight:400;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(245,239,228,.1)">Plano</th>'
      +'<th style="text-align:left;padding:6px 8px;color:rgba(245,239,228,.4);font-weight:400;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(245,239,228,.1)">Início</th>'
      +'<th style="text-align:left;padding:6px 8px;color:rgba(245,239,228,.4);font-weight:400;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid rgba(245,239,228,.1)">Fim contrato</th>'
      +'<th style="border-bottom:1px solid rgba(245,239,228,.1)"></th>'
      +'</tr></thead><tbody>'+rows+'</tbody></table>';
  }).catch(function(){document.getElementById('admin-alunos-list').innerHTML='<p style="color:#ff9090;font-size:.85rem">Erro ao carregar.</p>';});
}

function adminSalvarAluno(id){
  var row=document.getElementById("row-"+id);
  if(!row){alert("Linha não encontrada.");return;}
  var get=function(field){var el=row.querySelector("[data-field='"+field+"']");return el?el.value.trim():null;};
  var usuario=get("usuario"),senha=get("senha"),plano=get("plano"),di=get("data_inicio"),df=get("data_fim");
  if(!usuario){alert("Usuário não pode ficar vazio.");return;}
  var body={usuario:usuario,plano:plano,data_inicio:di||null,data_fim:df||null};
  if(senha) body.senha=senha;
  var btn=row.querySelector("button");
  if(btn){btn.textContent="...";btn.disabled=true;}
  sbq("noma_alunos?id=eq."+id,{method:"PATCH",body:JSON.stringify(body)}).then(function(r){
    if(btn){btn.textContent="Salvar";btn.disabled=false;}
    if(!r.ok){return r.json().then(function(e){alert("Erro: "+(e.message||JSON.stringify(e)));});}
    // Flash row green
    row.style.background="rgba(100,180,100,.1)";
    setTimeout(function(){row.style.background="";},1500);
    adminLoadAlunos();
  }).catch(function(e){if(btn){btn.textContent="Salvar";btn.disabled=false;}alert("Erro: "+e.message);});
}

function adminRecalcFim(id){
  var row=document.getElementById("row-"+id);
  if(!row) return;
  var pl=row.querySelector("[data-field='plano']").value;
  var di=row.querySelector("[data-field='data_inicio']").value;
  if(!di){alert("Informe a data de início primeiro.");return;}
  var numAulas=_AULAS_PLANO[pl]||4;
  var aulasWk=(pl.indexOf("full")===0)?2:1;
  var df=_calcularFimPlano(di,numAulas,aulasWk);
  if(df){
    row.querySelector("[data-field='data_fim']").value=df;
    row.querySelector("[data-field='data_fim']").style.color="#7ddc7d";
  } else {
    alert("Não foi possível calcular. Verifique a data de início.");
  }
}
function adminSalvarAluno(id){
  var row=document.getElementById("row-"+id);
  if(!row){alert("Linha não encontrada.");return;}
  var get=function(field){var el=row.querySelector("[data-field='"+field+"']");return el?el.value.trim():null;};
  var usuario=get("usuario"),senha=get("senha"),plano=get("plano"),di=get("data_inicio"),df=get("data_fim");
  if(!usuario){alert("Usuário não pode ficar vazio.");return;}
  var body={usuario:usuario,plano:plano,data_inicio:di||null,data_fim:df||null};
  if(senha) body.senha=senha;
  var btn=row.querySelector("button");
  if(btn){btn.textContent="...";btn.disabled=true;}
  sbq("noma_alunos?id=eq."+id,{method:"PATCH",body:JSON.stringify(body)}).then(function(r){
    if(btn){btn.textContent="Salvar";btn.disabled=false;}
    if(!r.ok){return r.json().then(function(e){alert("Erro: "+(e.message||JSON.stringify(e)));});}
    // Flash row green
    row.style.background="rgba(100,180,100,.1)";
    setTimeout(function(){row.style.background="";},1500);
    adminLoadAlunos();
  }).catch(function(e){if(btn){btn.textContent="Salvar";btn.disabled=false;}alert("Erro: "+e.message);});
}

function adminRemoverAluno(btn){if(!confirm("Remover aluno?"))return;sbq("noma_alunos?id=eq."+btn.getAttribute("data-id"),{method:"DELETE"}).then(function(){adminLoadAlunos();});}
function adminAdicionarAluno(){
  var u=document.getElementById("admin-novo-email").value.trim();
  var p=document.getElementById("admin-novo-senha").value.trim();
  var pl=document.getElementById("admin-novo-plano").value;
  if(!u||!p){alert("Preencha usuario e senha.");return;}
  var di=document.getElementById("admin-novo-inicio").value||null;
  var df=document.getElementById("admin-novo-fim").value||null;
  // Auto-calc end date if inicio set but fim empty
  if(di&&!df){
    var numAulas=_AULAS_PLANO[pl]||4;
    var aulasWk=(pl.indexOf("full")===0)?2:1;
    df=_calcularFimPlano(di,numAulas,aulasWk);
    if(df){var elFim=document.getElementById("admin-novo-fim");if(elFim)elFim.value=df;}
  }
  var btn=document.querySelector(".adm-add");
  if(btn){btn.textContent="Salvando...";btn.disabled=true;}
  sbq("noma_alunos",{method:"POST",body:JSON.stringify({usuario:u,senha:p,plano:pl,data_inicio:di||null,data_fim:df||null})})
  .then(function(r){
    if(btn){btn.textContent="Adicionar";btn.disabled=false;}
    if(!r.ok){
      return r.json().then(function(e){
        alert("Erro Supabase: "+(e.message||e.error||JSON.stringify(e)));
      });
    }
    document.getElementById("admin-novo-email").value="";
    document.getElementById("admin-novo-senha").value="";
    document.getElementById("admin-novo-plano").value="light";
    adminLoadAlunos();
    var msg=document.getElementById("adm-add-msg");
    if(msg){msg.textContent="Aluno "+u+" adicionado!";setTimeout(function(){msg.textContent="";},3000);}
  }).catch(function(e){
    if(btn){btn.textContent="Adicionar";btn.disabled=false;}
    alert("Erro de conexao: "+e.message);
  });
}
function renderAdminAgend(){
  sbq("noma_agendamentos?select=*&order=data.asc,horario.asc").then(function(r){return r.json();}).then(function(d){
    var el=document.getElementById("admin-agendamentos");
    if(!d||!d.length){el.innerHTML="<p style='opacity:.5;font-size:.8rem'>Nenhum agendamento.</p>";return;}
    el.innerHTML="<table style='width:100%;font-size:.8rem;border-collapse:collapse'><thead><tr><th style='text-align:left;padding:6px 8px;color:rgba(245,239,228,.5)'>Data</th><th style='text-align:left;padding:6px 8px;color:rgba(245,239,228,.5)'>Horario</th><th style='text-align:left;padding:6px 8px;color:rgba(245,239,228,.5)'>Aluno</th><th></th></tr></thead><tbody>"+
      d.map(function(a){return "<tr><td style='padding:6px 8px;color:rgba(245,239,228,.8);border-bottom:1px solid rgba(245,239,228,.08)'>"+a.data.split("-").reverse().join("/")+"</td><td style='padding:6px 8px;color:rgba(245,239,228,.8);border-bottom:1px solid rgba(245,239,228,.08)'>"+a.horario+"</td><td style='padding:6px 8px;color:rgba(245,239,228,.8);border-bottom:1px solid rgba(245,239,228,.08)'>"+a.usuario+"</td><td style='padding:6px 8px;border-bottom:1px solid rgba(245,239,228,.08)'><button data-id='"+a.id+"' onclick='adminCancelarAgend(this)' style='background:rgba(220,80,80,.15);color:#ff9090;border:none;border-radius:6px;padding:3px 10px;font-size:.72rem;cursor:pointer'>Cancelar</button></td></tr>";}).join("")+"</tbody></table>";
  });
}
function adminCancelarAgend(btn){if(!confirm("Cancelar aula?"))return;sbq("noma_agendamentos?id=eq."+btn.getAttribute("data-id"),{method:"DELETE"}).then(function(){renderAdminAgend();nomaRenderGrid();});}
function renderAdminQuiz(){
  sbq("noma_quiz?select=*&order=created_at.desc&limit=50").then(function(r){return r.json();}).then(function(d){
    var el=document.getElementById("admin-content");
    if(!d||!d.length){el.innerHTML="<p style='opacity:.5;font-size:.8rem'>Nenhuma resposta.</p>";return;}
    el.innerHTML="<p style='font-size:.78rem;color:rgba(245,239,228,.5);margin-bottom:1rem'>"+d.length+" resposta(s)</p>"+
      d.map(function(q){return "<div style='border:1px solid rgba(245,239,228,.12);border-radius:12px;padding:1rem;margin-bottom:.6rem'><div style='display:flex;justify-content:space-between;margin-bottom:.4rem'><strong style='color:var(--gold-light)'>"+(q.nome||"")+"</strong></div><div style='font-size:.78rem;color:rgba(245,239,228,.65)'>Email: "+(q.email||"-")+"</div><div style='font-size:.78rem;color:rgba(245,239,228,.65)'>Turma: "+(q.turma||"-")+" | Estilo: "+(q.estilo||"-")+" | Metodo: "+(q.metodo||"-")+" | Plano: "+(q.compromisso||"-")+"</div><div style='font-size:.78rem;color:rgba(245,239,228,.5)'>Temas: "+(q.temas||"-")+"</div></div>";}).join("");
  });
}
function exportarCSV(){
  sbq("noma_agendamentos?select=*").then(function(r){return r.json();}).then(function(d){
    var rows=["Usuario,Data,Horario"];
    d.forEach(function(a){rows.push(a.usuario+","+a.data+","+a.horario);});
    var b=new Blob([rows.join("\n")],{type:"text/csv"});
    var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="agendamentos.csv";a.click();URL.revokeObjectURL(u);
  });
}
// QUIZ
var nomaRespostas=[];
var _qC=0,_qA={},_qT=[];
var _qP=[
  {t:"Eu tenho...",o:[["kids","Entre 8 e 11 anos"],["teens","Entre 12 e 17 anos"],["adults","Mais de 18 anos"]]},
  {t:"Como você se relaciona com o inglês hoje?",o:[["beginner","Estou começando do zero ou quase isso"],["intermediate","Já entendo um pouco, mas travo na hora de falar"],["advanced","Já me comunico, mas quero soar mais natural e profissional"],["bee","Preciso de apoio com o conteúdo que já trabalho em outra escola"]]},
  {t:"Como você aprende melhor?",o:[["talking","Falando, errando e tentando de novo, na prática mesmo"],["games","Com desafios, jogos e aquela sensação de próximo nível"],["mixed","Gosto de variar"]]},
  {t:"Quanto ao compromisso, o que combina mais com você agora?",o:[["feather","Quero voltar com o inglês, mas de um jeito leve"],["plus","Estou criando uma rotina e quero consistência"],["plusplus","Quero ver resultado de verdade"],["annual","Dessa vez eu quero ir até o fim"]]},
  {t:"Que temas te animam mais? Escolha entre 3 e 5.",topics:true,o:["Cultura Pop","Futebol","Cultura Americana","Música","Séries e Filmes","Viagens","Tecnologia","Negócios e Carreira","Gastronomia","Esportes","Moda e Estilo","Games"]},
  {t:"Quase lá! Como a gente te encontra?",contato:true}
];

function qSelBtn(el){qSel(el.getAttribute("data-val"),el);}
function qSel(v,el){
  _qA[_qC]=v;
  var a=document.getElementById("quiz-opcoes").querySelectorAll(".quiz-opt");
  for(var i=0;i<a.length;i++) a[i].classList.remove("selected");
  el.classList.add("selected");
}
function qTopBtn(el){qTop(el,el.getAttribute("data-topic"));}
function qTop(el,t){
  var i=_qT.indexOf(t);
  if(i>=0){_qT.splice(i,1);el.classList.remove("selected");}
  else if(_qT.length<5){_qT.push(t);el.classList.add("selected");}
  var h=document.getElementById("topics-hint");
  h.textContent=_qT.length===0?"":_qT.length<3?_qT.length+" selecionados (mínimo 3)":_qT.length===5?"5 selecionados (máximo)":_qT.length+" selecionados";
}
function qRender(){
  var p=_qP[_qC];
  document.getElementById("quiz-titulo").textContent=p.t;
  document.getElementById("topics-hint").textContent="";
  var oe=document.getElementById("quiz-opcoes"),ce=document.getElementById("quiz-contato");
  if(p.contato){
    oe.style.display="none"; oe.innerHTML=""; ce.style.display="flex";
  } else if(p.topics){
    ce.style.display="none"; oe.style.display="grid";
    oe.style.gridTemplateColumns="1fr 1fr"; oe.style.gap="0.5rem";
    var h="";
    for(var i=0;i<p.o.length;i++){
      var t=p.o[i],s=_qT.indexOf(t)>=0?" selected":"";
      h+="<button class='quiz-opt"+s+"' data-topic='"+t+"' onclick='qTopBtn(this)'>"+t+"</button>";
    }
    oe.innerHTML=h;
    if(_qT.length>0) document.getElementById("topics-hint").textContent=_qT.length+" selecionados"+(_qT.length<3?" (mínimo 3)":"");
  } else {
    ce.style.display="none"; oe.style.display="flex";
    oe.style.flexDirection="column"; oe.style.gap="0.75rem";
    var h="";
    for(var i=0;i<p.o.length;i++){
      var o=p.o[i],s=_qA[_qC]===o[0]?" selected":"";
      h+="<button class='quiz-opt"+s+"' data-val='"+o[0]+"' onclick='qSelBtn(this)'>"+o[1]+"</button>";
    }
    oe.innerHTML=h;
  }
  document.getElementById("quiz-back").style.visibility=_qC===0?"hidden":"visible";
  document.getElementById("quiz-next").textContent=_qC>=_qP.length-1?"Ver meu resultado ✦":"Próxima →";
  var dots=document.getElementById("quiz-progress").querySelectorAll(".quiz-dot");
  dots.forEach(function(d,i){
    d.className="quiz-dot";
    if(i<_qC) d.classList.add("done");
    else if(i===_qC) d.classList.add("active");
  });
}
function qProximo(){
  var p=_qP[_qC];
  if(p.contato){
    var nm=document.getElementById("quiz-name").value.trim();
    var em=document.getElementById("quiz-email").value.trim();
    if(nm.split(" ").filter(function(x){return x.length>0;}).length<2){
      document.getElementById("name-hint").style.display="block"; return;
    }
    document.getElementById("name-hint").style.display="none";
    var lgpd = document.getElementById("quiz-lgpd");
    if(lgpd && !lgpd.checked){
      lgpd.style.outline="2px solid rgba(229,168,42,0.8)";
      lgpd.parentElement.querySelector("span").style.color="rgba(229,168,42,0.9)";
      return;
    }
    qRes(); return;
  }
  if(p.topics){
    if(_qT.length<3){
      var h=document.getElementById("topics-hint");
      h.style.color="#E5A82A"; h.textContent=_qT.length+" selecionados (mínimo 3)"; return;
    }
  } else if(!_qA[_qC]){
    var b=document.getElementById("quiz-next");
    b.style.opacity="0.4"; setTimeout(function(){b.style.opacity="1";},400); return;
  }
  _qC++; qRender();
}
function qVoltar(){if(_qC>0){_qC--;qRender();}}
function qReiniciar(){
  _qC=0;_qA={};_qT=[];
  document.getElementById("quiz-name").value="";
  document.getElementById("quiz-email").value="";
  document.getElementById("quiz-phone").value="";
  document.getElementById("quiz-contato").style.display="none";
  document.getElementById("quiz-result").style.display="none";
  document.getElementById("quiz-container").style.display="block";
  qRender();
}
function qRes(){
  var tu=_qA[0],level=_qA[1],me=_qA[2],co=_qA[3];
  var nm=document.getElementById("quiz-name").value.trim();
  var em=document.getElementById("quiz-email").value.trim();
  var ph2=document.getElementById("quiz-phone").value.trim();
  if(typeof nomaRespostas!=="undefined") nomaRespostas.push({timestamp:new Date().toLocaleString("pt-BR"),name:nm,email:em,phone:ph2,turma:tu,level:level,method:me,commitment:co,topics:_qT});
  var isBee=level==="bee"; var tn=tu==="kids"?"NOMA Sprouts":tu==="teens"?"NOMA Buds":(isBee?"NOMA Bee":"NOMA Bloom");
  var em2=tu==="kids"?"🌱":tu==="teens"?"🚀":(isBee?"🐝":"✈️");
  var pl=(level==="intermediate"||level==="beginner")?"Roots":"Flow";
  var mt=me==="games"?"Level":"Quest";
  var cn=(isBee?"Bee":{feather:"Light",plus:"Light+",plusplus:"Light++",annual:"Light ✦"}[co]||co);
  var ds={kids:"Seu filho vai aprender sem perceber que está estudando. O NOMA Sprouts transforma o inglês em aventura desde cedo.",teens:"O NOMA Buds é pra quem quer aprender de um jeito que faz sentido com a sua vida.",adults:"Com o NOMA Bloom, o inglês finalmente encaixa na sua rotina real, trabalho, viagens ou onde você quiser chegar.",bee:"Com o NOMA Bee, o reforço escolar deixa de ser decoreba. Conteúdo do colégio com a leveza e o contexto que fazem a diferença."};
  var wpp="https://wa.me/5515988137161?text=Hi%20Teacher%20Juli!%20Quero%20agendar%20minha%20aula%20experimental";
  document.getElementById("result-content").innerHTML=
    "<div class='result-emoji'>"+em2+"</div>"+
    "<div class='result-label'>Olá, "+nm.split(" ")[0]+"! Esse é seu perfil NOMA</div>"+
    "<div class='result-title'>"+tn+"</div>"+
    "<p class='result-desc'>"+(isBee?ds.bee:(ds[tu]||""))+"</p>"+
    "<div style='margin-top:1.5rem;display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap;'>"+
      "<a href='#"+pl.toLowerCase()+"' style='text-decoration:none'><span class='result-plan' style='cursor:pointer;border:1.5px solid rgba(229,168,42,0.4);'>✦ Plano "+pl+" ↗</span></a>"+
      "<a href='#"+mt.toLowerCase()+"' style='text-decoration:none'><span class='result-plan' style='cursor:pointer;border:1.5px solid rgba(229,168,42,0.4);'>✦ Método "+mt+" ↗</span></a>"+
      "<a href='#"+cn.toLowerCase().replace(/[^a-z]/g,"")+"' style='text-decoration:none'><span class='result-plan' style='cursor:pointer;border:1.5px solid rgba(229,168,42,0.4);'>✦ "+cn+" ↗</span></a>"+
    "</div>"+
    "<p style='margin-top:1.5rem;font-size:0.85rem;color:rgba(245,239,228,0.6);line-height:1.6;'>Essas são nossas sugestões com base no que você nos contou. A gente conversa os detalhes juntos, sem compromisso.</p>"+
    "<a href='"+wpp+"' target='_blank' style='display:inline-flex;align-items:center;gap:0.5rem;margin-top:1.25rem;background:var(--green);color:var(--cream);text-decoration:none;padding:0.85rem 2rem;border-radius:100px;font-size:0.95rem;font-weight:500;'>"+
      "<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'><path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z'/><path d='M12 0C5.373 0 0 5.373 0 12c0 2.128.558 4.126 1.532 5.858L0 24l6.335-1.652A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.37l-.36-.214-3.728.972.994-3.634-.235-.374A9.818 9.818 0 1 1 12 21.818z'/></svg>"+
      "Agende sua aula experimental</a>";
  // Save to Supabase
  if(typeof sbq !== "undefined"){
    sbq("noma_quiz",{method:"POST",body:JSON.stringify({nome:nm,email:em,turma:tn,estilo:pl,metodo:mt,compromisso:cn,temas:_qT.join(", ")})}).catch(function(){});
  }
  document.getElementById("quiz-container").style.display="none";
  document.getElementById("quiz-result").style.display="block";
}
function _quizInit(){
  var pr=document.getElementById("quiz-progress");
  if(!pr||pr.childElementCount>0) return;
  pr.innerHTML="";
  for(var i=0;i<_qP.length;i++){
    var d=document.createElement("div");
    d.className="quiz-dot"+(i===0?" active":"");
    pr.appendChild(d);
  }
  var fa=document.querySelectorAll(".fade-in");
  if(fa.length>0){
    var ob=new IntersectionObserver(function(en){
      en.forEach(function(e,i){
        if(e.isIntersecting){setTimeout(function(){e.target.classList.add("visible");},i*80);ob.unobserve(e.target);}
      });
    },{threshold:0.12});
    fa.forEach(function(f){ob.observe(f);});
  }
  qRender();
}
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",_quizInit);
} else {
  _quizInit();
}
// AREA DO ALUNO (noma-* IDs)
var _nomaUser=null,_nomaPlano=null,_nomaIsAdm=false,_nomaWeekOffset=0,_nomaStart=null,_nomaFim=null;
var _nomaPendingDate=null,_nomaPendingTime=null;