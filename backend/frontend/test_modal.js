/* Delete Conversation modal verification */
const puppeteer = require('C:/Users/Admin/AppData/Local/Temp/opencode/pptr/node_modules/puppeteer-core');
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = 'http://127.0.0.1:8080';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let errors = [];

(async () => {
  const browser = await puppeteer.launch({ executablePath: path, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  page.on('pageerror', e => { errors.push('PAGEERROR: ' + e.message); console.log('PAGEERROR: ' + e.message); });
  page.on('console', m => { if (m.type() === 'error') { errors.push('CONSOLE: ' + m.text()); console.log('CONSOLE[err]: ' + m.text().slice(0, 160)); } });

  const email = 'modal+' + Date.now() + '@test.com';
  await page.goto(base + '/#/register', { waitUntil: 'networkidle0' });
  await page.type('#regFirst', 'Modal'); await page.type('#regLast', 'User');
  await page.type('#regEmail', email); await page.type('#regPass', 'password123');
  await page.type('#regPass2', 'password123');
  await page.evaluate(() => document.querySelector('#regBtn').click());
  await sleep(2500);

  await page.goto(base + '/#/advisor', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#newConv', { timeout: 15000 });
  await page.click('#newConv');
  await sleep(1500);
  await page.waitForSelector('#delConv:not(.hidden)', { timeout: 15000 });
  console.log('conv selected, #delConv visible');

  const openAndCheck = async (label) => {
    await page.evaluate(() => document.querySelector('#delConv').click());
    await sleep(600);
    return await page.evaluate(() => ({
      open: !document.getElementById('modalRoot').classList.contains('hidden'),
      headX: !!document.querySelector('.modal-head [data-close]'),
      cancel: !!document.querySelector('.modal-foot [data-close]'),
      confirm: !!document.getElementById('confirmBtn')
    }));
  };
  const closed = () => page.evaluate(() => ({
    hidden: document.getElementById('modalRoot').classList.contains('hidden'),
    panelLen: document.getElementById('modalPanel').innerHTML.length
  }));

  let s = await openAndCheck('x');
  console.log('open[X]: ' + JSON.stringify(s));
  await page.evaluate(() => document.querySelector('.modal-head [data-close]').click());
  await sleep(400);
  s = await closed();
  console.log('after X click → ' + JSON.stringify(s) + '  (want hidden=true, panelLen=0)');

  s = await openAndCheck('cancel');
  await page.evaluate(() => document.querySelector('.modal-foot [data-close]').click());
  await sleep(400);
  s = await closed();
  console.log('after Cancel click → ' + JSON.stringify(s) + '  (want hidden=true, panelLen=0)');

  s = await openAndCheck('escape');
  await page.keyboard.press('Escape');
  await sleep(400);
  s = await closed();
  console.log('after Escape → ' + JSON.stringify(s) + '  (want hidden=true, panelLen=0)');

  s = await openAndCheck('backdrop');
  const beforeFocus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  await page.evaluate(() => document.getElementById('modalBackdrop').click());
  await sleep(400);
  s = await closed();
  const afterFocus = await page.evaluate(() => document.activeElement && document.activeElement.id);
  console.log('after backdrop click → ' + JSON.stringify(s) + '  (want hidden=true, panelLen=0)');
  console.log('focus before opener=' + beforeFocus + ' restored=' + afterFocus);

  /* repeat 5x open/close (memory-leak / duplicate-listener check) */
  let ok = true;
  for (let i = 0; i < 5; i++) {
    s = await openAndCheck('loop' + i);
    if (!s.open) { ok = false; console.log('OPEN FAILED on loop ' + i); break; }
    await page.keyboard.press('Escape');
    await sleep(300);
    s = await closed();
    if (!s.hidden) { ok = false; console.log('CLOSE FAILED on loop ' + i); break; }
  }
  console.log('open/close loop 5x → ' + (ok ? 'OK' : 'FAIL'));

  /* focus trap: Tab stays inside panel */
  s = await openAndCheck('trap');
  let ids = [];
  for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); ids.push(await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.className.split(' ')[0]))); }
  console.log('tab focus chain (should stay panel buttons): ' + JSON.stringify(ids));
  await page.keyboard.press('Escape');
  await sleep(300);

  /* Delete still works */
  const beforeConvs = await page.evaluate(async () => {
    const token = localStorage.getItem('financeai_token') || '';
    const r = await fetch('/api/openai/conversations', { headers: { Authorization: 'Bearer ' + token } });
    const data = await r.json();
    return data.length;
  });
  console.log('conversations before delete: ' + beforeConvs);
  await page.evaluate(() => document.querySelector('#delConv').click());
  await sleep(500);
  await page.evaluate(() => document.getElementById('confirmBtn').click());
  await sleep(1600);
  s = await closed();
  const afterConvs = await page.evaluate(async () => {
    const token = localStorage.getItem('financeai_token') || '';
    const r = await fetch('/api/openai/conversations', { headers: { Authorization: 'Bearer ' + token } });
    return (await r.json()).length;
  });
  console.log('after Delete → ' + JSON.stringify(s) + ' (want hidden) convs ' + beforeConvs + '→' + afterConvs + ' (want 0)');
  const deletedUi = await page.evaluate(() => document.body.innerText.includes('Conversation deleted'));
  console.log('UI shows "Conversation deleted": ' + deletedUi);
  console.log('aria-labelledby: ' + await page.evaluate(() => { const p = document.getElementById('modalPanel'); return p && p.getAttribute('aria-labelledby'); }).catch(() => 'n/a'));

  console.log('\nCONSOLE/PAGE ERRORS: ' + (errors.length ? errors.length + ' found' : 'none'));
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
