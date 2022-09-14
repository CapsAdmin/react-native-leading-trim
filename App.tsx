import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LeadingTrimEditor } from "./src/editor";
import { useFonts } from "expo-font";
import React from "react";

export type LeadingTrimFont = {
  fontFamily: string;
  resource: string;
  ascenderOffset: number;
  baselineOffset: number;
  lineGapScale: number;
};

const fonts: LeadingTrimFont[] = [
  {
    fontFamily: "Nunito-Black",
    resource: require("./assets/fonts/Nunito-Black.ttf"),
    ascenderOffset: 18.31,
    baselineOffset: 16.62,
    lineGapScale: 1.25,
  },
  {
    fontFamily: "Nunito-Light",
    resource: require("./assets/fonts/Nunito-Light.ttf"),
    ascenderOffset: 19.01,
    baselineOffset: 16.83,
    lineGapScale: 1.25,
  },
  {
    fontFamily: "Roboto-Regular",
    resource: require("./assets/fonts/Roboto-Regular.ttf"),
    ascenderOffset: 12.25,
    baselineOffset: 13.95,
    lineGapScale: 1.25,
  },
  {
    fontFamily: "Roboto-Thin",
    resource: require("./assets/fonts/Roboto-Thin.ttf"),
    ascenderOffset: 12.25,
    baselineOffset: 13.95,
    lineGapScale: 1.25,
  },
  {
    fontFamily: "Roboto-Black",
    resource: require("./assets/fonts/Roboto-Black.ttf"),
    ascenderOffset: 12.25,
    baselineOffset: 13.95,
    lineGapScale: 1.25,
  },
  {
    fontFamily: "Tangerine-Regular",
    resource: require("./assets/fonts/Tangerine-Regular.ttf"),
    ascenderOffset: 11.169,
    baselineOffset: 15.93,
    lineGapScale: 1.25,
  },
];

let toLoad = {};
for (const font of fonts) {
  toLoad[font.fontFamily] = font.resource;
}

export default function App() {
  const [fontsLoaded] = useFonts(toLoad);

  if (!fontsLoaded) {
    return <Text>loading fonts...</Text>;
  }

  return (
    <ScrollView>
      {fonts.map((font) => (
        <React.Fragment key={font.fontFamily}>
          <LeadingTrimEditor font={font}></LeadingTrimEditor>
          <View style={{ height: 30 }}></View>
        </React.Fragment>
      ))}
    </ScrollView>
  );
}
