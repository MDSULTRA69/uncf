import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('unc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('unc_token');
      localStorage.removeItem('unc_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────
export const login    = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe    = ()     => api.get('/auth/me');
export const updateMe = (data) => api.patch('/auth/me', data);

// ── PLAYERS ───────────────────────────────────────────────────
export const getPlayers        = ()      => api.get('/players');
export const getLeaderboard    = ()      => api.get('/players/leaderboard');
export const getPlayer         = (id)    => api.get(`/players/${id}`);
export const updateDeck        = (deck)  => api.put('/players/me/deck', { deck });
export const updateMoves       = (data)  => api.put('/players/me/moves', data);
export const adminUpdatePlayer = (id, d) => api.patch(`/players/${id}/admin-update`, d);

// ── BATTLES ───────────────────────────────────────────────────
export const createBattle     = (data)         => api.post('/battles/create', data);
export const getMyBattles     = ()             => api.get('/battles/my-battles');
export const getActiveBattles = ()             => api.get('/battles/active');
export const getBattle        = (id)           => api.get(`/battles/${id}`);
export const submitAction     = (id, data)     => api.post(`/battles/${id}/action`, data);
export const askMod           = (id, question) => api.post(`/battles/${id}/ask-mod`, { question });
export const spinWheel        = (id, spinType) => api.post(`/battles/${id}/spin`, { spinType });
export const forfeitBattle    = (id)           => api.post(`/battles/${id}/forfeit`);

// Private deck submission — opponent never sees the deck, only AI MOD uses it
export const submitPrivateDeck = (battleId, deck) =>
  api.post(`/battles/${battleId}/submit-deck`, { deck });

// ── GAME DATA ─────────────────────────────────────────────────
export const getMoves    = (params) => api.get('/game-data/moves', { params });
export const getClans    = ()       => api.get('/game-data/clans');
export const getRules    = ()       => api.get('/game-data/rules');
export const getGems     = ()       => api.get('/game-data/gems');
export const getVillages = ()       => api.get('/game-data/villages');

// ── ADMIN ─────────────────────────────────────────────────────
export const getAdminDashboard = ()        => api.get('/admin/dashboard');
export const getAdminPlayers   = ()        => api.get('/admin/players');
export const createMove        = (data)    => api.post('/admin/moves', data);
export const updateMove        = (id, d)   => api.put(`/admin/moves/${id}`, d);
export const deleteMove        = (id)      => api.delete(`/admin/moves/${id}`);
export const createClan        = (data)    => api.post('/admin/clans', data);
export const updateClan        = (id, d)   => api.put(`/admin/clans/${id}`, d);
export const createRule        = (data)    => api.post('/admin/rules', data);
export const updateRule        = (id, d)   => api.put(`/admin/rules/${id}`, d);
export const createGem         = (data)    => api.post('/admin/gems', data);
export const createVillage     = (data)    => api.post('/admin/villages', data);
export const updateVillage     = (id, d)   => api.put(`/admin/villages/${id}`, d);

export default api;
