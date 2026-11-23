import api from './api';

export const stats = () => api.get('/admin/stats');

export const users = () => api.get('/admin/users');

export const user = (id) => api.get(`/admin/users/${id}`);

export const createUser = (data) => api.post('/admin/users', data);

export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);

export const removeUser = (id) => api.delete(`/admin/users/${id}`);
