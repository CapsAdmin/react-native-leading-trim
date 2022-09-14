import { ReactNode } from "react";
import { Text as RNText, View } from "react-native";
import { buildLeadingTrimStyle } from "./leading-trim";
import { LeadingTrimFont } from "../App";
import capsize from "react-native-capsize";
export const LeadingTrimmedText = (props: {
  size?: number;
  color?: string;

  font: LeadingTrimFont;
  align?: "left" | "center" | "right";
  noWrap?: boolean;

  strategy?: "none" | "capsize" | "custom";
  lineGap?: number;
  baselineOffset?: number;
  ascenderOffset?: number;

  children: ReactNode;
}) => {
  let leadingTrimStyle;
  if (props.strategy == "capsize") {
    leadingTrimStyle = capsize({
      fontSize: props.size,
      fontMetrics: props.font.metrics,
      lineGap: (props.lineGap - 1) * props.size,
    });
  } else if (props.strategy == "custom") {
    leadingTrimStyle = buildLeadingTrimStyle(
      props.size,
      props.lineGap ?? props.font.lineGapScale,
      props.baselineOffset ?? props.font.baselineOffset,
      props.ascenderOffset ?? props.font.ascenderOffset
    );
  } else {
    leadingTrimStyle = {
      fontSize: props.size,
      lineHeight: props.lineGap * props.size,
    };
  }

  return (
    <View pointerEvents="none">
      <RNText
        selectable={false}
        allowFontScaling={false}
        adjustsFontSizeToFit={false}
        numberOfLines={props.noWrap ? 1 : undefined}
        style={[
          {
            fontFamily: props.font.fontFamily,
            color: props.color,
            textAlign: props.align,
          },
          leadingTrimStyle,
        ]}
      >
        {props.children}
      </RNText>
    </View>
  );
};
