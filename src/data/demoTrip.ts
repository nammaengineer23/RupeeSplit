import { Expense, KittyContribution, Member, SettlementRecord, Trip } from '../types';

export const DEMO_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Rahul Sharma',
    upiId: 'rahul.sharma@okhdfcbank',
    avatarColor: 'bg-emerald-600 text-white',
    initials: 'RS',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
  },
  {
    id: 'm-2',
    name: 'Pooja Patel',
    upiId: 'poojap@paytm',
    avatarColor: 'bg-indigo-600 text-white',
    initials: 'PP',
    phone: '+91 98234 56789',
    email: 'pooja@example.com',
  },
  {
    id: 'm-3',
    name: 'Aman Verma',
    upiId: 'aman.verma@icici',
    avatarColor: 'bg-amber-600 text-white',
    initials: 'AV',
    phone: '+91 97112 33445',
    email: 'aman@example.com',
  },
  {
    id: 'm-4',
    name: 'Sneha Kulkarni',
    upiId: 'sneha.k@axisbank',
    avatarColor: 'bg-rose-600 text-white',
    initials: 'SK',
    phone: '+91 99887 66554',
    email: 'sneha@example.com',
  },
];

export const DEMO_TRIP: Trip = {
  id: 'trip-goa-2026',
  name: 'Goa Trip 2026',
  destination: 'North & South Goa',
  startDate: '2026-11-12',
  endDate: '2026-11-16',
  currency: 'INR',
  members: DEMO_MEMBERS,
  inviteCode: 'GOA-2026',
  createdAt: Date.now() - 4 * 86400000,
};

