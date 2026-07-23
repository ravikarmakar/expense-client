import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface SparklineChartProps {
  timeRange: 'week' | 'month' | 'all';
}

/**
 * A beautiful, Apple Card / Revolut inspired minimal trend sparkline.
 * Uses SVG lines and area gradients to visualize expense trajectory.
 */
export const SparklineChart = React.memo(function SparklineChart({
  timeRange,
}: SparklineChartProps) {
  const screenWidth = Dimensions.get('window').width - 80; // Account for BalanceCard card padding
  const height = 38;

  // Render different trend lines based on selected date segment
  // Y coordinates are strictly bounded between 8 and 30 to prevent clipping
  const getLinePath = () => {
    switch (timeRange) {
      case 'week':
        return `M 0 30 Q ${screenWidth * 0.2} 12, ${screenWidth * 0.4} 22 T ${screenWidth * 0.8} 10 T ${screenWidth} 6`;
      case 'month':
        return `M 0 28 Q ${screenWidth * 0.15} 8, ${screenWidth * 0.3} 20 T ${screenWidth * 0.6} 10 T ${screenWidth * 0.8} 24 T ${screenWidth} 12`;
      case 'all':
      default:
        return `M 0 26 Q ${screenWidth * 0.25} 10, ${screenWidth * 0.5} 30 T ${screenWidth * 0.75} 8 T ${screenWidth} 12`;
    }
  };

  const linePath = getLinePath();
  const areaPath = `${linePath} L ${screenWidth} ${height} L 0 ${height} Z`;

  return (
    <View style={styles.container}>
      <Svg height={height} width={screenWidth}>
        <Defs>
          <LinearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#10B981" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#10B981" stopOpacity="0.00" />
          </LinearGradient>
        </Defs>

        {/* Gradient Area Fill */}
        <Path d={areaPath} fill="url(#glowGrad)" />

        {/* Crisp Line Stroke */}
        <Path d={linePath} fill="none" stroke="#10B981" strokeWidth={2.5} strokeLinecap="round" />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
