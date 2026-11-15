// Taupinière : des taupes sortent de neuf trous pendant une minute, on les tape avant qu'elles ne rentrent.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Taupinière</span><span class="hint">Clique les taupes, ou pavé numérique · P : pause</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="tpCanvas" width="144" height="184" role="img" aria-label="Taupinière"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="tpStats"></div></div>
      <label class="row">Mode <select class="f gSel" id="tpMode"><option value="chrono">Chrono 60 s</option><option value="survie">Survie : 3 vies</option></select></label>
      <div class="row"><button class="btn main" id="tpNew">NOUVELLE PARTIE</button><button class="btn" id="tpFs">PLEIN ÉCRAN</button></div>
      <div class="hint">Une partie dure 60 secondes. Tape chaque taupe avant qu'elle ne rentre : 10 points, 20 pour une taupe casquée (deux coups : le premier fait tomber le casque), 50 pour une taupe dorée, rapide. Ne touche pas le hérisson : 30 points de moins. Cinq coups réussis d'affilée doublent les points, puis ×3, ×4, ×5 ; un coup dans le vide ou une taupe qui s'échappe remet la série à zéro. Au clavier : le pavé numérique (7 8 9 en haut), ou A Z E / Q S D / W X C.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:0 0 auto;position:relative}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{height:100vh;max-width:100vw}
.gameBox canvas{height:min(calc(100vh - 190px),900px);min-height:300px;max-width:100%;width:auto;aspect-ratio:144/184;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}


