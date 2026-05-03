import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, G } from 'react-native-svg';
import { AppColors } from '@/constants/AppStyles';

const { width } = Dimensions.get('window');

interface BioTrendChartProps {
  data: number[];
  label: string;
  color?: string;
  height?: number;
  hasAlert?: boolean;
}

export const BioTrendChart: React.FC<BioTrendChartProps> = ({ 
  data, 
  label, 
  color = AppColors.primaryNeonBlue,
  height = 160,
  hasAlert = false
}) => {
  const chartWidth = width - 80;
  const chartHeight = height;
  const padding = 20;

  const maxVal = Math.max(...data, 100);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - ((val - minVal) / range) * (chartHeight - padding * 2) - padding;
    return { x, y };
  });

  // Generate Bezier Curve Path
  const d = points.reduce((path, point, i, array) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = array[i - 1];
    const cp1x = (prev.x + point.x) / 2;
    return `${path} C ${cp1x},${prev.y} ${cp1x},${point.y} ${point.x},${point.y}`;
  }, '');

  // Area path for gradient
  const areaD = `${d} L ${points[points.length - 1].x},${chartHeight} L ${points[0].x},${chartHeight} Z`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        <Text style={[styles.val, { color }]}>{data[data.length - 1]}%</Text>
      </View>

      <Svg height={chartHeight} width={chartWidth}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Gradient Area */}
        <Path d={areaD} fill="url(#gradient)" />

        {/* The Curve */}
        <Path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round"
        />

        {/* Dots */}
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          const pointColor = (isLast && hasAlert) ? '#FF4D4D' : color;
          
          return (
            <G key={i}>
              <Circle cx={p.x} cy={p.y} r={isLast && hasAlert ? "8" : "5"} fill={pointColor} opacity="0.3" />
              <Circle cx={p.x} cy={p.y} r="3" fill={pointColor} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    color: '#rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  val: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
