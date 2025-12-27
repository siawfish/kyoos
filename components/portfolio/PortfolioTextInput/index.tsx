import PortfolioMediaUpload from "@/components/portfolio/PortfolioMediaUpload";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectPortfolioFormDescription } from "@/redux/portfolio/selector";
import { actions } from "@/redux/portfolio/slice";
import { useDispatch, useSelector } from "react-redux";
import React, { memo, useCallback, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface PortfolioTextInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  label?: string;
  labelStyle?: TextStyle;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const PortfolioTextInput = memo(
  ({
    style,
    placeholder = "Enter your phone number",
    maxLength,
    containerStyle,
    clearButtonMode = "while-editing",
    label,
    labelStyle,
    multiline = false,
  }: PortfolioTextInputProps) => {
    const dispatch = useDispatch();
    const description = useSelector(selectPortfolioFormDescription);
    const backgroundColor = useThemeColor(
      {
        light: colors.light.white,
        dark: colors.dark.black,
      },
      "background"
    );
    const color = useThemeColor(
      {
        light: colors.light.text,
        dark: colors.dark.text,
      },
      "text"
    );

    const borderColor = useThemeColor(
      {
        light: colors.light.tint,
        dark: colors.dark.tint,
      },
      "text"
    );

    // Animated borderWidth
    const borderWidthAnim = useRef(new Animated.Value(0.3)).current;

    const onFocus = useCallback(() => {
      Animated.timing(borderWidthAnim, {
        toValue: 2,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }, [borderWidthAnim]);

    const onBlur = useCallback(() => {
      Animated.timing(borderWidthAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }, [borderWidthAnim]);

    const handleChangeText = useCallback(
      (text: string) => {
        dispatch(
          actions.setPortfolioFormValue({ key: "description", value: text })
        );
      },
      [dispatch]
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <ThemedText
            type="default"
            lightColor={colors.light.secondary}
            darkColor={colors.dark.secondary}
            style={[styles.label, labelStyle]}
          >
            {label}
          </ThemedText>
        )}
        <AnimatedTextInput
          style={[
            styles.input,
            {
              backgroundColor,
              color,
              borderTopWidth: borderWidthAnim,
              borderBottomWidth: borderWidthAnim,
              borderColor,
            },
            style,
          ]}
          selectionColor={borderColor}
          cursorColor={borderColor}
          placeholder={placeholder}
          maxLength={maxLength}
          clearButtonMode={clearButtonMode}
          multiline={multiline}
          onFocus={onFocus}
          autoFocus
          onBlur={onBlur}
          value={description.value as string}
          onChangeText={handleChangeText}
          autoCorrect={false}
        />
        <PortfolioMediaUpload />
      </View>
    );
  }
);

PortfolioTextInput.displayName = "PortfolioTextInput";

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: widthPixel(8),
    position: "relative",
  },
  input: {
    fontSize: widthPixel(18),
    fontFamily: "Regular",
    padding: widthPixel(16),
    paddingBottom: widthPixel(48),
  },
  label: {
    fontSize: fontPixel(10),
    fontFamily: "SemiBold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginLeft: widthPixel(16),
  },
});

export default PortfolioTextInput;
