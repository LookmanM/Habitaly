import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = ViewProps & {
  children: React.ReactNode;
};

export function Card({ children, style, ...props }: Props) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    overflow: 'hidden',
  },
});
