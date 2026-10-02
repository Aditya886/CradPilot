import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { resAvarage } from '../../utils/responsive';
import { colors } from '../../utils/colors';

const RadioButton = ({ selected, onPress, color }: any) => {
    const size = resAvarage(3);
    const innerSize = size / 2;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <View
                style={[
                    styles.outer,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                    selected && {
                        backgroundColor: color ? color : colors.textBlue,
                        borderColor: color ? color : colors.textBlue
                    }
                ]}
            >
                {selected && (
                    <LinearGradient
                        colors={[colors.white, colors.white]} // 👉 change gradient colors here
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            width: innerSize,
                            height: innerSize,
                            borderRadius: innerSize / 2,
                        }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    outer: {
        borderWidth: 1.5,
        borderColor: colors.white40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default RadioButton;
