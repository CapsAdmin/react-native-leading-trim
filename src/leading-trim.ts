import { PixelRatio, Platform, TextStyle } from "react-native"

// this is a hack to trim the line height of text
// https://medium.com/microsoft-design/leading-trim-the-future-of-digital-typesetting-d082d84b202
// https://css-tricks.com/how-to-tame-line-height-in-css/

type ReverseLineHeightCenteringFunc = (
	fontSize: number,
	baseline: number,
	lineGap: number,
	baseLineMultiplier: number
) => {
	paddingTop: number
	marginTop: number
	marginBottom: number
	lineHeight: number
}

const reverseLineHeightCenteringIOS: ReverseLineHeightCenteringFunc = (
	fontSize,
	baseline,
	lineGap,
	baseLineMultiplier
) => {
	let lineHeight = Math.max(fontSize - baseline + lineGap, 0.0001)
	let lineGapScale = lineGap / fontSize
	let paddingTop = 0
	let marginTop = 0
	let marginBottom = 0

	const magic = fontSize / 18

	paddingTop += magic;
	marginTop -= magic;
	marginBottom -= magic


	if (lineGapScale < 0.45) {
		// not sure if this line jump thing is correct
		// it prevents the
		const lineJumpPrevent = baseLineMultiplier

		let offset = -(lineHeight - (fontSize + (baseline / 2 + lineJumpPrevent)))

		paddingTop += offset
		marginBottom += -offset / 2
		marginTop += -offset
	}

	return { paddingTop, marginTop, marginBottom, lineHeight }
}

const reverseLineHeightCenteringAndroid: ReverseLineHeightCenteringFunc = (
	fontSize,
	baseline,
	lineGap,
	baseLineMultiplier
) => {
	// I think this reverses
	// https://github.com/facebook/react-native/blob/main/ReactAndroid/src/main/java/com/facebook/react/views/text/CustomLineHeightSpan.java
	// but i'm not entirely sure

	// there's a lot of stages to this..

	let lineHeight = Math.max(fontSize - baseline + lineGap, 0.0001)
	let lineGapScale = lineGap / fontSize
	let paddingTop = 0
	let marginTop = 0
	let marginBottom = 0

	// not sure where these constants come from, I tested this on a font of size 50.
	// without these the text will jump a little in the different stages
	// maybe it's something with pixel rounding?
	const A = (1 / 50) * fontSize
	const B = (2 / 50) * fontSize
	const C = (3 / 50) * fontSize

	if (lineGapScale < 0.64) {
		const a = baseline / 2 + A
		const b = lineHeight - fontSize
		paddingTop += a - b + A

		if (lineGapScale < 0.607) {
			const a = baseline * baseLineMultiplier
			const b = lineHeight - fontSize
			marginTop += baseline / 2 - (-b + a - C)
			marginBottom -= (-b + a) / 2 - B

			// below this scale is kind of pointless, but for completeness sake
			// i'd like to avoid the text from being cutoff but I'm not sure how

			if (lineGapScale < -0.5) {
				let f = lineGapScale
				marginTop = -baseline * baseLineMultiplier * 2
				marginBottom = -baseline * 2 * f
				paddingTop = baseline * baseLineMultiplier * 2
				marginBottom -= baseline * baseLineMultiplier * 2 + B

				if (lineGapScale < -0.75) {
					marginTop = -fontSize / baseLineMultiplier - B
					marginBottom = (fontSize / baseLineMultiplier) * -0.5 - B
					paddingTop = fontSize / baseLineMultiplier + B
				}
			}
		}
	}

	return { paddingTop, marginTop, marginBottom, lineHeight }
}

const reverseLineHeightCenteringOther: ReverseLineHeightCenteringFunc = (
	fontSize,
	baseline,
	lineGap,
	baseLineMultiplier
) => {
	let lineHeight = Math.max(fontSize - baseline + lineGap, 0.0001)
	let lineGapScale = lineGap / fontSize

	let paddingTop = 0
	let marginTop = 0
	let marginBottom = 0
	const offset = baseline / 2

	const a = (1 / 200) * 3 * fontSize

	paddingTop = offset
	marginTop = -offset + (a * -1)
	marginBottom = -offset + (a * -2)

	return { paddingTop, marginTop, marginBottom, lineHeight }
}
const reverseLineHeightCentering = Platform.select({
	ios: reverseLineHeightCenteringIOS,
	android: reverseLineHeightCenteringAndroid,
	default: reverseLineHeightCenteringOther,
})

export const buildLeadingTrimStyle = (
	fontSize: number,
	lineGapScale: number,
	baselineOffset: number,
	ascenderOffset?: number
): TextStyle => {
	ascenderOffset = ascenderOffset ?? baselineOffset

	baselineOffset = 50 / (2.625) / baselineOffset
	ascenderOffset = ascenderOffset * ((1 / 50) * fontSize)

	let lineGap = (lineGapScale - 1) * fontSize
	let baseline = fontSize - fontSize / baselineOffset

	let { paddingTop, marginTop, marginBottom, lineHeight } =
		reverseLineHeightCentering(fontSize, baseline, lineGap, baselineOffset)

	marginBottom -= -(baseline / 2) - baseline + lineHeight / 2
	marginTop += -lineHeight + fontSize - marginBottom
	marginTop -= ascenderOffset

	if (__DEV__) {
		if (isNaN(paddingTop) || !isFinite(paddingTop)) {
			paddingTop = 0
		}
		if (isNaN(marginTop) || !isFinite(marginTop)) {
			marginTop = 0
		}
		if (isNaN(marginBottom) || !isFinite(marginBottom)) {
			marginBottom = 0
		}
		if (isNaN(lineHeight) || !isFinite(lineHeight)) {
			lineHeight = 0
		}
	}

	return {
		fontSize,
		lineHeight,
		paddingTop,
		marginTop,
		marginBottom,
		includeFontPadding: false,
	}
}
