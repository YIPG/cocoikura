import React from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  FlatList,
  ActivityIndicator
} from "react-native";
import * as firebase from "firebase";
import "firebase/firestore";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";
import * as Animatable from "react-native-animatable";
import { Button, Text, ListItem } from "react-native-elements";
import Intro from "./src/components/intro";
import { NavigationNativeContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CityCodeList from "./src/prefecture.json";
import firebaseConfig from "./src/firebase/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

import GraphScreen from "./src/components/graph";

// class SignInScreen extends React.Component {
//   static navigationOptions = {
//     title: 'Please sign in',
//   };

//   render() {
//     return (
//       <View style={styles.container}>
//         <Button title="Sign in!" onPress={this._signInAsync} />
//       </View>
//     );
//   }

//   _signInAsync = async () => {
//     await AsyncStorage.setItem('userToken', 'abc');
//     this.props.navigation.navigate('App');
//   };
// }

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

class HomeScreen extends React.Component {
  constructor() {
    super();

    console.log("初期化完了");
  }

  componentDidMount() {
    firebase.auth().signInAnonymously();
  }

  state = {
    location: null,
    loading: false,
    errorMessage: null
  };

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }
    this.setState({ loading: true });
    let location = await Location.getCurrentPositionAsync({});
    console.log(location);
    console.table(location);
    this.setState({ loading: false });
    this.props.navigation.push("Other", {
      loc: location,
      randNumber: 2006 + Math.floor(Math.random() * 13)
    });
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.errorMessage === null ? (
          <View>
            <Button
              style={styles.mainButton}
              fontWeight="bold"
              fontSize={100}
              raised={true}
              buttonStyle={{
                height: 140,
                width: 140,
                borderRadius: 70
              }}
              disabled={this.state.loading}
              containerViewStyle={{ borderRadius: 70 }}
              backgroundColor="#9DD6EB"
              color="white"
              large
              borderBottom="solid 2px #b5b5b5"
              title="$"
              onPress={() => this._getLocationAsync()}
            />
          </View>
        ) : (
          <View style={{ marginHorizontal: 20, flexWrap: "wrap" }}>
            <Text
              h2
              style={{ display: "flex", color: "#9DD6EB", fontWeight: "bold" }}
            >
              接続のいいところで
            </Text>
            <Text
              h2
              style={{ display: "flex", color: "#9DD6EB", fontWeight: "bold" }}
            >
              再起動してください
            </Text>
          </View>
        )}
      </View>
    );
  }
}

class OtherScreen extends React.Component {
  state = {
    text: "waiting",
    prefecture: "",
    city: "",
    areaCode: "",
    town: "",
    cityCode: "",
    count: null,
    price: null,
    loading: true,
    firestoreData: null,
    dims: Dimensions.get("window"),
    uid: null
  };

