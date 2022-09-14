/* eslint-disable react-hooks/rules-of-hooks */
import React, { ReactNode, useState } from "react";
import {
  Dimensions,
  PixelRatio,
  Text as Text,
  View,
  ViewStyle,
} from "react-native";
import { Slider } from "./slider";
import { LeadingTrimmedText } from "./text";
import type { LeadingTrimFont } from "../App";

const Column = (props: { children: ReactNode; style?: ViewStyle }) => (
  <View style={{ flexDirection: "column", padding: 5, ...props.style }}>
    {props.children}
  </View>
);

const Row = (props: { children: ReactNode; style?: ViewStyle }) => (
  <View style={{ flexDirection: "row", padding: 5, ...props.style }}>
    {props.children}
  </View>
);

const Label = (props: {
  font?: string;
  size?: number;
  children: ReactNode;
}) => (
  <Text
    selectable={false}
    style={{
      fontFamily: props.font,
      fontSize: props.size || 20,
      color: "white",
    }}
  >
    {props.children}
  </Text>
);

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
  const [size, setSize] = useState(50);

  const [lineGapScale, setLineGapScale] = useState(font.lineGapScale);
  const [baselineOffset, setBaselineOffset] = useState(font.baselineOffset);
  const [ascenderOffset, setAscenderOffset] = useState(
    font.ascenderOffset || font.baselineOffset
  );

  return (
    <Column style={{ backgroundColor: "black", padding: 20 }}>
      <Label font={font.fontFamily} size={50}>
        {" "}
        {font.fontFamily}
      </Label>
      <Column>
        <Label font={font.fontFamily}> size: {size}</Label>

        <Slider
          min={0}
          max={200}
          step={1}
          value={size}
          onChange={(num) => {
            setSize(num);
          }}
        />
      </Column>

      <Column>
        <Label font={font.fontFamily}>
          line gap scale: {lineGapScale.toFixed(4)}
        </Label>

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
        <Label font={font.fontFamily}>
          ascender offset: {ascenderOffset.toFixed(4)}
        </Label>

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
        <Label font={font.fontFamily}>
          baseline offset: {baselineOffset.toFixed(4)}
        </Label>

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
            noWrap
            size={size}
            baselineOffset={baselineOffset}
            ascenderOffset={ascenderOffset}
            lineGap={lineGapScale}
            font={font}
            color="white"
          >
            gyjq
          </LeadingTrimmedText>
        </TextBoundsContainer>
        <View style={{ width: size / 2 }}></View>
        <TextBoundsContainer>
          <LeadingTrimmedText
            noWrap
            align="center"
            size={size}
            baselineOffset={baselineOffset}
            ascenderOffset={ascenderOffset}
            lineGap={lineGapScale}
            font={font}
            color="white"
          >
            Q
          </LeadingTrimmedText>
        </TextBoundsContainer>
        <View style={{ width: size / 2 }}></View>
        <TextBoundsContainer>
          <LeadingTrimmedText
            noWrap
            align="center"
            size={size}
            baselineOffset={baselineOffset}
            ascenderOffset={ascenderOffset}
            lineGap={lineGapScale}
            font={font}
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
          font={font}
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
