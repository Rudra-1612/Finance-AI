/* FinanceAI — page renderers. Each page receives the #view element. */
(function () {
  const { escapeHtml, fmtMoney, fmtNum, fmtPct, fmtDate, fmtDateTime, moneyClass, toast, toastError,
    openModal, closeModal, confirmModal, wireModal, panelAction, on, icon } = UI;

  const CATEGORIES = [
    'Salary', 'Freelance', 'Investment Income', 'Other Income',
    'Housing', 'Utilities', 'Food & Dining', 'Groceries', 'Transportation', 'Healthcare',
    'Entertainment', 'Shopping', 'Education', 'Travel', 'Personal Care', 'Insurance',
    'Subscriptions', 'Other'
  ];

  const CATEGORY_COLORS = {
    'Income': '#34d399', 'Salary': '#34d399', 'Freelance': '#2dd4bf', 'Investment Income': '#a3e635',
    'Other Income': '#94a3b8', 'Housing': '#fbbf24', 'Utilities': '#60a5fa',
    'Food & Dining': '#f97316', 'Groceries': '#a3e635', 'Transportation': '#22d3ee',
    'Healthcare': '#f87171', 'Entertainment': '#c084fc', 'Shopping': '#fb7185',
    'Education': '#818cf8', 'Travel': '#2dd4bf', 'Personal Care': '#e879f9',
    'Insurance': '#94a3b8', 'Subscriptions': '#38bdf8', 'Other': '#64748b'
  };

  const PAYMENT_METHODS = ['Card', 'Cash', 'Bank Transfer', 'UPI', 'PayPal', 'Net Banking', 'Other'];
  const INVEST_TYPES = ['Stocks', 'ETF', 'Mutual Fund', 'Bonds', 'Gold', 'Fixed Deposit', 'Crypto', 'Real Estate', 'Other'];
  const RISK_LEVELS = ['Low', 'Moderate', 'High'];

  function catColor(cat) { return CATEGORY_COLORS[cat] || '#64748b'; }

  function currentMonthStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  function monthOptions(selected) {
    const now = new Date();
    let out = '<option value="">All months</option>';
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const v = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      const lbl = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      out += '<option value="' + v + '"' + (v === selected ? ' selected' : '') + '>' + lbl + '</option>';
    }
    return out;
  }

  function catOptions(selected) {
    return CATEGORIES.map(c =>
      '<option value="' + c + '"' + (c === selected ? ' selected' : '') + '>' + c + '</option>').join('');
  }

  function spinner() {
    return '<div class="empty"><div class="empty-svg">' + icon('sparkle') + '</div><h3>Loading…</h3></div>';
  }

  /* ============================================================
     Auth / landing
     ============================================================ */
  const Pages = {};

  Pages.landing = function (view) {
    view.innerHTML =
      '<nav class="landing-nav">' +
      '<div class="brand"><span class="brand-mark">Fa</span><span class="brand-name">Finance<span class="brand-accent">AI</span></span></div>' +
      '<div class="nav-links"><a href="#/dashboard">App</a><a href="#/login">Sign in</a>' +
      '<a class="btn btn-primary btn-sm" href="#/register">Get started</a></div>' +
      '</nav>' +
      '<header class="hero">' +
      '<span class="hero-badge"><span class="pill-dot"></span>Your AI-powered financial companion</span>' +
      '<h1>Take control of your money, <span class="grad-text">one intelligent decision</span> at a time</h1>' +
      '<p class="sub">FinanceAI tracks every transaction, builds your budgets, grows your savings and investments, and answers your money questions with a built-in AI advisor.</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-primary" href="#/register">Create free account</a>' +
      '<a class="btn" href="#/login">Sign in</a>' +
      '</div>' +
      '<div class="hero-stats">' +
      '<div class="hero-stat"><b>100%</b><span>Data privacy</span></div>' +
      '<div class="hero-stat"><b>24/7</b><span>AI advisor</span></div>' +
      '<div class="hero-stat"><b>0$</b><span>Setup cost</span></div>' +
      '</div>' +
      '<div class="mock-dash"><div class="mock-top"><i></i><i></i><i></i></div>' +
      '<div class="mock-grid">' +
      '<div class="mock-card"><small>Total balance</small><div class="m-num">$18,371.55</div><div class="m-bar"><i style="width:72%"></i></div></div>' +
      '<div class="mock-card"><small>Monthly income</small><div class="m-num">$5,650.00</div><div class="m-bar"><i style="width:84%"></i></div></div>' +
      '<div class="mock-card"><small>Financial score</small><div class="m-num">90 / 100</div><div class="m-bar"><i style="width:90%"></i></div></div>' +
      '</div></div>' +
      '</header>' +
      '<section class="section" id="features">' +
      '<h2>Everything you need to <span class="grad-text">master your money</span></h2>' +
      '<p class="lead">A complete personal finance suite — built for clarity, speed and real results.</p>' +
      '<div class="features">' +
      feature('📊', 'Smart dashboard', 'Your balance, cash flow trends, spending breakdown and financial score — always one glance away.') +
      feature('🧾', 'Transaction tracking', 'Log income and expenses in seconds with filters, search and instant CSV export.') +
      feature('🎯', 'Budgets that work', 'Category budgets with live progress bars that warn you before you overspend.') +
      feature('💎', 'Savings goals', 'Set targets, track progress to the deadline, and top up with one click.') +
      feature('📈', 'Investment portfolio', 'Stocks, ETFs, mutual funds, gold and more — track value, gains and allocation.') +
      feature('🤖', 'AI advisor', 'Ask anything about your finances and get data-driven answers with real-time context.') +
      feature('📄', 'PDF & CSV reports', 'Beautiful financial reports you can export, print or share with your advisor.') +
      feature('🔔', 'Smart notifications', 'Budget warnings, milestones and insights delivered the moment they matter.') +
      '</div></section>' +
      '<section class="section"><div class="cta-band">' +
      '<h2>Ready to grow your wealth?</h2><p>Join FinanceAI today and let intelligent automation handle the numbers while you focus on living.</p>' +
      '<a class="btn" href="#/register">Get started — it\'s free</a></div></section>' +
      '<footer class="landing-foot">FinanceAI © 2026 — Intelligent Personal Finance. Demo build with Java Spring Boot + MySQL.</footer>';
  };

  function feature(em, title, desc) {
    return '<div class="feature"><div class="feature-icon">' + em + '</div><h3>' + title + '</h3><p>' + desc + '</p></div>';
  }

  Pages.login = function (view) {
    view.innerHTML =
      '<a class="btn btn-ghost auth-back" href="#/">← Back</a>' +
      '<div class="auth-wrap"><div class="auth-card">' +
      '<div class="auth-brand"><div class="brand" style="justify-content:center"><span class="brand-mark">Fa</span><span class="brand-name">Finance<span class="brand-accent">AI</span></span></div></div>' +
      '<h1>Welcome back</h1><p class="auth-sub">Sign in to your financial command center</p>' +
      '<form id="loginForm" novalidate>' +
      '<div class="form-row"><label class="form-label">Email</label><input class="input" type="email" id="loginEmail" placeholder="you@example.com" required /><div class="field-error hidden" id="emailErr"></div></div>' +
      '<div class="form-row"><label class="form-label">Password</label><input class="input" type="password" id="loginPassword" placeholder="••••••••" required /><div class="field-error hidden" id="passErr"></div></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="loginBtn">Sign in</button>' +
      '</form>' +
      '<div style="margin-top:12px"><button class="btn btn-ghost btn-block btn-sm" id="demoBtn">Use demo account (demo@financeai.com)</button></div>' +
      '<div class="auth-alt"><span>New to FinanceAI?</span><a href="#/register">Create an account</a></div>' +
      '</div></div>';
    const form = view.querySelector('#loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = view.querySelector('#loginEmail').value.trim();
      const password = view.querySelector('#loginPassword').value;
      const btn = view.querySelector('#loginBtn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        const res = await Api.login({ email, password });
        afterAuth(res);
      } catch (err) {
        toastError(err);
      } finally { btn.disabled = false; btn.textContent = 'Sign in'; }
    });
    view.querySelector('#demoBtn').addEventListener('click', async () => {
      const btn = view.querySelector('#demoBtn');
      btn.disabled = true;
      try {
        const res = await Api.login({ email: 'demo@financeai.com', password: 'demo1234' });
        toast('Demo account ready', 'Welcome to FinanceAI!', 'success');
        afterAuth(res);
      } catch (err) { toastError(err); }
      btn.disabled = false;
    });
  };

  function afterAuth(res) {
    Api.store(res.token, res.user);
    UI.setCurrency(res.user.currency);
    location.hash = '#/dashboard';
  }

  Pages.register = function (view) {
    view.innerHTML =
      '<a class="btn btn-ghost auth-back" href="#/">← Back</a>' +
      '<div class="auth-wrap"><div class="auth-card">' +
      '<div class="auth-brand"><div class="brand" style="justify-content:center"><span class="brand-mark">Fa</span><span class="brand-name">Finance<span class="brand-accent">AI</span></span></div></div>' +
      '<h1>Create your account</h1><p class="auth-sub">Start your journey to financial clarity</p>' +
      '<form id="regForm" novalidate>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">First name</label><input class="input" id="regFirst" placeholder="Alex" required /></div>' +
      '<div class="form-row"><label class="form-label">Last name</label><input class="input" id="regLast" placeholder="Morgan" required /></div>' +
      '</div>' +
      '<div class="form-row"><label class="form-label">Email</label><input class="input" type="email" id="regEmail" placeholder="you@example.com" required /></div>' +
      '<div class="form-row"><label class="form-label">Phone (optional)</label><input class="input" id="regPhone" placeholder="+1 555 000 0000" /></div>' +
      '<div class="form-row"><label class="form-label">Password</label><input class="input" type="password" id="regPass" placeholder="At least 6 characters" minlength="6" required /><div class="field-error hidden" id="passErr"></div></div>' +
      '<div class="form-row"><label class="form-label">Confirm password</label><input class="input" type="password" id="regPass2" placeholder="Repeat password" required /></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="regBtn">Create account</button>' +
      '</form>' +
      '<div class="auth-alt"><span>Already have an account?</span><a href="#/login">Sign in</a></div>' +
      '</div></div>';
    const form = view.querySelector('#regForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const first = view.querySelector('#regFirst').value.trim();
      const last = view.querySelector('#regLast').value.trim();
      const email = view.querySelector('#regEmail').value.trim();
      const phone = view.querySelector('#regPhone').value.trim();
      const pass = view.querySelector('#regPass').value;
      const pass2 = view.querySelector('#regPass2').value;
      if (pass !== pass2) { toast('Passwords don\'t match', 'Please re-enter your password.', 'error'); return; }
      const btn = view.querySelector('#regBtn');
      btn.disabled = true; btn.textContent = 'Creating account…';
      try {
        const res = await Api.register({ firstName: first, lastName: last, email, phone, password: pass });
        Api.store(res.token, res.user);
        UI.setCurrency(res.user.currency);
        toast('Welcome to FinanceAI!', 'Your account is ready.', 'success');
        location.hash = '#/dashboard';
      } catch (err) { toastError(err); }
      btn.disabled = false; btn.textContent = 'Create account';
    });
  };

  /* ============================================================
     Dashboard
     ============================================================ */
  Pages.dashboard = async function (view) {
    view.innerHTML = spinner();
    let data;
    try { data = await Api.dashboard(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load dashboard</h3></div>'; return; }

    const m = data.meta || {};
    const firstName = m.firstName || 'there';

    const stats = [
      { label: 'Total balance', value: data.totalBalance, sub: 'across all accounts', icon: 'bank', cls: moneyClass(data.totalBalance), delta: m.balanceDelta },
      { label: 'Monthly income', value: data.monthlyIncome, sub: 'this month', icon: 'wallet', cls: 'money-pos', delta: m.incomeDelta },
      { label: 'Monthly expenses', value: data.monthlyExpenses, sub: 'this month', icon: 'receipt', cls: moneyClass(-data.monthlyExpenses), delta: m.expenseDelta },
      { label: 'Total savings', value: data.totalSavings, sub: 'towards goals', icon: 'target', cls: 'money-pos', delta: m.savingsDelta }
    ];

    view.innerHTML =
      '<div class="page-head"><div><h1>Good to see you, ' + escapeHtml(firstName) + ' 👋</h1>' +
      '<p>Here\'s your financial snapshot for ' + new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) + '.</p></div>' +
      '<div class="page-actions">' +
      '<button class="btn" data-goto="advisor">' + icon('bot') + ' Ask the advisor</button>' +
      '<button class="btn btn-primary" id="quickAddTx">' + icon('plus') + ' Add transaction</button>' +
      '</div></div>' +
      '<div class="grid grid-4" style="margin-bottom:20px">' + stats.map(statCard).join('') + '</div>' +
      '<div class="grid" style="grid-template-columns: 1.6fr 1fr; margin-bottom:20px">' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Cash flow</div><div class="card-sub">Last 6 months — income vs expenses</div></div></div>' +
      '<div class="chart-box"><canvas class="chart" id="flowChart" height="260"></canvas></div></div>' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Spending breakdown</div><div class="card-sub">Where your money went this month</div></div></div>' +
      '<div class="chart-box" style="display:flex;flex-direction:column;align-items:center"><canvas class="chart" id="spendChart" style="max-width:210px"></canvas></div>' +
      '<div class="chart-legend" id="spendLegend"></div></div>' +
      '</div>' +
      '<div class="grid" style="grid-template-columns: 1.4fr 1fr; margin-bottom:20px">' +
      '<div class="card"><div class="card-head"><div><div class="card-title">AI Insights</div><div class="card-sub">Personalized recommendations from your data</div></div></div>' +
      '<div id="insightList">' + (data.insights && data.insights.length ? data.insights.map(insightCard).join('') : '<div class="empty">No insights yet — keep tracking to unlock AI recommendations.</div>') + '</div></div>' +
      '<div><div class="card" style="margin-bottom:20px"><div class="card-head"><div><div class="card-title">Financial score</div><div class="card-sub">Your overall health rating</div></div>' +
      '<span class="tag tag-purple">' + data.financialScore + ' / 100</span></div>' +
      '<div class="progress progress-accent"><i style="width:' + data.financialScore + '%"></i></div>' +
      '<p style="margin-top:10px;color:var(--text-2)"><b style="color:var(--text)">' + escapeHtml(data.scoreLabel) + '</b> — solid habits. Keep automating savings and reviewing subscriptions.</p></div>' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Goals</div><div class="card-sub">Savings progress</div></div>' +
      '<a class="btn btn-sm btn-ghost" href="#/savings">View all</a></div>' +
      '<div id="dashGoals">' + (data.goals && data.goals.length ? data.goals.slice(0, 3).map(goalMini).join('') : '<div class="empty">No goals yet</div>') + '</div></div>' +
      '</div></div>' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Recent transactions</div><div class="card-sub">Your latest activity</div></div>' +
      '<a class="btn btn-sm btn-ghost" href="#/transactions">View all</a></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>' +
      '<tbody>' + (data.recentTransactions && data.recentTransactions.length ? data.recentTransactions.map(txRow).join('') : '<tr><td colspan="5"><div class="empty">No transactions yet</div></td></tr>') + '</tbody></table></div></div>';

    setTimeout(() => {
      const flow = document.getElementById('flowChart');
      if (flow && data.cashFlow && data.cashFlow.length) {
        UI.lineChart(flow, data.cashFlow, { height: 260 });
      } else {
        flow.parentElement.innerHTML = '<div class="empty">Not enough data yet</div>';
      }
      const spend = document.getElementById('spendChart');
      if (spend) {
        const slices = data.expenseByCategory || [];
        if (slices.length) {
          UI.donutChart(spend, slices.map(s => ({ label: s.name, value: s.value, color: catColor(s.name) })), { size: 190 });
          document.getElementById('spendLegend').innerHTML = slices.slice(0, 6).map(s =>
            '<span class="lg"><i style="background:' + catColor(s.name) + '"></i>' + escapeHtml(s.name) + '</span>').join('');
        } else {
          spend.parentElement.innerHTML = '<div class="empty" style="padding:30px 10px">No expenses this month</div>';
        }
      }
    }, 30);

    on(view, '[data-goto="advisor"]', 'click', () => { location.hash = '#/advisor'; });
    on(view, '#quickAddTx', 'click', () => txModal(null, async () => { location.hash = '#/transactions'; }));
  };

  function statCard(s) {
    const trend = !s.delta ? '<span class="trend-flat">— stable</span>' :
      (Number(s.delta) >= 0 ? '<span class="trend-up">▲ ' + fmtPct(Math.abs(s.delta)) + ' vs last month</span>'
        : '<span class="trend-down">▼ ' + fmtPct(Math.abs(s.delta)) + ' vs last month</span>');
    return '<div class="stat"><div class="stat-top"><span class="stat-label">' + s.label + '</span>' +
      '<span class="stat-icon">' + icon(s.icon) + '</span></div>' +
      '<div class="stat-value ' + s.cls + '">' + fmtMoney(s.value) + '</div>' +
      '<div class="stat-foot">' + trend + '<span style="color:var(--text-3)">· ' + s.sub + '</span></div></div>';
  }

  function insightCard(i) {
    const colors = { warning: 'red', info: 'blue', positive: 'green', danger: 'amber' };
    const em = i.type === 'warning' ? '⚠️' : i.type === 'positive' ? '✅' : i.type === 'danger' ? '🚨' : '💡';
    const bg = { warning: 'var(--amber-bg)', info: 'var(--blue-bg)', positive: 'var(--green-bg)', danger: 'var(--red-bg)' }[i.type] || 'var(--surface-2)';
    return '<div class="insight"><div class="insight-icon" style="background:' + bg + '">' + em + '</div>' +
      '<div><div class="insight-title">' + escapeHtml(i.title) + '</div>' +
      '<div class="insight-msg">' + escapeHtml(i.message) + '</div>' +
      (i.action ? '<div class="insight-action">' + escapeHtml(i.action) + '</div>' : '') + '</div></div>';
  }

  function goalMini(g) {
    return '<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">' +
      '<b>' + escapeHtml(g.name) + '</b><span style="color:var(--text-3)">' + fmtPct(g.percent) + '</span></div>' +
      '<div class="progress ' + (g.complete ? 'progress-ok' : 'progress-accent') + '"><i style="width:' + Math.min(100, g.percent) + '%"></i></div>' +
      '<div style="color:var(--text-3);font-size:12px;margin-top:5px">' + fmtMoney(g.current) + ' of ' + fmtMoney(g.target) + '</div></div>';
  }

  /* ============================================================
     Transactions
     ============================================================ */
  Pages.transactions = async function (view) {
    view.innerHTML = spinner();
    let all;
    try { all = await Api.transactions(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load transactions</h3></div>'; return; }

    view.innerHTML =
      '<div class="page-head"><div><h1>Transactions</h1><p>' + all.length + ' total · every rupee in and out of your life</p></div>' +
      '<div class="page-actions">' +
      '<button class="btn" id="exportCsv">' + icon('download') + ' Export CSV</button>' +
      '<button class="btn btn-primary" id="addTx">' + icon('plus') + ' Add transaction</button></div></div>' +
      '<div class="card">' +
      '<div class="filters">' +
      '<input class="input grow" id="fSearch" placeholder="Search description, category, method…" />' +
      '<select class="input" id="fCategory"><option value="">All categories</option>' + CATEGORIES.map(c => '<option>' + c + '</option>').join('') + '</select>' +
      '<select class="input" id="fType"><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>' +
      '<select class="input" id="fMonth">' + monthOptions() + '</select>' +
      '</div>' +
      '<div class="table-wrap"><table class="table"><thead><tr>' +
      '<th>Description</th><th>Category</th><th>Date</th><th>Method</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>' +
      '<tbody id="txBody">' + all.map(txRow).join('') + '</tbody></table></div>' +
      '</div>';

    const body = view.querySelector('#txBody');

    function applyFilters() {
      const q = view.querySelector('#fSearch').value.toLowerCase();
      const c = view.querySelector('#fCategory').value;
      const t = view.querySelector('#fType').value;
      const mo = view.querySelector('#fMonth').value;
      const rows = all.filter(tx => {
        if (q && !(tx.description.toLowerCase().includes(q) || tx.category.toLowerCase().includes(q) ||
          (tx.paymentMethod || '').toLowerCase().includes(q))) return false;
        if (c && tx.category !== c) return false;
        if (t && tx.type !== t) return false;
        if (mo && !tx.date.startsWith(mo)) return false;
        return true;
      });
      body.innerHTML = rows.length ? rows.map(txRow).join('') :
        '<tr><td colspan="6"><div class="empty">No transactions match your filters.</div></td></tr>';
    }

    view.querySelector('#fSearch').addEventListener('input', applyFilters);
    view.querySelector('#fCategory').addEventListener('change', applyFilters);
    view.querySelector('#fType').addEventListener('change', applyFilters);
    view.querySelector('#fMonth').addEventListener('change', applyFilters);

    on(view, '#addTx', 'click', () => txModal(null, () => window.renderCurrent()));
    on(body, '[data-edit]', 'click', (e, btn) => {
      const tx = all.find(x => x.id === Number(btn.dataset.edit));
      if (tx) txModal(tx, () => window.renderCurrent());
    });
    on(body, '[data-del]', 'click', (e, btn) => {
      const id = Number(btn.dataset.del);
      confirmModal('Delete transaction?', 'This will permanently remove this transaction. This action cannot be undone.', async () => {
        try { await Api.deleteTransaction(id); toast('Deleted', 'Transaction removed.', 'success'); window.renderCurrent(); }
        catch (err) { toastError(err); }
      }, true);
    });

    view.querySelector('#exportCsv').addEventListener('click', () => {
      let csv = 'Date,Description,Category,Type,Payment Method,Amount\n';
      all.forEach(t => {
        csv += [t.date, '"' + t.description.replace(/"/g, '""') + '"', '"' + t.category + '"', t.type,
          '"' + (t.paymentMethod || '') + '"', t.amount].join(',') + '\n';
      });
      downloadFile('transactions.csv', 'text/csv', csv);
    });
  };

  function txRow(t) {
    const cat = t.category || 'Other';
    return '<tr>' +
      '<td><span class="tx-cat"><span class="cat-dot" style="background:' + catColor(cat) + '"></span>' + escapeHtml(t.description) + '</span></td>' +
      '<td>' + escapeHtml(cat) + '</td>' +
      '<td>' + fmtDate(t.date) + '</td>' +
      '<td>' + escapeHtml(t.paymentMethod || '—') + '</td>' +
      '<td style="text-align:right" class="money ' + moneyClass(Number(t.amount)) + '">' + (t.type === 'expense' ? '−' : '+') + fmtMoney(Math.abs(Number(t.amount))) + '</td>' +
      '<td style="text-align:right;white-space:nowrap">' +
      '<button class="icon-btn" data-edit="' + t.id + '" title="Edit">' + icon('edit') + '</button>' +
      '<button class="icon-btn" data-del="' + t.id + '" title="Delete" style="color:var(--red)">' + icon('trash') + '</button></td></tr>';
  }

  function txModal(existing, after) {
    const isEdit = !!existing;
    openModal(
      '<div class="modal-head"><h2>' + (isEdit ? 'Edit transaction' : 'Add transaction') + '</h2>' +
      '<button class="icon-btn" data-close>' + icon('x') + '</button></div>' +
      '<form id="txForm" novalidate>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Type</label><select class="input" id="txType">' +
      '<option value="expense"' + (!isEdit || existing.type === 'expense' ? ' selected' : '') + '>Expense</option>' +
      '<option value="income"' + (isEdit && existing.type === 'income' ? ' selected' : '') + '>Income</option></select></div>' +
      '<div class="form-row"><label class="form-label">Amount (' + (Api.user ? Api.user.currency || '$' : '$') + ')</label>' +
      '<input class="input" type="number" step="0.01" min="0.01" id="txAmount" value="' + (isEdit ? Math.abs(Number(existing.amount)) : '') + '" required /></div>' +
      '</div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Category</label><select class="input" id="txCategory">' + catOptions(isEdit ? existing.category : '') + '</select></div>' +
      '<div class="form-row"><label class="form-label">Date</label><input class="input" type="date" id="txDate" value="' + (isEdit ? existing.date : new Date().toISOString().slice(0, 10)) + '" required /></div>' +
      '</div>' +
      '<div class="form-row"><label class="form-label">Description</label><input class="input" id="txDesc" placeholder="e.g. Coffee with friends" value="' + (isEdit ? escapeHtml(existing.description) : '') + '" required /></div>' +
      '<div class="form-row"><label class="form-label">Payment method</label><select class="input" id="txMethod">' +
      PAYMENT_METHODS.map(p => '<option' + (isEdit && existing.paymentMethod === p ? ' selected' : '') + '>' + p + '</option>').join('') + '</select></div>' +
      '<div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button>' +
      '<button class="btn btn-primary" type="submit">' + (isEdit ? 'Save changes' : 'Add transaction') + '</button></div>' +
      '</form>'
    );
    wireModal();
    viewFormErrors();
    const form = document.getElementById('txForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        date: document.getElementById('txDate').value,
        category: document.getElementById('txCategory').value,
        amount: document.getElementById('txAmount').value,
        paymentMethod: document.getElementById('txMethod').value,
        description: document.getElementById('txDesc').value.trim(),
        type: document.getElementById('txType').value
      };
      if (!payload.description) { formError('txDesc', 'Description is required'); return; }
      try {
        if (isEdit) await Api.updateTransaction(existing.id, payload);
        else await Api.createTransaction(payload);
        toast(isEdit ? 'Updated' : 'Added', payload.description + ' saved.', 'success');
        closeModal(); after && after();
      } catch (err) { toastError(err); }
    });
  }

  function viewFormErrors() { /* helper space for field-level errors */ }
  function formError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.style.borderColor = 'var(--red)'; toast(msg, '', 'error'); }
  }

  /* ============================================================
     Expenses
     ============================================================ */
  Pages.expenses = async function (view) {
    view.innerHTML = spinner();
    let all;
    try { all = await Api.transactions(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load expenses</h3></div>'; return; }

    view.innerHTML =
      '<div class="page-head"><div><h1>Expenses</h1><p>Analyze and understand your spending patterns</p></div>' +
      '<div class="page-actions"><button class="btn btn-primary" id="addExpense">' + icon('plus') + ' Add expense</button></div></div>' +
      '<div class="filters"><select class="input" id="expMonth">' + monthOptions(currentMonthStr()) + '</select></div>' +
      '<div id="expContent">' + spinner() + '</div>';

    on(view, '#addExpense', 'click', () => txModal(null, () => window.renderCurrent()));

    async function renderExpenses() {
      const month = view.querySelector('#expMonth').value;
      const expenses = all.filter(t => t.type === 'expense' && (!month || t.date.startsWith(month)));
      const income = all.filter(t => t.type === 'income' && (!month || t.date.startsWith(month)));
      const totalExp = expenses.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
      const totalInc = income.reduce((s, t) => s + Number(t.amount), 0);

      const byCat = {};
      expenses.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + Math.abs(Number(t.amount)); });
      const slices = Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

      const wrap = view.querySelector('#expContent');
      wrap.innerHTML =
        '<div class="report-summary" style="margin-bottom:20px">' +
        '<div class="rep-stat"><div class="rs-label">Total spent</div><div class="rs-value money-neg">' + fmtMoney(-totalExp) + '</div></div>' +
        '<div class="rep-stat"><div class="rs-label">Income</div><div class="rs-value money-pos">' + fmtMoney(totalInc) + '</div></div>' +
        '<div class="rep-stat"><div class="rs-label">Net</div><div class="rs-value">' + fmtMoney(totalInc - totalExp) + '</div></div>' +
        '<div class="rep-stat"><div class="rs-label">Top category</div><div class="rs-value" style="font-size:17px">' +
        (slices[0] ? escapeHtml(slices[0].name) : '—') + '</div></div></div>' +
        '<div class="grid" style="grid-template-columns:1.2fr 1fr; margin-bottom:20px">' +
        '<div class="card"><div class="card-head"><div><div class="card-title">Spending by category</div><div class="card-sub">' +
        (month ? 'Expenses for ' + new Date(month + '-01T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'All time') + '</div></div></div>' +
        (slices.length ? '<div class="chart-box"><canvas class="chart" id="expBar"></canvas></div>' : '<div class="empty">No expenses in this period</div>') + '</div>' +
        '<div class="card"><div class="card-head"><div><div class="card-title">Category share</div><div class="card-sub">Percent of total spend</div></div></div>' +
        (slices.length ? '<div class="chart-box" style="display:flex;flex-direction:column;align-items:center"><canvas class="chart" id="expDonut" style="max-width:200px"></canvas></div>' +
          '<div class="chart-legend">' + slices.slice(0, 7).map(s => '<span class="lg"><i style="background:' + catColor(s.name) + '"></i>' + escapeHtml(s.name) + ' · ' + fmtPct(Math.round(s.value / totalExp * 100)) + '</span>').join('') + '</div>'
          : '<div class="empty">Nothing to show</div>') + '</div></div>' +
        '<div class="card"><div class="card-head"><div><div class="card-title">Expense transactions</div><div class="card-sub">' + expenses.length + ' transactions</div></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Method</th><th style="text-align:right">Amount</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody>' + (expenses.length ? expenses.map(txRow).join('') : '<tr><td colspan="6"><div class="empty">No expenses found.</div></td></tr>') + '</tbody></table></div></div>';

      setTimeout(() => {
        const bar = document.getElementById('expBar');
        if (bar && slices.length) {
          UI.barChart(bar, slices.map(s => ({ label: s.name, value: s.value, color: catColor(s.name) })), { height: 250 });
        }
        const donut = document.getElementById('expDonut');
        if (donut && slices.length) {
          UI.donutChart(donut, slices.map(s => ({ label: s.name, value: s.value, color: catColor(s.name) })), { size: 175, center: Math.round((slices[0] ? slices[0].value : 0) / totalExp * 100), centerLabel: 'top share' });
        }
      }, 30);
    }
    view.querySelector('#expMonth').addEventListener('change', renderExpenses);
    renderExpenses();
  };

  /* ============================================================
     Budgets
     ============================================================ */
  Pages.budgets = async function (view) {
    view.innerHTML = spinner();
    let budgets;
    try { budgets = await Api.budgets(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load budgets</h3></div>'; return; }

    view.innerHTML =
      '<div class="page-head"><div><h1>Budgets</h1><p>Set limits per category and stay in control</p></div>' +
      '<button class="btn btn-primary" id="addBudget">' + icon('plus') + ' New budget</button></div>' +
      '<div class="grid grid-3" id="budgetGrid">' +
      (budgets.length ? budgets.map(budgetCard).join('') :
        '<div class="card" style="grid-column:1/-1"><div class="empty">No budgets yet. Create your first budget to track spending limits.</div></div>') +
      '</div>';

    on(view, '#addBudget', 'click', () => budgetModal(null, () => window.renderCurrent()));
    on(view, '#budgetGrid', '[data-edit]', 'click', (e, btn) => {
      const b = budgets.find(x => x.id === Number(btn.dataset.edit));
      if (b) budgetModal(b, () => window.renderCurrent());
    });
    on(view, '#budgetGrid', '[data-del]', 'click', (e, btn) => {
      const id = Number(btn.dataset.del);
      confirmModal('Delete budget?', 'The budget limit will be removed for this category.', async () => {
        try { await Api.deleteBudget(id); toast('Deleted', 'Budget removed.', 'success'); window.renderCurrent(); }
        catch (err) { toastError(err); }
      }, true);
    });
  };

  function budgetCard(b) {
    const pct = Math.min(100, b.percent);
    const cls = b.over ? 'progress-over' : (b.percent >= 80 ? 'progress-warn' : 'progress-ok');
    const status = b.over ? '<span class="tag tag-red">Over budget</span>' : (b.percent >= 80 ? '<span class="tag tag-amber">Almost there</span>' : '<span class="tag tag-green">On track</span>');
    const cat = b.category || 'Other';
    return '<div class="budget-card"><div class="gc-head"><div class="gc-icon">' + catEmoji(cat) + '</div>' +
      '<div style="text-align:right"><div class="gc-name">' + escapeHtml(cat) + '</div><div class="gc-meta">' + fmtPct(b.percent) + ' used</div></div></div>' +
      '<div class="progress ' + cls + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="budget-status"><span style="color:var(--text-3);font-size:13px">' + fmtMoney(b.spent) + ' of ' + fmtMoney(b.limit) + '</span>' + status + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span style="color:var(--text-3);font-size:13px">' + fmtMoney(b.remaining) + ' remaining</span>' +
      '<span class="gc-actions"><button class="icon-btn" data-edit="' + b.id + '" title="Edit">' + icon('edit') + '</button>' +
      '<button class="icon-btn" data-del="' + b.id + '" title="Delete" style="color:var(--red)">' + icon('trash') + '</button></span></div></div>';
  }

  function budgetModal(existing, after) {
    const isEdit = !!existing;
    openModal(
      '<div class="modal-head"><h2>' + (isEdit ? 'Edit budget' : 'New budget') + '</h2><button class="icon-btn" data-close>' + icon('x') + '</button></div>' +
      '<form id="budgetForm" novalidate>' +
      '<div class="form-row"><label class="form-label">Category</label><select class="input" id="bgCat">' +
      CATEGORIES.filter(c => !c.includes('Income') && c !== 'Salary' && c !== 'Freelance' && c !== 'Other Income').map(c =>
        '<option' + (isEdit && existing.category === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Monthly limit</label><input class="input" type="number" step="0.01" min="1" id="bgLimit" value="' + (isEdit ? existing.limit : '') + '" required /></div>' +
      '<div class="form-row"><label class="form-label">Month</label><input class="input" type="month" id="bgMonth" value="' + (isEdit && existing.month ? existing.month : currentMonthStr()) + '" /></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button>' +
      '<button class="btn btn-primary" type="submit">' + (isEdit ? 'Save changes' : 'Create budget') + '</button></div></form>'
    );
    wireModal();
    const form = document.getElementById('budgetForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        category: document.getElementById('bgCat').value,
        limit: document.getElementById('bgLimit').value,
        month: document.getElementById('bgMonth').value || null
      };
      try {
        if (isEdit) await Api.updateBudget(existing.id, payload);
        else await Api.createBudget(payload);
        toast(isEdit ? 'Updated' : 'Created', 'Budget for ' + payload.category + ' saved.', 'success');
        closeModal(); after && after();
      } catch (err) { toastError(err); }
    });
  }

  /* ============================================================
     Savings goals
     ============================================================ */
  Pages.savings = async function (view) {
    view.innerHTML = spinner();
    let goals;
    try { goals = await Api.goals(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load goals</h3></div>'; return; }
    const totalSaved = goals.reduce((s, g) => s + Number(g.current), 0);

    view.innerHTML =
      '<div class="page-head"><div><h1>Savings goals</h1><p>' + fmtMoney(totalSaved) + ' saved across ' + goals.length + ' goals</p></div>' +
      '<button class="btn btn-primary" id="addGoal">' + icon('plus') + ' New goal</button></div>' +
      '<div class="grid grid-3" id="goalGrid">' +
      (goals.length ? goals.map(goalCard).join('') :
        '<div class="card" style="grid-column:1/-1"><div class="empty">No goals yet. Set a target and start saving!</div></div>') +
      '</div>';

    on(view, '#addGoal', 'click', () => goalModal(null, () => window.renderCurrent()));
    on(view, '#goalGrid', '[data-deposit]', 'click', (e, btn) => {
      const g = goals.find(x => x.id === Number(btn.dataset.deposit));
      if (g) depositModal(g, () => window.renderCurrent());
    });
    on(view, '#goalGrid', '[data-edit]', 'click', (e, btn) => {
      const g = goals.find(x => x.id === Number(btn.dataset.edit));
      if (g) goalModal(g, () => window.renderCurrent());
    });
    on(view, '#goalGrid', '[data-del]', 'click', (e, btn) => {
      const id = Number(btn.dataset.del);
      confirmModal('Delete goal?', 'This goal and its saved progress will be removed.', async () => {
        try { await Api.deleteGoal(id); toast('Deleted', 'Goal removed.', 'success'); window.renderCurrent(); }
        catch (err) { toastError(err); }
      }, true);
    });
  };

  function goalCard(g) {
    const pct = Math.min(100, g.percent);
    const emojis = { 'Emergency Fund': '🛡️', 'Vacation': '✈️', 'New Car': '🚗', 'Down Payment': '🏠' };
    const em = emojis[g.name] || '🎯';
    return '<div class="goal-card"><div class="gc-head"><div class="gc-icon">' + em + '</div>' +
      '<div style="text-align:right"><div class="gc-name">' + escapeHtml(g.name) + '</div>' +
      '<div class="gc-meta">' + (g.deadline ? 'By ' + fmtDate(g.deadline) : 'No deadline') + '</div></div></div>' +
      '<div class="progress ' + (g.complete ? 'progress-ok' : 'progress-accent') + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="gc-amount"><b>' + fmtPct(g.percent) + '</b>' + (g.complete ? '<span class="tag tag-green">Completed 🎉</span>' : '<span class="tag tag-neutral">' + fmtMoney(g.target - g.current) + ' to go</span>') + '</div>' +
      '<div style="color:var(--text-3);font-size:13px">' + fmtMoney(g.current) + ' of ' + fmtMoney(g.target) + '</div>' +
      '<div class="gc-actions" style="justify-content:space-between">' +
      '<button class="btn btn-sm btn-success" data-deposit="' + g.id + '"' + (g.complete ? ' disabled' : '') + '>+ Top up</button>' +
      '<span><button class="icon-btn" data-edit="' + g.id + '" title="Edit">' + icon('edit') + '</button>' +
      '<button class="icon-btn" data-del="' + g.id + '" title="Delete" style="color:var(--red)">' + icon('trash') + '</button></span></div></div>';
  }

  function goalModal(existing, after) {
    const isEdit = !!existing;
    openModal(
      '<div class="modal-head"><h2>' + (isEdit ? 'Edit goal' : 'New savings goal') + '</h2><button class="icon-btn" data-close>' + icon('x') + '</button></div>' +
      '<form id="goalForm" novalidate>' +
      '<div class="form-row"><label class="form-label">Goal name</label><input class="input" id="glName" placeholder="e.g. Emergency Fund" value="' + (isEdit ? escapeHtml(existing.name) : '') + '" required /></div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Target amount</label><input class="input" type="number" step="0.01" min="1" id="glTarget" value="' + (isEdit ? existing.target : '') + '" required /></div>' +
      '<div class="form-row"><label class="form-label">Current amount</label><input class="input" type="number" step="0.01" min="0" id="glCurrent" value="' + (isEdit ? existing.current : '0') + '" /></div>' +
      '</div>' +
      '<div class="form-row"><label class="form-label">Deadline (optional)</label><input class="input" type="date" id="glDeadline" value="' + (isEdit && existing.deadline ? existing.deadline : '') + '" /></div>' +
      '<div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button>' +
      '<button class="btn btn-primary" type="submit">' + (isEdit ? 'Save changes' : 'Create goal') + '</button></div></form>'
    );
    wireModal();
    const form = document.getElementById('goalForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('glName').value.trim(),
        target: document.getElementById('glTarget').value,
        current: document.getElementById('glCurrent').value || '0',
        deadline: document.getElementById('glDeadline').value || null
      };
      if (!payload.name) { toast('Name is required', '', 'error'); return; }
      try {
        if (isEdit) await Api.updateGoal(existing.id, payload);
        else await Api.createGoal(payload);
        toast(isEdit ? 'Updated' : 'Created', payload.name + ' saved.', 'success');
        closeModal(); after && after();
      } catch (err) { toastError(err); }
    });
  }

  function depositModal(goal, after) {
    openModal(
      '<div class="modal-head"><h2>Top up ' + escapeHtml(goal.name) + '</h2><button class="icon-btn" data-close>' + icon('x') + '</button></div>' +
      '<form id="depForm" novalidate>' +
      '<div class="form-row"><label class="form-label">Current balance</label><div style="font-weight:700">' + fmtMoney(goal.current) + ' of ' + fmtMoney(goal.target) + '</div></div>' +
      '<div class="form-row"><label class="form-label">Amount to add</label><input class="input" type="number" step="0.01" min="0.01" id="depAmount" placeholder="0.00" required /></div>' +
      '<div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button>' +
      '<button class="btn btn-primary" type="submit">Add money</button></div></form>'
    );
    wireModal();
    const form = document.getElementById('depForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await Api.depositGoal(goal.id, { amount: document.getElementById('depAmount').value });
        toast('Deposited', 'Goal updated.', 'success');
        closeModal(); after && after();
      } catch (err) { toastError(err); }
    });
  }

  /* ============================================================
     Investments
     ============================================================ */
  Pages.investments = async function (view) {
    view.innerHTML = spinner();
    let invs;
    try { invs = await Api.investments(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load investments</h3></div>'; return; }

    const invested = invs.reduce((s, i) => s + Number(i.invested), 0);
    const value = invs.reduce((s, i) => s + Number(i.value), 0);
    const gain = value - invested;
    const gainPct = invested > 0 ? gain / invested * 100 : 0;

    const byType = {};
    invs.forEach(i => { byType[i.type] = (byType[i.type] || 0) + Number(i.value); });
    const alloc = Object.entries(byType).map(([name, val]) => ({ name, value: val })).sort((a, b) => b.value - a.value);

    view.innerHTML =
      '<div class="page-head"><div><h1>Investments</h1><p>Track your portfolio, gains and allocation</p></div>' +
      '<button class="btn btn-primary" id="addInv">' + icon('plus') + ' Add investment</button></div>' +
      '<div class="report-summary" style="margin-bottom:20px">' +
      '<div class="rep-stat"><div class="rs-label">Total invested</div><div class="rs-value">' + fmtMoney(invested) + '</div></div>' +
      '<div class="rep-stat"><div class="rs-label">Current value</div><div class="rs-value">' + fmtMoney(value) + '</div></div>' +
      '<div class="rep-stat"><div class="rs-label">Total gain</div><div class="rs-value ' + moneyClass(gain) + '">' + (gain >= 0 ? '+' : '−') + fmtMoney(Math.abs(gain)) + '</div></div>' +
      '<div class="rep-stat"><div class="rs-label">Return</div><div class="rs-value ' + moneyClass(gain) + '">' + (gain >= 0 ? '+' : '') + fmtPct(gainPct.toFixed(2)) + '</div></div>' +
      '</div>' +
      '<div class="grid" style="grid-template-columns:1fr 1.4fr; margin-bottom:20px">' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Allocation</div><div class="card-sub">By asset type</div></div></div>' +
      (alloc.length ? '<div class="chart-box" style="display:flex;flex-direction:column;align-items:center"><canvas class="chart" id="invDonut" style="max-width:200px"></canvas></div>' +
        '<div class="chart-legend">' + alloc.map(s => '<span class="lg"><i style="background:' + typeColor(s.name) + '"></i>' + escapeHtml(s.name) + ' · ' + fmtMoney(s.value) + '</span>').join('') + '</div>'
        : '<div class="empty">Add investments to see allocation</div>') + '</div>' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Holdings</div><div class="card-sub">' + invs.length + ' positions</div></div></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Name</th><th>Type</th><th>Value</th><th>Gain</th></tr></thead>' +
      '<tbody>' + (invs.length ? invs.map(invRow).join('') : '<tr><td colspan="4"><div class="empty">No investments yet</div></td></tr>') + '</tbody></table></div></div>' +
      '</div>' +
      (invs.length ?
        '<div class="card"><div class="card-head"><div><div class="card-title">Portfolio details</div><div class="card-sub">Units, prices and performance</div></div></div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>Investment</th><th>Type</th><th>Risk</th><th style="text-align:right">Units</th><th style="text-align:right">Buy price</th><th style="text-align:right">Current</th><th style="text-align:right">Invested</th><th style="text-align:right">Value</th><th style="text-align:right">Gain</th><th style="text-align:right">Actions</th></tr></thead>' +
        '<tbody id="invBody">' + invs.map(invDetailRow).join('') + '</tbody></table></div></div>'
        : '');

    setTimeout(() => {
      const donut = document.getElementById('invDonut');
      if (donut && alloc.length) {
        UI.donutChart(donut, alloc.map(s => ({ label: s.name, value: s.value, color: typeColor(s.name) })), { size: 175 });
      }
    }, 30);

    on(view, '#addInv', 'click', () => invModal(null, () => window.renderCurrent()));
    on(view, '#invBody', '[data-edit]', 'click', (e, btn) => {
      const i = invs.find(x => x.id === Number(btn.dataset.edit));
      if (i) invModal(i, () => window.renderCurrent());
    });
    on(view, '#invBody', '[data-del]', 'click', (e, btn) => {
      const id = Number(btn.dataset.del);
      confirmModal('Delete investment?', 'This position will be removed from your portfolio.', async () => {
        try { await Api.deleteInvestment(id); toast('Deleted', 'Position removed.', 'success'); window.renderCurrent(); }
        catch (err) { toastError(err); }
      }, true);
    });
  };

  const TYPE_COLORS = { 'Stocks': '#22d3ee', 'ETF': '#818cf8', 'Mutual Fund': '#7c5cff', 'Bonds': '#fbbf24', 'Gold': '#f59e0b', 'Fixed Deposit': '#34d399', 'Crypto': '#f87171', 'Real Estate': '#f97316', 'Other': '#94a3b8' };
  function typeColor(t) { return TYPE_COLORS[t] || '#94a3b8'; }

  function invRow(i) {
    const g = Number(i.gain);
    return '<tr><td><b>' + escapeHtml(i.name) + '</b>' + (i.ticker ? ' <span class="tag tag-neutral">' + escapeHtml(i.ticker) + '</span>' : '') + '</td>' +
      '<td><span class="tag tag-cyan">' + escapeHtml(i.type) + '</span></td>' +
      '<td style="text-align:right" class="money">' + fmtMoney(i.value) + '</td>' +
      '<td style="text-align:right" class="money ' + moneyClass(g) + '">' + (g >= 0 ? '+' : '−') + fmtMoney(Math.abs(g)) + ' (' + (g >= 0 ? '+' : '') + fmtPct(i.gainPercent) + ')</td></tr>';
  }

  function invDetailRow(i) {
    const g = Number(i.gain);
    return '<tr><td><b>' + escapeHtml(i.name) + '</b></td><td>' + escapeHtml(i.type) + '</td>' +
      '<td><span class="tag ' + (i.risk === 'High' ? 'tag-red' : i.risk === 'Low' ? 'tag-green' : 'tag-amber') + '">' + escapeHtml(i.risk || '—') + '</span></td>' +
      '<td style="text-align:right">' + fmtNum(i.units, 4) + '</td>' +
      '<td style="text-align:right">' + fmtMoney(i.purchasePrice) + '</td>' +
      '<td style="text-align:right">' + fmtMoney(i.currentPrice) + '</td>' +
      '<td style="text-align:right">' + fmtMoney(i.invested) + '</td>' +
      '<td style="text-align:right" class="money">' + fmtMoney(i.value) + '</td>' +
      '<td style="text-align:right" class="money ' + moneyClass(g) + '">' + (g >= 0 ? '+' : '−') + fmtMoney(Math.abs(g)) + '</td>' +
      '<td style="text-align:right;white-space:nowrap">' +
      '<button class="icon-btn" data-edit="' + i.id + '" title="Edit">' + icon('edit') + '</button>' +
      '<button class="icon-btn" data-del="' + i.id + '" title="Delete" style="color:var(--red)">' + icon('trash') + '</button></td></tr>';
  }

  async function invModal(existing, after) {
    const isEdit = !!existing;
    let library = [];
    try { library = await Api.investmentLibrary(); } catch (e) { /* optional */ }

    openModal(
      '<div class="modal-head"><h2>' + (isEdit ? 'Edit investment' : 'Add investment') + '</h2><button class="icon-btn" data-close>' + icon('x') + '</button></div>' +
      '<form id="invForm" novalidate>' +
      (isEdit ? '' :
        '<div class="form-row"><label class="form-label">Quick pick from library</label><select class="input" id="invPick"><option value="">— Choose a preset (optional) —</option>' +
        library.map(l => '<option value="' + escapeHtml(l.name) + '" data-type="' + escapeHtml(l.type) + '" data-cat="' + escapeHtml(l.category) + '" data-ticker="' + escapeHtml(l.ticker || '') + '" data-risk="' + escapeHtml(l.risk || '') + '">' + escapeHtml(l.name) + ' (' + escapeHtml(l.type) + ')</option>').join('') +
        '</select></div>') +
      '<div class="form-row"><label class="form-label">Name</label><input class="input" id="invName" value="' + (isEdit ? escapeHtml(existing.name) : '') + '" required /></div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Type</label><select class="input" id="invType">' + INVEST_TYPES.map(t => '<option' + (isEdit && existing.type === t ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></div>' +
      '<div class="form-row"><label class="form-label">Category</label><select class="input" id="invCat">' + ['Equity', 'Debt', 'Commodity', 'Real Estate', 'Crypto', 'Cash', 'Other'].map(c => '<option' + (isEdit && existing.category === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '</div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Ticker (optional)</label><input class="input" id="invTicker" value="' + (isEdit ? escapeHtml(existing.ticker || '') : '') + '" /></div>' +
      '<div class="form-row"><label class="form-label">Risk</label><select class="input" id="invRisk">' + RISK_LEVELS.map(r => '<option' + (isEdit && existing.risk === r ? ' selected' : '') + '>' + r + '</option>').join('') + '</select></div>' +
      '</div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Units</label><input class="input" type="number" step="0.0001" min="0" id="invUnits" value="' + (isEdit ? existing.units : '') + '" required /></div>' +
      '<div class="form-row"><label class="form-label">Purchase price</label><input class="input" type="number" step="0.01" min="0" id="invBuy" value="' + (isEdit ? existing.purchasePrice : '') + '" required /></div>' +
      '</div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Current price</label><input class="input" type="number" step="0.01" min="0" id="invCur" value="' + (isEdit ? existing.currentPrice : '') + '" required /></div>' +
      '<div class="form-row"><label class="form-label">Purchase date (optional)</label><input class="input" type="date" id="invDate" value="' + (isEdit && existing.purchaseDate ? existing.purchaseDate : '') + '" /></div>' +
      '</div>' +
      '<div class="form-row"><label class="form-label">Notes (optional)</label><textarea class="input" id="invDesc">' + (isEdit ? escapeHtml(existing.description || '') : '') + '</textarea></div>' +
      '<div class="modal-foot"><button class="btn" type="button" data-close>Cancel</button>' +
      '<button class="btn btn-primary" type="submit">' + (isEdit ? 'Save changes' : 'Add investment') + '</button></div></form>'
    );
    wireModal();

    const pick = document.getElementById('invPick');
    if (pick) {
      pick.addEventListener('change', () => {
        const opt = pick.options[pick.selectedIndex];
        if (!opt || !opt.value) return;
        document.getElementById('invName').value = opt.value;
        document.getElementById('invType').value = opt.dataset.type || 'Other';
        document.getElementById('invCat').value = opt.dataset.cat || 'Equity';
        document.getElementById('invTicker').value = opt.dataset.ticker || '';
        document.getElementById('invRisk').value = opt.dataset.risk || 'Moderate';
      });
    }

    const form = document.getElementById('invForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('invName').value.trim(),
        type: document.getElementById('invType').value,
        category: document.getElementById('invCat').value,
        ticker: document.getElementById('invTicker').value.trim() || null,
        units: document.getElementById('invUnits').value,
        purchasePrice: document.getElementById('invBuy').value,
        currentPrice: document.getElementById('invCur').value,
        purchaseDate: document.getElementById('invDate').value || null,
        risk: document.getElementById('invRisk').value,
        description: document.getElementById('invDesc').value.trim() || null
      };
      if (!payload.name) { toast('Name is required', '', 'error'); return; }
      try {
        if (isEdit) await Api.updateInvestment(existing.id, payload);
        else await Api.createInvestment(payload);
        toast(isEdit ? 'Updated' : 'Added', payload.name + ' saved.', 'success');
        closeModal(); after && after();
      } catch (err) { toastError(err); }
    });
  }

  /* ============================================================
     Advisor
     ============================================================ */
  Pages.advisor = async function (view) {
    view.innerHTML = spinner();
    let convs = [];
    try { convs = await Api.conversations(); } catch (err) { toastError(err); }

    view.innerHTML =
      '<div class="advisor-layout">' +
      '<div class="conv-list"><div class="conv-list-head"><b>Conversations</b>' +
      '<button class="btn btn-primary btn-sm" id="newConv">+ New</button></div>' +
      '<div class="conv-scroll" id="convScroll">' + convs.map(convItem).join('') + '</div></div>' +
      '<div class="chat">' +
      '<div class="chat-head"><div class="ch-name"><span class="ai-badge"><span class="pill-dot"></span>AI Advisor</span>' +
      '<span id="chatTitle" style="color:var(--text-3);font-weight:500;font-size:13px"></span></div>' +
      '<button class="btn btn-sm btn-danger hidden" id="delConv">' + icon('trash') + ' Delete</button></div>' +
      '<div class="chat-body" id="chatBody"><div class="chat-empty">' +
      '<div class="ai-orb">🤖</div><h3>Ask your personal financial advisor</h3>' +
      '<p>Get data-driven answers about your spending, savings, budgets, investments and more — powered by your real numbers.</p>' +
      '<div class="suggestions" id="suggestions">' +
      '<button class="btn" data-q="How much did I spend on food this month?">🍕 Food this month</button>' +
      '<button class="btn" data-q="Are my budgets on track?">🎯 Budget check</button>' +
      '<button class="btn" data-q="How can I save more money?">💎 Save more</button>' +
      '<button class="btn" data-q="What should I invest in?">📈 Investing advice</button>' +
      '</div></div></div>' +
      '<div class="chat-input"><textarea class="input" id="chatInput" rows="1" placeholder="Ask anything about your finances…"></textarea>' +
      '<button class="btn btn-primary" id="sendBtn">' + icon('send') + '</button></div>' +
      '</div></div>';

    let currentId = null;
    let streaming = false;

    const chatBody = view.querySelector('#chatBody');
    const chatInput = view.querySelector('#chatInput');
    const chatTitle = view.querySelector('#chatTitle');
    const delBtn = view.querySelector('#delConv');

    function scrollBottom() { chatBody.scrollTop = chatBody.scrollHeight; }

    function renderMessages(msgs, title) {
      chatTitle.textContent = title;
      chatBody.innerHTML = msgs.length ? msgs.map(m => msgBubble(m.role, m.content)).join('') :
        '<div class="chat-empty"><div class="ai-orb">🤖</div><h3>Start the conversation</h3>' +
        '<p>Your advisor has full context of your financial data.</p><div class="suggestions" id="suggestions">' +
        '<button class="btn" data-q="How much did I spend on food this month?">🍕 Food this month</button>' +
        '<button class="btn" data-q="Are my budgets on track?">🎯 Budget check</button>' +
        '<button class="btn" data-q="How can I save more money?">💎 Save more</button>' +
        '<button class="btn" data-q="What should I invest in?">📈 Investing advice</button></div></div>';
      scrollBottom();
      wireSuggestions();
    }

    function wireSuggestions() {
      chatBody.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
        chatInput.value = b.dataset.q;
        chatInput.dispatchEvent(new Event('input'));
        send();
      }));
    }

    function selectConv(id) {
      currentId = id;
      view.querySelectorAll('.conv-item').forEach(el => el.classList.toggle('active', Number(el.dataset.id) === id));
      delBtn.classList.remove('hidden');
      chatBody.innerHTML = '<div class="empty">Loading conversation…</div>';
      Api.getConversation(id).then(c => renderMessages(c.messages || [], c.title)).catch(toastError);
    }

    async function refreshConvs(selectId) {
      try {
        convs = await Api.conversations();
        view.querySelector('#convScroll').innerHTML = convs.map(convItem).join('');
        on(view, '#convScroll', '.conv-item', 'click', (e, el) => selectConv(Number(el.dataset.id)));
        if (selectId != null) selectConv(selectId);
      } catch (err) { toastError(err); }
    }

    on(view, '#newConv', 'click', async () => {
      try {
        const c = await Api.createConversation({ title: 'New Conversation' });
        await refreshConvs(c.id);
      } catch (err) { toastError(err); }
    });

    on(view, '#delConv', 'click', async () => {
      if (!currentId) return;
      confirmModal('Delete conversation?', 'This conversation and its messages will be removed.', async () => {
        try {
          await Api.deleteConversation(currentId);
          currentId = null;
          chatTitle.textContent = '';
          delBtn.classList.add('hidden');
          chatBody.innerHTML = '<div class="chat-empty"><div class="ai-orb">🤖</div><h3>Conversation deleted</h3></div>';
          refreshConvs(null);
          toast('Deleted', 'Conversation removed.', 'success');
        } catch (err) { toastError(err); }
      }, true);
    });

    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(120, chatInput.scrollHeight) + 'px';
    });
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
    });
    on(view, '#sendBtn', 'click', () => send());

    async function ensureConversation() {
      if (currentId) return currentId;
      const c = await Api.createConversation({ title: 'New Conversation' });
      await refreshConvs(c.id);
      return c.id;
    }

    function addMessage(role, text, keepTyping) {
      const typing = chatBody.querySelector('.typing');
      if (typing) {
        if (keepTyping) {
          const bubble = typing.parentElement;
          bubble.innerHTML = '';
        }
        typing.remove();
      }
      if (chatBody.querySelector('.chat-empty')) chatBody.innerHTML = '';
      chatBody.insertAdjacentHTML('beforeend', msgBubble(role, text));
      scrollBottom();
    }

    function addTyping() {
      chatBody.insertAdjacentHTML('beforeend',
        '<div class="msg ai"><div class="bubble"><div class="typing"><i></i><i></i><i></i></div></div></div>');
      scrollBottom();
    }

    function streamContent(el, text) {
      el.innerHTML = mdLite(text) || escapeHtml(text);
      scrollBottom();
    }

    async function send() {
      const content = chatInput.value.trim();
      if (!content || streaming) return;
      chatInput.value = '';
      chatInput.style.height = 'auto';
      streaming = true;
      const sendBtnEl = view.querySelector('#sendBtn');
      sendBtnEl.disabled = true;
      try {
        const cid = await ensureConversation();
        addMessage('user', escapeHtml(content));
        addTyping();
        const bubble = chatBody.querySelector('.typing').closest('.bubble');
        let acc = '';
        try {
          await streamAdvisor(cid, content,
            (chunk) => { acc += chunk; streamContent(bubble, acc); },
            () => {});
        } catch (err) {
          bubble.innerHTML = '<span style="color:var(--red)">⚠️ ' + escapeHtml(err.message || 'Stream failed') + '</span>';
        }
      } catch (err) {
        toastError(err);
        chatBody.querySelector('.typing') && chatBody.querySelector('.typing').closest('.msg').remove();
      } finally {
        streaming = false;
        sendBtnEl.disabled = false;
        refreshConvs(currentId);
      }
    }

    async function streamAdvisor(cid, content, onChunk) {
      const res = await fetch('/api/openai/conversations/' + cid + '/messages', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + Api.token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!res.ok) {
        let d = null;
        try { d = await res.json(); } catch (e) {}
        throw new Error((d && d.error) || 'Advisor request failed');
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (line.startsWith('data:')) {
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const obj = JSON.parse(payload);
              if (obj.content) onChunk(obj.content);
            } catch (e) {}
          }
        }
      }
    }

    if (convs.length) {
      selectConv(convs[0].id);
    } else {
      try {
        const c = await Api.createConversation({ title: 'New Conversation' });
        await refreshConvs(c.id);
      } catch (err) { toastError(err); }
    }
  };

  function convItem(c) {
    return '<div class="conv-item" data-id="' + c.id + '">' +
      '<div class="ci-title">' + icon('bot') + ' ' + escapeHtml(c.title) + '</div>' +
      '<div class="ci-time">' + fmtDateTime(c.createdAt) + '</div></div>';
  }

  function msgBubble(role, text) {
    const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return '<div class="msg ' + role + '"><div class="bubble">' + (role === 'user' ? escapeHtml(text) : mdLite(text)) + '</div>' +
      '<span class="m-time">' + time + '</span></div>';
  }

  function mdLite(text) {
    const lines = String(text).split('\n');
    let html = '';
    let table = [];
    const flush = () => {
      if (table.length) { html += renderTable(table); table = []; }
    };
    lines.forEach(line => {
      const t = line.trim();
      if (t.startsWith('|') && t.endsWith('|')) { table.push(t); return; }
      flush();
      html += inlineMd(line) + '<br>';
    });
    flush();
    return html;
  }

  function renderTable(rows) {
    const cells = rows.map(r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
    const header = cells[0] || [];
    const body = cells.filter((c, i) => i !== 1);
    let h = '<table><thead><tr>' + header.map(c => '<th>' + inlineMd(c) + '</th>').join('') + '</tr></thead><tbody>';
    body.forEach(r => { h += '<tr>' + r.map(c => '<td>' + inlineMd(c) + '</td>').join('') + '</tr>'; });
    return h + '</tbody></table>';
  }

  function inlineMd(line) {
    let h = escapeHtml(line);
    h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    h = h.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    h = h.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    h = h.replace(/^[-*] (.*)$/gm, '<li>$1</li>');
    h = h.replace(/^\d+\. (.*)$/gm, '<li>$1</li>');
    h = h.replace(/✅/g, '✅').replace(/⚠️/g, '⚠️');
    return h;
  }

  /* ============================================================
     Reports
     ============================================================ */
  Pages.reports = function (view) {
    let period = 'month';
    view.innerHTML =
      '<div class="page-head"><div><h1>Reports</h1><p>Financial summaries you can export as PDF or CSV</p></div>' +
      '<div class="page-actions">' +
      '<button class="btn" id="exportCsv">' + icon('download') + ' Export CSV</button>' +
      '<button class="btn btn-primary" id="exportPdf">' + icon('download') + ' Export PDF</button></div></div>' +
      '<div class="card" style="margin-bottom:20px">' +
      '<div class="filters">' +
      '<div class="period-seg" id="periodSeg">' +
      '<button data-p="month" class="active">This month</button>' +
      '<button data-p="quarter">Quarter</button>' +
      '<button data-p="year">Year</button>' +
      '<button data-p="custom">Custom</button></div>' +
      '<input class="input" type="date" id="fromDate" />' +
      '<input class="input" type="date" id="toDate" />' +
      '<button class="btn" id="applyBtn">Apply</button></div></div>' +
      '<div id="reportContent">' + spinner() + '</div>';

    const fromEl = view.querySelector('#fromDate');
    const toEl = view.querySelector('#toDate');
    const seg = view.querySelector('#periodSeg');

    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      period = b.dataset.p;
      fromEl.style.display = toEl.style.display = period === 'custom' ? '' : 'none';
      load();
    }));
    fromEl.style.display = toEl.style.display = 'none';

    on(view, '#applyBtn', 'click', () => { if (period === 'custom') load(); });

    async function load() {
      const content = view.querySelector('#reportContent');
      content.innerHTML = spinner();
      const params = {};
      if (period !== 'custom') params.period = period;
      else {
        if (fromEl.value) params.from = fromEl.value;
        if (toEl.value) params.to = toEl.value;
      }
      let data;
      try { data = await Api.reportSummary(params); } catch (err) { toastError(err); content.innerHTML = '<div class="empty"><h3>Could not load report</h3></div>'; return; }

      content.innerHTML =
        '<div class="report-summary" style="margin-bottom:20px">' +
        '<div class="rep-stat"><div class="rs-label">Income</div><div class="rs-value money-pos">' + fmtMoney(data.income) + '</div></div>' +
        '<div class="rep-stat"><div class="rs-label">Expenses</div><div class="rs-value money-neg">' + fmtMoney(-Number(data.expenses)) + '</div></div>' +
        '<div class="rep-stat"><div class="rs-label">Net savings</div><div class="rs-value ' + moneyClass(Number(data.net)) + '">' + fmtMoney(data.net) + '</div></div>' +
        '<div class="rep-stat"><div class="rs-label">Savings rate</div><div class="rs-value">' + fmtPct(data.savingsRate) + '</div></div>' +
        '</div>' +
        '<div class="grid" style="grid-template-columns:1.4fr 1fr">' +
        '<div class="card"><div class="card-head"><div><div class="card-title">Monthly trend</div><div class="card-sub">' + fmtDate(data.from) + ' → ' + fmtDate(data.to) + '</div></div></div>' +
        (data.monthly && data.monthly.length ? '<div class="chart-box"><canvas class="chart" id="repChart" height="260"></canvas></div>' : '<div class="empty">No monthly data in this range</div>') + '</div>' +
        '<div class="card"><div class="card-head"><div><div class="card-title">Category breakdown</div><div class="card-sub">Where expenses went</div></div></div>' +
        (data.categories && data.categories.length ? data.categories.map(c =>
          '<div class="inv-alloc" style="margin-bottom:11px"><span style="width:130px;color:var(--text-2);font-size:13px">' + escapeHtml(c.category) + '</span>' +
          '<div class="alloc-bar"><i style="width:' + Math.min(100, c.percent) + '%"></i></div>' +
          '<b>' + fmtPct(c.percent) + '</b></div>').join('') : '<div class="empty">No expense data</div>') + '</div>' +
        '</div>';

      setTimeout(() => {
        const chart = document.getElementById('repChart');
        if (chart && data.monthly && data.monthly.length) {
          UI.lineChart(chart, data.monthly, { height: 260 });
        }
      }, 30);
    }

    on(view, '#exportPdf', 'click', () => {
      const params = new URLSearchParams();
      if (period !== 'custom') params.set('period', period);
      else { if (fromEl.value) params.set('from', fromEl.value); if (toEl.value) params.set('to', toEl.value); }
      downloadAuthed('/api/reports/export/pdf' + (params.toString() ? '?' + params : ''), 'financeai-report.pdf');
    });

    on(view, '#exportCsv', 'click', () => {
      const params = new URLSearchParams();
      if (period !== 'custom') params.set('period', period);
      else { if (fromEl.value) params.set('from', fromEl.value); if (toEl.value) params.set('to', toEl.value); }
      downloadAuthed('/api/reports/export/csv' + (params.toString() ? '?' + params : ''), 'financeai-report.csv');
    });

    load();
  };

  function downloadFile(name, type, content) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function downloadAuthed(path, filename) {
    try {
      const res = await fetch(path, { headers: { 'Authorization': 'Bearer ' + Api.token } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      toast('Download started', filename, 'success');
    } catch (err) { toastError(err); }
  }

  /* ============================================================
     Notifications
     ============================================================ */
  Pages.notifications = async function (view) {
    view.innerHTML = spinner();
    let notifs;
    try { notifs = await Api.notifications(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load notifications</h3></div>'; return; }

    view.innerHTML =
      '<div class="page-head"><div><h1>Notifications</h1><p>' + notifs.length + ' notifications · ' + notifs.filter(n => n.unread).length + ' unread</p></div>' +
      '<div class="page-actions"><button class="btn" id="readAll">' + icon('bell') + ' Mark all read</button></div></div>' +
      '<div id="notifList">' + (notifs.length ? notifs.map(notifItem).join('') : '<div class="card"><div class="empty"><div class="empty-svg">' + icon('bell') + '</div><h3>All caught up!</h3><p>Notifications about budgets, goals and insights will appear here.</p></div></div>') + '</div>';

    on(view, '#notifList', '.notif-item', 'click', async (e, item) => {
      if (e.target.closest('[data-del]')) return;
      const id = Number(item.dataset.id);
      if (item.classList.contains('unread')) {
        try { await Api.markRead(id); item.classList.remove('unread'); } catch (err) { /* silent */ }
      }
      const action = item.dataset.action;
      if (action && action.startsWith('#')) location.hash = action;
    });
    on(view, '#notifList', '[data-del]', 'click', async (e, btn) => {
      e.stopPropagation();
      try {
        await Api.deleteNotification(Number(btn.dataset.del));
        btn.closest('.notif-item').remove();
        toast('Deleted', 'Notification removed.', 'success');
      } catch (err) { toastError(err); }
    });
    on(view, '#readAll', 'click', async () => {
      try {
        await Api.markAllRead();
        view.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));
        toast('All caught up', 'All notifications marked as read.', 'success');
      } catch (err) { toastError(err); }
    });
  };

  function notifItem(n) {
    const em = n.type === 'budget' ? '⚠️' : n.type === 'goal' ? '🎯' : n.type === 'insight' ? '💡' : n.type === 'transaction' ? '🧾' : '🔔';
    const bg = n.type === 'budget' ? 'var(--amber-bg)' : n.type === 'goal' ? 'var(--green-bg)' : n.type === 'transaction' ? 'var(--blue-bg)' : 'var(--surface-2)';
    return '<div class="notif-item ' + (n.unread ? 'unread' : '') + '" data-id="' + n.id + '" data-action="' + escapeHtml(n.action || '') + '">' +
      '<div class="notif-icon" style="background:' + bg + '">' + em + '</div>' +
      '<div style="flex:1"><div class="notif-title">' + (n.unread ? '<span class="unread-dot"></span>' : '') + escapeHtml(n.title) + '</div>' +
      '<div class="notif-msg">' + escapeHtml(n.message) + '</div>' +
      '<div class="notif-foot"><span class="notif-time">' + escapeHtml(n.time) + '</span>' +
      '<button class="icon-btn" data-del="' + n.id + '" title="Delete" style="color:var(--text-3)">' + icon('trash') + '</button></div></div></div>';
  }

  /* ============================================================
     Settings
     ============================================================ */
  Pages.settings = async function (view) {
    view.innerHTML = spinner();
    let me;
    try { me = await Api.me(); } catch (err) { toastError(err); view.innerHTML = '<div class="empty"><h3>Could not load settings</h3></div>'; return; }
    Api.updateUser(me);

    view.innerHTML =
      '<div class="page-head"><div><h1>Settings</h1><p>Manage your profile, preferences and account</p></div></div>' +
      '<div class="settings-grid">' +
      '<div>' +
      '<div class="card" style="margin-bottom:20px"><div class="card-head"><div><div class="card-title">Profile</div><div class="card-sub">Your personal information</div></div></div>' +
      '<form id="profileForm" novalidate>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">First name</label><input class="input" id="pFirst" value="' + escapeHtml(me.firstName) + '" required /></div>' +
      '<div class="form-row"><label class="form-label">Last name</label><input class="input" id="pLast" value="' + escapeHtml(me.lastName) + '" required /></div>' +
      '</div>' +
      '<div class="form-grid">' +
      '<div class="form-row"><label class="form-label">Email</label><input class="input" type="email" value="' + escapeHtml(me.email) + '" disabled style="opacity:.6" /></div>' +
      '<div class="form-row"><label class="form-label">Phone</label><input class="input" id="pPhone" value="' + escapeHtml(me.phone || '') + '" /></div>' +
      '</div>' +
      '<div class="form-row"><label class="form-label">Currency</label><select class="input" id="pCurrency">' +
      ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'].map(c => '<option' + (me.currency === c ? ' selected' : '') + '>' + c + '</option>').join('') +
      '</select></div>' +
      '<button class="btn btn-primary" type="submit">Save profile</button></form></div>' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Security</div><div class="card-sub">Change your password</div></div></div>' +
      '<form id="passForm" novalidate>' +
      '<div class="form-row"><label class="form-label">Current password</label><input class="input" type="password" id="pwCur" required /></div>' +
      '<div class="form-row"><label class="form-label">New password</label><input class="input" type="password" id="pwNew" minlength="6" required /></div>' +
      '<button class="btn" type="submit">Update password</button></form></div>' +
      '</div>' +
      '<div>' +
      '<div class="card" style="margin-bottom:20px"><div class="card-head"><div><div class="card-title">Notifications</div><div class="card-sub">What FinanceAI should tell you about</div></div></div>' +
      toggleRow('aiRecommendations', me.aiRecommendations, 'AI recommendations', 'Get personalized insights and tips from the AI advisor') +
      toggleRow('budgetWarnings', me.budgetWarnings, 'Budget warnings', 'Alert me when I\'m close to exceeding a budget') +
      toggleRow('billReminders', me.billReminders, 'Bill reminders', 'Remind me about recurring bills and payments') +
      '</div>' +
      '<div class="card"><div class="card-head"><div><div class="card-title">Account</div><div class="card-sub">Session and data controls</div></div></div>' +
      '<div style="margin-bottom:14px"><button class="btn btn-block" id="logoutBtn">' + icon('logout') + ' Sign out</button></div>' +
      '<button class="btn btn-danger btn-block" id="delAccount">' + icon('trash') + ' Delete account</button></div>' +
      '</div></div>';

    const profileForm = view.querySelector('#profileForm');
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        firstName: view.querySelector('#pFirst').value.trim(),
        lastName: view.querySelector('#pLast').value.trim(),
        phone: view.querySelector('#pPhone').value.trim(),
        currency: view.querySelector('#pCurrency').value
      };
      try {
        const updated = await Api.updateProfile(payload);
        Api.updateUser(updated);
        UI.setCurrency(updated.currency);
        toast('Profile saved', 'Your changes were updated.', 'success');
      } catch (err) { toastError(err); }
    });

    const passForm = view.querySelector('#passForm');
    passForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = view.querySelector('#pwCur').value;
      const newPassword = view.querySelector('#pwNew').value;
      try {
        await Api.changePassword({ currentPassword, newPassword });
        passForm.reset();
        toast('Password updated', 'Use your new password next time you sign in.', 'success');
      } catch (err) { toastError(err); }
    });

    view.querySelectorAll('.toggle input').forEach(t => t.addEventListener('change', async () => {
      const key = t.dataset.key;
      const payload = {};
      payload[key] = t.checked;
      try {
        const updated = await Api.updatePreferences(payload);
        Api.updateUser(updated);
        toast('Preferences saved', '', 'success');
      } catch (err) { toastError(err); }
    }));

    on(view, '#logoutBtn', 'click', () => { Api.clear(); location.hash = '#/login'; });
    on(view, '#delAccount', 'click', () => {
      confirmModal('Delete account?', 'All your data — transactions, budgets, goals and conversations — will be permanently erased. This cannot be undone.', async () => {
        try {
          await Api.deleteAccount();
          Api.clear();
          toast('Account deleted', 'We\'re sorry to see you go.', 'info');
          location.hash = '#/';
        } catch (err) { toastError(err); }
      }, true);
    });
  };

  function toggleRow(key, value, label, desc) {
    return '<div class="toggle-row"><div class="tg-label"><b>' + label + '</b><span>' + desc + '</span></div>' +
      '<label class="toggle"><input type="checkbox" data-key="' + key + '"' + (value ? ' checked' : '') + ' /><span class="slider"></span></label></div>';
  }

  function catEmoji(cat) {
    const c = (cat || '').toLowerCase();
    if (c.includes('food') || c.includes('dining') || c.includes('grocer')) return '🍽️';
    if (c.includes('shopp')) return '🛍️';
    if (c.includes('house') || c.includes('home') || c.includes('rent') || c.includes('mortgage')) return '🏠';
    if (c.includes('trans') || c.includes('car') || c.includes('fuel') || c.includes('gas')) return '🚗';
    if (c.includes('enter') || c.includes('film') || c.includes('movie')) return '🎬';
    if (c.includes('health') || c.includes('medical') || c.includes('heart')) return '❤️';
    if (c.includes('utili') || c.includes('electric') || c.includes('water')) return '⚡';
    if (c.includes('travel')) return '✈️';
    if (c.includes('education')) return '🎓';
    if (c.includes('insurance')) return '🛡️';
    if (c.includes('subscri')) return '🔁';
    return '🏷️';
  }

  window.Pages = Pages;
})();