/* eslint-disable react-hooks/rules-of-hooks */
import React, { ReactNode, useState } from "react";
import {
  Dimensions,
  PixelRatio,
  Text as RNText,
  View,
  ViewStyle,
} from "react-native";
import { Slider } from "./slider";
import { LeadingTrimmedText } from "./text";
import { SystemFont } from "./fonts";
import type { LeadingTrimFont } from "./leading-trim";

const Column = (props: { children: ReactNode; style?: ViewStyle }) => (
  <View style={{ flexDirection: "column", ...props.style }}>
    {props.children}
  </View>
);

const Row = (props: { children: ReactNode; style?: ViewStyle }) => (
  <View style={{ flexDirection: "row", ...props.style }}>{props.children}</View>
);

const BaselinePreview = (props: { fontFamily: string }) => {
  const [baseLine, setBaseLine] = useState(0);

  const SIZE = 30;
  return (
    <Column>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
        }}
      >
        <RNText
          allowFontScaling={false}
          adjustsFontSizeToFit={false}
          style={{
            fontFamily: props.fontFamily,
            fontSize: SIZE,
            lineHeight: SIZE,
            color: "white",
            backgroundColor: "black",
            includeFontPadding: false,
          }}
        >
          gyjq Q buik
        </RNText>
        <RNText
          allowFontScaling={false}
          adjustsFontSizeToFit={false}
          onLayout={(e) => {
            setBaseLine(e.nativeEvent.layout.y);
          }}
          style={{
            transform: [{ scaleX: 100 }],
            zIndex: 2,
            fontFamily: props.fontFamily,
            fontSize: SIZE,
            lineHeight: 0.1,
            color: "red",
            backgroundColor: "red",
            includeFontPadding: false,
          }}
        >
          gyjq Q buik
        </RNText>
      </View>
      <RNText style={{ color: "white" }}>
        baseline for size ({SIZE}px / pixelratio) is close to{" "}
        {baseLine / PixelRatio.get()}
      </RNText>
    </Column>
  );
};

const TextBoundsContainer = (props: { children: ReactNode }) => {
  const lineSize = 1 / PixelRatio.get();

  return (
    <View style={{ position: "relative", marginBottom: 40 }}>
      <View
        style={{
          position: "absolute",
          top: "50%",
          height: lineSize,
          width: "100%",
          backgroundColor: "red",
          zIndex: 1,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          height: lineSize,
          width: "100%",
          backgroundColor: "red",
          zIndex: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          height: lineSize,
          width: "100%",
          backgroundColor: "red",
          zIndex: 1,
        }}
      />
      {props.children}
    </View>
  );
};

export const LeadingTrimEditor = (props: { font: LeadingTrimFont }) => {
  const font = props.font;
  const [size, setSize] = useState(20);

  const [lineGapScale, setLineGapScale] = useState(font.lineGapScale);
  const [baselineOffset, setBaselineOffset] = useState(font.baselineOffset);
  const [ascenderOffset, setAscenderOffset] = useState(
    font.ascenderOffset || font.baselineOffset
  );

  return (
    <Column style={{ backgroundColor: "rgba(0, 0, 0, 1)", padding: 10 }}>
      <LeadingTrimmedText font={font} color="white" size={50}>
        {font.fontFamily}
      </LeadingTrimmedText>
      <BaselinePreview fontFamily={font.fontFamily!} />
      <Column>
        <LeadingTrimmedText font={SystemFont} color="~white" size={20}>
          size: {size}
        </LeadingTrimmedText>

        <Slider
          min={0}
          max={100}
          step={1}
          value={size}
          onChange={(num) => {
            setSize(num);
          }}
        />
      </Column>

      <Column>
        <LeadingTrimmedText font={SystemFont} color="white" size={20}>
          line gap scale: {lineGapScale.toFixed(4)}
        </LeadingTrimmedText>

        <Slider
          min={0}
          max={2}
          step={0.001}
          value={lineGapScale}
          onChange={(num) => {
            setLineGapScale(num);
          }}
        />
      </Column>

      <Column>
        <LeadingTrimmedText font={SystemFont} color="white" size={20}>
          ascender offset: {ascenderOffset.toFixed(4)}
        </LeadingTrimmedText>

        <Slider
          min={0}
          max={30}
          step={0.01}
          value={ascenderOffset}
          onChange={(num) => {
            setAscenderOffset(num);
          }}
        />
      </Column>

      <Column>
        <LeadingTrimmedText font={SystemFont} color="white" size={20}>
          baseline offset: {baselineOffset.toFixed(4)}
        </LeadingTrimmedText>

        <Slider
          min={0}
          max={30}
          step={0.01}
          value={baselineOffset}
          onChange={(num) => {
            setBaselineOffset(num);
          }}
        />
      </Column>

      <Row
        style={{
          flexWrap: "wrap",
          justifyContent: "center",
          marginBottom: -30,
        }}
      >
        <TextBoundsContainer>
          <LeadingTrimmedText
            align="center"
            size={size}
            baselineOffset={baselineOffset}
            ascenderOffset={ascenderOffset}
            lineGap={lineGapScale}
            font={props.font}
            color="white"
          >
            gyjq
          </LeadingTrimmedText>
        </TextBoundsContainer>
        <TextBoundsContainer>
          <LeadingTrimmedText
            align="center"
            size={size}
            baselineOffset={baselineOffset}
            ascenderOffset={ascenderOffset}
            lineGap={lineGapScale}
            font={props.font}
            color="white"
          >
            Q
          </LeadingTrimmedText>
        </TextBoundsContainer>
        <TextBoundsContainer>
          <LeadingTrimmedText
            align="center"
            size={size}
            baselineOffset={baselineOffset}
            ascenderOffset={ascenderOffset}
            lineGap={lineGapScale}
            font={props.font}
            color="white"
          >
            buik
          </LeadingTrimmedText>
        </TextBoundsContainer>
      </Row>
      <View style={{ backgroundColor: "rgba(255, 0,0,1)" }}>
        <LeadingTrimmedText
          size={size}
          baselineOffset={baselineOffset}
          ascenderOffset={ascenderOffset}
          lineGap={lineGapScale}
          color="white"
          font={SystemFont}
        >
          {"b".repeat(
            Math.min(
              Math.max(((Dimensions.get("screen").width * 2) / size) * 2, 1),
              1000
            )
          )}
        </LeadingTrimmedText>
      </View>
    </Column>
  );
};
