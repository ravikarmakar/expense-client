import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BottomSheetModal } from '../../../components/BottomSheetModal';
import { TactileButton } from '../../../components/TactileButton';
import { CURRENCY_SYMBOL } from '../../../constants/theme';
import { useTheme } from '../../../context/ThemeContext';

interface SetLimitModalProps {
  visible: boolean;
  onClose: () => void;
  initialPeriod?: 'weekly' | 'monthly';
  currentWeeklyLimit: number;
  currentMonthlyLimit: number;
  onSaveLimit: (period: 'weekly' | 'monthly', amount: number) => void;
}

export function SetLimitModal({
  visible,
  onClose,
  initialPeriod = 'monthly',
  currentWeeklyLimit,
  currentMonthlyLimit,
  onSaveLimit,
}: SetLimitModalProps) {
  const { isDark } = useTheme();

  const [period, setPeriod] = useState<'weekly' | 'monthly'>(initialPeriod);
  const [amountInput, setAmountInput] = useState(
    (initialPeriod === 'weekly' ? currentWeeklyLimit : currentMonthlyLimit).toString()
  );

  // Sync state whenever modal opens or initialPeriod/limits change
  React.useEffect(() => {
    if (visible) {
      setPeriod(initialPeriod);
      setAmountInput(
        (initialPeriod === 'weekly' ? currentWeeklyLimit : currentMonthlyLimit).toString()
      );
    }
  }, [visible, initialPeriod, currentWeeklyLimit, currentMonthlyLimit]);

  const handlePeriodChange = (newPeriod: 'weekly' | 'monthly') => {
    setPeriod(newPeriod);
    setAmountInput((newPeriod === 'weekly' ? currentWeeklyLimit : currentMonthlyLimit).toString());
  };

  const handlePresetSelect = (preset: number) => {
    setAmountInput(preset.toString());
  };

  const handleSave = () => {
    const numAmount = parseFloat(amountInput);
    if (!isNaN(numAmount) && numAmount > 0) {
      onSaveLimit(period, numAmount);
      onClose();
    }
  };

  const presets = period === 'weekly' ? [2000, 5000, 10000, 15000] : [10000, 25000, 50000, 100000];

  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      title="Set Spending Limit"
      variant={isDark ? 'dark' : 'light'}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={[styles.subtitle, { color: isDark ? '#A8B3AE' : '#5F6D66' }]}>
          Track your budget and receive alert warnings when spending reaches your limit.
        </Text>

        {/* Period Switcher Pills */}
        <View
          style={[
            styles.periodSwitcher,
            isDark ? styles.periodSwitcherDark : styles.periodSwitcherLight,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePeriodChange('weekly')}
            style={[
              styles.periodPill,
              period === 'weekly' &&
                (isDark ? styles.periodPillActiveDark : styles.periodPillActiveLight),
            ]}
          >
            <Text
              style={[
                styles.periodText,
                period === 'weekly'
                  ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                  : { color: isDark ? '#D1D5DB' : '#5F6D66' },
              ]}
            >
              Weekly Limit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handlePeriodChange('monthly')}
            style={[
              styles.periodPill,
              period === 'monthly' &&
                (isDark ? styles.periodPillActiveDark : styles.periodPillActiveLight),
            ]}
          >
            <Text
              style={[
                styles.periodText,
                period === 'monthly'
                  ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                  : { color: isDark ? '#D1D5DB' : '#5F6D66' },
              ]}
            >
              Monthly Limit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Amount Field Label */}
        <Text style={[styles.fieldLabel, { color: isDark ? '#A8B3AE' : '#5F6D66' }]}>
          CUSTOM TARGET AMOUNT
        </Text>

        {/* Hero Custom Amount Input Box */}
        <View
          style={[styles.inputWrapper, isDark ? styles.inputWrapperDark : styles.inputWrapperLight]}
        >
          <Text style={[styles.currencyPrefix, { color: isDark ? '#10B981' : '#006948' }]}>
            {CURRENCY_SYMBOL}
          </Text>
          <TextInput
            style={[styles.input, { color: isDark ? '#FFFFFF' : '#191C1D' }]}
            value={amountInput}
            onChangeText={setAmountInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#a0aec0'}
            selectTextOnFocus
          />
        </View>

        {/* Quick Presets Label */}
        <Text style={[styles.fieldLabel, { color: isDark ? '#A8B3AE' : '#5F6D66', marginTop: 16 }]}>
          QUICK PRESETS
        </Text>

        {/* Presets */}
        <View style={styles.presetsRow}>
          {presets.map((val) => (
            <TouchableOpacity
              key={val}
              activeOpacity={0.7}
              onPress={() => handlePresetSelect(val)}
              style={[
                styles.presetBadge,
                isDark ? styles.presetBadgeDark : styles.presetBadgeLight,
                amountInput === val.toString() &&
                  (isDark ? styles.presetBadgeActiveDark : styles.presetBadgeActiveLight),
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  amountInput === val.toString()
                    ? { color: isDark ? '#10B981' : '#006948', fontWeight: '800' }
                    : { color: isDark ? '#D1D5DB' : '#4B5563' },
                ]}
              >
                {CURRENCY_SYMBOL}
                {val.toLocaleString('en-IN')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save Button */}
        <TactileButton
          title="Save Spending Limit"
          onPress={handleSave}
          provider="emerald"
          style={styles.saveBtn}
        />
      </KeyboardAvoidingView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  periodSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
  },
  periodSwitcherLight: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  periodSwitcherDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  periodPill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodPillActiveLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  periodPillActiveDark: {
    backgroundColor: '#131D1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  periodText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  inputWrapperLight: {
    backgroundColor: '#f8faf9',
    borderColor: '#e2ece6',
  },
  inputWrapperDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    padding: 0,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  presetBadge: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  presetBadgeLight: {
    backgroundColor: '#ffffff',
    borderColor: '#e2ece6',
  },
  presetBadgeDark: {
    backgroundColor: '#101917',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  presetBadgeActiveLight: {
    backgroundColor: '#e6f4ea',
    borderColor: '#006948',
  },
  presetBadgeActiveDark: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: 8,
    height: 52,
  },
});
