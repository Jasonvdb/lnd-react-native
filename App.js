/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
} from 'react-native';
import lnd from 'react-native-lightning';

const App: () => React$Node = () => {
  const [content, setContent] = useState('');
  const [walletExists, setWalletExists] = useState(null);
  const [lndStarted, setLndStarted] = useState(false);
  const [seed, setSeed] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await lnd.walletExists('testnet');

      if (res.error == false) {
        setWalletExists(res.data.exists);
      } else {
        setContent(`Failed to generate seed: ${res.data}`);
      }
    })();
  }, [lndStarted]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.buttons}>
            {!lndStarted ? (
              <Button
                onPress={async () => {
                  setContent('Starting...');
                  const res = await lnd.start();

                  if (res.error == false) {
                    setLndStarted(true);
                    setContent('LND started');
                  } else {
                    setContent(`Failed to start LND: ${res.data}`);
                  }
                }}
                title="Start LND"
                color="gray"
              />
            ) : null}

            {lndStarted && walletExists === false ? (
              <Button
                onPress={async () => {
                  setContent('Generating seed...');
                  const res = await lnd.genSeed();

                  if (res.error == false) {
                    setSeed(res.data.seed);
                    setContent(res.data.seed.join(' '));
                  } else {
                    setContent(`Failed to generate seed: ${res.data}`);
                  }
                }}
                title="Seed me"
                color="green"
              />
            ) : null}

            {!isUnlocked && seed.length > 0 ? (
              <Button
                onPress={async () => {
                  setContent('Initializing...');
                  const res = await lnd.initWallet(seed);

                  if (res.error == false) {
                    setIsUnlocked(true);
                    setContent('Wallet initialized.');
                  } else {
                    setContent(`Failed to initialize: ${res.data}`);
                  }
                }}
                title={'Create wallet with seed'}
                color="purple"
              />
            ) : null}

            {!isUnlocked && lndStarted && walletExists === true ? (
              <Button
                onPress={async () => {
                  setContent('Unlocking...');
                  const res = await lnd.unlockWallet();

                  if (res.error == false) {
                    setIsUnlocked(true);
                    setContent('Wallet unlocked.');
                  } else {
                    setContent(`Failed to unlock: ${res.data}`);
                  }
                }}
                title={'Unlock existing wallet'}
                color="purple"
              />
            ) : null}

            {isUnlocked ? (
              <Fragment>
                <Button
                  onPress={async () => {
                    setContent('Fetching info...');
                    const res = await lnd.getInfo();

                    if (res.error == false) {
                      const {
                        alias,
                        blockHash,
                        chains,
                        identityPubkey,
                        version,
                        ...rest
                      } = res.data;

                      setContent(
                        `Version: ${version}\n\nPubkey: ${identityPubkey}\n\nAlias: ${alias}\n\nBlockHash: ${blockHash}\n\nChains: ${JSON.stringify(
                          chains,
                        )}`,
                      );
                    } else {
                      setContent(`Failed to get info: ${res.data}`);
                    }
                  }}
                  title="Info"
                  color="blue"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching address...');
                    const res = await lnd.getAddress();

                    if (res.error == false) {
                      setContent(res.data);
                    } else {
                      setContent(`Failed to get address: ${res.data}`);
                    }
                  }}
                  title="Get address"
                  color="orange"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching balance...');
                    const res = await lnd.getWalletBalance();

                    if (res.error == false) {
                      setContent(JSON.stringify(res.data));
                    } else {
                      setContent(`Failed to get balance: ${res.data}`);
                    }
                  }}
                  title="Show balance"
                  color="red"
                />
              </Fragment>
            ) : null}
          </View>
          <Text style={styles.text}>{content}</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  buttons: {
    marginTop: 20,
    height: 250,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  text: {
    textAlign: 'center',
  },
});

export default App;
