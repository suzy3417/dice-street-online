import {cardsFor,byId,landmarksFor} from './cards.js';
const rand=n=>Math.floor(Math.random()*n);
const qty=(p,id)=>p.cards[id]||0;
const gain=(p,n)=>{p.coins+=n};
const pay=(a,b,n)=>{const v=Math.min(a.coins,n);a.coins-=v;b.coins+=v;return v};
const log=(s,t)=>{s.log.unshift(t);s.log=s.log.slice(0,60)};
const active=s=>cardsFor(s.settings);
const won=s=>s.settings.harbor?6:4;
const cup=(p)=>activeCards(p).filter(c=>c.symbol==='cup').reduce((n,c)=>n+qty(p,c.id),0);
const activeCards=p=>Object.keys(p.cards).map(id=>byId[id]).filter(Boolean);
const next=s=>{s.turn=(s.turn+1)%s.players.length;s.phase='roll';s.dice=[];s.rollSum=0;s.doubles=false;s.rerolled=false;s.pending=null;s.extra=false};
const marketFill=s=>{if(!s.marketMode)return;while(s.deck.length&&s.market.length<10){const id=s.deck.shift();if(!s.market.includes(id))s.market.push(id)}};
export function createGame(names,options={}){
  const settings={playerCount:names.length,harbor:options.harbor??names.length===5,millionaire:Boolean(options.millionaire)};
  if(![4,5].includes(names.length)||settings.harbor!==(names.length===5))throw Error('璇烽€夋嫨鍥涗汉鎴栦簲浜烘ā寮�');
  const cs=cardsFor(settings),players=names.map((name,i)=>({id:`p${i}`,name:name.trim()||`鐜╁ ${i+1}`,coins:3,cards:{wheat:1,bakery:1},landmarks:[],repairs:{},color:i,investment:0}));
  const stock=Object.fromEntries(cs.map(c=>[c.id,c.color==='purple'?names.length:6]));
  stock.wheat-=names.length;stock.bakery-=names.length;
  const s={version:1,status:'playing',settings,players,turn:0,phase:'roll',dice:[],rollSum:0,doubles:false,rerolled:false,pending:null,stock,market:[],deck:[],marketMode:settings.harbor||settings.millionaire,log:['娓告垙寮€濮嬶紒姣忎汉鎷ユ湁楹︾敯銆侀潰鍖呮埧鍜� 3 閲戝竵銆�'],winner:null,extra:false};
  if(s.marketMode){for(const [id,n] of Object.entries(stock))for(let i=0;i<n;i++)s.deck.push(id);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]]}marketFill(s)}
  return s;
}
function available(s,p,id){let n=qty(p,id);if(!n)return 0;const paused=p.repairs?.[id]||0;if(paused){p.repairs[id]=Math.max(0,paused-1);log(s,`${p.name} 鐨�${byId[id].name}鏆傚仠涓€娆″惎鍔╜);return 0}return n}
function blueValue(s,p,id,n){if(id==='fishing')return p.landmarks.includes('harbor')?3*n:0;if(id==='corn')return p.landmarks.length<2?n:0;return ({wheat:1,ranch:1,forest:1,mine:5,orchard:3,flowerfield:1,vineyard:3})[id]*n||0}
function greenValue(s,p,id,n){const mall=p.landmarks.includes('mall')?1:0;const symbols=x=>activeCards(p).filter(c=>c.symbol===x).reduce((v,c)=>v+qty(p,c.id),0);const v={bakery:1+mall,store:3+mall,cheese:3*qty(p,'ranch'),furniture:3*symbols('gear'),market:3*symbols('wheat'),florist:qty(p,'flowerfield')+mall,foodmarket:2*cup(p),generalstore:p.landmarks.length<2?2+mall:0,winery:6*qty(p,'vineyard'),drinks:s.players.reduce((z,x)=>z+cup(x),0)}[id];return (v||0)*n}
function finish(s,built=false){const me=s.players[s.turn];if(!built&&me.landmarks.includes('airport')){gain(me,10);log(s,`${me.name} 鍥犳満鍦鸿幏寰� 10 閲戝竵`)}if(s.doubles&&me.landmarks.includes('park')){log(s,`${me.name} 鍥犳父涔愬洯鑾峰緱棰濆鍥炲悎`);s.phase='roll';s.dice=[];s.rollSum=0;s.doubles=false;s.rerolled=false;s.pending=null;s.extra=true}else next(s)}
function enterBuild(s){const me=s.players[s.turn];if(s.settings.harbor&&me.coins===0){gain(me,1);log(s,`${me.name} 鍥犲競鏀垮巺鑾峰緱 1 閲戝竵`)}s.phase=qty(me,'tech')?'invest':'build'}
function settle(s){const me=s.players[s.turn],sum=s.rollSum,cs=active(s),n=s.players.length;
  for(let offset=1;offset<n;offset++){const p=s.players[(s.turn-offset+n)%n];for(const c of cs.filter(x=>x.color==='red'&&x.roll.includes(sum))){const k=available(s,p,c.id);if(!k)continue;let amount=0;if(c.id==='club')amount=me.landmarks.length>=3?me.coins:0;else if(c.id==='sushi')amount=p.landmarks.includes('harbor')?3*k:0;else amount=k*((({cafe:1,restaurant:2,pizza:1,burger:1})[c.id]||0)+(p.landmarks.includes('mall')?1:0));const v=pay(me,p,amount);if(v)log(s,`${me.name} 鍚� ${p.name} 鐨�${c.name}鏀粯 ${v} 閲戝竵`)}}
  for(const p of s.players)for(const c of cs.filter(x=>x.color==='blue'&&x.roll.includes(sum))){const k=available(s,p,c.id);if(!k)continue;let v;if(c.id==='cruise'){if(!p.landmarks.includes('harbor'))continue;v=(1+rand(6)+1+rand(6))*k}else v=blueValue(s,p,c.id,k);if(v){gain(p,v);log(s,`${p.name} 鐨�${c.name}鑾峰緱 ${v} 閲戝竵`)}}
  const queue=[];
  for(const c of cs.filter(x=>x.color==='green'&&x.roll.includes(sum))){const k=available(s,me,c.id);if(!k)continue;if(c.id==='demolition'||c.id==='movers'){queue.push(c.id);continue}if(c.id==='bike'){const v=Math.min(me.coins,2*k);me.coins-=v;log(s,`${me.name} 鐨勮嚜琛岃溅鍏徃鍚戦摱琛屾敮浠� ${v} 閲戝竵`);continue}const v=greenValue(s,me,c.id,k);if(v){gain(me,v);log(s,`${me.name} 鐨�${c.name}鑾峰緱 ${v} 閲戝竵`)}if(c.id==='winery')me.repairs.winery=1}
  for(const c of cs.filter(x=>x.color==='purple'&&x.roll.includes(sum)))if(available(s,me,c.id))queue.push(c.id);
  if(queue.length){s.phase='effect';s.pending={queue,index:0}}else enterBuild(s);
}
function nextEffect(s){s.pending.index++;if(s.pending.index>=s.pending.queue.length){s.pending=null;enterBuild(s)}}
export function legal(s,playerIndex,a){if(s.winner!==null)return '瀵瑰眬宸茬粨鏉�';if(playerIndex!==s.turn)return '杩樻病杞埌浣�';const me=s.players[s.turn];
  if(a.type==='roll')return s.phase!=='roll'?'褰撳墠涓嶈兘鎺烽':![1,2].includes(a.count)?'楠板瓙鏁伴噺鏃犳晥':a.count===2&&!me.landmarks.includes('station')?'闇€瑕佸厛寤烘垚鐏溅绔�':null;
  if(a.type==='reroll')return s.phase==='reroll'&&!s.rerolled?null:'褰撳墠涓嶈兘閲嶆幏';
  if(a.type==='keep')return s.phase==='reroll'?null:'褰撳墠涓嶈兘纭鐐规暟';
  if(a.type==='harbor')return s.phase==='harbor'?null:'褰撳墠涓嶈兘璋冩暣鐐规暟';
  if(a.type==='effect')return s.phase==='effect'?null:'褰撳墠娌℃湁寰呯粨绠楁晥鏋�';
  if(a.type==='invest')return s.phase==='invest'?null:'褰撳墠涓嶈兘鎶曡祫';
  if(a.type==='buy'){const c=byId[a.id];return s.phase!=='build'?'鐜板湪涓嶈兘寤洪€�':!c||!active(s).some(x=>x.id===a.id)?'寤虹瓚涓嶅湪鏈ā寮�':s.marketMode&&!s.market.includes(a.id)?'寤虹瓚鏆傛湭鍑虹幇鍦ㄥ競鍦�':!s.stock[a.id]?'寤虹瓚宸插敭缃�':c.color==='purple'&&qty(me,c.id)?'姣忕閲嶈寤虹瓚鍙兘鎷ユ湁涓€寮�':me.coins<c.cost?'閲戝竵涓嶈冻':null}
  if(a.type==='landmark'){const l=landmarksFor(s.settings).find(x=>x.id===a.id);return s.phase!=='build'?'鐜板湪涓嶈兘寤洪€�':!l?'鍦版爣涓嶅湪鏈ā寮�':me.landmarks.includes(l.id)?'鍦版爣宸插缓鎴�':me.coins<l.cost?'閲戝竵涓嶈冻':null}
  if(a.type==='pass')return s.phase==='build'?null:'鐜板湪涓嶈兘缁撴潫鍥炲悎';return '鏈煡鎿嶄綔'}
export function applyAction(state,playerIndex,a){const error=legal(state,playerIndex,a);if(error)throw Error(error);const s=structuredClone(state),me=s.players[s.turn];s.version++;
  if(a.type==='roll'||a.type==='reroll'){const k=a.type==='reroll'?s.dice.length:a.count;s.dice=Array.from({length:k},()=>1+rand(6));s.rollSum=s.dice.reduce((x,y)=>x+y,0);s.doubles=k===2&&s.dice[0]===s.dice[1];if(a.type==='reroll')s.rerolled=true;log(s,`${me.name} 鎺峰嚭 ${s.dice.join(' + ')} = ${s.rollSum}`);if(me.landmarks.includes('tower')&&!s.rerolled)s.phase='reroll';else if(me.landmarks.includes('harbor')&&s.rollSum>=10)s.phase='harbor';else settle(s)}
  else if(a.type==='keep'){if(me.landmarks.includes('harbor')&&s.rollSum>=10)s.phase='harbor';else settle(s)}
  else if(a.type==='harbor'){if(a.add){s.rollSum+=2;log(s,`${me.name} 浣跨敤娓彛锛岀偣鏁板姞 2`)}settle(s)}
  else if(a.type==='invest'){if(a.yes&&me.coins>0){me.coins--;me.investment++;log(s,`${me.name} 鍚戠鎶€鍏徃鎶曡祫 1 閲戝竵`)}s.phase='build'}
  else if(a.type==='effect'){const id=s.pending.queue[s.pending.index],target=s.players[a.target],other=a.target!==s.turn&&Number.isInteger(a.target);const requireTarget=()=>{if(!other||!target)throw Error('璇烽€夋嫨鍏朵粬鐜╁')};
    if(id==='stadium'||id==='publisher'){for(let i=0;i<s.players.length;i++)if(i!==s.turn){const p=s.players[i],v=pay(p,me,id==='stadium'?2:cup(p)+activeCards(p).filter(c=>c.symbol==='bread').reduce((z,c)=>z+qty(p,c.id),0));if(v)log(s,`${me.name} 浠� ${p.name} 鏀跺彇 ${v} 閲戝竵`)}}
    else if(id==='tv'||id==='music'){requireTarget();const v=pay(target,me,5);log(s,`${me.name} 浠� ${target.name} 鏀跺彇 ${v} 閲戝竵`)}
    else if(id==='tax'){requireTarget();if(target.coins>=10){const v=pay(target,me,Math.floor(target.coins/2));log(s,`${me.name} 鍚� ${target.name} 鏀剁◣ ${v} 閲戝竵`)}}
    else if(id==='business'){requireTarget();const give=byId[a.give],take=byId[a.take];if(!give||!take||give.color==='purple'||take.color==='purple'||!qty(me,give.id)||!qty(target,take.id))throw Error('璇烽€夋嫨鍙屾柟瀹為檯鎷ユ湁鐨勯潪閲嶈寤虹瓚');me.cards[give.id]--;target.cards[give.id]=(target.cards[give.id]||0)+1;target.cards[take.id]--;me.cards[take.id]=(me.cards[take.id]||0)+1;log(s,`${me.name} 涓� ${target.name} 浜ゆ崲浜嗗缓绛慲)}
    else if(id==='publicpark'){const share=Math.ceil(s.players.reduce((v,p)=>v+p.coins,0)/s.players.length);for(const p of s.players)p.coins=share;log(s,'鍏洯灏嗗叏浣撻噾甯佸钩鍧囧垎閰�')}
    else if(id==='tech'){for(const p of s.players)if(p!==me)pay(p,me,me.investment);log(s,`${me.name} 鐨勭鎶€鍏徃鏀跺彇鎶曡祫鏀剁泭`)}
    else if(id==='repair'){const c=byId[a.card];if(!c||c.color==='purple')throw Error('璇烽€夋嫨闈為噸瑕佸缓绛�');let n=0;for(const p of s.players){const k=qty(p,c.id);if(k){p.repairs[c.id]=(p.repairs[c.id]||0)+1;n+=k}}gain(me,n);log(s,`${me.name} 鏆傚仠鎵€鏈�${c.name}骞惰幏寰� ${n} 閲戝竵`)}
    else if(id==='expo'){const c=byId[a.card];if(!c||c.color==='purple'||!qty(me,c.id))throw Error('璇烽€夋嫨鑷繁鎷ユ湁鐨勯潪閲嶈寤虹瓚');const k=qty(me,c.id);if(c.color==='blue')gain(me,blueValue(s,me,c.id,k));else if(c.color==='green')gain(me,greenValue(s,me,c.id,k));else if(c.color==='red')for(const p of s.players)if(p!==me)pay(p,me,k);me.cards.expo=0;s.stock.expo++;s.deck.push('expo');marketFill(s);log(s,`${me.name} 浣跨敤杞﹀睍鍚姩${c.name}锛岃溅灞曡繑鍥炵墝鍫哷)}
    else if(id==='demolition'){if(a.landmark){const i=me.landmarks.indexOf(a.landmark);if(i<0)throw Error('璇烽€夋嫨宸插缓鍦版爣');me.landmarks.splice(i,1);gain(me,8);log(s,`${me.name} 鎷嗛櫎鍦版爣骞惰幏寰� 8 閲戝竵`)}}
    else if(id==='movers'){if(a.landmark){requireTarget();const i=me.landmarks.indexOf(a.landmark);if(i<0)throw Error('璇烽€夋嫨宸插缓鍦版爣');me.landmarks.splice(i,1);target.landmarks.push(a.landmark);gain(me,4);log(s,`${me.name} 閫佸嚭鍦版爣骞惰幏寰� 4 閲戝竵`);if(target.landmarks.length>=won(s)){s.winner=a.target;s.phase='done'}}}
    if(s.phase!=='done')nextEffect(s)
  }
  else if(a.type==='buy'){const c=byId[a.id];me.coins-=c.cost;me.cards[c.id]=(me.cards[c.id]||0)+1;s.stock[c.id]--;if(s.marketMode&&s.stock[c.id]===0){s.market=s.market.filter(id=>id!==c.id);marketFill(s)}if(c.id==='bike')gain(me,5);log(s,`${me.name} 寤洪€犱簡${c.name}`);finish(s,true)}
  else if(a.type==='landmark'){const l=landmarksFor(s.settings).find(x=>x.id===a.id);me.coins-=l.cost;me.landmarks.push(l.id);log(s,`${me.name} 寤烘垚鍦版爣锛�${l.name}`);if(me.landmarks.length>=won(s)){s.winner=s.turn;s.phase='done';log(s,`🏆 ${me.name} 鑾疯儨锛乣)}else finish(s,true)}
  else if(a.type==='pass'){log(s,`${me.name} 鏈洖鍚堟病鏈夊缓閫燻);finish(s,false)}
  return s;
}
