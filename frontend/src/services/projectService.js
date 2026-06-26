import api from './api';

export const getProjects = () => api.get('/projects');
export const createProject = (project) => api.post('/projects', project);
export const updateProject = (id, project) => api.put(`/projects/${id}`, project);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const archiveProject = (id) => api.patch(`/projects/${id}/archive`);
export const restoreProject = (id) => api.patch(`/projects/${id}/restore`);
export const duplicateProject = (id) => api.post(`/projects/${id}/duplicate`);
