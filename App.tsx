/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Fragment, useEffect, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import lnd from 'react-native-lightning';
import LndConf from 'react-native-lightning/dist/lnd.conf';
import {Networks} from 'react-native-lightning/dist/interfaces';

const lndConf = new LndConf(Networks.regtest);

const App: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [walletExists, setWalletExists] = useState<boolean | undefined>(
    undefined,
  );
  const [lndStarted, setLndStarted] = useState<boolean>(false);
  const [seed, setSeed] = useState<string[]>([]);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const dummyPassword = 'Shhhhhhhhhhh';

  useEffect(() => {
    (async () => {
      const res = await lnd.walletExists(lndConf.network);

      if (res.isOk()) {
        setWalletExists(res.value);
      } else {
        setContent(res.error.message);
      }

      const state = await lnd.currentState();
      if (state.isOk()) {
        const {lndRunning, walletUnlocked, grpcReady} = state.value;
        setLndStarted(lndRunning);
        setIsUnlocked(walletUnlocked);
      } else {
        setContent(state.error.message);
      }
    })();
  }, [lndStarted]);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          <View style={styles.buttons}>
            <Button
              onPress={async () => {
                setContent('Fetching state...');
                const res = await lnd.currentState();

                if (res.isOk()) {
                  const {grpcReady, lndRunning, walletUnlocked} = res.value;
                  setContent(
                    `grpcReady: ${grpcReady ? '✅' : '❌'}
                        \nlndRunning: ${lndRunning ? '✅' : '❌'}
                        \nwalletUnlocked: ${walletUnlocked ? '✅' : '❌'}\n`,
                  );
                } else {
                  setContent(res.error.message);
                }
              }}
              title="Show status"
              color="green"
            />
            {!lndStarted ? (
              <Button
                onPress={async () => {
                  setContent('Starting...');
                  const res = await lnd.start(lndConf);

                  if (res.isOk()) {
                    setLndStarted(true);
                    setContent(res.value);
                  } else if (res.isErr()) {
                    setContent(res.error.message);
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
                    setContent(res.error.message);
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
                    setContent(res.error.message);
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
                    setContent(res.error.message);
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
                    if (res.isOk()) {
                      const {
                        alias,
                        blockHash,
                        chains,
                        identityPubkey,
                        version,
                        blockHeight,
                        syncedToChain,
                        numActiveChannels,
                        numPeers,
                      } = res.value;

                      setContent(
                        `Version: ${version}\n\nPubkey: ${identityPubkey}\n\nAlias: ${alias}\n\nBlockHash: ${blockHash}\n\nblockHeight: ${blockHeight}\nnumActiveChannels: ${numActiveChannels}\nnumPeers: ${numPeers}\nsyncedToChain: ${
                          syncedToChain ? '✅' : '❌'
                        }\n\nChains: ${JSON.stringify(chains)}`,
                      );
                    } else {
                      setContent(res.error.message);
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
                      setContent(res.value.address);
                      console.log(res.value.address);
                    } else {
                      setContent(res.error.message);
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
                        unconfirmedBalance,
                      } = res.value;
                      setContent(
                        `confirmedBalance: ${confirmedBalance.toString()}\ntotalBalance: ${totalBalance.toString()}\nunconfirmedBalance: ${unconfirmedBalance.toString()}\n`,
                      );
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="Show balance"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Fetching channel balance...');
                    const res = await lnd.getChannelBalance();

                    if (res.isOk()) {
                      const {balance, pendingOpenBalance} = res.value;
                      setContent(
                        `openChannelBalance: ${balance.toString()}\npendingOpenBalance: ${pendingOpenBalance.toString()}\n`,
                      );
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="Show channel balance"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Listing channels...');
                    const res = await lnd.listChannels();

                    if (res.isOk()) {
                      if (res.value.channels.length === 0) {
                        return setContent('No channels');
                      }

                      setContent(
                        res.value.channels
                          .map(
                            (c) =>
                              `${c.active ? '✅' : '❌'} Capacity:${
                                c.capacity
                              } Sent:${c.totalSatoshisSent} Updates:${
                                c.numUpdates
                              }`,
                          )
                          .join('\n\n'),
                      );
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="List channels"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Listing invoices...');
                    const res = await lnd.listInvoices();

                    if (res.isOk()) {
                      if (res.value.invoices.length === 0) {
                        return setContent('No Invoices');
                      }

                      setContent(
                        res.value.invoices
                          .map(
                            (i) =>
                              `${i.value} sats "${i.memo}" ${
                                i.settled ? '✅' : '❌'
                              }`,
                          )
                          .join('\n\n'),
                      );
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="List invoices"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Connecting...');
                    const res = await lnd.connectPeer(
                      '03d5524da52b1b632e766a1af7f917be0fffc905eb6cc0f4d8d1b40b72e26cb483',
                      '10.0.0.100:9736',
                    );

                    if (res.isOk()) {
                      setContent(JSON.stringify(res.value));
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="Connect peer"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Opening channel...');
                    const res = await lnd.openChannel(
                      500000,
                      '03d5524da52b1b632e766a1af7f917be0fffc905eb6cc0f4d8d1b40b72e26cb483',
                    );

                    if (res.isOk()) {
                      setContent(JSON.stringify(res.value));
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="Open channel"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Closing 1st channel...');

                    const channelsRes = await lnd.listChannels();
                    if (channelsRes.isErr()) {
                      return setContent(channelsRes.error.message);
                    }
                    if (channelsRes.value.channels.length === 0) {
                      return setContent('No open channels.');
                    }

                    // Close first channel in the list
                    const channelToClose = channelsRes.value.channels[0];

                    let outLines = ``;
                    lnd.closeChannelStream(
                      channelToClose,
                      (res) => {
                        if (res.isErr()) {
                          outLines = `${outLines}\nERROR: ${res.error}`;
                        } else {
                          outLines = `${outLines}\nChannels being closed: ${res.value.channels.length}`;
                        }

                        setContent(outLines);
                      },
                      () => {
                        outLines = `${outLines}\nClosed.`;
                        setContent(outLines);
                      },
                    );
                  }}
                  title="Close channel"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Paying...');
                    const res = await lnd.payInvoice(
                      'lnbcrt25u1p0uwjt5pp56s83a7p4jtvgquajghh4rhctamdgdz33js4j9h3hgdv8qd07gulqdqqcqzpgsp5adw62sddeurhujz2cmacm2m80yrqdh8t8c3yfxehyh63gjt8st6s9qy9qsqtnmdrp2jzgntr6vseqzyye6e9e0vqdshekrxnn2s89zumuw2ptrkyx2de3cpkp0qsaepdh9wkladzkkhutte56xk6a3sq7pf2dcrdgsqrp7xjp',
                    );

                    if (res.isOk()) {
                      setContent(JSON.stringify(res.value));
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="Pay invoice"
                  color="purple"
                />

                <Button
                  onPress={async () => {
                    setContent('Creating...');
                    const res = await lnd.createInvoice(1234, 'Pay me bitch');

                    if (res.isOk()) {
                      console.log(res.value);
                      setContent(JSON.stringify(res.value));
                    } else {
                      setContent(res.error.message);
                    }
                  }}
                  title="Create invoice"
                  color="purple"
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
  safeArea: {
    backgroundColor: 'black',
  },
  scrollView: {
    height: '100%',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  text: {
    marginTop: 20,
    textAlign: 'center',
    color: 'white',
  },
});

export default App;
