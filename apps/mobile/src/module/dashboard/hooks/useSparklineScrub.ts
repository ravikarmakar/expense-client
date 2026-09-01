import { useState, useRef } from 'react';
import { PanResponder } from 'react-native';
import { hapticFeedback } from '../../../utils/haptics';
import type { PaymentTransaction } from '../utils/sparklineUtils';

interface UseSparklineScrubProps {
  transactions: PaymentTransaction[];
  screenWidth: number;
}

/**
 * Custom Hook: Manages PanResponder gestures, scrubbing state, active transaction index, and haptic feedback.
 */
export function useSparklineScrub({ transactions, screenWidth }: UseSparklineScrubProps) {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [activeTransactionIndex, setActiveTransactionIndex] = useState(0);
  const lastTxRef = useRef<number>(-1);

  const handleTouch = (locationX: number) => {
    const x = Math.max(0, Math.min(screenWidth, locationX));
    const ratio = x / screenWidth;

    if (transactions.length === 0) return;

    let closestIndex = 0;
    let minDistance = Math.abs(ratio - (transactions[0]?.ratio ?? 0));

    for (let i = 1; i < transactions.length; i++) {
      const dist = Math.abs(ratio - transactions[i].ratio);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    setActiveTransactionIndex(closestIndex);

    if (!isScrubbing) {
      setIsScrubbing(true);
    }

    if (closestIndex !== lastTxRef.current) {
      lastTxRef.current = closestIndex;
      hapticFeedback.selection();
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setIsScrubbing(false);
        lastTxRef.current = -1;
      },
      onPanResponderTerminate: () => {
        setIsScrubbing(false);
        lastTxRef.current = -1;
      },
    })
  ).current;

  return {
    isScrubbing,
    activeTransactionIndex,
    panResponder,
  };
}
