import { useCallback, useEffect, useState } from 'react';

const useGameScore = (initialBest: number) => {
  const [total, setTotal] = useState(0);
  const [best, setBest] = useState(initialBest);

  const addScore = useCallback((s: number) => setTotal((t) => t + s), []);

  useEffect(() => {
    setBest((b) => (total > b ? total : b));
  }, [total]);

  return {
    total,
    best,
    setTotal,
    addScore,
  };
};

export default useGameScore;
