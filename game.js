// ═══════════════════════════════════════════════════════════
//  ΟΔΟ ΣΟΚΡΑΤΗΣ — game.js  (v6)
//  • No duplicate blessings in collection/equipped
//  • Boss every 5 floors with special random debuff
//  • Smart autoplay based on equipped set strategy
// ═══════════════════════════════════════════════════════════

// ── STATIC DATA ─────────────────────────────────────────────
const QUOTES = [
  '"So di non sapere nulla." — Socrate',
  '"La vita non esaminata non vale la pena di essere vissuta." — Socrate',
  '"Conosci te stesso." — Iscrizione di Delfi',
  '"La virtù è sapere." — Socrate',
  '"Il corpo è la prigione dell\'anima." — Platone',
  '"La filosofia è preparazione alla morte." — Socrate',
  '"Solo chi conosce i propri limiti può superarli." — Socrate',
  '"L\'ignoranza è la radice di ogni male." — Platone',
];

const ENEMIES = [
  {name:"Malloc",title:"The big M",icon:"🎭"},
  {name:"Francesco Bego",title:"Larper",icon:"🌀"},
  {name:"Lo Scheletro",title:"Portatore di invezioni",icon:"💀"},
  {name:"Barchi gay",title:"Apostolo delle j",icon:"👑"},
  {name:"Daniel",title:"Italian Master",icon:"⚖"},
  {name:"Zanotti",title:"Aura Farmer",icon:"🗡"},
  {name:"Redi",title:"Negative aura holder",icon:"🦁"},
  {name:"Il Trapezzoide",title:"I love trapezzoidi",icon:"🌑"},
  {name:"Basquiat",title:"IShowSpeed dei poveri",icon:"⛓"},
  {name:"Giatti",title:"Re dell'aura",icon:"🕳"},
  {name:"Denis Penis",title:"Fortnite Player",icon:"👁"},
  {name:"Il Bocchins",title:"Fa i bocchins",icon:"🔱"},
];

// ── BOSS DATA ─────────────────────────────────────────────────
const BOSSES = [
  {name:"Il Grande Sofista",title:"Campione dell'Inganno",icon:"🔱"},
  {name:"Thanatos Filosofico",title:"Signore del Silenzio Eterno",icon:"💀"},
  {name:"Il Tiranno Assoluto",title:"Oppressore della Ragione",icon:"👑"},
  {name:"L'Ombra Suprema",title:"Oscurità dell'Intelletto",icon:"🌑"},
  {name:"Arkon il Distruttore",title:"Nemico della Dialettica",icon:"⚡"},
  {name:"Il Vuoto Incarnato",title:"Antitesi della Saggezza",icon:"🕳"},
  {name:"Kronos Corrotto",title:"Divoratore di Filosofi",icon:"⌛"},
];

// Boss special debuffs (random each time)
const BOSS_DEBUFFS = [
  {id:'weakness',name:'Debolezza',desc:'ATK dimezzato per 3 turni',apply:(g,st)=>{
    g.playerStatuses.push({type:'debuff',name:'Debolezza',turns:3,atkMult:0.5});
  }},
  {id:'drain',name:'Drenaggio',desc:'Toglie 15 Logos per turno per 3 turni',apply:(g,st)=>{
    g.playerStatuses.push({type:'drain',name:'Drenaggio',turns:3,mpDrain:15});
  }},
  {id:'blindness',name:'Cecità',desc:'Crit Chance azzerata per 4 turni',apply:(g,st)=>{
    g.playerStatuses.push({type:'blind',name:'Cecità',turns:4});
  }},
  {id:'curse',name:'Maledizione',desc:'Cura ridotta del 60% per 3 turni',apply:(g,st)=>{
    g.playerStatuses.push({type:'curse',name:'Maledizione',turns:3,healMult:0.4});
  }},
  {id:'silence',name:'Silenzio',desc:'Elenchos fa il 50% di danno per 3 turni',apply:(g,st)=>{
    g.playerStatuses.push({type:'silence',name:'Silenzio',turns:3});
  }},
  {id:'corrode',name:'Corrosione',desc:'DEF ridotta a 0 per 3 turni',apply:(g,st)=>{
    g.playerStatuses.push({type:'corrode',name:'Corrosione',turns:3});
  }},
  {id:'frenzy',name:'Frenesia',desc:'Il boss attacca due volte per 2 turni',apply:(g,st)=>{
    g.bossDoubleAttack=(g.bossDoubleAttack||0)+2;
  }},
];

const DOMAIN_ENEMIES = {
  d1:[
    {name:"Gorgia l'Oratore",title:"Campione della Retorica",icon:"🎭"},
    {name:"Protagora il Relativista",title:"Uomo misura di tutte le cose",icon:"⚖"},
    {name:"Crizia il Tiranno",title:"Oligarca di Atene",icon:"👑"},
    {name:"Meleto l'Accusatore",title:"Nemico di Socrate",icon:"📜"},
    {name:"Anito il Demagogo",title:"Custode dell'Ignoranza",icon:"🌑"},
  ],
  d2:[
    {name:"L'Ombra della Caverna",title:"Prigioniero delle Illusioni",icon:"🕳"},
    {name:"La Forma Corrotta",title:"Idea Distorta",icon:"💀"},
    {name:"Il Demiurgo Oscuro",title:"Creatore di Menzogna",icon:"🌀"},
    {name:"Il Filosofo Falso",title:"Sofista in Toga",icon:"🎓"},
    {name:"L'Ombra di Platone",title:"Eco senza Sostanza",icon:"👻"},
  ],
  d3:[
    {name:"Il Tiranno dell'Etica",title:"Corruttore della Virtù",icon:"🗡"},
    {name:"Il Vizio Incarnato",title:"Nemico della Temperanza",icon:"🍷"},
    {name:"L'Ingiusto Supremo",title:"Avversario di Aristotele",icon:"⛓"},
    {name:"Il Nichilista",title:"Negatore di Ogni Valore",icon:"🌑"},
    {name:"Anassimandro il Caos",title:"Guardiano del Disordine",icon:"🔥"},
  ],
  d4:[
    {name:"Ade delle Idee",title:"Signore dell'Oblio",icon:"💀"},
    {name:"Titano dell'Ignoranza",title:"Antagonista degli Dei",icon:"🏔"},
    {name:"Erebo Filosofico",title:"Oscurità dell'Intelletto",icon:"🌑"},
    {name:"Il Vuoto Assoluto",title:"Antitesi della Sapienza",icon:"🕳"},
    {name:"Kronos dell'Oblio",title:"Divoratore di Saggezza",icon:"⌛"},
  ],
  d5:[
    {name:"Il Carnefice",title:"Servo della Distruzione",icon:"💢"},
    {name:"Atë la Rovina",title:"Dea della Cecità Fatale",icon:"🩸"},
    {name:"Il Martire Corrotto",title:"Chi Abbraccia il Dolore",icon:"⛓"},
    {name:"Thanatos il Vero",title:"Morte Incarnata",icon:"💀"},
    {name:"Il Re Distrutto",title:"Corona Spezzata sull'Abisso",icon:"👁‍🗨"},
  ],
  d6:[
    {name:"Il Buffone Supremo",title:"Maestro del Caos Gioioso",icon:"🎪"},
    {name:"Aristofane il Beffardo",title:"Commediografo dell'Olimpo",icon:"😂"},
    {name:"La Maschera Ridente",title:"Chi Ride nell'Oscurità",icon:"🎭"},
    {name:"Il Saltimbanco",title:"Acrobata dell'Assurdo",icon:"🤹"},
    {name:"Momos il Deriso",title:"Dio della Beffa Divina",icon:"🃏"},
  ],
};

// ── SETS ────────────────────────────────────────────────────
const SETS = {
  socratic_order:{id:'socratic_order',name:"Ordine Socratico",domain:1,icon:"🏛",color:"var(--s1)",
    desc2:"+15% Danno totale",desc4:"Aporia +100% danno, colpisce da 3 a 20 volte",
    bonus2:{atkPct:.15},bonus4:{},bonus4special:'aporiaBoost'},
  sophist_mask:{id:'sophist_mask',name:"Maschera del Sofista",domain:1,icon:"🎭",color:"var(--s1)",
    desc2:"+22% HP Massimi",desc4:"Maieutica cura 38% HP + danno pari al 20% HP attuali",
    bonus2:{maxHpPct:.22},bonus4:{},bonus4special:'maieuticaBoost'},
  academy_mind:{id:'academy_mind',name:"Mente dell'Accademia",domain:2,icon:"📚",color:"var(--s2)",
    desc2:"+25% Logos Massimo",desc4:"Eironeia dura 6 turni, -70% ATK nemico",
    bonus2:{maxMpPct:.25},bonus4:{},bonus4special:'eironeiaBuff'},
  ideal_form:{id:'ideal_form',name:"Forma delle Idee",domain:2,icon:"💎",color:"var(--s2)",
    desc2:"+12% Crit Chance, +50 Crit Damage",desc4:"Colpi critici ×1.5 Crit Damage bonus",
    bonus2:{critChancePct:.12,critDmgFlat:50},bonus4:{},bonus4special:'critMult'},
  nicomachean:{id:'nicomachean',name:"Etica Nicomachea",domain:3,icon:"⚖",color:"var(--s3)",
    desc2:"+15% ATK e DEF totali",desc4:"Eironeia applica Arcana: DOT (100% ATK + 80% DEF)/turno × 3T",
    bonus2:{atkPct:.15,defPct:.15},bonus4:{},bonus4special:'arcanaCurse'},
  pure_logic:{id:'pure_logic',name:"Logica Pura",domain:3,icon:"🔬",color:"var(--s3)",
    desc2:"+22% Difesa totale",desc4:"Quando colpito (e vivo): +3% HP + nemico subisce danno = DEF",
    bonus2:{defPct:.22},bonus4:{},bonus4special:'turnRegen'},
  prometheus_fire:{id:'prometheus_fire',name:"Fuoco di Prometeo",domain:4,icon:"🔥",color:"var(--s4)",
    desc2:"+20% Crit Chance totale",desc4:"Elenchos colpisce 2 volte",
    bonus2:{critChancePct:.20},bonus4:{},bonus4special:'elenchosDouble'},
  divine_wisdom:{id:'divine_wisdom',name:"Saggezza degli Dei",domain:4,icon:"✨",color:"var(--s4)",
    desc2:"+35% Saggezza guadagnata",desc4:"Logos +5 per attacco + Aporia scala col Logos massimo",
    bonus2:{wisdomPct:.35},bonus4:{},bonus4special:'logosAttackRegen'},
  // ── Dominio 5: Destruction ──
  iron_will:{id:'iron_will',name:"Volontà di Ferro",domain:5,icon:"💢",color:"var(--s5)",
    desc2:"+20% ATK totale + ogni 10% HP persi = +8% danno (max +80%)",
    desc4:"Quando sotto il 40% HP: ogni attacco infligge +30% danno e ruba il 5% degli HP mancanti",
    bonus2:{atkPct:.20},bonus4:{},bonus4special:'woundedFury'},
  broken_crown:{id:'broken_crown',name:"Corona Spezzata",domain:5,icon:"👁‍🗨",color:"var(--s5)",
    desc2:"+30% HP massimi + danni subiti caricano potere: ogni 50 danno subito = +5% ATK permanente (max +100%)",
    desc4:"Una volta per battaglia: se ricevi danno letale rimani a 1 HP invece di morire",
    bonus2:{maxHpPct:.30},bonus4:{},bonus4special:'lastStand'},
  // ── Dominio 6: Elation ──
  jester_soul:{id:'jester_soul',name:"Anima del Giullare",domain:6,icon:"🎪",color:"var(--s6)",
    desc2:"+10 Punchline extra per ogni skill usata (richiede 2 Blessing Elation attive)",
    desc4:"Catarsi non consuma cooldown se hai 50+ Punchline al momento dell'uso",
    bonus2:{},bonus4:{},bonus4special:'jesterFlow'},
  crowd_pleaser:{id:'crowd_pleaser',name:"Piacere della Folla",domain:6,icon:"🎭",color:"var(--s6)",
    desc2:"+25% Danno Catarsi + ogni colpo critico genera +8 Punchline bonus",
    desc4:"Catarsi può colpire critico con Crit Chance normale (danno ×Crit DMG)",
    bonus2:{punchlineDmgPct:.25},bonus4:{},bonus4special:'crowdCrit'},
};

// ── DOMAINS ──────────────────────────────────────────────────
const DOMAINS = [
  {id:1,name:"Agorà di Atene",icon:"🏛",color:"var(--s1)",bg:"rgba(201,168,76,.08)",
   desc:"Le strade di Atene. Retori e sofisti.",
   sets:['socratic_order','sophist_mask'],enemyKey:'d1',scaleMult:1.0},
  {id:2,name:"Accademia di Platone",icon:"📚",color:"var(--s2)",bg:"rgba(80,144,208,.08)",
   desc:"Ombre filosofiche e forme corrotte.",
   sets:['academy_mind','ideal_form'],enemyKey:'d2',scaleMult:1.4},
  {id:3,name:"Liceo di Aristotele",icon:"⚖",color:"var(--s3)",bg:"rgba(90,170,90,.08)",
   desc:"Vizi e nichilisti dell'etica.",
   sets:['nicomachean','pure_logic'],enemyKey:'d3',scaleMult:2.0},
  {id:4,name:"Olimpo degli Dei",icon:"🔥",color:"var(--s4)",bg:"rgba(160,128,208,.08)",
   desc:"Titani dell'oblio e guardiani del caos.",
   sets:['prometheus_fire','divine_wisdom'],enemyKey:'d4',scaleMult:3.0},
  {id:5,name:"Abisso della Distruzione",icon:"💢",color:"var(--s5)",bg:"rgba(180,40,40,.08)",
   desc:"Dove il dolore diventa forza. Chi resiste vince.",
   sets:['iron_will','broken_crown'],enemyKey:'d5',scaleMult:4.5},
  {id:6,name:"Teatro dell'Elation",icon:"🎪",color:"var(--s6)",bg:"rgba(255,180,50,.08)",
   desc:"Il palcoscenico dell'assurdo. Risate che uccidono.",
   sets:['jester_soul','crowd_pleaser'],enemyKey:'d6',scaleMult:4.0},
];

// ── BLESSINGS ────────────────────────────────────────────────
const BLESSING_PATHS = {
  Hunt:         {icon:'👁',  color:'#e8a030'},
  Nihility:     {icon:'🌑',  color:'#a080d0'},
  Propagation:  {icon:'🔮',  color:'#60aadd'},
  Abundance:    {icon:'🌸',  color:'#80cc80'},
  Preservation: {icon:'🛡',  color:'#c9a84c'},
  Destruction:  {icon:'💢',  color:'#cc3333'},
  Elation:      {icon:'🎪',  color:'#ffb830'},
};

const BLESSINGS = {
  hunt_1:{id:'hunt_1',path:'Hunt',name:"Istinto del Predatore",
    desc:"+25% Crit Chance e +25% Crit Damage sul totale.",
    stats:{critChancePct:.25,critDmgPct:.25},flags:[]},
  hunt_2:{id:'hunt_2',path:'Hunt',name:"Colpo Letale",
    desc:"I critici hanno il 40% di probabilità di colpire una seconda volta.",
    stats:{},flags:['critDoubleHit']},
  hunt_3:{id:'hunt_3',path:'Hunt',name:"Furia Predatoria",
    desc:"+40% ATK totale.",
    stats:{atkPct:.40},flags:[]},
  hunt_4:{id:'hunt_4',path:'Hunt',name:"Primo Sangue",
    desc:"La prima skill usata ogni battaglia infligge il doppio del danno.",
    stats:{},flags:['firstSkillBoost']},

  nihility_1:{id:'nihility_1',path:'Nihility',name:"Maledizione Estesa",
    desc:"I debuff durano 2 turni aggiuntivi.",
    stats:{},flags:['extraDebuffTurns']},
  nihility_2:{id:'nihility_2',path:'Nihility',name:"Veleno del Nulla",
    desc:"Ogni turno in cui il nemico è sotto debuff subisce il 25% dell'ATK come danno extra.",
    stats:{},flags:['debuffPoison']},
  nihility_3:{id:'nihility_3',path:'Nihility',name:"Abisso della Mente",
    desc:"Eironeia riduce l'ATK nemico di un ulteriore 20%.",
    stats:{},flags:['eironeiaExtraAtk']},
  nihility_4:{id:'nihility_4',path:'Nihility',name:"Corrosione",
    desc:"Confuso riduce anche la DEF nemica del 30%.",
    stats:{},flags:['confuseDefReduction']},

  propagation_1:{id:'propagation_1',path:'Propagation',name:"Fiume del Logos",
    desc:"+50 Logos Max, +3 Logos Regen per turno.",
    stats:{maxMpFlat:50,mpRegenFlat:3},flags:[]},
  propagation_2:{id:'propagation_2',path:'Propagation',name:"Amplificazione",
    desc:"Ogni 10 Logos spesi in una battaglia = +6% danno (max +120%).",
    stats:{},flags:['logosDmgStack']},
  propagation_3:{id:'propagation_3',path:'Propagation',name:"Risonanza Pura",
    desc:"Logos Regen triplicato.",
    stats:{mpRegenMult:3},flags:[]},
  propagation_4:{id:'propagation_4',path:'Propagation',name:"Trasferimento Vitale",
    desc:"Ogni skill usata guarisce 4 HP per ogni Logos speso.",
    stats:{},flags:['skillHealPerLogos']},

  abundance_1:{id:'abundance_1',path:'Abundance',name:"Guaritore Nato",
    desc:"Maieutica ha 1 turno di ricarica in meno. +15% a tutte le cure.",
    stats:{healBoostPct:.15},flags:['maieuticaCdReduce']},
  abundance_2:{id:'abundance_2',path:'Abundance',name:"Flusso Vitale",
    desc:"Ogni turno nemico rigenera il 2% degli HP Massimi.",
    stats:{},flags:['passiveRegen']},
  abundance_3:{id:'abundance_3',path:'Abundance',name:"Contraccolpo Curativo",
    desc:"Le cure infliggono il 20% del valore guarito come danno al nemico.",
    stats:{},flags:['healDamage']},
  abundance_4:{id:'abundance_4',path:'Abundance',name:"Estasi della Vita",
    desc:"Se usata a HP pieni, Maieutica dona +35% ATK per 3 turni invece di curare.",
    stats:{},flags:['maieuticaFullHpBuff']},

  preservation_1:{id:'preservation_1',path:'Preservation',name:"Bastione",
    desc:"+35% DEF totale, +25% HP Massimi totali.",
    stats:{defPct:.35,maxHpPct:.25},flags:[]},
  preservation_2:{id:'preservation_2',path:'Preservation',name:"Scudo Riflesso",
    desc:"Il primo colpo subito ogni battaglia viene completamente ignorato.",
    stats:{},flags:['firstHitNegate']},
  preservation_3:{id:'preservation_3',path:'Preservation',name:"Baluardo",
    desc:"Sotto il 30% HP, la DEF raddoppia.",
    stats:{},flags:['lowHpDefDouble']},
  preservation_4:{id:'preservation_4',path:'Preservation',name:"Forza nella Roccia",
    desc:"Ogni 5 punti di DEF aggiunge l'1% all'ATK.",
    stats:{},flags:['defToAtk']},

  // ── DESTRUCTION: basate sulla perdita di HP ──────────────────
  destruction_1:{id:'destruction_1',path:'Destruction',name:"Rabbia del Ferito",
    desc:"Ogni 10% di HP mancanti = +10% ATK (max +90%). Scala sugli HP persi.",
    stats:{},flags:['woundedRage']},
  destruction_2:{id:'destruction_2',path:'Destruction',name:"Sangue e Acciaio",
    desc:"Quando vieni colpito, il prossimo attacco infligge +50% danno.",
    stats:{},flags:['bloodSteel']},
  destruction_3:{id:'destruction_3',path:'Destruction',name:"Sacrificio Tattico",
    desc:"Puoi usare Elenchos consumando il 5% HP max invece di Logos. Genera anche 3 Punchline se Elation attiva.",
    stats:{},flags:['hpElenchos']},
  destruction_4:{id:'destruction_4',path:'Destruction',name:"Rinascita dalla Cenere",
    desc:"Quando scendi sotto il 20% HP, guadagni +80% ATK e +40% DEF per 3 turni (una volta per battaglia).",
    stats:{},flags:['phoenixRage']},

  // ── ELATION: generano e potenziano le Punchline ──────────────
  elation_1:{id:'elation_1',path:'Elation',name:"Sense of Humor",
    desc:"[Attiva sistema Punchline] Ogni attacco genera +5 Punchline. Sblocca la skill Catarsi.",
    stats:{},flags:['elationActive']},
  elation_2:{id:'elation_2',path:'Elation',name:"Comic Timing",
    desc:"[Attiva sistema Punchline] Elenchos genera +8 Punchline invece di 5. I critici ne generano +5 bonus.",
    stats:{},flags:['elationActive','comicTiming']},
  elation_3:{id:'elation_3',path:'Elation',name:"Crowd Work",
    desc:"Ogni turno passato sotto il 50% HP genera +10 Punchline aggiuntive.",
    stats:{},flags:['crowdWork']},
  elation_4:{id:'elation_4',path:'Elation',name:"Standing Ovation",
    desc:"Dopo aver usato Catarsi con 80+ Punchline, guadagni +50% ATK per 2 turni.",
    stats:{},flags:['standingOvation']},
};
const BLESSING_IDS = Object.keys(BLESSINGS);
const MAX_BLESSING_SLOTS = 6;

