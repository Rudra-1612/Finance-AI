/* FinanceAI — API client with JWT auth handling */
(function () {
  const TOKEN_KEY = 'financeai_token';
  const USER_KEY = 'financeai_user';

  const Api = {
    token: null,
    user: null,

    init() {
      this.token = localStorage.getItem(TOKEN_KEY) || null;
      const u = localStorage.getItem(USER_KEY);
      this.user = u ? JSON.parse(u) : null;
    },

    isAuthed() { return !!this.token && !!this.user; },

    store(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    updateUser(user) {
      this.user = user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    clear() {
      this.token = null;
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },

    authHeaders(extra) {
      const h = Object.assign({}, extra || {});
      if (this.token) h['Authorization'] = 'Bearer ' + this.token;
      if (h['Content-Type'] === undefined && !(h.body instanceof FormData)) h['Content-Type'] = 'application/json';
      return h;
    },

    async request(method, path, body, extra) {
      const opts = { method, headers: this.authHeaders(extra) };
      if (body !== undefined && body !== null) opts.body = JSON.stringify(body);
      const res = await fetch(path, opts);
      let data = null;
      const ct = (res.headers.get('content-type') || '');
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      if (res.status === 401) {
        const on401 = window.dispatchEvent(new CustomEvent('unauthorized'));
        if (!on401) {
          this.clear();
          if (!location.hash.startsWith('#/login')) location.hash = '#/login';
        }
      }
      if (!res.ok) {
        const err = new Error((data && data.error) || 'Request failed');
        err.status = res.status;
        err.fields = data && data.fields;
        err.data = data;
        throw err;
      }
      return data;
    },

    get(path, extra) { return this.request('GET', path, undefined, extra); },
    post(path, body, extra) { return this.request('POST', path, body, extra); },
    put(path, body, extra) { return this.request('PUT', path, body, extra); },
    patch(path, body, extra) { return this.request('PATCH', path, body, extra); },
    del(path, extra) { return this.request('DELETE', path, undefined, extra); },

    /* ---------- Auth ---------- */
    register(payload) { return this.post('/api/auth/register', payload); },
    login(payload) { return this.post('/api/auth/login', payload); },
    me() { return this.get('/api/auth/me'); },
    updateProfile(payload) { return this.put('/api/auth/profile', payload); },
    updatePreferences(payload) { return this.put('/api/auth/preferences', payload); },
    changePassword(payload) { return this.request('PUT', '/api/auth/password', payload, { 'Content-Type': 'application/json' }); },
    deleteAccount() { return this.del('/api/auth/account'); },

    /* ---------- Dashboard / insights ---------- */
    dashboard() { return this.get('/api/dashboard/summary'); },
    insights() { return this.dashboard(); },

    /* ---------- Transactions ---------- */
    transactions(params) {
      const qs = new URLSearchParams(params || {}).toString();
      return this.get('/api/transactions' + (qs ? '?' + qs : ''));
    },
    createTransaction(payload) { return this.post('/api/transactions', payload); },
    updateTransaction(id, payload) { return this.put('/api/transactions/' + id, payload); },
    deleteTransaction(id) { return this.del('/api/transactions/' + id); },

    /* ---------- Budgets ---------- */
    budgets() { return this.get('/api/budgets'); },
    createBudget(payload) { return this.post('/api/budgets', payload); },
    updateBudget(id, payload) { return this.put('/api/budgets/' + id, payload); },
    deleteBudget(id) { return this.del('/api/budgets/' + id); },

    /* ---------- Goals ---------- */
    goals() { return this.get('/api/goals'); },
    createGoal(payload) { return this.post('/api/goals', payload); },
    updateGoal(id, payload) { return this.put('/api/goals/' + id, payload); },
    depositGoal(id, payload) { return this.post('/api/goals/' + id + '/deposit', payload); },
    deleteGoal(id) { return this.del('/api/goals/' + id); },

    /* ---------- Investments ---------- */
    investments() { return this.get('/api/investments'); },
    investmentLibrary() { return this.get('/api/investments/library'); },
    createInvestment(payload) { return this.post('/api/investments', payload); },
    updateInvestment(id, payload) { return this.put('/api/investments/' + id, payload); },
    deleteInvestment(id) { return this.del('/api/investments/' + id); },

    /* ---------- Notifications ---------- */
    notifications() { return this.get('/api/notifications'); },
    unreadCount() { return this.get('/api/notifications/unread-count'); },
    markRead(id) { return this.post('/api/notifications/' + id + '/read'); },
    markAllRead() { return this.post('/api/notifications/read-all'); },
    deleteNotification(id) { return this.del('/api/notifications/' + id); },

    /* ---------- Advisor ---------- */
    conversations() { return this.get('/api/openai/conversations'); },
    createConversation(payload) { return this.post('/api/openai/conversations', payload); },
    getConversation(id) { return this.get('/api/openai/conversations/' + id); },
    deleteConversation(id) { return this.del('/api/openai/conversations/' + id); },

    /* ---------- Reports ---------- */
    reportSummary(params) {
      const qs = new URLSearchParams(params || {}).toString();
      return this.get('/api/reports/summary' + (qs ? '?' + qs : ''));
    }
  };

  window.Api = Api;
})();