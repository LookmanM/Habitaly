import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  progress: number; // 0–1
};

export function CaseProgressTrack({ progress }: Props) {
  const pct = `${Math.min(1, Math.max(0, progress)) * 100}%`;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: pct as `${number}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    backgroundColor: Colors.accent,
  },
});
