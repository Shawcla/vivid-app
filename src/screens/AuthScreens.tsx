import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator, Linking, Pressable, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useAuth } from '../context/authStore';
import { Colors, Fonts, Spacing, Radius } from '../utils/theme';
import { authAPI } from '../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!isLogin && password.length < 8) {
      Alert.alert('Password too short', 'Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) { Alert.alert('Name required', 'Please enter your name.'); setLoading(false); return; }
        if (!username.trim()) { Alert.alert('Username required', 'Please choose a username.'); setLoading(false); return; }
        if (username.length < 3) { Alert.alert('Username too short', 'Username must be at least 3 characters.'); setLoading(false); return; }
        await register(email, password, name.trim(), username.trim().toLowerCase());
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Something went wrong';
      Alert.alert(isLogin ? 'Login failed' : 'Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, username: string) => {
    const res = await authAPI.register({ email, password, name, username });
    if (res.data?.requiresVerification) {
      Alert.alert('Check your email', `A verification link was sent to ${email}. Check your inbox and tap the link to activate your account.`);
      setIsLogin(true);
      return;
    }
    await login(email, password);
  };

  const handleAppleSignIn = async () => {
    Alert.alert(
      'Apple Sign-In Setup',
      'To enable Sign in with Apple, you need to configure it in your Apple Developer account:\n\n' +
      '1. Go to developer.apple.com → Account → Certificates, Identifiers & Profiles\n' +
      '2. Enable "Sign in with Apple" for your App ID\n' +
      '3. Create a Services ID and configure the return URL:\n' +
      '   https://vividaivideo.com/api/auth/apple/callback\n' +
      '4. Add the private key from your Apple Developer account to the backend .env as APPLE_PRIVATE_KEY\n' +
      '5. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, and APPLE_KEY_ID in backend .env\n\n' +
      'Once configured, Apple Sign-In will work automatically.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A0A1A', '#1A0A2E', '#0A0A1A']}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>VIVID</Text>
            <Text style={styles.tagline}>AI Cinema Streaming</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? 'Welcome back' : 'Create account'}</Text>

            {/* Name (register only) */}
            {!isLogin && (
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={Colors.textDim}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Username (register only) */}
            {!isLogin && (
              <View style={styles.inputWrap}>
                <Ionicons name="at-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor={Colors.textDim}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textDim}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor={Colors.textDim}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType={isLogin ? 'password' : 'newPassword'}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleEmailAuth}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Apple Sign-In */}
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-apple" size={20} color={Colors.white} />
              <Text style={styles.appleBtnText}>Sign in with Apple</Text>
            </TouchableOpacity>

            {/* Toggle */}
            <Pressable style={styles.toggleWrap} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleLink}>{isLogin ? 'Sign up' : 'Sign in'}</Text>
              </Text>
            </Pressable>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  keyboard: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  content: { paddingBottom: 40 },

  logoSection: { alignItems: 'center', marginBottom: 32, marginTop: 40 },
  logo: {
    fontFamily: Fonts.display, fontSize: 40, fontWeight: '900',
    color: Colors.purpleNeon, letterSpacing: 6,
  },
  tagline: {
    fontFamily: Fonts.body, fontSize: 14, color: Colors.textMuted,
    marginTop: 6, letterSpacing: 2,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.15)',
    borderRadius: Radius.xl, padding: 28,
  },

  cardTitle: {
    fontFamily: Fonts.display, fontSize: 24, fontWeight: '700',
    color: Colors.white, marginBottom: 24, textAlign: 'center',
  },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1, height: 50, fontFamily: Fonts.body, fontSize: 15,
    color: Colors.white, paddingVertical: 0,
  },
  eyeBtn: { padding: 4 },

  submitBtn: {
    backgroundColor: Colors.purple,
    borderRadius: Radius.md, height: 52,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4, marginBottom: 20,
  },
  submitBtnText: {
    fontFamily: Fonts.body, fontSize: 16, fontWeight: '700',
    color: Colors.white, letterSpacing: 0.5,
  },

  divider: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  dividerText: {
    fontFamily: Fonts.body, fontSize: 12, color: Colors.textMuted,
    marginHorizontal: 12, textTransform: 'uppercase', letterSpacing: 1,
  },

  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#000', borderRadius: Radius.md, height: 52,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    gap: 10,
  },
  appleBtnText: {
    fontFamily: Fonts.body, fontSize: 16, fontWeight: '600',
    color: Colors.white,
  },

  toggleWrap: { marginTop: 22, alignItems: 'center' },
  toggleText: {
    fontFamily: Fonts.body, fontSize: 13, color: Colors.textMuted,
  },
  toggleLink: { color: Colors.purpleNeon, fontWeight: '600' },
});
