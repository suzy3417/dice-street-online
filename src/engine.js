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
  if(![4,5].includes(names.length)||settings.harbor!==(names.length===5))throw Error('请选择四人或五人模式');
  const cs=cardsFor(settings),players=names.map((name,i)=>({id:`p${i}`,name:name.trim()||`玩家 ${i+1}`,coins:3,cards:{wheat:1,bakery:1},landmarks:[],repairs:{},color:i,investment:0}));
  const stock=Object.fromEntries(cs.map(c=>[c.id,c.color==='purple'?names.length:6]));
  stock.wheat-=names.length;stock.bakery-=names.length;
  const s={version:1,status:'playing',settings,players,turn:0,phase:'roll',dice:[],rollSum:0,doubles:false,rerolled:false,pending:null,stock,market:[],deck:[],marketMode:settings.harbor||settings.millionaire,log:['游戏开始！每人拥有麦田、面包房和 3 金币。'],winner:null,extra:false};
  if(s.marketMode){for(const [id,n] of Object.entries(stock))for(let i=0;i<n;i++)s.deck.push(id);for(let i=s.deck.length-1;i>0;i--){const j=rand(i+1);[s.deck[i],s.deck[j]]=[s.deck[j],s.deck[i]]}marketFill(s)}
  return s;
}
function available(s,p,id){let n=qty(p,id);if(!n)return 0;const paused=p.repairs?.[id]||0;if(paused){p.repairs[id]=Math.max(0,paused-1);log(s,`${p.name} 的${byId[id].name}暂停一次启动`);return 0}return n}
function blueValue(s,p,id,n){if(id==='fishing')return p.landmarks.includes('harbor')?3*n:0;if(id==='corn')return p.landmarks.length<2?n:0;return ({wheat:1,ranch:1,forest:1,mine:5,orchard:3,flowerfield:1,vineyard:3})[id]*n||0}
function greenValue(s,p,id,n){const mall=p.landmarks.includes('mall')?1:0;const symbols=x=>activeCards(p).filter(c=>c.symbol===x).reduce((v,c)=>v+qty(p,c.id),0);const v={bakery:1+mall,store:3+mall,cheese:3*qty(p,'ranch'),furniture:3*symbols('gear'),market:3*symbols('wheat'),florist:qty(p,'flowerfield')+mall,foodmarket:2*cup(p),generalstore:p.landmarks.length<2?2+mall:0,winery:6*qty(p,'vineyard'),drinks:s.players.reduce((z,x)=>z+cup(x),0)}[id];return (v||0)*n}
function finish(s,built=false){const me=s.players[s.turn];if(!built&&me.landmarks.includes('airport')){gain(me,10);log(s,`${me.name} 因机场获得 10 金币`)}if(s.doubles&&me.landmarks.includes('park')){log(s,`${me.name} 因游乐园获得额外回合`);s.phase='roll';s.dice=[];s.rollSum=0;s.doubles=false;s.rerolled=false;s.pending=null;s.extra=true}else next(s)}
function settle(s){const me=s.players[s.turn],sum=s.rollSum,cs=active(s),n=s.players.length;
  for(let offset=1;offset<n;offset++){const p=s.players[(s.turn-offset+n)%n];for(const c of cs.filter(x=>x.color==='red'&&x.roll.includes(sum))){const k=available(s,p,c.id);if(!k)continue;let amount=0;if(c.id==='club')amount=me.landmarks.length>=3?me.coins:0;else if(c.id==='sushi')amount=p.landmarks.includes('harbor')?3*k:0;else amount=k*((({cafe:1,restaurant:2,pizza:1,burger:1})[c.id]||0)+(p.landmarks.includes('mall')?1:0));const v=pay(me,p,amount);if(v)log(s,`${me.name} 向 ${p.name} 的${c.name}支付 ${v} 金币`)}}
  for(const p of s.players)for(const c of cs.filter(x=>x.color==='blue'&&x.roll.includes(sum))){const k=available(s,p,c.id);if(!k)continue;let v;if(c.id==='cruise'){if(!p.landmarks.includes('harbor'))continue;v=(1+rand(6)+1+rand(6))*k}else v=blueValue(s,p,c.id,k);if(v){gain(p,v);log(s,`${p.name} 的${c.name}获得 ${v} 金币`)}}
  const queue=[];
  for(const c of cs.filter(x=>x.color==='green'&&x.roll.includes(sum))){const k=available(s,me,c.id);if(!k)continue;if(c.id==='demolition'||c.id==='movers'){queue.push(c.id);continue}if(c.id==='bike'){const v=Math.min(me.coins,2*k);me.coins-=v;log(s,`${me.name} 的自行车公司向银行支付 ${v} 金币`);continue}const v=greenValue(s,me,c.id,k);if(v){gain(me,v);log(s,`${me.name} 的${c.name}获得 ${v} 金币`)}if(c.id==='winery')me.repairs.winery=1}
  for(const c of cs.filter(x=>x.color==='purple'&&x.roll.includes(sum)))if(available(s,me,c.id))queue.push(c.id);
  if(queue.length){s.phase='effect';s.pending={queue,index:0}}else s.phase=qty(me,'tech')?'invest':'build';
}
function nextEffect(s){s.pending.index++;if(s.pending.index>=s.pending.queue.length){s.pending=null;s.phase=qty(s.players[s.turn],'tech')?'invest':'build'}}
export function legal(s,playerIndex,a){if(s.winner!==null)return '对局已结束';if(playerIndex!==s.turn)return '还没轮到你';const me=s.players[s.turn];
  if(a.type==='roll')return s.phase!=='roll'?'当前不能掷骰':![1,2].includes(a.count)?'骰子数量无效':a.count===2&&!me.landmarks.includes('station')?'需要先建成火车站':null;
  if(a.type==='reroll')return s.phase==='reroll'&&!s.rerolled?null:'当前不能重掷';
  if(a.type==='keep')return s.phase==='reroll'?null:'当前不能确认点数';
  if(a.type==='harbor')return s.phase==='harbor'?null:'当前不能调整点数';
  if(a.type==='effect')return s.phase==='effect'?null:'当前没有待结算效果';
  if(a.type==='invest')return s.phase==='invest'?null:'当前不能投资';
  if(a.type==='buy'){const c=byId[a.id];return s.phase!=='build'?'现在不能建造':!c||!active(s).some(x=>x.id===a.id)?'建筑不在本模式':s.marketMode&&!s.market.includes(a.id)?'建筑暂未出现在市场':!s.stock[a.id]?'建筑已售罄':c.color==='purple'&&qty(me,c.id)?'每种重要建筑只能拥有一张':me.coins<c.cost?'金币不足':null}
  if(a.type==='landmark'){const l=landmarksFor(s.settings).find(x=>x.id===a.id);return s.phase!=='build'?'现在不能建造':!l?'地标不在本模式':me.landmarks.includes(l.id)?'地标已建成':me.coins<l.cost?'金币不足':null}
  if(a.type==='pass')return s.phase==='build'?null:'现在不能结束回合';return '未知操作'}
