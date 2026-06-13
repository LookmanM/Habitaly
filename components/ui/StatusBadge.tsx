import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

export type BadgeStatus =
  | 'draft'
  | 'pending'
  | 'submitted_hpd'
  | 'closed'
  | 'matched_lawyer'
  | 'emergency'
  | 'high'
  | 'medium'
  | 'low';

const CONFIG: Record<BadgeStatus, { label: string; color: string; bg: string }> = {
  draft:          { label: 'Draft',           color: Colors.textSecondary,     bg: Colors.surface },
  pending:        { label: 'Pending',          color: Colors.notified.text,     bg: Colors.notified.background },
  submitted_hpd:  { label: 'HPD Filed',        color: Colors.filed.text,        bg: Colors.filed.background },
  closed:         { label: 'Resolved',         color: Colors.resolved.text,     bg: Colors.resolved.background },
  matched_lawyer: { label: 'Lawyer Matched',   color: Colors.notified.text,     bg: Colors.notified.background },
  emergency:      { label: 'Emergency',        color: Colors.emergency.text,    bg: Colors.emergency.background },
  high:           { label: 'High',             color: Colors.emergency.text,    bg: Colors.emergency.background },
  medium:         { label: 'Medium',           color: Colors.filed.text,        bg: Colors.filed.background },
  low:            { label: 'Low',              color: Colors.resolved.text,     bg: Colors.resolved.background },
};

type Props = { status: BadgeStatus };

export function StatusBadge({ status }: Props) {
  const { label, color, bg } = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
