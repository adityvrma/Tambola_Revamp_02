/* ============================================================================
   DIWALI TAMBOLA PRO ENGINE (CLOUD REALTIME DATABASE + 100 PLAYERS + 10 ROUNDS)
   ============================================================================ */

// 👇 BHAI APNA FIREBASE REALTIME DATABASE URL YAHAN DOUBLE QUOTES KE ANDAR PASTE KAR:
const FIREBASE_DB_URL = "https://tambola1-default-rtdb.firebaseio.com/";

const STORAGE_KEY = 'DIWALI_TAMBOLA_PRO_V2';
const ADMIN_CREDENTIALS = { id: 'admin', pass: 'diwali123' };

const syncChannel = ('BroadcastChannel' in window)
  ? new BroadcastChannel('diwali_tambola_pro_channel')
  : null;

// MODULE 1: Strict Game Lifecycle States
const GAME_STATES = {
  SETUP: 'SETUP',
  LOBBY: 'LOBBY',
  LIVE_CALLING: 'LIVE_CALLING',
  CLAIM_PAUSED: 'CLAIM_PAUSED',
  MANUAL_PAUSED: 'MANUAL_PAUSED',
  COMPLETED: 'COMPLETED'
};

// Tambola Lingo / Callouts (1 to 90)
const TAMBOLA_LINGO = {
  1: "Kelly's Eye / Ekka Shagun Ka! 🪔",
  2: "One Little Duck 🦆",
  3: "Cup of Tea / Teen Tigada ✨",
  4: "Knock at the Door 🚪",
  5: "Man Alive / Shagun Ke Paanch 🖐️",
  6: "Super Sixer! 🏏",
  7: "Lucky Seven 🌟",
  8: "Garden Gate / Big Fat Lady 🍬",
  9: "Doctor's Orders / Navratri 🙏",
  10: "Dus Numbri 🎉",
  11: "Legs Eleven / Doosri Diwali Ki Gyarah 🪔",
  13: "Unlucky for Some, Lucky for You! 🍀",
  16: "Sweet Sixteen ✨",
  21: "Shagun ka Ikkis Rupaiya 💰",
  22: "Two Little Ducks (22) 🦆🦆",
  25: "Duck and Dive / Silver Jubilee 🪙",
  33: "All the Threes - Dirty Knees 🔥",
  44: "Droopy Drawers / Chor-Chor (44) 🚨",
  45: "Halfway There (45) ⚡",
  50: "Half a Century! पचास का तड़का 🏏",
  55: "Snakes Alive / Pachpan Ki Umar 💛",
  66: "Clickety Click / Chhakke Pe Chhakka 🚀",
  69: "Either Way Up / Ulta Pulta 😂",
  77: "Sunset Strip / Two Hockey Sticks 🏑",
  88: "Two Fat Ladies (88) 💃",
  89: "Nearly There (Ab Bus 90 Baki!) ⚡",
  90: "Top of the House - Sabse Bada 90! 🏆"
};

function getNumberLingo(num) {
  if (!num) return "Waiting for number draw... 🪔";
  if (TAMBOLA_LINGO[num]) return TAMBOLA_LINGO[num];
  const tens = Math.floor(num / 10);
  const units = num % 10;
  if (num < 10) return `Single Digit #${num} 🪔`;
  if (units === 0) return `Blind ${num} - Round Figure Dhamaka! 🎆`;
  return `${tens} and ${units}, Number ${num} ✨`;
}

