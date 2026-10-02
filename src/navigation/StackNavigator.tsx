
import { Login } from "../screens/auth/Login";
import { Signup } from "../screens/auth/Signup";
import { Splash } from "../screens/auth/Splash";
import ForgotPassword from "../screens/auth/ForgotPassword";
import EditProfile from "../screens/main/subScreens/EditProfile";
import { colors } from "../utils/colors";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTab from "./BottomTab";
import Insights from "../screens/main/subScreens/Insights";
import FinanceSection from "../screens/main/subScreens/FinanceSection";
import Calculator from "../screens/main/subScreens/components/Calculator";
import Borrowers from "../screens/main/subScreens/Borrowers";
import User from "../screens/main/subScreens/User";
import LoanDetails from "../screens/main/subScreens/LoanDetails";
import NewLoan from "../screens/main/subScreens/NewLoan";
import AddEntery from "../screens/main/subScreens/AddEntery";
import DebtPersonDetails from "../screens/main/subScreens/DebtPersonDetails";
import PlanTrip from "../screens/main/subScreens/PlanTrip";
import TripDetails from "../screens/main/subScreens/TripDetails";

const Stack = createNativeStackNavigator<any>();

export const StackNavigation = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                animation: 'slide_from_right',
                headerStyle: { backgroundColor: '#f4511e' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                contentStyle: { backgroundColor: colors.bgColor },
            }}>
            <Stack.Screen
                name="Splash"
                component={Splash}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Signup"
                component={Signup}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPassword}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="BottomTab"
                component={BottomTab}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Insights"
                component={Insights}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="FinanceSection"
                component={FinanceSection}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Calculator"
                component={Calculator}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Borrowers"
                component={Borrowers}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="User"
                component={User}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LoanDetails"
                component={LoanDetails}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NewLoan"
                component={NewLoan}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddEntery"
                component={AddEntery}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DebtPersonDetails"
                component={DebtPersonDetails}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PlanTrip"
                component={PlanTrip}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TripDetails"
                component={TripDetails}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};