import { useTheme } from '@/src/theme';
import { Text, View, StyleSheet } from 'react-native';
let theme;

export default function Index() {
  theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background
    },
    text: {
      color: theme.text
    }

  })

  return (
    <View
      style={styles.container}
    >
      <Text style={styles.text}>Home Screen</Text>
    </View>
  );
}
