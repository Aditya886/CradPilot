import { StyleSheet, View } from "react-native"
import CustomText from "../components/CustomText"
import { t } from "../../language/t"
import { resAvarage, scaleSize } from "../../utils/responsive"
import { colors } from "../../utils/colors"
import { font16 } from "../../utils/fontSizes"
import { FontBold } from "../../utils/fontFamily"
import CommonRippleButton from "../components/CommonRippleButton"

export const SignoutButton = ({ onPress }: any) => {
    return (
        <CommonRippleButton rippleColor={colors.textRed} onPress={onPress} style={styles.main}>
            <CustomText style={styles.text}>{t("profile.a9")}</CustomText>
        </CommonRippleButton>
    )
}

const styles = StyleSheet.create({
    main: {
        padding: resAvarage(3),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.lightRed,
        borderRadius: scaleSize(15),
        overflow: "hidden",
        marginBottom: resAvarage(4)
    },
    text: {
        fontSize: font16,
        fontFamily: FontBold,
        color: colors.textRed
    }
})