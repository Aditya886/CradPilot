import Bank from "../images/icons/bank.svg"
import Upi from "../images/icons/upi.svg"
import Food from "../images/icons/food.svg"
import Settle from "../images/icons/settle.svg"
import Loan from "../images/icons/loan.svg"
import BlackIn from "../images/icons/blackin.svg"
import BlackOut from "../images/icons/blackout.svg"


export const InsightAccountTypes = [
    {
        id: 'Income',
        value: 523235,
        per: 75,
        type: "increment"
    },
    {
        id: 'Expenses',
        value: 23413,
        per: 16,
        type: "decrement"
    },
    {
        id: 'Net savings',
        value: 233413,
        per: 55,
        type: "increment"
    },
    {
        id: 'Spend rate',
        value: 7,
        per: 33,
        type: "increment"
    },
];

export const personData = [
    {
        id: 1,
        name: "Aman",
        amount: 3245,
        icon: Settle,
        remain: 0,
        bankName: "HDFC",
        lastUpdate: "1 day ago",
        createdAt: "2026-01-01T00:00:00.000Z",
        type: "done",
        data: [
            {
                id: 1,
                name: "You Receive",
                PaymentMode: "Bank",
                amount: 1000,
                bankName: "HDFC",
                lastUpdate: "1 day ago",
                type: "incoming",
            },
            {
                id: 2,
                name: "You Receive",
                PaymentMode: "Upi",
                amount: 1245,
                lastUpdate: "10 day ago",
                type: "incoming",
            },
            {
                id: 3,
                name: "You Receive",
                PaymentMode: "Cash",
                amount: 1000,
                lastUpdate: "1 month ago",
                type: "incoming",
            },
            {
                id: 3,
                name: "You Lent",
                PaymentMode: "Cash",
                amount: 1000,
                lastUpdate: "1 month ago",
                type: "outgoing",
            },

        ]
    },
    {
        id: 2,
        title: "You Borrowed",
        name: "Ravi",
        PaymentMode: "Upi",
        amount: 13245,
        remain: 13245,
        icon: BlackIn,
        lastUpdate: "2 days ago",
        createdAt: "2026-02-01T00:00:00.000Z",
        type: "incoming",
        data: [
            {
                id: 1,
                name: "You Borrowed",
                PaymentMode: "Bank",
                amount: 1000,
                bankName: "HDFC",
                lastUpdate: "1 day ago",
                type: "incoming",
            },
        ]
    },
    {
        id: 3,
        title: "You Lent",
        name: "Riya",
        PaymentMode: "Cash",
        amount: 33245,
        remain: 31000,
        icon: BlackOut,
        createdAt: "2026-03-01T00:00:00.000Z",
        bankName: "ICICI",
        lastUpdate: "3 days ago",
        type: "outgoing",
        data: [
            {
                id: 1,
                name: "You Receive",
                PaymentMode: "Bank",
                amount: 1000,
                bankName: "HDFC",
                lastUpdate: "1 day ago",
                type: "incoming",
            },
            {
                id: 2,
                name: "You Receive",
                PaymentMode: "Upi",
                amount: 1245,
                lastUpdate: "10 day ago",
                type: "incoming",
            },
            {
                id: 3,
                name: "You Lent",
                PaymentMode: "Cash",
                amount: 30000,
                lastUpdate: "1 month ago",
                type: "outgoing",
            },
            {
                id: 4,
                name: "You Lent",
                PaymentMode: "Cash",
                amount: 3245,
                lastUpdate: "5 month ago",
                type: "outgoing",
            },

        ]
    },
    {
        id: 4,
        title: "You Lent",
        name: "Priya",
        PaymentMode: "Upi",
        amount: 55345,
        remain: 12035,
        createdAt: "2024-04-013T00:00:00.000Z",
        icon: BlackOut,
        lastUpdate: "10 days ago",
        type: "outgoing",
        data: [
            {
                id: 1,
                name: "You Receive",
                PaymentMode: "Upi",
                amount: 13000,
                bankName: "HDFC",
                lastUpdate: "1 day ago",
                type: "done",
            },
            {
                id: 2,
                name: "You Receive",
                PaymentMode: "Upi",
                amount: 32210,
                lastUpdate: "10 day ago",
                type: "incoming",
            },
            {
                id: 3,
                name: "You Lent",
                PaymentMode: "Cash",
                amount: 30200,
                lastUpdate: "1 month ago",
                type: "outgoing",
            },
            {
                id: 4,
                name: "You Lent",
                PaymentMode: "Cash",
                amount: 25045,
                lastUpdate: "5 month ago",
                type: "outgoing",
            },

        ]

    },
]
export const recentAData = [
    {
        id: 1,
        title: "Settle",
        name: "Aman",
        PaymentMode: "Bank",
        amount: 3245,
        icon: Settle,
        bankName: "HDFC",
        lastUpdate: "1 day ago",
        type: "done",
        category: "Settled",
        createdAt: "2026-06-17T10:00:00.000Z",
    },
    {
        id: 2,
        title: "You Borrowed",
        name: "Ravi",
        PaymentMode: "Upi",
        amount: 13245,
        icon: BlackIn,
        lastUpdate: "2 days ago",
        type: "incoming",
        category: "Incoming",
        createdAt: "2026-06-17T09:00:00.000Z",
    },
    {
        id: 3,
        title: "You Lent",
        name: "Riya",
        PaymentMode: "Cash",
        amount: 33245,
        icon: BlackOut,
        bankName: "ICICI",
        lastUpdate: "3 days ago",
        type: "outgoing",
        category: "Outgoing",
        createdAt: "2026-06-16T15:00:00.000Z",
    },
    {
        id: 4,
        title: "You Lent",
        name: "Lamba",
        PaymentMode: "Upi",
        amount: 345,
        icon: BlackOut,
        lastUpdate: "10 days ago",
        type: "outgoing",
        category: "Outgoing",
        createdAt: "2026-06-15T11:00:00.000Z",
    },
]
export const recentData = [
    {
        id: 1,
        title: "Deposite",
        PaymentMode: "Bank",
        amount: 3245,
        icon: Bank,
        bankName: "HDFC",
        lastUpdate: "2 min ago",
        type: "incoming",
        category: "Incoming",
        createdAt: "2026-06-17T17:50:00.000Z",
    },
    {
        id: 2,
        title: "Shopping",
        PaymentMode: "Upi",
        amount: 13245,
        icon: Upi,
        lastUpdate: "10 min ago",
        type: "outgoing",
        category: "Outgoing",
        createdAt: "2026-06-17T17:40:00.000Z",
    },
    {
        id: 3,
        title: "Salary",
        PaymentMode: "Bank",
        amount: 33245,
        icon: Bank,
        bankName: "ICICI",
        lastUpdate: "52 min ago",
        type: "incoming",
        category: "Incoming",
        createdAt: "2026-06-17T17:00:00.000Z",
    },
    {
        id: 4,
        title: "Food",
        PaymentMode: "Cash",
        amount: 345,
        icon: Food,
        lastUpdate: "1 hour ago",
        type: "outgoing",
        category: "Outgoing",
        createdAt: "2026-06-17T16:40:00.000Z",
    },
]

export const settleList = [
    {
        id: 1,
        name: "Amit",
        amount: "12,323",
        date: "7 may",
        owe: "You Owe",
    },
    {
        id: 2,
        name: "Smit",
        amount: "1,323",
        date: "12 may",
        owe: "You Owe",
    },
    {
        id: 3,
        name: "John",
        amount: "42,323",
        date: "27 may",
        owe: "You Owe",
    },
]

export const LoadItem = [
    {
        id: 1,
        title: "Amit Marriage",
        amount: 642323,
        date: "7 may",
        intrest: 1.3,
        intrestType: "Monthly",
        totalInstallments: 24,
        owe: "You Owe",
        activeLoan: 2,
        status: "Active",
        installment: 4,
        outStand: 230000,
    },
    {
        id: 2,
        title: "Amit Bike",
        amount: 223223,
        status: "OverDue",
        intrest: 40.3,
        intrestType: "Yearly",
        totalInstallments: 12,
        date: "12 may",
        owe: "You Owe",
        activeLoan: 2,
        installment: 4,
        outStand: 23225,
    },
]