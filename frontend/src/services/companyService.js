import api from './api';

export const list = () => api.get('/companies');

export const get = (id) => api.get(`/companies/${id}`);

export const create = (data) => api.post('/companies', data);

export const update = (id, data) => api.put(`/companies/${id}`, data);

export const remove = (id) => api.delete(`/companies/${id}`);

export const approve = (id, status = 'APPROVED') =>
  api.put(`/companies/${id}/approve`, null, { params: { status } });
