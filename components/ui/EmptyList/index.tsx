import { StyleSheet, View, Image, ViewStyle } from "react-native";
import React from "react";
import emptyList from "@/assets/images/empty.png";
import { fontPixel, widthPixel } from "@/constants/normalize";
import { ThemedText } from "../Themed/ThemedText";

const EmptyList = ({
    message="No items found",
    children,
    containerStyle
}: {
    readonly message?: string;
    readonly children?: React.ReactNode;
    readonly containerStyle?: ViewStyle;
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <Image source={emptyList} style={styles.icon} />
            <ThemedText style={styles.message} type="subtitle">{message}</ThemedText>
            {children}
        </View>
    );
};

export default EmptyList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  icon: {
    width: widthPixel(50),
    height: widthPixel(50),
  },
  message: {
    textAlign: "center",
    fontSize: fontPixel(14),
  }
});

