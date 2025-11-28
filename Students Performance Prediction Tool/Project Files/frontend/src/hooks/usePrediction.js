import { useContext } from 'react';
import { PredictionContext } from '../context/PredictionContext.jsx';

export const usePrediction = () => {
  const ctx = useContext(PredictionContext);
  if (!ctx) {
    throw new Error('usePrediction must be used inside PredictionProvider');
  }
  return ctx;
};
