export const baseCards = [
  {id:'wheat',name:'麦田',roll:[1],cost:1,color:'blue',symbol:'wheat',emoji:'🌾',text:'任意玩家掷出 1：从银行获得 1 金币。'},
  {id:'ranch',name:'农场',roll:[2],cost:1,color:'blue',symbol:'cow',emoji:'🐄',text:'任意玩家掷出 2：从银行获得 1 金币。'},
  {id:'forest',name:'林场',roll:[5],cost:3,color:'blue',symbol:'gear',emoji:'🌲',text:'任意玩家掷出 5：从银行获得 1 金币。'},
  {id:'mine',name:'矿场',roll:[9],cost:6,color:'blue',symbol:'gear',emoji:'⛏️',text:'任意玩家掷出 9：从银行获得 5 金币。'},
  {id:'orchard',name:'果园',roll:[10],cost:3,color:'blue',symbol:'wheat',emoji:'🍎',text:'任意玩家掷出 10：从银行获得 3 金币。'},
  {id:'bakery',name:'面包房',roll:[2,3],cost:1,color:'green',symbol:'bread',emoji:'🥐',text:'自己掷出 2 或 3：从银行获得 1 金币。'},
  {id:'store',name:'便利店',roll:[4],cost:2,color:'green',symbol:'bread',emoji:'🏪',text:'自己掷出 4：从银行获得 3 金币。'},
  {id:'cheese',name:'奶酪工厂',roll:[7],cost:5,color:'green',symbol:'factory',emoji:'🧀',text:'自己掷出 7：每张农场使你获得 3 金币。'},
  {id:'furniture',name:'家具工厂',roll:[8],cost:3,color:'green',symbol:'factory',emoji:'🪑',text:'自己掷出 8：每张齿轮建筑使你获得 3 金币。'},
  {id:'market',name:'果蔬超市',roll:[11,12],cost:2,color:'green',symbol:'factory',emoji:'🥬',text:'自己掷出 11 或 12：每张麦穗建筑使你获得 3 金币。'},
  {id:'cafe',name:'咖啡车',roll:[3],cost:2,color:'red',symbol:'cup',emoji:'☕',text:'其他玩家掷出 3：从掷骰者处收取 1 金币。'},
  {id:'restaurant',name:'餐厅',roll:[9,10],cost:3,color:'red',symbol:'cup',emoji:'🍽️',text:'其他玩家掷出 9 或 10：从掷骰者处收取 2 金币。'},
  {id:'stadium',name:'体育馆',roll:[6],cost:6,color:'purple',symbol:'major',emoji:'🏟️',text:'自己掷出 6：从每位其他玩家收取 2 金币。'},
  {id:'tv',name:'电视台',roll:[6],cost:7,color:'purple',symbol:'major',emoji:'📺',text:'自己掷出 6：指定一位玩家，收取 5 金币。'},
  {id:'business',name:'商业中心',roll:[6],cost:8,color:'purple',symbol:'major',emoji:'🏢',text:'自己掷出 6：指定一位玩家，交换一张非重要建筑。'}
];
export const harborCards = [
  {id:'flowerfield',name:'花田',roll:[4],cost:2,color:'blue',symbol:'wheat',emoji:'🌻',text:'任意玩家掷出 4：从银行获得 1 金币。'},
  {id:'fishing',name:'鱼船',roll:[8],cost:2,color:'blue',symbol:'boat',emoji:'🚤',text:'拥有港口时，任意玩家掷出 8：获得 3 金币。'},
  {id:'cruise',name:'观光船',roll:[12,13,14],cost:5,color:'blue',symbol:'boat',emoji:'🛳️',text:'掷骰者重掷两骰；有港口的玩家每张观光船获得新点数之和的金币。'},
  {id:'florist',name:'花店',roll:[6],cost:1,color:'green',symbol:'bread',emoji:'💐',text:'自己掷出 6：每张花田使你获得 1 金币。'},
  {id:'foodmarket',name:'食品市场',roll:[12,13],cost:2,color:'green',symbol:'factory',emoji:'🛒',text:'自己掷出 12 或 13：每张咖啡杯建筑使你获得 2 金币。'},
  {id:'sushi',name:'寿司店',roll:[1],cost:2,color:'red',symbol:'cup',emoji:'🍣',text:'拥有港口时，其他玩家掷出 1：收取 3 金币。'},
  {id:'pizza',name:'披萨店',roll:[7],cost:1,color:'red',symbol:'cup',emoji:'🍕',text:'其他玩家掷出 7：收取 1 金币。'},
  {id:'burger',name:'汉堡店',roll:[8],cost:1,color:'red',symbol:'cup',emoji:'🍔',text:'其他玩家掷出 8：收取 1 金币。'},
  {id:'music',name:'音乐台',roll:[6],cost:7,color:'purple',symbol:'major',emoji:'🎵',text:'自己掷出 6：指定一位其他玩家，收取 5 金币。'},
  {id:'publisher',name:'出版社',roll:[7],cost:5,color:'purple',symbol:'major',emoji:'📚',text:'自己掷出 7：从其他玩家每张咖啡杯和面包建筑收取 1 金币。'},
  {id:'tax',name:'税务所',roll:[8,9],cost:4,color:'purple',symbol:'major',emoji:'🏦',text:'自己掷出 8 或 9：指定一位至少有 10 金币的玩家，收取其一半金币。'}
];
export const millionaireCards = [
  {id:'corn',name:'玉米田',roll:[3,4],cost:2,color:'blue',symbol:'wheat',emoji:'🌽',text:'任意玩家掷出 3 或 4：若地标少于两座，获得 1 金币。'},
  {id:'vineyard',name:'葡萄园',roll:[7],cost:3,color:'blue',symbol:'wheat',emoji:'🍇',text:'任意玩家掷出 7：获得 3 金币。'},
  {id:'generalstore',name:'杂货店',roll:[2],cost:0,color:'green',symbol:'bread',emoji:'🏬',text:'自己掷出 2：若地标少于两座，获得 2 金币。'},
  {id:'bike',name:'自行车公司',roll:[5,6],cost:0,color:'green',symbol:'briefcase',emoji:'🚲',text:'建造时获得 5 金币；之后每次启动要付银行 2 金币。'},
  {id:'demolition',name:'拆迁公司',roll:[4],cost:2,color:'green',symbol:'briefcase',emoji:'🏗️',text:'自己掷出 4：拆除自己一座已建地标，获得 8 金币。'},
  {id:'winery',name:'葡萄酒庄',roll:[9],cost:3,color:'green',symbol:'factory',emoji:'🍷',text:'自己掷出 9：每张葡萄园获得 6 金币，之后暂停一次启动。'},
  {id:'drinks',name:'饮料工厂',roll:[11],cost:5,color:'green',symbol:'factory',emoji:'🥤',text:'自己掷出 11：从银行获得全体玩家咖啡杯建筑总数的金币。'},
  {id:'movers',name:'搬家公司',roll:[9,10],cost:2,color:'green',symbol:'briefcase',emoji:'🚚',text:'自己掷出 9 或 10：把自己一座已建地标送给其他玩家，获得 4 金币。'},
  {id:'club',name:'会员俱乐部',roll:[12,13,14],cost:4,color:'red',symbol:'cup',emoji:'🎟️',text:'若掷骰者已建成至少三座地标，收取其全部金币。'},
  {id:'expo',name:'车展',roll:[10],cost:7,color:'purple',symbol:'major',emoji:'🚘',text:'自己掷出 10：选择一种非重要建筑，启动自己的全部此类卡，然后将车展放回供应堆。'},
  {id:'publicpark',name:'公园',roll:[11,12,13],cost:3,color:'purple',symbol:'major',emoji:'🏞️',text:'自己掷出 11–13：汇总所有玩家金币，均分；不足整除时由银行补足。'},
  {id:'repair',name:'修车公司',roll:[8],cost:4,color:'purple',symbol:'major',emoji:'🛠️',text:'自己掷出 8：指定一种非重要建筑，令所有此类建筑暂停一次启动，并向每张收取 1 金币。'},
  {id:'tech',name:'科技公司',roll:[10],cost:1,color:'purple',symbol:'major',emoji:'💻',text:'每回合可投资 1 金币；自己掷出 10 时，其他玩家各支付投资额。'}
];
export const cards = [...baseCards,...harborCards,...millionaireCards];
export const byId = Object.fromEntries(cards.map(c=>[c.id,c]));
export const cardsFor = settings => [...baseCards,...(settings.harbor?harborCards:[]),...(settings.millionaire?millionaireCards:[])];
export const baseLandmarks = [
  {id:'station',name:'火车站',cost:4,emoji:'🚉',text:'可选择掷 1 颗或 2 颗骰子。'},
  {id:'mall',name:'购物中心',cost:10,emoji:'🛍️',text:'面包与咖啡杯建筑每张收入 +1。'},
  {id:'park',name:'游乐园',cost:16,emoji:'🎡',text:'掷出双骰同点，完成回合后再进行一回合。'},
  {id:'tower',name:'广播塔',cost:22,emoji:'📡',text:'每回合可重掷一次骰子。'}
];
export const harborLandmarks = [
  {id:'harbor',name:'港口',cost:2,emoji:'⚓',text:'骰子总点数至少 10 时，可选择把点数加 2。'},
  {id:'airport',name:'机场',cost:30,emoji:'✈️',text:'若本回合没有建造建筑，回合结束时获得 10 金币。'}
];
export const landmarks = [...baseLandmarks,...harborLandmarks];
export const landmarksFor = settings => [...baseLandmarks,...(settings.harbor?harborLandmarks:[])];
export const palette = ['#60a5fa','#f472b6','#fbbf24','#34d399','#c4b5fd'];
