import { createContext, useMemo, useState } from 'react';

export const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const [lastPrediction, setLastPrediction] = useState(null);

  const value = useMemo(
    () => ({
      lastPrediction,
      setLastPrediction,
      clearPrediction: () => setLastPrediction(null)
    }),
    [lastPrediction]
  );

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
};
