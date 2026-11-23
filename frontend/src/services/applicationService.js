import api from './api';

export const apply = (internshipId, file) => {
  const fd = new FormData();
  fd.append('internshipId', internshipId);
  fd.append('file', file);
  return api.post('/applications', fd, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const list = () => api.get('/applications');

export const get = (id) => api.get(`/applications/${id}`);

export const updateStatus = (id, status) => api.put(`/applications/${id}`, { status });

export const cancel = (id) => api.delete(`/applications/${id}`);

export const download = async (filename) => {
  const res = await api.get(`/files/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
