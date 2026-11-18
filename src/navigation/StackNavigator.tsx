
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
import TutionSection from "../screens/main/subScreens/tution/TutionSection";
import Students from "../screens/main/subScreens/tution/Students";
import StudentDetails from "../screens/main/subScreens/tution/StudentDetails";
import PendingFees from "../screens/main/subScreens/tution/PendingFees";
import Attendance from "../screens/main/subScreens/tution/Attendance";
import Batch from "../screens/main/subScreens/tution/Batch";
import AddStudent from "../screens/main/subScreens/tution/AddStudent";
import WebViewScreen from "../screens/main/subScreens/WebViewScreen";
import Debts from "../screens/main/bottomTabs/Debts";
import SavingAndGoalsScreen from "../screens/main/subScreens/savingAndGoals/SavingAndGoalsScreen";
import EmiLoansScreen from "../screens/main/subScreens/emiLoans/EmiLoansScreen";
import EmiLoanDetailScreen from "../screens/main/subScreens/emiLoans/EmiLoanDetailScreen";

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
            <Stack.Screen
                name="Debts"
                component={Debts}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TutionSection"
                component={TutionSection}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Students"
                component={Students}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="StudentDetails"
                component={StudentDetails}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PendingFees"
                component={PendingFees}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Attendance"
                component={Attendance}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Batch"
                component={Batch}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddStudent"
                component={AddStudent}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SavingAndGoals"
                component={SavingAndGoalsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SavingsGoals"
                component={SavingAndGoalsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EmiLoans"
                component={EmiLoansScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EmiLoanDetail"
                component={EmiLoanDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="WebViewScreen"
                component={WebViewScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PrivacyPolicy"
                component={(props: any) => (
                    <WebViewScreen
                        {...props}
                        route={{
                            ...props.route,
                            params: {
                                title: "Privacy Policy",
                                subtitle: "Legal & Data Policy",
                                url: "https://credpilot.vercel.app/#/privacy",
                                ...props.route?.params,
                            },
                        }}
                    />
                )}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TermsAndConditions"
                component={(props: any) => (
                    <WebViewScreen
                        {...props}
                        route={{
                            ...props.route,
                            params: {
                                title: "Terms & Conditions",
                                subtitle: "Agreement & Rules",
                                url: "https://credpilot.vercel.app/#/terms",
                                ...props.route?.params,
                            },
                        }}
                    />
                )}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};