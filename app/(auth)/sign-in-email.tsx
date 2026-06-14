import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

export default function SignInEmailScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendEmailOtp() {
    if (!email.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      router.push({ pathname: '/(auth)/verify-otp', params: { contact: email.trim(), type: 'email' } });
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError('Network error — check your connection.');
      } else {
        setError(msg || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Continue with Email</Text>
          <Text style={styles.sub}>We'll send you a sign-in code.</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor={Colors.textSecondary}
          value={email}
          onChangeText={t => { setEmail(t); setError(null); }}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={sendEmailOtp}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label="Send Code"
          onPress={sendEmailOtp}
          loading={loading}
          disabled={!email.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  back: {
    marginBottom: 36,
  },
  backText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  error: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.emergency.text,
    marginBottom: 12,
  },
});
