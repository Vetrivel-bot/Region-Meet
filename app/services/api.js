// utils/api.js
import axios from 'axios';
import { Platform } from 'react-native';
import { io } from 'socket.io-client';

// --- CONFIG ---
const BASE_URL = 'https://your-backend.example.com/api/v1';
const WS_URL = 'wss://your-backend.example.com';

// Optional: store JWT or session token (replace this with your auth flow)
let AUTH_TOKEN = null;

export const setAuthToken = (token) => {
  AUTH_TOKEN = token;
};

// --- AXIOS INSTANCE ---
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject token dynamically
api.interceptors.request.use((config) => {
  if (AUTH_TOKEN) config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  return config;
});

// Unified error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message || 'Something went wrong.';
    console.warn(`[API ERROR ${status}] ${message}`);
    throw new Error(message);
  }
);

// --- REST ENDPOINTS ---

export const EventsAPI = {
  list: () => api.get('/events'),
  get: (id) => api.get(`/events/${id}`),
  create: (payload) => api.post('/events', payload),
  update: (id, payload) => api.put(`/events/${id}`, payload),
  delete: (id) => api.delete(`/events/${id}`),
};

export const VenueAPI = {
  list: () => api.get('/venues'),
  get: (id) => api.get(`/venues/${id}`),
  getFloors: (venueId) => api.get(`/venues/${venueId}/floors`),
};

export const FloorAPI = {
  get: (floorId) => api.get(`/floors/${floorId}`),
  getPOIs: (floorId) => api.get(`/floors/${floorId}/pois`),
  uploadMap: (formData) =>
    api.post('/floors/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const BoothAPI = {
  list: (floorId) => api.get(`/floors/${floorId}/booths`),
  rate: (boothId, rating) => api.post(`/booths/${boothId}/rate`, { rating }),
  getRatings: (boothId) => api.get(`/booths/${boothId}/ratings`),
};

export const UserAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  profile: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/me', data),
};

export const MapAPI = {
  getGraph: (floorId) => api.get(`/floors/${floorId}/graph`),
  getRoute: (startNode, endNode) => api.get(`/route?start=${startNode}&end=${endNode}`),
};

// --- WEBSOCKET HANDLER (for realtime updates) ---

let socket = null;

export const connectSocket = (venueId, onEvent) => {
  socket = io(WS_URL, {
    transports: ['websocket'],
    query: { venueId },
    auth: { token: AUTH_TOKEN },
  });

  socket.on('connect', () => console.log('[WS] Connected'));
  socket.on('disconnect', () => console.log('[WS] Disconnected'));
  socket.on('error', (e) => console.warn('[WS ERROR]', e));

  // Custom server events
  socket.on('poi:update', (data) => onEvent('poi:update', data));
  socket.on('user:location', (data) => onEvent('user:location', data));
  socket.on('announcement', (data) => onEvent('announcement', data));
  socket.on('booth:rating', (data) => onEvent('booth:rating', data));

  return socket;
};

export const emitLocation = (data) => {
  if (socket && socket.connected) socket.emit('location:update', data);
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

// --- UTILITIES ---

export const uploadImage = async (uri) => {
  const filename = uri.split('/').pop();
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: filename,
  });

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
