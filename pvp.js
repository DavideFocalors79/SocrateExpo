// ═══════════════════════════════════════════════════════════
//  ΟΔΟ ΣΟΚΡΑΤΗΣ — pvp.js  v3
//  Fix: battaglia funzionante, stats complete con blessing
// ═══════════════════════════════════════════════════════════

const SAVE_KEY = 'sokrates_save_v6';

// ─────────────────────────────────────────────────────────
// CARICA E CALCOLA TUTTE LE STATS DAL SALVATAGGIO
// Replica fedelmente computeStats() di game.js
// ─────────────────────────────────────────────────────────
function loadPlayerStats() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    const p = s.player;

    // 1) Base
    let atk = p.baseAtk, def = p.baseDef, maxHp = p.baseMaxHp,
        critChance = p.baseCritChance, maxMp = p.baseMaxMp,
        mpRegen = p.baseMpRegen, critDmg = p.baseCritDmg || 200;

    // 2) Item flat bonus
    const equipped = s.equipped || {};
    Object.values(equipped).forEach(item => {
      if (!item) return;
      if (item.stats.atk)        atk        += item.stats.atk;
      if (item.stats.def)        def        += item.stats.def;
      if (item.stats.maxHp)      maxHp      += item.stats.maxHp;
      if (item.stats.critChance) critChance += item.stats.critChance;
      if (item.stats.maxMp)      maxMp      += item.stats.maxMp;
      if (item.stats.mpRegen)    mpRegen    += item.stats.mpRegen;
      if (item.stats.critDmg)    critDmg    += item.stats.critDmg;
    });

    // 3) Upgrade multipliers
    const um = s.upgradeMults || {};
    atk     = Math.round(atk    * (um.atk    || 1));
    def     = Math.round(def    * (um.def    || 1));
    maxHp   = Math.round(maxHp  * (um.maxHp  || 1));
    maxMp   = Math.round(maxMp  * (um.maxMp  || 1));
    critDmg = Math.round(critDmg * (um.critDmg || 1));

    // 4) Set piece counts
    const setCounts = {};
    Object.values(equipped).forEach(item => {
      if (item && item.setId) setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
    });

    // 5) Set 2pc bonuses
    const SET_2PC = {
      socratic_order:  { atkPct:.15 },
      sophist_mask:    { maxHpPct:.22 },
      academy_mind:    { maxMpPct:.25 },
      ideal_form:      { critChancePct:.12, critDmgFlat:50 },
      nicomachean:     { atkPct:.15, defPct:.15 },
      pure_logic:      { defPct:.22 },
      prometheus_fire: { critChancePct:.20 },
      divine_wisdom:   { wisdomPct:.35 },
      iron_will:       { atkPct:.20 },
      broken_crown:    { maxHpPct:.30 },
      jester_soul:     {},
      crowd_pleaser:   { punchlineDmgPct:.25 },
    };
    Object.entries(setCounts).forEach(([sid, cnt]) => {
      if (cnt < 2) return;
      const b = SET_2PC[sid]; if (!b) return;
      if (b.atkPct)        atk        = Math.round(atk        * (1 + b.atkPct));
      if (b.defPct)        def        = Math.round(def        * (1 + b.defPct));
      if (b.maxHpPct)      maxHp      = Math.round(maxHp      * (1 + b.maxHpPct));
      if (b.maxMpPct)      maxMp      = Math.round(maxMp      * (1 + b.maxMpPct));
      if (b.critChancePct) critChance = Math.round(critChance * (1 + b.critChancePct));
      if (b.critDmgFlat)   critDmg   += b.critDmgFlat;
    });

    // 6) Set 4pc specials
    const SP4MAP = {
      sophist_mask:    'maieuticaBoost',
      socratic_order:  'aporiaBoost',
      academy_mind:    'eironeiaBuff',
      ideal_form:      'critMult',
      nicomachean:     'arcanaCurse',
      pure_logic:      'turnRegen',
      prometheus_fire: 'elenchosDouble',
      divine_wisdom:   'logosAttackRegen',
      jester_soul:     'jesterFlow',
      crowd_pleaser:   'crowdCrit',
    };
    const specials = new Set();
    Object.entries(setCounts).forEach(([sid, cnt]) => {
      if (cnt >= 4 && SP4MAP[sid]) specials.add(SP4MAP[sid]);
    });

    // 7) Blessing stat bonuses + flags
    const equippedBlessings = s.equippedBlessings || [];

    // Stat bonuses dalle blessing (hunt_1/3, preservation_1, ecc.)
    const BLESSING_STATS = {
      hunt_1:        { critChancePct:.25, critDmgPct:.25 },
      hunt_3:        { atkPct:.40 },
      preservation_1:{ defPct:.35, maxHpPct:.25 },
      propagation_1: { maxMpFlat:50, mpRegenFlat:3 },
    };
    const BLESSING_FLAG_MAP = {
      hunt_2:         'critDoubleHit',
      hunt_4:         'firstSkillBoost',
      nihility_1:     'extraDebuffTurns',
      nihility_2:     'debuffPoison',
      nihility_3:     'eironeiaExtraAtk',
      nihility_4:     'confuseDefReduction',
      propagation_2:  'logosDmgStack',
      propagation_3:  'mpRegenMult',
      propagation_4:  'skillHealPerLogos',
      abundance_1:    'maieuticaCdReduce',
      abundance_2:    'passiveRegen',
      abundance_3:    'healDamage',
      abundance_4:    'maieuticaFullHpBuff',
      preservation_2: 'firstHitNegate',
      preservation_3: 'lowHpDefDouble',
      preservation_4: 'defToAtk',
      destruction_1:  'woundedRage',
      destruction_2:  'bloodSteel',
      destruction_3:  'hpElenchos',
      destruction_4:  'phoenixRage',
      elation_1:      'elationActive',
      elation_2:      'comicTiming',
      elation_3:      'crowdWork',
      elation_4:      'standingOvation',
    };

    const blessingFlags = new Set();
    equippedBlessings.forEach(id => {
      // Stat bonuses
      const bs = BLESSING_STATS[id];
      if (bs) {
        if (bs.atkPct)        atk        = Math.round(atk        * (1 + bs.atkPct));
        if (bs.defPct)        def        = Math.round(def        * (1 + bs.defPct));
        if (bs.maxHpPct)      maxHp      = Math.round(maxHp      * (1 + bs.maxHpPct));
        if (bs.critChancePct) critChance = Math.round(critChance * (1 + bs.critChancePct));
        if (bs.critDmgPct)    critDmg    = Math.round(critDmg    * (1 + bs.critDmgPct));
        if (bs.maxMpFlat)     maxMp     += bs.maxMpFlat;
        if (bs.mpRegenFlat)   mpRegen   += bs.mpRegenFlat;
      }
      // Flags
      const fl = BLESSING_FLAG_MAP[id];
      if (fl) blessingFlags.add(fl);
      // elation_2 attiva anche elationActive
      if (id === 'elation_2') blessingFlags.add('elationActive');
    });

    // mpRegen triplicato se propagation_3
    if (blessingFlags.has('mpRegenMult')) mpRegen = Math.round(mpRegen * 3);

    // preservation_4: ogni 5 DEF = +1% ATK
    if (blessingFlags.has('defToAtk')) atk = Math.round(atk * (1 + Math.floor(def / 5) * 0.01));

    critChance = Math.min(critChance, 100);

    // Elation attiva se >= 2 blessing Elation equipaggiate
    const ELATION_IDS = ['elation_1','elation_2','elation_3','elation_4'];
    const elationCount = equippedBlessings.filter(id => ELATION_IDS.includes(id)).length;
    const hasElation = elationCount >= 2;

    const punchlineDmgBonus = (setCounts['crowd_pleaser'] || 0) >= 2 ? 0.25 : 0;

    return {
      name:        s.playerName || 'Socrate',
      floor:       s.floor || 1,
      prestige:    s.prestige || 0,
      kills:       s.totalKills || 0,
      atk, def, maxHp, maxMp, mpRegen, critChance, critDmg,
      punchlineDmg: Math.round(atk * (1 + punchlineDmgBonus)),
      specials:     [...specials],
      blessingFlags:[...blessingFlags],
      hasElation,
    };
  } catch(e) {
    console.warn('loadPlayerStats error:', e);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// PVP MODULE
// ─────────────────────────────────────────────────────────
const PVP = (() => {
  let peer = null;
  let conn = null;
  let isHost = false;
  let me = null, opp = null;
  let myState = null, oppState = null;
  // myTurn: true = tocca a me muoversi
  let myTurn = false, battleOver = false, round = 1;

  const SKILLS_DEF = [
    { name:'Elenchos', cost:0,  baseCd:0 },
    { name:'Maieutica', cost:20, baseCd:3 },
    { name:'Eironeia',  cost:25, baseCd:4 },
    { name:'Aporia',    cost:40, baseCd:5 },
    { name:'Catarsi',   cost:0,  baseCd:4 },
  ];

  // ── HELPERS UI ──────────────────────────────────────────
  function setStatus(text, state='wait') {
    const dot = document.getElementById('status-dot');
    const txt = document.getElementById('status-text');
    if (dot) dot.className = 'status-dot ' + state;
    if (txt) txt.textContent = text;
  }

  function pvpLog(msg, type='log-sys') {
    const el = document.getElementById('pvp-log');
    if (!el) return;
    const div = document.createElement('div');
    div.className = 'log-entry ' + type;
    div.innerHTML = msg;
    el.appendChild(div);
    if (el.children.length > 100) el.children[0].remove();
    el.scrollTop = el.scrollHeight;
  }

  function pop(cid, val, color) {
    const c = document.getElementById(cid);
    if (!c) return;
    const p = document.createElement('div');
    p.className = 'dmg-pop';
    p.style.color = color;
    p.style.left = (15 + Math.random() * 55) + '%';
    p.style.top  = '10%';
    p.textContent = val;
    c.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }

  // ── STATO INIZIALE BATTAGLIA ─────────────────────────────
  function makeBattleState(stats) {
    return {
      hp:              stats.maxHp,
      maxHp:           stats.maxHp,
      mp:              stats.maxMp,
      maxMp:           stats.maxMp,
      mpRegen:         stats.mpRegen,
      cooldowns:       [0, 0, 0, 0, 0],
      statuses:        [],
      punchline:       0,
      firstSkillUsed:  false,
      bloodSteelCharged: false,
      phoenixUsed:     false,
      firstHitNegated: false,
    };
  }

  // ── PEERJS INIT ──────────────────────────────────────────
  function initPeer() {
    const id = 'sok-' + Math.floor(100000 + Math.random() * 900000);
    peer = new Peer(id, {
      config: { iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]}
    });
    peer.on('open', () => {
      setStatus('Pronto — crea o unisciti a una stanza', 'on');
      document.getElementById('btn-create').disabled = false;
      document.getElementById('btn-join').disabled   = false;
    });
    peer.on('error', e => {
      setStatus('Errore connessione: ' + e.type + ' — ricarica la pagina', 'off');
    });
    // Host: ascolta connessioni
    peer.on('connection', c => {
      if (conn) return;
      conn = c;
      setupConn();
    });
  }

  // ── CREA STANZA ──────────────────────────────────────────
  function createRoom() {
    isHost = true;
    document.getElementById('btn-create').disabled = true;
    document.getElementById('btn-join').disabled   = true;
    const code = peer.id.replace('sok-', '');
    const codeEl = document.getElementById('my-code');
    codeEl.textContent = code;
    codeEl.classList.remove('empty');
    document.getElementById('btn-copy').style.display = 'inline-block';
    setStatus('Stanza ' + code + ' creata — aspetta l\'avversario', 'wait');
  }

  // ── UNISCITI STANZA ──────────────────────────────────────
  function joinRoom() {
    const digits = [];
    for (let i = 0; i < 6; i++) {
      const v = document.getElementById('d' + i).value.trim();
      if (!/^\d$/.test(v)) { alert('Inserisci tutte e 6 le cifre!'); return; }
      digits.push(v);
    }
    const code = digits.join('');
    isHost = false;
    setStatus('Connessione alla stanza ' + code + '…', 'wait');
    document.getElementById('btn-join').disabled   = true;
    document.getElementById('btn-create').disabled = true;
    conn = peer.connect('sok-' + code, { reliable: true, serialization: 'json' });
    setupConn();
  }

  function copyCode() {
    const code = document.getElementById('my-code').textContent.trim();
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('btn-copy');
      btn.textContent = '✓ Copiato!';
      setTimeout(() => btn.textContent = '📋 Copia codice', 1600);
    });
  }

  // ── SETUP CONNESSIONE ────────────────────────────────────
  function setupConn() {
    conn.on('open', () => {
      setStatus('Connesso!', 'on');
      me = loadPlayerStats();
      if (!me) {
        alert('Nessun salvataggio trovato! Gioca prima in modalità singola.');
        return;
      }
      myState = makeBattleState(me);
      send({ type: 'hello', stats: me });
    });

    conn.on('data', onData);

    conn.on('close', () => {
      setStatus('Connessione persa', 'off');
      if (!battleOver) pvpLog('⚠ Connessione persa.', 'log-sys');
    });

    conn.on('error', e => console.error('conn error:', e));
  }

  // ── MESSAGGI IN ENTRATA ──────────────────────────────────
  function onData(msg) {
    switch (msg.type) {

      case 'hello':
        opp      = msg.stats;
        oppState = makeBattleState(opp);
        startArena();
        break;

      case 'skill':
        // L'avversario ha mosso: applico la sua azione sul mio stato
        receiveOpponentSkill(msg.result);
        break;

      case 'surrender':
        battleOver = true;
        pvpLog(`${opp.name} si è arreso!`, 'log-sys');
        showResult('🏛', 'Vittoria per abbandono!', `${opp.name} ha alzato bandiera bianca.`);
        break;
    }
  }

  function send(msg) {
    if (conn && conn.open) conn.send(msg);
  }

  // ── AVVIA ARENA ──────────────────────────────────────────
  function startArena() {
    document.getElementById('lobby').style.display      = 'none';
    document.getElementById('pvp-arena').style.display  = 'flex';

    document.getElementById('pvp-my-name').textContent   = me.name;
    document.getElementById('pvp-my-title').textContent  = `Piano ${me.floor} · Reinc. ${me.prestige} · ATK ${me.atk} DEF ${me.def}`;
    document.getElementById('pvp-opp-name').textContent  = opp.name;
    document.getElementById('pvp-opp-title').textContent = `Piano ${opp.floor} · Reinc. ${opp.prestige} · ATK ${opp.atk} DEF ${opp.def}`;

    // Host va per primo
    myTurn = isHost;
    round  = 1;

    pvpLog(`✦ ${opp.name} si è unito al duello!`, 'log-sys');
    pvpLog(isHost
      ? '⚔ Sei il Host — vai per primo!'
      : '⚔ Il Host va per primo — aspetta il tuo turno.', 'log-sys');

    updateArena();
  }

  // ── UPDATE UI ARENA ──────────────────────────────────────
  function updateArena() {
    if (!me || !myState || !opp || !oppState) return;

    // My bars
    const myHpPct = myState.hp / myState.maxHp * 100;
    const myBar   = document.getElementById('pvp-my-hp-bar');
    myBar.style.width = myHpPct + '%';
    myBar.className   = 'bar-fill hp-fill'
      + (myHpPct < 25 ? ' critical' : myHpPct < 50 ? ' low' : '');
    document.getElementById('pvp-my-hp-txt').textContent = `${myState.hp}/${myState.maxHp}`;
    document.getElementById('pvp-my-mp-bar').style.width = `${myState.mp / myState.maxMp * 100}%`;
    document.getElementById('pvp-my-mp-txt').textContent = `${myState.mp}/${myState.maxMp}`;

    // Opp bars
    const oppHpPct = oppState.hp / oppState.maxHp * 100;
    document.getElementById('pvp-opp-hp-bar').style.width = `${oppHpPct}%`;
    document.getElementById('pvp-opp-hp-txt').textContent = `${oppState.hp}/${oppState.maxHp}`;
    document.getElementById('pvp-opp-mp-bar').style.width = `${oppState.mp / oppState.maxMp * 100}%`;
    document.getElementById('pvp-opp-mp-txt').textContent = `${oppState.mp}/${oppState.maxMp}`;

    // Punchline
    const hasEl = me.hasElation;
    const plWrap = document.getElementById('pvp-my-punchline');
    plWrap.classList.toggle('active', hasEl);
    if (hasEl) {
      document.getElementById('pvp-my-pl-txt').textContent  = myState.punchline;
      document.getElementById('pvp-my-pl-fill').style.width = `${Math.min(100, myState.punchline / 2)}%`;
      document.getElementById('pvp-pl-cost').textContent    = myState.punchline + '✦';
    }

    // Turn indicator
    document.getElementById('turn-badge').textContent = myTurn ? 'Il tuo turno' : 'Turno avversario';
    document.getElementById('pvp-my-card').classList.toggle('active-turn',  myTurn  && !battleOver);
    document.getElementById('pvp-opp-card').classList.toggle('active-turn', !myTurn && !battleOver);
    document.getElementById('pvp-round-label').textContent = `⚔ Duello — Turno ${round}`;

    // Statuses
    renderStatuses('pvp-my-statuses',  myState.statuses);
    renderStatuses('pvp-opp-statuses', oppState.statuses);

    // Skills row
    const skillsRow = document.getElementById('pvp-skills');
    skillsRow.className = 'pvp-skills' + (hasEl ? ' has-catarsi' : '');
    for (let i = 0; i < 5; i++) {
      const btn = document.getElementById('pvp-skill-' + i);
      if (!btn) continue;
      if (i === 4) {
        btn.style.display = hasEl ? '' : 'none';
        if (!hasEl) continue;
      }
      const cd    = myState.cooldowns[i] || 0;
      const noMp  = myState.mp < SKILLS_DEF[i].cost;
      const noPl  = i === 4 && myState.punchline <= 0;
      const notCD = cd > 0;
      btn.disabled = !myTurn || battleOver || noMp || noPl || notCD;

      // CD overlay
      const old = btn.querySelector('.skill-cd');
      if (old) old.remove();
      if (cd > 0) {
        btn.classList.add('on-cooldown');
        const cdDiv = document.createElement('div');
        cdDiv.className = 'skill-cd';
        cdDiv.textContent = cd;
        btn.appendChild(cdDiv);
      } else {
        btn.classList.remove('on-cooldown');
      }

      if (i === 4) btn.classList.toggle('catarsi-ready', myState.punchline > 0 && cd === 0);
    }

    // Stat chips
    document.getElementById('pvp-my-stats').innerHTML = `
      <div class="stat-chip"><span class="stat-chip-val">${me.atk}</span><span class="stat-chip-label">ATK</span></div>
      <div class="stat-chip"><span class="stat-chip-val">${me.def}</span><span class="stat-chip-label">DEF</span></div>
      <div class="stat-chip"><span class="stat-chip-val">${me.critChance}%</span><span class="stat-chip-label">CRIT</span></div>
      <div class="stat-chip"><span class="stat-chip-val">${me.critDmg}%</span><span class="stat-chip-label">CDMG</span></div>
      ${hasEl ? `<div class="stat-chip" style="border-color:rgba(255,184,48,.35)"><span class="stat-chip-val" style="color:var(--punchline)">${me.punchlineDmg}</span><span class="stat-chip-label" style="color:var(--punchline)">PL DMG</span></div>` : ''}
    `;
  }

  function renderStatuses(elId, statuses) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '';
    (statuses || []).forEach(s => {
      const b = document.createElement('span');
      b.className = 'status-badge '
        + (s.type === 'arcana' ? 'status-arcana' : s.type === 'buff' ? 'status-buff' : 'status-debuff');
      b.textContent = s.name + ' ' + s.turns;
      el.appendChild(b);
    });
  }

  // ─────────────────────────────────────────────────────────
  // CALCOLA RISULTATO SKILL (solo dal punto di vista di chi attacca)
  // Ritorna un oggetto "result" serializzabile da inviare via PeerJS
  // ─────────────────────────────────────────────────────────
  function computeSkillResult(idx, attackerStats, attackerState) {
    const sk   = SKILLS_DEF[idx];
    const bf   = new Set(attackerStats.blessingFlags);
    const sp   = new Set(attackerStats.specials);
    const st   = attackerState;

    // ATK effettivo con wounded rage
    let atkMult = 1;
    if (bf.has('woundedRage') && st.maxHp > 0) {
      const miss = Math.max(0, 1 - st.hp / st.maxHp);
      atkMult += Math.min(0.9, Math.floor(miss / 0.1) * 0.1);
    }
    const eAtk = Math.round(attackerStats.atk * atkMult);

    // Blood&Steel
    const bloodBoost = (bf.has('bloodSteel') && st.bloodSteelCharged) ? 1.5 : 1;

    const result = {
      idx,
      dmgToDefender:    0,
      healForAttacker:  0,
      attackerStatuses: [],
      defenderStatuses: [],
      newMpAttacker:    Math.max(0, st.mp - sk.cost),
      punchlineGain:    0,
      punchlineSpend:   false,
      catarsiNoCd:      false,
      logMsg:           '',
      logType:          'log-me',
      // usato solo lato opposto per calcolare difesa
      rawDmg:           0,
    };

    // Helper: calcola danno netto (senza def, la def viene applicata lato difensore)
    const raw = (base) => Math.max(1, Math.round(base));

    switch (idx) {
      case 0: { // Elenchos
        const hits      = sp.has('elenchosDouble') ? 2 : 1;
        const firstMult = (bf.has('firstSkillBoost') && !st.firstSkillUsed) ? 2 : 1;
        const silence   = st.statuses.find(s => s.type === 'silence');
        const silMult   = silence ? 0.5 : 1;
        let totalRaw = 0, totalNet = 0;
        for (let h = 0; h < hits; h++) {
          let base = eAtk * (1 + attackerStats.floor * 0.05) * firstMult * silMult * bloodBoost;
          const crit = Math.random() * 100 < attackerStats.critChance;
          if (crit) {
            base *= sp.has('critMult')
              ? (attackerStats.critDmg / 100) * 1.5
              : attackerStats.critDmg / 100;
            result.logType = 'log-crit';
          }
          totalRaw += raw(base);
          if (crit && bf.has('critDoubleHit') && Math.random() < 0.4)
            totalRaw += Math.max(1, Math.round(raw(base) * 0.7));
          // Punchline
          if (attackerStats.hasElation) {
            let pl = bf.has('comicTiming') ? 8 : 5;
            if (crit && bf.has('comicTiming')) pl += 5;
            if (crit && sp.has('crowdCrit'))   pl += 8;
            if (sp.has('jesterFlow'))          pl += 10;
            result.punchlineGain += pl;
          }
        }
        result.rawDmg      = totalRaw;
        result.dmgToDefender = totalRaw; // def sottratta lato ricevente
        const tags = [hits > 1 ? '×2' : null, firstMult > 1 ? '[Primo Sangue!]' : null,
                      silence ? '[Silenziato]' : null, bloodBoost > 1 ? '[Sangue+50%]' : null]
                     .filter(Boolean).join(' ');
        result.logMsg = `<b>Elenchos</b>${tags ? ' ' + tags : ''}: <b>${totalRaw}</b> danni grezzi.`;
        if (sp.has('logosAttackRegen')) result.newMpAttacker = Math.min(st.mp + 5, st.maxMp);
        break;
      }

      case 1: { // Maieutica
        const pct    = sp.has('maieuticaBoost') ? 0.38 : 0.18;
        const atFull = st.hp >= st.maxHp;
        if (bf.has('maieuticaFullHpBuff') && atFull) {
          result.attackerStatuses.push({ type:'buff', name:'Estasi+35%', turns:3 });
          result.logMsg = `<b>Maieutica</b> [Estasi]: +35% ATK × 3T.`;
        } else {
          const healed = Math.round(st.maxHp * pct + eAtk * 0.5);
          result.healForAttacker = healed;
          if (sp.has('maieuticaBoost')) {
            const hpDmg = Math.max(1, Math.round(st.hp * 0.20));
            result.dmgToDefender = hpDmg;
            result.rawDmg = hpDmg;
            result.logMsg = `<b>Maieutica</b> [4pc]: +${healed} HP, ${hpDmg} danni.`;
          } else {
            result.logMsg = `<b>Maieutica</b>: +${healed} HP.`;
          }
          if (bf.has('healDamage')) {
            const extra = Math.max(1, Math.round(healed * 0.2));
            result.dmgToDefender += extra;
            result.rawDmg += extra;
          }
        }
        result.attackerStatuses.push({ type:'buff', name:'Saggezza+', turns:3 });
        if (attackerStats.hasElation) result.punchlineGain += sp.has('jesterFlow') ? 15 : 5;
        if (sp.has('logosAttackRegen')) result.newMpAttacker = Math.min(st.mp - sk.cost + 5, st.maxMp);
        break;
      }

      case 2: { // Eironeia
        let turns  = sp.has('eironeiaBuff') ? 6 : 3;
        let atkMlt = sp.has('eironeiaBuff') ? 0.3 : 0.5;
        if (bf.has('extraDebuffTurns'))  turns  += 2;
        if (bf.has('eironeiaExtraAtk'))  atkMlt  = Math.max(0.1, atkMlt - 0.2);
        result.defenderStatuses.push({ type:'debuff', name:'Confuso', turns, atkMult: atkMlt });
        if (bf.has('confuseDefReduction'))
          result.defenderStatuses.push({ type:'defDebuff', name:'Corrosione', turns, defMult:0.7 });
        const initRaw = raw(eAtk * 0.8);
        result.rawDmg        = initRaw;
        result.dmgToDefender = initRaw;
        if (sp.has('arcanaCurse')) {
          const aDmg = Math.round(attackerStats.atk + attackerStats.def * 0.8);
          result.defenderStatuses.push({ type:'arcana', name:'Arcana', turns:3, dmg:aDmg });
          result.logMsg = `<b>Eironeia</b>! Confuso + Arcana [${aDmg}/T×3T], ${initRaw} danni.`;
        } else {
          result.logMsg = `<b>Eironeia</b>: Confuso ${turns}T, ${initRaw} danni.`;
        }
        if (attackerStats.hasElation) result.punchlineGain += sp.has('jesterFlow') ? 15 : 5;
        if (sp.has('logosAttackRegen')) result.newMpAttacker = Math.min(st.mp - sk.cost + 5, st.maxMp);
        break;
      }

      case 3: { // Aporia
        const hasAp   = sp.has('aporiaBoost');
        const boost   = hasAp ? 2.0 : 1.0;
        const numHits = hasAp ? (3 + Math.floor(Math.random() * 18)) : 3;
        const lScale  = sp.has('logosAttackRegen') ? (1 + st.maxMp * 0.003) : 1;
        const fMult   = (bf.has('firstSkillBoost') && !st.firstSkillUsed) ? 2 : 1;
        let totalRaw = 0;
        for (let i = 0; i < numHits; i++)
          totalRaw += raw(eAtk * 1.4 * boost * lScale * fMult);
        result.rawDmg        = totalRaw;
        result.dmgToDefender = totalRaw;
        result.logMsg  = `<b>Aporia</b>${hasAp ? ` [×${numHits}]` : ''}: <b>${totalRaw}</b> danni!`;
        result.logType = 'log-crit';
        if (attackerStats.hasElation) result.punchlineGain += sp.has('jesterFlow') ? 20 : 5;
        if (sp.has('logosAttackRegen')) result.newMpAttacker = Math.min(st.mp - sk.cost + 5, st.maxMp);
        break;
      }

      case 4: { // Catarsi
        if (!attackerStats.hasElation || st.punchline <= 0) return null;
        const pl  = st.punchline;
        let dmg   = Math.max(1, Math.round(attackerStats.punchlineDmg * Math.floor(pl * 3.5) / 100));
        let crit  = false;
        if (sp.has('crowdCrit') && Math.random() * 100 < attackerStats.critChance) {
          dmg  = Math.round(dmg * (attackerStats.critDmg / 100));
          crit = true;
        }
        result.rawDmg        = dmg;
        result.dmgToDefender = dmg; // Catarsi ignora def (è danno magico/assurdo)
        result.punchlineSpend = true;
        result.logMsg  = `<b>Catarsi</b> [${pl}✦ × 3.5]${crit ? ' CRITICO!' : ''}: <b>${dmg}</b> danni!`;
        result.logType = 'log-crit';
        if (bf.has('standingOvation') && pl >= 80)
          result.attackerStatuses.push({ type:'buff', name:'Ovazione+50%', turns:2 });
        result.catarsiNoCd = sp.has('jesterFlow') && pl >= 50;
        break;
      }

      default: return null;
    }

    // Marca firstSkillUsed nel state locale (solo side effect locale, non serializzato)
    st.firstSkillUsed = true;
    return result;
  }

  // ─────────────────────────────────────────────────────────
  // APPLICA RISULTATO SUL DIFENSORE (con la sua DEF)
  // ─────────────────────────────────────────────────────────
  function applyResultOnDefender(result, defenderState, defenderStats, defenderCard, attackerCard) {
    if (result.dmgToDefender > 0) {
      // First hit negate
      if (!defenderState.firstHitNegated && new Set(defenderStats.blessingFlags).has('firstHitNegate')) {
        defenderState.firstHitNegated = true;
        pvpLog('🛡 Scudo Riflesso: primo colpo negato!', 'log-sys');
        return;
      }

      // Calcola DEF effettiva (defDebuff toglie 30%)
      const hasDefDebuff = defenderState.statuses.find(s => s.type === 'defDebuff');
      const effDef = hasDefDebuff
        ? Math.round(defenderStats.def * 0.7)
        : defenderStats.def;

      // Per Catarsi (idx 4) il danno ignora DEF
      const actualDmg = result.idx === 4
        ? result.dmgToDefender
        : Math.max(1, result.dmgToDefender - effDef);

      // Last stand (broken_crown 4pc)
      const defSp = new Set(defenderStats.specials);
      if (!defenderState.phoenixUsed && defSp.has('lastStand') && defenderState.hp - actualDmg <= 0) {
        defenderState.phoenixUsed = true;
        defenderState.hp = 1;
        pvpLog('👁‍🗨 Last Stand! Sopravvivi a 1 HP!', 'log-sys');
      } else {
        defenderState.hp = Math.max(0, defenderState.hp - actualDmg);
      }
      pop(defenderCard, '-' + actualDmg, '#e08080');

      // Blood&Steel: quando il difensore prende danno carica il suo prossimo attacco
      if (new Set(defenderStats.blessingFlags).has('bloodSteel')) {
        defenderState.bloodSteelCharged = true;
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // APPLICA RISULTATO SULL'ATTACCANTE (heal, statuses, mp, punchline)
  // ─────────────────────────────────────────────────────────
  function applyResultOnAttacker(result, attackerState, attackerStats, attackerCard) {
    if (result.healForAttacker > 0) {
      attackerState.hp = Math.min(attackerState.hp + result.healForAttacker, attackerStats.maxHp);
      pop(attackerCard, '+' + result.healForAttacker, '#80ee80');
    }
    if (result.attackerStatuses?.length)
      attackerState.statuses.push(...result.attackerStatuses);
    if (result.defenderStatuses?.length)
      attackerState.statuses.push(); // non applicato sull'attaccante

    // MP
    attackerState.mp = Math.max(0, Math.min(result.newMpAttacker, attackerStats.maxMp));

    // Punchline
    if (result.punchlineGain > 0)
      attackerState.punchline = Math.min(200, attackerState.punchline + result.punchlineGain);
    if (result.punchlineSpend)
      attackerState.punchline = 0;
  }

  // ─────────────────────────────────────────────────────────
  // TICK FINE TURNO: DOT, regen, cooldowns, statuses
  // ─────────────────────────────────────────────────────────
  function tickState(state, stats) {
    // Arcana DOT
    const arcana = state.statuses.find(s => s.type === 'arcana');
    if (arcana && state.hp > 0) {
      state.hp = Math.max(0, state.hp - arcana.dmg);
      const card = (state === myState) ? 'pvp-my-card' : 'pvp-opp-card';
      pop(card, '-' + arcana.dmg, '#a080d0');
    }
    // Passive regen (abundance_2) — solo per me
    if (state === myState && new Set(stats.blessingFlags).has('passiveRegen') && state.hp > 0) {
      const reg = Math.round(stats.maxHp * 0.02);
      state.hp = Math.min(state.hp + reg, stats.maxHp);
      if (reg > 0) pop('pvp-my-card', '+' + reg, '#80ee80');
    }
    // Tick statuses
    state.statuses  = state.statuses.filter(s => { s.turns--; return s.turns > 0; });
    // MP regen
    state.mp        = Math.min(state.mp + stats.mpRegen, stats.maxMp);
    // Cooldowns
    state.cooldowns = state.cooldowns.map(cd => Math.max(0, cd - 1));
  }

  // ─────────────────────────────────────────────────────────
  // USA SKILL (turno locale)
  // ─────────────────────────────────────────────────────────
  function useSkill(idx) {
    if (!myTurn || battleOver) return;
    if (!me || !myState) return;

    const sk = SKILLS_DEF[idx];
    const cd = myState.cooldowns[idx] || 0;

    if (cd > 0) {
      pvpLog(`${sk.name} in ricarica: ${cd} turni.`, 'log-sys');
      return;
    }
    if (myState.mp < sk.cost) {
      pvpLog(`Logos insufficiente per ${sk.name}.`, 'log-sys');
      return;
    }
    if (idx === 4 && !me.hasElation)        return;
    if (idx === 4 && myState.punchline <= 0) {
      pvpLog('Nessuna Punchline accumulata!', 'log-sys');
      return;
    }

    // Calcola il risultato PRIMA di applicarlo
    const result = computeSkillResult(idx, me, myState);
    if (!result) return;

    // 1) Applica MP/punchline/heal/statuses sull'attaccante (me)
    applyResultOnAttacker(result, myState, me, 'pvp-my-card');

    // 2) Applica danno/statuses sul difensore (opp)
    applyResultOnDefender(result, oppState, opp, 'pvp-opp-card', 'pvp-my-card');

    // 3) Applica statuses sul difensore
    if (result.defenderStatuses?.length)
      oppState.statuses.push(...result.defenderStatuses);

    // 4) Cooldown
    const baseCds = [0, 3, 4, 5, 4];
    if (new Set(me.blessingFlags).has('maieuticaCdReduce') && idx === 1) baseCds[1] = 2;
    if (!result.catarsiNoCd && baseCds[idx] > 0) myState.cooldowns[idx] = baseCds[idx];

    // 5) Log
    pvpLog(`Hai usato ${result.logMsg}`, result.logType || 'log-me');

    // 6) Invia all'avversario
    send({ type: 'skill', result });

    // 7) Fine turno mio: tick entrambi, poi tocca all'avversario
    endMyTurn();
  }

  function endMyTurn() {
    // Tick: DOT, regen, cooldowns per entrambi
    tickState(myState,  me);
    tickState(oppState, opp);
    round++;
    myTurn = false;
    if (!checkEnd()) updateArena();
  }

  // ─────────────────────────────────────────────────────────
  // RICEVI MOSSA AVVERSARIO
  // ─────────────────────────────────────────────────────────
  function receiveOpponentSkill(result) {
    // L'avversario ha mosso: lui è attaccante, io sono difensore

    // 1) Applica danno su di me
    applyResultOnDefender(result, myState, me, 'pvp-my-card', 'pvp-opp-card');

    // 2) Applica statuses su di me (defenderStatuses dell'avversario = miei)
    if (result.defenderStatuses?.length)
      myState.statuses.push(...result.defenderStatuses);

    // 3) Aggiorna MP/punchline/heal avversario
    oppState.mp = Math.max(0, Math.min(result.newMpAttacker, opp.maxMp));
    if (result.healForAttacker > 0) {
      oppState.hp = Math.min(oppState.hp + result.healForAttacker, opp.maxHp);
      pop('pvp-opp-card', '+' + result.healForAttacker, '#80ee80');
    }
    if (result.attackerStatuses?.length)
      oppState.statuses.push(...result.attackerStatuses);
    if (result.punchlineGain > 0)
      oppState.punchline = Math.min(200, oppState.punchline + result.punchlineGain);
    if (result.punchlineSpend)
      oppState.punchline = 0;

    // 4) Cooldown avversario
    const baseCds = [0, 3, 4, 5, 4];
    if (new Set(opp.blessingFlags).has('maieuticaCdReduce') && result.idx === 1) baseCds[1] = 2;
    if (!result.catarsiNoCd && baseCds[result.idx] > 0)
      oppState.cooldowns[result.idx] = baseCds[result.idx];

    // 5) Log
    const logType = result.logType === 'log-crit' ? 'log-crit' : 'log-opp';
    pvpLog(`${opp.name} usa ${result.logMsg}`, logType);

    // 6) Tick entrambi
    tickState(oppState, opp);
    tickState(myState,  me);
    round++;
    myTurn = true;
    if (!checkEnd()) updateArena();
  }

  // ── CHECK FINE BATTAGLIA ─────────────────────────────────
  function checkEnd() {
    if (myState.hp <= 0 || oppState.hp <= 0) {
      battleOver = true;
      const iWon  = oppState.hp <= 0 && myState.hp > 0;
      const isDraw = myState.hp <= 0 && oppState.hp <= 0;
      showResult(
        isDraw ? '⚖' : iWon ? '🏛' : '💀',
        isDraw ? 'Pareggio!' : iWon ? 'Vittoria!' : 'Sconfitto…',
        isDraw
          ? 'Entrambi i filosofi cadono. La saggezza non ha vinto.'
          : iWon
            ? `Hai sconfitto ${opp.name}! La dialettica trionfa.`
            : `${opp.name} ha vinto. "Solo chi conosce i propri limiti può superarli."`
      );
      return true;
    }
    return false;
  }

  function showResult(icon, title, body) {
    document.getElementById('pvp-ov-icon').textContent  = icon;
    document.getElementById('pvp-ov-title').textContent = title;
    document.getElementById('pvp-ov-body').textContent  = body;
    document.getElementById('pvp-overlay').classList.add('show');
  }

  // ── RESA ─────────────────────────────────────────────────
  function surrender() {
    if (!confirm('Arrendersi?')) return;
    send({ type: 'surrender' });
    battleOver = true;
    showResult('🏳', 'Resa…', '"La vera saggezza è conoscere quando fermarsi."');
  }

  // ── DIGIT INPUT ──────────────────────────────────────────
  function initDigitInputs() {
    for (let i = 0; i < 6; i++) {
      const inp = document.getElementById('d' + i);
      if (!inp) continue;
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(-1);
        if (inp.value && i < 5) document.getElementById('d' + (i + 1))?.focus();
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !inp.value && i > 0)
          document.getElementById('d' + (i - 1))?.focus();
      });
      inp.addEventListener('paste', e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData)
          .getData('text').replace(/\D/g, '').slice(0, 6);
        for (let j = 0; j < text.length; j++) {
          const t = document.getElementById('d' + j);
          if (t) t.value = text[j];
        }
        document.getElementById('d' + Math.min(text.length, 5))?.focus();
      });
    }
  }

  // ── INIT ─────────────────────────────────────────────────
  function init() {
    const stats = loadPlayerStats();
    const nameEl = document.getElementById('preview-name');
    const subEl  = document.getElementById('preview-sub');
    if (stats) {
      nameEl.textContent = stats.name;
      subEl.textContent  =
        `Piano ${stats.floor} · Reinc. ${stats.prestige} · ${stats.kills} vittorie`
        + ` · ATK ${stats.atk} / HP ${stats.maxHp} / DEF ${stats.def}`
        + ` · Crit ${stats.critChance}% / CritDMG ${stats.critDmg}%`;
    } else {
      nameEl.textContent = 'Nessun salvataggio trovato';
      subEl.textContent  = 'Gioca prima in modalità singola per creare un profilo.';
    }

    initDigitInputs();
    setStatus('Connessione al server PeerJS…', 'wait');
    initPeer();
  }

  return { init, createRoom, joinRoom, copyCode, useSkill, surrender };
})();

PVP.init();
