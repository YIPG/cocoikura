import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-elements";

// TODO: Android failed.
import Swiper from "react-native-swiper";

const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a8e8ff"
  },
  slide2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#92e0fc"
  },
  slide3: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#a8e8ff"
  },
  text: {
    color: "#fff",
    fontWeight: "bold"
  },
  button: {
    paddingTop: 22
  }
});

export default class Intro extends Component {
  render() {
    return (
      <Swiper bounces={true} style={styles.wrapper} showsButtons={false}>
        <View style={styles.slide1}>
          <Text h2 style={styles.text}>
            はじめまして
          </Text>
        </View>
        <View style={styles.slide2}>
          <Text h2 style={styles.text}>
            ここいくら？は
          </Text>
          <Text h2 style={styles.text}>
            現在地の地価を
          </Text>
          <Text h2 style={styles.text}>
            表示するアプリです
          </Text>
        </View>
        <View style={styles.slide1}>
          <Text h3 style={styles.text}>
            現在地を取得しますが
          </Text>
          <Text h3 style={styles.text}>
            地価を調べる目的でのみ
          </Text>
          <Text h3 style={styles.text}>
            使用されます
          </Text>
        </View>
        <View style={styles.slide2}>
          <Text h2 style={styles.text}>
            早速
          </Text>
          <Text h2 style={styles.text}>
            使ってみましょう
          </Text>
          <View style={styles.button}>
            <Button
              buttonStyle={{
                height: 100,
                width: 100,
                borderRadius: 50,
                backgroundColor: "white"
              }}
              titleStyle={{
                fontWeight: "bold",
                color: "#92e0fc"
              }}
              containerStyle={{ borderRadius: 50 }}
              raised={true}
              title="使ってみる"
              onPress={this.props._onpress}
            />
          </View>
        </View>
      </Swiper>
    );
  }
}
