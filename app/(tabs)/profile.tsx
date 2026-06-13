import { View, Text, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  async function signOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Profile</Text>
      {session?.user?.email && (
        <Text style={styles.detail}>{session.user.email}</Text>
      )}
      {session?.user?.phone && (
        <Text style={styles.detail}>{session.user.phone}</Text>
      )}
      <View style={styles.signOut}>
        <Button label="Sign out" onPress={signOut} variant="secondary" />
      </View>
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
  detail: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  signOut: {
    marginTop: 32,
  },
});
