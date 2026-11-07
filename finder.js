(function(){
var T=window.TA,st=T.st,F=T.F,C=T.CATS,num=T.num,esc=T.esc;
var D={size:2,even:true,oppMin:0,boost:2},last=[];
function $(id){return document.getElementById(id)}
function pl(n,a){var p={name:n,want:true};F.forEach(function(k,i){p[k]=a[i]});return p}
st.opp=st.opp||[];st.f=st.f||{};
Object.keys(D).forEach(function(k){if(st.f[k]===undefined)st.f[k]=D[k]});
st.f.need=st.f.need||{};st.f.oppNeed=st.f.oppNeed||{};
if(!st.f.seeded){st.f.seeded=true;if(!st.opp.length)st.opp=[pl('Example opp scorer',[24,5,4,1,0.4,2.5,9,19,5.5,6.5]),pl('Example opp big',[12,10,2,0.8,1.6,0.2,5,8.5,2,3.2]),pl('Example opp guard',[15,3,8,1.6,0.3,1.8,5.5,12.5,2.4,2.8])]}
function sgn(x,d){return(x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(d)}
function render(){
$('offerList').innerHTML=st.roster.map(function(p,i){return '<label class="chk"><input type="checkbox" data-o="offer" data-i="'+i+'"'+(p.offer?' checked':'')+'> '+esc(p.name)+(p.on?'':' (bench)')+'</label>'}).join('')||'<p class="hint">Add players on the Trade analyzer tab first.</p>';
var h='<tr><th>Want</th><th class="name">Player</th>'+F.map(function(k){return '<th>'+T.L[k]+'</th>'}).join('')+'<th></th></tr>';
st.opp.forEach(function(p,i){var a='data-o="opp" data-i="'+i+'" ';
h+='<tr><td><input type="checkbox" '+a+'data-k="want"'+(p.want?' checked':'')+' aria-label="Want"></td><td class="name"><input type="text" '+a+'data-k="name" list="pl" autocomplete="off" value="'+esc(p.name)+'" aria-label="Player name"></td>'
+F.map(function(k){return '<td><input type="number" step="any" min="0" '+a+'data-k="'+k+'" value="'+esc(p[k])+'" aria-label="'+T.L[k]+'"></td>'}).join('')
+'<td><button class="x" data-rm="'+i+'">Remove</button></td></tr>'});
$('oppT').innerHTML=h;
[['needMe','need'],['needOpp','oppNeed']].forEach(function(w){$(w[0]).innerHTML=C.map(function(c){return '<label class="chk"><input type="checkbox" data-o="'+w[1]+'" data-c="'+c[0]+'"'+(st.f[w[1]][c[0]]?' checked':'')+'> '+c[1]+'</label>'}).join('')});
$('sSize').value=st.f.size;$('sEven').checked=!!st.f.even;$('sMin').value=st.f.oppMin;$('sBoost').value=st.f.boost}
function zfn(pool){var sf=0,sa=0,tf=0,ta=0;
pool.forEach(function(p){sf+=num(p.fgm);sa+=num(p.fga);tf+=num(p.ftm);ta+=num(p.fta)});
var lf=sa?sf/sa:0,lt=ta?tf/ta:0;
function raw(p){return[num(p.pts),num(p.reb),num(p.ast),num(p.stl),num(p.blk),num(p.tpm),num(p.fgm)-lf*num(p.fga),num(p.ftm)-lt*num(p.fta)]}
var R=pool.map(raw),mu=[],sd=[];
for(var c=0;c<8;c++){var m=0,v=0;R.forEach(function(r){m+=r[c]});m/=R.length;R.forEach(function(r){v+=(r[c]-m)*(r[c]-m)});mu.push(m);sd.push(Math.sqrt(v/R.length)||1)}
return function(p){return raw(p).map(function(x,c){return(x-mu[c])/sd[c]})}}
function subs(n,max){var res=[];function go(s,cur){if(cur.length)res.push(cur.slice());if(cur.length===max)return;for(var i=s;i<n;i++){cur.push(i);go(i+1,cur);cur.pop()}}go(0,[]);return res}
function addv(a,b,m){return a.map(function(x,i){return x+b[i]*m})}
function tot(list){var t={};F.forEach(function(k){t[k]=0});list.forEach(function(p){F.forEach(function(k){t[k]+=num(p[k])})});return[t.pts,t.reb,t.ast,t.stl,t.blk,t.tpm,t.fga?t.fgm/t.fga*100:0,t.fta?t.ftm/t.fta*100:0]}
function find(){
var out=$('results'),mine=[],theirs=[];
st.roster.forEach(function(p,i){if(p.offer)mine.push(i)});
st.opp.forEach(function(p,i){if(p.want)theirs.push(i)});
if(!mine.length||!theirs.length){out.innerHTML='<p class="hint">Tick at least one of your players to give up and one opponent player you want.</p>';return}
var pool=Object.keys(T.DB).map(function(k){return T.DB[k]}).filter(function(p){return p.min===undefined||p.min>=15});
var src='the league’s rotation players';
if(pool.length<60){pool=st.roster.concat(st.opp);src='the players on these two rosters (load league data for better values)'}
var z=zfn(pool),zero=[0,0,0,0,0,0,0,0];
var A=subs(mine.length,st.f.size).map(function(s){var all=zero,act=zero;
s.forEach(function(j){var p=st.roster[mine[j]],zz=z(p);all=addv(all,zz,1);if(p.on)act=addv(act,zz,1)});
return{idx:s.map(function(j){return mine[j]}),all:all,act:act}});
var B=subs(theirs.length,st.f.size).map(function(s){var zs=zero;
s.forEach(function(j){zs=addv(zs,z(st.opp[theirs[j]]),1)});
return{idx:s.map(function(j){return theirs[j]}),z:zs}});
var wm=C.map(function(c){return st.f.need[c[0]]?st.f.boost:1}),wo=C.map(function(c){return st.f.oppNeed[c[0]]?st.f.boost:1});
var nd=[];C.forEach(function(c,i){if(st.f.need[c[0]])nd.push(i)});
if(!nd.length)nd=[0,1,2,3,4,5,6,7];
var res=[];
A.forEach(function(a){B.forEach(function(b){
if(st.f.even&&a.idx.length!==b.idx.length)return;
var vm=0,vo=0,tg=0,c;
for(c=0;c<8;c++){vm+=wm[c]*(b.z[c]-a.act[c]);vo+=wo[c]*(a.all[c]-b.z[c])}
nd.forEach(function(i){tg+=b.z[i]-a.act[i]});
if(vm<0||vm<vo||vo<st.f.oppMin||tg<=0)return;
res.push({a:a,b:b,vm:vm,vo:vo,tg:tg})})});
res.sort(function(x,y){return y.tg-x.tg||y.vm-x.vm});
if(!res.length){last=[];out.innerHTML='<p class="hint">No trade met every rule. Try letting the opponent lose a little (a negative minimum), allowing more players per side, or marking fewer needed categories.</p>';return}
last=res.slice(0,10);
var act=st.roster.filter(function(p){return p.on}),before=tot(act);
out.innerHTML='<p class="hint">Showing the top '+last.length+' of '+res.length+' trades that meet your rules. Values are z-scores against '+src+'.</p>'+last.map(function(r,n){
var gone={};r.a.idx.forEach(function(i){gone[i]=1});
var aft=tot(act.filter(function(p){return !gone[st.roster.indexOf(p)]}).concat(r.b.idx.map(function(i){return st.opp[i]})));
var chips=C.map(function(c,i){var d=aft[i]-before[i],pc=i>5,cl=Math.abs(d)<0.005?'zero':(d>0?'pos':'neg');
return '<span class="'+cl+(st.f.need[c[0]]?' need':'')+'">'+c[1]+' '+sgn(d,pc?2:1)+(pc?'%':'')+'</span>'}).join('');
return '<div class="prop"><div class="ph"><b>You give:</b> '+r.a.idx.map(function(i){return esc(st.roster[i].name)}).join(', ')+'<br><b>You get:</b> '+r.b.idx.map(function(i){return esc(st.opp[i].name)}).join(', ')+'</div>'
+'<div class="chips">'+chips+'</div><div class="pm">Gain in needed categories '+sgn(r.tg,2)+', value to you '+sgn(r.vm,2)+', value to opponent '+sgn(r.vo,2)+'</div>'
+'<button data-open="'+n+'">Open in analyzer</button></div>'}).join('')}
var root=$('tab-find');
root.addEventListener('input',function(e){var t=e.target,o=t.getAttribute('data-o');if(!o)return;
var i=+t.getAttribute('data-i'),k=t.getAttribute('data-k');
if(o==='offer')st.roster[i].offer=t.checked;
else if(o==='opp')st.opp[i][k]=t.type==='checkbox'?t.checked:t.value;
else if(o==='need'||o==='oppNeed')st.f[o][t.getAttribute('data-c')]=t.checked;
else if(o==='set'){if(t.type==='checkbox')st.f[k]=t.checked;else{var v=Number(t.value);st.f[k]=k==='oppMin'?v:(k==='size'?Math.min(3,Math.max(1,Math.round(v)||1)):(v||D[k]))}}
T.save()});
root.addEventListener('change',function(e){var t=e.target;
if(t.getAttribute('data-o')!=='opp'||t.getAttribute('data-k')!=='name')return;
var p=T.DB[t.value.trim().toLowerCase()];if(!p)return;
var o=st.opp[+t.getAttribute('data-i')];o.name=p.name;F.forEach(function(k){o[k]=p[k]});T.save();render()});
root.addEventListener('click',function(e){var t=e.target;
var rm=t.getAttribute('data-rm'),op=t.getAttribute('data-open');
if(rm!==null){st.opp.splice(+rm,1);T.save();render()}
else if(op!==null){var r=last[+op];if(!r)return;
st.roster.forEach(function(p,i){p.out=r.a.idx.indexOf(i)>-1});
st.incoming=r.b.idx.map(function(i){var q=st.opp[i],p={name:q.name,on:true,out:false};F.forEach(function(k){p[k]=num(q[k])});return p});
T.save();T.showTab('analyze')}});
$('addOpp').onclick=function(){var p=pl('New player',[0,0,0,0,0,0,0,0,0,0]);st.opp.push(p);T.save();render()};
$('findBtn').onclick=find;
T.finderRender=render;
render();
})();
