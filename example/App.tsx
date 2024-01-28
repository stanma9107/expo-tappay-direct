import { StyleSheet, Text, View } from 'react-native';

import * as ExpoTappayDirect from 'expo-tappay-direct';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{ExpoTappayDirect.getTheme()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
