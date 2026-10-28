import { ExpenseCategory, ReceiptDetails } from '../types';

export interface SampleReceipt {
  id: string;
  name: string;
  tag: string;
  category: ExpenseCategory;
  merchantName: string;
  date: string;
  items: { name: string; price: number }[];
  subtotal: number;
  gst: number;
  total: number;
}

export const SAMPLE_INDIAN_RECEIPTS: SampleReceipt[] = [
  {
    id: 'receipt-1',
    name: "Fisherman's Wharf Beach Shack",
    tag: 'Seafood & Drinks',
    category: 'Food & Drinks',
    merchantName: "Fisherman's Wharf Bar & Bistro, Salcette, Goa",
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Butter Garlic Prawns (Special)', price: 780 },
      { name: 'Goan Fish Curry Rice Plate x2', price: 640 },
      { name: 'Kingfisher Premium Draught x4', price: 920 },
      { name: 'Butter Garlic Naan x3', price: 210 },
      { name: 'Kokum Mojito & Solkadhi', price: 260 },
    ],
    subtotal: 2810,
    gst: 140, // 5% GST
    total: 2950,
  },
  {
    id: 'receipt-2',
    name: 'Shell Highway Petrol & Car Fluids',
    tag: 'Fuel & Highway',
    category: 'Travel/Fuel',
    merchantName: 'Shell Express Highway Fuel Stn #18',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Power Petrol (34.2 Litres @ ₹102.5/L)', price: 3505 },
      { name: 'Windshield Washer Fluid & Air Check', price: 195 },
      { name: 'Highway Toll Fastag Recharge', price: 500 },
    ],
    subtotal: 4200,
    gst: 0,
    total: 4200,
  },
  {
    id: 'receipt-3',
    name: 'Calangute Adventure Watersports',
    tag: 'Activities & Fun',
    category: 'Activities',
    merchantName: 'Goa Aqua Thrills & Watersports Co.',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Parasailing with Dip x 3 Pax', price: 3600 },
      { name: 'Jet Ski Safari 20 Mins x 2', price: 1600 },
      { name: 'Bumper Ride & Banana Boat Combo', price: 1200 },
    ],
    subtotal: 6400,
    gst: 0,
    total: 6400,
  },
  {
    id: 'receipt-4',
    name: 'Nature Basket Beach Mart',
    tag: 'Groceries & Cold Drinks',
    category: 'Groceries',
    merchantName: 'Natures Basket Supermarket, Candolim',
    date: new Date().toISOString().split('T')[0],
    items: [
      { name: 'Kinley Water 1L Pack of 12', price: 240 },
      { name: 'Amul Butter & Artisanal Multigrain Bread', price: 175 },
      { name: 'Assorted Gourmet Chips & Roasted Cashews', price: 590 },
      { name: 'Red Bull Energy Drink x 4', price: 480 },
      { name: 'Tropicana Mixed Fruit Juice 1L x 2', price: 235 },
    ],
    subtotal: 1720,
    gst: 0,
    total: 1720,
  },
];

export interface ScanReceiptOutput {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  receiptDetails: ReceiptDetails;
}

/**
 * Simulates AI OCR extraction on an image or selected sample
 */
export async function simulateReceiptOcr(
  sample?: SampleReceipt
): Promise<ScanReceiptOutput> {
  // If sample provided, use it
  if (sample) {
    return {
      title: `${sample.name}`,
      category: sample.category,
      amount: sample.total,
      date: sample.date,
      receiptDetails: {
        merchantName: sample.merchantName,
        items: sample.items,
        gst: sample.gst,
        subtotal: sample.subtotal,
      },
    };
  }

  // Generic fallback if user uploaded custom file
  const today = new Date().toISOString().split('T')[0];
  const items = [
    { name: 'Scanned Bill Item 1', price: 850 },
    { name: 'Scanned Bill Item 2', price: 620 },
    { name: 'Beverages & Water', price: 280 },
  ];
  const subtotal = 1750;
  const gst = 90;
  const total = subtotal + gst;

  return {
    title: 'Cafe / Restaurant Bill',
    category: 'Food & Drinks',
    amount: total,
    date: today,
    receiptDetails: {
      merchantName: 'Local Merchant (Scanned Invoice)',
      items,
      gst,
      subtotal,
    },
  };
}
