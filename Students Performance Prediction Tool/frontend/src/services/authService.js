import api from './api.js';

export const signup = async (payload) => {
  const { data } = await api.post('/auth/signup', payload);
  return data;
};

export const signin = async (payload) => {
  const { data } = await api.post('/auth/signin', payload);
  return data;
};

export const signinWithGoogle = async (idToken) => {
  const { data } = await api.post('/auth/google', { idToken });
  return data;
};
