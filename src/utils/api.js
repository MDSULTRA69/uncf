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

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');
export const updateMe = (data) => api.patch('/auth/me', data);

// Players
export const getPlayers = () => api.get('/players');
export const getLeaderboard = () => api.get('/players/leaderboard');
export const getPlayer = (id) => api.get(`/players/${id}`);
export const updateDeck = (deck) => api.put('/players/me/deck', { deck });
export const updateMoves = (data) => api.put('/players/me/moves', data);
export const adminUpdatePlayer = (id, data) => api.patch(`/players/${id}/admin-update`, data);

// Battles
export const createBattle = (data) => api.post('/battles/create', data);
export const getMyBattles = () => api.get('/battles/my-battles');
export const getActiveBattles = () => api.get('/battles/active');
export const getBattle = (id) => api.get(`/battles/${id}`);
export const submitAction = (id, data) => api.post(`/battles/${id}/action`, data);
export const askMod = (id, question) => api.post(`/battles/${id}/ask-mod`, { question });
export const spinWheel = (id, spinType) => api.post(`/battles/${id}/spin`, { spinType });
export const forfeitBattle = (id) => api.post(`/battles/${id}/forfeit`);

// Game Data
export const getMoves = (params) => api.get('/game-data/moves', { params });
export const getClans = () => api.get('/game-data/clans');
export const getRules = () => api.get('/game-data/rules');
export const getGems = () => api.get('/game-data/gems');
export const getVillages = () => api.get('/game-data/villages');

// Admin
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminPlayers = () => api.get('/admin/players');
export const createMove = (data) => api.post('/admin/moves', data);
export const updateMove = (id, data) => api.put(`/admin/moves/${id}`, data);
export const deleteMove = (id) => api.delete(`/admin/moves/${id}`);
export const createClan = (data) => api.post('/admin/clans', data);
export const updateClan = (id, data) => api.put(`/admin/clans/${id}`, data);
export const createRule = (data) => api.post('/admin/rules', data);
export const updateRule = (id, data) => api.put(`/admin/rules/${id}`, data);
export const createGem = (data) => api.post('/admin/gems', data);
export const createVillage = (data) => api.post('/admin/villages', data);
export const updateVillage = (id, data) => api.put(`/admin/villages/${id}`, data);

export default api;
