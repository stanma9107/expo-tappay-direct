import { Button, StyleSheet, View } from 'react-native';

import * as ExpoTappayDirect from 'expo-tappay-direct';

const setup = () => {
  ExpoTappayDirect.setup({
    appId: 123123,
    appKey: "app_bwmOKgdMPjm6mnFYDZENvgIriIoyREa9uR1CoLvSpA0pYFwDFqnnnxfDuXjc",
    serverType: "sandbox",
  });
};

const setCard = () => {
  ExpoTappayDirect.setCard({
    cardNumber: "4242424242424242",
    dueMonth: "01",
    dueYear: "25",
    ccv: "123",
  });
};

const removeCard = () => {
  ExpoTappayDirect.removeCard();
};

const getPrime = async () => {
  try {
    const prime = await ExpoTappayDirect.getPrime();
    console.log(prime);
  } catch (error) {
    console.log(error);
  }
};

export default function App() {
  return (
    <View style={styles.container}>
      <Button title="setup" onPress={setup} />
      <Button title="set card" onPress={setCard} />
      <Button title="remove card" onPress={removeCard} />
      <Button title="get prime" onPress={getPrime} />
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
