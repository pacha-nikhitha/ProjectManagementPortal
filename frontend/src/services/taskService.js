import api from './api';

export const getTasks = () => api.get('/tasks');
export const createTask = (task) => api.post('/tasks', task);
export const updateTask = (id, task) => api.put(`/tasks/${id}`, task);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const changeTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const archiveTask = (id) => api.patch(`/tasks/${id}/archive`);
export const restoreTask = (id) => api.patch(`/tasks/${id}/restore`);
export const duplicateTask = (id) => api.post(`/tasks/${id}/duplicate`);
