/* Headless end-to-end test of the FinanceAI SPA using CDP via puppeteer-core-style raw protocol.
   We drive headless Chrome with --dump-dom / --virtual-time-budget for simple checks. */

// This file spawns headless Chrome for each route and dumps rendered DOM.
const { execFileSync } = require('child_process');
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function dump(url, extra) {
  const args = ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-background-networking',
    '--hide-scrollbars', '--mute-audio', '--virtual-time-budget=9000', '--user-data-dir=' + (extra ? extra : 'C:\\Users\\Admin\\AppData\\Local\\Temp\\opencode\\cdp' + Math.random().toString(36).slice(2)),
    '--dump-dom', url];
  try {
    const out = execFileSync(chrome, args, { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024, timeout: 30000 });
    return out;
  } catch (e) {
    return 'EXEC_ERROR: ' + (e.stdout ? e.stdout.toString() : e.message);
  }
}

const base = 'http://127.0.0.1:8080';
const checks = [];

// Landing page
let dom = dump(base + '/#/');
checks.push(['landing title', dom.includes('Take control of your money')]);
checks.push(['landing hero', dom.includes('AI-powered financial companion')]);

// Login page renders
dom = dump(base + '/#/login');
checks.push(['login renders', dom.includes('Welcome back')]);

// Register page renders
dom = dump(base + '/#/register');
checks.push(['register renders', dom.includes('Create your account')]);

// Static asset checks
const fs = require('fs');
checks.push(['js/api.js', fs.existsSync('C:\\Users\\Admin\\Downloads\\AI-Advisor-Chat\\AI-Advisor-Chat\\backend\\frontend\\js\\api.js')]);
checks.push(['js/pages.js', fs.existsSync('C:\\Users\\Admin\\Downloads\\AI-Advisor-Chat\\AI-Advisor-Chat\\backend\\frontend\\js\\pages.js')]);
checks.push(['css/styles.css', fs.existsSync('C:\\Users\\Admin\\Downloads\\AI-Advisor-Chat\\AI-Advisor-Chat\\backend\\frontend\\css\\styles.css')]);

let failed = 0;
for (const [name, ok] of checks) {
  if (!ok) failed++;
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name);
}
console.log(failed === 0 ? '\nALL PASS' : '\nFAILURES: ' + failed);
process.exit(failed === 0 ? 0 : 1);