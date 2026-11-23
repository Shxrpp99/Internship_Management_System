import api from './api';

export const list = (params = {}) => api.get('/internships', { params });

export const get = (id) => api.get(`/internships/${id}`);

export const create = (data) => api.post('/internships', data);

export const update = (id, data) => api.put(`/internships/${id}`, data);

export const remove = (id) => api.delete(`/internships/${id}`);
