import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '../src/utils/theme';

export default function EditProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>EDIT PROFILE</Text>
        <Text style={styles.sub}>Placeholder screen for now. I can wire the real profile editor after the main app flow is stable.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  content: { flex: 1, justifyContent: 'center', padding: Spacing.lg },
  title: { color: Colors.white, fontFamily: Fonts.display, fontSize: 28, letterSpacing: 2, marginBottom: 12 },
  sub: { color: Colors.textMuted, fontFamily: Fonts.body, fontSize: 14, lineHeight: 22 },
});
