import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import { Text, Button } from "react-native-elements";

import Swiper from "react-native-swiper";

const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB"
  },
  slide2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#97CAE5"
  },
  slide3: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9DD6EB"
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
              borderRadius={50}
              containerViewStyle={{ borderRadius: 50 }}
              fontWeight="bold"
              raised={true}
              backgroundColor="white"
              color="#9DD6EB"
              large
              title="使ってみる"
              onPress={this.props._onpress}
            />
          </View>
        </View>
      </Swiper>
    );
  }
}
