import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'settleup-reminder-cooldowns';

export function useReminderCooldown() {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadCooldowns = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, number>;
          const now = Date.now();
          const active: Record<string, number> = {};
          for (const [key, value] of Object.entries(parsed)) {
            // Keep only cooldowns less than 24 hours old
            if (now - value < 24 * 60 * 60 * 1000) {
              active[key] = value;
            }
          }
          setCooldowns(active);
        }
      } catch (err) {
        console.warn('Failed to load reminder cooldowns:', err);
      }
    };
    loadCooldowns();
  }, []);

  const triggerCooldown = async (userId: string, groupId: string) => {
    const now = Date.now();
    const key = `${userId}-${groupId}`;
    const newCooldowns = { ...cooldowns, [key]: now };
    setCooldowns(newCooldowns);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCooldowns));
    } catch (err) {
      console.warn('Failed to save reminder cooldowns:', err);
    }
  };

  const getIsCooldown = (userId: string, groupId: string) => {
    const key = `${userId}-${groupId}`;
    const lastSent = cooldowns[key];
    return lastSent ? Date.now() - lastSent < 24 * 60 * 60 * 1000 : false;
  };

  return {
    cooldowns,
    triggerCooldown,
    getIsCooldown,
  };
}
