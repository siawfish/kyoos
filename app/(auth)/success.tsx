import success from "@/assets/images/success.png";
import Button from "@/components/ui/Button";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { actions } from "@/redux/auth/slice";
import { useAppDispatch } from "@/store/hooks";
import React from "react";
import { Dimensions, Image, Modal, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

const Success = () => {
    const dispatch = useAppDispatch();
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';

    const backgroundColor = isDark ? colors.dark.background : colors.light.background;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const borderColor = isDark ? colors.dark.white : colors.light.black;

    return (
        <Modal animationType="slide" transparent style={styles.modal} visible>
            <View style={styles.container}>
                <View style={[styles.contentContainer, { backgroundColor, borderColor }]}>
                    <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                    <View style={styles.inner}>
                        <Text style={[styles.label, { color: subtitleColor }]}>
                            SUCCESS
                        </Text>
                    <Image
                        source={success}
                            style={styles.icon}
                    />
                        <Text style={[styles.title, { color: textColor }]}>
                            Account Created
                        </Text>
                        <Text style={[styles.text, { color: subtitleColor }]}>
                            An email has been sent to your email address. Please verify to activate your account.
                        </Text>
                    </View>
                    <Button 
                        label='Go to Dashboard'
                        style={styles.btn}
                        onPress={() => dispatch(actions.confirmLogin())}
                    />
                </View>
            </View>
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
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: widthPixel(20),
    },
  contentContainer: {
    height: Dimensions.get('window').height / 2,
    width: '100%',
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(4),
        width: '100%',
    },
    inner: {
        flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
        padding: widthPixel(24),
    },
    label: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(20),
    },
    icon: {
        width: widthPixel(64),
        height: widthPixel(64),
        marginBottom: heightPixel(24),
  },
  title: {
        fontSize: fontPixel(28),
        fontFamily: 'Bold',
    textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: heightPixel(12),
  },
  text: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    textAlign: 'center',
        lineHeight: fontPixel(20),
    },
    btn: {
        position: 'absolute',
        bottom: heightPixel(20),
        left: widthPixel(20),
        right: widthPixel(20),
        marginHorizontal: 0,
    },
});

export default Success;
