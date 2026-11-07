(function(){
var F=['pts','reb','ast','stl','blk','tpm','fgm','fga','ftm','fta'];
var L={pts:'PTS',reb:'REB',ast:'AST',stl:'STL',blk:'BLK',tpm:'3PM',fgm:'FGM',fga:'FGA',ftm:'FTM',fta:'FTA'};
var CATS=[['pts','Points'],['reb','Rebounds'],['ast','Assists'],['stl','Steals'],['blk','Blocks'],['tpm','3-pointers'],['fg','FG%'],['ft','FT%']];
var KEY='tradeAnalyzer8cat';
function mk(n,a,on){var p={name:n,on:on!==false,out:false};F.forEach(function(k,i){p[k]=a[i]});return p}
function blank(){var o={};F.forEach(function(k){o[k]=''});return o}
var st={roster:[mk('Example guard',[22,4,7,1.4,0.3,2.8,8,17,4.5,5.2]),mk('Example wing',[16,6,3,1.1,0.6,2,6,13,2.5,3]),mk('Example big',[13,11,2,0.7,1.8,0.1,5.5,9,2.2,3.4]),mk('Example bench',[8,3,2,0.6,0.2,1,3,7,1,1.2],false)],
incoming:[mk('Example incoming',[20,8,4,1,1.1,1.5,7.5,15,4,4.6])],games:1,left:3,m:{me:blank(),opp:blank(),rest:blank()}};
try{var s=localStorage.getItem(KEY);if(s){var o=JSON.parse(s);if(o&&o.roster&&o.incoming){st.roster=o.roster;st.incoming=o.incoming;st.games=o.games||1;if(o.left!==undefined)st.left=o.left;if(o.m&&o.m.me&&o.m.opp&&o.m.rest)st.m=o.m;if(o.opp)st.opp=o.opp;if(o.f)st.f=o.f}}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
function num(x){return Number(x)||0}
function head(first){return '<tr>'+first+'<th class="name">Player</th>'+F.map(function(k){return '<th>'+L[k]+'</th>'}).join('')+'<th></th></tr>'}
function row(list,i,p,r){
var h='<tr>';
if(r)h+='<td><input type="checkbox" data-l="roster" data-i="'+i+'" data-k="on" '+(p.on?'checked':'')+' aria-label="Counts"></td><td><input type="checkbox" data-l="roster" data-i="'+i+'" data-k="out" '+(p.out?'checked':'')+' aria-label="Send away"></td>';
h+='<td class="name"><input type="text" data-l="'+list+'" data-i="'+i+'" data-k="name" list="pl" autocomplete="off" value="'+esc(p.name)+'" aria-label="Player name"></td>';
F.forEach(function(k){h+='<td><input type="number" step="any" min="0" data-l="'+list+'" data-i="'+i+'" data-k="'+k+'" value="'+p[k]+'" aria-label="'+L[k]+'"></td>'});
return h+'<td><button class="x" data-del="'+list+'" data-i="'+i+'" aria-label="Remove player">Remove</button></td></tr>'}
function inp(w,k,ph){return '<input type="number" step="any" min="0" data-m="'+w+'" data-k="'+k+'" value="'+esc(st.m[w][k])+'" placeholder="'+ph+'" aria-label="'+w+' '+k+'">'}
function matchInputs(){
var h='<tr><th class="name">Category</th><th>You now</th><th>Opponent now</th><th>Opponent rest of week (optional)</th></tr>';
CATS.forEach(function(c){
h+='<tr><td class="cat">'+c[1]+(c[0]==='fg'||c[0]==='ft'?' (made / attempted)':'')+'</td>';
['me','opp','rest'].forEach(function(w){
h+='<td>';
if(c[0]==='fg')h+=inp(w,'fgm','made')+' / '+inp(w,'fga','att');
else if(c[0]==='ft')h+=inp(w,'ftm','made')+' / '+inp(w,'fta','att');
else h+=inp(w,c[0],'');
h+='</td>'});
h+='</tr>'});
document.getElementById('matchIn').innerHTML=h}
function render(){
document.getElementById('rosterT').innerHTML=head('<th>Counts</th><th>Send</th>')+st.roster.map(function(p,i){return row('roster',i,p,true)}).join('');
document.getElementById('incomingT').innerHTML=head('')+st.incoming.map(function(p,i){return row('incoming',i,p,false)}).join('');
document.getElementById('games').value=st.games;
document.getElementById('left').value=st.left;
matchInputs();calc()}
function sum(a){var t={};F.forEach(function(k){t[k]=0});a.forEach(function(p){F.forEach(function(k){t[k]+=num(p[k])})});return t}
function vals(t,g){return[t.pts*g,t.reb*g,t.ast*g,t.stl*g,t.blk*g,t.tpm*g,t.fga?t.fgm/t.fga*100:0,t.fta?t.ftm/t.fta*100:0]}
function fmt(i,v){return i>5?v.toFixed(2)+'%':v.toFixed(1)}
function calc(){
var g=Math.max(1,num(st.games)||1);
var act=st.roster.filter(function(p){return p.on});
var keep=act.filter(function(p){return !p.out});
var after=keep.concat(st.incoming);
var B=vals(sum(act),g),A=vals(sum(after),g);
var h='<tr><th class="name">Category</th><th>Before</th><th>After</th><th>Change</th></tr>',up=[],dn=[];
B.forEach(function(b,i){var a=A[i],d=a-b,e=Math.abs(d)<0.005,cl=e?'':(d>0?'pos':'neg'),pc=i>5;
var ch=e?'0':((d>0?'+':'−')+Math.abs(d).toFixed(pc?2:1)+(pc?' pts':''));
if(!e)(d>0?up:dn).push(CATS[i][1]);
h+='<tr><td class="cat">'+CATS[i][1]+'</td><td>'+fmt(i,b)+'</td><td>'+fmt(i,a)+'</td><td class="'+cl+'">'+ch+'</td></tr>'});
document.getElementById('res').innerHTML=h;
var v=document.getElementById('verdict');
if(!st.roster.some(function(p){return p.out})&&!st.incoming.length)v.textContent='Mark players to send away and add players you would receive.';
else v.textContent='You would improve in '+up.length+' of 8 categories'+(up.length?' ('+up.join(', ')+')':'')+' and decline in '+dn.length+(dn.length?' ('+dn.join(', ')+')':'')+'.';
match(act,after);
save()}
function fin(base,team,gl,rest){var t={};F.forEach(function(k){t[k]=num(base[k])+(team?team[k]*gl:0)+(rest?num(rest[k]):0)});return t}
function rank(a,b){return Math.abs(a-b)<1e-9?1:(a>b?2:0)}
var WL=['Loss','Tie','Win'],CL=['neg','tie','pos'];
function match(act,after){
var mv=document.getElementById('mverdict'),tb=document.getElementById('mres');
var any=['me','opp','rest'].some(function(w){return F.some(function(k){return st.m[w][k]!==''})});
if(!any){tb.innerHTML='';mv.textContent='Enter current scores above to see how the trade changes the matchup.';return}
var gl=Math.max(0,num(st.left));
var B=vals(fin(st.m.me,sum(act),gl),1),A=vals(fin(st.m.me,sum(after),gl),1),O=vals(fin(st.m.opp,null,0,st.m.rest),1);
var h='<tr><th class="name">Category</th><th>You, no trade</th><th>You, after trade</th><th>Opponent</th><th>No trade</th><th>After trade</th></tr>';
var cb=[0,0,0],ca=[0,0,0],gain=[],loss=[];
B.forEach(function(b,i){var rb=rank(b,O[i]),ra=rank(A[i],O[i]);cb[rb]++;ca[ra]++;
if(ra>rb)gain.push(CATS[i][1]);else if(ra<rb)loss.push(CATS[i][1]);
h+='<tr><td class="cat">'+CATS[i][1]+'</td><td>'+fmt(i,b)+'</td><td>'+fmt(i,A[i])+'</td><td>'+fmt(i,O[i])+'</td><td class="'+CL[rb]+'">'+WL[rb]+'</td><td class="'+CL[ra]+' wl">'+WL[ra]+'</td></tr>'});
tb.innerHTML=h;
var rec=function(c){return c[2]+'-'+c[0]+(c[1]?'-'+c[1]:'')};
mv.textContent='Projected result with no trade: '+rec(cb)+'. After the trade: '+rec(ca)+'.'+(gain.length?' Categories you would flip toward a win: '+gain.join(', ')+'.':'')+(loss.length?' Categories you would slip in: '+loss.join(', ')+'.':'')}
document.addEventListener('input',function(e){var t=e.target;
if(t.id==='games'){st.games=t.value;calc();return}
if(t.id==='left'){st.left=t.value;calc();return}
var w=t.getAttribute('data-m');
if(w){st.m[w][t.getAttribute('data-k')]=t.value;calc();return}
var l=t.getAttribute('data-l');if(!l)return;
var i=+t.getAttribute('data-i'),k=t.getAttribute('data-k');
st[l][i][k]=t.type==='checkbox'?t.checked:t.value;calc()});
document.addEventListener('click',function(e){var t=e.target;
var d=t.getAttribute&&t.getAttribute('data-del');
if(d){st[d].splice(+t.getAttribute('data-i'),1);render()}});
document.getElementById('addR').onclick=function(){st.roster.push(mk('New player',[0,0,0,0,0,0,0,0,0,0]));render()};
document.getElementById('addI').onclick=function(){st.incoming.push(mk('New player',[0,0,0,0,0,0,0,0,0,0]));render()};
var DB={};
fetch('data/players.json').then(function(r){return r.json()}).then(function(d){
var dl=document.getElementById('pl'),s=document.getElementById('dataStatus'),h='',n=d.players||[];
n.forEach(function(p){DB[p.name.toLowerCase()]=p;h+='<option value="'+esc(p.name)+'">'+esc(p.team)+', '+p.gp+' GP</option>'});
dl.innerHTML=h;
s.textContent=n.length?'Player data: '+d.season+' regular season per-game averages from games played so far, updated '+d.updated+'. Start typing a name to fill in stats.':'No player data yet. Run the update script, or enter stats by hand.';
}).catch(function(){document.getElementById('dataStatus').textContent='Player data not found. Enter stats by hand.'});
document.addEventListener('change',function(e){var t=e.target;if(!t.getAttribute||t.getAttribute('data-k')!=='name'||!t.getAttribute('data-l'))return;
var p=DB[t.value.trim().toLowerCase()];if(!p)return;
var o=st[t.getAttribute('data-l')][+t.getAttribute('data-i')];
o.name=p.name;F.forEach(function(k){o[k]=p[k]});render()});
var tabs=document.querySelectorAll('[data-tab]');
function showTab(n){tabs.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-tab')===n)});
['analyze','find'].forEach(function(x){document.getElementById('tab-'+x).hidden=x!==n});
if(n==='find'){if(window.TA.finderRender)window.TA.finderRender()}else render();
try{history.replaceState(null,'','#'+n)}catch(e){}}
tabs.forEach(function(b){b.onclick=function(){showTab(b.getAttribute('data-tab'))}});
window.TA={st:st,F:F,L:L,CATS:CATS,DB:DB,num:num,esc:esc,save:save,render:render,showTab:showTab};
render();
if(location.hash==='#find')showTab('find');
})();
