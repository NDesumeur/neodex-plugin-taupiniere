// lancé par le test « local » de NeoDex : part, tape les trous où une taupe est sortie et vérifie que le score monte
// (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
module.exports = async ({ pj, sleep }) => {
  const label = () => pj(`document.getElementById('tpCanvas').getAttribute('aria-label')`);
  const press = code => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: 'x', code: '${code}', bubbles: true})), 0`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('tpCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'taupiniere-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
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
  return first;
};
