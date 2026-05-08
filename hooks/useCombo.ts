import { useState } from 'react';

// Added this callback parameter
export const useCombo = (onComboPop: () => void) => {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  // Removed showComboMsg state; we'll use animation state instead

  const updateCombo = (isCorrect: boolean) => {
    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      
      // Trigger the pop animation for 2+ hits
      if (newCombo >= 2) {
        onComboPop();
      }
    } else {
      setCombo(0);
    }
  };

  const resetCombo = () => {
    setCombo(0);
    setMaxCombo(0);
  };

  // Removed showComboMsg from the return
  return { combo, maxCombo, updateCombo, resetCombo };
};