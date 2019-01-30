import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions
} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { Constants, Location, Permissions, Svg } from 'expo';
import * as Animatable from 'react-native-animatable';
import {Button, Text, Divider} from 'react-native-elements';
import Intro from './src/components/intro';
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation';
import CityCodeList from './src/prefecture.json';
import firebaseConfig from './src/firebase/firebaseConfig';

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

class HomeScreen extends React.Component {
  constructor(){
    super();
    firebase.initializeApp(firebaseConfig);
    console.log("初期化完了")
  }

  componentDidMount(){
    firebase.auth().signInAnonymously()
      .catch(err => this.setState({errorMessage: err}))
  }

  static navigationOptions = {
    header: null,
  };

  state = {
    location: null,
    loading: false,
    errorMessage: null
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    };
    this.setState({ loading: true });
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ loading: false });
    this.props.navigation.push('Other',{
      loc: location,
      randNumber: 2006 + Math.floor( Math.random() * 13 )
    });
  };

  render() {
    return (
      <View style={styles.container}>
          {this.state.errorMessage === null ? 
            <Button
                    fontWeight='bold' 
                    fontSize={90}
                    raised={true} 
                    buttonStyle={{
                      height: 140,
                      width: 140,
                      borderRadius: 70
                    }}
                    disabled={this.state.loading}
                    containerViewStyle={{borderRadius: 70}}
                    backgroundColor="#9DD6EB" 
                    color="white" 
                    large 
                    title="$" 
                    onPress={()=>this._getLocationAsync()} 
                /> : 
            <View style={{marginHorizontal:20, flexWrap:"wrap", }}>
              <Text h2 style={{display:"flex", color:'#9DD6EB', fontWeight: 'bold'}}>
                接続のいいところで
              </Text>
              <Text h2 style={{display:"flex", color:'#9DD6EB', fontWeight: 'bold'}}>
                再起動してください
              </Text>
            </View>
          }
      </View>
    );
  }
}

class OtherScreen extends React.Component {
  static navigationOptions = {
    title: 'いくらでしたか？',
  };

  state = {
    text: 'waiting',
    prefecture: "",
    city: "",
    areaCode: "",
    town: "",
    cityCode: "",
    count: null,
    price: null,
    loading: true,
    firestoreData: null,
    dims: Dimensions.get('window')
  };

  componentDidMount(){
    Dimensions.addEventListener('change', this.handleDimensionsChange);

    firebase.auth().onAuthStateChanged(user => {
      if(user){
        console.log("ログイン成功してる")
      } else {
        console.log("ログインされてない")
      }
    })

    const locatio = this.props.navigation.getParam('loc', 'no-loc');

    this.getTheDetailOfLocation(locatio);
    // console.log(this.state.areaCode);
    // this.getTheCityCode(this.state.areaCode);
    // console.log(this.state.cityCode);
    // this.getThePriceOfLand(this.state.cityCode);
  };

  componentWillUnmount() {
    Dimensions.removeEventListener('change', this.handleDimensionsChange)
  }

  handleDimensionsChange = (dimensions) => {
    this.setState({ dims: dimensions['window'] })
  };

  widthPerc(value) {
    return parseInt((this.state.dims.width * value) / 100) 
  };

  getTheDetailOfLocation = async (location) => {
    try {
      // まず都道府県コードを取得
      let res = await fetch(
        "http://geoapi.heartrails.com/api/json?method=searchByGeoLocation"+
        `&x=${location.coords.longitude}&y=${location.coords.latitude}`
      )
      let resJson = await res.json();
      this.setState({
        prefecture: resJson.response.location[0].prefecture,
        city: resJson.response.location[0].city,
        town: resJson.response.location[0].town
      })

      for(i=0;i<47;i++){
        if(CityCodeList.prefectures[i].name === resJson.response.location[0].prefecture){
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
        `http://www.land.mlit.go.jp/webland/api/CitySearch?area=${this.state.areaCode}`
      );
      let res1Json = await res1.json();
      for(i=0;i<res1Json.data.length;i++){
        if(~this.state.city.indexOf(res1Json.data[i].name)){
          this.setState({
            cityCode: res1Json.data[i].id
          })
        }
      }

      // firestoreから周辺地価データを取得
      let doc = await firebase.firestore().collection('cities').doc(this.state.cityCode).get()
      this.setState({
        firestoreData: doc.data().data
      });
      
      let sum = 0;
      let cnt = 0;

      for(data in this.state.firestoreData){
        if(this.state.firestoreData[data]["mean"]){
          cnt += 1;
          sum += this.state.firestoreData[data]["mean"]
        }
      }

      this.setState({
        loading: false,
        price: Math.floor(sum/cnt),
        count: cnt
      })

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

    } catch(err){
      console.log(err)
    }
  }

  render() {
    const {price, prefecture, city, town, loading, count} = this.state;

    return (
      <View style={styles.container}>
      {loading ?
        <Animatable.View animation="fadeOut" iterationCount="infinite" direction="alternate" useNativeDriver>
          <Svg height={540} width={this.widthPerc(97)}>
            <Svg.Rect
              x={(this.widthPerc(97)-230)/2}
              y={205}
              width={220}
              height={60}
              fill="#dee2e6"
            />
            <Svg.Rect
              x={(this.widthPerc(97)-280)/2}
              y={300}
              width={280}
              height={20}
              fill="#dee2e6"
            />
            <Svg.Rect
              x={(this.widthPerc(97)-280)/2}
              y={330}
              width={280}
              height={20}
              fill="#dee2e6"
            />
          </Svg>
        </Animatable.View> :
        <View style={styles.container}>
          <Text style={styles.title}>{price}円</Text>
          <Text style={styles.caption}>ここ{count}年での1坪あたり価格</Text>
          <Text style={styles.caption}>{prefecture}{city}{town}</Text>
        </View>
      }
      </View>
    );
  }
}

class IntroScreen extends React.Component {
  render(){
    return(
      <Intro _onpress={()=>this.props.navigation.navigate("App")} />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    marginBottom: 20
  },
  caption: {
    fontSize: 20,
    marginBottom: 5
  }
});

const AppStack = createStackNavigator({ Home: HomeScreen, Other: OtherScreen });

export default RootNav = createAppContainer(createSwitchNavigator(
  {
    App: AppStack,
    Introduction: IntroScreen
  },
  {
    initialRouteName: 'Introduction',
  }
));

// export default class Root extends React.Component {
//   constructor(){
//     super();
//     firebase.initializeApp(firebaseConfig);
//   }

//   render(){
//     return RootNav
//   }
// }