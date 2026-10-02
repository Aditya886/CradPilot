import React, { useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Pressable,
    TextInput as RNTextInput
} from 'react-native';

import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../../utils/colors';
import { resAvarage, resWidth } from '../../utils/responsive';
import { FontRegular } from '../../utils/fontFamily';
import { font15 } from '../../utils/fontSizes';

const GradientInput = ({
    value,
    onChangeText,
    placeholder,
    Prefix,
    Suffix,
    style
}: any) => {

    const inputRef = useRef<RNTextInput>(null);

    const handleFocus = () => {
        inputRef.current?.focus();
    };

    return (
        <Pressable
            onPress={handleFocus}
            style={[styles.wrapper, style]}
        >
            {/* Gradient Border */}
            <MaskedView
                style={StyleSheet.absoluteFillObject}
                maskElement={
                    <View style={styles.mask} />
                }
            >
                <LinearGradient
                    colors={[colors.primery, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1 }}
                />
            </MaskedView>

            {/* Content */}
            <View style={styles.container}>
                {Prefix && (
                    <Prefix
                        width={resAvarage(3)}
                        height={resAvarage(3)}
                    />
                )}

                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    style={styles.input}
                />

                {Suffix && (
                    <Suffix
                        width={20}
                        height={20}
                    />
                )}
            </View>
        </Pressable>
    );
};

export default GradientInput;

const styles = StyleSheet.create({
    wrapper: {
        height: resAvarage(9),
        alignItems: 'center',
        marginHorizontal: resWidth(5),
        borderRadius: 100,
        overflow: 'hidden',
        marginTop: resAvarage(4),
    },

    mask: {
        flex: 1,
        borderRadius: 100,
        borderWidth: 1.4,
        borderColor: 'black',
    },

    container: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: resWidth(5),
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    input: {
        flex: 1,
        color: colors.textBlack,
        marginHorizontal: resWidth(3),
        fontFamily: FontRegular,
        fontSize: font15,
        letterSpacing: resWidth(0.1),
    },
});