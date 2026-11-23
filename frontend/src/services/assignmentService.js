import api from './api';

export const list = () => api.get('/assignments');

export const get = (id) => api.get(`/assignments/${id}`);

export const create = (data) => api.post('/assignments', data);

export const update = (id, data) => api.put(`/assignments/${id}`, data);

export const remove = (id) => api.delete(`/assignments/${id}`);
