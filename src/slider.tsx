import React, {
  memo,
  MutableRefObject,
  PureComponent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  I18nManager,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

class LabelContainer extends PureComponent<
  { renderContent: (value: number) => JSX.Element } & ViewProps
> {
  state = {
    value: Number.NaN,
  };

  setValue = (value: number) => {
    this.setState({ value });
  };

  render() {
    const { renderContent, ...restProps } = this.props;
    const { value } = this.state;
    return <View {...restProps}>{renderContent(value)}</View>;
  }
}

const useLabelContainerProps = (floating?: boolean) => {
  const [labelContainerHeight, setLabelContainerHeight] = useState(0);
  const onLayout = useCallback(({ nativeEvent }: LayoutChangeEvent) => {
    const {
      layout: { height },
    } = nativeEvent;
    setLabelContainerHeight(height);
  }, []);

  const top = floating ? -labelContainerHeight : 0;
  const style = floating
    ? ({
        top: top,
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
      } as const)
    : ({
        // NOTE: this seems pointless as it only works with absolute position
        top: top,
        alignItems: I18nManager.isRTL ? "flex-end" : "flex-start",
      } as const);

  return { style, onLayout: onLayout };
};

const useSelectedRail = (
  inPropsRef: RefObject<{
    low: number;
    high: number;
    min: number;
    max: number;
  }>,
  containerWidthRef: any,
  thumbWidth: number,
  disableRange?: boolean
) => {
  const { current: left } = useRef(new Animated.Value(0));
  const { current: right } = useRef(new Animated.Value(0));
  const update = useCallback(() => {
    const { low, high, min, max } = inPropsRef.current!;
    const { current: containerWidth } = containerWidthRef;
    const fullScale = (max - min) / (containerWidth - thumbWidth);
    const leftValue = (low - min) / fullScale;
    const rightValue = (max - high) / fullScale;
    left.setValue(disableRange ? 0 : leftValue);
    right.setValue(
      disableRange ? containerWidth - thumbWidth - leftValue : rightValue
    );
  }, [inPropsRef, containerWidthRef, disableRange, thumbWidth, left, right]);
  const styles = useMemo(
    () =>
      ({
        position: "absolute",
        left: I18nManager.isRTL ? right : left,
        right: I18nManager.isRTL ? left : right,
      } as const),
    [left, right]
  );
  return [styles, update] as const;
};

const useThumbFollower = (
  containerWidthRef: MutableRefObject<number>,
  gestureStateRef: MutableRefObject<{
    lastPosition: number;
    lastValue: number;
  }>,
  renderContent: any,
  isPressed: boolean,
  allowOverflow?: boolean
) => {
  const xRef = useRef(new Animated.Value(0));
  const widthRef = useRef(0);
  const contentContainerRef = useRef<LabelContainer>();

  const { current: x } = xRef;

  const update = useCallback(
    (thumbPositionInView: number, value: number) => {
      const { current: width } = widthRef;
      const { current: containerWidth } = containerWidthRef;
      const position = thumbPositionInView - width / 2;
      xRef.current.setValue(
        allowOverflow ? position : clamp(position, 0, containerWidth - width)
      );
      contentContainerRef.current!.setValue(value);
    },
    [widthRef, containerWidthRef, allowOverflow]
  );

  const handleLayout = useWidthLayout(widthRef, () => {
    update(
      gestureStateRef.current.lastPosition,
      gestureStateRef.current.lastValue
    );
  });

  if (!renderContent) {
    return [];
  }

  const transform = { transform: [{ translateX: x || 0 }] };
  const follower = (
    <Animated.View style={[transform, { opacity: isPressed ? 1 : 0 }]}>
      <LabelContainer
        onLayout={handleLayout}
        ref={contentContainerRef as any}
        renderContent={renderContent}
      />
    </Animated.View>
  );
  return [follower, update] as const;
};

const useWidthLayout = (widthRef: MutableRefObject<number>, callback: any) => {
  return useCallback(
    ({ nativeEvent }: LayoutChangeEvent) => {
      const {
        layout: { width },
      } = nativeEvent;
      const { current: w } = widthRef;
      if (w !== width) {
        widthRef.current = width;
        if (callback) {
          callback(width);
        }
      }
    },
    [callback, widthRef]
  );
};

const useLowHigh = (
  lowProp: number | undefined,
  highProp: number | undefined,
  min: number,
  max: number,
  step: number
) => {
  const validLowProp = lowProp === undefined ? min : clamp(lowProp, min, max);
  const validHighProp =
    highProp === undefined ? max : clamp(highProp, min, max);
  const inPropsRef = useRef<{
    low: number;
    high: number;

    // NOTE: these are initially undefined
    min: number;
    max: number;
    step: number;
  }>({
    low: validLowProp,
    high: validHighProp,

    // NOTE: this was added
    min: 0,
    max: 0,
    step: 0,
  });
  const { low: lowState, high: highState } = inPropsRef.current;
  const inPropsRefPrev = { lowPrev: lowState, highPrev: highState };

  // Props have higher priority.
  // If no props are passed, use internal state variables.
  const low = clamp(lowProp === undefined ? lowState : lowProp, min, max);
  const high = clamp(highProp === undefined ? highState : highProp, min, max);

  // NOTE: direct assignment is better
  // Always update values of refs so pan responder will have updated values
  Object.assign(inPropsRef.current, { low, high, min, max, step });

  const setLow = (value: number) => (inPropsRef.current.low = value);
  const setHigh = (value: number) => (inPropsRef.current.high = value);
  return { inPropsRef, inPropsRefPrev, setLow, setHigh };
};

const isLowCloser = (
  downX: number,
  lowPosition: number,
  highPosition: number
) => {
  if (lowPosition === highPosition) {
    return downX < lowPosition;
  }
  const distanceFromLow = Math.abs(downX - lowPosition);
  const distanceFromHigh = Math.abs(downX - highPosition);
  return distanceFromLow < distanceFromHigh;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getValueForPosition = (
  positionInView: number,
  containerWidth: number,
  thumbWidth: number,
  min: number,
  max: number,
  step: number
) => {
  const availableSpace = containerWidth - thumbWidth;
  const relStepUnit = step / (max - min);
  let relPosition = (positionInView - thumbWidth / 2) / availableSpace;
  const relOffset = relPosition % relStepUnit;
  relPosition -= relOffset;
  if (relOffset / relStepUnit >= 0.5) {
    relPosition += relStepUnit;
  }
  return clamp(min + Math.round(relPosition / relStepUnit) * step, min, max);
};

const trueFunc = () => true;

type RangeSliderProps = {
  min: number;
  max: number;
  step: number;
  low?: number;
  high?: number;
  minRange: number;
  floatingLabel?: boolean;
  disableRange?: boolean;
  disabled?: boolean;
  allowLabelOverflow?: boolean;
  renderThumb: () => JSX.Element;
  renderRail: () => JSX.Element;
  renderRailSelected: () => JSX.Element;
  renderLabel?: (value: number) => JSX.Element;
  renderNotch?: () => JSX.Element;
  onTouchStart?: (low: number, high: number) => void;
  onTouchEnd?: (low: number, high: number) => void;
  onValueChanged?: (low: number, high: number, fromUser: boolean) => void;
  style?: ViewStyle;
} & ViewProps;

const BaseSlider = memo(
  ({
    min,
    max,
    minRange,
    step,
    low: lowProp,
    high: highProp,
    floatingLabel,
    allowLabelOverflow,
    disableRange,
    disabled,
    onValueChanged,
    onTouchStart,
    onTouchEnd,
    renderThumb,
    renderLabel,
    renderNotch,
    renderRail,
    renderRailSelected,
    ...restProps
  }: RangeSliderProps) => {
    // NOTE: I think sometimes low and high are NaN which causes react to crash
    const onChange = (low: number, high: number, fromUser: boolean) => {
      if (onValueChanged) {
        low = low || 0;
        high = high || 0;
        onValueChanged(low, high, fromUser);
      }
    };

    const { inPropsRef, inPropsRefPrev, setLow, setHigh } = useLowHigh(
      lowProp,
      disableRange ? max : highProp,
      min,
      max,
      step
    );
    const lowThumbXRef = useRef(new Animated.Value(0));
    const highThumbXRef = useRef(new Animated.Value(0));
    const pointerX = useRef(new Animated.Value(0)).current;
    const { current: lowThumbX } = lowThumbXRef;
    const { current: highThumbX } = highThumbXRef;

    const gestureStateRef = useRef({
      isLow: true,
      lastValue: 0,
      lastPosition: 0,
    });
    const [isPressed, setPressed] = useState(false);

    const containerWidthRef = useRef(0);
    const [thumbWidth, setThumbWidth] = useState(0);

    const [selectedRailStyle, updateSelectedRail] = useSelectedRail(
      inPropsRef,
      containerWidthRef,
      thumbWidth,
      disableRange
    );

    const updateThumbs = useCallback(() => {
      const { current: containerWidth } = containerWidthRef;
      if (!thumbWidth || !containerWidth) {
        return;
      }
      const { low, high } = inPropsRef.current;
      if (!disableRange) {
        const { current: highThumbX } = highThumbXRef;
        const highPosition =
          ((high - min) / (max - min)) * (containerWidth - thumbWidth);
        highThumbX.setValue(highPosition);
      }
      const { current: lowThumbX } = lowThumbXRef;
      const lowPosition =
        ((low - min) / (max - min)) * (containerWidth - thumbWidth);
      lowThumbX.setValue(lowPosition);
      updateSelectedRail();
      onChange(low, high, false);
    }, [
      disableRange,
      inPropsRef,
      max,
      min,
      onChange,
      thumbWidth,
      updateSelectedRail,
    ]);

    useEffect(() => {
      const { lowPrev, highPrev } = inPropsRefPrev;
      if (
        (lowProp !== undefined && lowProp !== lowPrev) ||
        (highProp !== undefined && highProp !== highPrev)
      ) {
        updateThumbs();
      }

      // NOTE: potential bugs?
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highProp, inPropsRefPrev.lowPrev, inPropsRefPrev.highPrev, lowProp]);

    useEffect(() => {
      updateThumbs();
    }, [updateThumbs]);

    const handleContainerLayout = useWidthLayout(
      containerWidthRef,
      updateThumbs
    );
    const handleThumbLayout = useCallback(
      ({ nativeEvent }: LayoutChangeEvent) => {
        const {
          layout: { width },
        } = nativeEvent;
        if (thumbWidth !== width) {
          setThumbWidth(width);
        }
      },
      [thumbWidth]
    );

    const [labelView, labelUpdate] = useThumbFollower(
      containerWidthRef,
      gestureStateRef,
      renderLabel,
      isPressed,
      allowLabelOverflow
    );
    const [notchView, notchUpdate] = useThumbFollower(
      containerWidthRef,
      gestureStateRef,
      renderNotch,
      isPressed,
      allowLabelOverflow
    );
    const lowThumb = renderThumb();
    const highThumb = renderThumb();

    const labelContainerProps = useLabelContainerProps(floatingLabel);

    const { panHandlers } = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: trueFunc,
          onStartShouldSetPanResponderCapture: trueFunc,
          onMoveShouldSetPanResponder: trueFunc,
          onMoveShouldSetPanResponderCapture: trueFunc,
          onPanResponderTerminationRequest: trueFunc,
          onPanResponderTerminate: trueFunc,
          onShouldBlockNativeResponder: trueFunc,

          onPanResponderGrant: ({ nativeEvent }, gestureState) => {
            if (disabled) {
              return;
            }
            const { numberActiveTouches } = gestureState;
            if (numberActiveTouches > 1) {
              return;
            }
            setPressed(true);
            const { current: lowThumbX } = lowThumbXRef;
            const { current: highThumbX } = highThumbXRef;
            const { locationX: downX, pageX } = nativeEvent;
            const containerX = pageX - downX;

            const { low, high, min, max } = inPropsRef.current;
            onTouchStart?.(low, high);
            const containerWidth = containerWidthRef.current;

            const lowPosition =
              thumbWidth / 2 +
              ((low - min) / (max - min)) * (containerWidth - thumbWidth);
            const highPosition =
              thumbWidth / 2 +
              ((high - min) / (max - min)) * (containerWidth - thumbWidth);

            const isLow =
              disableRange || isLowCloser(downX, lowPosition, highPosition);
            gestureStateRef.current.isLow = isLow;

            const handlePositionChange = (positionInView: number) => {
              const { low, high, min, max, step } = inPropsRef.current;
              const minValue = isLow ? min : low + minRange;
              const maxValue = isLow ? high - minRange : max;
              const value = clamp(
                getValueForPosition(
                  positionInView,
                  containerWidth,
                  thumbWidth,
                  min,
                  max,
                  step
                ),
                minValue,
                maxValue
              );
              if (gestureStateRef.current.lastValue === value) {
                return;
              }
              const availableSpace = containerWidth - thumbWidth;
              const absolutePosition =
                ((value - min) / (max - min)) * availableSpace;
              gestureStateRef.current.lastValue = value;
              gestureStateRef.current.lastPosition =
                absolutePosition + thumbWidth / 2;
              (isLow ? lowThumbX : highThumbX).setValue(absolutePosition);
              onChange(isLow ? value : low, isLow ? high : value, true);
              (isLow ? setLow : setHigh)(value);
              labelUpdate &&
                labelUpdate(gestureStateRef.current.lastPosition, value);
              notchUpdate &&
                notchUpdate(gestureStateRef.current.lastPosition, value);
              updateSelectedRail();
            };
            handlePositionChange(downX);
            pointerX.removeAllListeners();
            pointerX.addListener(({ value: pointerPosition }) => {
              const positionInView = pointerPosition - containerX;
              handlePositionChange(positionInView);
            });
          },

          onPanResponderMove: disabled
            ? undefined
            : Animated.event([null, { moveX: (pointerX as any) || 0 }], {
                useNativeDriver: false,
              }),

          onPanResponderRelease: () => {
            setPressed(false);
            const { low, high } = inPropsRef.current;
            onTouchEnd?.(low, high);
          },
        }),

      // NOTE: potential bugs?
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        pointerX,
        inPropsRef,
        thumbWidth,
        disableRange,
        disabled,
        onChange,
        setLow,
        setHigh,
        labelUpdate,
        notchUpdate,
        updateSelectedRail,
      ]
    );

    return (
      <View {...restProps}>
        <View {...labelContainerProps}>
          {labelView}
          {notchView}
        </View>
        <View
          onLayout={handleContainerLayout}
          style={{
            flexDirection: "row",
            justifyContent: I18nManager.isRTL ? "flex-end" : "flex-start",
            alignItems: "center",
          }}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              flexDirection: "row",
              alignItems: "center",
              marginHorizontal: thumbWidth / 2,
            }}
          >
            {renderRail()}
            <Animated.View style={selectedRailStyle}>
              {renderRailSelected()}
            </Animated.View>
          </View>
          <Animated.View
            style={{ transform: [{ translateX: lowThumbX || 0 }] }}
            onLayout={handleThumbLayout}
          >
            {lowThumb}
          </Animated.View>
          {!disableRange && (
            <Animated.View
              // NOTE: instead of the memoized style, I just pass it directly as it had issues with the types on the style
              style={
                disableRange
                  ? undefined
                  : {
                      position: "absolute",
                      transform: [{ translateX: highThumbX || 0 }],
                    }
              }
            >
              {highThumb}
            </Animated.View>
          )}
          <View
            {...panHandlers}
            style={StyleSheet.absoluteFillObject}
            collapsable={false}
          />
        </View>
      </View>
    );
  }
);