// MODULE 3: Exhaustive 20 Winning Dividends Catalog
const MASTER_DIVIDENDS_CATALOG = [
  { id: 'EARLY_5', name: 'Early 5 (Jaldi 5)', icon: '🎆', desc: 'First 5 numbers marked on ticket', defaultSlots: 1, defaultPoints: 100, defaultChecked: true },
  { id: 'EARLY_7', name: 'Early 7 (Jaldi 7)', icon: '🎇', desc: 'First 7 numbers marked on ticket', defaultSlots: 1, defaultPoints: 100, defaultChecked: false },
  { id: 'TOP_LINE', name: 'Top Line', icon: '🪔', desc: 'All 5 numbers of Row 1', defaultSlots: 1, defaultPoints: 150, defaultChecked: true },
  { id: 'MIDDLE_LINE', name: 'Middle Line', icon: '🍬', desc: 'All 5 numbers of Row 2', defaultSlots: 1, defaultPoints: 150, defaultChecked: true },
  { id: 'BOTTOM_LINE', name: 'Bottom Line', icon: '🟠', desc: 'All 5 numbers of Row 3', defaultSlots: 1, defaultPoints: 150, defaultChecked: true },
  { id: 'FOUR_CORNERS', name: 'Four Corners', icon: '✨', desc: '1st & last of Top Row + 1st & last of Bottom Row', defaultSlots: 1, defaultPoints: 150, defaultChecked: true },
  { id: 'LADDU', name: 'Center / Laddu', icon: '🟡', desc: 'Exact 3rd (middle) number of Row 2', defaultSlots: 1, defaultPoints: 100, defaultChecked: true },
  { id: 'KING_CORNERS', name: 'King Corners (Star)', icon: '👑', desc: '4 Corners + Center Laddu (5 numbers)', defaultSlots: 1, defaultPoints: 200, defaultChecked: false },
  { id: 'BAMBOO', name: 'Bamboo (Center Column)', icon: '🎋', desc: '3rd number of Row 1, Row 2, and Row 3', defaultSlots: 1, defaultPoints: 150, defaultChecked: false },
  { id: 'BREAKFAST', name: 'Breakfast (1–29)', icon: '☕', desc: 'All numbers in Cols 1, 2, 3 (1 to 29)', defaultSlots: 1, defaultPoints: 150, defaultChecked: false },
  { id: 'LUNCH', name: 'Lunch (30–59)', icon: '🍛', desc: 'All numbers in Cols 4, 5, 6 (30 to 59)', defaultSlots: 1, defaultPoints: 150, defaultChecked: false },
  { id: 'DINNER', name: 'Dinner (60–90)', icon: '🍽️', desc: 'All numbers in Cols 7, 8, 9 (60 to 90)', defaultSlots: 1, defaultPoints: 150, defaultChecked: false },
  { id: 'TEMPERATURE', name: 'Temperature / BP', icon: '🌡️', desc: 'Smallest number + Largest number on ticket', defaultSlots: 1, defaultPoints: 120, defaultChecked: true },
  { id: 'JAWAANI', name: 'Jawaani (Young 1–45)', icon: '💃', desc: 'All ticket numbers between 1 and 45', defaultSlots: 1, defaultPoints: 200, defaultChecked: false },
  { id: 'BUDHAPA', name: 'Budhapa (Old 46–90)', icon: '👴', desc: 'All ticket numbers between 46 and 90', defaultSlots: 1, defaultPoints: 200, defaultChecked: false },
  { id: 'PYRAMID', name: 'Pyramid Pattern', icon: '🔺', desc: 'Row1(3rd) + Row2(2nd,4th) + Row3(1st,3rd,5th)', defaultSlots: 1, defaultPoints: 200, defaultChecked: false },
  { id: 'UNLUCKY_ONE', name: 'Unlucky One (0 After 12 Calls)', icon: '😅', desc: '0 numbers called on ticket after 12+ draws', defaultSlots: 1, defaultPoints: 100, defaultChecked: false },
  { id: 'HALF_SHEET', name: 'Half Sheet Bonus (3 Tickets)', icon: '📑', desc: 'At least 2 numbers marked on 3 tickets', defaultSlots: 1, defaultPoints: 250, defaultChecked: false },
  { id: 'FULL_SHEET', name: 'Full Sheet Bonus (6 Tickets)', icon: '📚', desc: 'At least 2 numbers marked on all 6 tickets', defaultSlots: 1, defaultPoints: 400, defaultChecked: false },
  { id: 'FULL_HOUSE', name: 'Full House (All 15)', icon: '🏆', desc: 'All 15 numbers on a ticket', defaultSlots: 2, defaultPoints: 500, defaultChecked: true }
];

function getTimeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function generateShuffledPool90() {
  const arr = Array.from({ length: 90 }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ============================================================================
   MODULE 2: EXACT FULL-SHEET (6-TICKET STRIP) MATHEMATICAL GENERATOR
   ============================================================================ */

const COL_RANGES = [
  [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
  [50, 59], [60, 69], [70, 79], [80, 90]
];

function computeTicketHash(grid) {
  const nums = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== null && grid[r][c] > 0) {
        nums.push(String(grid[r][c]).padStart(2, '0'));
      }
    }
  }
  return nums.sort().join('-');
}

