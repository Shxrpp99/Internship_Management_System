import api from './api';

export const list = (assignmentId) => {
  const params = assignmentId ? { assignmentId } : {};
  return api.get('/evaluations', { params });
};

export const get = (id) => api.get(`/evaluations/${id}`);

export const submit = (data) => api.post('/evaluations', data);

export const update = (id, data) => api.put(`/evaluations/${id}`, data);

export const remove = (id) => api.delete(`/evaluations/${id}`);
