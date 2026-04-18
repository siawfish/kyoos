import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, {
    createElement,
    forwardRef,
    useMemo,
    type ComponentType,
    type ReactNode,
} from 'react';
import { StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

export type SmartTextAreaDensity = 'search' | 'searchSimple' | 'compact' | 'sheet' | 'composer';

export interface SmartTextAreaProps extends Omit<TextInputProps, 'multiline'> {
    variant?: 'framed' | 'unframed';
    density?: SmartTextAreaDensity;
    minHeight?: number;
    maxHeight?: number;
    header?: ReactNode;
    footer?: ReactNode;
    /** Use inside @gorhom/bottom-sheet for correct keyboard handling */
    inputComponent?: ComponentType<TextInputProps>;
    borderColor?: string;
    tintColor?: string;
    textColor?: string;
    placeholderTextColor?: string;
    selectionColor?: string;
    /** Outer wrapper (framed: full row including accent) */
    containerStyle?: ViewStyle;
    /** Extra style on the framed border box (not the accent) */
    frameStyle?: ViewStyle;
}

function densityPreset(density: SmartTextAreaDensity) {
    switch (density) {
        case 'searchSimple':
            return {
                min: heightPixel(90),
                max: heightPixel(130),
                paddingTop: heightPixel(14),
                paddingBottom: heightPixel(12),
                paddingHorizontal: widthPixel(16),
                fontSize: fontPixel(16),
                lineHeight: fontPixel(24),
            };
        case 'compact':
            return {
                min: heightPixel(52),
                max: heightPixel(200),
                paddingTop: heightPixel(14),
                paddingBottom: heightPixel(14),
                paddingHorizontal: widthPixel(16),
                fontSize: fontPixel(16),
                lineHeight: fontPixel(24),
            };
        case 'sheet':
            return {
                min: heightPixel(140),
                max: heightPixel(320),
                paddingTop: heightPixel(12),
                paddingBottom: heightPixel(12),
                paddingHorizontal: widthPixel(16),
                fontSize: fontPixel(16),
                lineHeight: fontPixel(24),
            };
        case 'composer':
            return {
                min: heightPixel(24),
                max: heightPixel(100),
                paddingTop: 0,
                paddingBottom: 0,
                paddingHorizontal: 0,
                fontSize: fontPixel(15),
                lineHeight: fontPixel(20),
            };
        case 'search':
        default:
            return {
                min: heightPixel(100),
                max: heightPixel(140),
                paddingTop: 0,
                paddingBottom: heightPixel(12),
                paddingHorizontal: widthPixel(16),
                fontSize: fontPixel(16),
                lineHeight: fontPixel(24),
            };
    }
}

const SmartTextArea = forwardRef<TextInput, SmartTextAreaProps>(function SmartTextArea(
    {
        variant = 'framed',
        density = 'search',
        minHeight: minHeightProp,
        maxHeight: maxHeightProp,
        header,
        footer,
        inputComponent: InputComponent = TextInput,
        borderColor: borderColorOverride,
        tintColor: tintColorOverride,
        textColor: textColorOverride,
        placeholderTextColor: placeholderTextColorOverride,
        selectionColor: selectionColorOverride,
        containerStyle,
        frameStyle,
        style,
        value,
        onContentSizeChange,
        textAlignVertical = 'top',
        ...rest
    },
    ref
) {
    const preset = useMemo(() => densityPreset(density), [density]);
    const minH = minHeightProp ?? preset.min;
    const maxH = maxHeightProp ?? preset.max;

    const defaultBorder = useThemeColor(
        { light: colors.light.grey, dark: colors.dark.grey },
        'grey'
    );
    const defaultTint = useThemeColor(
        { light: colors.light.tint, dark: colors.dark.tint },
        'tint'
    );
    const defaultText = useThemeColor(
        { light: colors.light.text, dark: colors.dark.text },
        'text'
    );
    const defaultSecondary = useThemeColor(
        { light: colors.light.secondary, dark: colors.dark.secondary },
        'secondary'
    );

    const borderColor = borderColorOverride ?? defaultBorder;
    const tintColor = tintColorOverride ?? defaultTint;
    const textColor = textColorOverride ?? defaultText;
    const selectionColor = selectionColorOverride ?? tintColor;
    const placeholderTextColor =
        placeholderTextColorOverride ?? `${defaultSecondary}80`;

    const inputStyle = useMemo(
        () => [
            styles.fieldBase,
            {
                minHeight: minH,
                maxHeight: maxH,
                paddingHorizontal: preset.paddingHorizontal,
                paddingTop: preset.paddingTop,
                paddingBottom: preset.paddingBottom,
                fontSize: preset.fontSize,
                lineHeight: preset.lineHeight,
                color: textColor,
            },
            style,
        ],
        [
            minH,
            maxH,
            preset.paddingHorizontal,
            preset.paddingTop,
            preset.paddingBottom,
            preset.fontSize,
            preset.lineHeight,
            textColor,
            style,
        ]
    );

    const inputProps = {
        ...rest,
        ref,
        multiline: true as const,
        value,
        textAlignVertical,
        placeholderTextColor,
        selectionColor,
        scrollEnabled: true,
        onContentSizeChange,
        style: inputStyle,
    };
    const inputEl = createElement(InputComponent, inputProps as TextInputProps);

    if (variant === 'unframed') {
        return inputEl;
    }

    return (
        <View style={[styles.inputWrapper, { borderColor }, containerStyle]}>
            <View style={[styles.inputAccent, { backgroundColor: tintColor }]} />
            <View style={[styles.inputInner, frameStyle]}>
                {header}
                {inputEl}
                {footer}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        marginBottom: heightPixel(24),
    },
    inputAccent: {
        width: widthPixel(4),
    },
    inputInner: {
        flex: 1,
        minWidth: 0,
    },
    fieldBase: {
        fontFamily: 'Regular',
    },
});

export default SmartTextArea;