function generateFullSheetStrip(existingHashes = new Set()) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const colPools = COL_RANGES.map(([min, max]) => {
      const p = [];
      for (let n = min; n <= max; n++) p.push(n);
      p.sort(() => Math.random() - 0.5);
      return p;
    });

    const colCounts = Array.from({ length: 6 }, () => Array(9).fill(1));
    const colRemaining = [3, 4, 4, 4, 4, 4, 4, 4, 5];
    const ticketRemaining = [6, 6, 6, 6, 6, 6];

    let allocationSuccess = true;
    for (let c = 0; c < 9; c++) {
      let rem = colRemaining[c];
      while (rem > 0) {
        const candidates = [0, 1, 2, 3, 4, 5].filter(
          t => ticketRemaining[t] > 0 && colCounts[t][c] < 3
        );
        if (candidates.length === 0) {
          allocationSuccess = false;
          break;
        }
        candidates.sort((a, b) => (ticketRemaining[b] - ticketRemaining[a]) || (Math.random() - 0.5));
        const chosenT = candidates[0];
        colCounts[chosenT][c]++;
        ticketRemaining[chosenT]--;
        rem--;
      }
      if (!allocationSuccess) break;
    }

    if (!allocationSuccess || ticketRemaining.some(r => r !== 0)) continue;

    const stripGrids = [];
    let stripValid = true;

    for (let t = 0; t < 6; t++) {
      const counts = colCounts[t];
      const gridMask = Array.from({ length: 3 }, () => Array(9).fill(0));
      const rowSums = [0, 0, 0];

      for (let c = 0; c < 9; c++) {
        if (counts[c] === 3) {
          gridMask[0][c] = 1; gridMask[1][c] = 1; gridMask[2][c] = 1;
          rowSums[0]++; rowSums[1]++; rowSums[2]++;
        }
      }
      for (let c = 0; c < 9; c++) {
        if (counts[c] === 2) {
          const rowsOrder = [0, 1, 2].sort((a, b) => (rowSums[a] - rowSums[b]) || (Math.random() - 0.5));
          gridMask[rowsOrder[0]][c] = 1;
          gridMask[rowsOrder[1]][c] = 1;
          rowSums[rowsOrder[0]]++;
          rowSums[rowsOrder[1]]++;
        }
      }
      for (let c = 0; c < 9; c++) {
        if (counts[c] === 1) {
          const rowsOrder = [0, 1, 2].sort((a, b) => (rowSums[a] - rowSums[b]) || (Math.random() - 0.5));
          gridMask[rowsOrder[0]][c] = 1;
          rowSums[rowsOrder[0]]++;
        }
      }

      if (rowSums[0] !== 5 || rowSums[1] !== 5 || rowSums[2] !== 5) {
        stripValid = false;
        break;
      }

      const finalGrid = Array.from({ length: 3 }, () => Array(9).fill(null));
      for (let c = 0; c < 9; c++) {
        const k = counts[c];
        const drawn = colPools[c].splice(0, k).sort((a, b) => a - b);
        let idx = 0;
        for (let r = 0; r < 3; r++) {
          if (gridMask[r][c] === 1) {
            finalGrid[r][c] = drawn[idx++];
          }
        }
      }

      const hash = computeTicketHash(finalGrid);
      if (existingHashes.has(hash)) {
        stripValid = false;
        break;
      }
      stripGrids.push({ grid: finalGrid, hash });
    }

    if (stripValid && stripGrids.length === 6) {
      return stripGrids;
    }
  }
  return [];
}

/* ============================================================================
   FIREBASE DATA NORMALIZER (Prevents Firebase Empty Array / Null Stripping Bugs)
   ============================================================================ */

function normalizeRoomState(state) {
  if (!state || typeof state !== 'object') return createDefaultRoomState();

  state.calledNumbers = Array.isArray(state.calledNumbers) ? state.calledNumbers : [];
  state.numberPool = Array.isArray(state.numberPool) ? state.numberPool : [];
  state.currentNumber = state.currentNumber !== undefined ? state.currentNumber : null;
  state.players = state.players && typeof state.players === 'object' ? state.players : {};
  state.tickets = state.tickets && typeof state.tickets === 'object' ? state.tickets : {};
  state.ticketHashes = Array.isArray(state.ticketHashes) ? state.ticketHashes : [];
  state.activity = Array.isArray(state.activity) ? state.activity : [];
  state.pastRounds = Array.isArray(state.pastRounds) ? state.pastRounds.slice(0, 10) : [];

  state.settings = Object.assign({
    ticketDistributionMode: 'SELF_PICK',
    maxTicketsPerPlayer: 6,
    callingMode: 'AUTO',
    autoCallIntervalSec: 8,
    claimVerificationMode: 'AUTO',
    tappingMode: 'HARDCORE',
    strictLastNumberRule: true,
    allowJointWinners: true,
    claimWindowSec: 5,
    maxBogeysPerTicket: 2
  }, state.settings || {});

  Object.keys(state.players).forEach(pid => {
    const p = state.players[pid];
    if (p) {
      p.ticketIds = Array.isArray(p.ticketIds) ? p.ticketIds : [];
      p.requestedTickets = p.requestedTickets || 0;
    }
  });

  Object.keys(state.tickets).forEach(tid => {
    const t = state.tickets[tid];
    if (t) {
      t.markedNumbers = Array.isArray(t.markedNumbers) ? t.markedNumbers.map(Number) : [];
      t.bogeyCount = t.bogeyCount || 0;
      t.isDisqualified = Boolean(t.isDisqualified);
      const normGrid = [];
      for (let r = 0; r < 3; r++) {
        const row = (t.grid && t.grid[r]) ? t.grid[r] : [];
        const normRow = [];
        for (let c = 0; c < 9; c++) {
          const val = row[c];
          normRow.push(val !== undefined && val !== null && Number(val) > 0 ? Number(val) : null);
        }
        normGrid.push(normRow);
      }
      t.grid = normGrid;
    }
  });

  state.dividends = Array.isArray(state.dividends) ? state.dividends : [];
  state.dividends.forEach(d => {
    d.winners = Array.isArray(d.winners) ? d.winners : [];
  });

  state.pastRounds.forEach(r => {
    r.calledNumbers = Array.isArray(r.calledNumbers) ? r.calledNumbers : [];
    r.dividends = Array.isArray(r.dividends) ? r.dividends : [];
    r.dividends.forEach(d => {
      d.winners = Array.isArray(d.winners) ? d.winners : [];
    });
  });

  return state;
}