  componentDidMount() {
    Dimensions.addEventListener("change", this.handleDimensionsChange);

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ uid: user.uid });
        console.log("ログイン成功してる");
      } else {
        console.log("ログインされてない");
      }
    });

    const { loc } = this.props.route.params;
    console.log(loc);
    this.getTheDetailOfLocation(loc);
    // console.log(this.state.areaCode);
    // this.getTheCityCode(this.state.areaCode);
    // console.log(this.state.cityCode);
    // this.getThePriceOfLand(this.state.cityCode);
  }

  componentWillUnmount() {
    Dimensions.removeEventListener("change", this.handleDimensionsChange);
  }

  handleDimensionsChange = dimensions => {
    this.setState({ dims: dimensions["window"] });
  };

  widthPerc(value) {
    return parseInt((this.state.dims.width * value) / 100);
  }

  getTheDetailOfLocation = async location => {
    try {
      // まず都道府県コードを取得
      let res = await fetch(
        "https://geoapi.heartrails.com/api/json?method=searchByGeoLocation" +
          `&x=${location.coords.longitude}&y=${location.coords.latitude}`
      );
      let resJson = await res.json();
      this.setState({
        prefecture: resJson.response.location[0].prefecture,
        city: resJson.response.location[0].city,
        town: resJson.response.location[0].town
      });

      for (i = 0; i < 47; i++) {
        if (
          CityCodeList.prefectures[i].name ===
          resJson.response.location[0].prefecture
        ) {
          this.setState({
            areaCode: CityCodeList.prefectures[i].code
          });
          break;
        }
      }
      // 返ってくるデータは
      // {"city":"千代田区","city_kana":"ちよだく","town":"神田駿河台四丁目","town_kana":"かんだするがだい4ちょうめ","x":"139.764928","y":"35.698724","distance":247.69834334193078,"prefecture":"東京都","postal":"1010062"}

      // 次に市町村コードを取得
      let res1 = await fetch(
        `https://www.land.mlit.go.jp/webland/api/CitySearch?area=${this.state.areaCode}`
      );

      console.log(
        `http://www.land.mlit.go.jp/webland/api/CitySearch?area=${this.state.areaCode}`
      );
      let res1Json = await res1.json();
      console.log(res1Json);
      for (i = 0; i < res1Json.data.length; i++) {
        if (~this.state.city.indexOf(res1Json.data[i].name)) {
          console.log(`一致した市の名前は${res1Json.data[i].name}`);
          this.setState({
            cityCode: res1Json.data[i].id
          });
        }
      }

      // 履歴からではなくメインボタンを押されたらDBへ保存
      !this.props.history &&
        (await firebase
          .firestore()
          .collection("visitedCity")
          .add({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            prefecture: this.state.prefecture,
            city: this.state.city,
            town: this.state.town,
            cityCode: this.state.cityCode,
            uid: this.state.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          }));

      console.log("firestoreに書き込み成功");

      // firestoreから周辺地価データを取得
      let doc = await firebase
        .firestore()
        .collection("cities")
        .doc(this.state.cityCode)
        .get();
      this.setState({
        firestoreData: doc.data().data
      });

      let sum = 0;
      let cnt = 0;
      let price_list = [];

      for (data in this.state.firestoreData) {
        if (this.state.firestoreData[data]["mean"]) {
          cnt += 1;
          sum += this.state.firestoreData[data]["mean"];
          price_list.push(this.state.firestoreData[data]["mean"]);
        } else {
          price_list.push(0);
        }
      }

      this.setState({
        loading: false,
        price: Math.floor(sum / cnt),
        count: cnt,
        tika_list: price_list
      });

      // 以下のような形状
      //
      // Object {
      //     "2006": Object {
      //       "mean": 6017857.142857143,
      //       "median": 5000000,
      //       "std": 4175015.275543361,
      //     },
      //     "2007": Object {
      //       "mean": 9729166.666666666,
      //       "median": 6550000,
      //       "std": 7647356.796450799,
      //     },

      // // 次に周辺地価を検索
      // console.log(`http://www.land.mlit.go.jp/webland/api/TradeListSearch?`+
      // `from=${randInt}1&to=20184` +
      // `&city=${this.state.cityCode}`);

      // let response = await fetch(
      //   `http://www.land.mlit.go.jp/webland/api/TradeListSearch?`+
      //   `from=${randInt}1&to=20184` +
      //   `&city=${this.state.cityCode}`
      // );
      // let responseJson = await response.json();

      // // 住宅価格算出
      // let sum = 0;
      // let cnt = 0
      // for(i=0;i<responseJson.data.length;i++){
      //   if(responseJson.data[i].UnitPrice){
      //     sum += Number(responseJson.data[i].UnitPrice);
      //     cnt += 1;
      //   };
      // }
      // this.setState({
      //   count: cnt,
      //   price: Math.floor(sum/cnt),
      //   loading: false
      // })
      // console.log(`${cnt}件のデータがあり、価格は${sum/cnt}`);
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const {
      price,
      prefecture,
      city,
      town,
      loading,
      count,
      tika_list
    } = this.state;

    return (
      <View style={styles.detailscreencontainer}>
        {loading ? (
          <Animatable.View
            animation="rubberBand"
            duration={2000}
            iterationCount="infinite"
          >
            {/* <Svg height={700} width={this.widthPerc(97)}>
              <Svg.Rect
                x={(this.widthPerc(97) - 230) / 2}
                y={70}
                width={250}
                height={70}
                fill="#dee2e6"
              />
              <Svg.Rect
                x={(this.widthPerc(97) - 250) / 2}
                y={190}
                width={280}
                height={20}
                fill="#dee2e6"
              />
              <Svg.Rect
                x={(this.widthPerc(97) - 250) / 2}
                y={215}
                width={280}
                height={20}
                fill="#dee2e6"
              />
              <Svg.Rect
                x={30}
                y={355}
                width={this.widthPerc(97) - 40}
                height={400}
                fill="#dee2e6"
              />
            </Svg> */}
            <ActivityIndicator size="large" color="#9DD6EB" />
          </Animatable.View>
        ) : (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flex: 2,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={styles.title}>{price}円</Text>
              <Text style={styles.caption}>ここ{count}年での1坪あたり価格</Text>
              <Text style={styles.caption}>
                {prefecture}
                {city}
                {town}
              </Text>
            </View>
            <View style={{ flex: 3, marginHorizontal: 20, marginBottom: 30 }}>
              <GraphScreen tikaList={tika_list} mean_price={price} />
            </View>
          </View>
        )}
      </View>
    );
  }
}

class IntroScreen extends React.Component {
  render() {
    return <Intro _onpress={() => this.props.navigation.navigate("App")} />;
  }
}

class HistoryScreen extends React.Component {
  state = {
    serverData: [],
    fetching_from_server: false,
    loading: true,
    nextPage: null,
    uid: null,
    pageEnd: false,
    refreshing: false
  };

  componentDidMount() {
    this._firstLoad();
  }

