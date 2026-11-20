
import React, { useCallback, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Automatically darken bright colors and brighten dark colors
const getPressedColor = (color) => {
    if (typeof color !== "string" || !/^#[0-9a-f]{6}$/i.test(color)) {
        return color;
    }

    const rgb = [1, 3, 5].map((i) =>
        parseInt(color.slice(i, i + 2), 16)
    );

    const brightness =
        rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114;

    const factor = brightness > 110 ? 0.85 : 1.5;

    return (
        "#" +
        rgb
            .map((value) =>
                Math.min(255, Math.round(value * factor))
                    .toString(16)
                    .padStart(2, "0")
            )
            .join("")
    );
};

const SmoothTouchable = ({
    children,
    style,
    backgroundColor,
    pressedColor,
    onPressIn,
    onPressOut,
    ...props
}) => {
    const animation = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            // Reset when returning to this screen
            animation.stopAnimation();
            animation.setValue(0);

            return () => {
                // Reset when leaving this screen
                animation.stopAnimation();
                animation.setValue(0);
            };
        }, [animation])
    );

    // Inherit background color from the existing StyleSheet
    const normalColor =
        backgroundColor ??
        StyleSheet.flatten(style)?.backgroundColor ??
        "#131D31";

    const activeColor =
        pressedColor ??
        (normalColor.toUpperCase() === "#131D31"
            ? "#1E304A"
            : getPressedColor(normalColor));

    const animatedColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [normalColor, activeColor],
    });

    const animate = (value, duration) => {
        Animated.timing(animation, {
            toValue: value,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    return (
        <AnimatedPressable
            {...props}

            onPressIn={(event) => {
                animate(1, 2);
                onPressIn?.(event);
            }}

            onPressOut={(event) => {
                animate(0, 300);
                onPressOut?.(event);
            }}

            style={[style, { backgroundColor: animatedColor }]}
        >
            {children}
        </AnimatedPressable>
    );
};

export default SmoothTouchable;
