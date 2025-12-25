import { selectUser } from "@/redux/app/selector";
import { View, Text, StyleSheet, Image } from "react-native";
import numeral from "numeral";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors } from "@/constants/theme/colors";
import { useAppSelector } from "@/store/hooks";

const formatPrice = (price: number) => {
    return numeral(price).format('0,0.00');
};

const PriceTag = ({ price, suffix }: { price: number, suffix?: string }) => {
    const user = useAppSelector(selectUser);
    const currency = user?.settings?.currency || 'GHS';
    const textColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white,
    }, 'text');
    
    return (
        <View style={styles.container}>
            <Image source={require('@/assets/images/price-tag.png')} style={styles.icon} />
            <Text style={[styles.priceText, { color: textColor }]}>{currency} {formatPrice(price)}{suffix}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    icon: {
        width: 16,
        height: 16,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PriceTag;