  _firstLoad = () => {
    console.log("firstloadが呼ばれた");
    this.setState({
      refreshing: true
    });
    firebase.auth().onAuthStateChanged(user => {
      this.setState({
        uid: user.uid
      });
      // console.log(`ログイン成功している uid: ${user.uid}`);
      const first = firebase
        .firestore()
        .collection("visitedCity")
        .where("uid", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(50);

      let tmpServerData = [];

      first
        .get()
        .then(documentSnapshots => {
          const lastVisible =
            documentSnapshots.docs[documentSnapshots.docs.length - 1];
          this.setState({
            nextPage: lastVisible
          });

          documentSnapshots.forEach(doc => {
            // console.log(doc.id, "=>", doc.data(), "\n");
            const { city, prefecture, town, createdAt } = doc.data();
            const tmp_date = createdAt.toDate();

            const tmpData = {
              location: prefecture + city + town,
              time: `${tmp_date.getFullYear()}年${tmp_date.getMonth() +
                1}月${tmp_date.getDate()}日${tmp_date.getHours()}時${tmp_date.getMinutes()}分`
            };
            // console.log(tmpData);
            tmpServerData = [...tmpServerData, tmpData];
            // console.log(this.state.serverData);
          });

          this.setState({
            serverData: tmpServerData,
            refreshing: false,
            loading: false
          });
        })
        .catch(err => console.log(err));
    });
  };

  _loadMore = () => {
    console.log("load_moreが呼ばれた");
    if (!this.state.pageEnd) {
      const next = firebase
        .firestore()
        .collection("visitedCity")
        .where("uid", "==", this.state.uid)
        .orderBy("createdAt", "desc")
        .startAfter(this.state.nextPage)
        .limit(50);

      next
        .get()
        .then(documentSnapshots => {
          const lastVisible =
            documentSnapshots.docs[documentSnapshots.docs.length - 1];
          console.log(`lastVisible == null: ${lastVisible == null}`);
          this.setState({
            nextPage: lastVisible,
            pageEnd: lastVisible == null
          });

          documentSnapshots.forEach(doc => {
            const { city, prefecture, town, createdAt } = doc.data();
            const tmp_date = createdAt.toDate();

            const tmpData = {
              location: prefecture + city + town,
              time: `${tmp_date.getFullYear()}年${tmp_date.getMonth() +
                1}月${tmp_date.getDate()}日${tmp_date.getHours()}時${tmp_date.getMinutes()}分`
            };
            console.log(tmpData);
            this.setState({
              serverData: [...this.state.serverData, tmpData]
            });
          });
        })
        .catch(err => console.log(err));
    }
  };

  renderItem = ({ item }) => (
    <ListItem title={item.location} subtitle={item.time} />
  );

  keyExtractor = (item, index) => index.toString();

  render() {
    const { serverData, loading, pageEnd } = this.state;
    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#9DD6EB" />
        </View>
      );
    }
    return (
      <View style={{ marginTop: 50 }}>
        <FlatList
          keyExtractor={this.keyExtractor}
          data={serverData}
          renderItem={this.renderItem}
          refreshing={this.state.refreshing}
          onRefresh={() => this._firstLoad()}
          onEndReached={() => this._loadMore()}
          onEndReachedThreshold={0}
        />
        {/* {!pageEnd && (
          <Button onPress={() => this._loadMore()} title="Load More" />
        )} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  mainButton: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6
  },
  detailscreencontainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center"
  },
  title: {
    fontSize: 60,
    marginBottom: 40
  },
  caption: {
    fontSize: 20,
    height: 30,
    marginBottom: 5
  },
  listContainer: {
    flex: 1,
    paddingTop: 22
  },
  listItem: {
    padding: 10,
    fontSize: 18,
    height: 44
  }
});

const MainStack = createStackNavigator();

function MainStackScreen() {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "ボタンを押してみましょう"
        }}
      />
      <MainStack.Screen
        name="Other"
        component={OtherScreen}
        options={{
          title: "いくらでしたか？"
        }}
      />
    </MainStack.Navigator>
  );
}

// for header title in tabbar nav, temporary using stack nav.
const HistoryStack = createStackNavigator();
function _HistoryScreen() {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen name="履歴" component={HistoryScreen} />
    </HistoryStack.Navigator>
  );
}
//

const MainTab = createBottomTabNavigator();

function MainTabScreen() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "ホーム") {
            iconName = `ios-home`;
          } else if (route.name === "履歴") {
            iconName = `ios-menu`;
          }

          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
      tabBarOptions={{
        activeTintColor: "#9DD6EB",
        inactiveTintColor: "gray"
      }}
    >
      <MainTab.Screen name="ホーム" component={MainStackScreen} />

      <MainTab.Screen name="履歴" component={_HistoryScreen} />
    </MainTab.Navigator>
  );
}

const RootStack = createStackNavigator();

// TODO: show introduction when first launching.
function RootStackScreen() {
  return (
    <RootStack.Navigator headerMode="none">
      <RootStack.Screen name="App" component={MainTabScreen} />
      <RootStack.Screen name="Introduction" component={IntroScreen} />
    </RootStack.Navigator>
  );
}

export default function RootNav() {
  return (
    <NavigationNativeContainer>{RootStackScreen()}</NavigationNativeContainer>
  );
}
