import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

export default function NewReportScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>New Report</Text>
      <Text style={styles.sub}>Coming in Sprint 1.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
});