/* ============================================================================
   CLOUD REALTIME DATABASE ENGINE (FIREBASE WEBSOCKET + ATOMIC MULTI-USER SYNC)
   ============================================================================ */

let firebaseDbRef = null;
let isCloudConnected = false;

function isFirebaseConfigured() {
  return (
    FIREBASE_DB_URL &&
    FIREBASE_DB_URL.trim().startsWith('https://') &&
    !FIREBASE_DB_URL.includes('PASTE_YOUR_FIREBASE_URL_HERE')
  );
}

function updateCloudStatusBadge(text, colorHex) {
  let badge = document.getElementById('cloudSyncStatusBadge');
  if (!badge) {
    const topBar = document.querySelector('.control-title');
    if (topBar) {
      badge = document.createElement('span');
      badge.id = 'cloudSyncStatusBadge';
      badge.style.cssText = 'font-size:0.72rem; padding:3px 10px; border-radius:999px; font-weight:700; margin-left:6px; border:1px solid currentColor;';
      topBar.appendChild(badge);
    }
  }
  if (badge) {
    badge.textContent = text;
    badge.style.color = colorHex;
  }
}

function loadScriptAsync(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function initCloudDatabaseSync() {
  if (!isFirebaseConfigured()) {
    updateCloudStatusBadge('🔴 Local Mode (Add Firebase URL in js/game.js)', '#fca5a5');
    return;
  }

  updateCloudStatusBadge('🟡 Connecting Cloud DB...', '#fde68a');
  const cleanUrl = FIREBASE_DB_URL.trim().replace(/\/+$/, '');

  try {
    if (!window.firebase) {
      await loadScriptAsync('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      await loadScriptAsync('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
    }

    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: cleanUrl });
    }

    firebaseDbRef = firebase.database().ref('diwaliTambolaRoom_v2');

    // Monitor live connection status
    firebase.database().ref('.info/connected').on('value', (snap) => {
      if (snap.val() === true) {
        isCloudConnected = true;
        updateCloudStatusBadge('🟢 Cloud DB Live (100+ Players)', '#6ee7b7');
      } else {
        isCloudConnected = false;
        updateCloudStatusBadge('🟡 Reconnecting Cloud...', '#fde68a');
      }
    });

    // Listen to real-time updates from Cloud Database
    firebaseDbRef.on('value', (snapshot) => {
      const cloudVal = snapshot.val();
      if (!cloudVal) {
        // First time ever: initialize room in Cloud if Admin page is open
        const localState = getRoomState();
        firebaseDbRef.set(localState);
        return;
      }

      const normalized = normalizeRoomState(cloudVal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

      // Keep Room Code input synced on Player Join modal
      const joinCodeEl = document.getElementById('joinRoomCode');
      if (joinCodeEl) joinCodeEl.value = normalized.roomCode;

      // Refresh UI immediately on whichever page is open
      if (typeof renderAdminFullState === 'function') {
        renderAdminFullState();
      }
      if (typeof renderPlayerApp === 'function') {
        renderPlayerApp();
      }
    });
  } catch (err) {
    console.error('Firebase connection error:', err);
    updateCloudStatusBadge('🔴 Cloud DB Error (Check URL)', '#fca5a5');
  }
}

/* ============================================================================
   ROOM STATE GETTER & ATOMIC MULTI-PLAYER SAVER
   ============================================================================ */

function createDefaultRoomState() {
  const roomCode = 'TMB' + Math.floor(100 + Math.random() * 900);
  const hostSecretToken = 'adm_sec_' + Math.floor(100000 + Math.random() * 900000);

  const defaultDividends = MASTER_DIVIDENDS_CATALOG
    .filter(d => d.defaultChecked)
    .map(d => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
      desc: d.desc,
      totalSlots: d.defaultSlots,
      prizePoints: d.defaultPoints,
      status: 'OPEN',
      claimWindowEndsAt: null,
      claimWindowNumber: null,
      winners: []
    }));

  return {
    roomCode,
    round: 1,
    title: 'Diwali Royal Family Tambola',
    hostSecretToken,
    status: GAME_STATES.SETUP,
    settings: {
      ticketDistributionMode: 'SELF_PICK',
      maxTicketsPerPlayer: 6,
      callingMode: 'AUTO',
      autoCallIntervalSec: 8,
      claimVerificationMode: 'AUTO',
      tappingMode: 'HARDCORE',
      strictLastNumberRule: true,
      allowJointWinners: true,
      claimWindowSec: 5,
      maxBogeysPerTicket: 2
    },
    numberPool: generateShuffledPool90(),
    calledNumbers: [],
    currentNumber: null,
    dividends: defaultDividends,
    players: {},
    tickets: {},
    ticketHashes: [],
    nextTicketCounter: 101,
    pendingManualClaim: null,
    lastToast: null,
    lastReaction: null,
    activity: [
      { text: `Room ${roomCode} initialized in SETUP state.`, time: getTimeStr() }
    ],
    pastRounds: []
  };
}

