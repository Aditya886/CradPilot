import { Platform, View } from "react-native"
import { colors } from "../../utils/colors"
import { resAvarage } from "../../utils/responsive"

export const CommonBg = ({ children, style }: any) => {
    return (
        <View style={[{
            flex: 1,
            backgroundColor: colors.bgColor,
            paddingTop: Platform.OS === "ios" ? resAvarage(10) : Platform.Version > "34" ? resAvarage(9) : resAvarage(8)
        }, style]}
        >
            {children}
        </View>
    )
}