import api from './api';

export const list = (assignmentId) => {
  const params = assignmentId ? { assignmentId } : {};
  return api.get('/reports', { params });
};

export const get = (id) => api.get(`/reports/${id}`);

export const submit = (data) => api.post('/reports', data);

export const update = (id, data) => api.put(`/reports/${id}`, data);

export const remove = (id) => api.delete(`/reports/${id}`);

export const addFeedback = (id, data) => api.post(`/reports/${id}/feedback`, data);