const Label = (props: { text: string }) => {
  return (
    <View
      style={{
        alignItems: "center",
        padding: 2,
        backgroundColor: "#4499ff",
        borderRadius: 4,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          color: "#fff",
        }}
      >
        {props.text}
      </Text>
    </View>
  );
};

const Notch = () => {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#4499ff",
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 8,
      }}
    />
  );
};

const Rail = () => {
  return (
    <View
      style={{
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#7f7f7f",
      }}
    />
  );
};

const RailSelected = () => {
  return (
    <View
      style={{
        height: 4,
        backgroundColor: "#4499ff",
        borderRadius: 2,
      }}
    />
  );
};
const THUMB_RADIUS = 15;
const Thumb = () => {
  return (
    <View
      style={{
        width: THUMB_RADIUS * 2,
        height: THUMB_RADIUS * 2,
        borderRadius: THUMB_RADIUS,
        borderWidth: 2,
        borderColor: "#7f7f7f",
        backgroundColor: "#ffffff",
      }}
    />
  );
};

export const Slider = (props: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  style?: ViewStyle;
}) => {
  // NOTE: api design wise, I think it's better if these were just props you can override where it defaults to these components
  // this is how it's done in most other component libraries
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(
    (value: number) => <Label text={value.toFixed(3)} />,
    []
  );
  const renderNotch = useCallback(() => <Notch />, []);

  return (
    <BaseSlider
      min={props.min}
      max={props.max}
      step={props.step}
      low={props.value}
      // NOTE: not sure about this, if it's default 0 then react native crashes
      minRange={props.step + 0.0001}
      renderThumb={renderThumb}
      renderRail={renderRail}
      renderRailSelected={renderRailSelected}
      //renderLabel={renderLabel}
      renderNotch={renderNotch}
      // NOTE: I'd export 2 different versions of the slider, one with and one without the range
      // instead of having a prop to disable it to make the api more clear
      disableRange={true}
      onValueChanged={props.onChange}
      style={props.style}
    />
  );
};

export const RangeSlider = (props: {
  min: number;
  max: number;
  valueLow: number;
  valueHigh: number;
  step: number;
  onChange: (min: number, max: number) => void;
  style?: ViewStyle;
}) => {
  const renderThumb = useCallback(() => <Thumb />, []);
  const renderRail = useCallback(() => <Rail />, []);
  const renderRailSelected = useCallback(() => <RailSelected />, []);
  const renderLabel = useCallback(
    (value: number) => <Label text={value.toFixed(3)} />,
    []
  );
  const renderNotch = useCallback(() => <Notch />, []);

  return (
    <BaseSlider
      min={props.min}
      max={props.max}
      low={props.valueLow}
      high={props.valueHigh}
      step={props.step}
      // NOTE: not sure about this, if it's default 0 then react native crashes
      minRange={props.step + 0.0001}
      renderThumb={renderThumb}
      renderRail={renderRail}
      renderRailSelected={renderRailSelected}
      renderLabel={renderLabel}
      renderNotch={renderNotch}
      onValueChanged={props.onChange}
      style={props.style}
    />
  );
};
