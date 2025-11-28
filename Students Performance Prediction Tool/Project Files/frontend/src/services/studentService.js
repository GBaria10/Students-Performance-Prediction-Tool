import api from './api.js';

export const createStudent = async (payload) => {
  const { data } = await api.post('/students', payload);
  return data;
};

export const getStudents = async () => {
  const { data } = await api.get('/students');
  return data;
};
