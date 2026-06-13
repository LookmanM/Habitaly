import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
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

  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function sendEmailOtp() {
    if (!email.trim()) return;
    setError(null);
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      router.push({ pathname: '/(auth)/verify-otp', params: { contact: email.trim(), type: 'email' } });
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setEmailLoading(false);
    }
  }

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
      setError(e.message ?? 'Something went wrong.');
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
        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>Habitaly</Text>
          <Text style={styles.tagline}>Know your rights. Document everything.</Text>
        </View>

        {/* Apple / Google — not yet enabled */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.providerBtn} disabled activeOpacity={1}>
            <Text style={styles.providerText}>Continue with Apple</Text>
          </TouchableOpacity>
          <View style={{ height: 10 }} />
          <TouchableOpacity style={styles.providerBtn} disabled activeOpacity={1}>
            <Text style={styles.providerText}>Continue with Google</Text>
          </TouchableOpacity>
          <Text style={styles.comingSoon}>Apple & Google coming soon</Text>
        </View>

        <Divider />

        {/* Email */}
        <View style={styles.section}>
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
            returnKeyType="done"
            onSubmitEditing={sendEmailOtp}
          />
          <Button
            label="Continue with Email"
            onPress={sendEmailOtp}
            loading={emailLoading}
            disabled={!email.trim()}
          />
        </View>

        <Divider />

        {/* Phone */}
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
  providerBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  providerText: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 10,
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
    marginTop: 16,
    textAlign: 'center',
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
