import { ReactNode } from "react";
import { Text as RNText, View } from "react-native";
import { buildLeadingTrimStyle } from "./leading-trim";
import { LeadingTrimFont } from "../App";

export const LeadingTrimmedText = (props: {
  size?: number;
  color?: string;

  font: LeadingTrimFont;
  align?: "left" | "center" | "right";
  noWrap?: boolean;

  noLeadingTrim?: boolean;
  lineGap?: number;
  baselineOffset?: number;
  ascenderOffset?: number;

  children: ReactNode;
}) => {
  const leadingTrimStyle = props.noLeadingTrim
    ? undefined
    : buildLeadingTrimStyle(
        props.size,
        props.lineGap ?? props.font.lineGapScale,
        props.baselineOffset ?? props.font.baselineOffset,
        props.ascenderOffset ?? props.font.ascenderOffset
      );
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
