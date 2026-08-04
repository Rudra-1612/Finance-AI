/* FinanceAI full E2E test driven by puppeteer-core against headless Chrome */
const puppeteer = require('C:/Users/Admin/AppData/Local/Temp/opencode/pptr/node_modules/puppeteer-core');
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = 'http://127.0.0.1:8080';

let passed = 0, failed = 0;
function check(name, ok, extra) {
  if (ok) { passed++; console.log('PASS  ' + name); }
  else { failed++; console.log('FAIL  ' + name + (extra ? '  -- ' + extra : '')); }
}
const waitText = (page, text, timeout) => page.waitForFunction(
  (t) => document.body.innerText.includes(t), { timeout: timeout || 15000 }, text);
const waitSel = (page, sel, timeout) => page.waitForSelector(sel, { timeout: timeout || 15000 });
const settle = ms => new Promise(r => setTimeout(r, ms || 700));
const fill = (page, sel, val) => page.$eval(sel, (e, v) => { e.value = v; }, val);
function retry(fn, tries, gap) {
  return new Promise((resolve) => {
    (async () => {
      let last = false;
      for (let i = 0; i < (tries || 4); i++) {
        try { last = await fn(); if (last) { resolve(last); return; } } catch (e) { last = false; }
        await settle(gap || 1000);
      }
      resolve(false);
    })();
  });
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: path, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  page.on('response', r => { if (r.status() >= 400) console.log('NET ' + r.status() + ' ' + r.url()); });

  /* ---------- Landing ---------- */
  await page.goto(base + '/#/', { waitUntil: 'networkidle0' });
  check('landing hero renders', await page.$('header.hero') !== null);
  check('landing has get-started CTA', await page.$('a[href="#/register"]') !== null);

  /* ---------- Register a brand-new user ---------- */
  const email = 'e2e+' + Date.now() + '@test.com';
  await page.goto(base + '/#/register', { waitUntil: 'networkidle0' });
  await page.type('#regFirst', 'E2E');
  await page.type('#regLast', 'Tester');
  await page.type('#regEmail', email);
  await page.type('#regPass', 'password123');
  await page.type('#regPass2', 'password123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {}),
    page.click('#regBtn')
  ]);
  check('register redirects to app shell', (await page.$('.app-shell:not(.hidden)')) !== null);
  check('sidebar shows dashboard', (await page.$('.nav-item.active')) !== null);

  /* ---------- Dashboard ---------- */
  await page.waitForSelector('.stat', { timeout: 15000 }).catch(() => {});
  check('dashboard stat cards render', (await page.$$('.stat')).length >= 4);
  check('dashboard greeting', (await page.$eval('#topbarTitle', e => e.textContent)) === 'Dashboard');
  check('canvas chart rendered', (await page.$('#flowChart')) !== null);

  /* ---------- Transactions: add + filter + edit ---------- */
  await page.goto(base + '/#/transactions', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#addTx', { timeout: 15000 });
  await page.click('#addTx');
  await page.waitForSelector('#txForm', { timeout: 10000 });
  await page.select('#txType', 'expense');
  await fill(page, '#txAmount', '42.50');
  await page.select('#txCategory', 'Food & Dining');
  await fill(page, '#txDesc', 'E2E test lunch');
  await page.click('#txForm button[type="submit"]');
  {
    let ok = false;
    for (let i = 0; i < 4 && !ok; i++) {
      ok = await waitText(page, 'E2E test lunch', 8000).then(() => true).catch(() => false);
      if (!ok) {
        const st = await page.evaluate(() => ({
          rows: (document.getElementById('txBody') || {}).innerHTML ? document.getElementById('txBody').innerHTML.length : -1,
          toasts: Array.from(document.querySelectorAll('.toast')).map(t => t.textContent.slice(0, 60)),
          rootHidden: document.getElementById('modalRoot').classList.contains('hidden')
        })).catch(() => null);
        console.log('    [tx-add attempt ' + (i + 1) + '] ' + JSON.stringify(st));
        await settle(1200);
      }
    }
    check('transaction add appears in table', ok);
  }
  await waitSel(page, '#fSearch');

  await page.type('#fSearch', 'E2E test lunch');
  check('search filter narrows rows', await page.$$eval('#txBody tr', r => r.length === 1));

  await page.evaluate(() => {
    const btn = document.querySelector('#txBody [data-edit]');
    btn && btn.click();
  });
  await waitSel(page, '#txForm');
  await page.evaluate(() => { const i = document.getElementById('txDesc'); i.value = 'E2E updated lunch'; });
  await page.click('#txForm button[type="submit"]');
  check('transaction edits in place', await waitText(page, 'E2E updated lunch').then(() => true).catch(() => false));
  await waitSel(page, '#txBody', 5000).catch(() => {});

  /* ---------- Budgets ---------- */
  await page.goto(base + '/#/budgets', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#addBudget', { timeout: 15000 });
  await page.click('#addBudget');
  await page.waitForSelector('#budgetForm', { timeout: 10000 });
  await page.select('#bgCat', 'Entertainment');
  await fill(page, '#bgLimit', '300');
  await page.click('#budgetForm button[type="submit"]');
  check('budget created & visible', await page.waitForFunction(() => Array.from(document.querySelectorAll('.budget-card .gc-name')).some(e => e.textContent === 'Entertainment'), { timeout: 15000 }).then(() => true).catch(() => false));
  await waitSel(page, '#budgetGrid').catch(() => {});

  /* edit budget */
  let editClicked = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('.budget-card')).find(c => c.textContent.includes('Entertainment'));
    const btn = b && b.querySelector('[data-edit]');
    if (btn) { btn.click(); return 'clicked'; }
    return 'no-card-or-btn';
  });
  console.log('BUDGET EDIT click result: ' + editClicked + ' | url=' + page.url());
  await waitSel(page, '#budgetForm');
  await page.evaluate(() => { const i = document.getElementById('bgLimit'); i.value = '450'; });
  await page.click('#budgetForm button[type="submit"]');
  check('budget edits in place', await page.waitForFunction(() => Array.from(document.querySelectorAll('.budget-card')).some(c => c.textContent.includes('$450.00')), { timeout: 15000 }).then(() => true).catch(() => false));

  /* delete budget */
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('.budget-card')).find(c => c.textContent.includes('Entertainment'));
    b.querySelector('[data-del]').click();
  });
  await page.waitForSelector('#confirmBtn', { timeout: 10000 });
  await page.click('#confirmBtn');
  check('budget deletes', await page.waitForFunction(() => !Array.from(document.querySelectorAll('.budget-card')).some(c => c.textContent.includes('Entertainment')), { timeout: 15000 }).then(() => true).catch(() => false));

  /* ---------- Savings goal ---------- */
  await page.goto(base + '/#/savings', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#addGoal', { timeout: 15000 });
  await page.click('#addGoal');
  await page.waitForSelector('#goalForm', { timeout: 10000 });
  await fill(page, '#glName', 'E2E Goal');
  await fill(page, '#glTarget', '1000');
  await fill(page, '#glCurrent', '250');
  await page.click('#goalForm button[type="submit"]');
  check('goal created & visible', await page.waitForFunction(() => Array.from(document.querySelectorAll('.goal-card .gc-name')).some(e => e.textContent === 'E2E Goal'), { timeout: 15000 }).then(() => true).catch(() => false));

  /* deposit */
  {
    let depOk = false;
    for (let i = 0; i < 5 && !depOk; i++) {
      await page.evaluate(() => {
        const g = Array.from(document.querySelectorAll('.goal-card')).find(c => c.textContent.includes('E2E Goal'));
        g && g.querySelector('[data-deposit]').click();
      });
      depOk = await page.waitForSelector('#depForm', { timeout: 4000 }).then(() => true).catch(() => false);
      if (!depOk) {
        const st = await page.evaluate(() => ({
          cards: Array.from(document.querySelectorAll('.goal-card')).map(c => c.textContent.slice(0, 40)),
          rootHidden: document.getElementById('modalRoot').classList.contains('hidden'),
          panelLen: (document.getElementById('modalPanel') || {}).innerHTML ? document.getElementById('modalPanel').innerHTML.length : 0,
          toasts: Array.from(document.querySelectorAll('.toast')).map(t => t.textContent.slice(0, 50))
        })).catch(() => null);
        console.log('    [dep attempt ' + (i + 1) + '] ' + JSON.stringify(st));
        await settle(1200);
      }
    }
    check('deposit modal opens', depOk);
  }
  await fill(page, '#depAmount', '100');
  await page.click('#depForm button[type="submit"]');
  check('goal deposit works', await page.waitForFunction(() => Array.from(document.querySelectorAll('.goal-card')).some(c => c.textContent.includes('E2E Goal') && c.textContent.includes('$350.00')), { timeout: 15000 }).then(() => true).catch(() => false));

  /* ---------- Investments ---------- */
  await page.goto(base + '/#/investments', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#addInv', { timeout: 15000 });
  await page.click('#addInv');
  await page.waitForSelector('#invForm', { timeout: 10000 });
  await fill(page, '#invName', 'E2E ETF');
  await page.select('#invType', 'ETF');
  await fill(page, '#invUnits', '10');
  await fill(page, '#invBuy', '100');
  await fill(page, '#invCur', '110');
  await page.click('#invForm button[type="submit"]');
  check('investment created & visible', await waitText(page, 'E2E ETF').then(() => true).catch(() => false));
  check('investment gain shown', await page.waitForFunction(() => document.body.innerText.includes('$100.00') && document.body.innerText.includes('10%'), { timeout: 15000 }).then(() => true).catch(() => false));

  /* delete investment */
  await page.evaluate(() => {
    const row = Array.from(document.querySelectorAll('#invBody tr')).find(r => r.textContent.includes('E2E ETF'));
    row.querySelector('[data-del]').click();
  });
  await page.waitForSelector('#confirmBtn', { timeout: 10000 });
  await page.click('#confirmBtn');
  check('investment deletes', await page.waitForFunction(() => !document.body.innerText.includes('E2E ETF'), { timeout: 15000 }).then(() => true).catch(() => false));

  /* ---------- Advisor ---------- */
  await page.goto(base + '/#/advisor', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#sendBtn', { timeout: 15000 });
  await page.type('#chatInput', 'How much did I spend on food this month?');
  await page.click('#sendBtn');
  check('advisor streams an answer', await page.waitForFunction(() => {
    const msgs = document.querySelectorAll('.msg.ai .bubble');
    return msgs.length > 0 && msgs[msgs.length - 1].textContent.length > 80;
  }, { timeout: 60000 }).then(() => true).catch(() => false));

  /* ---------- Reports ---------- */
  await page.goto(base + '/#/reports', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.rep-stat', { timeout: 15000 }).catch(() => {});
  check('reports summary renders', (await page.$$('.rep-stat')).length >= 4);

  /* ---------- Notifications ---------- */
  await page.goto(base + '/#/notifications', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#readAll', { timeout: 15000 }).catch(() => {});
  check('notifications page renders', (await page.$('#readAll')) !== null);
  const badgeVisible = await page.$eval('#notifBadge', e => !e.classList.contains('hidden')).catch(() => false);
  check('notification badge shown when unread', badgeVisible);

  /* ---------- Settings ---------- */
  await page.goto(base + '/#/settings', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#profileForm', { timeout: 15000 });
  check('settings page renders', true);
  await page.$eval('#pFirst', e => (e.value = 'E2E2'));
  await page.click('#profileForm button[type="submit"]');
  check('profile update persists', await waitText(page, 'Profile saved').then(() => true).catch(() => false));

  /* ---------- Logout ---------- */
  await page.click('#logoutBtn');
  await page.waitForSelector('#loginForm', { timeout: 15000 });
  check('logout returns to login', (await page.$('#loginForm')) !== null);

  /* ---------- Re-login as demo to sanity check dashboard totals ---------- */
  await page.type('#loginEmail', 'demo@financeai.com');
  await page.type('#loginPassword', 'demo1234');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 }).catch(() => {}),
    page.click('#loginBtn')
  ]);
  await page.waitForSelector('.stat', { timeout: 15000 }).catch(() => {});
  const balance = await page.$eval('.stat', e => e.textContent).catch(() => '');
  check('demo login shows balance', /18,371/.test(balance || ''));

  await browser.close();
  console.log('\n===== RESULT: ' + passed + ' passed, ' + failed + ' failed =====');
  process.exit(failed === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(2); });