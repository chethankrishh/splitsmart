// Settle-up screen — shows optimised who-pays-whom list
import { View, Text, StyleSheet } from 'react-native';

export default function SettleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settle Up</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 18, color: '#1a1a2e' },
});