function getRoomState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = createDefaultRoomState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  const parsed = normalizeRoomState(JSON.parse(raw));
  checkAndFinalizeGraceWindows(parsed);
  return parsed;
}

// Atomic Cloud Sync: Prevents 100 simultaneous players from overwriting each other!
function saveRoomState(state, eventType = 'STATE_UPDATED', payload = null) {
  state.pastRounds = Array.isArray(state.pastRounds) ? state.pastRounds.slice(0, 10) : [];
  state.activity = Array.isArray(state.activity) ? state.activity.slice(0, 60) : [];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (syncChannel) {
    syncChannel.postMessage({ type: eventType, payload });
  }

  if (!firebaseDbRef) return;

  const isPlayerPage = window.location.pathname.toLowerCase().includes('player');
  const myPid = localStorage.getItem('TAMBOLA_PLAYER_TOKEN');

  if (isPlayerPage) {
    const updates = {};

    // 1. Fast surgical update when a player taps/marks a number on their ticket
    if (eventType === 'PLAYER_MARKED' && myPid && state.players[myPid]) {
      state.players[myPid].ticketIds.forEach(tid => {
        if (state.tickets[tid]) {
          updates[`tickets/${tid}/markedNumbers`] = state.tickets[tid].markedNumbers;
        }
      });
      firebaseDbRef.update(updates);
      return;
    }

    // 2. Surgical update when a player sends an emoji reaction
    if (eventType === 'LIVE_REACTION') {
      firebaseDbRef.update({
        lastReaction: state.lastReaction,
        activity: state.activity
      });
      return;
    }

    // 3. Surgical update when a player submits a prize claim
    if (
      eventType === 'CLAIM_SUBMITTED' ||
      eventType === 'CLAIM_APPROVED' ||
      eventType === 'CLAIM_REJECTED'
    ) {
      updates['status'] = state.status;
      updates['dividends'] = state.dividends;
      updates['pendingManualClaim'] = state.pendingManualClaim || null;
      updates['lastToast'] = state.lastToast || null;
      updates['activity'] = state.activity;
      updates['pastRounds'] = state.pastRounds;
      if (myPid && state.players[myPid]) {
        state.players[myPid].ticketIds.forEach(tid => {
          if (state.tickets[tid]) {
            updates[`tickets/${tid}`] = state.tickets[tid];
          }
        });
      }
      firebaseDbRef.update(updates);
      return;
    }

    // 4. Player joins, picks tickets, or shuffles tickets in Lobby
    if (myPid && state.players[myPid]) {
      updates[`players/${myPid}`] = state.players[myPid];
      state.players[myPid].ticketIds.forEach(tid => {
        if (state.tickets[tid]) {
          updates[`tickets/${tid}`] = state.tickets[tid];
        }
      });
      updates['ticketHashes'] = state.ticketHashes;
      updates['activity'] = state.activity;
      firebaseDbRef.update(updates);
    }
    return;
  }

  // Admin Page Surgical Update when drawing a number (preserves live player marks!)
  if (eventType === 'NUMBER_DRAWN') {
    firebaseDbRef.update({
      status: state.status,
      numberPool: state.numberPool,
      calledNumbers: state.calledNumbers,
      currentNumber: state.currentNumber,
      dividends: state.dividends,
      lastToast: state.lastToast || null,
      activity: state.activity,
      pastRounds: state.pastRounds
    });
    return;
  }

  // Admin full state save (Setup, Lobby Management, Round Reset, Claim Resolution)
  firebaseDbRef.set(state);
}

function addRoomActivity(state, text) {
  state.activity.unshift({ text, time: getTimeStr() });
  if (state.activity.length > 60) state.activity.pop();
}

function triggerGlobalToast(state, message) {
  state.lastToast = { id: Date.now() + Math.random(), message };
}

// Collision-proof Ticket Allocation for 100+ Concurrent Players
function issueTicketsToPlayer(state, playerId, count) {
  const player = state.players[playerId];
  if (!player) return [];

  // Remove any old tickets belonging to this player from Cloud DB if they are re-picking
  if (firebaseDbRef && Array.isArray(player.ticketIds)) {
    player.ticketIds.forEach(oldId => {
      if (! state.tickets[oldId]) {
        firebaseDbRef.child(`tickets/${oldId}`).remove();
      }
    });
  }

  const existingHashes = new Set(state.ticketHashes || []);
  const issuedIds = [];
  const sheetId = 'sheet_' + Date.now();

  let poolOfGrids = [];
  while (poolOfGrids.length < count) {
    const strip = generateFullSheetStrip(existingHashes);
    strip.forEach(item => existingHashes.add(item.hash));
    poolOfGrids.push(...strip);
  }

  for (let i = 0; i < count; i++) {
    let tId = 'T' + Math.floor(1000 + Math.random() * 9000);
    while (state.tickets[tId]) {
      tId = 'T' + Math.floor(1000 + Math.random() * 9000);
    }

    const { grid, hash } = poolOfGrids[i];
    state.tickets[tId] = {
      ticketId: tId,
      roomCode: state.roomCode,
      playerId: playerId,
      playerName: player.name,
      sheetId: sheetId,
      grid: grid,
      hash: hash,
      markedNumbers: [],
      bogeyCount: 0,
      isDisqualified: false
    };
    state.ticketHashes.push(hash);
    player.ticketIds.push(tId);
    issuedIds.push(tId);
  }
  return issuedIds;
}