// ── ITEM / RARITY CONSTANTS ──────────────────────────────────
const SLOT_ICONS  = {weapon:"⚔",armor:"🛡",ring:"💍",amulet:"📿",boots:"👟"};
const SLOT_NAMES  = {weapon:"Arma",armor:"Armatura",ring:"Anello",amulet:"Amuleto",boots:"Sandali"};
const RARITY_ORDER= {common:0,uncommon:1,rare:2,legendary:3};
const RARITY_NAMES= {common:"Comune",uncommon:"Non Comune",rare:"Raro",legendary:"Leggendario"};
const SELL_PRICES = {common:3,uncommon:9,rare:25,legendary:60};
const DOMAIN_COST = 200;

// ── UPGRADES ─────────────────────────────────────────────────
const UPGRADES_DEF = [
  {id:'dialectics', name:'Dialettica', desc:'+5% ATK (base+oggetti) per livello.',
   baseCost:15, costScale:1.5,
   effect: g => { g.upgradeMults.atk = +(g.upgradeMults.atk * 1.05).toFixed(4); },
   getEffect: () => `×${G.upgradeMults.atk.toFixed(2)} ATK`},
  {id:'virtue', name:'Virtù', desc:'+15% HP (base+oggetti) per livello.',
   baseCost:20, costScale:1.6,
   effect: g => { g.upgradeMults.maxHp = +(g.upgradeMults.maxHp * 1.15).toFixed(4); },
   getEffect: () => `×${G.upgradeMults.maxHp.toFixed(2)} HP`},
  {id:'temperance', name:'Temperanza', desc:'+5% DEF (base+oggetti) per livello.',
   baseCost:25, costScale:1.55,
   effect: g => { g.upgradeMults.def = +(g.upgradeMults.def * 1.05).toFixed(4); },
   getEffect: () => `×${G.upgradeMults.def.toFixed(2)} DEF`},
  {id:'logos', name:'Logos', desc:'+10% Logos (base+oggetti), +1 Regen/lv.',
   baseCost:18, costScale:1.45,
   effect: g => { g.upgradeMults.maxMp = +(g.upgradeMults.maxMp * 1.10).toFixed(4); g.player.baseMpRegen += 1; },
   getEffect: () => `×${G.upgradeMults.maxMp.toFixed(2)} Logos`},
  {id:'insight', name:'Intuizione', desc:'+8% Crit Damage (base+oggetti) per livello.',
   baseCost:30, costScale:1.6,
   effect: g => { g.upgradeMults.critDmg = +(g.upgradeMults.critDmg * 1.08).toFixed(4); },
   getEffect: () => `×${G.upgradeMults.critDmg.toFixed(2)} Crit DMG`},
  {id:'wisdom_gain', name:'Sapienza', desc:'+20% Saggezza guadagnata per livello.',
   baseCost:40, costScale:1.8,
   effect: g => { g.wisdomMult += 0.2; },
   getEffect: lv => `+${Math.round(lv*20)}% Sag.`},
];

