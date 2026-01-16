import { StyleSheet, View, Image, Modal, Dimensions, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import success from "@/assets/images/success.png";
import Button from "../Button";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors } from "@/constants/theme/colors";

interface SuccessOverlayProps {
    title?: string;
    text?: string;
    buttonLabel?: string;
    onButtonPress?: () => void;
}

const SuccessOverlay = ({ title, text, buttonLabel, onButtonPress }: SuccessOverlayProps) => {
  const backgroundColor = useThemeColor(
    {
      light: colors.light.background,
      dark: colors.dark.background,
    },
    "background"
  );

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      // Scale animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          damping: 10,
          mass: 1,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 7,
        })
      ]),
      // Rotation animation
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: -0.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0.2,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(rotateAnim, {
          toValue: 0,
          damping: 5,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-30deg', '30deg']
  });

  return (
    <Modal animationType="slide" transparent style={styles.modal} visible>
        <ThemedSafeAreaView style={styles.container}>
            <View style={[styles.contentContainer, {backgroundColor}]}>
                <Animated.View style={{ 
                  transform: [
                    { scale: scaleAnim },
                    { rotate: spin }
                  ] 
                }}>
                    <Image
                        source={success}
                        style={{ width: widthPixel(80), height: widthPixel(80) }}
                    />
                </Animated.View>
                <ThemedText style={styles.title} type='defaultSemiBold'>
                    {title}
                </ThemedText>
                <ThemedText 
                    style={styles.text}
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                >
                    {text}
                </ThemedText>
                <Button 
                    label={buttonLabel}
                    style={styles.btn}
                    onPress={onButtonPress}
                />
            </View>
        </ThemedSafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modal: {
        height: '100%',
    },
    container: { 
        flex: 1,
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: widthPixel(16),
    },
    contentContainer: {
        height: Dimensions.get('window').height / 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: widthPixel(16),
        gap: widthPixel(16),
        paddingHorizontal: widthPixel(16),
    },
    title: {
        fontSize: fontPixel(24),
        textAlign: 'center',
    },
    text: {
        fontSize: fontPixel(16),
        textAlign: 'center',
    },
    btn: {
        marginTop: 'auto',
        position: 'absolute',
        bottom: heightPixel(16),
        left: widthPixel(16),
        right: widthPixel(16),
    },
});

export default SuccessOverlay;