/* ============================================================================
   MODULE 6: ZERO-FLAW MATHEMATICAL VALIDATION & ANTI-CHEAT ENGINE
   ============================================================================ */

function getPatternNumbersForTicket(ticket, dividendId) {
  const grid = ticket.grid;
  const rowNums = (r) => grid[r].filter(n => n !== null && n > 0);
  const r0 = rowNums(0);
  const r1 = rowNums(1);
  const r2 = rowNums(2);
  const all15 = [...r0, ...r1, ...r2];

  switch (dividendId) {
    case 'TOP_LINE':
      return r0;
    case 'MIDDLE_LINE':
      return r1;
    case 'BOTTOM_LINE':
      return r2;
    case 'FOUR_CORNERS':
      return [r0[0], r0[r0.length - 1], r2[0], r2[r2.length - 1]];
    case 'LADDU':
      return [r1[2]];
    case 'KING_CORNERS':
      return [r0[0], r0[r0.length - 1], r2[0], r2[r2.length - 1], r1[2]];
    case 'BAMBOO':
      return [r0[2], r1[2], r2[2]];
    case 'BREAKFAST':
      return all15.filter(n => n >= 1 && n <= 29);
    case 'LUNCH':
      return all15.filter(n => n >= 30 && n <= 59);
    case 'DINNER':
      return all15.filter(n => n >= 60 && n <= 90);
    case 'TEMPERATURE': {
      const sorted = [...all15].sort((a, b) => a - b);
      return [sorted[0], sorted[sorted.length - 1]];
    }
    case 'JAWAANI':
      return all15.filter(n => n >= 1 && n <= 45);
    case 'BUDHAPA':
      return all15.filter(n => n >= 46 && n <= 90);
    case 'PYRAMID':
      return [r0[2], r1[1], r1[3], r2[0], r2[2], r2[4]];
    case 'FULL_HOUSE':
      return all15;
    default:
      return all15;
  }
}

