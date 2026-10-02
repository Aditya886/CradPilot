import { View, Modal, StyleSheet, Animated, FlatList, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useRef } from 'react';
import CustomText from '../components/CustomText';
import CustomButton from '../components/CustomButton';
import { colors } from '../../utils/colors';
import { resAvarage, resHeight, resWidth, scaleSize } from '../../utils/responsive';
import {
    font13,
    font15,
} from '../../utils/fontSizes';
import { t } from '../../language/t';
import CustomImage from '../components/CustomImage';
import { dummy } from '../../utils/AppImages';
import { FontMedium, FontRegular } from '../../utils/fontFamily';
import { profileData } from '../../assets/DefaultData';
import { navigate } from '../../navigation/NavigationUtils';
import { useAppDispatch, useAppSelector } from '../../utils/hooks';
import { resetNavigationState } from '../../redux/silce/AuthSlice';
import { Type } from '../../redux/silce/AuthSelector';

export default function ProfileModal({ show, setShow, onPress }: any) {
    const tranformY = useRef(new Animated.Value(resHeight(100))).current;
    const dispatch = useAppDispatch();
    const coach = useAppSelector(Type)
    const { type } = useAppSelector(state => state.app);

    useEffect(() => {
        if (show) {
            Animated.timing(tranformY, {
                duration: 300,
                useNativeDriver: true,
                toValue: 0,
            }).start();
        } else {
            setShow(false);
        }
    }, [show]);

    const close = () => {
        Animated.timing(tranformY, {
            toValue: resHeight(100),
            duration: 200,
            useNativeDriver: true,
        }).start(() => setShow(false));
    };

    const handleLogout = () => {
        close();
        setTimeout(() => {
            dispatch(resetNavigationState());
        }, 250);
    };

    return (
        <Modal
            transparent
            visible={show}
            animationType="fade"
            onRequestClose={close}>
            <TouchableWithoutFeedback onPress={close}>
                <View style={styles.main}>
                    <Animated.View
                        style={[styles.box, { transform: [{ translateY: tranformY }] }]}>
                        <View style={[styles.row, { justifyContent: "space-between" }]} >
                            <View style={[styles.row, { gap: resAvarage(2) }]}>
                                <CustomImage source={dummy.avatar} resizeMode="cover" style={styles.image} />
                                <View>
                                    <CustomText style={styles.title}>{"John Doe"}</CustomText>
                                    <CustomText style={styles.subtitle}>
                                        {type === 'coach' ? 'Coach' : 'Athlete'}{' '}
                                    </CustomText>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.logoutbox} onPress={handleLogout} activeOpacity={0.7}>
                                <CustomText style={styles.logout}>{"Logout"}</CustomText>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonView}>
                            <View style={styles.line} />
                            <FlatList
                                data={profileData}
                                contentContainerStyle={{ gap: resAvarage(2) }}
                                scrollEnabled={false}
                                renderItem={({ item }: any) => {
                                    const Icon = item.icon
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                if (item?.title === 'My Profile') {
                                                    close();
                                                    setTimeout(() => {
                                                        navigate('Profile');
                                                    }, 250);
                                                } else if (item?.title === 'Support Chat') {
                                                    close();
                                                    setTimeout(() => {
                                                        navigate('SupportChatList');
                                                    }, 250);
                                                }
                                            }}
                                            style={[styles.row, { gap: resAvarage(2), paddingVertical: resAvarage(1) }]}
                                        >
                                            <Icon width={resAvarage(4)} height={resAvarage(4)} />
                                            <CustomText style={styles.option}>{item?.title}</CustomText>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    line: {
        height: scaleSize(1),
        width: resWidth(92),
        backgroundColor: colors.white20,
        marginVertical: resAvarage(2)
    },
    logoutbox: {
        paddingHorizontal: resAvarage(2),
        paddingVertical: resAvarage(1),
        backgroundColor: colors.lightRedBg,
        borderRadius: scaleSize(5)
    },
    logout: {
        color: colors.textRed,
        fontFamily: FontMedium,
        fontSize: font13,
        lineHeight: font13 * 1.3
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    image: {
        width: resAvarage(8),
        height: resAvarage(8),
        borderRadius: resAvarage(100)
    },
    main: {
        flex: 1,
        backgroundColor: '#00000095',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    box: {
        backgroundColor: colors.bgColor,
        borderRadius: resWidth(7),
        width: resWidth(100),
        borderWidth: 1,
        borderColor: "#5D6071",
        borderBottomWidth: 0,
        borderLeftColor: "#5d607185",
        borderTopColor: "#5d607185",
        borderRightColor: "#5d607185",
        paddingVertical: scaleSize(30),
        paddingHorizontal: resAvarage(3),
        overflow: 'hidden',
    },
    option: {
        fontFamily: FontRegular,
        fontSize: font15,
        maxWidth: resWidth(55),
    },
    title: {
        fontFamily: FontMedium,
        fontSize: font13,
        maxWidth: resWidth(55),
    },
    subtitle: {
        fontFamily: FontRegular,
        color: colors.white90,
        fontSize: font13,
        maxWidth: resWidth(55),
        lineHeight: font13 * 1.3
    },
    buttonView: {
    },
});
