import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { setGuest } = useAuth();
  const [phone, setPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendPhoneOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit US phone number.');
      return;
    }
    const e164 = `+1${digits.slice(-10)}`;
    setError(null);
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      router.push({ pathname: '/(auth)/verify-otp', params: { contact: e164, type: 'sms' } });
    } catch (e: any) {
      const msg = e.message ?? '';
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError('Network error — check your connection.');
      } else {
        setError(msg || 'Something went wrong.');
      }
    } finally {
      setPhoneLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingTop: insets.top + 48, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Habitaly</Text>
          <Text style={styles.tagline}>Know your rights. Document everything.</Text>
        </View>

        {/* Phone — inline input */}
        <View style={styles.section}>
          <Text style={styles.label}>Phone (US)</Text>
          <View style={styles.phoneRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+1</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="(555) 000-0000"
              placeholderTextColor={Colors.textSecondary}
              value={phone}
              onChangeText={t => { setPhone(formatPhone(t)); setError(null); }}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={sendPhoneOtp}
            />
          </View>
          <Button
            label="Send Code"
            onPress={sendPhoneOtp}
            loading={phoneLoading}
            disabled={phone.replace(/\D/g, '').length < 10}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Divider />

        {/* Email — button only, takes you to its own screen */}
        <View style={styles.section}>
          <Button
            label="Continue with Email"
            onPress={() => router.push('/(auth)/sign-in-email')}
            variant="secondary"
          />
        </View>

        <TouchableOpacity onPress={() => { setGuest(true); router.replace('/(tabs)'); }} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Habitaly is not a law firm and does not provide legal advice.
          By continuing you agree to our Terms of Service.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>or</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  logo: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 6,
  },
  tagline: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 24,
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
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  prefix: {
    width: 56,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefixText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginHorizontal: 12,
  },
  error: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.emergency.text,
    paddingHorizontal: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  skipBtn: {
    alignItems: 'center',
    marginTop: 28,
  },
  skipText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 32,
    lineHeight: 18,
  },
});
