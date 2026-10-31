export type SupportedLanguage = 
  | 'en' 
  | 'hi' 
  | 'hinglish' 
  | 'mr' 
  | 'gu' 
  | 'bn' 
  | 'ta' 
  | 'te' 
  | 'kn';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (बोलचाल)', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
];

export interface TranslationDictionary {
  // Navigation & Tabs
  expenses: string;
  settleUp: string;
  sharedKitty: string;
  insightsWrapped: string;
  friends: string;
  itinerary: string;
  analytics: string;

  // Trips & Navigation
  trips: string;
  selectTrip: string;
  myTrips: string;
  newTrip: string;
  switchTrip: string;

  // Actions
  addExpense: string;
  scanBill: string;
  voiceEntry: string;
  joinTrip: string;
  invite: string;
  export: string;
  loadDemo: string;
  installApp: string;
  playStoreReady: string;

  // Group Fund (Replaced Kitty)
  groupFund: string;
  groupFundPot: string;
  contribute: string;
  fundCollected: string;
  fundSpent: string;
  remainingCash: string;
  poolMoreCash: string;
  logChaiToll: string;

  // Member Management & Self-Deletion
  addFriend: string;
  removeFriend: string;
  cannotRemoveSelf: string;
  activeMembers: string;
  pastMembers: string;
  leftTrip: string;
  friendFullName: string;
  mobileNumber: string;
  upiId: string;
  selectFromContacts: string;
  you: string;

  // Metrics
  totalGroupSpend: string;
  avgPerFriend: string;
  topSpender: string;
  availableKitty: string;
  netStanding: string;
  netBalance: string;
  owes: string;
  getsBack: string;
  allSettled: string;

  // Modals & Forms
  saveExpense: string;
  editExpense: string;
  deleteExpense: string;
  whoPaid: string;
  splitMethod: string;
  equalOptOut: string;
  exactAmounts: string;
  percentageShares: string;
  payWithUpi: string;
  markPaid: string;
  settleNow: string;
  paymentRecorded: string;
  cancel: string;
  close: string;
  confirm: string;
  notes: string;
  amount: string;
  date: string;
  category: string;
  searchExpenses: string;
  noExpensesYet: string;
  addFirstExpense: string;
  shareWhatsApp: string;
  downloadApk: string;
  theme: string;
  signOut: string;

  // Categories
  stayHotel: string;
  foodDrinks: string;
  travelFuel: string;
  activities: string;
  groceries: string;
  misc: string;

  // Trip Wrapped
  groupBanker: string;
  chaiLover: string;
  bigSplurger: string;
  budgetNinja: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    expenses: 'Expenses',
    settleUp: 'Settle Up (UPI)',
    sharedKitty: 'Group Fund',
    insightsWrapped: 'Insights & Wrapped',
    friends: 'Friends',
    itinerary: 'Itinerary',
    analytics: 'Analytics',

    trips: 'Trips',
    selectTrip: 'Select Trip',
    myTrips: 'My Trips',
    newTrip: 'New Trip',
    switchTrip: 'Switch Trip',

    addExpense: 'Add Expense',
    scanBill: 'Scan Bill',
    voiceEntry: 'Voice Entry',
    joinTrip: 'Join Trip',
    invite: 'Invite Friends',
    export: 'Export Data',
    loadDemo: 'Load Demo',
    installApp: 'Install App',
    playStoreReady: 'Play Store Ready',

    groupFund: 'Group Fund',
    groupFundPot: 'Group Fund Pot',
    contribute: 'Contribute',
    fundCollected: 'Total Pooled',
    fundSpent: 'Total Spent',
    remainingCash: 'Remaining Cash',
    poolMoreCash: 'Pool Cash to Group Fund',
    logChaiToll: 'Log Chai / Toll / Small Expense',

    addFriend: 'Add Friend',
    removeFriend: 'Remove Friend',
    cannotRemoveSelf: 'You cannot remove yourself from the trip',
    activeMembers: 'Active Friends',
    pastMembers: 'Past Members (In Settlement)',
    leftTrip: 'Left Trip',
    friendFullName: "Friend's Full Name",
    mobileNumber: 'Mobile Number',
    upiId: 'UPI ID',
    selectFromContacts: 'Pick from Contacts',
    you: 'You',

    totalGroupSpend: 'Total Group Spend',
    avgPerFriend: 'Average per Friend',
    topSpender: 'Top Spender',
    availableKitty: 'Available in Group Fund',
    netStanding: 'Net Standing',
    netBalance: 'Net Balance',
    owes: 'owes',
    getsBack: 'gets back',
    allSettled: 'All debts settled! No pending balances.',

    saveExpense: 'Save Expense',
    editExpense: 'Edit Expense',
    deleteExpense: 'Delete Expense',
    whoPaid: 'Who Paid?',
    splitMethod: 'Split Method',
    equalOptOut: 'Equal (Split with all)',
    exactAmounts: 'Exact Amounts',
    percentageShares: 'Percentage (%)',
    payWithUpi: 'Pay with UPI QR',
    markPaid: 'Mark as Settled',
    settleNow: 'Settle via UPI',
    paymentRecorded: 'Payment Recorded',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    notes: 'Notes / Details',
    amount: 'Amount',
    date: 'Date',
    category: 'Category',
    searchExpenses: 'Search expenses...',
    noExpensesYet: 'No expenses logged yet',
    addFirstExpense: 'Add your first expense to begin tracking!',
    shareWhatsApp: 'Share on WhatsApp',
    downloadApk: 'Download APK',
    theme: 'Theme',
    signOut: 'Sign Out',

    stayHotel: 'Stay/Hotel',
    foodDrinks: 'Food & Drinks',
    travelFuel: 'Travel/Fuel',
    activities: 'Activities',
    groceries: 'Groceries',
    misc: 'Misc',

