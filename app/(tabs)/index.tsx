import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

export default function CasesScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Your Cases</Text>
      <Text style={styles.empty}>No cases yet. Tap + to report an issue.</Text>
      <TouchableOpacity onPress={() => router.push('/showcase')} style={styles.link}>
        <Text style={styles.linkText}>View component showcase →</Text>
      </TouchableOpacity>
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
  empty: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  link: {
    marginTop: 32,
  },
  linkText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.medium,
    color: Colors.black,
    textDecorationLine: 'underline',
  },
});