function evaluateClaimValidity(state, playerId, ticketId, dividendId) {
  const player = state.players[playerId];
  const ticket = state.tickets[ticketId];
  const dividend = state.dividends.find(d => d.id === dividendId);

  if (!player || !ticket || !dividend) {
    return { valid: false, isBogey: false, reason: 'Invalid ticket or dividend.' };
  }
  if (ticket.isDisqualified) {
    return { valid: false, isBogey: false, reason: `Ticket #${ticketId} is DISQUALIFIED due to Bogeys!` };
  }
  if (dividend.status === 'CLAIMED') {
    return { valid: false, isBogey: false, reason: `${dividend.name} is already closed!` };
  }
  if (dividend.winners.some(w => w.playerId === playerId && w.ticketId === ticketId)) {
    return { valid: false, isBogey: false, reason: 'You already won this dividend on this ticket!' };
  }

  const calledSet = new Set(state.calledNumbers);
  const markedSet = new Set(ticket.markedNumbers);

  if (dividendId === 'HALF_SHEET' || dividendId === 'FULL_SHEET') {
    const reqTickets = dividendId === 'HALF_SHEET' ? 3 : 6;
    const activePlayerTickets = player.ticketIds
      .map(id => state.tickets[id])
      .filter(t => t && !t.isDisqualified);

    if (activePlayerTickets.length < reqTickets) {
      return {
        valid: false,
        isBogey: false,
        reason: `${dividend.name} requires at least ${reqTickets} active tickets!`
      };
    }

    const qualifyingTickets = activePlayerTickets.filter(t => {
      const validMarks = t.markedNumbers.filter(n => calledSet.has(n));
      const invalidMarks = t.markedNumbers.filter(n => !calledSet.has(n));
      return validMarks.length >= 2 && invalidMarks.length === 0;
    });

    if (qualifyingTickets.length < reqTickets) {
      return {
        valid: false,
        isBogey: true,
        reason: `Bogey! You need at least 2 valid called numbers marked on ${reqTickets} tickets.`
      };
    }
    return { valid: true, isBogey: false, reason: 'Valid Sheet Bonus Claim!', patternNumbers: [] };
  }

  if (dividendId === 'UNLUCKY_ONE') {
    if (state.calledNumbers.length < 12) {
      return { valid: false, isBogey: false, reason: 'Unlucky One can only be claimed after at least 12 numbers are called!' };
    }
    const all15 = getPatternNumbersForTicket(ticket, 'FULL_HOUSE');
    const anyCalled = all15.some(n => calledSet.has(n));
    if (anyCalled) {
      return { valid: false, isBogey: true, reason: 'Bogey! One or more numbers on your ticket have already been called!' };
    }
    return { valid: true, isBogey: false, reason: 'Valid Unlucky One Claim!', patternNumbers: [] };
  }

  if (dividendId === 'EARLY_5' || dividendId === 'EARLY_7') {
    const targetCount = dividendId === 'EARLY_5' ? 5 : 7;
    const all15 = getPatternNumbersForTicket(ticket, 'FULL_HOUSE');
    const markedOnTicket = all15.filter(n => markedSet.has(n));

    if (markedOnTicket.length < targetCount) {
      return {
        valid: false,
        isBogey: true,
        reason: `Bogey! You have only marked ${markedOnTicket.length}/${targetCount} numbers on Ticket #${ticketId}.`
      };
    }

    const uncalledMarked = markedOnTicket.filter(n => !calledSet.has(n));
    if (uncalledMarked.length > 0) {
      return {
        valid: false,
        isBogey: true,
        reason: `BOGEY! You marked uncalled number(s): ${uncalledMarked.join(', ')}!`
      };
    }

    if (state.settings.strictLastNumberRule) {
      const calledOnTicket = all15.filter(n => calledSet.has(n));
      calledOnTicket.sort((a, b) => state.calledNumbers.indexOf(a) - state.calledNumbers.indexOf(b));
      const completionNumber = calledOnTicket[targetCount - 1];
      if (completionNumber !== state.currentNumber) {
        return {
          valid: false,
          isBogey: false,
          reason: `Late Claim! Your ${dividend.name} completed on number ${completionNumber}, but current number is ${state.currentNumber}!`
        };
      }
    }

    return { valid: true, isBogey: false, reason: `Valid ${dividend.name} Claim!`, patternNumbers: markedOnTicket };
  }

  const patternNums = getPatternNumbersForTicket(ticket, dividendId);
  if (patternNums.length === 0) {
    return { valid: false, isBogey: true, reason: 'Your ticket has no numbers in this range!' };
  }

  const uncalledInPattern = patternNums.filter(n => !calledSet.has(n));
  if (uncalledInPattern.length > 0) {
    return {
      valid: false,
      isBogey: true,
      reason: `BOGEY! Numbers [${uncalledInPattern.join(', ')}] in ${dividend.name} have NOT been called yet!`
    };
  }

  const unmarkedInPattern = patternNums.filter(n => !markedSet.has(n));
  if (unmarkedInPattern.length > 0) {
    return {
      valid: false,
      isBogey: true,
      reason: `BOGEY! You forgot to mark/daub [${unmarkedInPattern.join(', ')}] on your ticket before claiming!`
    };
  }

  if (state.settings.strictLastNumberRule) {
    let maxIdx = -1;
    let lastPatternNum = null;
    patternNums.forEach(n => {
      const idx = state.calledNumbers.indexOf(n);
      if (idx > maxIdx) {
        maxIdx = idx;
        lastPatternNum = n;
      }
    });

    if (maxIdx !== state.calledNumbers.length - 1) {
      return {
        valid: false,
        isBogey: false,
        reason: `Late Claim! Your ${dividend.name} completed on number ${lastPatternNum}, but current number is ${state.currentNumber}!`
      };
    }
  }

  return { valid: true, isBogey: false, reason: `Valid ${dividend.name} Claim!`, patternNumbers: patternNums };
}

function applyBogeyStrike(state, ticket, dividendName, reasonText) {
  ticket.bogeyCount = (ticket.bogeyCount || 0) + 1;
  const maxAllowed = state.settings.maxBogeysPerTicket || 2;

  if (ticket.bogeyCount >= maxAllowed) {
    ticket.isDisqualified = true;
    addRoomActivity(state, `🚨 BOGEY DISQUALIFIED! ${ticket.playerName}'s Ticket #${ticket.ticketId} locked (${ticket.bogeyCount}/${maxAllowed} strikes) on ${dividendName}.`);
    triggerGlobalToast(state, `❌ ${ticket.playerName} got a BOGEY! Ticket #${ticket.ticketId} Disqualified!`);
  } else {
    addRoomActivity(state, `⚠️ BOGEY WARNING (${ticket.bogeyCount}/${maxAllowed}) for ${ticket.playerName} on Ticket #${ticket.ticketId} (${dividendName}).`);
    triggerGlobalToast(state, `⚠️ Bogey Strike (${ticket.bogeyCount}/${maxAllowed}) on ${ticket.playerName}!`);
  }
}

