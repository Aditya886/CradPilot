import { useEffect } from "react";
import { BackHandler } from "react-native";

export function useBackAction(action: () => boolean | void) {
  useEffect(() => {
    const onBackPress = () => {
      const result = action();
      return result === undefined ? true : result; 
      // return true → blocks system back
      // return false → allows default back behavior
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [action]);
}
