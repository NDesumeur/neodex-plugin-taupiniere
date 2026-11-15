// lancé par le test « local » de NeoDex : part, tape les trous où une taupe est sortie et vérifie que le score monte
// (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
module.exports = async ({ pj, sleep }) => {
  const label = () => pj(`document.getElementById('tpCanvas').getAttribute('aria-label')`);
  const press = code => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: 'x', code: '${code}', bubbles: true})), 0`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('tpCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'taupiniere-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await sleep(300);
  // le plein écran remplit l'écran, puis la place prise dans la fenêtre
  await pj(`document.getElementById('tpFs').click(), 0`); await sleep(700);
  const fsOk = await pj(`(() => { const c = document.getElementById('tpCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fsOk) throw new Error('le plein écran ne remplit pas l’écran');
  const Lw = await pj(`(() => { const r = document.getElementById('tpCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('tpCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (Lw.bottom > Lw.wh + 1 || Lw.sw > Lw.ww + 1 || Lw.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(Lw));

  await shot('0-depart');
  await pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true})), 0`);
  let tapped = 0, shotUp = false;
  for (let i = 0; i < 40 && tapped < (process.env.NEO_SHOTS ? 12 : 3); i++) {  // lit les trous où une taupe est sortie (dans la description du jeu) et les tape
    await sleep(250);
    const up = (/sorties : (.*)$/.exec(await label()) || [])[1] || '';
    if (up && up !== 'aucune' && !shotUp) { shotUp = true; await shot('1-taupes'); }
    for (const part of up.split(', ')) { const n = +part.split(' ')[0]; if (n && !/hérisson/.test(part)) { await press('Numpad' + n); tapped++; if (tapped === 2) await shot('2-coup'); } }
  }
  await sleep(500); await shot('3-jeu');
  const first = await label();
  const n = +(/(\d+) points/.exec(first) || [])[1];
  if (!(n >= 10)) throw new Error('aucune taupe tapée : « ' + first + ' »');
  // le jardinier râle sur un coup dans le vide ; le mode survie : trois taupes échappées et c'est fini
  const S = js => pj(`(() => { const T = document.getElementById('tpCanvas').__tp; ${js} })()`);
  const g = await S(`const t = T.st(), i = t.holes.findIndex(m => !m); T.whack(i); return t.talk ? t.talk.text : '';`);
  if (!g) throw new Error('le jardinier devait râler'); await sleep(100); await shot('4-jardinier');
  await pj(`(() => { const s = document.getElementById('tpMode'); s.value = 'survie'; s.dispatchEvent(new Event('change')); return 0; })()`); await sleep(200);
  await pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true})), 0`); await sleep(1500); await shot('5-survie');
  const sv = await S(`const t = T.st(); if (!t.surv) return 'pas en survie'; for (let k = 0; k < 3; k++) { t.holes = t.holes.map(() => null); t.holes[k] = {kind: 'mole', y: .05, phase: 'down', stay: 0, hp: 1, hit: 0}; T.up(); } return t.lives + ',' + t.mode;`);
  if (sv !== '0,over') throw new Error('la survie devait finir après trois taupes échappées : ' + sv);
  await sleep(1500); await shot('6-fin-survie');
  await pj(`(() => { const s = document.getElementById('tpMode'); s.value = 'chrono'; s.dispatchEvent(new Event('change')); return 0; })()`);
  return first;
};
