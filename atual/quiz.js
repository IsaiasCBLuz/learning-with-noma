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