export function applyAction(state,playerIndex,a){const error=legal(state,playerIndex,a);if(error)throw Error(error);const s=structuredClone(state),me=s.players[s.turn];s.version++;
  if(a.type==='roll'||a.type==='reroll'){const k=a.type==='reroll'?s.dice.length:a.count;s.dice=Array.from({length:k},()=>1+rand(6));s.rollSum=s.dice.reduce((x,y)=>x+y,0);s.doubles=k===2&&s.dice[0]===s.dice[1];if(a.type==='reroll')s.rerolled=true;log(s,`${me.name} 掷出 ${s.dice.join(' + ')} = ${s.rollSum}`);if(me.landmarks.includes('tower')&&!s.rerolled)s.phase='reroll';else if(me.landmarks.includes('harbor')&&s.rollSum>=10)s.phase='harbor';else settle(s)}
  else if(a.type==='keep'){if(me.landmarks.includes('harbor')&&s.rollSum>=10)s.phase='harbor';else settle(s)}
  else if(a.type==='harbor'){if(a.add){s.rollSum+=2;log(s,`${me.name} 使用港口，点数加 2`)}settle(s)}
  else if(a.type==='invest'){if(a.yes&&me.coins>0){me.coins--;me.investment++;log(s,`${me.name} 向科技公司投资 1 金币`)}s.phase='build'}
  else if(a.type==='effect'){const id=s.pending.queue[s.pending.index],target=s.players[a.target],other=a.target!==s.turn&&Number.isInteger(a.target);const requireTarget=()=>{if(!other||!target)throw Error('请选择其他玩家')};
    if(id==='stadium'||id==='publisher'){for(let i=0;i<s.players.length;i++)if(i!==s.turn){const p=s.players[i],v=pay(p,me,id==='stadium'?2:cup(p)+activeCards(p).filter(c=>c.symbol==='bread').reduce((z,c)=>z+qty(p,c.id),0));if(v)log(s,`${me.name} 从 ${p.name} 收取 ${v} 金币`)}}
    else if(id==='tv'||id==='music'){requireTarget();const v=pay(target,me,5);log(s,`${me.name} 从 ${target.name} 收取 ${v} 金币`)}
    else if(id==='tax'){requireTarget();if(target.coins>=10){const v=pay(target,me,Math.floor(target.coins/2));log(s,`${me.name} 向 ${target.name} 收税 ${v} 金币`)}}
    else if(id==='business'){requireTarget();const give=byId[a.give],take=byId[a.take];if(!give||!take||give.color==='purple'||take.color==='purple'||!qty(me,give.id)||!qty(target,take.id))throw Error('请选择双方实际拥有的非重要建筑');me.cards[give.id]--;target.cards[give.id]=(target.cards[give.id]||0)+1;target.cards[take.id]--;me.cards[take.id]=(me.cards[take.id]||0)+1;log(s,`${me.name} 与 ${target.name} 交换了建筑`)}
    else if(id==='publicpark'){const share=Math.ceil(s.players.reduce((v,p)=>v+p.coins,0)/s.players.length);for(const p of s.players)p.coins=share;log(s,'公园将全体金币平均分配')}
    else if(id==='tech'){for(const p of s.players)if(p!==me)pay(p,me,me.investment);log(s,`${me.name} 的科技公司收取投资收益`)}
    else if(id==='repair'){const c=byId[a.card];if(!c||c.color==='purple')throw Error('请选择非重要建筑');let n=0;for(const p of s.players){const k=qty(p,c.id);if(k){p.repairs[c.id]=(p.repairs[c.id]||0)+1;n+=k}}gain(me,n);log(s,`${me.name} 暂停所有${c.name}并获得 ${n} 金币`)}
    else if(id==='expo'){const c=byId[a.card];if(!c||c.color==='purple'||!qty(me,c.id))throw Error('请选择自己拥有的非重要建筑');const k=qty(me,c.id);if(c.color==='blue')gain(me,blueValue(s,me,c.id,k));else if(c.color==='green')gain(me,greenValue(s,me,c.id,k));else if(c.color==='red')for(const p of s.players)if(p!==me)pay(p,me,k);me.cards.expo=0;s.stock.expo++;s.deck.push('expo');marketFill(s);log(s,`${me.name} 使用车展启动${c.name}，车展返回牌堆`)}
    else if(id==='demolition'){if(a.landmark){const i=me.landmarks.indexOf(a.landmark);if(i<0)throw Error('请选择已建地标');me.landmarks.splice(i,1);gain(me,8);log(s,`${me.name} 拆除地标并获得 8 金币`)}}
    else if(id==='movers'){if(a.landmark){requireTarget();const i=me.landmarks.indexOf(a.landmark);if(i<0)throw Error('请选择已建地标');me.landmarks.splice(i,1);target.landmarks.push(a.landmark);gain(me,4);log(s,`${me.name} 送出地标并获得 4 金币`);if(target.landmarks.length>=won(s)){s.winner=a.target;s.phase='done'}}}
    if(s.phase!=='done')nextEffect(s)
  }
  else if(a.type==='buy'){const c=byId[a.id];me.coins-=c.cost;me.cards[c.id]=(me.cards[c.id]||0)+1;s.stock[c.id]--;if(s.marketMode&&s.stock[c.id]===0){s.market=s.market.filter(id=>id!==c.id);marketFill(s)}if(c.id==='bike')gain(me,5);log(s,`${me.name} 建造了${c.name}`);finish(s,true)}
  else if(a.type==='landmark'){const l=landmarksFor(s.settings).find(x=>x.id===a.id);me.coins-=l.cost;me.landmarks.push(l.id);log(s,`${me.name} 建成地标：${l.name}`);if(me.landmarks.length>=won(s)){s.winner=s.turn;s.phase='done';log(s,`🏆 ${me.name} 获胜！`)}else finish(s,true)}
  else if(a.type==='pass'){log(s,`${me.name} 本回合没有建造`);finish(s,false)}
  return s;
}
