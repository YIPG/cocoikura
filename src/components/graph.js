import React from "react";
import { LineChart, Grid, XAxis, YAxis } from "react-native-svg-charts";
import { Line, LinearGradient, Stop, Defs } from "react-native-svg";
import { View } from "react-native";

class ExtrasExample extends React.PureComponent {
  render() {
    // const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
    const data = this.props.tikaList;

    const axesSvg = { fontSize: 10, fill: "grey" };
    const verticalContentInset = { top: 10, bottom: 10 };
    const xAxisHeight = 30;

    const Gradient = () => (
      <Defs key={"gradient"}>
        <LinearGradient id={"gradient"} x1={"0"} y={"0%"} x2={"100%"} y2={"0%"}>
          <Stop offset={"0%"} stopColor={"rgb(65, 244, 190)"} />
          <Stop offset={"100%"} stopColor={"rgb(65, 88, 244)"} />
        </LinearGradient>
      </Defs>
    );

    const HorizontalLine = ({ y }) => (
      <Line
        key={"zero-axis"}
        x1={"0%"}
        x2={"100%"}
        y1={y(this.props.mean_price)}
        y2={y(this.props.mean_price)}
        stroke={"grey"}
        strokeDasharray={[4, 8]}
        strokeWidth={1}
      />
    );

    const xaxis_format = index => {
      if (index === 12) {
        return `${6 + index}年`;
      }
      return 6 + index;
    };

    // Layout of an x-axis together with a y-axis is a problem that stems from flexbox.
    // All react-native-svg-charts components support full flexbox and therefore all
    // layout problems should be approached with the mindset "how would I layout regular Views with flex in this way".
    // In order for us to align the axes correctly we must know the height of the x-axis or the width of the x-axis
    // and then displace the other axis with just as many pixels. Simple but manual.

    return (
      <View
        style={{
          minHeight: 300,
          height: 400,
          padding: 20,
          flexDirection: "row"
        }}
      >
        <YAxis
          min={0}
          data={data}
          style={{ marginBottom: xAxisHeight }}
          contentInset={verticalContentInset}
          svg={axesSvg}
          formatLabel={value => `${value}円`}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <LineChart
            yMin={0}
            style={{ flex: 1 }}
            data={data}
            contentInset={verticalContentInset}
            svg={{
              strokeWidth: 2,
              stroke: "url(#gradient)"
            }}
          >
            <Grid />
            <Gradient />
            <HorizontalLine />
          </LineChart>
          <XAxis
            style={{ marginHorizontal: -10, height: xAxisHeight }}
            data={data}
            formatLabel={(value, index) => xaxis_format(index)}
            contentInset={{ left: 10, right: 10 }}
            svg={axesSvg}
          />
        </View>
      </View>
    );
  }
}

export default ExtrasExample;
