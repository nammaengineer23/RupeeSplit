import { ExpenseCategory, Member } from '../types';

export interface ParsedExpenseResult {
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidByType: 'SINGLE' | 'KITTY';
  payerId?: string;
  payerName?: string;
  participantIds: string[];
  participantNames: string[];
  confidence: {
    amount: boolean;
    payer: boolean;
    category: boolean;
    participants: boolean;
  };
  rawTranscript: string;
}

export function parseNaturalLanguageExpense(
  text: string,
  members: Member[]
): ParsedExpenseResult {
  const normalized = text.toLowerCase().trim();

  // 1. Extract Amount
  let amount = 0;
  let hasAmount = false;

  // Pattern matches: "₹ 1200", "1200 rs", "1200 rupees", "1200 inr", "paid 1200", "spent 1200", "for 1200"
  const amountPatterns = [
    /(?:rs\.?|inr|rupees?|₹)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs\.?|inr|rupees?|₹|bucks)/i,
    /(?:paid|spent|cost|worth|bill of)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /\b(\d{2,6})\b/, // any standalone 2 to 6 digit number
  ];

  for (const regex of amountPatterns) {
    const match = normalized.match(regex);
    if (match && match[1]) {
      const parsedNum = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(parsedNum) && parsedNum > 0) {
        amount = parsedNum;
        hasAmount = true;
        break;
      }
    }
  }

  // 2. Extract Category
  let category: ExpenseCategory = 'Misc';
  let hasCategory = false;

  const categoryKeywords: Record<ExpenseCategory, string[]> = {
    'Food & Drinks': [
      'food', 'lunch', 'dinner', 'breakfast', 'dhaba', 'cafe', 'coffee', 'chai',
      'tea', 'drinks', 'beer', 'alcohol', 'cocktail', 'maggi', 'snack', 'snacks',
      'restaurant', 'biryani', 'pizza', 'burger', 'ice cream', 'maggie'
    ],
    'Travel/Fuel': [
      'cab', 'taxi', 'uber', 'ola', 'auto', 'rickshaw', 'petrol', 'fuel', 'diesel',
      'toll', 'tollgate', 'flight', 'train', 'bus', 'parking', 'scooty', 'bike rental',
      'car rental', 'driver', 'fastag'
    ],
    'Stay/Hotel': [
      'stay', 'hotel', 'villa', 'resort', 'zostel', 'hostel', 'airbnb', 'room',
      'lodge', 'homestay', 'tent', 'cottage'
    ],
    Activities: [
      'watersports', 'water sports', 'parasailing', 'jetski', 'scuba', 'trek',
      'trekking', 'entry', 'ticket', 'tickets', 'safari', 'museum', 'club', 'entry fee',
      'cruise', 'kayak', 'bungee', 'boating'
    ],
    Groceries: [
      'grocery', 'groceries', 'supermarket', 'mart', 'blinkit', 'zepto', 'instamart',
      'supplies', 'water bottles', 'biscuits', 'milk', 'snacks for road'
    ],
    Misc: ['misc', 'shopping', 'medicine', 'souvenir', 'sim card', 'tips'],
  };

  for (const [cat, keywords] of Object.entries(categoryKeywords) as [ExpenseCategory, string[]][]) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      category = cat;
      hasCategory = true;
      break;
    }
  }

  // 3. Extract Payer (Single member or Kitty)
  let paidByType: 'SINGLE' | 'KITTY' = 'SINGLE';
  let payerId: string | undefined = undefined;
  let payerName: string | undefined = undefined;
  let hasPayer = false;

  if (
    normalized.includes('kitty') ||
    normalized.includes('cash pot') ||
    normalized.includes('cashpot') ||
    normalized.includes('shared kitty')
  ) {
    paidByType = 'KITTY';
    hasPayer = true;
    payerName = 'Shared Kitty';
  } else {
    // Check for "paid by [Name]", "by [Name]", "[Name] paid"
    for (const member of members) {
      const mName = member.name.toLowerCase();
      const firstName = mName.split(' ')[0];

      if (
        normalized.includes(`paid by ${firstName}`) ||
        normalized.includes(`by ${firstName}`) ||
        normalized.includes(`${firstName} paid`) ||
        normalized.includes(`${firstName} gave`)
      ) {
        payerId = member.id;
        payerName = member.name;
        hasPayer = true;
        break;
      }
    }

    // Secondary check: any member mentioned as first word or before 'paid'
    if (!hasPayer) {
      for (const member of members) {
        const firstName = member.name.toLowerCase().split(' ')[0];
        if (normalized.includes(firstName)) {
          payerId = member.id;
          payerName = member.name;
          hasPayer = true;
          break;
        }
      }
    }

    // Default to first member if none matched
    if (!payerId && members.length > 0) {
      payerId = members[0].id;
      payerName = members[0].name;
    }
  }

  // 4. Extract Participants / Split Among
  const participantIds: string[] = [];
  const participantNames: string[] = [];
  let hasParticipants = false;

  // Check if "with [Name1] and [Name2]" or "between [Name1] and [Name2]"
  const mentionedMembers = members.filter((m) => {
    const firstName = m.name.toLowerCase().split(' ')[0];
    return normalized.includes(firstName);
  });

  if (
    normalized.includes('all') ||
    normalized.includes('everyone') ||
    normalized.includes('group') ||
    mentionedMembers.length === 0
  ) {
    // Split among all
    members.forEach((m) => {
      participantIds.push(m.id);
      participantNames.push(m.name);
    });
    hasParticipants = true;
  } else {
    // Specified members
    mentionedMembers.forEach((m) => {
      participantIds.push(m.id);
      participantNames.push(m.name);
    });

    // If payer is a single member and wasn't included, make sure payer is in split if context suggests sharing
    if (payerId && !participantIds.includes(payerId)) {
      participantIds.push(payerId);
      const payerObj = members.find((m) => m.id === payerId);
      if (payerObj) participantNames.push(payerObj.name);
    }
    hasParticipants = true;
  }

  // 5. Extract Title
  let title = text;
  // Clean up common prefixes and filler words
  const cleanPatterns = [
    /^(?:i\s+)?(?:paid|spent|added|got|bought)\s+/i,
    /(?:rs\.?|inr|rupees?|₹)\s*\d+(?:,\d+)*(?:\.\d+)?/gi,
    /\d+(?:,\d+)*(?:\.\d+)?\s*(?:rs\.?|inr|rupees?|₹|bucks)/gi,
    /\bpaid by\s+[a-zA-Z]+/gi,
    /\bby\s+[a-zA-Z]+/gi,
    /\bfrom\s+(?:kitty|cash\s*pot)/gi,
    /\bwith\s+([a-zA-Z,\s]+)/gi,
    /\bfor\s+(?:all|everyone)/gi,
  ];

  let candidateTitle = text;
  for (const pat of cleanPatterns) {
    candidateTitle = candidateTitle.replace(pat, ' ');
  }

  candidateTitle = candidateTitle.replace(/\s+/g, ' ').trim();

  // If candidate is too short or empty, formulate from category
  if (candidateTitle.length < 3) {
    title = `${category} expense`;
  } else {
    // Capitalize first letter
    title = candidateTitle.charAt(0).toUpperCase() + candidateTitle.slice(1);
  }

  return {
    title,
    amount: amount > 0 ? amount : 500,
    category,
    paidByType,
    payerId,
    payerName,
    participantIds: participantIds.length > 0 ? participantIds : members.map((m) => m.id),
    participantNames: participantNames.length > 0 ? participantNames : members.map((m) => m.name),
    confidence: {
      amount: hasAmount,
      payer: hasPayer,
      category: hasCategory,
      participants: hasParticipants,
    },
    rawTranscript: text,
  };
}
