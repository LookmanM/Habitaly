import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CaseProgressTrack } from '@/components/ui/CaseProgressTrack';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ShowcaseScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
    >
      <Button label="← Back" onPress={() => router.back()} variant="secondary" />

      <Text style={styles.pageTitle}>Component Showcase</Text>

      {/* ── Colors ── */}
      <Section title="Colors — Base">
        <View style={styles.swatchRow}>
          {[
            { name: 'Background', color: Colors.background, bordered: true },
            { name: 'Surface',    color: Colors.surface,    bordered: true },
            { name: 'Text',       color: Colors.text },
            { name: 'Secondary',  color: Colors.textSecondary },
            { name: 'Border',     color: Colors.border },
          ].map((s) => (
            <View key={s.name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: s.color }, s.bordered && styles.swatchBordered]} />
              <Text style={styles.swatchLabel}>{s.name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Colors — Status">
        <View style={styles.swatchRow}>
          {[
            { name: 'Emergency', bg: Colors.emergency.background, dot: Colors.emergency.text },
            { name: 'Notified',  bg: Colors.notified.background,  dot: Colors.notified.text },
            { name: 'Filed',     bg: Colors.filed.background,     dot: Colors.filed.text },
            { name: 'Resolved',  bg: Colors.resolved.background,  dot: Colors.resolved.text },
          ].map((s) => (
            <View key={s.name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: s.bg }]}>
                <View style={[styles.swatchDot, { backgroundColor: s.dot }]} />
              </View>
              <Text style={styles.swatchLabel}>{s.name}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <Text style={{ fontFamily: Fonts.bold,     fontSize: FontSizes.xxl, color: Colors.text, marginBottom: 8 }}>Heading Bold</Text>
        <Text style={{ fontFamily: Fonts.semiBold, fontSize: FontSizes.xl,  color: Colors.text, marginBottom: 8 }}>Heading SemiBold</Text>
        <Text style={{ fontFamily: Fonts.medium,   fontSize: FontSizes.md,  color: Colors.text, marginBottom: 8 }}>Label Medium</Text>
        <Text style={{ fontFamily: Fonts.regular,  fontSize: FontSizes.base,color: Colors.text, marginBottom: 8 }}>Body Regular — The quick brown fox.</Text>
        <Text style={{ fontFamily: Fonts.regular,  fontSize: FontSizes.sm,  color: Colors.textSecondary }}>Secondary text · Small</Text>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons">
        <Button label="Primary Button" onPress={() => {}} />
        <View style={{ height: 12 }} />
        <Button label="Secondary Button" onPress={() => {}} variant="secondary" />
        <View style={{ height: 12 }} />
        <Button label="Disabled" onPress={() => {}} disabled />
        <View style={{ height: 12 }} />
        <Button label="Loading…" onPress={() => {}} loading />
      </Section>

      {/* ── Card with progress track ── */}
      <Section title="Card">
        <Card>
          <CaseProgressTrack progress={0.65} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Mold in bathroom ceiling</Text>
              <StatusBadge status="pending" />
            </View>
            <Text style={styles.cardMeta}>Unit 4B · 123 Main St · 3 days ago</Text>
            <Text style={styles.cardStrength}>Case strength: 65%</Text>
          </View>
        </Card>
      </Section>

      {/* ── Status Badges ── */}
      <Section title="Status Badges — Report">
        <View style={styles.badgeRow}>
          <StatusBadge status="draft" />
          <StatusBadge status="pending" />
          <StatusBadge status="submitted_hpd" />
          <StatusBadge status="closed" />
          <StatusBadge status="matched_lawyer" />
        </View>
      </Section>

      <Section title="Status Badges — Severity">
        <View style={styles.badgeRow}>
          <StatusBadge status="emergency" />
          <StatusBadge status="high" />
          <StatusBadge status="medium" />
          <StatusBadge status="low" />
        </View>
      </Section>

      {/* ── Progress Track ── */}
      <Section title="Case Progress Track">
        {[0.1, 0.35, 0.65, 0.82, 1.0].map((p) => (
          <View key={p} style={styles.progressRow}>
            <Text style={styles.progressLabel}>{Math.round(p * 100)}%</Text>
            <View style={{ flex: 1 }}>
              <CaseProgressTrack progress={p} />
            </View>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginTop: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatchItem: {
    alignItems: 'center',
    gap: 6,
  },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchBordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  swatchDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  swatchLabel: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardBody: {
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: FontSizes.base,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  cardMeta: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  cardStrength: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  progressLabel: {
    width: 36,
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
