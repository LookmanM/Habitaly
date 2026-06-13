import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

export default function VerifyOtpScreen() {
  const insets = useSafeAreaInsets();
  const { contact, type } = useLocalSearchParams<{ contact: string; type: 'email' | 'sms' }>();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmail = type === 'email';

  async function verify() {
    if (otp.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      const { error } = isEmail
        ? await supabase.auth.verifyOtp({ email: contact, token: otp, type: 'email' })
        : await supabase.auth.verifyOtp({ phone: contact, token: otp, type: 'sms' });
      if (error) throw error;
      // Session is now set — AuthGate in _layout.tsx redirects to /(tabs) automatically.
    } catch (e: any) {
      setError(e.message ?? 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError(null);
    setResending(true);
    try {
      const { error } = isEmail
        ? await supabase.auth.signInWithOtp({ email: contact, options: { shouldCreateUser: true } })
        : await supabase.auth.signInWithOtp({ phone: contact, options: { shouldCreateUser: true } });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message ?? 'Could not resend code.');
    } finally {
      setResending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Enter your code</Text>
          <Text style={styles.sub}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.contact}>{contact}</Text>
          </Text>
          {isEmail && (
            <Text style={styles.emailNote}>
              Make sure OTP (not magic link) is enabled in your Supabase email settings.
            </Text>
          )}
        </View>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={t => { setOtp(t.replace(/\D/g, '').slice(0, 6)); setError(null); }}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={verify}
          placeholder="000000"
          placeholderTextColor={Colors.textSecondary}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label="Verify" onPress={verify} loading={loading} disabled={otp.length !== 6} />

        <TouchableOpacity onPress={resend} disabled={resending} style={styles.resend}>
          <Text style={styles.resendText}>{resending ? 'Sending…' : 'Resend code'}</Text>
        </TouchableOpacity>
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
    marginBottom: 40,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 10,
  },
  sub: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  contact: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  emailNote: {
    marginTop: 12,
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  otpInput: {
    fontSize: 32,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: 14,
    textAlign: 'center',
    height: 72,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  error: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.emergency.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  resend: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