export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "TAUPINIÈRE", T: {"k": "#0e0a08", "k2": "#1a1410", "fill": "#24301c", "fillOn": "#304026", "hl": "#3a4a2e", "line": "#5a6a48", "acc": "#ffd84a", "accL": "#fff6b0", "accS": "#c89a1a", "accD": "#4a3a08", "rivet": "#f0f0e0", "btn": "#3a4a2e", "btnHi": "#5a6a48", "btnLo": "#1a1410", "btnHov": "#44562f", "btnHovHi": "#7a8a62", "text": "#f4f4ec", "muted": "#c4c8b4", "acc2": "#ff8aa8", "gold": "#ffd84a", "orange": "#ff8a3a", "red": "#ff4a3a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#121a0e", "bgDot": "#24301c", "bgDot2": "#1a2414", "spark": "#3a4a10", "spark2": "#ffd84a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["....kkkk....", "..kkmmmmkk..", ".kmmmmmmmmk.", "kmmwkmmwkmmk", "kmmkkmmkkmmk", "kmmmrrrrmmmk", "kmmrwwwwrmmk", "kmmmrrrrmmmk", "kooooooooook", "oooooooooooo", "kkkkkkkkkkkk"],
  icons: [[/^NOUVELLE/, 'play'], [/^RECORDS/, 'crown'], [/^PLEIN/, 'full']] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (v > (b ?? 0)) {  // un score nul n'est jamais un record
    games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

/* ---------- Taupinière : des taupes sortent de 9 trous pendant 60 secondes ; on les tape avant qu'elles ne rentrent.
   Taupe dorée = gros points, taupe casquée = deux coups, hérisson = ne pas toucher. Les coups réussis d'affilée multiplient les points ---------- */
const TP = {W: 144, H: 184, HUD: 14, ROUND: 60 * 60, YARD: 162};  // YARD : sous la dernière rangée de trous, la clôture et l'allée du jardinier
const TP_HOLES = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => ({x: 26 + (i % 3) * 46, y: 52 + Math.floor(i / 3) * 44}));
const tps = gstore('taupiniere', {games: 0, moles: 0, golds: 0}); tps.mode ??= 'chrono';
let tp = null, tpac = null;
// la taupe (16 x 14), sa tête étourdie, la dorée, la casquée (casque de chantier), le hérisson
const TP_PAL = {k: '#1a1018', f: '#6a4a3a', F: '#8a6a52', d: '#4a3028', n: '#ff8aa8', e: '#14101c', w: '#ffffff', c: '#f0d8c0', y: '#ffd84a', Y: '#c89a1a', h: '#ffc83a', H: '#c88a1a', s: '#8a7a6a', S: '#5a4a3a'};
const TP_ART = {
  mole: ['....kkkkkk......', '..kkFFFFFFkk....', '.kFFFFFFFFFFk...', 'kFFwkFFFFwkFFk..', 'kFFkkFFFFkkFFk..', 'kFFFFcccccFFFk..', 'kFFFcnnnccFFFk..', 'kffFccccccFFfk..', 'kfffcckkccfffk..', 'kfffffffffffk...', 'kcckffffffkcck..', 'kcccfffffffccck.', 'kfffffffffffffk.', 'kffffffffffffffk'],
  dizzy: ['....kkkkkk......', '..kkFFFFFFkk....', '.kFFFFFFFFFFk...', 'kFkFkFFFFkFkFk..', 'kFFkFFFFFFkFFk..', 'kFkFkcccccFkFk..', 'kFFFcnnnccFFFk..', 'kffFccccccFFfk..', 'kfffckcckcfffk..', 'kfffffffffffk...', 'kcckffffffkcck..', 'kcccfffffffccck.', 'kfffffffffffffk.', 'kffffffffffffffk'],
  hedge: ['......k..k......', '...k.kSkkSk.k...', '..kSkSsSSsSkSk..', '.kSsSsSsSsSsSsk.', 'kSsSsSsSsSsScck.', 'kSSsSsSsSsScwkk.', 'kSsSsSsSsScckcck', 'kSSsSsSsSscccckn', 'kSsSsSsSsSccccck', 'kSSSSSSSSSSkkkk.', 'kcckSSSSSSkcck..', 'kccckkkkkkkccck.', 'kSSSSSSSSSSSSSk.', 'kSSSSSSSSSSSSSSk'],
};
const tpArt = (rows, pal) => { const c = el('canvas'); c.width = 16; c.height = rows.length; sprite(c.getContext('2d'), rows, 0, 0, pal); return c; };
const TP_SPR = {mole: tpArt(TP_ART.mole, TP_PAL), dizzy: tpArt(TP_ART.dizzy, TP_PAL), hedge: tpArt(TP_ART.hedge, TP_PAL),
  gold: tpArt(TP_ART.mole, {...TP_PAL, f: '#c89a1a', F: '#ffd84a', d: '#8a6a10'}), goldDizzy: tpArt(TP_ART.dizzy, {...TP_PAL, f: '#c89a1a', F: '#ffd84a'})};
const TP_HELMET = ['...kkkkkkk......', '.kkhhhhhhhkk....', 'khhhwhhhhhhhk...', 'kHHHHHHHHHHHHkk.'];
const TP_HELM = (() => { const c = el('canvas'); c.width = 16; c.height = 4; sprite(c.getContext('2d'), TP_HELMET, 0, 0, TP_PAL); return c; })();
// le maillet, dessiné au point de frappe pendant quelques images
const TP_MALLET = (() => { const c = el('canvas'); c.width = 14; c.height = 14; const g = c.getContext('2d');
  sprite(g, ['.kkkkkkk......', 'kwccccck......', 'kccccccck.....', 'kccccccck.....', 'kccccccck.....', '.kkkkkkkk.....', '....kbk.......', '....kbk.......', '....kbk.......', '....kbk.......', '....kbk.......', '....kbk.......', '....kbk.......', '....kkk.......'], 0, 0, {k: '#1a1018', w: '#f0d8a8', c: '#a85a2a', b: '#6a3a1a'}); return c; })();
// le jardin : herbe tramée, fleurs, et les buttes de terre des trous
const TP_GARDEN = (() => { const c = el('canvas'); c.width = TP.W; c.height = TP.H; const g = c.getContext('2d'), r = seeded(9);
  px(g, '#4a8a3a', 0, 0, TP.W, TP.H);
  for (let i = 0; i < 700; i++) px(g, r() < .5 ? '#5a9a42' : '#3a7a32', Math.floor(r() * TP.W), Math.floor(r() * TP.H));
  for (let i = 0; i < 40; i++) { const x = Math.floor(r() * TP.W), y = TP.HUD + Math.floor(r() * (TP.H - TP.HUD)); if (TP_HOLES.some(h => Math.abs(h.x - x) < 16 && Math.abs(h.y - y) < 12)) continue;
    const col = ['#ffffff', '#ffd84a', '#ff8aa8'][i % 3]; px(g, col, x, y - 1); px(g, col, x - 1, y); px(g, col, x + 1, y); px(g, col, x, y + 1); px(g, '#c89a1a', x, y); }
  for (let y = TP.HUD + 2; y < TP.H; y += 22) for (let x = (y % 44 ? 4 : 18); x < TP.W; x += 28) { px(g, '#2f6a2a', x, y, 1, 3); px(g, '#2f6a2a', x + 2, y + 1, 1, 2); }
  // en bas : la clôture de bois et l'allée de terre où se tient le jardinier
  px(g, '#8a6a42', 0, TP.YARD + 6, TP.W, TP.H - TP.YARD - 6); for (let i = 0; i < 60; i++) px(g, r() < .5 ? '#9a7a52' : '#6a4a2a', Math.floor(r() * TP.W), TP.YARD + 7 + Math.floor(r() * (TP.H - TP.YARD - 7)));
  px(g, '#c89a5a', 0, TP.YARD + 1, TP.W, 2); px(g, '#6a4020', 0, TP.YARD + 3, TP.W, 1);
  for (let x = 2; x < TP.W; x += 12) { px(g, '#1a1018', x - 1, TP.YARD - 4, 5, 11); px(g, '#d8a868', x, TP.YARD - 3, 3, 9); px(g, '#a87a42', x + 2, TP.YARD - 3, 1, 9); px(g, '#d8a868', x + 1, TP.YARD - 4, 1, 1); }
  for (const h of TP_HOLES) { for (let dy = -6; dy <= 6; dy++) { const w = Math.round(Math.sqrt(1 - (dy / 6.5) ** 2) * 16); px(g, dy < 0 ? '#8a5a3a' : '#6a4028', h.x - w, h.y + dy, w * 2, 1); }
    for (let dy = -3; dy <= 3; dy++) { const w = Math.round(Math.sqrt(1 - (dy / 3.5) ** 2) * 10); px(g, '#1a0e0a', h.x - w, h.y + dy - 1, w * 2, 1); }
    px(g, '#a8784a', h.x - 12, h.y - 5, 6, 1); px(g, '#a8784a', h.x + 5, h.y - 4, 4, 1); }
  return c; })();
// le jardinier (chapeau de paille, moustache, salopette) ; quand il râle, il rougit, lève le poing et tremble
const TP_GARDENER_ROWS = ['.....kkkkkk.....', '....kyyyyyyk....', '....kYYYYYYk....', '.kkkyyyyyyyykkk.', 'kyyyyyyyyyyyyyyk', '.kkkkkkkkkkkkkk.', '...kcccccccck...', '...kckcccckck...', '...krccccccrk...', '...kcmmmmmmck...', '...kccckkccck...', '....kkcccckk....', '..kwwkbbbbkwwk..', '.kwwwbbbbbbwwwk.', 'khwwbbBBBBbbwwhk', 'khhkbbbbbbbbkhhk', '.kk.bbbbbbbb.kk.', '....bbbkkbbb....', '....bbbk.kbbb...', '...kkkk..kkkk...'];
const TP_GPAL = {k: '#1a1018', y: '#f0d070', Y: '#c89a3a', c: '#f0c8a0', r: '#f08a8a', m: '#d8d0c8', w: '#f4f0f8', b: '#3a6ac8', B: '#2a4a9a', h: '#f0c8a0'};
const TP_GARDENER = {calm: tpArt(TP_GARDENER_ROWS, TP_GPAL), mad: tpArt(TP_GARDENER_ROWS, {...TP_GPAL, c: '#f4a088', r: '#e04a4a'})};
const TP_GRUMBLE = {miss: ['Raté !', 'Dans le vide !', 'Vise mieux !'], escape: ['Elle file !', 'Mes carottes !', 'Ma salade !', 'Rattrape-la !'], hedge: ['Pas le hérisson !']};
const tpGrumble = kind => { const l = TP_GRUMBLE[kind]; tp.talk = {text: l[Math.floor(tp.rnd() * l.length)], t: 80}; };
const TP_HEART = ['.kk.kk.', 'krrkrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'];
// le bord avant de chaque trou, redessiné par-dessus la taupe pour qu'elle sorte de la terre
const tpLip = (g, h) => { for (let dy = 0; dy <= 6; dy++) { const w = Math.round(Math.sqrt(1 - (dy / 6.5) ** 2) * 16); px(g, dy < 2 ? '#8a5a3a' : '#6a4028', h.x - w, h.y + dy + 1, w * 2, 1); } };
function tpBeep(f, d, type = 'square', slide = 0, vol = .04) { try { tpac ??= new AudioContext(); const o = tpac.createOscillator(), g = tpac.createGain(), t = tpac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(tpac.destination); o.start(t); o.stop(t + d); } catch {} }
// une nouvelle partie garde le même objet : la boucle du jeu (gameLoop) continue de tourner dessus
const renew = (old, o) => { if (!old) return o; for (const k of Object.keys(old)) if (k !== 'raf') delete old[k]; return Object.assign(old, o); };
function tpNew() {
  const g = tp?.g;
  tp = renew(tp, {g, mode: 'ready', tick: 0, seen: 0, t: 0, score: 0, streak: 0, bestStreak: 0, hits: 0, golds: 0, misses: 0, ouch: 0, holes: TP_HOLES.map(() => null), next: 40, pops: [], swing: null, dead: 0, record: false, rnd: seeded(Date.now() % 1e9), surv: tps.mode === 'survie', lives: 3, talk: null, escaped: 0});
  tpInfo();
}
const tpMult = () => 1 + Math.min(4, Math.floor(tp.streak / 5));  // ×2 après 5 coups d'affilée, jusqu'à ×5
// une bête dans un trou : kind (mole, gold, helmet, hedge), phase : up (sort), stay, down (rentre) ; y : hauteur sortie de 0 à 1
function tpSpawn() {
  const free = tp.holes.map((m, i) => m ? -1 : i).filter(i => i >= 0); if (!free.length) return;
  const d = Math.min(1, tp.t / TP.ROUND), r = tp.rnd(), i = free[Math.floor(tp.rnd() * free.length)];
  const kind = r < .07 ? 'gold' : r < .2 + d * .05 ? 'hedge' : r < .32 + d * .08 ? 'helmet' : 'mole';
  tp.holes[i] = {kind, y: 0, phase: 'up', stay: Math.round((kind === 'gold' ? 30 : 70) - d * 30 + tp.rnd() * 20), hp: kind === 'helmet' ? 2 : 1, hit: 0};
}
function tpWhack(i) {
  if (tp.mode !== 'play') return;
  const h = TP_HOLES[i], m = tp.holes[i];
  tp.swing = {x: h.x, y: h.y - 10, t: 8};
  if (!m || m.hit || m.y < .45) { tp.streak = 0; tp.misses++; tpGrumble('miss'); tpBeep(120, .06, 'triangle', 0, .03); return; }  // dans le vide : la série s'arrête
  if (m.kind === 'hedge') { m.hit = 1; m.phase = 'down'; tp.streak = 0; tp.ouch++; tp.score = Math.max(0, tp.score - 30); tp.pops.push({x: h.x, y: h.y - 18, text: 'AÏE ! -30', c: '#ff4a3a', t: 40}); tpGrumble('hedge'); tpBeep(90, .3, 'sawtooth', 50, .06); return; }
  if (--m.hp > 0) { m.dent = 8; tpBeep(700, .05, 'square', 400, .04); tp.pops.push({x: h.x, y: h.y - 18, text: 'TOC', c: '#ffffff', t: 20}); return; }  // le casque tombe
  m.hit = 1; m.phase = 'down'; m.stay = 0;
  tp.streak++; tp.bestStreak = Math.max(tp.bestStreak, tp.streak); tp.hits++;
  const base = m.kind === 'gold' ? 50 : m.kind === 'helmet' ? 20 : 10, pts = base * tpMult();
  if (m.kind === 'gold') tp.golds++;
  tp.score += pts; tp.pops.push({x: h.x, y: h.y - 18, text: '+' + pts, c: m.kind === 'gold' ? '#ffd84a' : '#ffffff', t: 30});
  tpBeep(m.kind === 'gold' ? 1200 : 520 + Math.min(10, tp.streak) * 40, .07, 'square', 0, .05);
}
function tpEnd() {
  tp.mode = 'over'; tp.dead = 0;
  tps.games++; tps.moles += tp.hits; tps.golds += tp.golds; tp.record = best(tp.surv ? 'taupiniereS' : 'taupiniere', tp.score); saveGames(); tpInfo();
  tpBeep(660, .15); setTimeout(() => tpBeep(440, .15), 150); setTimeout(() => tpBeep(880, .3), 300);
}
function tpEscape(i) {  // une taupe s'échappe : la série s'arrête, le jardinier râle ; en survie, une vie de moins
  tp.streak = 0; tp.escaped++; tpGrumble('escape');
  if (!tp.surv || tp.mode !== 'play') return;
  tp.lives--; tp.pops.push({x: TP_HOLES[i].x, y: TP_HOLES[i].y - 18, text: '-1 VIE', c: '#ff4a3a', t: 40}); tpBeep(200, .2, 'sawtooth', 100, .05);
  if (tp.lives <= 0) tpEnd();
}
function tpUpdate() {
  if (tp.mode === 'over') { tp.dead++; return; }
  if (tp.mode !== 'play') return;
  if (++tp.t >= TP.ROUND && !tp.surv) return tpEnd();  // en survie, pas de limite de temps
  if (tp.talk && --tp.talk.t <= 0) tp.talk = null;
  const d = tp.t / TP.ROUND;
  if (--tp.next <= 0) { tpSpawn(); if (d > .5 && tp.rnd() < .35) tpSpawn(); tp.next = Math.round(50 - 26 * d + tp.rnd() * 20); }
  tp.holes.forEach((m, i) => {
    if (!m) return;
    if (m.dent) m.dent--;
    if (m.phase === 'up') { m.y = Math.min(1, m.y + .12); if (m.y === 1) m.phase = 'stay'; }
    else if (m.phase === 'stay') { if (--m.stay <= 0) m.phase = 'down'; }
    else { m.y -= m.hit ? .06 : .1; if (m.y <= 0) { tp.holes[i] = null; if (!m.hit && m.kind !== 'hedge') tpEscape(i); } }  // une taupe qui s'échappe casse la série
  });
  for (const p of tp.pops) { p.t--; p.y -= .3; } tp.pops = tp.pops.filter(p => p.t > 0);
  if (tp.swing && --tp.swing.t <= 0) tp.swing = null;
}
function tpDraw() {
  const g = tp.g, {W} = TP;
  for (; tp.seen < tp.tick; tp.seen++) if (tp.mode === 'over') tpUpdate();
  g.imageSmoothingEnabled = false;
  g.drawImage(TP_GARDEN, 0, 0);
  tp.holes.forEach((m, i) => {
    const h = TP_HOLES[i];
    if (m) {
      const rise = Math.round(m.y * 14), spr = m.kind === 'hedge' ? TP_SPR.hedge : m.kind === 'gold' ? (m.hit ? TP_SPR.goldDizzy : TP_SPR.gold) : m.hit ? TP_SPR.dizzy : TP_SPR.mole;
      g.save(); g.beginPath(); g.rect(h.x - 12, h.y - 30, 24, 30); g.clip();
      const sx = h.x - 7, sy = h.y - rise + 1 + (m.dent ? 1 : 0);
      g.drawImage(spr, sx, sy);
      if (m.kind === 'helmet' && m.hp > 1) g.drawImage(TP_HELM, sx, sy - 2);
      if (m.hit && m.kind !== 'hedge') for (let k = 0; k < 3; k++) { const a = tp.tick / 6 + k * 2.1; px(g, '#ffd84a', sx + 6 + Math.cos(a) * 7, sy - 2 + Math.sin(a) * 2, 2, 1); }
      g.restore();
    }
    tpLip(g, h);
    // le numéro du trou, discret, pour jouer au clavier (pavé numérique)
    if (tp.mode !== 'play' || !m) pxFont(g, String([7, 8, 9, 4, 5, 6, 1, 2, 3][i]), h.x, h.y + 14, '#2f6a2a', 8, 'center');
  });
  { const G = tp.talk, sh = G && (tp.tick >> 1) % 2 ? 1 : 0, gx = 4 + sh, gy = TP.H - 20;  // le jardinier, et sa bulle quand il râle
    g.drawImage(G ? TP_GARDENER.mad : TP_GARDENER.calm, gx, gy);
    if (G) { px(g, '#1a1018', gx - 2, gy + 4, 4, 5); px(g, '#f4a088', gx - 1, gy + 5, 2, 3); px(g, '#f4f0f8', gx - 1, gy + 9, 2, 4);  // le poing levé
      const w = PXK.layout(G.text).w + 8, bx = 26, by = TP.H - 17;
      px(g, '#1a1018', bx - 1, by - 1, w + 2, 15); px(g, '#ffffff', bx, by, w, 13); px(g, '#1a1018', bx - 4, by + 7, 4, 3); px(g, '#ffffff', bx - 3, by + 8, 4, 1);
      PXK.fill(g, G.text, bx + 4, by + 10, '#1a1018', 1, 'left'); } }
  if (tp.swing) { const s = tp.swing, a = s.t > 4; g.save(); g.translate(s.x + 4, s.y + 6); g.rotate(a ? -.6 : 0); g.drawImage(TP_MALLET, -2, -12); g.restore(); if (!a) { px(g, '#ffffff', s.x - 8, s.y + 4, 2, 1); px(g, '#ffffff', s.x + 8, s.y + 4, 2, 1); } }
  for (const p of tp.pops) pxFont(g, p.text, p.x, p.y, p.c, 8, 'center');
  // l'affichage : score, multiplicateur, temps (une barre qui se vide)
  px(g, '#1a1018', 0, 0, W, TP.HUD);
  pxFont(g, String(tp.score), 4, 10, '#ffffff', 8);
  if (tpMult() > 1) pxFont(g, '×' + tpMult(), 50, 10, '#ffd84a', 8);
  const left = 1 - tp.t / TP.ROUND, secs = tp.surv ? Math.floor(tp.t / 60) : Math.ceil((TP.ROUND - tp.t) / 60);
  if (tp.surv) for (let k = 0; k < 3; k++) sprite(g, TP_HEART, 76 + k * 10, 4, {k: '#1a1018', r: k < tp.lives ? '#ff4a5a' : '#3a2a32'});  // les vies
  else { px(g, '#3a2a32', 72, 5, 46, 4); px(g, secs <= 10 && (tp.tick >> 3) % 2 ? '#ff4a3a' : '#7ee07a', 73, 6, Math.round(44 * left), 2); }
  pxFont(g, secs + ' s', W - 4, 10, !tp.surv && secs <= 10 ? '#ff8a3a' : '#ffffff', 8, 'right');
  if (tp.mode === 'ready') gameText(g, W, [['TAUPINIÈRE', '#ffd84a', 12], [tp.surv ? 'Survie : 3 vies' : 'Chrono 60 s', '#7ee07a'], ['Clique les taupes', '#ffffff'], ['Pas le hérisson !', '#ff8a3a'], ['Record ' + (games.best[tp.surv ? 'taupiniereS' : 'taupiniere'] || 0), '#ffd84a'], ['Espace : jouer', '#b8b0c8']], 50);
  if (tp.mode === 'pause') gameText(g, W, [['PAUSE', '#ffffff', 12], ['Espace : reprendre', '#b8b0c8']], 80);
  if (tp.mode === 'over' && tp.dead > 40) gameText(g, W, [[tp.surv ? 'PERDU !' : 'TEMPS !', '#ffd84a', 12], [tp.score + ' points', '#ffffff'], [tp.hits + (tp.hits > 1 ? ' taupes' : ' taupe') + ' · série de ' + tp.bestStreak, '#b8b0c8'], [tp.record ? 'NOUVEAU RECORD !' : 'Record ' + (games.best[tp.surv ? 'taupiniereS' : 'taupiniere'] || 0), '#ffd84a'], [tp.dead > 60 ? 'Espace : rejouer' : '', '#b8b0c8']], 62);
  if (tp.tick % 30 === 0) g.canvas.setAttribute('aria-label', 'Taupinière : ' + (tp.mode === 'play' ? tp.score + ' points, ' + secs + ' secondes, ' + tp.hits + ' taupes, sorties : ' + (tp.holes.map((m, i) => m && m.y > .45 && !m.hit ? [7, 8, 9, 4, 5, 6, 1, 2, 3][i] + (m.kind === 'hedge' ? ' hérisson' : '') : '').filter(Boolean).join(', ') || 'aucune') : tp.mode === 'over' ? 'partie finie, ' + tp.score + ' points' : tp.mode === 'pause' ? 'pause' : 'prêt'));
}
function tpInfo() {
  $('tpStats').replaceChildren(...[['Meilleur score', games.best.taupiniere || 0], ['Record survie', games.best.taupiniereS || 0], ['Parties', tps.games], ['Taupes tapées', tps.moles], ['Taupes dorées', tps.golds]].flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
}
function tpStart() {
  if (tp.mode === 'ready' || tp.mode === 'pause') { tp.mode = 'play'; return true; }
  if (tp.mode === 'over' && tp.dead > 60) { tpNew(); tp.mode = 'play'; return true; }
  return false;
}
// au clavier : le pavé numérique (7 8 9 en haut) ou les touches à la même place sur le clavier (A Z E / Q S D / W X C en AZERTY)
const TP_CODES = ['Numpad7', 'Numpad8', 'Numpad9', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad1', 'Numpad2', 'Numpad3'], TP_GRID = ['KeyQ', 'KeyW', 'KeyE', 'KeyA', 'KeyS', 'KeyD', 'KeyZ', 'KeyX', 'KeyC'];
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || !tp || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!e.repeat) tpStart(); return; }
  let i = TP_CODES.indexOf(e.code); if (i < 0) i = TP_GRID.indexOf(e.code); if (i < 0 && /^[1-9]$/.test(e.key)) i = [6, 7, 8, 3, 4, 5, 0, 1, 2][+e.key - 1];
  if (i >= 0) { e.preventDefault(); if (!e.repeat) { if (tp.mode === 'ready') tpStart(); tpWhack(i); } return; }
  if ((e.key.toLowerCase() === 'p' || e.key === 'Escape') && tp.mode === 'play') tp.mode = 'pause';
});
{ const cv = $('tpCanvas');
  cv.onpointerdown = e => { e.preventDefault(); if (!tp || tpStart()) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * TP.W, y = (e.clientY - r.top) / r.height * TP.H;
    const i = TP_HOLES.findIndex(h => Math.abs(x - h.x) < 20 && y > h.y - 26 && y < h.y + 10); if (i >= 0) tpWhack(i); else if (tp.mode === 'play') { tp.swing = {x, y, t: 8}; } }; }