    groupBanker: 'Group Banker',
    chaiLover: 'Chai Lover',
    bigSplurger: 'Big Spender',
    budgetNinja: 'Budget Ninja',
  },

  hi: {
    expenses: 'खर्चे (Expenses)',
    settleUp: 'हिसाब चुकता (UPI)',
    sharedKitty: 'ग्रुप फंड (Group Fund)',
    insightsWrapped: 'समीक्षा व रिपोर्ट',
    friends: 'दोस्त (Friends)',
    itinerary: 'यात्रा योजना (Itinerary)',
    analytics: 'एनालिटिक्स (Analytics)',

    trips: 'ट्रिप्स (Trips)',
    selectTrip: 'ट्रिप चुनें',
    myTrips: 'मेरी ट्रिप्स',
    newTrip: 'नई ट्रिप बनाएं',
    switchTrip: 'ट्रिप बदलें',

    addExpense: 'खर्चा जोड़ें',
    scanBill: 'बिल स्कैन करें',
    voiceEntry: 'बोलकर लिखें',
    joinTrip: 'ट्रिप में जुड़ें',
    invite: 'दोस्तों को जोड़ें',
    export: 'रिपोर्ट डाउनलोड करें',
    loadDemo: 'डेमो ट्रिप देखें',
    installApp: 'ऐप इंस्टॉल करें',
    playStoreReady: 'प्ले स्टोर तैयार',

    groupFund: 'ग्रुप फंड',
    groupFundPot: 'ग्रुप फंड गुल्लक',
    contribute: 'रुपये जमा करें',
    fundCollected: 'कुल जमा राशि',
    fundSpent: 'फंड से खर्च',
    remainingCash: 'बची हुई नकदी',
    poolMoreCash: 'ग्रुप फंड में नकदी डालें',
    logChaiToll: 'चाय / टोल / छोटा खर्चा',

    addFriend: 'दोस्त जोड़ें',
    removeFriend: 'दोस्त को हटाएं',
    cannotRemoveSelf: 'आप स्वयं को ट्रिप से नहीं हटा सकते',
    activeMembers: 'सक्रिय साथी',
    pastMembers: 'पूर्व साथी (हिसाब में शामिल)',
    leftTrip: 'ट्रिप छोड़ चुके',
    friendFullName: 'दोस्त का पूरा नाम',
    mobileNumber: 'मोबाइल नंबर',
    upiId: 'यूपीआई आईडी (UPI ID)',
    selectFromContacts: 'कॉन्टैक्ट्स से चुनें',
    you: 'आप (You)',

    totalGroupSpend: 'ग्रुप का कुल खर्च',
    avgPerFriend: 'प्रति व्यक्ति औसत',
    topSpender: 'सर्वाधिक खर्च करने वाला',
    availableKitty: 'ग्रुप फंड में उपलब्ध',
    netStanding: 'कुल बकाया स्थिति',
    netBalance: 'शुद्ध शेष (Net Balance)',
    owes: 'देना है',
    getsBack: 'लेना है',
    allSettled: 'सारा हिसाब बराबर! कोई बकाया नहीं।',

    saveExpense: 'खर्चा सहेजें',
    editExpense: 'खर्चा बदलें',
    deleteExpense: 'खर्चा हटाएं',
    whoPaid: 'किसने भुगतान किया?',
    splitMethod: 'बंटवारे का तरीका',
    equalOptOut: 'बराबर (सब में बराबर)',
    exactAmounts: 'सटीक रुपये',
    percentageShares: 'प्रतिशत (%) हिस्सा',
    payWithUpi: 'UPI QR से भुगतान करें',
    markPaid: 'चुकता दर्ज करें',
    settleNow: 'UPI से भुगतान करें',
    paymentRecorded: 'भुगतान दर्ज किया गया',
    cancel: 'रद्द करें',
    close: 'बंद करें',
    confirm: 'पुष्टि करें',
    notes: 'विवरण / नोट्स',
    amount: 'राशि (₹)',
    date: 'तारीख',
    category: 'श्रेणी (Category)',
    searchExpenses: 'खर्चे खोजें...',
    noExpensesYet: 'अभी कोई खर्चा दर्ज नहीं हुआ है',
    addFirstExpense: 'शुरुआत करने के लिए पहला खर्चा जोड़ें!',
    shareWhatsApp: 'व्हाट्सएप पर शेयर करें',
    downloadApk: 'APK डाउनलोड करें',
    theme: 'थीम (Theme)',
    signOut: 'लॉग आउट',

    stayHotel: 'होटल / कमरा',
    foodDrinks: 'खाना-पीना व चाय',
    travelFuel: 'यात्रा, पेट्रोल व कैब',
    activities: 'मनोरंजन व टिकट',
    groceries: 'राशन व स्नैक्स',
    misc: 'अन्य खर्चे',

    groupBanker: 'ग्रुप का बैंकर',
    chaiLover: 'चाय प्रेमी',
    bigSplurger: 'बड़ा खर्चीला',
    budgetNinja: 'बजट निंजा',
  },

  hinglish: {
    expenses: 'Kharcha (Expenses)',
    settleUp: 'Hisab Barabar (UPI)',
    sharedKitty: 'Group Fund',
    insightsWrapped: 'Report & Insights',
    friends: 'Dost (Friends)',
    itinerary: 'Trip Plan',
    analytics: 'Analytics',

    trips: 'Trips',
    selectTrip: 'Trip Select Karein',
    myTrips: 'Meri Trips',
    newTrip: 'Nayi Trip Banayein',
    switchTrip: 'Trip Badlein',

    addExpense: 'Kharcha Add Karein',
    scanBill: 'Bill Scan Karein',
    voiceEntry: 'Bol Kar Likhein',
    joinTrip: 'Trip Join Karein',
    invite: 'Doston ko Invite Karein',
    export: 'Report Export Karein',
    loadDemo: 'Demo Trip Dekhein',
    installApp: 'App Install Karein',
    playStoreReady: 'Play Store Ready',

    groupFund: 'Group Fund',
    groupFundPot: 'Group Fund Ka Cash',
    contribute: 'Paisa Jama Karein',
    fundCollected: 'Total Pool Hua',
    fundSpent: 'Fund Se Kharcha',
    remainingCash: 'Bacha Hua Cash',
    poolMoreCash: 'Group Fund Me Cash Daalein',
    logChaiToll: 'Chai / Toll / Chhota Kharcha',

    addFriend: 'Dost Add Karein',
    removeFriend: 'Dost ko Remove Karein',
    cannotRemoveSelf: 'Aap khud ko trip se delete nahi kar sakte',
    activeMembers: 'Active Dost',
    pastMembers: 'Past Dost (Hisab me shamil)',
    leftTrip: 'Trip Chhoda',
    friendFullName: 'Dost Ka Naam',
    mobileNumber: 'Mobile Number',
    upiId: 'UPI ID',
    selectFromContacts: 'Phone Contacts Se Chunein',
    you: 'Aap (You)',

    totalGroupSpend: 'Total Group Kharcha',
    avgPerFriend: 'Per Person Average',
    topSpender: 'Sabse Zyada Kharch Karne Wala',
    availableKitty: 'Group Fund Me Bacha Cash',
    netStanding: 'Net Standing',
    netBalance: 'Net Balance',
    owes: 'dena hai',
    getsBack: 'lena hai',
    allSettled: 'Sabka hisab barabar ho gaya! Zero balance.',

    saveExpense: 'Kharcha Save Karein',
    editExpense: 'Kharcha Edit Karein',
    deleteExpense: 'Kharcha Delete Karein',
    whoPaid: 'Kisne Pay Kiya?',
    splitMethod: 'Split Kaise Karein',
    equalOptOut: 'Barabar (Equal Split)',
    exactAmounts: 'Exact Rupee Amount',
    percentageShares: 'Percentage (%)',
    payWithUpi: 'UPI QR Se Pay Karein',
    markPaid: 'Chukta Mark Karein',
    settleNow: 'UPI Se Settle Karein',
    paymentRecorded: 'Payment Record Ho Gaya',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    notes: 'Details / Notes',
    amount: 'Amount (₹)',
    date: 'Date',
    category: 'Category',
    searchExpenses: 'Kharcha search karein...',
    noExpensesYet: 'Abhi tak koi kharcha add nahi hua',
    addFirstExpense: 'Shuruaat karne ke liye pehla kharcha add karein!',
    shareWhatsApp: 'WhatsApp Par Share Karein',
    downloadApk: 'Direct APK Download',
    theme: 'Theme',
    signOut: 'Sign Out',

    stayHotel: 'Hotel / Stay',
    foodDrinks: 'Khaana Peena & Chai',
    travelFuel: 'Travel & Petrol',
    activities: 'Activities & Fun',
    groceries: 'Groceries & Snacks',
    misc: 'Miscellaneous',

    groupBanker: 'Group Ka Banker',
    chaiLover: 'Chai Lover',
    bigSplurger: 'Big Spender',
    budgetNinja: 'Budget Ninja',
  },

  kn: {
    expenses: 'ಖರ್ಚುಗಳು (Expenses)',
    settleUp: 'ಲೆಕ್ಕ ಚುಕ್ತಾ (UPI)',
    sharedKitty: 'ಗ್ರೂಪ್ ಫಂಡ್ (Group Fund)',
    insightsWrapped: 'ವರದಿ ಮತ್ತು ಒಳನೋಟಗಳು',
    friends: 'ಸ್ನೇಹಿತರು (Friends)',
    itinerary: 'ಪ್ರವಾಸ ಯೋಜನೆ (Itinerary)',
    analytics: 'ವಿಶ್ಲೇಷಣೆ (Analytics)',

    trips: 'ಪ್ರವಾಸಗಳು (Trips)',
    selectTrip: 'ಟ್ರಿಪ್ ಆಯ್ಕೆಮಾಡಿ',
    myTrips: 'ನನ್ನ ಟ್ರಿಪ್‌ಗಳು',
    newTrip: 'ಹೊಸ ಟ್ರಿಪ್ ರಚಿಸಿ',
    switchTrip: 'ಟ್ರಿಪ್ ಬದಲಾಯಿಸಿ',

    addExpense: 'ಖರ್ಚು ಸೇರಿಸಿ',
    scanBill: 'ಬಿಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    voiceEntry: 'ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ',
    joinTrip: 'ಟ್ರಿಪ್ ಸೇರಿ',
    invite: 'ಸ್ನೇಹಿತರನ್ನು ಆಹ್ವಾನಿಸಿ',
    export: 'ವರದಿ ಡೌನ್‌ಲೋಡ್',
    loadDemo: 'ಡೆಮೊ ಟ್ರಿಪ್ ನೋಡಿ',
    installApp: 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
    playStoreReady: 'ಪ್ಲೇ ಸ್ಟೋರ್ ಸಿದ್ಧವಾಗಿದೆ',

    groupFund: 'ಗ್ರೂಪ್ ಫಂಡ್',
    groupFundPot: 'ಗ್ರೂಪ್ ಫಂಡ್ ಗಲ್ಲಾಪೆಟ್ಟಿಗೆ',
    contribute: 'ಹಣ ಜಮಾ ಮಾಡಿ',
    fundCollected: 'ಒಟ್ಟು ಸಂಗ್ರಹಿಸಿದ ಹಣ',
    fundSpent: 'ಫಂಡ್‌ನಿಂದ ಖರ್ಚು',
    remainingCash: 'ಉಳಿದ ನಗದು',
    poolMoreCash: 'ಗ್ರೂಪ್ ಫಂಡ್‌ಗೆ ಹಣ ಸೇರಿಸಿ',
    logChaiToll: 'ಚಹಾ / ಟೋಲ್ / ಸಣ್ಣ ಖರ್ಚು',

    addFriend: 'ಸ್ನೇಹಿತರನ್ನು ಸೇರಿಸಿ',
    removeFriend: 'ಸ್ನೇಹಿತರನ್ನು ತೆಗೆದುಹಾಕಿ',
    cannotRemoveSelf: 'ನೀವು ನಿಮ್ಮನ್ನೇ ಟ್ರಿಪ್‌ನಿಂದ ತೆಗೆದುಹಾಕಲು ಸಾಧ್ಯವಿಲ್ಲ',
    activeMembers: 'ಸಕ್ರಿಯ ಸ್ನೇಹಿತರು',
    pastMembers: 'ಹಿಂದಿನ ಸದಸ್ಯರು (ಲೆಕ್ಕಾಚಾರದಲ್ಲಿದ್ದಾರೆ)',
    leftTrip: 'ಟ್ರಿಪ್ ಬಿಟ್ಟಿದ್ದಾರೆ',
    friendFullName: 'ಸ್ನೇಹಿತನ ಪೂರ್ಣ ಹೆಸರು',
    mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    upiId: 'ಯುಪಿಐ ಐಡಿ (UPI ID)',
    selectFromContacts: 'ಸಂಪರ್ಕಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ',
    you: 'ನೀವು (You)',

    totalGroupSpend: 'ಗುಂಪಿನ ಒಟ್ಟು ಖರ್ಚು',
    avgPerFriend: 'ಪ್ರತಿ ಸ್ನೇಹಿತನಿಗೆ ಸರಾಸರಿ',
    topSpender: 'ಹೆಚ್ಚು ಖರ್ಚು ಮಾಡಿದವರು',
    availableKitty: 'ಗ್ರೂಪ್ ಫಂಡ್‌ನಲ್ಲಿ ಲಭ್ಯವಿರುವ ನಗದು',
    netStanding: 'ಒಟ್ಟು ಬಾಕಿ ಸ್ಥಿತಿ',
    netBalance: 'ನಿವ್ವಳ ಬಾಕಿ (Net Balance)',
    owes: 'ನೀಡಬೇಕಾಗಿದೆ',
    getsBack: 'ಪಡೆಯಬೇಕಾಗಿದೆ',
    allSettled: 'ಎಲ್ಲಾ ಲೆಕ್ಕ ಚುಕ್ತಾ ಆಗಿದೆ! ಯಾವುದೇ ಬಾಕಿ ಇಲ್ಲ.',

    saveExpense: 'ಖರ್ಚು ಉಳಿಸಿ',
    editExpense: 'ಖರ್ಚು ತಿದ್ದಿ',
    deleteExpense: 'ಖರ್ಚು ಅಳಿಸಿ',
    whoPaid: 'ಯಾರು ಪಾವತಿಸಿದರು?',
    splitMethod: 'ಹಂಚಿಕೆ ವಿಧಾನ',
    equalOptOut: 'ಸಮಾನ ಹಂಚಿಕೆ',
    exactAmounts: 'ನಿಖರ ಮೊತ್ತ',
    percentageShares: 'ಶೇಕಡಾವಾರು (%)',
    payWithUpi: 'UPI QR ಮೂಲಕ ಪಾವತಿಸಿ',
    markPaid: 'ಪಾವತಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ',
    settleNow: 'UPI ಮೂಲಕ ಚುಕ್ತಾ ಮಾಡಿ',
    paymentRecorded: 'ಪಾವತಿ ದಾಖಲಿಸಲಾಗಿದೆ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    close: 'ಮುಚ್ಚಿ',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    notes: 'ವಿವರಣೆ / ಟಿಪ್ಪಣಿ',
    amount: 'ಮೊತ್ತ (₹)',
    date: 'ದಿನಾಂಕ',
    category: 'ವರ್ಗ (Category)',
    searchExpenses: 'ಖರ್ಚುಗಳನ್ನು ಹುಡುಕಿ...',
    noExpensesYet: 'ಇನ್ನೂ ಯಾವುದೇ ಖರ್ಚು ದಾಖಲಾಗಿಲ್ಲ',
    addFirstExpense: 'ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮೊದಲ ಖರ್ಚನ್ನು ಸೇರಿಸಿ!',
    shareWhatsApp: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    downloadApk: 'APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    theme: 'ಥೀಮ್',
    signOut: 'ಸೈನ್ ಔಟ್',

    stayHotel: 'ಹೋಟೆಲ್ / ವಸತಿ',
    foodDrinks: 'ಆಹಾರ ಮತ್ತು ಪಾನೀಯ',
    travelFuel: 'ಪ್ರಯಾಣ / ಇಂಧನ',
    activities: 'ಚಟುವಟಿಕೆಗಳು',
    groceries: 'ದಿನಸಿ ವಸ್ತುಗಳು',
    misc: 'ಇತರೆ',

    groupBanker: 'ಗುಂಪಿನ ಬ್ಯಾಂಕರ್',
    chaiLover: 'ಚಹಾ ಪ್ರೇಮಿ',
    bigSplurger: 'ದೊಡ್ಡ ಬಿಲ್ ಪಾವತಿದಾರ',
    budgetNinja: 'ಬಜೆಟ್ ನಿಂಜಾ',
  },

  ta: {
    expenses: 'செலவுகள் (Expenses)',
    settleUp: 'கணக்கு முடி (UPI)',
    sharedKitty: 'குழு நிதி (Group Fund)',
    insightsWrapped: 'அறிக்கை மற்றும் பார்வை',
    friends: 'நண்பர்கள் (Friends)',
    itinerary: 'பயண திட்டம் (Itinerary)',
    analytics: 'பகுப்பாய்வு (Analytics)',

    trips: 'பயணங்கள் (Trips)',
    selectTrip: 'பயணத்தை தேர்வு செய்க',
    myTrips: 'எனது பயணங்கள்',
    newTrip: 'புதிய பயணம் தொடங்கு',
    switchTrip: 'பயணத்தை மாற்று',

    addExpense: 'செலவு சேர்',
    scanBill: 'பில் ஸ்கேன் செய்க',
    voiceEntry: 'குரல் மூலம் எழுதுக',
    joinTrip: 'பயணத்தில் சேர',
    invite: 'நண்பர்களை அழைக்க',
    export: 'அறிக்கை ஏற்றுமதி',
    loadDemo: 'டெமோ பயணம் பார்க்க',
    installApp: 'செயலி நிறுவுக',
    playStoreReady: 'ப்ளே ஸ்டோர் தயார்',

    groupFund: 'குழு நிதி',
    groupFundPot: 'குழு நிதி உண்டியல்',
    contribute: 'பணம் செலுத்த',
    fundCollected: 'மொத்த வசூல்',
    fundSpent: 'நிதியிலிருந்து செலவு',
    remainingCash: 'மீதமுள்ள ரொக்கம்',
    poolMoreCash: 'குழு நிதியில் பணம் சேர்க்கவும்',
    logChaiToll: 'டீ / டோல் / சிறு செலவு',

    addFriend: 'நண்பரை சேர்க்க',
    removeFriend: 'நண்பரை நீக்குக',
    cannotRemoveSelf: 'உங்களை நீங்களே பயணத்திலிருந்து நீக்க முடியாது',
    activeMembers: 'செயலில் உள்ள நண்பர்கள்',
    pastMembers: 'முந்தைய நண்பர்கள் (கணக்கில்)',
    leftTrip: 'விலகியவர்',
    friendFullName: 'நண்பரின் முழு பெயர்',
    mobileNumber: 'மொபைல் எண்',
    upiId: 'யுபிஐ ஐடி (UPI ID)',
    selectFromContacts: 'தொடர்புகளிலிருந்து தேர்வு',
    you: 'நீங்கள் (You)',

    totalGroupSpend: 'குழுவின் மொத்த செலவு',
    avgPerFriend: 'ஒருவருக்கு சராசரி',
    topSpender: 'அதிக செலவு செய்தவர்',
    availableKitty: 'குழு நிதியில் கையிருப்பு',
    netStanding: 'நிகர நிலை',
    netBalance: 'நிகர இருப்பு (Net Balance)',
    owes: 'தர வேண்டும்',
    getsBack: 'வர வேண்டும்',
    allSettled: 'அனைத்து கணக்குகளும் முடிந்தது! பாக்கி இல்லை.',

    saveExpense: 'செலவை சேமி',
    editExpense: 'செலவை திருத்து',
    deleteExpense: 'செலவை நீக்கு',
    whoPaid: 'யார் பணம் செலுத்தியது?',
    splitMethod: 'பிரிக்கும் முறை',
    equalOptOut: 'சமமாக பிரி',
    exactAmounts: 'சரியான தொகை',
    percentageShares: 'சதவீதம் (%)',
    payWithUpi: 'UPI QR மூலம் செலுத்துக',
    markPaid: 'கொடுத்துவிட்டதாக பதிவு செய்',
    settleNow: 'UPI மூலம் கணக்கு முடி',
    paymentRecorded: 'பணம் பதிவு செய்யப்பட்டது',
    cancel: 'ரத்து செய்',
    close: 'மூடு',
    confirm: 'உறுதி செய்',
    notes: 'விவரங்கள் / குறிப்பு',
    amount: 'தொகை (₹)',
    date: 'தேதி',
    category: 'வகை (Category)',
    searchExpenses: 'செலவுகளை தேடுங்கள்...',
    noExpensesYet: 'இதுவரை எந்த செலவும் இல்லை',
    addFirstExpense: 'முதல் செலவை சேர்த்து தொடங்கவும்!',
    shareWhatsApp: 'வாட்ஸ்அப்பில் பகிர்க',
    downloadApk: 'APK பதிவிறக்குக',
    theme: 'தீம்',
    signOut: 'வெளியேறு',

    stayHotel: 'தங்குமிடம் / ஹோட்டல்',
    foodDrinks: 'உணவு மற்றும் பானங்கள்',
    travelFuel: 'பயணம் மற்றும் எரிபொருள்',
    activities: 'கேளிக்கை நிகழ்வுகள்',
    groceries: 'மளிகை மற்றும் தின்பண்டங்கள்',
    misc: 'இதர செலவுகள்',

    groupBanker: 'குழு வங்கி அதிகாரி',
    chaiLover: 'டீ பிரியர்',
    bigSplurger: 'அதிக செலவாளி',
    budgetNinja: 'சிக்கன வீரர்',
  },

  te: {
    expenses: 'ఖర్చులు (Expenses)',
    settleUp: 'లెక్క సరిచేయి (UPI)',
    sharedKitty: 'గ్రూప్ ఫండ్ (Group Fund)',
    insightsWrapped: 'నివేదిక & వివరాలు',
    friends: 'స్నేహితులు (Friends)',
    itinerary: 'ట్రిప్ ప్లాన్ (Itinerary)',
    analytics: 'విశ్లేషణ (Analytics)',

    trips: 'ట్రిప్పులు (Trips)',
    selectTrip: 'ట్రిప్ ఎంచుకోండి',
    myTrips: 'నా ట్రిప్పులు',
    newTrip: 'కొత్త ట్రిప్ రూపొందించు',
    switchTrip: 'ట్రిప్ మార్చండి',

    addExpense: 'ఖర్చు నమోదు చేయండి',
    scanBill: 'బిల్లు స్కాన్ చేయండి',
    voiceEntry: 'వాయిస్ ద్వారా రాయండి',
    joinTrip: 'ట్రిప్‌లో చేరండి',
    invite: 'స్నేహితులను ఆహ్వానించండి',
    export: 'డేటా డౌన్‌లోడ్',
    loadDemo: 'డెమో ట్రిప్ చూడండి',
    installApp: 'యాప్ ఇన్‌స్టాల్ చేయండి',
    playStoreReady: 'ప్లే స్టోర్ సిద్ధం',

    groupFund: 'గ్రూప్ ఫండ్',
    groupFundPot: 'గ్రూప్ ఫండ్ నిల్వ',
    contribute: 'డబ్బులు జతచేయండి',
    fundCollected: 'మొత్తం జమ అయిన మొత్తం',
    fundSpent: 'ఫండ్ నుండి ఖర్చు',
    remainingCash: 'మిగిలిన నగదు',
    poolMoreCash: 'గ్రూప్ ఫండ్‌లో డబ్బు వేయండి',
    logChaiToll: 'టీ / టోల్ / చిల్లర ఖర్చు',

    addFriend: 'స్నేహితుడిని చేర్చండి',
    removeFriend: 'స్నేహితుడిని తొలగించండి',
    cannotRemoveSelf: 'మిమ్మల్ని మీరు ట్రిప్ నుండి తొలగించలేరు',
    activeMembers: 'యాక్టివ్ స్నేహితులు',
    pastMembers: 'గత సభ్యులు (లెక్కలలో ఉన్నారు)',
    leftTrip: 'ట్రిప్ వీడారు',
    friendFullName: 'స్నేహితుడి పూర్తి పేరు',
    mobileNumber: 'మొబైల్ నంబర్',
    upiId: 'యూపీఐ ఐడీ (UPI ID)',
    selectFromContacts: 'కాంటాక్ట్స్ నుండి ఎంచుకోండి',
    you: 'మీరు (You)',

    totalGroupSpend: 'గ్రూప్ మొత్తం ఖర్చు',
    avgPerFriend: 'ఒక్కొక్కరికి సగటు',
    topSpender: 'ఎక్కువ ఖర్చు చేసిన వ్యక్తి',
    availableKitty: 'గ్రూప్ ఫండ్‌లో మిగిలినది',
    netStanding: 'నికర స్థితి',
    netBalance: 'నికర బ్యాలెన్స్ (Net Balance)',
    owes: 'ఇవ్వాలి',
    getsBack: 'రావాలి',
    allSettled: 'అన్ని లెక్కలు సరిపోయాయి! ఏ బకాయి లేదు.',

    saveExpense: 'ఖర్చు భద్రపరుచు',
    editExpense: 'ఖర్చు సవరించు',
    deleteExpense: 'ఖర్చు తొలగించు',
    whoPaid: 'ఎవరు చెల్లించారు?',
    splitMethod: 'పంచే విధానం',
    equalOptOut: 'సమానంగా పంపకం',
    exactAmounts: 'ఖచ్చితమైన మొత్తం',
    percentageShares: 'శాతం (%) పంపకం',
    payWithUpi: 'UPI QR ద్వారా చెల్లించండి',
    markPaid: 'చెల్లించినట్లు నమోదు చేయండి',
    settleNow: 'UPI ద్వారా చెల్లించు',
    paymentRecorded: 'చెల్లింపు రికార్డ్ చేయబడింది',
    cancel: 'రద్దు చేయండి',
    close: 'మూసివేయి',
    confirm: 'నిర్ధారించు',
    notes: 'వివరాలు / నోట్స్',
    amount: 'మొత్తం (₹)',
    date: 'తేదీ',
    category: 'వర్గం (Category)',
    searchExpenses: 'ఖర్చులు వెతకండి...',
    noExpensesYet: 'ఇంకా ఏ ఖర్చు నమోదు కాలేదు',
    addFirstExpense: 'ట్రాక్ చేయడానికి మొదటి ఖర్చు నమోదు చేయండి!',
    shareWhatsApp: 'వాట్సాప్‌లో షేర్ చేయండి',
    downloadApk: 'APK డౌన్‌లోడ్ చేయండి',
    theme: 'థీమ్',
    signOut: 'లాగ్ అవుట్',

    stayHotel: 'హోటల్ / బస',
    foodDrinks: 'ఆహారం & పానీయాలు',
    travelFuel: 'ప్రయాణం & పెట్రోల్',
    activities: 'వినోదం & ఈవెంట్లు',
    groceries: 'కిరాణా & స్నాక్స్',
    misc: 'ఇతర ఖర్చులు',

    groupBanker: 'గ్రూప్ బ్యాంకర్',
    chaiLover: 'టీ ప్రియుడు',
    bigSplurger: 'పెద్ద ఖర్చుదారుడు',
    budgetNinja: 'బడ్జెట్ నింజా',
  },

  mr: {
    expenses: 'खर्च (Expenses)',
    settleUp: 'हिशोब चुकता करा (UPI)',
    sharedKitty: 'ग्रुप फंड (Group Fund)',
    insightsWrapped: 'अहवाल आणि विश्लेषण',
    friends: 'मित्र (Friends)',
    itinerary: 'प्रवास योजना (Itinerary)',
    analytics: 'विश्लेषण (Analytics)',

    trips: 'सहली (Trips)',
    selectTrip: 'सहल निवडा',
    myTrips: 'माझ्या सहली',
    newTrip: 'नवीन ट्रिप सुरू करा',
    switchTrip: 'ट्रिप बदला',

    addExpense: 'खर्च जोडा',
    scanBill: 'बिल स्कॅन करा',
    voiceEntry: 'आवाजाने नोंदवा',
    joinTrip: 'ट्रिपमध्ये सामील व्हा',
    invite: 'मित्रांना आमंत्रित करा',
    export: 'डेटा डाउनलोड करा',
    loadDemo: 'डेमो ट्रिप पहा',
    installApp: 'अ‍ॅप इन्स्टॉल करा',
    playStoreReady: 'प्ले स्टोअर तयार',

    groupFund: 'ग्रुप फंड',
    groupFundPot: 'ग्रुप फंड गल्ला',
    contribute: 'पैसे जमा करा',
    fundCollected: 'एकूण जमा रक्कम',
    fundSpent: 'फंडमधून झालेला खर्च',
    remainingCash: 'शिल्लक रोख रक्कम',
    poolMoreCash: 'ग्रुप फंडमध्ये रोख रक्कम जोडा',
    logChaiToll: 'चहा / टोल / छोटा खर्च',

    addFriend: 'मित्र जोडा',
    removeFriend: 'मित्राला काढून टाका',
    cannotRemoveSelf: 'तुम्ही स्वतःला ट्रिपमधून काढू शकत नाही',
    activeMembers: 'सक्रिय मित्र',
    pastMembers: 'माजी सदस्य (हिशोबात सामील)',
    leftTrip: 'सहल सोडली',
    friendFullName: 'मित्राचे पूर्ण नाव',
    mobileNumber: 'मोबाईल नंबर',
    upiId: 'यूपीआय आयडी (UPI ID)',
    selectFromContacts: 'कॉन्टॅक्ट्समधून निवडा',
    you: 'तुम्ही (You)',

    totalGroupSpend: 'ग्रुपचा एकूण खर्च',
    avgPerFriend: 'प्रत्येकी सरासरी',
    topSpender: 'सर्वाधिक खर्च करणारा',
    availableKitty: 'ग्रुप फंडमध्ये उपलब्ध',
    netStanding: 'एकूण बाकी',
    netBalance: 'निव्वळ बाकी (Net Balance)',
    owes: 'द्यायचे आहेत',
    getsBack: 'यायचे आहेत',
    allSettled: 'सर्व हिशोब पूर्ण! कोणतीही बाकी नाही.',

    saveExpense: 'खर्च सेव्ह करा',
    editExpense: 'खर्च बदला',
    deleteExpense: 'खर्च हटवा',
    whoPaid: 'कोणी पैसे दिले?',
    splitMethod: 'वाटप पद्धत',
    equalOptOut: 'समान वाटप (सगळ्यांमध्ये)',
    exactAmounts: 'अचूक रक्कम',
    percentageShares: 'टक्केवारी (%) हिस्सा',
    payWithUpi: 'UPI QR द्वारे पैसे द्या',
    markPaid: 'चुकता नोंदवा',
    settleNow: 'UPI ने चुकता करा',
    paymentRecorded: 'पेमेंट नोंदवले गेले',
    cancel: 'रद्द करा',
    close: 'बंद करा',
    confirm: 'खात्री करा',
    notes: 'तपशील / नोट्स',
    amount: 'रक्कम (₹)',
    date: 'तारीख',
    category: 'प्रवर्ग (Category)',
    searchExpenses: 'खर्च शोधा...',
    noExpensesYet: 'अजून कोणताही खर्च नोंदवला नाही',
    addFirstExpense: 'सुरू करण्यासाठी पहिला खर्च जोडा!',
    shareWhatsApp: 'व्हॉट्सअ‍ॅपवर शेअर करा',
    downloadApk: 'APK डाउनलोड करा',
    theme: 'थीम',
    signOut: 'लॉग आउट',

    stayHotel: 'हॉटेल / मुक्काम',
    foodDrinks: 'जेवण आणि चहा-पाणी',
    travelFuel: 'प्रवास आणि इंधन',
    activities: 'मनोरंजन आणि तिकिटे',
    groceries: 'किराणा आणि स्नॅक्स',
    misc: 'इतर किरकोळ खर्च',

    groupBanker: 'ग्रुपचा बँकर',
    chaiLover: 'चहा प्रेमी',
    bigSplurger: 'मोठा खर्च करणारा',
    budgetNinja: 'बजेट निन्जा',
  },

  gu: {
    expenses: 'ખર્ચાઓ (Expenses)',
    settleUp: 'હિસાબ ચુકતે કરો (UPI)',
    sharedKitty: 'ગ્રુપ ફંડ (Group Fund)',
    insightsWrapped: 'રિપોર્ટ અને સમીક્ષા',
    friends: 'મિત્રો (Friends)',
    itinerary: 'ટ્રિપ પ્લાન (Itinerary)',
    analytics: 'વિશ્લેષણ (Analytics)',

    trips: 'ટ્રિપ્સ (Trips)',
    selectTrip: 'ટ્રિપ પસંદ કરો',
    myTrips: 'મારી ટ્રિપ્સ',
    newTrip: 'નવી ટ્રિપ બનાવો',
    switchTrip: 'ટ્રિપ બદલો',

    addExpense: 'ખર્ચ ઉમેરો',
    scanBill: 'બિલ સ્કેન કરો',
    voiceEntry: 'બોલીને લખો',
    joinTrip: 'ટ્રિપમાં જોડાવો',
    invite: 'મિત્રોને આમંત્રિત કરો',
    export: 'ડેટા ડાઉનલોડ',
    loadDemo: 'ડેમો ટ્રિપ જુઓ',
    installApp: 'એપ ઇન્સ્ટોલ કરો',
    playStoreReady: 'પ્લે સ્ટોર તૈયાર',

    groupFund: 'ગ્રુપ ફંડ',
    groupFundPot: 'ગ્રુપ ફંડ ગલ્લો',
    contribute: 'રૂપિયા જમા કરો',
    fundCollected: 'કુલ જમા રકમ',
    fundSpent: 'ફંડમાંથી ખર્ચ',
    remainingCash: 'બાકી રોકડ',
    poolMoreCash: 'ગ્રુપ ફંડમાં પૈસા ઉમેરો',
    logChaiToll: 'ચા / ટોલ / નાનો ખર્ચ',

    addFriend: 'મિત્ર ઉમેરો',
    removeFriend: 'મિત્રને દૂર કરો',
    cannotRemoveSelf: 'તમે તમારી જાતને ટ્રિપમાંથી દૂર કરી શકતા નથી',
    activeMembers: 'સક્રિય મિત્રો',
    pastMembers: 'પાછલા સભ્યો (હિસાબમાં સામેલ)',
    leftTrip: 'ટ્રિપ છોડી',
    friendFullName: 'મિત્રનું પૂરું નામ',
    mobileNumber: 'મોબાઇલ નંબર',
    upiId: 'યુપીઆઈ આઈડી (UPI ID)',
    selectFromContacts: 'સંપર્કોમાંથી પસંદ કરો',
    you: 'તમે (You)',

    totalGroupSpend: 'ગ્રુપનો કુલ ખર્ચ',
    avgPerFriend: 'વ્યક્તિ દીઠ સરેરાશ',
    topSpender: 'સૌથી વધુ ખર્ચ કરનાર',
    availableKitty: 'ગ્રુપ ફંડમાં ઉપલબ્ધ',
    netStanding: 'નેટ સ્થિતિ',
    netBalance: 'ચોખ્ખી બાકી (Net Balance)',
    owes: 'આપવાના છે',
    getsBack: 'લેવાના છે',
    allSettled: 'બધો હિસાબ સરભર! કોઈ બાકી નથી.',

    saveExpense: 'ખર્ચ સેવ કરો',
    editExpense: 'ખર્ચ સુધારો',
    deleteExpense: 'ખર્ચ કાઢી નાખો',
    whoPaid: 'કોણે ચુકવણી કરી?',
    splitMethod: 'ભાગ પાડવાની રીત',
    equalOptOut: 'સરખા ભાગે (બધામાં)',
    exactAmounts: 'ચોક્કસ રકમ',
    percentageShares: 'ટકાવારી (%) હિસ્સો',
    payWithUpi: 'UPI QR થી ચુકવો',
    markPaid: 'ચુકતે નોંધો',
    settleNow: 'UPI થી ચુકતે કરો',
    paymentRecorded: 'ચુકવણી નોંધાઈ ગઈ',
    cancel: 'રદ કરો',
    close: 'બંધ કરો',
    confirm: 'ખાતરી કરો',
    notes: 'વિગતો / નોંધ',
    amount: 'રકમ (₹)',
    date: 'તારીખ',
    category: 'શ્રેણી (Category)',
    searchExpenses: 'ખર્ચ શોધો...',
    noExpensesYet: 'હજુ કોઈ ખર્ચ નોંધાયો નથી',
    addFirstExpense: 'શરૂ કરવા માટે પહેલો ખર્ચ ઉમેરો!',
    shareWhatsApp: 'વોટ્સએપ પર શેર કરો',
    downloadApk: 'APK ડાઉનલોડ કરો',
    theme: 'થીમ',
    signOut: 'લોગ આઉટ',

    stayHotel: 'હોટેલ / રોકાણ',
    foodDrinks: 'જમવાનું અને ચા-નાસ્તો',
    travelFuel: 'મુસાફરી અને પેટ્રોલ',
    activities: 'મનોરંજન અને પ્રવૃત્તિઓ',
    groceries: 'કરિયાણું અને નાસ્તો',
    misc: 'પરચૂરણ ખર્ચ',

    groupBanker: 'ગ્રુપનો બેન્કર',
    chaiLover: 'ચા પ્રેમી',
    bigSplurger: 'મોટો ખર્ચાળ',
    budgetNinja: 'બજેટ નિન્જા',
  },

  bn: {
    expenses: 'খরচসমূহ (Expenses)',
    settleUp: 'হিসাব মেটান (UPI)',
    sharedKitty: 'গ্রুপ ফান্ড (Group Fund)',
    insightsWrapped: 'প্রতিবেদন ও অন্তর্দৃষ্টি',
    friends: 'বন্ধুরা (Friends)',
    itinerary: 'ভ্রমণ পরিকল্পনা (Itinerary)',
    analytics: 'বিশ্লেষণ (Analytics)',

    trips: 'ভ্রমণসমূহ (Trips)',
    selectTrip: 'ভ্রমণ নির্বাচন করুন',
    myTrips: 'আমার ভ্রমণসমূহ',
    newTrip: 'নতুন ভ্রমণ তৈরি করুন',
    switchTrip: 'ভ্রমণ পরিবর্তন করুন',

    addExpense: 'খরচ যোগ করুন',
    scanBill: 'বিল স্ক্যান করুন',
    voiceEntry: 'কণ্ঠ দিয়ে লিখুন',
    joinTrip: 'ভ্রমণে যোগ দিন',
    invite: 'বন্ধুদের আমন্ত্রণ জানান',
    export: 'রিপোর্ট ডাউনলোড',
    loadDemo: 'ডেমো ট্রিপ দেখুন',
    installApp: 'অ্যাপ ইনস্টল করুন',
    playStoreReady: 'প্লে স্টোর প্রস্তুত',

    groupFund: 'গ্রুপ ফান্ড',
    groupFundPot: 'গ্রুপ ফান্ড ভান্ডার',
    contribute: 'টাকা জমা দিন',
    fundCollected: 'মোট সংগৃহীত টাকা',
    fundSpent: 'ফান্ড থেকে খরচ',
    remainingCash: 'অবশিষ্ট নগদ টাকা',
    poolMoreCash: 'গ্রুপ ফান্ডে টাকা জমা করুন',
    logChaiToll: 'চা / টোল / খুচরো খরচ',

    addFriend: 'বন্ধু যোগ করুন',
    removeFriend: 'বন্ধুকে সরান',
    cannotRemoveSelf: 'আপনি নিজেকে ভ্রমণ থেকে সরাতে পারবেন না',
    activeMembers: 'সক্রিয় বন্ধুরা',
    pastMembers: 'পূর্বতন সদস্যরা (হিসেবে অন্তর্ভুক্ত)',
    leftTrip: 'ভ্রমণ ছেড়েছেন',
    friendFullName: 'বন্ধুর পুরো নাম',
    mobileNumber: 'মোবাইল নম্বর',
    upiId: 'ইউপিআই আইডি (UPI ID)',
    selectFromContacts: 'কন্টাক্টস থেকে বাছুন',
    you: 'আপনি (You)',

    totalGroupSpend: 'গ্রুপের মোট খরচ',
    avgPerFriend: 'মাথাপিছু গড় খরচ',
    topSpender: 'সবচেয়ে বেশি খরচকারী',
    availableKitty: 'গ্রুপ ফান্ডে অবশিষ্ট টাকা',
    netStanding: 'মোট স্থিতি',
    netBalance: 'নেট ব্যালেন্স (Net Balance)',
    owes: 'দেবেন',
    getsBack: 'পাবেন',
    allSettled: 'সব হিসাব চুকিয়ে গেছে! কোনো বাকি নেই।',

    saveExpense: 'খরচ সংরক্ষণ করুন',
    editExpense: 'খরচ সম্পাদনা করুন',
    deleteExpense: 'খরচ মুছুন',
    whoPaid: 'কে পরিশোধ করেছেন?',
    splitMethod: 'ভাগ করার পদ্ধতি',
    equalOptOut: 'সমান ভাগ (সবার মধ্যে)',
    exactAmounts: 'নির্দিষ্ট পরিমাণ',
    percentageShares: 'শতাংশ (%) ভাগ',
    payWithUpi: 'UPI QR দিয়ে দিন',
    markPaid: 'পরিশোধিত চিহ্নিত করুন',
    settleNow: 'UPI দিয়ে মেটান',
    paymentRecorded: 'পরিশোধ নথিভুক্ত হয়েছে',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',
    confirm: 'নিশ্চিত করুন',
    notes: 'বিবরণ / নোট',
    amount: 'পরিমাণ (₹)',
    date: 'তারিখ',
    category: 'বিভাগ (Category)',
    searchExpenses: 'খরচ খুঁজুন...',
    noExpensesYet: 'এখনও কোনো খরচ নেই',
    addFirstExpense: 'শুরু করতে প্রথম খরচটি যোগ করুন!',
    shareWhatsApp: 'হোয়াটসঅ্যাপে শেয়ার করুন',
    downloadApk: 'APK ডাউনলোড করুন',
    theme: 'থিম',
    signOut: 'লগ আউট',

    stayHotel: 'হোটেল / বাসস্থান',
    foodDrinks: 'খাবার ও পানীয়',
    travelFuel: 'ভ্রমণ ও জ্বালানি',
    activities: 'বিনোদন ও টিকিট',
    groceries: 'মুদি ও স্ন্যাক্স',
    misc: 'বিবিধ খরচ',

    groupBanker: 'গ্রুপের ব্যাংকার',
    chaiLover: 'চা প্রেমী',
    bigSplurger: 'বড় খরুচে',
    budgetNinja: 'বাজেট নিনজা',
  },
};

export function getTranslation(lang: SupportedLanguage): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
