import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing } from '../src/utils/theme';

export default function UpgradeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>BECOME A CREATOR</Text>
        <Text style={styles.sub}>Placeholder upgrade screen. The main creator flow already works in the app structure — this page just needs the final UX and billing logic later.</Text>
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
