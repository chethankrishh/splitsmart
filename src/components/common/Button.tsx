import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', style, textStyle, disabled }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[styles.label, variant === 'primary' ? styles.labelPrimary : styles.labelAlt, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#5c6bc0' },
  secondary: { backgroundColor: '#e8eaf6', borderWidth: 1, borderColor: '#5c6bc0' },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.4 },
  label: { fontSize: 15, fontWeight: '600' },
  labelPrimary: { color: '#fff' },
  labelAlt: { color: '#5c6bc0' },
});