// ── ITEMS DATABASE ───────────────────────────────────────────
const ITEMS_DB = buildItemsDB();
function buildItemsDB(){
  const W=[
    {n:"Rotolo della Dialettica",i:"📜",r:"common",   s:{atk:5},               sid:"socratic_order"},
    {n:"Scettro del Logos",      i:"🔱",r:"uncommon", s:{atk:9,critChance:2},  sid:"socratic_order"},
    {n:"Spada della Verità",     i:"⚔", r:"rare",     s:{atk:16,critChance:5}, sid:"socratic_order"},
    {n:"Lama dell'Elenchos",     i:"🗡",r:"legendary",s:{atk:28,critChance:10},sid:"socratic_order"},
    {n:"Bastone Sofistico",      i:"🪄",r:"common",   s:{atk:4,maxHp:15},      sid:"sophist_mask"},
    {n:"Lira dell'Inganno",      i:"🎵",r:"uncommon", s:{atk:7,maxHp:30},      sid:"sophist_mask"},
    {n:"Asta del Retore",        i:"📏",r:"rare",     s:{atk:12,maxHp:55},     sid:"sophist_mask"},
    {n:"Fiamma Sofistica",       i:"🔥",r:"legendary",s:{atk:20,maxHp:90},     sid:"sophist_mask"},
    {n:"Penna dell'Accademia",   i:"✒", r:"common",   s:{atk:4,maxMp:12},      sid:"academy_mind"},
    {n:"Calamo Platonico",       i:"🖊",r:"uncommon", s:{atk:7,maxMp:22},      sid:"academy_mind"},
    {n:"Libro delle Forme",      i:"📖",r:"rare",     s:{atk:11,maxMp:38},     sid:"academy_mind"},
    {n:"Dialogo Infinito",       i:"💬",r:"legendary",s:{atk:18,maxMp:60},     sid:"academy_mind"},
    {n:"Cristallo dell'Idea",    i:"💎",r:"common",   s:{atk:4,critChance:4},  sid:"ideal_form"},
    {n:"Lama di Cristallo",      i:"🔮",r:"uncommon", s:{atk:8,critChance:7},  sid:"ideal_form"},
    {n:"Spada dell'Eterno",      i:"⚡",r:"rare",     s:{atk:14,critChance:11},sid:"ideal_form"},
    {n:"Forma Assoluta",         i:"🌟",r:"legendary",s:{atk:24,critChance:18},sid:"ideal_form"},
    {n:"Spadino Etico",          i:"🗡",r:"common",   s:{atk:5,def:3},         sid:"nicomachean"},
    {n:"Ascia della Virtù",      i:"🪓",r:"uncommon", s:{atk:9,def:5},         sid:"nicomachean"},
    {n:"Spada dell'Etica",       i:"⚔", r:"rare",     s:{atk:15,def:8},        sid:"nicomachean"},
    {n:"Lama Nicomachea",        i:"🔱",r:"legendary",s:{atk:26,def:13},       sid:"nicomachean"},
    {n:"Compasso Logico",        i:"📐",r:"common",   s:{atk:3,def:5},         sid:"pure_logic"},
    {n:"Righello della Ragione", i:"📏",r:"uncommon", s:{atk:6,def:8},         sid:"pure_logic"},
    {n:"Assioma Affilato",       i:"🔬",r:"rare",     s:{atk:10,def:13},       sid:"pure_logic"},
    {n:"Teorema Assoluto",       i:"∞", r:"legendary",s:{atk:16,def:22},       sid:"pure_logic"},
    {n:"Tizzone di Prometeo",    i:"🕯",r:"common",   s:{atk:5,critChance:5},  sid:"prometheus_fire"},
    {n:"Torcia Olimpica",        i:"🔦",r:"uncommon", s:{atk:9,critChance:9},  sid:"prometheus_fire"},
    {n:"Fiamma Divina",          i:"🔥",r:"rare",     s:{atk:16,critChance:14},sid:"prometheus_fire"},
    {n:"Braciere degli Dei",     i:"☄", r:"legendary",s:{atk:27,critChance:22},sid:"prometheus_fire"},
    {n:"Pergamena Divina",       i:"📜",r:"common",   s:{atk:4,maxMp:15},      sid:"divine_wisdom"},
    {n:"Sigillo di Zeus",        i:"⚡",r:"uncommon", s:{atk:7,maxMp:25,mpRegen:1},sid:"divine_wisdom"},
    {n:"Scettro dell'Olimpo",    i:"🌩",r:"rare",     s:{atk:13,maxMp:40,mpRegen:2},sid:"divine_wisdom"},
    {n:"Fulmine di Zeus",        i:"⚡",r:"legendary",s:{atk:22,maxMp:65,mpRegen:4},sid:"divine_wisdom"},
  ];
  const A=[
    {n:"Mantello Socratico",    i:"🧥",r:"common",   s:{def:3,maxHp:20},  sid:"socratic_order"},
    {n:"Toga della Dialettica", i:"👘",r:"uncommon", s:{def:6,maxHp:40},  sid:"socratic_order"},
    {n:"Veste dell'Elenchos",   i:"🎓",r:"rare",     s:{def:11,maxHp:70}, sid:"socratic_order"},
    {n:"Armatura del Logos",    i:"🛡",r:"legendary",s:{def:18,maxHp:110},sid:"socratic_order"},
    {n:"Mantello Sofistico",    i:"🎭",r:"common",   s:{def:2,maxHp:30},  sid:"sophist_mask"},
    {n:"Veste del Retore",      i:"👗",r:"uncommon", s:{def:4,maxHp:60},  sid:"sophist_mask"},
    {n:"Abito dell'Oratoria",   i:"🎩",r:"rare",     s:{def:8,maxHp:100}, sid:"sophist_mask"},
    {n:"Corona del Sofista",    i:"👑",r:"legendary",s:{def:12,maxHp:160},sid:"sophist_mask"},
    {n:"Toga Accademica",       i:"🎓",r:"common",   s:{def:3,maxMp:14},  sid:"academy_mind"},
    {n:"Veste di Platone",      i:"🧥",r:"uncommon", s:{def:6,maxMp:25},  sid:"academy_mind"},
    {n:"Armatura Mentale",      i:"🛡",r:"rare",     s:{def:10,maxMp:42}, sid:"academy_mind"},
    {n:"Corazza dell'Intelletto",i:"🧠",r:"legendary",s:{def:16,maxMp:68},sid:"academy_mind"},
    {n:"Tunica dell'Idea",      i:"👘",r:"common",   s:{def:3,critChance:3},  sid:"ideal_form"},
    {n:"Veste dell'Eterno",     i:"🌌",r:"uncommon", s:{def:5,critChance:6},  sid:"ideal_form"},
    {n:"Armatura di Cristallo", i:"💎",r:"rare",     s:{def:9,critChance:10}, sid:"ideal_form"},
    {n:"Forma Perfetta",        i:"🌟",r:"legendary",s:{def:15,critChance:16},sid:"ideal_form"},
    {n:"Cintura Etica",         i:"🎗",r:"common",   s:{def:4,atk:3},     sid:"nicomachean"},
    {n:"Cotta di Maglia Virtuosa",i:"⛓",r:"uncommon",s:{def:7,atk:6},    sid:"nicomachean"},
    {n:"Armatura Nicomachea",   i:"🛡",r:"rare",     s:{def:13,atk:10},   sid:"nicomachean"},
    {n:"Egida dell'Etica",      i:"⚖", r:"legendary",s:{def:21,atk:16},   sid:"nicomachean"},
    {n:"Corazza Logica",        i:"🔬",r:"common",   s:{def:5,maxHp:15},  sid:"pure_logic"},
    {n:"Veste dell'Assioma",    i:"📐",r:"uncommon", s:{def:9,maxHp:30},  sid:"pure_logic"},
    {n:"Armatura del Teorema",  i:"🔭",r:"rare",     s:{def:15,maxHp:55}, sid:"pure_logic"},
    {n:"Corazza Assoluta",      i:"🛡",r:"legendary",s:{def:24,maxHp:90}, sid:"pure_logic"},
    {n:"Mantello di Fiamma",    i:"🧥",r:"common",   s:{def:3,critChance:5},  sid:"prometheus_fire"},
    {n:"Corazza Ardente",       i:"🔥",r:"uncommon", s:{def:6,critChance:9},  sid:"prometheus_fire"},
    {n:"Armatura di Prometeo",  i:"⚡",r:"rare",     s:{def:11,critChance:14},sid:"prometheus_fire"},
    {n:"Fiamma Eterna",         i:"☄", r:"legendary",s:{def:18,critChance:22},sid:"prometheus_fire"},
    {n:"Veste degli Dei",       i:"☁", r:"common",   s:{def:3,mpRegen:2}, sid:"divine_wisdom"},
    {n:"Armatura Celeste",      i:"🌤",r:"uncommon", s:{def:6,maxMp:20,mpRegen:2},sid:"divine_wisdom"},
    {n:"Toga dell'Olimpo",      i:"⛅",r:"rare",     s:{def:10,maxMp:35,mpRegen:3},sid:"divine_wisdom"},
    {n:"Veste Immortale",       i:"🌟",r:"legendary",s:{def:16,maxMp:55,mpRegen:6},sid:"divine_wisdom"},
  ];
  const R=[
    {n:"Anello della Dialettica",i:"💍",r:"common",  s:{critChance:3,atk:2}, sid:"socratic_order"},
    {n:"Sigillo del Filosofo",   i:"🔮",r:"uncommon",s:{critChance:5,atk:4}, sid:"socratic_order"},
    {n:"Anello dell'Elenchos",   i:"🌀",r:"rare",    s:{critChance:9,atk:8}, sid:"socratic_order"},
    {n:"Sigillo di Socrate",     i:"♾", r:"legendary",s:{critChance:15,atk:14},sid:"socratic_order"},
    {n:"Anello Sofistico",       i:"💍",r:"common",  s:{maxHp:25},           sid:"sophist_mask"},
    {n:"Gemma del Retore",       i:"💎",r:"uncommon",s:{maxHp:50,def:2},     sid:"sophist_mask"},
    {n:"Anello dell'Inganno",    i:"🌀",r:"rare",    s:{maxHp:85,def:4},     sid:"sophist_mask"},
    {n:"Corona del Mistero",     i:"👑",r:"legendary",s:{maxHp:140,def:7},   sid:"sophist_mask"},
    {n:"Anello dell'Accademia",  i:"📚",r:"common",  s:{maxMp:18,mpRegen:1}, sid:"academy_mind"},
    {n:"Sigillo di Platone",     i:"🔮",r:"uncommon",s:{maxMp:32,mpRegen:2}, sid:"academy_mind"},
    {n:"Anello della Mente",     i:"🧠",r:"rare",    s:{maxMp:52,mpRegen:3}, sid:"academy_mind"},
    {n:"Sigillo Ideale",         i:"💫",r:"legendary",s:{maxMp:80,mpRegen:5},sid:"academy_mind"},
    {n:"Cristallo Anulare",      i:"💍",r:"common",  s:{critChance:5},       sid:"ideal_form"},
    {n:"Anello delle Forme",     i:"💎",r:"uncommon",s:{critChance:9},       sid:"ideal_form"},
    {n:"Sigillo dell'Eterno",    i:"♾", r:"rare",    s:{critChance:14,atk:5},sid:"ideal_form"},
    {n:"Occhio dell'Idea",       i:"👁",r:"legendary",s:{critChance:22,atk:10},sid:"ideal_form"},
    {n:"Anello Etico",           i:"⚖", r:"common",  s:{atk:3,def:3},       sid:"nicomachean"},
    {n:"Sigillo della Virtù",    i:"🌿",r:"uncommon",s:{atk:6,def:5},       sid:"nicomachean"},
    {n:"Anello Nicomacheo",      i:"📜",r:"rare",    s:{atk:10,def:9},      sid:"nicomachean"},
    {n:"Sigillo Aristotelico",   i:"🏺",r:"legendary",s:{atk:17,def:15},    sid:"nicomachean"},
    {n:"Anello Logico",          i:"🔬",r:"common",  s:{def:4,maxHp:20},    sid:"pure_logic"},
    {n:"Sigillo dell'Assioma",   i:"📐",r:"uncommon",s:{def:7,maxHp:40},    sid:"pure_logic"},
    {n:"Anello del Teorema",     i:"∞", r:"rare",    s:{def:12,maxHp:70},   sid:"pure_logic"},
    {n:"Sigillo Assoluto",       i:"🔭",r:"legendary",s:{def:20,maxHp:110}, sid:"pure_logic"},
    {n:"Anello di Fuoco",        i:"🔥",r:"common",  s:{critChance:6,atk:3},sid:"prometheus_fire"},
    {n:"Sigillo della Fiamma",   i:"💫",r:"uncommon",s:{critChance:11,atk:6},sid:"prometheus_fire"},
    {n:"Anello Olimpico",        i:"🌟",r:"rare",    s:{critChance:17,atk:10},sid:"prometheus_fire"},
    {n:"Fuoco Eterno",           i:"☄", r:"legendary",s:{critChance:26,atk:16},sid:"prometheus_fire"},
    {n:"Anello Celeste",         i:"⚡",r:"common",  s:{maxMp:20,mpRegen:1}, sid:"divine_wisdom"},
    {n:"Sigillo di Ermes",       i:"☁", r:"uncommon",s:{maxMp:35,mpRegen:2}, sid:"divine_wisdom"},
    {n:"Anello dell'Olimpo",     i:"🌩",r:"rare",    s:{maxMp:55,mpRegen:3}, sid:"divine_wisdom"},
    {n:"Sigillo degli Dei",      i:"✨",r:"legendary",s:{maxMp:88,mpRegen:5,atk:8},sid:"divine_wisdom"},
  ];
  const AM=[
    {n:"Amuleto Socratico",       i:"📿",r:"common",   s:{maxHp:22,atk:2},    sid:"socratic_order"},
    {n:"Medaglione del Filosofo", i:"🏺",r:"uncommon", s:{maxHp:45,atk:5},    sid:"socratic_order"},
    {n:"Ciondolo dell'Elenchos",  i:"🌀",r:"rare",     s:{maxHp:78,atk:9},    sid:"socratic_order"},
    {n:"Amuleto del Logos",       i:"✨",r:"legendary",s:{maxHp:125,atk:15},  sid:"socratic_order"},
    {n:"Amuleto Sofistico",       i:"🎭",r:"common",   s:{maxHp:35},           sid:"sophist_mask"},
    {n:"Collana del Retore",      i:"📿",r:"uncommon", s:{maxHp:70,mpRegen:1}, sid:"sophist_mask"},
    {n:"Amuleto dell'Illusione",  i:"🌫",r:"rare",     s:{maxHp:115,mpRegen:2},sid:"sophist_mask"},
    {n:"Cuore del Sofista",       i:"🖤",r:"legendary",s:{maxHp:185,mpRegen:4},sid:"sophist_mask"},
    {n:"Amuleto Accademico",      i:"📚",r:"common",   s:{maxMp:22,maxHp:18}, sid:"academy_mind"},
    {n:"Ciondolo di Platone",     i:"💫",r:"uncommon", s:{maxMp:38,maxHp:35}, sid:"academy_mind"},
    {n:"Amuleto della Mente",     i:"🧠",r:"rare",     s:{maxMp:60,maxHp:60}, sid:"academy_mind"},
    {n:"Cuore dell'Accademia",    i:"💙",r:"legendary",s:{maxMp:95,maxHp:95}, sid:"academy_mind"},
    {n:"Amuleto del Cristallo",   i:"💎",r:"common",   s:{critChance:4,maxHp:20},sid:"ideal_form"},
    {n:"Ciondolo Eterno",         i:"♾", r:"uncommon", s:{critChance:7,maxHp:40},sid:"ideal_form"},
    {n:"Amuleto dell'Idea",       i:"🌟",r:"rare",     s:{critChance:12,maxHp:68},sid:"ideal_form"},
    {n:"Cuore dell'Eterno",       i:"💛",r:"legendary",s:{critChance:20,maxHp:110},sid:"ideal_form"},
    {n:"Amuleto Etico",           i:"⚖", r:"common",   s:{atk:4,def:4},       sid:"nicomachean"},
    {n:"Ciondolo Aristotelico",   i:"🏺",r:"uncommon", s:{atk:7,def:7},       sid:"nicomachean"},
    {n:"Amuleto Nicomacheo",      i:"📜",r:"rare",     s:{atk:12,def:12},     sid:"nicomachean"},
    {n:"Cuore della Virtù",       i:"💚",r:"legendary",s:{atk:20,def:20},     sid:"nicomachean"},
    {n:"Amuleto Logico",          i:"🔬",r:"common",   s:{def:6,mpRegen:1},   sid:"pure_logic"},
    {n:"Ciondolo dell'Assioma",   i:"📐",r:"uncommon", s:{def:10,mpRegen:2,maxHp:25},sid:"pure_logic"},
    {n:"Amuleto del Teorema",     i:"∞", r:"rare",     s:{def:17,mpRegen:3,maxHp:50},sid:"pure_logic"},
    {n:"Cuore Logico",            i:"🤍",r:"legendary",s:{def:28,mpRegen:5,maxHp:80},sid:"pure_logic"},
    {n:"Amuleto di Prometeo",     i:"🔥",r:"common",   s:{critChance:7,atk:3},sid:"prometheus_fire"},
    {n:"Torcia dell'Olimpo",      i:"🕯",r:"uncommon", s:{critChance:12,atk:6},sid:"prometheus_fire"},
    {n:"Fiamma del Titano",       i:"🌋",r:"rare",     s:{critChance:18,atk:10},sid:"prometheus_fire"},
    {n:"Cuore di Fuoco",          i:"❤‍🔥",r:"legendary",s:{critChance:28,atk:17},sid:"prometheus_fire"},
    {n:"Amuleto Celeste",         i:"⭐",r:"common",   s:{maxMp:25,maxHp:20}, sid:"divine_wisdom"},
    {n:"Ciondolo di Apollo",      i:"🌞",r:"uncommon", s:{maxMp:42,maxHp:40,mpRegen:1},sid:"divine_wisdom"},
    {n:"Amuleto dell'Olimpo",     i:"🌟",r:"rare",     s:{maxMp:68,maxHp:65,mpRegen:2},sid:"divine_wisdom"},
    {n:"Cuore degli Dei",         i:"💜",r:"legendary",s:{maxMp:108,maxHp:105,mpRegen:4},sid:"divine_wisdom"},
  ];
  const B=[
    {n:"Sandali Socratici",       i:"👡",r:"common",   s:{def:2,critChance:2},          sid:"socratic_order"},
    {n:"Calzari del Filosofo",    i:"👟",r:"uncommon", s:{def:4,critChance:4},          sid:"socratic_order"},
    {n:"Sandali dell'Elenchos",   i:"🥿",r:"rare",     s:{def:7,critChance:7,atk:4},   sid:"socratic_order"},
    {n:"Stivali del Logos",       i:"🥾",r:"legendary",s:{def:12,critChance:12,atk:7}, sid:"socratic_order"},
    {n:"Sandali Sofistici",       i:"👡",r:"common",   s:{def:2,maxHp:22},              sid:"sophist_mask"},
    {n:"Calzari del Retore",      i:"👟",r:"uncommon", s:{def:4,maxHp:44},              sid:"sophist_mask"},
    {n:"Stivali dell'Illusione",  i:"🥿",r:"rare",     s:{def:7,maxHp:75},              sid:"sophist_mask"},
    {n:"Sandali del Mistero",     i:"🌫",r:"legendary",s:{def:11,maxHp:120},            sid:"sophist_mask"},
    {n:"Sandali Accademici",      i:"🎓",r:"common",   s:{def:2,maxMp:16},              sid:"academy_mind"},
    {n:"Calzari di Platone",      i:"👟",r:"uncommon", s:{def:4,maxMp:28},              sid:"academy_mind"},
    {n:"Sandali della Mente",     i:"🧠",r:"rare",     s:{def:7,maxMp:46,mpRegen:1},   sid:"academy_mind"},
    {n:"Stivali dell'Intelletto", i:"💙",r:"legendary",s:{def:11,maxMp:72,mpRegen:3},  sid:"academy_mind"},
    {n:"Sandali dell'Idea",       i:"💎",r:"common",   s:{def:2,critChance:4},          sid:"ideal_form"},
    {n:"Calzari Eterni",          i:"♾", r:"uncommon", s:{def:4,critChance:7},          sid:"ideal_form"},
    {n:"Sandali di Cristallo",    i:"💎",r:"rare",     s:{def:7,critChance:11,atk:3},  sid:"ideal_form"},
    {n:"Stivali della Forma",     i:"🌟",r:"legendary",s:{def:11,critChance:18,atk:6}, sid:"ideal_form"},
    {n:"Sandali Etici",           i:"⚖", r:"common",   s:{atk:3,def:3},                sid:"nicomachean"},
    {n:"Calzari della Virtù",     i:"🌿",r:"uncommon", s:{atk:5,def:5,maxHp:20},       sid:"nicomachean"},
    {n:"Stivali Nicomachei",      i:"📜",r:"rare",     s:{atk:9,def:9,maxHp:40},       sid:"nicomachean"},
    {n:"Sandali Aristotelici",    i:"🏺",r:"legendary",s:{atk:15,def:15,maxHp:65},     sid:"nicomachean"},
    {n:"Sandali Logici",          i:"🔬",r:"common",   s:{def:5,maxHp:18},              sid:"pure_logic"},
    {n:"Calzari dell'Assioma",    i:"📐",r:"uncommon", s:{def:9,maxHp:36},              sid:"pure_logic"},
    {n:"Stivali del Teorema",     i:"∞", r:"rare",     s:{def:15,maxHp:60,mpRegen:1},  sid:"pure_logic"},
    {n:"Sandali Assoluti",        i:"🔭",r:"legendary",s:{def:24,maxHp:100,mpRegen:3}, sid:"pure_logic"},
    {n:"Sandali di Prometeo",     i:"🔥",r:"common",   s:{critChance:6,def:2},          sid:"prometheus_fire"},
    {n:"Calzari della Fiamma",    i:"🕯",r:"uncommon", s:{critChance:10,def:4},         sid:"prometheus_fire"},
    {n:"Stivali Olimpici",        i:"⚡",r:"rare",     s:{critChance:16,def:7,atk:5},  sid:"prometheus_fire"},
    {n:"Sandali del Fuoco Eterno",i:"☄", r:"legendary",s:{critChance:25,def:11,atk:9}, sid:"prometheus_fire"},
    {n:"Sandali Celesti",         i:"☁", r:"common",   s:{maxMp:18,def:2},              sid:"divine_wisdom"},
    {n:"Calzari di Ermes",        i:"⚡",r:"uncommon", s:{maxMp:30,def:4,mpRegen:1},   sid:"divine_wisdom"},
    {n:"Stivali dell'Olimpo",     i:"🌩",r:"rare",     s:{maxMp:50,def:7,mpRegen:2},   sid:"divine_wisdom"},
    {n:"Sandali degli Dei",       i:"✨",r:"legendary",s:{maxMp:80,def:11,mpRegen:4},  sid:"divine_wisdom"},
  ];
  const norm=(arr,slot)=>arr.map(t=>({name:t.n,icon:t.i,rarity:t.r,stats:t.s,setId:t.sid,slot}));
  // ── Destruction & Elation set items ──────────────────────────
  const W2=[
    {n:"Lama della Ferita",     i:"🩸",r:"common",   s:{atk:6},                sid:"iron_will"},
    {n:"Spada del Dolore",      i:"💢",r:"uncommon", s:{atk:11,def:3},          sid:"iron_will"},
    {n:"Ascia della Rabbia",    i:"🪓",r:"rare",     s:{atk:18,def:6},          sid:"iron_will"},
    {n:"Lama Sanguinante",      i:"⚔", r:"legendary",s:{atk:30,def:10},         sid:"iron_will"},
    {n:"Frammento di Corona",   i:"👑",r:"common",   s:{atk:4,maxHp:20},        sid:"broken_crown"},
    {n:"Scudo Spezzato",        i:"🛡",r:"uncommon", s:{atk:8,maxHp:45},        sid:"broken_crown"},
    {n:"Lama del Martire",      i:"🗡",r:"rare",     s:{atk:14,maxHp:80},       sid:"broken_crown"},
    {n:"Corona Spezzata",       i:"👁‍🗨",r:"legendary",s:{atk:22,maxHp:130},     sid:"broken_crown"},
    {n:"Bacchetta del Giullare",i:"🎪",r:"common",   s:{atk:5,critChance:3},    sid:"jester_soul"},
    {n:"Tamburo Ridente",       i:"🥁",r:"uncommon", s:{atk:9,critChance:6},    sid:"jester_soul"},
    {n:"Tromba dell'Assurdo",   i:"🎺",r:"rare",     s:{atk:15,critChance:10},  sid:"jester_soul"},
    {n:"Microfono d'Oro",       i:"🎤",r:"legendary",s:{atk:25,critChance:16},  sid:"jester_soul"},
    {n:"Dado della Sorte",      i:"🎲",r:"common",   s:{atk:5,critChance:4},    sid:"crowd_pleaser"},
    {n:"Carta Selvaggia",       i:"🃏",r:"uncommon", s:{atk:10,critChance:8},   sid:"crowd_pleaser"},
    {n:"Maschera Ridente",      i:"😂",r:"rare",     s:{atk:16,critChance:13},  sid:"crowd_pleaser"},
    {n:"Stella dello Spettacolo",i:"⭐",r:"legendary",s:{atk:26,critChance:20}, sid:"crowd_pleaser"},
  ];
  const A2=[
    {n:"Armatura della Resistenza",i:"🛡",r:"common",  s:{def:5,maxHp:18},      sid:"iron_will"},
    {n:"Corazza del Ferito",    i:"💢",r:"uncommon", s:{def:9,maxHp:38},        sid:"iron_will"},
    {n:"Veste di Ferro",        i:"⛓",r:"rare",     s:{def:15,maxHp:65},       sid:"iron_will"},
    {n:"Armatura del Sopravvissuto",i:"🩸",r:"legendary",s:{def:24,maxHp:105},  sid:"iron_will"},
    {n:"Veste Spezzata",        i:"👁‍🗨",r:"common",   s:{def:4,maxHp:30},       sid:"broken_crown"},
    {n:"Armatura del Martire",  i:"⛓",r:"uncommon", s:{def:7,maxHp:65},        sid:"broken_crown"},
    {n:"Corazza Rovinata",      i:"🛡",r:"rare",     s:{def:12,maxHp:110},      sid:"broken_crown"},
    {n:"Veste del Re Caduto",   i:"👑",r:"legendary",s:{def:19,maxHp:175},      sid:"broken_crown"},
    {n:"Costume del Giullare",  i:"🎪",r:"common",   s:{def:3,critChance:4},    sid:"jester_soul"},
    {n:"Armatura Buffona",      i:"🤹",r:"uncommon", s:{def:6,critChance:7},    sid:"jester_soul"},
    {n:"Veste dell'Intrattenitore",i:"🎭",r:"rare",  s:{def:10,critChance:12},  sid:"jester_soul"},
    {n:"Abito da Palcoscenico", i:"🌟",r:"legendary",s:{def:16,critChance:19},  sid:"jester_soul"},
    {n:"Mantello del Pubblico", i:"🎭",r:"common",   s:{def:3,maxHp:25},        sid:"crowd_pleaser"},
    {n:"Corazza della Folla",   i:"🎪",r:"uncommon", s:{def:6,maxHp:55},        sid:"crowd_pleaser"},
    {n:"Armatura dell'Ovazione",i:"👏",r:"rare",     s:{def:10,maxHp:95},       sid:"crowd_pleaser"},
    {n:"Veste del Campione",    i:"🏆",r:"legendary",s:{def:16,maxHp:150},      sid:"crowd_pleaser"},
  ];
  const R2=[
    {n:"Anello della Cicatrice",i:"🩸",r:"common",   s:{atk:4,maxHp:18},       sid:"iron_will"},
    {n:"Sigillo del Guerriero", i:"💢",r:"uncommon", s:{atk:7,maxHp:38},        sid:"iron_will"},
    {n:"Anello del Sopravvissuto",i:"⚔",r:"rare",   s:{atk:12,maxHp:65},       sid:"iron_will"},
    {n:"Sigillo di Ferro",      i:"🛡",r:"legendary",s:{atk:20,maxHp:105},      sid:"iron_will"},
    {n:"Anello Spezzato",       i:"👁‍🗨",r:"common",  s:{def:4,maxHp:28},        sid:"broken_crown"},
    {n:"Sigillo del Caduto",    i:"👑",r:"uncommon", s:{def:8,maxHp:60},        sid:"broken_crown"},
    {n:"Anello della Rovina",   i:"💀",r:"rare",     s:{def:13,maxHp:100},      sid:"broken_crown"},
    {n:"Sigillo della Corona",  i:"⛓",r:"legendary",s:{def:21,maxHp:160},      sid:"broken_crown"},
    {n:"Anello del Giullare",   i:"🎪",r:"common",   s:{critChance:6,atk:2},    sid:"jester_soul"},
    {n:"Sigillo Burlone",       i:"🃏",r:"uncommon", s:{critChance:11,atk:5},   sid:"jester_soul"},
    {n:"Anello dell'Assurdo",   i:"🎭",r:"rare",     s:{critChance:17,atk:8},   sid:"jester_soul"},
    {n:"Occhio del Palcoscenico",i:"👁",r:"legendary",s:{critChance:26,atk:13}, sid:"jester_soul"},
    {n:"Anello della Platea",   i:"🎲",r:"common",   s:{critChance:7,atk:2},    sid:"crowd_pleaser"},
    {n:"Sigillo dell'Applauso", i:"👏",r:"uncommon", s:{critChance:12,atk:5},   sid:"crowd_pleaser"},
    {n:"Anello del Bis",        i:"🌟",r:"rare",     s:{critChance:18,atk:9},   sid:"crowd_pleaser"},
    {n:"Sigillo della Star",    i:"⭐",r:"legendary",s:{critChance:28,atk:14},  sid:"crowd_pleaser"},
  ];
  const AM2=[
    {n:"Amuleto del Dolore",    i:"🩸",r:"common",   s:{atk:5,maxHp:20},        sid:"iron_will"},
    {n:"Ciondolo della Rabbia", i:"💢",r:"uncommon", s:{atk:9,maxHp:42},        sid:"iron_will"},
    {n:"Amuleto di Ferro",      i:"⚔", r:"rare",     s:{atk:15,maxHp:72},       sid:"iron_will"},
    {n:"Cuore di Ferro",        i:"❤",r:"legendary",s:{atk:24,maxHp:115},       sid:"iron_will"},
    {n:"Amuleto Spezzato",      i:"👑",r:"common",   s:{def:5,maxHp:28},        sid:"broken_crown"},
    {n:"Corona in Frantumi",    i:"👁‍🗨",r:"uncommon",s:{def:9,maxHp:60},        sid:"broken_crown"},
    {n:"Amuleto del Re Caduto", i:"⛓",r:"rare",     s:{def:15,maxHp:105},       sid:"broken_crown"},
    {n:"Cuore Spezzato",        i:"💔",r:"legendary",s:{def:24,maxHp:165},       sid:"broken_crown"},
    {n:"Amuleto del Riso",      i:"😂",r:"common",   s:{critChance:5,atk:3},    sid:"jester_soul"},
    {n:"Mascherina Ridente",    i:"🎭",r:"uncommon", s:{critChance:9,atk:6},    sid:"jester_soul"},
    {n:"Amuleto della Commedia",i:"🎪",r:"rare",     s:{critChance:14,atk:10},  sid:"jester_soul"},
    {n:"Cuore del Giullare",    i:"🤹",r:"legendary",s:{critChance:22,atk:16},  sid:"jester_soul"},
    {n:"Amuleto della Folla",   i:"👏",r:"common",   s:{critChance:5,maxHp:22}, sid:"crowd_pleaser"},
    {n:"Biglietto d'Oro",       i:"🎟",r:"uncommon", s:{critChance:9,maxHp:48}, sid:"crowd_pleaser"},
    {n:"Amuleto dell'Ovazione", i:"🌟",r:"rare",     s:{critChance:15,maxHp:82},sid:"crowd_pleaser"},
    {n:"Cuore della Folla",     i:"💛",r:"legendary",s:{critChance:24,maxHp:130},sid:"crowd_pleaser"},
  ];
  const B2=[
    {n:"Stivali del Ferito",    i:"🩸",r:"common",   s:{def:3,maxHp:18},        sid:"iron_will"},
    {n:"Calzari della Resistenza",i:"💢",r:"uncommon",s:{def:6,maxHp:38},       sid:"iron_will"},
    {n:"Stivali dell'Acciaio",  i:"⛓",r:"rare",     s:{def:10,maxHp:65,atk:5}, sid:"iron_will"},
    {n:"Sandali del Guerriero", i:"🥾",r:"legendary",s:{def:16,maxHp:105,atk:9},sid:"iron_will"},
    {n:"Sandali Spezzati",      i:"👡",r:"common",   s:{def:3,maxHp:26},        sid:"broken_crown"},
    {n:"Calzari del Martire",   i:"👟",r:"uncommon", s:{def:6,maxHp:55},        sid:"broken_crown"},
    {n:"Stivali della Rovina",  i:"🥿",r:"rare",     s:{def:10,maxHp:95},       sid:"broken_crown"},
    {n:"Sandali del Re Caduto", i:"🥾",r:"legendary",s:{def:16,maxHp:150},      sid:"broken_crown"},
    {n:"Scarpe del Giullare",   i:"🎪",r:"common",   s:{critChance:5,def:2},    sid:"jester_soul"},
    {n:"Calzari Burloni",       i:"🤹",r:"uncommon", s:{critChance:9,def:4},    sid:"jester_soul"},
    {n:"Stivali del Buffone",   i:"🎭",r:"rare",     s:{critChance:14,def:7,atk:4},sid:"jester_soul"},
    {n:"Sandali del Palcoscenico",i:"🌟",r:"legendary",s:{critChance:22,def:11,atk:8},sid:"jester_soul"},
    {n:"Scarpe della Platea",   i:"👟",r:"common",   s:{critChance:5,def:2},    sid:"crowd_pleaser"},
    {n:"Calzari dell'Applauso", i:"👏",r:"uncommon", s:{critChance:9,def:4},    sid:"crowd_pleaser"},
    {n:"Stivali dello Spettacolo",i:"🎟",r:"rare",   s:{critChance:15,def:7},   sid:"crowd_pleaser"},
    {n:"Sandali della Star",    i:"⭐",r:"legendary",s:{critChance:24,def:11,atk:6},sid:"crowd_pleaser"},
  ];
  return{
    weapon:[...norm(W,'weapon'),...norm(W2,'weapon')],
    armor:[...norm(A,'armor'),...norm(A2,'armor')],
    ring:[...norm(R,'ring'),...norm(R2,'ring')],
    amulet:[...norm(AM,'amulet'),...norm(AM2,'amulet')],
    boots:[...norm(B,'boots'),...norm(B2,'boots')],
  };
}

