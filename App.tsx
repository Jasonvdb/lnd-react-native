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

const App: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [walletExists, setWalletExists] = useState<boolean | undefined>(
    undefined,
  );
  const [lndStarted, setLndStarted] = useState<boolean>(false);
  const [seed, setSeed] = useState<[string]>(['']);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const dummyPassword = 'Shhhhhhhhhhh';

  useEffect(() => {
    (async (): Promise<void> => {
      const res = await lnd.walletExists('testnet');

      if (res.isOk()) {
        setWalletExists(res.value);
      } else {
        setContent(res.error.toString());
      }

      const state = await lnd.currentState();
      if (state.isOk()) {
        const {lndRunning, walletUnlocked, grpcReady} = state.value;

        console.log(state.value);
        setLndStarted(lndRunning);
        setIsUnlocked(walletUnlocked);
      } else {
        setContent(state.error.toString());
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

                  console.log(res.isOk());
                  console.log(res);

                  if (res.isOk()) {
                    setLndStarted(true);
                    setContent(res.value);
                  } else if (res.isErr()) {
                    setContent(res.error.toString());
                  }
                }}
                title="Start LND"
                color="gray"
              />
            ) : (
              <></>
            )}

            {lndStarted && walletExists === false ? (
              <Button
                onPress={async () => {
                  setContent('Generating seed...');
                  const res = await lnd.genSeed();

                  if (res.isOk()) {
                    setSeed(res.value);
                    setContent(res.value.join(' '));
                  } else {
                    setContent(res.error.toString());
                  }
                }}
                title="Seed me"
                color="green"
              />
            ) : (
              <></>
            )}

            {!isUnlocked && seed.length > 0 ? (
              <Button
                onPress={async () => {
                  setContent('Initializing...');
                  const res = await lnd.createWallet(dummyPassword, seed);

                  if (res.isOk()) {
                    setIsUnlocked(true);
                    setContent(res.value);
                  } else {
                    setContent(res.error.toString());
                  }
                }}
                title={'Create wallet with seed'}
                color="purple"
              />
            ) : (
              <></>
            )}

            {!isUnlocked && lndStarted && walletExists === true ? (
              <Button
                onPress={async () => {
                  setContent('Unlocking...');
                  const res = await lnd.unlockWallet(dummyPassword);

                  if (res.isOk()) {
                    setIsUnlocked(true);
                    setContent(res.value);
                  } else {
                    setContent(res.error.toString());
                  }
                }}
                title={'Unlock existing wallet'}
                color="purple"
              />
            ) : (
              <></>
            )}

            {isUnlocked ? (
              <Fragment>
                <Button
                  onPress={async () => {
                    setContent('Fetching info...');
                    const res = await lnd.getInfo();
                    console.log(res);
                    if (res.isOk()) {
                      const {
                        alias,
                        blockHash,
                        chains,
                        identityPubkey,
                        version,
                        ...rest
                      } = res.value;

                      setContent(
                        `Version: ${version}\n\nPubkey: ${identityPubkey}\n\nAlias: ${alias}\n\nBlockHash: ${blockHash}\n\nChains: ${JSON.stringify(
                          chains,
                        )}`,
                      );
                    } else {
                      setContent(res.error.toString());
                    }
                  }}
                  title="Info"
                  color="blue"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching address...');
                    const res = await lnd.getAddress();

                    if (res.isOk()) {
                      setContent(JSON.stringify(res.value));
                    } else {
                      setContent(res.error.toString());
                    }
                  }}
                  title="Get address"
                  color="orange"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching balance...');
                    const res = await lnd.getWalletBalance();

                    if (res.isOk()) {
                      const {
                        confirmedBalance,
                        totalBalance,
                        unconfirmedBalance
                      } = res.value;
                      setContent(
                        `confirmedBalance: ${confirmedBalance}\ntotalBalance: ${totalBalance}\nunconfirmedBalance: ${unconfirmedBalance}\n`,
                      );
                    } else {
                      setContent(res.error.toString());
                    }
                  }}
                  title="Show balance"
                  color="red"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching channel balance...');
                    const res = await lnd.getChannelBalance();

                    if (res.isOk()) {
                      const {balance, pendingOpenBalance} = res.value;
                      setContent(
                        `balance: ${balance}\npendingOpenBalance: ${pendingOpenBalance}\n`,
                      );
                    } else {
                      setContent(res.error.toString());
                    }
                  }}
                  title="Show channel balance"
                  color="red"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching state...');
                    const res = await lnd.currentState();

                    if (res.isOk()) {
                      setContent(JSON.stringify(res.value));
                    } else {
                      setContent(res.error.toString());
                    }
                  }}
                  title="Show status"
                  color="green"
                />
              </Fragment>
            ) : (
              <></>
            )}
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