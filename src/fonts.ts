import { Platform } from "react-native";
import { LeadingTrimFont } from "./leading-trim";

export const HelveticaNeueFont = {
    fontFamily: "Helvetica Neue",
    ascenderOffset: 13.96,
    baselineOffset: 12.5,
    lineGapScale: 1.25,
}

export const RobotoFont = {
    fontFamily: "Roboto",
    ascenderOffset: 11.94,
    baselineOffset: 13.86,
    lineGapScale: 1.25,
}

export const DefaultFont = {
    fontFamily: "normal",
    ascenderOffset: 10.0,
    baselineOffset: 10.0,
    lineGapScale: 1.25,
}

export const SystemFont = Platform.select<LeadingTrimFont>({
    ios: HelveticaNeueFont,
    android: RobotoFont,
    default: DefaultFont
}) 