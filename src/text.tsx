import { ReactNode } from "react";
import { Text as RNText } from "react-native";
import { buildLeadingTrimStyle } from "./leading-trim";
import { LeadingTrimFont } from "./leading-trim";

export const LeadingTrimmedText = (props: {
  size?: number;
  color?: string;

  font: LeadingTrimFont;
  align?: "left" | "center" | "right";

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
    <RNText
      allowFontScaling={false}
      adjustsFontSizeToFit={false}
      style={[
        {
          color: props.color,
          textAlign: props.align,
        },
        leadingTrimStyle,
      ]}
    >
      {props.children}
    </RNText>
  );
};