export const DEMO_KITTY_CONTRIBUTIONS: KittyContribution[] = [
  {
    id: 'kc-1',
    tripId: DEMO_TRIP.id,
    memberId: 'm-1',
    amount: 2000,
    date: '2026-11-12',
    note: 'Initial cash pot contribution',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'kc-2',
    tripId: DEMO_TRIP.id,
    memberId: 'm-2',
    amount: 2000,
    date: '2026-11-12',
    note: 'Initial cash pot contribution',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'kc-3',
    tripId: DEMO_TRIP.id,
    memberId: 'm-3',
    amount: 2000,
    date: '2026-11-12',
    note: 'Initial cash pot contribution',
    createdAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'kc-4',
    tripId: DEMO_TRIP.id,
    memberId: 'm-4',
    amount: 2000,
    date: '2026-11-12',
    note: 'Initial cash pot contribution',
    createdAt: Date.now() - 4 * 86400000,
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    tripId: DEMO_TRIP.id,
    title: 'Highway Toll Plaza & Tea',
    amount: 480,
    category: 'Travel/Fuel',
    date: '2026-11-12',
    paidBy: {
      type: 'KITTY',
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 120 },
      { memberId: 'm-2', amount: 120 },
      { memberId: 'm-3', amount: 120 },
      { memberId: 'm-4', amount: 120 },
    ],
    notes: 'Paid cash from shared kitty pot at expressway toll',
    createdAt: Date.now() - 3.8 * 86400000,
  },
  {
    id: 'exp-2',
    tripId: DEMO_TRIP.id,
    title: 'Highway Shell Petrol Full Tank',
    amount: 3600,
    category: 'Travel/Fuel',
    date: '2026-11-12',
    paidBy: {
      type: 'SINGLE',
      singlePayerId: 'm-3', // Aman Verma
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 900 },
      { memberId: 'm-2', amount: 900 },
      { memberId: 'm-3', amount: 900 },
      { memberId: 'm-4', amount: 900 },
    ],
    notes: 'Filled tank at Kolhapur Shell station',
    createdAt: Date.now() - 3.5 * 86400000,
  },
  {
    id: 'exp-3',
    tripId: DEMO_TRIP.id,
    title: 'Anjuna Heritage Pool Villa (3 Nights)',
    amount: 18000,
    category: 'Stay/Hotel',
    date: '2026-11-12',
    paidBy: {
      type: 'SINGLE',
      singlePayerId: 'm-1', // Rahul Sharma
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 4500 },
      { memberId: 'm-2', amount: 4500 },
      { memberId: 'm-3', amount: 4500 },
      { memberId: 'm-4', amount: 4500 },
    ],
    notes: 'Private 3BHK villa with plunge pool booked via Airbnb',
    createdAt: Date.now() - 3.2 * 86400000,
  },
  {
    id: 'exp-4',
    tripId: DEMO_TRIP.id,
    title: "Fisherman's Wharf Seafood & Drinks",
    amount: 4800,
    category: 'Food & Drinks',
    date: '2026-11-13',
    paidBy: {
      type: 'SINGLE',
      singlePayerId: 'm-2', // Pooja Patel
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 1200 },
      { memberId: 'm-2', amount: 1200 },
      { memberId: 'm-3', amount: 1200 },
      { memberId: 'm-4', amount: 1200 },
    ],
    receiptDetails: {
      merchantName: "Fisherman's Wharf, Salcette",
      items: [
        { name: 'Butter Garlic Crab', price: 1600 },
        { name: 'Prawns Goan Curry x2', price: 900 },
        { name: 'Beverages & Beer', price: 1700 },
        { name: 'Appam & Rice', price: 370 },
      ],
      gst: 230,
      subtotal: 4570,
    },
    notes: 'Delicious dinner overlooking the river',
    createdAt: Date.now() - 2.5 * 86400000,
  },
  {
    id: 'exp-5',
    tripId: DEMO_TRIP.id,
    title: 'Calangute Watersports (Parasailing & Jet Ski)',
    amount: 6000,
    category: 'Activities',
    date: '2026-11-14',
    paidBy: {
      type: 'MULTI',
      payers: [
        { memberId: 'm-1', amount: 3000 }, // Rahul paid 3000
        { memberId: 'm-3', amount: 3000 }, // Aman paid 3000
      ],
    },
    splitType: 'UNEQUAL',
    splits: [
      { memberId: 'm-1', amount: 1800 },
      { memberId: 'm-3', amount: 1800 },
      { memberId: 'm-4', amount: 1400 },
      { memberId: 'm-2', amount: 1000 }, // Pooja did only parasailing
    ],
    notes: 'Pooja opted out of high-speed jet ski, so unequal split applied',
    createdAt: Date.now() - 1.8 * 86400000,
  },
  {
    id: 'exp-6',
    tripId: DEMO_TRIP.id,
    title: 'Supermarket Snacks, Soda & Fruits',
    amount: 1450,
    category: 'Groceries',
    date: '2026-11-14',
    paidBy: {
      type: 'KITTY',
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 362.5 },
      { memberId: 'm-2', amount: 362.5 },
      { memberId: 'm-3', amount: 362.5 },
      { memberId: 'm-4', amount: 362.5 },
    ],
    notes: 'Paid directly from shared kitty cash pot',
    createdAt: Date.now() - 1.2 * 86400000,
  },
  {
    id: 'exp-7',
    tripId: DEMO_TRIP.id,
    title: 'Thalassa Sunset Greek Dinner & Cocktails',
    amount: 5400,
    category: 'Food & Drinks',
    date: '2026-11-15',
    paidBy: {
      type: 'SINGLE',
      singlePayerId: 'm-4', // Sneha Kulkarni
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 1350 },
      { memberId: 'm-2', amount: 1350 },
      { memberId: 'm-3', amount: 1350 },
      { memberId: 'm-4', amount: 1350 },
    ],
    notes: 'Sunset cliff views and Greek platter',
    createdAt: Date.now() - 0.8 * 86400000,
  },
  {
    id: 'exp-8',
    tripId: DEMO_TRIP.id,
    title: 'Innova Airport Drop Cab',
    amount: 2200,
    category: 'Travel/Fuel',
    date: '2026-11-16',
    paidBy: {
      type: 'SINGLE',
      singlePayerId: 'm-4', // Sneha Kulkarni
    },
    splitType: 'EQUAL',
    splits: [
      { memberId: 'm-1', amount: 550 },
      { memberId: 'm-2', amount: 550 },
      { memberId: 'm-3', amount: 550 },
      { memberId: 'm-4', amount: 550 },
    ],
    notes: 'Pre-booked AC Innova from Anjuna to MOPA airport',
    createdAt: Date.now() - 0.2 * 86400000,
  },
];

export const DEMO_SETTLEMENTS: SettlementRecord[] = [
  {
    id: 'set-1',
    tripId: DEMO_TRIP.id,
    fromMemberId: 'm-3', // Aman Verma
    toMemberId: 'm-1',   // Rahul Sharma
    amount: 1500,
    date: '2026-11-15',
    upiRef: 'UPI/20261115/948291',
    note: 'Partial settlement for villa advance',
    createdAt: Date.now() - 0.5 * 86400000,
  },
];
