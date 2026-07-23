import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScalePressable } from '../../../components/ScalePressable';

interface NotificationAlert {
  id: string;
  type: 'settlement' | 'approval';
  title: string;
  subtitle: string;
  actionText: string;
}

interface NotificationBannerProps {
  alerts: NotificationAlert[];
  onAction: (id: string, type: 'confirm' | 'reject' | 'view') => void;
  onDismiss: (id: string) => void;
}

/**
 * Premium, dismissible action banners list.
 * Linear-style subtle status logs with interactive choice pills.
 */
export const NotificationBanner = React.memo(function NotificationBanner({
  alerts,
  onAction,
  onDismiss,
}: NotificationBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.container}>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alertCard}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBg,
                alert.type === 'settlement' ? styles.settleIconBg : styles.approveIconBg,
              ]}
            >
              <Ionicons
                name={alert.type === 'settlement' ? 'checkmark-circle' : 'receipt-outline'}
                size={14}
                color={alert.type === 'settlement' ? '#10B981' : '#38BDF8'}
              />
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.subtitle}>{alert.subtitle}</Text>
            <View style={styles.actionsRow}>
              <ScalePressable
                style={styles.actionPillPrimary}
                onPress={() => onAction(alert.id, 'confirm')}
                hapticType="success"
              >
                <Text style={styles.actionTextPrimary}>{alert.actionText}</Text>
              </ScalePressable>
              <ScalePressable
                style={styles.actionPillSecondary}
                onPress={() => onDismiss(alert.id)}
                hapticType="selection"
              >
                <Text style={styles.actionTextSecondary}>Dismiss</Text>
              </ScalePressable>
            </View>
          </View>

          <ScalePressable
            style={styles.closeBtn}
            onPress={() => onDismiss(alert.id)}
            hapticType="light"
          >
            <Ionicons name="close" size={16} color="#74817B" />
          </ScalePressable>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  alertCard: {
    backgroundColor: '#131D1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  approveIconBg: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  content: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A8B3AE',
    marginBottom: 10,
    lineHeight: 15,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionPillPrimary: {
    backgroundColor: '#10B981',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  actionTextPrimary: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionPillSecondary: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionTextSecondary: {
    fontSize: 10,
    fontWeight: '700',
    color: '#74817B',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
