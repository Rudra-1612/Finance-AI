/* FinanceAI — app shell, router, sidebar, notifications bell */
(function () {
  const NAV = [
    { hash: '#/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { hash: '#/transactions', label: 'Transactions', icon: 'wallet' },
    { hash: '#/expenses', label: 'Expenses', icon: 'receipt' },
    { hash: '#/budgets', label: 'Budgets', icon: 'tag' },
    { hash: '#/savings', label: 'Savings goals', icon: 'target' },
    { hash: '#/investments', label: 'Investments', icon: 'pie' },
    { hash: '#/advisor', label: 'AI Advisor', icon: 'bot' },
    { hash: '#/reports', label: 'Reports', icon: 'chart' },
    { hash: '#/notifications', label: 'Notifications', icon: 'bell', badge: true },
    { hash: '#/settings', label: 'Settings', icon: 'gear' }
  ];

  const TITLES = {};
  NAV.forEach(n => { TITLES[n.hash] = n.label; });

  let routerLock = false;

  function init() {
    Api.init();
    if (Api.user && Api.user.currency) UI.setCurrency(Api.user.currency);

    window.addEventListener('hashchange', () => route());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSidebar();
    });
    document.getElementById('sidebarOpen').addEventListener('click', openSidebar);
    document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

    route();
  }

  function openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('show');
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  }

  /* SPA-friendly refresh: re-render the currently routed page without a full reload */
  window.renderCurrent = function () {
    route();
  };

  function route() {
    if (routerLock) return;
    const hash = location.hash || '#/';
    const publicView = document.getElementById('public-view');
    const appShell = document.getElementById('app-shell');

    // Public routes
    if (hash === '#/' || hash === '#/landing') {
      showPublic();
      publicView.innerHTML = '';
      Pages.landing(publicView);
      document.title = 'FinanceAI — Your Intelligent Money Companion';
      return;
    }
    if (hash === '#/login' || hash === '#/register') {
      showPublic();
      publicView.innerHTML = '';
      if (hash === '#/login') Pages.login(publicView);
      else Pages.register(publicView);
      document.title = hash === '#/login' ? 'Sign in — FinanceAI' : 'Create account — FinanceAI';
      return;
    }

    // Auth required
    if (!Api.isAuthed()) {
      location.hash = '#/login';
      return;
    }

    showApp();
    const target = TITLES[hash] ? App.map(hash) : App.map('#/dashboard');
    document.getElementById('topbarTitle').textContent = target.title;
    const view = document.getElementById('view');
    view.innerHTML = '';
    const result = target.render(view);
    if (result && typeof result.catch === 'function') {
      result.catch(err => UI.toastError(err));
    }
    highlightNav(hash in TITLES && NAV.some(n => n.hash === hash) ? hash : '#/dashboard');
    document.title = target.title + ' — FinanceAI';
    closeSidebar();
  }

  function showPublic() {
    document.getElementById('public-view').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
  }

  function showApp() {
    document.getElementById('app-shell').classList.remove('hidden');
    document.getElementById('public-view').classList.add('hidden');
    renderSidebar();
    renderUserChip();
    refreshNotifBadge();
  }

  const App = {
    map(hash) {
      const t = TITLES[hash] || 'Dashboard';
      switch (hash) {
        case '#/dashboard': return { title: 'Dashboard', render: Pages.dashboard };
        case '#/transactions': return { title: 'Transactions', render: Pages.transactions };
        case '#/expenses': return { title: 'Expenses', render: Pages.expenses };
        case '#/budgets': return { title: 'Budgets', render: Pages.budgets };
        case '#/savings': return { title: 'Savings goals', render: Pages.savings };
        case '#/investments': return { title: 'Investments', render: Pages.investments };
        case '#/advisor': return { title: 'AI Advisor', render: Pages.advisor };
        case '#/reports': return { title: 'Reports', render: Pages.reports };
        case '#/notifications': return { title: 'Notifications', render: Pages.notifications };
        case '#/settings': return { title: 'Settings', render: Pages.settings };
        default: return { title: 'Dashboard', render: Pages.dashboard };
      }
    }
  };

  function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    const first = NAV[0];
    nav.innerHTML = NAV.map(n => {
      const badge = n.badge ? '<span class="nav-badge hidden" id="sideNavBadge"></span>' : '';
      return '<a class="nav-item" data-hash="' + n.hash + '" href="' + n.hash + '">' +
        UI.icon(n.icon) + '<span class="nav-label">' + n.label + '</span>' + badge + '</a>';
    }).join('');
    nav.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', () => {
      if (a.dataset.hash === first.hash) routerLock = false;
    }));
  }

  function highlightNav(hash) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.hash === hash);
    });
  }

  function renderUserChip() {
    const chip = document.getElementById('userChip');
    const u = Api.user;
    if (!u) return;
    const initials = (u.firstName || '?')[0] + (u.lastName ? u.lastName[0] : '');
    chip.innerHTML = '<span class="avatar">' + UI.escapeHtml(initials.toUpperCase()) + '</span>' +
      '<div style="min-width:0"><div class="uc-name">' + UI.escapeHtml(u.firstName + ' ' + u.lastName) + '</div>' +
      '<div class="uc-mail">' + UI.escapeHtml(u.email) + '</div></div>';
    document.getElementById('avatarText').textContent = initials.toUpperCase();
    document.getElementById('avatarBtn').addEventListener('click', () => { location.hash = '#/settings'; });
  }

  async function refreshNotifBadge() {
    const badge = document.getElementById('notifBadge');
    const sideBadge = document.getElementById('sideNavBadge');
    try {
      const count = await Api.unreadCount();
      badge.classList.toggle('hidden', !count);
      if (sideBadge) { sideBadge.textContent = count > 9 ? '9+' : count; sideBadge.classList.toggle('hidden', !count); }
    } catch (e) { /* ignore */ }
  }

  document.addEventListener('DOMContentLoaded', init);
})();