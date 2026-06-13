export const Colors = {
  // Base palette
  background:      '#FFFFFF',
  surface:         '#FAFAFA',
  text:            '#0A0A0A',
  textSecondary:   '#9A9A9A',
  border:          '#E6E6E6',
  borderLight:     '#ECECEC',
  black:           '#0A0A0A',
  white:           '#FFFFFF',

  // Status colors — use sparingly
  emergency: { text: '#C1272D', background: '#FCEEEE' },
  notified:  { text: '#1B6CA8', background: '#EAF3FC' },
  filed:     { text: '#A86A0C', background: '#FCF6E9' },
  resolved:  { text: '#13703A', background: '#EBF8EF' },
} as const;