function approveDividendWinner(state, playerId, ticketId, dividendId) {
  const player = state.players[playerId];
  const dividend = state.dividends.find(d => d.id === dividendId);
  if (!player || !dividend) return;

  const winEntry = {
    playerId,
    playerName: player.name,
    ticketId,
    wonOnNumber: state.currentNumber,
    pointsAwarded: dividend.prizePoints
  };
  dividend.winners.push(winEntry);

  if (state.settings.allowJointWinners && dividend.status === 'OPEN' && dividend.winners.length >= dividend.totalSlots) {
    dividend.status = 'CLAIM_WINDOW';
    dividend.claimWindowNumber = state.currentNumber;
    dividend.claimWindowEndsAt = Date.now() + (state.settings.claimWindowSec * 1000);
    addRoomActivity(state, `⏳ ${player.name} claimed ${dividend.name}! ${state.settings.claimWindowSec}s Grace Window open for Joint Winners on #${state.currentNumber}!`);
    triggerGlobalToast(state, `🔥 ${player.name} claimed ${dividend.name}! Anyone else on #${state.currentNumber}? Claim within ${state.settings.claimWindowSec}s!`);
  } else {
    if (dividend.status === 'CLAIM_WINDOW') {
      const jointCount = dividend.winners.length;
      const splitPts = Math.round(dividend.prizePoints / jointCount);
      dividend.winners.forEach(w => { w.pointsAwarded = splitPts; });
      addRoomActivity(state, `🤝 JOINT WINNER! ${player.name} (#${ticketId}) joined ${dividend.name}! Prize split (${splitPts} pts each).`);
      triggerGlobalToast(state, `🤝 Joint Winner! ${player.name} also claimed ${dividend.name}!`);
    } else {
      if (dividend.winners.length >= dividend.totalSlots) {
        dividend.status = 'CLAIMED';
      }
      addRoomActivity(state, `🏆 ${player.name} (Ticket #${ticketId}) WON ${dividend.name} (${dividend.prizePoints} pts)!`);
      triggerGlobalToast(state, `🏆 ${player.name} won ${dividend.name}!`);
    }
  }

  checkAutoGameOver(state);
}

function checkAndFinalizeGraceWindows(state) {
  let changed = false;
  const now = Date.now();
  state.dividends.forEach(d => {
    if (d.status === 'CLAIM_WINDOW' && d.claimWindowEndsAt && now >= d.claimWindowEndsAt) {
      d.status = 'CLAIMED';
      d.claimWindowEndsAt = null;
      changed = true;
    }
  });
  if (changed) {
    checkAutoGameOver(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function checkAutoGameOver(state) {
  const allClaimed = state.dividends.length > 0 && state.dividends.every(d => d.status === 'CLAIMED');
  if (allClaimed && state.status !== GAME_STATES.COMPLETED) {
    state.status = GAME_STATES.COMPLETED;
    archiveCurrentRound(state, 'All Dividends Claimed');
    addRoomActivity(state, `🎉 GAME OVER! All dividends claimed in Round ${state.round}!`);
    triggerGlobalToast(state, `🎉 GAME OVER! All prizes claimed! Check Winner Podium!`);
  }
}

// Automatically stores last 10 rounds in database (auto-trims older than 10)
function archiveCurrentRound(state, reason) {
  const existingIdx = state.pastRounds.findIndex(r => r.round === state.round);
  const summary = {
    round: state.round,
    roomCode: state.roomCode,
    title: state.title,
    endedAt: getTimeStr(),
    reason,
    calledNumbers: [...state.calledNumbers],
    dividends: JSON.parse(JSON.stringify(state.dividends))
  };
  if (existingIdx >= 0) {
    state.pastRounds[existingIdx] = summary;
  } else {
    state.pastRounds.unshift(summary);
  }
  if (state.pastRounds.length > 10) {
    state.pastRounds = state.pastRounds.slice(0, 10);
  }
}

/* ============================================================================
   MODULE 8: PRODUCTION HELPERS (TTS UNLOCK, WAKE LOCK, FLOATING EMOJIS)
   ============================================================================ */

let audioUnlocked = false;
function unlockBrowserAudioAndWakeLock() {
  if (!audioUnlocked && 'speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance('');
    utter.volume = 0;
    window.speechSynthesis.speak(utter);
    audioUnlocked = true;
  }
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').catch(() => {});
  }
}

function speakAnnouncement(text, enabled) {
  if (!enabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.96;
  window.speechSynthesis.speak(utter);
}

function spawnFloatingReaction(emoji, senderName) {
  const el = document.createElement('div');
  el.className = 'floating-emoji';
  el.style.left = Math.floor(12 + Math.random() * 75) + 'vw';
  el.innerHTML = `${emoji} <span style="font-size:0.75rem; background:rgba(0,0,0,0.75); padding:2px 8px; border-radius:99px; color:#ffd15c;">${senderName || ''}</span>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function launchVictoryConfetti() {
  const icons = ['🎆', '🪔', '🏆', '✨', '🎉', '🍬'];
  for (let i = 0; i < 16; i++) {
    setTimeout(() => spawnFloatingReaction(icons[i % icons.length], ''), i * 85);
  }
}

// Boot Cloud Realtime Database Sync automatically on page load
window.addEventListener('DOMContentLoaded', () => {
  initCloudDatabaseSync();
});