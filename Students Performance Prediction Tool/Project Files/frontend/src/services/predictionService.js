import api from './api.js';

export const createPrediction = async (payload) => {
  const { data } = await api.post('/predictions', payload);
  return data;
};

export const getPredictions = async () => {
  const { data } = await api.get('/predictions');
  return data;
};