// ── GAME STATE ───────────────────────────────────────────────
function defaultState(){
  return{
    floor:1,wisdom:0,totalKills:0,prestige:0,prestigeBonus:1,wisdomMult:1,
    domainActive:false,domainId:null,domainEnemy:1,domainLoot:[],
    battleOver:false,playerTurn:true,
    autoMode:false,autoTimer:null,
    cooldowns:[0,0,0,0,0],playerStatuses:[],enemyStatuses:[],
    upgradeMults:{atk:1.0,maxHp:1.0,def:1.0,maxMp:1.0,critDmg:1.0},
    upgradeLevels:{dialectics:0,virtue:0,temperance:0,logos:0,insight:0,wisdom_gain:0},
    playerName:'Socrate',
    player:{hp:100,baseMaxHp:100,mp:60,baseMaxMp:60,baseMpRegen:3,baseAtk:10,baseDef:2,baseCritChance:5,baseCritDmg:200},
    enemy:{name:'',hp:80,maxHp:80,atk:8,def:0},
    inventory:[],
    equipped:{weapon:null,armor:null,ring:null,amulet:null,boots:null},
    nextItemId:1,invFilter:'all',
    blessingTokens:0,
    blessingCollection:[],
    equippedBlessings:[null,null,null,null,null,null],
    logosSpentBattle:0,firstSkillUsed:false,firstHitNegated:false,
    isBossFight:false,bossDoubleAttack:0,
    punchline:0,bloodSteelCharged:false,phoenixRageUsed:false,woundedFuryStacks:0,
    lastStandUsed:false,brokenCrownDmgAccum:0,brokenCrownAtkBonus:0,
  };
}
let G=defaultState();

// ── SAVE / LOAD ──────────────────────────────────────────────
const SAVE_KEY='sokrates_save_v6';
let _saveTimer=null;

function saveGame(){
  const s={
    floor:G.floor,wisdom:G.wisdom,totalKills:G.totalKills,
    prestige:G.prestige,prestigeBonus:G.prestigeBonus,wisdomMult:G.wisdomMult,
    domainActive:G.domainActive,domainId:G.domainId,domainEnemy:G.domainEnemy,
    upgradeMults:G.upgradeMults,upgradeLevels:G.upgradeLevels,playerName:G.playerName,
    player:{...G.player},inventory:G.inventory,equipped:G.equipped,nextItemId:G.nextItemId,
    invFilter:G.invFilter,blessingTokens:G.blessingTokens,
    blessingCollection:G.blessingCollection,equippedBlessings:G.equippedBlessings,
  };
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));flashSaveBadge();}
  catch(e){console.warn('Save failed:',e);}
}
function loadGame(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw)return false;
    const saved=JSON.parse(raw);
    Object.assign(G,saved);
    Object.keys(G.equipped).forEach(slot=>{
      const eq=G.equipped[slot];
      if(eq){
        const found=G.inventory.find(i=>i.id===eq.id);
        if(found){found.equipped=true;G.equipped[slot]=found;}
        else G.equipped[slot]=null;
      }
    });
    if(!G.upgradeMults)G.upgradeMults={atk:1.0,maxHp:1.0,def:1.0,maxMp:1.0,critDmg:1.0};
    if(!G.blessingCollection)G.blessingCollection=[];
    if(!G.equippedBlessings)G.equippedBlessings=[null,null,null,null,null,null];
    if(G.blessingTokens==null)G.blessingTokens=0;
    G.battleOver=false;G.playerTurn=true;G.cooldowns=[0,0,0,0,0];
    G.playerStatuses=[];G.enemyStatuses=[];G.autoMode=false;G.autoTimer=null;
    G.domainActive=false;G.domainId=null;G.domainEnemy=1;G.domainLoot=[];
    G.logosSpentBattle=0;G.firstSkillUsed=false;G.firstHitNegated=false;
    G.isBossFight=false;G.bossDoubleAttack=0;G.pendingBossDebuff=null;
    G.punchline=G.punchline||0;G.bloodSteelCharged=false;G.phoenixRageUsed=false;
    G.lastStandUsed=false;G.brokenCrownDmgAccum=G.brokenCrownDmgAccum||0;
    G.brokenCrownAtkBonus=G.brokenCrownAtkBonus||0;
    return true;
  }catch(e){console.warn('Load failed:',e);return false;}
}
function scheduleSave(){clearTimeout(_saveTimer);_saveTimer=setTimeout(saveGame,1500);}
function flashSaveBadge(){
  const b=document.getElementById('save-badge');if(!b)return;
  b.classList.add('visible');clearTimeout(b._timer);
  b._timer=setTimeout(()=>b.classList.remove('visible'),2000);
}
function resetSave(){
  if(!confirm('Cancellare tutti i progressi? Azione irreversibile.'))return;
  localStorage.removeItem(SAVE_KEY);stopAuto();G=defaultState();
  spawnTowerEnemy();updateUI();renderUpgrades();renderEquip();
  renderInventory();renderDomains();renderBlessings();
  document.getElementById('btn-next').style.display='none';
  document.getElementById('btn-attack').disabled=false;
  document.getElementById('btn-exit-domain').style.display='none';
  document.getElementById('domain-progress').style.display='none';
  addLog('✦ Reset effettuato. Il cammino ricomincia.','system');
}

// ── PRESTIGE FORMULA ─────────────────────────────────────────
function prestigeRequiredFloor(){return 20+G.prestige*2;}

// ── IS BOSS FLOOR ─────────────────────────────────────────────
function isBossFloor(floor){return floor>0&&floor%5===0;}

// ── STATS ─────────────────────────────────────────────────────
function computeStats(){
  const p=G.player;
  let atk=p.baseAtk,def=p.baseDef,maxHp=p.baseMaxHp,
      critChance=p.baseCritChance,maxMp=p.baseMaxMp,
      mpRegen=p.baseMpRegen,critDmg=p.baseCritDmg||200;
  Object.values(G.equipped).forEach(item=>{
    if(!item)return;
    if(item.stats.atk)       atk       +=item.stats.atk;
    if(item.stats.def)       def       +=item.stats.def;
    if(item.stats.maxHp)     maxHp     +=item.stats.maxHp;
    if(item.stats.critChance)critChance+=item.stats.critChance;
    if(item.stats.maxMp)     maxMp     +=item.stats.maxMp;
    if(item.stats.mpRegen)   mpRegen   +=item.stats.mpRegen;
    if(item.stats.critDmg)   critDmg   +=item.stats.critDmg;
  });
  const um=G.upgradeMults;
  atk    =Math.round(atk    *um.atk);
  def    =Math.round(def    *um.def);
  maxHp  =Math.round(maxHp  *um.maxHp);
  maxMp  =Math.round(maxMp  *um.maxMp);
  critDmg=Math.round(critDmg*um.critDmg);
  const counts=getSetCounts();
  Object.entries(counts).forEach(([sid,cnt])=>{
    if(cnt<2)return;
    const b=SETS[sid].bonus2;
    if(b.atkPct)       atk       =Math.round(atk       *(1+b.atkPct));
    if(b.defPct)       def       =Math.round((def||1)  *(1+b.defPct));
    if(b.maxHpPct)     maxHp     =Math.round(maxHp     *(1+b.maxHpPct));
    if(b.critChancePct)critChance=Math.round(critChance*(1+b.critChancePct));
    if(b.maxMpPct)     maxMp     =Math.round(maxMp     *(1+b.maxMpPct));
    if(b.critDmgFlat)  critDmg  +=b.critDmgFlat;
  });
  const bf=getBlessingStats();
  if(bf.atkPct)       atk       =Math.round(atk       *(1+bf.atkPct));
  if(bf.defPct)       def       =Math.round((def||1)  *(1+bf.defPct));
  if(bf.maxHpPct)     maxHp     =Math.round(maxHp     *(1+bf.maxHpPct));
  if(bf.critChancePct)critChance=Math.round(critChance*(1+bf.critChancePct));
  if(bf.critDmgPct)   critDmg   =Math.round(critDmg   *(1+bf.critDmgPct));
  if(bf.maxMpFlat)    maxMp    +=bf.maxMpFlat;
  if(bf.mpRegenFlat)  mpRegen  +=bf.mpRegenFlat;
  if(bf.mpRegenMult)  mpRegen   =Math.round(mpRegen*bf.mpRegenMult);
  if(hasBlessing('preservation_4'))atk=Math.round(atk*(1+Math.floor(def/5)*0.01));
  if(hasBlessing('preservation_3')&&maxHp>0&&p.hp/maxHp<0.30)def=Math.round(def*2);
  // ── Destruction: wounded rage — ogni 10% HP mancanti = +10% ATK ──
  if(hasBlessing('destruction_1')&&maxHp>0){
    const missingPct=Math.max(0,1-(p.hp/maxHp));
    const rageMult=Math.min(0.90,Math.floor(missingPct/0.10)*0.10);
    if(rageMult>0)atk=Math.round(atk*(1+rageMult));
  }
  // broken_crown: accumulated ATK bonus from damage taken
  if(G.brokenCrownAtkBonus>0)atk=Math.round(atk*(1+Math.min(1.0,G.brokenCrownAtkBonus)));
  // iron_will 2pc: ogni 10% HP persi = +8% danno
  const counts2=getSetCounts();
  if((counts2['iron_will']||0)>=2&&maxHp>0){
    const missingPct=Math.max(0,1-(p.hp/maxHp));
    const bonus=Math.min(0.80,Math.floor(missingPct/0.10)*0.08);
    if(bonus>0)atk=Math.round(atk*(1+bonus));
  }
  // apply player status modifiers
  const weakDebuff=G.playerStatuses.find(s=>s.type==='debuff');
  if(weakDebuff)atk=Math.round(atk*(weakDebuff.atkMult||1));
  const blindStatus=G.playerStatuses.find(s=>s.type==='blind');
  if(blindStatus)critChance=0;
  const corrodeStatus=G.playerStatuses.find(s=>s.type==='corrode');
  if(corrodeStatus)def=0;
  critChance=Math.min(critChance,100);
  // ── Punchline damage stat (ATK equivalent used by Catarsi) ──
  // Base punchlineDmg = ATK, boosted by crowd_pleaser 2pc
  const punchlineDmg=Math.round(atk*(1+getPunchlineDmgBonus()));
  return{atk,def,maxHp,critChance,maxMp,mpRegen,critDmg,punchlineDmg};
}

function getSetCounts(){
  const c={};
  Object.values(G.equipped).forEach(i=>{if(!i||!i.setId)return;c[i.setId]=(c[i.setId]||0)+1;});
  return c;
}
function getActiveBonus4Specials(){
  const counts=getSetCounts(),sp=new Set();
  Object.entries(counts).forEach(([sid,cnt])=>{if(cnt>=4&&SETS[sid].bonus4special)sp.add(SETS[sid].bonus4special);});
  return sp;
}
function getWisdomBonus(){
  const counts=getSetCounts();let m=1;
  Object.entries(counts).forEach(([sid,cnt])=>{if(cnt>=2&&SETS[sid].bonus2.wisdomPct)m+=SETS[sid].bonus2.wisdomPct*(cnt>=4?2:1);});
  return m;
}

// ── DOMINANT SET DETECTION (for smart auto) ──────────────────
function getDominantSetId(){
  const counts=getSetCounts();
  let best=null,bestCnt=0;
  Object.entries(counts).forEach(([sid,cnt])=>{if(cnt>bestCnt){bestCnt=cnt;best=sid;}});
  return best;
}

// ── ELATION SYSTEM HELPERS ───────────────────────────────────
function elationBlessingCount(){
  return G.equippedBlessings.filter(id=>id&&BLESSINGS[id]&&BLESSINGS[id].path==='Elation').length;
}
function elationActive(){return elationBlessingCount()>=2;}
function getPunchlineDmgBonus(){
  // from set 2pc crowd_pleaser
  const counts=getSetCounts();let bonus=0;
  if((counts['crowd_pleaser']||0)>=2)bonus+=SETS['crowd_pleaser'].bonus2.punchlineDmgPct||0;
  return bonus;
}

