import { StyleSheet, TouchableOpacity, View } from "react-native"
import BlackBack from "../../../assets/images/icons/blackBack.svg"
import { goBack } from "../../../navigation/NavigationUtils"
import { resAvarage, resWidth } from "../../../utils/responsive"
import CustomText from "../../../ui/components/CustomText"
import { FontHBold, FontRegular } from "../../../utils/fontFamily"
import { font15, font42 } from "../../../utils/fontSizes"
import { colors } from "../../../utils/colors"

export const CommonHead = ({ title, subtitle, back = true }: any) => {
    return (
        <View style={styles.main} >
            {back ? <TouchableOpacity onPress={() => goBack()} style={{ padding: resAvarage(1), paddingLeft: 0 }}>
                <BlackBack width={resAvarage(8)} height={resAvarage(8)} />
            </TouchableOpacity> : null}
            <View>
                <CustomText variant="hero" style={styles.title} >{title}</CustomText>
                <CustomText variant="slidedec" style={styles.subtitle} >{subtitle}</CustomText>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        paddingTop: resAvarage(8),
        paddingBottom: resAvarage(4)
        // flex: 1,
    },
    title: {
        color: colors.textBlack,
        lineHeight: font42 * 1.4,
        marginBottom: resAvarage(2)
    },
    subtitle: {
        width: resWidth(75),
        letterSpacing: resWidth(0.1)
    },
})