$('tpNew').onclick = () => { tpNew(); $('tpNew').blur(); };
$('tpMode').value = tps.mode; $('tpMode').onchange = () => { tps.mode = $('tpMode').value; saveGames(); tpNew(); $('tpMode').blur(); };
$('tpCanvas').__tp = {st: () => tp, up: () => tpUpdate(), whack: i => tpWhack(i), mode: m => { tps.mode = m; tpNew(); }};  // pour le test « local »
{  // vérification : une taupe sortie se tape, le casque demande deux coups, le hérisson fait perdre des points, la série monte le multiplicateur
  const keep = tp, keepS = JSON.stringify(tps), keepB = games.best.taupiniereS; tp = null; tpNew(); tp.mode = 'play';
  tp.holes[0] = {kind: 'mole', y: 1, phase: 'stay', stay: 99, hp: 1, hit: 0}; tpWhack(0); const one = tp.score === 10 && tp.holes[0].hit === 1;
  tp.holes[1] = {kind: 'helmet', y: 1, phase: 'stay', stay: 99, hp: 2, hit: 0}; tpWhack(1); const helm1 = !tp.holes[1].hit; tpWhack(1); const helm2 = tp.holes[1].hit === 1 && tp.score === 30;
  tp.holes[2] = {kind: 'hedge', y: 1, phase: 'stay', stay: 99, hp: 1, hit: 0}; tpWhack(2); const hedge = tp.score === 0 && tp.streak === 0;
  for (let k = 0; k < 5; k++) { tp.holes[3] = {kind: 'mole', y: 1, phase: 'stay', stay: 99, hp: 1, hit: 0}; tpWhack(3); }
  const mult = tpMult() === 2;
  tpWhack(8); const grumble = !!tp.talk;  // un coup dans le vide : le jardinier râle
  tp.surv = true; tp.lives = 3; for (let k = 0; k < 3; k++) { tp.holes[k] = {kind: 'mole', y: .05, phase: 'down', stay: 0, hp: 1, hit: 0}; tpUpdate(); }
  const surv = tp.lives === 0 && tp.mode === 'over' && tp.escaped === 3;  // trois taupes échappées : plus de vies
  console.assert(one && helm1 && helm2 && hedge && mult && grumble && surv && TP_GARDENER_ROWS.every(r => r.length === 16), 'taupiniere', {one, helm1, helm2, hedge, mult, grumble, surv});
  Object.assign(tps, JSON.parse(keepS)); if (keepB === undefined) delete games.best.taupiniereS; else games.best.taupiniereS = keepB;  // la partie de la vérification ne compte pas
  tp = keep;
}
$('tpFs').onclick = () => { $('tpFs').blur(); try { document.fullscreenElement ? document.exitFullscreen() : $('tpCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
ctx.onOpen(() => {
  if (!tp || !tp.g) { tpNew(); tp.g = $('tpCanvas').getContext('2d'); }
  gameLoop(tp, 'taupiniere', tpUpdate, tpDraw); tpInfo();
});
}