// ── SET STRATEGY for auto ─────────────────────────────────────
// Returns priority order [skillIdx...] for the given set
function getAutoStrategy(){
  const dom=getDominantSetId();
  const st=computeStats();
  const sp=getActiveBonus4Specials();
  const needsHeal=G.player.hp<st.maxHp*0.45;
  const hasEironeia=!G.enemyStatuses.find(s=>s.type==='debuff');

  // Default fallback
  const defaultStrat=()=>{
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;       // Aporia
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1; // Maieutica
    if(G.player.mp>=25&&G.cooldowns[2]===0)return 2;       // Eironeia
    return 0; // Elenchos
  };

  if(!dom)return defaultStrat();

  // sophist_mask: healing/tank set — prioritize Maieutica, keep enemy debuffed
  if(dom==='sophist_mask'){
    if(G.player.mp>=20&&G.cooldowns[1]===0&&G.player.hp<st.maxHp*0.70)return 1;
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2;
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    return 0;
  }
  // academy_mind: Eironeia for long debuff, then Aporia for MP scaling
  if(dom==='academy_mind'){
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2; // debuff ASAP
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    return 0;
  }
  // ideal_form / prometheus_fire: crit DPS — Elenchos spam + Aporia
  if(dom==='ideal_form'||dom==='prometheus_fire'){
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    return 0; // spam Elenchos for double hit / crits
  }
  // nicomachean: Eironeia for Arcana DOT, then Aporia
  if(dom==='nicomachean'){
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2; // apply Arcana
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    return 0;
  }
  // pure_logic: survive — heal often, let counter-dmg proc
  if(dom==='pure_logic'){
    if(G.player.mp>=20&&G.cooldowns[1]===0&&G.player.hp<st.maxHp*0.80)return 1;
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2;
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    return 0;
  }
  // socratic_order: Aporia with boost
  if(dom==='socratic_order'){
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2;
    return 0;
  }
  // divine_wisdom: Logos regen focus — Aporia for MP scaling
  if(dom==='divine_wisdom'){
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2;
    return 0;
  }
  // iron_will: berserk — spam Elenchos (more dmg the lower hp), use Maieutica only if critical
  if(dom==='iron_will'){
    if(G.player.hp<st.maxHp*0.25&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    return 0; // stay low HP for rage bonus
  }
  // broken_crown: survive and accumulate dmg stacks — heal often
  if(dom==='broken_crown'){
    if(G.player.mp>=20&&G.cooldowns[1]===0&&G.player.hp<st.maxHp*0.80)return 1;
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2;
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3;
    return 0;
  }
  // jester_soul / crowd_pleaser: Catarsi priority when punchline stacked
  if(dom==='jester_soul'||dom==='crowd_pleaser'){
    if(elationActive()&&G.punchline>=60&&G.cooldowns[4]===0)return 4; // Catarsi
    if(G.player.mp>=40&&G.cooldowns[3]===0)return 3; // build punchline fast
    if(needsHeal&&G.player.mp>=20&&G.cooldowns[1]===0)return 1;
    if(hasEironeia&&G.player.mp>=25&&G.cooldowns[2]===0)return 2;
    return 0;
  }

  return defaultStrat();
}

// ── BLESSING HELPERS ─────────────────────────────────────────
function hasBlessing(id){return G.equippedBlessings.includes(id);}
function getBlessingStats(){
  const out={};
  G.equippedBlessings.forEach(id=>{
    if(!id)return;
    const b=BLESSINGS[id];if(!b)return;
    Object.entries(b.stats).forEach(([k,v])=>{out[k]=(out[k]||0)+v;});
  });
  return out;
}
function getBlessingFlags(){
  const f=new Set();
  G.equippedBlessings.forEach(id=>{if(!id)return;const b=BLESSINGS[id];if(b)b.flags.forEach(fl=>f.add(fl));});
  return f;
}

// ── ITEM MANAGEMENT ──────────────────────────────────────────
function makeItem(domainId=null){
  const r=Math.random();let rarity;
  if(domainId){if(r<.06)rarity='legendary';else if(r<.22)rarity='rare';else if(r<.55)rarity='uncommon';else rarity='common';}
  else{if(r<.03)rarity='legendary';else if(r<.13)rarity='rare';else if(r<.38)rarity='uncommon';else rarity='common';}
  // Boss floors slightly better loot
  if(G.isBossFight&&!domainId){
    const rb=Math.random();
    if(rb<.08)rarity='legendary';else if(rb<.25)rarity='rare';else if(rb<.50)rarity='uncommon';else rarity='common';
  }
  const slots=Object.keys(SLOT_ICONS),slot=slots[Math.floor(Math.random()*slots.length)];
  let pool;
  if(domainId){
    const dom=DOMAINS.find(d=>d.id===domainId);
    pool=ITEMS_DB[slot].filter(t=>dom.sets.includes(t.setId)&&t.rarity===rarity);
    if(!pool.length)pool=ITEMS_DB[slot].filter(t=>dom.sets.includes(t.setId));
  }else{
    pool=ITEMS_DB[slot].filter(t=>t.rarity===rarity);
    if(!pool.length)pool=ITEMS_DB[slot];
  }
  const base=pool[Math.floor(Math.random()*pool.length)];
  const refFloor=G.domainActive?(G.floor+DOMAINS.find(d=>d.id===G.domainId).scaleMult*10):G.floor;
  const scale=1+Math.max(0,refFloor-1)*0.05;
  const ss={};Object.entries(base.stats).forEach(([k,v])=>{ss[k]=Math.round(v*scale);});
  return{id:G.nextItemId++,slot,name:base.name,icon:base.icon,rarity:base.rarity,stats:ss,setId:base.setId,equipped:false};
}
function addToInventory(item){
  if(G.inventory.length>=30){const idx=G.inventory.findIndex(i=>!i.equipped);if(idx>=0)G.inventory.splice(idx,1);else return false;}
  G.inventory.push(item);return true;
}
function equipItem(itemId){
  const item=G.inventory.find(i=>i.id===itemId);if(!item)return;
  if(G.equipped[item.slot])G.equipped[item.slot].equipped=false;
  item.equipped=true;G.equipped[item.slot]=item;
  const st=computeStats();G.player.hp=Math.min(G.player.hp,st.maxHp);G.player.mp=Math.min(G.player.mp,st.maxMp);
  addLog(`Equipaggiato: <b>${item.name}</b> [${SETS[item.setId].name}]`,'item');
  checkSetMessages();renderEquip();renderInventory();updateUI();scheduleSave();
}
function unequipItem(slot){
  if(!G.equipped[slot])return;
  G.equipped[slot].equipped=false;G.equipped[slot]=null;
  renderEquip();renderInventory();updateUI();scheduleSave();
}
function sellItem(itemId){
  const item=G.inventory.find(i=>i.id===itemId);if(!item||item.equipped)return;
  G.wisdom+=SELL_PRICES[item.rarity];G.inventory=G.inventory.filter(i=>i.id!==itemId);
  addLog(`Venduto: <b>${item.name}</b> per ${SELL_PRICES[item.rarity]} Saggezza.`,'sell');
  updateUI();renderInventory();renderUpgrades();scheduleSave();
}
function sellAll(){
  const toSell=G.inventory.filter(i=>!i.equipped&&(i.rarity==='common'||i.rarity==='uncommon'));
  if(!toSell.length){addLog('Niente da vendere.','system');return;}
  let total=0;toSell.forEach(i=>total+=SELL_PRICES[i.rarity]);
  G.inventory=G.inventory.filter(i=>i.equipped||(i.rarity!=='common'&&i.rarity!=='uncommon'));
  G.wisdom+=total;addLog(`Venduti ${toSell.length} oggetti per <b>${total}</b> Saggezza.`,'sell');
  updateUI();renderInventory();renderUpgrades();scheduleSave();
}
function setFilter(btn,f){
  G.invFilter=f;document.querySelectorAll('.inv-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');renderInventory();
}
function checkSetMessages(){
  const counts=getSetCounts();
  Object.entries(counts).forEach(([sid,cnt])=>{
    const s=SETS[sid];
    if(cnt===2)addLog(`✦ Set 2pc: <b>${s.name}</b> — ${s.desc2}`,'set');
    if(cnt===4)addLog(`⚡ Set 4pc: <b>${s.name}</b> — ${s.desc4}`,'set');
  });
}

// ── BLESSING MANAGEMENT ──────────────────────────────────────

// Get all blessing IDs currently owned (equipped + collection)
function ownedBlessingIds(){
  const owned=new Set();
  G.equippedBlessings.forEach(id=>{if(id)owned.add(id);});
  G.blessingCollection.forEach(id=>owned.add(id));
  return owned;
}

function rollBlessing(){
  if(G.blessingTokens<1){addLog('Nessun Token Rinascita!','system');return;}
  G.blessingTokens--;
  const owned=ownedBlessingIds();
  const available=BLESSING_IDS.filter(id=>!owned.has(id));
  if(!available.length){
    // all blessings already owned — refund token
    G.blessingTokens++;
    addLog('⚡ Hai già tutte le Blessing! Token rimborsato.','system');
    renderBlessings();updateUI();scheduleSave();
    return;
  }
  const id=available[Math.floor(Math.random()*available.length)];
  G.blessingCollection.push(id);
  const b=BLESSINGS[id],path=BLESSING_PATHS[b.path];
  addLog(`✦ Roll: <b>${b.name}</b> [${path.icon} ${b.path}] — Nuova!`,'item');
  renderBlessings();updateUI();scheduleSave();
}
function equipBlessing(collIdx){
  const slot=G.equippedBlessings.findIndex(s=>s===null);
  if(slot===-1){addLog('Tutti i 6 slot Blessing sono pieni.','system');return;}
  const id=G.blessingCollection[collIdx];
  G.equippedBlessings[slot]=id;G.blessingCollection.splice(collIdx,1);
  addLog(`Blessing equipaggiata: <b>${BLESSINGS[id].name}</b> (slot ${slot+1})`,'item');
  renderBlessings();updateUI();scheduleSave();
}
function unequipBlessing(slot){
  const id=G.equippedBlessings[slot];if(!id)return;
  G.equippedBlessings[slot]=null;G.blessingCollection.push(id);
  addLog(`Blessing rimossa dallo slot ${slot+1}.`,'system');
  renderBlessings();updateUI();scheduleSave();
}

// ── DOMAIN FLOW ──────────────────────────────────────────────
function enterDomain(domainId){
  if(G.domainActive){addLog('Esci prima dal dominio attuale!','system');return;}
  if(G.wisdom<DOMAIN_COST){addLog(`Servono ${DOMAIN_COST} Saggezza.`,'system');return;}
  G.wisdom-=DOMAIN_COST;G.domainActive=true;G.domainId=domainId;G.domainEnemy=1;G.domainLoot=[];
  G.battleOver=false;G.playerTurn=true;G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
  G.logosSpentBattle=0;G.firstSkillUsed=false;G.firstHitNegated=false;G.isBossFight=false;
  G.bloodSteelCharged=false;G.phoenixRageUsed=false;G.lastStandUsed=false;G.punchline=0;
  addLog(`✦ Dominio: <b>${DOMAINS.find(d=>d.id===domainId).name}</b>! 5 nemici.`,'domain');
  spawnDomainEnemy();
  document.getElementById('btn-exit-domain').style.display='inline-block';
  document.getElementById('btn-attack').disabled=false;
  document.getElementById('btn-next').style.display='none';
  updateUI();updateDomainProgress();renderDomains();scheduleSave();
}
function exitDomain(){
  if(!G.domainActive)return;
  G.domainActive=false;G.domainId=null;G.domainEnemy=1;G.domainLoot=[];
  G.battleOver=false;G.playerTurn=true;G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
  G.isBossFight=false;G.bossDoubleAttack=0;G.bloodSteelCharged=false;
  G.phoenixRageUsed=false;G.lastStandUsed=false;G.punchline=0;
  addLog('Uscito dal Dominio.','system');
  document.getElementById('btn-exit-domain').style.display='none';
  document.getElementById('domain-progress').style.display='none';
  stopAuto();spawnTowerEnemy();document.getElementById('btn-attack').disabled=false;
  document.getElementById('btn-next').style.display='none';
  updateUI();renderDomains();scheduleSave();
}
function spawnDomainEnemy(){
  const dom=DOMAINS.find(d=>d.id===G.domainId);
  const base=DOMAIN_ENEMIES[dom.enemyKey][G.domainEnemy-1];
  const scale=Math.pow(1.18,G.floor)*dom.scaleMult;
  G.enemy={name:base.name,title:base.title,
    hp:Math.floor(80*scale),maxHp:Math.floor(80*scale),
    atk:Math.floor(8*Math.pow(1.12,G.floor)*dom.scaleMult*0.7),
    def:Math.floor(G.floor*0.6*dom.scaleMult)};
  document.getElementById('enemy-name').textContent=base.icon+' '+base.name;
  document.getElementById('enemy-title').textContent=base.title;
  document.getElementById('enemy-card').classList.add('domain-enemy');
  document.getElementById('enemy-card').classList.remove('boss-enemy');
  document.getElementById('arena-location').innerHTML=`<span style="color:${dom.color}">${dom.icon} ${dom.name}</span>`;
  document.getElementById('domain-progress').style.display='flex';
  updateDomainProgress();
}
function updateDomainProgress(){
  if(!G.domainActive)return;
  const dom=DOMAINS.find(d=>d.id===G.domainId);
  for(let i=0;i<5;i++){
    const el=document.getElementById('ds'+i),n=i+1;
    el.className='domain-step '+(n<G.domainEnemy?'done':n===G.domainEnemy?'current':'pending');
    if(n<=G.domainEnemy){el.style.background=dom.color;el.style.borderColor=dom.color;}
    else{el.style.background='';el.style.borderColor='';}
  }
  document.getElementById('domain-enemy-label').textContent=`Nemico ${G.domainEnemy}/5`;
}

// ── BOSS SPAWN ────────────────────────────────────────────────
function spawnBossEnemy(){
  G.isBossFight=true;G.bossDoubleAttack=0;
  const base=BOSSES[Math.floor(Math.random()*BOSSES.length)];
  const scale=Math.pow(1.22,G.floor); // boss is stronger
  G.enemy={
    name:base.name,title:base.title,
    hp:Math.floor(120*scale),maxHp:Math.floor(120*scale),
    atk:Math.floor(10*Math.pow(1.15,G.floor)),
    def:Math.floor(G.floor*0.8),
    isBoss:true,
  };
  document.getElementById('enemy-name').textContent=base.icon+' '+base.name;
  document.getElementById('enemy-title').textContent=base.title;
  document.getElementById('enemy-card').classList.remove('domain-enemy');
  document.getElementById('enemy-card').classList.add('boss-enemy');
  document.getElementById('arena-location').innerHTML=`<span style="color:#e8a030">⚡ BOSS — Piano ${G.floor}</span>`;
  document.getElementById('domain-progress').style.display='none';
  // Pick a random boss debuff and announce it
  const debuff=BOSS_DEBUFFS[Math.floor(Math.random()*BOSS_DEBUFFS.length)];
  G.pendingBossDebuff=debuff;
  addLog(`⚡ <b>BOSS APPARE!</b> ${base.icon} ${base.name}!`,'crit');
  addLog(`💀 Abilità Boss: <b>${debuff.name}</b> — ${debuff.desc}`,'enemy');
}

// ── COMBAT ───────────────────────────────────────────────────
function applyHeal(amount){
  const st=computeStats(),bf=getBlessingFlags(),bs=getBlessingStats();
  // Check if cursed (heal reduction)
  const curse=G.playerStatuses.find(s=>s.type==='curse');
  const curseMult=curse?(curse.healMult||1):1;
  const healed=Math.round(amount*(1+(bs.healBoostPct||0))*curseMult);
  G.player.hp=Math.min(G.player.hp+healed,st.maxHp);
  showHealPop('player-card',healed);
  if(bf.has('healDamage')){
    const dmg=Math.max(1,Math.round(healed*0.20));
    dealDamageToEnemy(dmg,false);
    addLog(`Contraccolpo Curativo: ${dmg} danni riflessi.`,'set');
  }
  return healed;
}

function getSkillCooldowns(){
  const cds=[0,3,4,5,4]; // 4 = Catarsi CD
  if(hasBlessing('abundance_1'))cds[1]=Math.max(1,cds[1]-1);
  return cds;
}

const SKILLS=[
  {name:'Elenchos',cost:0,cd:0,
   use(g){
     const st=computeStats(),sp=getActiveBonus4Specials(),bf=getBlessingFlags();
     const hits=sp.has('elenchosDouble')?2:1;
     const firstBoost=bf.has('firstSkillBoost')&&!g.firstSkillUsed;
     const silenced=g.playerStatuses.find(s=>s.type==='silence');
     // Blood&Steel: next attack +50% dmg
     const bloodBoost=bf.has('bloodSteel')&&g.bloodSteelCharged;
     if(bloodBoost)g.bloodSteelCharged=false;
     let total=0;
     for(let h=0;h<hits;h++){
       let base=st.atk*(1+g.floor*0.05);
       if(firstBoost)base*=2;
       if(silenced)base*=0.5;
       if(bloodBoost)base*=1.5;
       const crit=Math.random()*100<st.critChance;
       const critMult=sp.has('critMult')?(st.critDmg/100)*1.5:(st.critDmg/100);
       if(crit)base*=critMult;
       let dmg=Math.max(1,Math.round(base-g.enemy.def));
       if(bf.has('logosDmgStack')){const lb=Math.min(1.20,g.logosSpentBattle/10*0.06);dmg=Math.round(dmg*(1+lb));}
       total+=dmg;dealDamageToEnemy(dmg,crit);
       if(crit&&bf.has('critDoubleHit')&&Math.random()<0.40){
         const bonus=Math.max(1,Math.round(dmg*0.7));total+=bonus;dealDamageToEnemy(bonus,false);
         addLog('Colpo Letale: secondo colpo!','crit');
       }
       // Elation: generate punchline on hit
       if(elationActive()){
         const base_pl=bf.has('comicTiming')?8:5;
         let pl=base_pl;
         if(crit&&bf.has('comicTiming'))pl+=5;
         // crowd_pleaser 4pc: crit generates +8 extra
         if(crit&&sp.has('crowdCrit'))pl+=8;
         // jester_soul 2pc: +10 extra per skill
         if(sp.has('jesterFlow')&&h===0)pl+=10;
         g.punchline=Math.min(200,g.punchline+pl);
       }
       // Destruction hpElenchos heals generation happens outside (no cost path)
     }
     g.firstSkillUsed=true;
     const tags=[
       sp.has('elenchosDouble')?'×2':null,
       firstBoost?'Primo Sangue!':null,
       silenced?'[Silenziato -50%]':null,
       bloodBoost?'[Sangue e Acciaio +50%]':null,
     ].filter(Boolean).join(' ');
     addLog(`${g.playerName} usa <b>Elenchos</b>${tags?' ['+tags+']':''}. ${total} danni.`,total>st.atk*3?'crit':'player');
     if(sp.has('logosAttackRegen'))g.player.mp=Math.min(g.player.mp+5,st.maxMp);
     return true;
   }},
  {name:'Maieutica',cost:20,cd:3,
   use(g){
     const st=computeStats(),sp=getActiveBonus4Specials(),bf=getBlessingFlags();
     g.logosSpentBattle+=20;
     const atFullHp=g.player.hp>=st.maxHp;
     if(bf.has('maieuticaFullHpBuff')&&atFullHp){
       g.playerStatuses.push({type:'buff',name:'Estasi+35%',turns:3});
       addLog(`${g.playerName} usa <b>Maieutica</b> [Estasi]: HP pieni → +35% ATK × 3T.`,'player');
     }else{
       const pct=sp.has('maieuticaBoost')?.38:.18;
       const healed=applyHeal(Math.round(st.maxHp*pct+st.atk*.5));
       g.playerStatuses.push({type:'buff',name:'Saggezza+',turns:3});
       if(sp.has('maieuticaBoost')){
         const hpDmg=Math.max(1,Math.round(g.player.hp*0.20));dealDamageToEnemy(hpDmg,false);
         addLog(`${g.playerName} usa <b>Maieutica</b> [4pc]: +${healed} HP, ${hpDmg} danni da vita.`,'crit');
       }else addLog(`${g.playerName} usa <b>Maieutica</b>. +${healed} HP.`,'player');
     }
     if(bf.has('skillHealPerLogos')){g.player.hp=Math.min(g.player.hp+80,computeStats().maxHp);showHealPop('player-card',80);}
     if(sp.has('logosAttackRegen'))g.player.mp=Math.min(g.player.mp+5,computeStats().maxMp);
     if(elationActive())g.punchline=Math.min(200,g.punchline+(sp.has('jesterFlow')?15:5));
     g.firstSkillUsed=true;return true;
   }},
  {name:'Eironeia',cost:25,cd:4,
   use(g){
     const st=computeStats(),sp=getActiveBonus4Specials(),bf=getBlessingFlags();
     g.logosSpentBattle+=25;
     let turns=sp.has('eironeiaBuff')?6:3;let atkMult=sp.has('eironeiaBuff')?.3:.5;
     if(bf.has('extraDebuffTurns'))turns+=2;
     if(bf.has('eironeiaExtraAtk'))atkMult=Math.max(0.1,atkMult-0.20);
     g.enemyStatuses.push({type:'debuff',name:'Confuso',turns,atkMult});
     if(bf.has('confuseDefReduction'))g.enemyStatuses.push({type:'defDebuff',name:'Corrosione',turns,defMult:0.7});
     if(sp.has('arcanaCurse')){
       const arcanaDmg=Math.round(st.atk*1.0+st.def*0.8);
       g.enemyStatuses.push({type:'arcana',name:'Arcana',turns:3,dmg:arcanaDmg});
       addLog(`${g.playerName} usa <b>Eironeia</b>! Confuso + <b>Arcana</b> [${arcanaDmg} dmg/T × 3T].`,'crit');
     }else{
       addLog(`${g.playerName} usa <b>Eironeia</b>. Confuso ${turns}T.`,'player');
     }
     const dmg=Math.round(st.atk*.8);dealDamageToEnemy(dmg,false);
     addLog(`Colpo iniziale: ${dmg} danni.`,'player');
     if(sp.has('logosAttackRegen'))g.player.mp=Math.min(g.player.mp+5,computeStats().maxMp);
     if(bf.has('skillHealPerLogos')){g.player.hp=Math.min(g.player.hp+100,computeStats().maxHp);showHealPop('player-card',100);}
     if(elationActive())g.punchline=Math.min(200,g.punchline+(sp.has('jesterFlow')?15:5));
     g.firstSkillUsed=true;return true;
   }},
  {name:'Aporia',cost:40,cd:5,
   use(g){
     const st=computeStats(),sp=getActiveBonus4Specials(),bf=getBlessingFlags();
     g.logosSpentBattle+=40;
     const firstBoost=bf.has('firstSkillBoost')&&!g.firstSkillUsed;
     const hasAporia=sp.has('aporiaBoost');
     const boost=hasAporia?2.0:1.0;
     const numHits=hasAporia?(3+Math.floor(Math.random()*18)):3;
     const logosScale=sp.has('logosAttackRegen')?(1+st.maxMp*0.003):1;
     const firstMult=firstBoost?2:1;
     let total=0;
     for(let i=0;i<numHits;i++){
       let dmg=Math.max(1,Math.round(st.atk*1.4*boost*logosScale*firstMult-g.enemy.def));
       if(bf.has('logosDmgStack')){const lb=Math.min(1.20,g.logosSpentBattle/10*0.06);dmg=Math.round(dmg*(1+lb));}
       total+=dmg;dealDamageToEnemy(dmg,false);
     }
     let log=`${g.playerName} usa <b>Aporia</b>`;
     if(hasAporia)log+=` [4pc ×${numHits} colpi +100%]`;
     if(sp.has('logosAttackRegen'))log+=` [Logos ×${logosScale.toFixed(2)}]`;
     if(firstBoost)log+=` [Primo Sangue!]`;
     log+=`! ${total} danni!`;addLog(log,'crit');
     if(sp.has('logosAttackRegen'))g.player.mp=Math.min(g.player.mp+5,computeStats().maxMp);
     if(bf.has('skillHealPerLogos')){g.player.hp=Math.min(g.player.hp+160,computeStats().maxHp);showHealPop('player-card',160);}
     if(elationActive())g.punchline=Math.min(200,g.punchline+(sp.has('jesterFlow')?20:5));
     g.firstSkillUsed=true;return true;
   }},
  // ── CATARSI: skill Elation, appare solo con >=2 blessing Elation ──
  {name:'Catarsi',cost:0,cd:4,
   use(g){
     if(!elationActive()){addLog('Catarsi richiede almeno 2 Blessing Elation equipaggiate!','system');return false;}
     if(g.punchline<=0){addLog('Nessuna Punchline accumulata!','system');return false;}
     const st=computeStats(),sp=getActiveBonus4Specials(),bf=getBlessingFlags();
     const pl=g.punchline;
     // Danno = punchlineDmg × moltiplicatore generoso basato sulle punchline
     // Ogni punchline vale 3.5× il danno base → generoso ma non assurdo
     const mult=Math.floor(pl*3.5);
     let dmg=Math.max(1,Math.round(st.punchlineDmg*mult/100));
     // crowd_pleaser 4pc: può critare
     let isCrit=false;
     if(sp.has('crowdCrit')&&Math.random()*100<st.critChance){
       dmg=Math.round(dmg*(st.critDmg/100));isCrit=true;
     }
     dealDamageToEnemy(dmg,isCrit);
     // Standing Ovation: se aveva 80+ pl → +50% ATK per 2T
     if(bf.has('standingOvation')&&pl>=80){
       g.playerStatuses.push({type:'buff',name:'Ovazione+50%',turns:2});
       addLog(`🎪 <b>Standing Ovation!</b> +50% ATK × 2T!`,'crit');
     }
     addLog(`${g.playerName} usa <b>Catarsi</b> [${pl} Punchline × 3.5]${isCrit?' CRITICO!':''}: ${dmg} danni!`,'crit');
     // jester_soul 4pc: no CD se aveva 50+ punchline
     const noCd=sp.has('jesterFlow')&&pl>=50;
     if(noCd)addLog('🃏 Jester Flow: Catarsi senza cooldown!','set');
     g.punchline=0;
     g.firstSkillUsed=true;
     // return special flag so useSkill knows not to set CD
     g._catarsiNoCd=noCd;
     return true;
   }},
];

function dealDamageToEnemy(dmg,crit){
  G.enemy.hp=Math.max(0,G.enemy.hp-dmg);
  showDmgPop('enemy-card',dmg,crit?'#ffd700':'#e08080');
}
function dealDamageToPlayer(dmg){
  const st=computeStats();const r=Math.max(1,dmg-st.def);
  G.player.hp=Math.max(0,G.player.hp-r);showDmgPop('player-card',r,'#ff8080');return r;
}
function showDmgPop(cid,dmg,color){
  const c=document.getElementById(cid);const p=document.createElement('div');
  p.className='dmg-pop';p.style.color=color;
  p.style.left=(15+Math.random()*55)+'%';p.style.top='15%';
  p.textContent='-'+dmg;c.appendChild(p);setTimeout(()=>p.remove(),1200);
}
function showHealPop(cid,val){
  const c=document.getElementById(cid);const p=document.createElement('div');
  p.className='dmg-pop heal-pop';
  p.style.left=(15+Math.random()*55)+'%';p.style.top='15%';
  p.textContent='+'+val;c.appendChild(p);setTimeout(()=>p.remove(),1200);
}
function addLog(msg,type='system'){
  const log=document.getElementById('combat-log');
  const e=document.createElement('div');e.className=`log-entry log-${type}`;e.innerHTML=msg;
  log.appendChild(e);if(log.children.length>80)log.children[0].remove();log.scrollTop=log.scrollHeight;
}

function attack(){if(!G.playerTurn||G.battleOver)return;useSkill(0);}
function useSkill(idx){
  if(!G.playerTurn||G.battleOver)return;
  // Catarsi (idx 4) is only accessible if Elation is active
  if(idx===4&&!elationActive())return;
  const skill=SKILLS[idx];if(!skill)return;
  const baseCds=getSkillCooldowns();
  if(G.cooldowns[idx]>0){addLog(`${skill.name} in ricarica: ${G.cooldowns[idx]} turni.`);return;}
  if(G.player.mp<skill.cost){addLog(`Logos insufficiente per ${skill.name}.`);return;}
  G.player.mp-=skill.cost;
  const result=skill.use(G);
  if(!result)return;
  // Handle Catarsi noCd flag
  const noCd=SKILLS[idx]._catarsiNoCd;
  SKILLS[idx]._catarsiNoCd=false;
  if(!noCd&&baseCds[idx]>0)G.cooldowns[idx]=baseCds[idx];
  G.playerTurn=false;updateUI();if(checkBattleEnd())return;
  setTimeout(enemyTurn,650);
}

function enemyTurn(){
  if(G.battleOver)return;
  const sp=getActiveBonus4Specials(),bf=getBlessingFlags(),st=computeStats();
  const debuff=G.enemyStatuses.find(s=>s.type==='debuff');
  if(debuff){
    addLog(`${G.enemy.name} è Confuso! ATK ridotto.`,'enemy');
    if(bf.has('debuffPoison')){
      const dot=Math.max(1,Math.round(st.atk*0.25));
      dealDamageToEnemy(dot,false);
      addLog(`Veleno del Nulla: ${dot} danni.`,'set');
    }
  }
  const arcana=G.enemyStatuses.find(s=>s.type==='arcana');
  if(arcana&&G.enemy.hp>0){
    dealDamageToEnemy(Math.max(1,arcana.dmg),false);
    addLog(`Arcana: ${arcana.dmg} danni [${arcana.turns}T].`,'set');
  }
  if(checkBattleEnd())return;

  // Boss applies pending debuff on first attack
  if(G.isBossFight&&G.pendingBossDebuff){
    const debuffToApply=G.pendingBossDebuff;
    G.pendingBossDebuff=null;
    debuffToApply.apply(G,st);
    addLog(`⚡ ${G.enemy.name} usa <b>${debuffToApply.name}</b>! ${debuffToApply.desc}`,'enemy');
  }

  // Apply player MP drain from boss debuff
  const drainStatus=G.playerStatuses.find(s=>s.type==='drain');
  if(drainStatus&&G.player.mp>0){
    G.player.mp=Math.max(0,G.player.mp-drainStatus.mpDrain);
    addLog(`Drenaggio: -${drainStatus.mpDrain} Logos.`,'enemy');
  }

  let baseAtk=Math.round(G.enemy.atk*(debuff?debuff.atkMult:1));
  const isSpecial=G.floor>=10&&Math.random()<.28;
  const incomingDmg=isSpecial?Math.round(baseAtk*1.8):baseAtk;
  const finalDmg=G.isBossFight?Math.round(incomingDmg*1.3):incomingDmg;

  const doAttack=(dmgVal,label)=>{
    if(bf.has('firstHitNegate')&&!G.firstHitNegated){
      G.firstHitNegated=true;
      addLog('Scudo Riflesso: primo colpo negato!','set');
      return 0;
    }
    // ── Destruction: Last Stand (broken_crown 4pc) ──
    const sp2=getActiveBonus4Specials();
    if(sp2.has('lastStand')&&!G.lastStandUsed){
      const stNow=computeStats();
      const wouldDie=G.player.hp-Math.max(1,dmgVal-stNow.def)<=0;
      if(wouldDie){
        G.lastStandUsed=true;
        G.player.hp=1;
        addLog(`👁‍🗨 <b>Last Stand!</b> Sopravvivi con 1 HP!`,'crit');
        showDmgPop('player-card',0,'#ff8080');
        return 0;
      }
    }
    const dmgTaken=dealDamageToPlayer(dmgVal);
    addLog(label.replace('{d}',dmgTaken),'enemy');
    // ── Destruction: Blood&Steel — carica prossimo attacco ──
    if(bf.has('bloodSteel')&&G.player.hp>0){
      G.bloodSteelCharged=true;
    }
    // ── Destruction: broken_crown — accumula ATK bonus dal danno subito ──
    const counts3=getSetCounts();
    if((counts3['broken_crown']||0)>=2){
      G.brokenCrownDmgAccum=(G.brokenCrownDmgAccum||0)+dmgTaken;
      const newStacks=Math.floor(G.brokenCrownDmgAccum/50);
      const oldStacks=Math.floor((G.brokenCrownDmgAccum-dmgTaken)/50);
      if(newStacks>oldStacks){
        const gained=(newStacks-oldStacks)*0.05;
        G.brokenCrownAtkBonus=Math.min(1.0,(G.brokenCrownAtkBonus||0)+gained);
        addLog(`👁‍🗨 Corona Spezzata: +${Math.round(gained*100)}% ATK dal dolore! (tot: +${Math.round(G.brokenCrownAtkBonus*100)}%)`,'set');
      }
    }
    // ── Destruction: phoenix rage ──
    if(bf.has('phoenixRage')&&!G.phoenixRageUsed){
      const stNow2=computeStats();
      if(G.player.hp>0&&G.player.hp/stNow2.maxHp<0.20){
        G.phoenixRageUsed=true;
        G.playerStatuses.push({type:'buff',name:'Fenice+80%',turns:3});
        addLog(`💢 <b>Rinascita dalla Cenere!</b> +80% ATK +40% DEF × 3T!`,'crit');
      }
    }
    // ── Elation: Crowd Work — sotto 50% HP genera punchline ──
    if(elationActive()&&bf.has('crowdWork')){
      const stNow3=computeStats();
      if(G.player.hp>0&&G.player.hp/stNow3.maxHp<0.50){
        G.punchline=Math.min(200,G.punchline+10);
      }
    }
    return dmgTaken;
  };

  if(G.isBossFight&&isSpecial)
    doAttack(finalDmg,`${G.enemy.name} usa <b>Colpo del Boss</b>! {d} danni!`);
  else
    doAttack(finalDmg,`${G.enemy.name} attacca per {d} danni.`);

  // Boss double attack if Frenzy active
  if(G.bossDoubleAttack>0){
    G.bossDoubleAttack--;
    if(G.player.hp>0){
      const dmg2=dealDamageToPlayer(Math.round(baseAtk*0.7));
      addLog(`${G.enemy.name} <b>Frenesia</b>: secondo colpo! ${dmg2} danni.`,'enemy');
    }
  }

  if(checkBattleEnd())return;

  if(sp.has('turnRegen')&&G.player.hp>0){
    const reg=Math.round(st.maxHp*.03);
    G.player.hp=Math.min(G.player.hp+reg,st.maxHp);
    if(reg>0)showHealPop('player-card',reg);
    const ctr=Math.max(1,st.def);dealDamageToEnemy(ctr,false);
    addLog(`Riflesso [Logica 4pc]: +${reg} HP, ${ctr} danni.`,'set');
  }
  if(bf.has('passiveRegen')&&G.player.hp>0){
    const reg=Math.round(st.maxHp*.02);
    G.player.hp=Math.min(G.player.hp+reg,st.maxHp);
    if(reg>0)showHealPop('player-card',reg);
  }

  G.playerStatuses=G.playerStatuses.filter(s=>{s.turns--;return s.turns>0;});
  G.enemyStatuses =G.enemyStatuses.filter(s =>{s.turns--;return s.turns>0;});
  G.player.mp=Math.min(G.player.mp+st.mpRegen,st.maxMp);
  G.cooldowns=G.cooldowns.map(cd=>Math.max(0,cd-1));
  G.playerTurn=true;updateUI();checkBattleEnd();
}

function checkBattleEnd(){
  if(G.enemy.hp<=0){
    G.battleOver=true;G.totalKills++;
    if(G.domainActive){
      addLog(`✦ Nemico ${G.domainEnemy}/5 sconfitto!`,'domain');
      if(G.domainEnemy>=5){
        const lootCount=3+Math.floor(Math.random()*4);const loot=[];
        for(let i=0;i<lootCount;i++){const item=makeItem(G.domainId);addToInventory(item);loot.push(item);}
        const wGain=Math.floor(50*Math.pow(1.1,G.floor)*G.wisdomMult*getWisdomBonus()*G.prestigeBonus);
        G.wisdom+=wGain;
        updateUI();renderInventory();showDomainCompleteOverlay(loot,wGain);scheduleSave();
      }else{
        G.domainEnemy++;G.battleOver=false;G.playerTurn=true;
        G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
        G.logosSpentBattle=0;G.firstHitNegated=false;G.bloodSteelCharged=false;
        G.phoenixRageUsed=false;G.lastStandUsed=false;G.punchline=0;
        const st=computeStats();G.player.mp=Math.min(G.player.mp+Math.round(st.maxMp*.2),st.maxMp);
        spawnDomainEnemy();updateUI();addLog(`— Avanza: Nemico ${G.domainEnemy}/5 —`,'domain');
        if(G.autoMode)scheduleAuto();
      }
    }else{
      // Tower: boss or normal
      const wasBoss=G.isBossFight;
      const wGain=Math.floor((wasBoss?25:10)*Math.pow(1.15,G.floor)*G.wisdomMult*getWisdomBonus()*G.prestigeBonus);
      G.wisdom+=wGain;G.floor++;
      const dropChance=wasBoss?.95:.70;
      const droppedItem=Math.random()<dropChance?makeItem(null):null;
      // Boss also drops extra item
      const bossExtraItem=wasBoss&&Math.random()<0.60?makeItem(null):null;
      if(droppedItem)addToInventory(droppedItem);
      if(bossExtraItem)addToInventory(bossExtraItem);
      // Boss gives blessing token
      if(wasBoss){
        G.blessingTokens++;
        addLog(`⚡ Boss sconfitto! +1 Token Rinascita!`,'crit');
      }
      G.isBossFight=false;G.bossDoubleAttack=0;G.pendingBossDebuff=null;
      updateUI();renderInventory();showVictoryOverlay(wGain,droppedItem,bossExtraItem,wasBoss);scheduleSave();
    }
    return true;
  }
  if(G.player.hp<=0){G.battleOver=true;stopAuto();addLog(`${G.playerName} è caduto!`,'system');showDefeatOverlay();return true;}
  return false;
}

function nextBattle(){
  if(G.domainActive)return;
  spawnTowerEnemy();G.battleOver=false;G.playerTurn=true;
  G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
  G.logosSpentBattle=0;G.firstSkillUsed=false;G.firstHitNegated=false;
  G.isBossFight=false;G.bossDoubleAttack=0;G.pendingBossDebuff=null;
  G.bloodSteelCharged=false;G.phoenixRageUsed=false;G.lastStandUsed=false;
  G.punchline=0;
  const st=computeStats();G.player.mp=Math.min(G.player.mp+Math.round(st.maxMp*.3),st.maxMp);
  document.getElementById('btn-next').style.display='none';
  document.getElementById('btn-attack').disabled=false;
  updateUI();addLog(`— Nuovo sfidante: ${G.enemy.name} —`,'system');
  if(G.autoMode)scheduleAuto();
}
function spawnTowerEnemy(){
  G.isBossFight=false;G.bossDoubleAttack=0;G.pendingBossDebuff=null;
  if(isBossFloor(G.floor)){
    spawnBossEnemy();
    return;
  }
  const base=ENEMIES[Math.floor(Math.random()*ENEMIES.length)];
  const scale=Math.pow(1.18,G.floor);
  G.enemy={name:base.name,title:base.title,
    hp:Math.floor(60*scale),maxHp:Math.floor(60*scale),
    atk:Math.floor(6*Math.pow(1.12,G.floor)),def:Math.floor(G.floor*.4)};
  document.getElementById('enemy-name').textContent=base.icon+' '+base.name;
  document.getElementById('enemy-title').textContent=base.title;
  document.getElementById('enemy-card').classList.remove('domain-enemy','boss-enemy');
  document.getElementById('arena-location').innerHTML=`Torre · Piano <span id="floor-num">${G.floor}</span>`;
  document.getElementById('domain-progress').style.display='none';
}

// ── OVERLAYS ─────────────────────────────────────────────────
function showVictoryOverlay(wGain,droppedItem,bossExtraItem,wasBoss){
  document.getElementById('ov-icon').textContent=wasBoss?'⚡':'🏛';
  document.getElementById('ov-title').textContent=wasBoss?'Boss Sconfitto!':'Vittoria!';
  document.getElementById('ov-body').textContent=wasBoss
    ?`"${G.enemy.name}" è caduto. La saggezza trionfa sulla tirannia.`
    :`"${G.enemy.name}" sconfitto con la Dialettica.`;
  let rewardsHtml=`<div class="reward-line"${wasBoss?' style="color:#e8a030"':''}>+${wGain} Saggezza</div><div class="reward-line">Piano ${G.floor} sbloccato</div>`;
  if(wasBoss)rewardsHtml+=`<div class="reward-line" style="color:#a080d0">+1 Token Rinascita</div>`;
  document.getElementById('ov-rewards').innerHTML=rewardsHtml;

  const drop=document.getElementById('ov-item-drop');
  const items=[droppedItem,bossExtraItem].filter(Boolean);
  if(items.length){
    let html=`<div class="loot-domain-label">⚗ Oggetti trovati (${items.length})</div><div class="loot-grid">`;
    items.forEach(item=>{
      const set=SETS[item.setId];
      html+=`<div class="loot-item" style="border-color:${rarityBorderColor(item.rarity)};background:rgba(0,0,0,.25)">
        <div class="loot-item-icon">${item.icon}</div>
        <div class="loot-item-info">
          <div class="loot-item-name" style="color:${rarityColor(item.rarity)}">${item.name}
            <span class="rarity-pill rp-${item.rarity}">${RARITY_NAMES[item.rarity]}</span></div>
          <div class="loot-item-sub">${SLOT_NAMES[item.slot]} · ${statsText(item.stats)} · <span style="color:${set.color}">${set.icon} ${set.name}</span></div>
        </div></div>`;
    });
    html+='</div>';drop.innerHTML=html;
  }else drop.innerHTML='<div style="font-size:12px;color:var(--text-dim);padding:6px 0;font-style:italic">Nessun oggetto questa volta…</div>';
  document.getElementById('overlay').classList.add('show');
}
function showDomainCompleteOverlay(loot,wGain){
  const dom=DOMAINS.find(d=>d.id===G.domainId);
  document.getElementById('ov-icon').textContent=dom.icon;
  document.getElementById('ov-title').textContent='Dominio Completato!';
  document.getElementById('ov-body').textContent=`Hai sconfitto tutti e 5 i guardiani del ${dom.name}.`;
  document.getElementById('ov-rewards').innerHTML=`<div class="reward-line" style="color:${dom.color}">+${wGain} Saggezza</div><div class="reward-line">${loot.length} Oggetti guadagnati</div>`;
  const drop=document.getElementById('ov-item-drop');
  let html=`<div class="loot-domain-label">⚗ Bottino (${loot.length} oggetti)</div><div class="loot-grid">`;
  loot.forEach(item=>{
    const set=SETS[item.setId];
    html+=`<div class="loot-item" style="border-color:${rarityBorderColor(item.rarity)};background:rgba(0,0,0,.25)">
      <div class="loot-item-icon">${item.icon}</div>
      <div class="loot-item-info">
        <div class="loot-item-name" style="color:${rarityColor(item.rarity)}">${item.name}
          <span class="rarity-pill rp-${item.rarity}">${RARITY_NAMES[item.rarity]}</span></div>
        <div class="loot-item-sub">${SLOT_NAMES[item.slot]} · ${statsText(item.stats)} ·
          <span style="color:${set.color}">${set.icon} ${set.name}</span></div>
      </div></div>`;
  });
  html+='</div>';drop.innerHTML=html;
  document.getElementById('overlay').classList.add('show');
}
function showDefeatOverlay(){
  document.getElementById('ov-icon').textContent='💀';
  document.getElementById('ov-title').textContent='Sconfitto…';
  document.getElementById('ov-body').textContent='"Solo chi conosce i propri limiti può superarli."';
  document.getElementById('ov-rewards').innerHTML=`<div class="reward-line" style="color:#e08080">HP ripristinati al 50%</div>${G.domainActive?'<div class="reward-line" style="color:#e08080">Uscito dal Dominio</div>':''}`;
  document.getElementById('ov-item-drop').innerHTML='';
  document.getElementById('overlay').classList.add('show');
}
function closeOverlay(){
  document.getElementById('overlay').classList.remove('show');
  if(G.player.hp<=0){
    const st=computeStats();G.player.hp=Math.round(st.maxHp*.5);
    if(G.domainActive){
      G.domainActive=false;G.domainId=null;G.domainEnemy=1;G.domainLoot=[];
      document.getElementById('btn-exit-domain').style.display='none';
      document.getElementById('domain-progress').style.display='none';
    }else G.floor=Math.max(1,G.floor-2);
    G.isBossFight=false;G.bossDoubleAttack=0;G.pendingBossDebuff=null;
    G.bloodSteelCharged=false;G.phoenixRageUsed=false;G.lastStandUsed=false;
    G.punchline=0;G.brokenCrownDmgAccum=0;G.brokenCrownAtkBonus=0;
    G.battleOver=false;G.playerTurn=true;G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
    G.logosSpentBattle=0;G.firstSkillUsed=false;G.firstHitNegated=false;
    spawnTowerEnemy();document.getElementById('btn-attack').disabled=false;
    updateUI();renderDomains();scheduleSave();
  }else if(G.domainActive&&G.domainEnemy>5){
    G.domainActive=false;G.domainId=null;G.domainEnemy=1;G.domainLoot=[];
    document.getElementById('btn-exit-domain').style.display='none';
    document.getElementById('domain-progress').style.display='none';
    G.bloodSteelCharged=false;G.phoenixRageUsed=false;G.lastStandUsed=false;
    G.punchline=0;
    G.battleOver=false;G.playerTurn=true;G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
    G.logosSpentBattle=0;G.firstSkillUsed=false;G.firstHitNegated=false;
    spawnTowerEnemy();document.getElementById('btn-attack').disabled=false;
    updateUI();renderDomains();renderUpgrades();scheduleSave();
  }else{
    document.getElementById('btn-next').style.display='inline-block';
    document.getElementById('btn-attack').disabled=true;
    renderUpgrades();renderEquip();renderInventory();renderDomains();
    if(G.autoMode)setTimeout(nextBattle,400);
  }
}

// ── AUTO ─────────────────────────────────────────────────────
const AUTO_STRATEGY_NAMES={
  sophist_mask:'🫧 Tank/Heal',academy_mind:'😏 Debuff',
  ideal_form:'🔍 Crit',prometheus_fire:'🔍 Crit×2',
  nicomachean:'😏 Arcana',pure_logic:'🛡 Difesa',
  socratic_order:'⚡ Aporia',divine_wisdom:'⚡ Logos',
  iron_will:'💢 Berserk',broken_crown:'👁‍🗨 Martire',
  jester_soul:'🎪 Punchline',crowd_pleaser:'🎭 Catarsi',
};
function updateAutoStrategyDisplay(){
  const el=document.getElementById('auto-strategy-display');if(!el)return;
  if(!G.autoMode){el.style.display='none';return;}
  const dom=getDominantSetId();
  const label=dom&&AUTO_STRATEGY_NAMES[dom]?AUTO_STRATEGY_NAMES[dom]:'⚔ Default';
  el.textContent='Auto: '+label;el.style.display='inline-block';
}
function toggleAuto(){
  G.autoMode=!G.autoMode;const btn=document.getElementById('btn-auto');
  if(G.autoMode){btn.textContent='◉ Auto ON';btn.classList.add('auto-on');updateAutoStrategyDisplay();scheduleAuto();}
  else{btn.textContent='◎ Auto OFF';btn.classList.remove('auto-on');updateAutoStrategyDisplay();stopAuto();}
}
function stopAuto(){
  G.autoMode=false;clearTimeout(G.autoTimer);const btn=document.getElementById('btn-auto');
  btn.textContent='◎ Auto OFF';btn.classList.remove('auto-on');updateAutoStrategyDisplay();
}
function scheduleAuto(){
  if(!G.autoMode)return;
  G.autoTimer=setTimeout(()=>{
    if(G.battleOver&&!G.domainActive){if(!G.player.hp)return;nextBattle();}
    else if(G.playerTurn&&!G.battleOver){
      const skillIdx=getAutoStrategy();
      useSkill(skillIdx);
    }
    if(G.autoMode)scheduleAuto();
  },820);
}

// ── PRESTIGE ─────────────────────────────────────────────────
function prestige(){
  const req=prestigeRequiredFloor();if(G.floor<req)return;
  G.prestige++;G.prestigeBonus=1+G.prestige*.3;G.floor=1;G.wisdom=0;G.wisdomMult=1;
  G.upgradeLevels={dialectics:0,virtue:0,temperance:0,logos:0,insight:0,wisdom_gain:0};
  G.upgradeMults={atk:1.0,maxHp:1.0,def:1.0,maxMp:1.0,critDmg:1.0};
  G.player={hp:100,baseMaxHp:100+G.prestige*10,mp:60,baseMaxMp:60+G.prestige*5,
    baseMpRegen:3+G.prestige,baseAtk:10+G.prestige*5,baseDef:2,
    baseCritChance:5+G.prestige*2,baseCritDmg:200+G.prestige*10};
  G.blessingTokens+=2;
  G.battleOver=false;G.playerStatuses=[];G.enemyStatuses=[];G.cooldowns=[0,0,0,0,0];
  G.logosSpentBattle=0;G.firstSkillUsed=false;G.firstHitNegated=false;
  G.isBossFight=false;G.bossDoubleAttack=0;G.pendingBossDebuff=null;
  G.bloodSteelCharged=false;G.phoenixRageUsed=false;G.lastStandUsed=false;
  G.punchline=0;G.brokenCrownDmgAccum=0;G.brokenCrownAtkBonus=0;
  if(G.domainActive){
    G.domainActive=false;G.domainId=null;G.domainEnemy=1;
    document.getElementById('btn-exit-domain').style.display='none';
    document.getElementById('domain-progress').style.display='none';
  }
  stopAuto();spawnTowerEnemy();
  addLog(`✦ Reincarnazione ${G.prestige}! +2 Token Rinascita. Prossima soglia: piano ${prestigeRequiredFloor()}.`,'system');
  document.getElementById('prestige-panel').style.display='none';
  renderUpgrades();renderEquip();renderInventory();renderDomains();renderBlessings();updateUI();rotateQuote();
  scheduleSave();
}

// ── UPGRADES RENDER ──────────────────────────────────────────
function renderUpgrades(){
  const list=document.getElementById('upgrades-list');list.innerHTML='';
  UPGRADES_DEF.forEach(def=>{
    const lv=G.upgradeLevels[def.id];
    const cost=Math.floor(def.baseCost*Math.pow(def.costScale,lv));
    const ok=G.wisdom>=cost;
    const effectText=lv>0?(def.getEffect.length>0?def.getEffect(lv):def.getEffect()):'';
    const div=document.createElement('div');div.className='upgrade-item';
    div.innerHTML=`
      <div class="upgrade-header"><div class="upgrade-name">${def.name}</div><div class="upgrade-level">Lv.${lv}</div></div>
      <div class="upgrade-desc">${def.desc}</div>
      <div class="upgrade-footer">
        <div class="upgrade-cost">🏛 ${cost}</div>
        <div class="upgrade-effect">${effectText}</div>
        <button class="upgrade-btn" onclick="buyUpgrade('${def.id}')" ${ok?'':'disabled'}>Compra</button>
      </div>`;
    list.appendChild(div);
  });
  const req=prestigeRequiredFloor();const pp=document.getElementById('prestige-panel');
  if(G.floor>=req&&!G.domainActive){
    pp.style.display='block';
    document.getElementById('prestige-desc').textContent=
      `Reincarnarti darà +${Math.round((G.prestige+1)*30)}% Saggezza e +2 Token Rinascita. Prossima soglia: piano ${req+2}.`;
  }else pp.style.display='none';
  document.getElementById('wisdom-count').textContent=G.wisdom;
  document.getElementById('h-wisdom').textContent=G.wisdom;
}
function buyUpgrade(id){
  const def=UPGRADES_DEF.find(d=>d.id===id);
  const lv=G.upgradeLevels[id];
  const cost=Math.floor(def.baseCost*Math.pow(def.costScale,lv));
  if(G.wisdom<cost)return;
  G.wisdom-=cost;G.upgradeLevels[id]++;def.effect(G);
  const st=computeStats();G.player.hp=Math.min(G.player.hp,st.maxHp);G.player.mp=Math.min(G.player.mp,st.maxMp);
  addLog(`Potenziamento: <b>${def.name}</b> → Lv.${G.upgradeLevels[id]}.`,'reward');
  updateUI();renderUpgrades();scheduleSave();
}

// ── BLESSINGS RENDER ─────────────────────────────────────────
function renderBlessings(){
  const el=document.getElementById('blessings-panel');if(!el)return;
  const pathOrder=['Hunt','Nihility','Propagation','Abundance','Preservation','Destruction','Elation'];
  const owned=ownedBlessingIds();
  const totalBlessings=BLESSING_IDS.length;
  const ownedCount=owned.size;
  let html=`
    <div class="blessing-header">
      <div class="blessing-token-display">
        <span class="blessing-token-icon">🪙</span>
        <span class="blessing-token-count">${G.blessingTokens}</span>
        <span class="blessing-token-label">Token Rinascita</span>
      </div>
      <button class="btn primary" style="font-size:10px;padding:6px 14px" onclick="rollBlessing()" ${G.blessingTokens>=1&&ownedCount<totalBlessings?'':'disabled'}>
        ✦ Roll (1 token)
      </button>
    </div>
    <div style="font-size:11px;color:var(--text-dim);font-style:italic;margin-bottom:6px;line-height:1.5">
      Ottieni <b style="color:var(--gold-light)">2 token</b> per Reincarnazione · <b style="color:#e8a030">1 token</b> per Boss · max <b style="color:var(--gold-light)">6 slot</b>.<br>
      <span style="color:#80c080">${ownedCount}/${totalBlessings} Blessing possedute</span>${ownedCount>=totalBlessings?' — <span style="color:#e8a030">Collezione completa!</span>':''}
    </div>
    <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;margin-bottom:5px">Slot Equipaggiati (${G.equippedBlessings.filter(Boolean).length}/6)</div>
    <div class="blessing-slots">`;
  for(let i=0;i<MAX_BLESSING_SLOTS;i++){
    const id=G.equippedBlessings[i];
    if(id){
      const b=BLESSINGS[id],path=BLESSING_PATHS[b.path];
      html+=`<div class="blessing-slot blessing-slot-filled" style="border-color:${path.color}40;background:${path.color}08">
        <span style="font-size:16px">${path.icon}</span>
        <div class="bslot-info">
          <div class="bslot-name" style="color:${path.color}">${b.name}</div>
          <div class="bslot-path" style="color:${path.color}99">${b.path}</div>
          <div class="bslot-desc">${b.desc}</div>
        </div>
        <button class="slot-unequip" onclick="unequipBlessing(${i})">✕</button>
      </div>`;
    }else{
      html+=`<div class="blessing-slot blessing-slot-empty">
        <span style="font-size:16px;opacity:.2">⬡</span>
        <span style="font-size:11px;color:var(--text-dim);font-style:italic">Slot ${i+1} vuoto</span>
      </div>`;
    }
  }
  html+='</div>';
  if(G.blessingCollection.length>0){
    html+=`<div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;margin:10px 0 5px">Collezione (${G.blessingCollection.length})</div><div class="blessing-collection">`;
    G.blessingCollection.forEach((id,idx)=>{
      const b=BLESSINGS[id],path=BLESSING_PATHS[b.path];
      const canEquip=G.equippedBlessings.some(s=>s===null);
      html+=`<div class="blessing-coll-item" style="border-color:${path.color}30">
        <div style="flex:1;min-width:0">
          <span class="bcoll-path-badge" style="background:${path.color}18;color:${path.color};border:1px solid ${path.color}40;font-family:'Cinzel',serif;font-size:9px;padding:1px 6px;border-radius:3px;display:inline-block;margin-bottom:3px">${path.icon} ${b.path}</span>
          <div style="font-size:11px;font-weight:600;color:var(--text)">${b.name}</div>
          <div style="font-size:10px;color:var(--text-dim);font-style:italic">${b.desc}</div>
        </div>
        <button class="inv-btn inv-btn-equip" style="flex-shrink:0" onclick="equipBlessing(${idx})" ${canEquip?'':'disabled'}>+ Equipa</button>
      </div>`;
    });
    html+='</div>';
  }
  html+=`<div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:2px;color:var(--text-dim);text-transform:uppercase;margin:12px 0 5px">Tutte le Blessing</div>`;
  pathOrder.forEach(pathName=>{
    const path=BLESSING_PATHS[pathName];
    html+=`<div style="border:1px solid ${path.color}25;border-radius:6px;padding:8px 10px;margin-bottom:6px;background:${path.color}05">
      <div style="font-family:'Cinzel',serif;font-size:10px;font-weight:600;color:${path.color};margin-bottom:6px">${path.icon} ${pathName}</div>`;
    Object.values(BLESSINGS).filter(b=>b.path===pathName).forEach(b=>{
      const equipped=G.equippedBlessings.includes(b.id);
      const inCollection=G.blessingCollection.includes(b.id);
      const isOwned=equipped||inCollection;
      html+=`<div style="display:flex;gap:6px;align-items:flex-start;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04)">
        <span style="font-size:10px;color:${isOwned?path.color:'var(--text-dim)'};font-family:'Cinzel',serif;flex-shrink:0;width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${b.name}${equipped?` <span style="color:#80c080">●</span>`:inCollection?` <span style="color:${path.color}">◎</span>`:''}
        </span>
        <span style="font-size:10px;color:${isOwned?'var(--text-dim)':'rgba(160,144,112,.4)'};font-style:italic;flex:1">${b.desc}</span>
      </div>`;
    });
    html+='</div>';
  });
  el.innerHTML=html;
}

// ── EQUIP RENDER ─────────────────────────────────────────────
function renderEquip(){
  const slotsEl=document.getElementById('equip-slots');slotsEl.innerHTML='';
  Object.keys(SLOT_ICONS).forEach(slot=>{
    const item=G.equipped[slot];const div=document.createElement('div');
    div.className='equip-slot'+(item?' has-item rarity-'+item.rarity:'');
    if(item){
      const set=SETS[item.setId];
      div.innerHTML=`<span class="slot-icon">${item.icon}</span>
        <div class="slot-info">
          <div class="slot-type">${SLOT_NAMES[slot]}</div>
          <div class="slot-item-name">${item.name}</div>
          <div class="slot-item-stats">${statsText(item.stats)}</div>
          <div class="slot-set-tag" style="background:rgba(0,0,0,.2);color:${set.color};border:1px solid ${set.color}">${set.icon} ${set.name}</div>
        </div>
        <button class="slot-unequip" onclick="unequipItem('${slot}')">✕</button>`;
    }else{
      div.innerHTML=`<span class="slot-icon" style="opacity:.3">${SLOT_ICONS[slot]}</span>
        <div class="slot-info"><div class="slot-type">${SLOT_NAMES[slot]}</div><div class="slot-empty">Vuoto</div></div>`;
    }
    slotsEl.appendChild(div);
  });
  const counts=getSetCounts(),display=document.getElementById('set-bonus-display');display.innerHTML='';
  const allSets=new Set();Object.values(G.equipped).forEach(i=>{if(i&&i.setId)allSets.add(i.setId);});
  if(!allSets.size){display.innerHTML='<div style="font-size:11px;color:var(--text-dim);font-style:italic">Nessun set attivo.</div>';return;}
  allSets.forEach(sid=>{
    const cnt=counts[sid]||0,s=SETS[sid];const row=document.createElement('div');row.className='set-bonus-row';
    row.style.borderColor=cnt>=2?s.color:'var(--border)';
    row.innerHTML=`<div class="set-bonus-name" style="color:${s.color}">${s.icon} ${s.name} (${cnt}pz)</div>
      <div class="set-bonus-line ${cnt>=2?'active':'inactive'}">2pc: ${s.desc2}</div>
      <div class="set-bonus-line ${cnt>=4?'active':'inactive'}">4pc: ${s.desc4}</div>`;
    display.appendChild(row);
  });
}

// ── INVENTORY RENDER ─────────────────────────────────────────
function renderInventory(){
  const grid=document.getElementById('inventory-grid');
  document.getElementById('inv-count').textContent=`${G.inventory.length}/30`;
  grid.innerHTML='';
  let items=G.inventory.filter(i=>G.invFilter==='all'||i.slot===G.invFilter);
  if(!items.length){grid.innerHTML=`<div class="inv-empty">Nessun oggetto${G.invFilter!=='all'?' in questo slot':''}.<br>Sconfiggi i nemici o completa un Dominio!</div>`;return;}
  items.sort((a,b)=>{if(a.equipped!==b.equipped)return a.equipped?-1:1;return RARITY_ORDER[b.rarity]-RARITY_ORDER[a.rarity];});
  items.forEach(item=>{
    const set=SETS[item.setId],isEq=item.equipped;const div=document.createElement('div');div.className='inv-item'+(isEq?' equipped':'');
    div.innerHTML=`<span class="inv-item-icon">${item.icon}</span>
      <div class="inv-item-info">
        <div class="inv-item-name" style="color:${rarityColor(item.rarity)}">${item.name}
          <span class="rarity-pill rp-${item.rarity}">${RARITY_NAMES[item.rarity]}</span></div>
        <div class="inv-item-sub">${SLOT_NAMES[item.slot]} · ${statsText(item.stats)}</div>
        <div class="inv-item-set" style="color:${set.color}">${set.icon} ${set.name}</div>
      </div>
      <div class="inv-actions">
        <button class="inv-btn inv-btn-equip${isEq?' equipped-btn':''}"
          onclick="${isEq?`unequipItem('${item.slot}')`:`equipItem(${item.id})`}">${isEq?'✕':'+ Equipa'}</button>
        <button class="inv-btn inv-btn-sell" onclick="sellItem(${item.id})" ${isEq?'disabled':''}>🏛 ${SELL_PRICES[item.rarity]}</button>
      </div>`;
    grid.appendChild(div);
  });
}

// ── DOMAINS RENDER ───────────────────────────────────────────
function renderDomains(){
  const list=document.getElementById('domains-list');list.innerHTML='';
  DOMAINS.forEach(dom=>{
    const inThis=G.domainActive&&G.domainId===dom.id;
    const canEnter=!G.domainActive&&G.wisdom>=DOMAIN_COST;
    const setsHtml=dom.sets.map(sid=>{const s=SETS[sid];return`<div class="set-chip" style="background:rgba(0,0,0,.2);border-color:${s.color};color:${s.color}">${s.icon} ${s.name}</div>`;}).join('');
    const setInfo=dom.sets.map(sid=>{const s=SETS[sid];return`<div class="set-info-block"><div class="set-info-title" style="color:${s.color}">${s.icon} ${s.name}</div><div class="set-info-bonus">2pc: <span>${s.desc2}</span></div><div class="set-info-bonus">4pc: <span>${s.desc4}</span></div></div>`;}).join('');
    const div=document.createElement('div');div.className='domain-card';
    div.style.borderColor=inThis?dom.color:'var(--border)';div.style.background=inThis?dom.bg:'rgba(0,0,0,.15)';
    if(inThis)div.style.borderWidth='2px';
    div.innerHTML=`
      <div class="domain-card-header"><div class="domain-name" style="color:${dom.color}">${dom.icon} ${dom.name}</div><div class="domain-cost-badge">🏛 ${DOMAIN_COST}</div></div>
      <div class="domain-desc">${dom.desc}</div>
      <div class="domain-rewards-line">Drop: <b>3–6 oggetti garantiti</b> · 5 nemici</div>
      <div class="domain-sets">${setsHtml}</div>
      <div style="margin-bottom:7px">${setInfo}</div>
      ${inThis?`<div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;color:${dom.color};text-align:center;padding:5px;border:1px solid ${dom.color};border-radius:4px">● IN CORSO — Nemico ${G.domainEnemy}/5</div>`
              :`<button class="domain-enter-btn" style="border-color:${dom.color};color:${dom.color};background:rgba(0,0,0,.2)" onclick="enterDomain(${dom.id})" ${canEnter?'':'disabled'}>${G.domainActive?'Termina il dominio attuale':'⚔ Entra nel Dominio'}</button>`}`;
    list.appendChild(div);
  });
}

// ── UI UPDATE ────────────────────────────────────────────────
function updateUI(){
  const p=G.player,e=G.enemy,st=computeStats();
  const hpPct=p.hp/st.maxHp*100;
  const hpFill=document.getElementById('p-hp-bar');
  hpFill.style.width=hpPct+'%';
  hpFill.className='bar-fill hp-fill'+(hpPct<25?' critical':hpPct<50?' low':'');
  document.getElementById('p-hp-txt').textContent=p.hp+'/'+st.maxHp;
  document.getElementById('p-mp-bar').style.width=(p.mp/st.maxMp*100)+'%';
  document.getElementById('p-mp-txt').textContent=p.mp+'/'+st.maxMp;
  document.getElementById('e-hp-bar').style.width=(e.hp/e.maxHp*100)+'%';
  document.getElementById('e-hp-txt').textContent=e.hp+'/'+e.maxHp;
  document.getElementById('h-floor').textContent=G.floor;
  document.getElementById('h-prestige').textContent=G.prestige;
  document.getElementById('h-kills').textContent=G.totalKills;
  document.getElementById('h-wisdom').textContent=G.wisdom;
  document.getElementById('wisdom-count').textContent=G.wisdom;
  document.getElementById('stat-atk').textContent=st.atk;
  document.getElementById('stat-def').textContent=st.def;
  document.getElementById('stat-maxhp').textContent=st.maxHp;
  document.getElementById('stat-crit').textContent=st.critChance;
  document.getElementById('stat-critdmg').textContent=st.critDmg+'%';
  document.getElementById('stat-logos').textContent=st.maxMp;
  if(!document.getElementById('name-input-field'))
    document.getElementById('player-name-display').textContent=G.playerName;
  const sp=getActiveBonus4Specials();
  const elActive=elationActive();
  // skill buttons 0-3 always exist; skill 4 (Catarsi) shown only if Elation active
  const skillCount=elActive?5:4;
  for(let i=0;i<5;i++){
    const btn=document.getElementById('skill-'+i);
    if(!btn)continue;
    if(i===4){
      btn.style.display=elActive?'':'none';
      if(!elActive)continue;
    }
    const cd=G.cooldowns[i]||0;
    btn.disabled=!G.playerTurn||G.battleOver||(i===4&&G.punchline<=0);
    const oldCd=btn.querySelector('.skill-cd');if(oldCd)oldCd.remove();
    if(cd>0){btn.classList.add('on-cooldown');const cdDiv=document.createElement('div');cdDiv.className='skill-cd';cdDiv.textContent=cd;btn.appendChild(cdDiv);}
    else btn.classList.remove('on-cooldown');
    // Catarsi ready glow
    if(i===4){
      btn.classList.toggle('catarsi-ready',G.punchline>0&&cd===0);
      // update punchline count in button
      const plSpan=btn.querySelector('.skill-pl');
      if(plSpan)plSpan.textContent=G.punchline+'✦';
    }
  }
  // skills row: adjust grid columns
  const skillsRow=document.querySelector('.skills-row');
  if(skillsRow)skillsRow.style.gridTemplateColumns=elActive?'repeat(5,1fr)':'repeat(4,1fr)';

  const boostMap={3:'aporiaBoost',1:'maieuticaBoost',2:'eironeiaBuff',0:'elenchosDouble'};
  Object.entries(boostMap).forEach(([i,key])=>{document.getElementById('skill-'+i)?.classList.toggle('boosted',sp.has(key));});
  document.getElementById('player-card').classList.toggle('active-turn',G.playerTurn&&!G.battleOver);
  document.getElementById('enemy-card').classList.toggle('active-turn',!G.playerTurn&&!G.battleOver);
  renderStatuses('player-statuses',G.playerStatuses);renderStatuses('enemy-statuses',G.enemyStatuses);

  // Punchline bar
  const plWrap=document.getElementById('punchline-bar-wrap');
  if(plWrap){
    plWrap.classList.toggle('active',elActive);
    if(elActive){
      document.getElementById('punchline-fill').style.width=Math.min(100,G.punchline/2)+'%';
      document.getElementById('punchline-count-txt').textContent=G.punchline;
    }
  }

  // Punchline damage stat chip
  const plDmgEl=document.getElementById('stat-punchlinedmg');
  const plDmgWrap=document.getElementById('stat-punchlinedmg-wrap');
  if(plDmgEl&&plDmgWrap){
    plDmgWrap.style.display=elActive?'':'none';
    if(elActive)plDmgEl.textContent=computeStats().punchlineDmg;
  }
  let title='Il Filosofo';
  if(G.totalKills>=50)title='Il Saggio';if(G.totalKills>=100)title='Il Maestro';
  if(G.prestige>=1)title='L\'Immortale';if(G.prestige>=3)title='L\'Eterno';
  document.getElementById('player-title').textContent=title;
  const req=prestigeRequiredFloor();const pp=document.getElementById('prestige-panel');
  if(G.floor>=req&&!G.domainActive){
    pp.style.display='block';
    document.getElementById('prestige-desc').textContent=`Reincarnarti darà +${Math.round((G.prestige+1)*30)}% Saggezza e +2 Token Rinascita. Prossima soglia: piano ${req+2}.`;
  }else pp.style.display='none';

  // Boss floor indicator in arena header
  const arenaHeader=document.getElementById('arena-header');
  if(!G.domainActive&&isBossFloor(G.floor)&&!G.battleOver){
    if(!document.getElementById('boss-warning')){
      const w=document.createElement('div');w.id='boss-warning';
      w.style.cssText='font-family:Cinzel,serif;font-size:10px;letter-spacing:2px;color:#e8a030;text-transform:uppercase;text-align:center;padding:2px 0;animation:pulse-arcana 1s infinite alternate';
      w.textContent='⚡ Piano Boss — Sfida potenziata!';
      arenaHeader.appendChild(w);
    }
  }else{
    const bw=document.getElementById('boss-warning');if(bw)bw.remove();
  }
}

function renderStatuses(elId,statuses){
  const el=document.getElementById(elId);el.innerHTML='';
  statuses.forEach(s=>{
    const b=document.createElement('span');
    b.className=`status-badge status-${s.type==='arcana'?'arcana':s.type==='drain'||s.type==='blind'||s.type==='curse'||s.type==='silence'||s.type==='corrode'?'debuff':s.type}`;
    b.textContent=s.name+' '+s.turns;el.appendChild(b);
  });
}

// ── HELPERS ──────────────────────────────────────────────────
function statsText(stats){
  const labels={atk:'ATK',def:'DEF',maxHp:'HP',critChance:'Crit%',maxMp:'Logos',mpRegen:'Regen',critDmg:'CritDMG',punchlineDmgPct:'PL DMG%'};
  return Object.entries(stats).map(([k,v])=>`+${typeof v==='number'&&v<1&&v>0?Math.round(v*100)+'%':v} ${labels[k]||k}`).join(' ');
}
function rarityColor(r){return{common:'var(--common)',uncommon:'var(--uncommon)',rare:'var(--rare)',legendary:'var(--legendary)'}[r]||'var(--text)';}
function rarityBorderColor(r){return{common:'rgba(160,144,112,.4)',uncommon:'rgba(90,170,90,.4)',rare:'rgba(80,144,208,.4)',legendary:'rgba(232,160,48,.5)'}[r]||'var(--border)';}
function rotateQuote(){document.getElementById('quote-bar').textContent=QUOTES[Math.floor(Math.random()*QUOTES.length)];}

// ── TABS ─────────────────────────────────────────────────────
function switchTab(name){
  const names=['upgrades','equip','inventory','domains','blessings'];
  document.querySelectorAll('.tab-btn').forEach((b,i)=>b.classList.toggle('active',names[i]===name));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  if(name==='equip')renderEquip();
  if(name==='inventory')renderInventory();
  if(name==='domains')renderDomains();
  if(name==='blessings')renderBlessings();
}

// ── NAME EDIT ────────────────────────────────────────────────
function startEditName(){
  const display=document.getElementById('player-name-display');display.style.display='none';
  const input=document.createElement('input');
  input.className='name-input';input.value=G.playerName;input.maxLength=16;input.id='name-input-field';
  display.parentNode.insertBefore(input,display);input.focus();input.select();
  const confirm=()=>{
    const val=input.value.trim()||'Socrate';G.playerName=val;
    display.textContent=val;display.style.display='';input.remove();
    addLog(`✦ Il filosofo si chiama ora: <b>${val}</b>.`,'system');scheduleSave();
  };
  input.addEventListener('blur',confirm);
  input.addEventListener('keydown',e=>{if(e.key==='Enter')confirm();if(e.key==='Escape'){display.style.display='';input.remove();}});
}

// ── INIT ─────────────────────────────────────────────────────
function init(){
  const loaded=loadGame();
  spawnTowerEnemy();updateUI();renderUpgrades();renderEquip();
  renderInventory();renderDomains();renderBlessings();
  rotateQuote();setInterval(rotateQuote,30000);
  if(loaded){
    addLog(`✦ Bentornato, ${G.playerName}! Piano ${G.floor}, Reinc. ${G.prestige}.`,'system');
    if(G.blessingTokens>0)addLog(`Hai ${G.blessingTokens} Token Rinascita disponibili.`,'item');
  }else{
    addLog(`${G.playerName} si avvicina al primo sfidante…`,'system');
    addLog(`✦ Prima reincarnazione al piano ${prestigeRequiredFloor()}. +2 Token Rinascita per il roll Blessing.`,'system');
    addLog(`⚡ Boss ogni 5 piani con debuff speciale. Ricompensa: +1 Token Rinascita extra!`,'system');
  }
}
init();
