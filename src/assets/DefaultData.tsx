import BankIcon from "./images/icons/bank.svg"
import CardIcon from "./images/icons/card.svg"
import CashIcon from "./images/icons/wallet.svg"
import UpiIcon from "./images/icons/upi.svg"
import Bills from "./images/icons/bill.svg"
import Loan from "./images/icons/loan.svg"
import Budget from "./images/icons/budget.svg"
import Terms from "./images/icons/terms.svg"
import Policy from "./images/icons/policy.svg"
import About from "./images/icons/about.svg"
import Finance from "./images/icons/finance.svg"

export const ACCOUNT_TYPES = [
    {
        id: 'bank',
        title: 'Bank',
        icon: BankIcon,
    },
    {
        id: 'upi',
        title: 'UPI',
        icon: UpiIcon,
    },
    {
        id: 'card',
        title: 'Card',
        icon: CardIcon,
    },
    {
        id: 'cash',
        title: 'Wallet',
        icon: CashIcon,
    },
];

export const PersonList = [
    {
        id: 1,
        name: "All"
    },
    {
        id: 2,
        name: "You'll receive"
    },
    {
        id: 3,
        name: "You owe"
    },
    {
        id: 4,
        name: "Settled"
    },
    {
        id: 5,
        name: "Recent"
    },
]
export const ActivityList = [
    {
        id: 1,
        name: "All"
    },
    {
        id: 2,
        name: "You'll receive"
    },
    {
        id: 3,
        name: "You owe"
    },
    {
        id: 4,
        name: "Settled"
    },
]

export const MoreFeatureList = [
    {
        id: 1,
        title: "Savings & Goals",
        subtitle: "Track your saving and goals",
        icon: Bills
    },
    {
        id: 2,
        title: "Home Banking",
        subtitle: "Manage accounts and recent activities",
        icon: BankIcon
    },
    {
        id: 3,
        title: "EMI & Loans",
        subtitle: "All you emi and loans",
        icon: Loan
    },
    {
        id: 4,
        title: "Plans & Trips",
        subtitle: "Track all your plans and trips",
        icon: Budget
    },
]
export const aboutList = [
    {
        id: 1,
        title: "Terms & conditions",
        icon: Terms
    },
    {
        id: 2,
        title: "Privacy Policy",
        icon: Policy
    },
    {
        id: 3,
        title: "About CredPilot",
        subtitle: "Version 1.0.1",
        icon: About
    },
]

export const dates = [
    {
        id: 1,
        name: "Today"
    },
    {
        id: 2,
        name: "Yesterday"
    },
    {
        id: 3,
        name: "This week"
    },
    {
        id: 4,
        name: "This month"
    }
]