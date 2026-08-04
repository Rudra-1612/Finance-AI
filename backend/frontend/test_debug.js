/* Advisor flow probe: capture NET + console + bubble lengths */
const puppeteer = require('C:/Users/Admin/AppData/Local/Temp/opencode/pptr/node_modules/puppeteer-core');
const path = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = 'http://127.0.0.1:8080';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: path, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  page.on('console', m => { const l = m.text().slice(0, 140); if (m.type() === 'error' || m.type() === 'warning') console.log('CONSOLE[' + m.type() + '] ' + l); });
  page.on('request', r => { if (r.url().includes('/api/')) console.log('REQ', r.method(), r.url().replace(base, '')); });
  page.on('response', r => { if (r.url().includes('/api/')) console.log('RES', r.status(), r.url().replace(base, '')); });

  const email = 'dbg+' + Date.now() + '@test.com';
  await page.goto(base + '/#/register', { waitUntil: 'networkidle0' });
  await page.type('#regFirst', 'Dbg'); await page.type('#regLast', 'User');
  await page.type('#regEmail', email); await page.type('#regPass', 'password123');
  await page.type('#regPass2', 'password123');
  await page.evaluate(() => document.querySelector('#regBtn').click());
  await sleep(2500);

  await page.goto(base + '/#/advisor', { waitUntil: 'networkidle0' });
  await page.waitForSelector('#sendBtn', { timeout: 15000 });
  console.log('advisor page loaded; has conversations:', await page.evaluate(() => document.querySelectorAll('.msg').length));

  await page.type('#chatInput', 'How much did I spend on food this month?');
  await page.click('#sendBtn');
  let bubbles = 0;
  for (let i = 0; i < 40; i++) {
    await sleep(1000);
    bubbles = await page.evaluate(() => {
      const bs = Array.from(document.querySelectorAll('.msg.ai .bubble'));
      return bs.length ? bs[bs.length - 1].textContent.length : -1;
    });
    console.log('t+' + (i + 1) + 's last ai bubble len=' + bubbles);
    if (bubbles > 80) break;
  }
  const msgs = await page.evaluate(() => Array.from(document.querySelectorAll('.msg .bubble')).map(b => ({ cls: b.parentElement.className.slice(0, 20), len: b.textContent.length, txt: b.textContent.slice(0, 60) })));
  console.log('ALL BUBBLES:', JSON.stringify(msgs, null, 2));
  await browser.close();
})().catch(e => console.error('FATAL', e));