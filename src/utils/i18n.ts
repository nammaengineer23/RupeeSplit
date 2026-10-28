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
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

export interface TranslationDictionary {
  // Navigation & Tabs
  expenses: string;
  settleUp: string;
  sharedKitty: string;
  insightsWrapped: string;
  friends: string;

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
  whoPaid: string;
  splitMethod: string;
  equalOptOut: string;
  exactAmounts: string;
  percentageShares: string;
  poolMoreCash: string;
  logChaiToll: string;
  payWithUpi: string;
  markPaid: string;
  cancel: string;
  close: string;

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
    sharedKitty: 'Shared Kitty',
    insightsWrapped: 'Insights & Wrapped',
    friends: 'Friends',

    addExpense: 'Add Expense',
    scanBill: 'Scan Bill',
    voiceEntry: 'Voice Entry',
    joinTrip: 'Join Trip',
    invite: 'Invite',
    export: 'Export',
    loadDemo: 'Load Demo',
    installApp: 'Install App',
    playStoreReady: 'Play Store Ready',

    totalGroupSpend: 'Total Group Spend',
    avgPerFriend: 'Avg Per Friend',
    topSpender: 'Top Spender',
    availableKitty: 'Available Kitty Cash',
    netStanding: 'Net Group Standing',
    netBalance: 'Net Balance',
    owes: 'owes',
    getsBack: 'gets back',
    allSettled: 'All friends are squared up & settled!',

    saveExpense: 'Save Expense',
    editExpense: 'Edit Expense',
    whoPaid: 'Who Paid?',
    splitMethod: 'Split Method',
    equalOptOut: 'Equal (Opt-out)',
    exactAmounts: 'Exact Amounts',
    percentageShares: 'Percentages %',
    poolMoreCash: 'Pool More Cash',
    logChaiToll: 'Log Chai / Toll',
    payWithUpi: 'Pay with UPI & QR',
    markPaid: 'Mark Paid',
    cancel: 'Cancel',
    close: 'Close',

    stayHotel: 'Stay/Hotel',
    foodDrinks: 'Food & Drinks',
    travelFuel: 'Travel/Fuel',
    activities: 'Activities',
    groceries: 'Groceries',
    misc: 'Misc',

    groupBanker: 'The Group Banker',
    chaiLover: 'Chai & Snacks Lover',
    bigSplurger: 'Highest Single Bill',
    budgetNinja: 'Budget Ninja',
  },

  hi: {
    expenses: 'खर्चे (Expenses)',
    settleUp: 'हिसाब-किताब (UPI)',
    sharedKitty: 'साझा किटी (Kitty)',
    insightsWrapped: 'समरी और विश्लेषण',
    friends: 'दोस्त (Friends)',

    addExpense: 'खर्चा जोड़ें',
    scanBill: 'बिल स्कैन करें',
    voiceEntry: 'बोलकर लिखें',
    joinTrip: 'ट्रिप में जुड़ें',
    invite: 'न्योता दें',
    export: 'एक्सपोर्ट',
    loadDemo: 'डेमो लोड करें',
    installApp: 'ऐप इंस्टॉल करें',
    playStoreReady: 'प्ले स्टोर रेडी',

    totalGroupSpend: 'कुल ग्रुप का खर्चा',
    avgPerFriend: 'प्रति दोस्त औसत',
    topSpender: 'सबसे ज्यादा खर्च करने वाला',
    availableKitty: 'उपलब्ध किटी कैश',
    netStanding: 'ग्रुप का कुल बैलेंस',
    netBalance: 'नेट बैलेंस',
    owes: 'देना है',
    getsBack: 'लेना है',
    allSettled: 'सभी दोस्तों का पूरा हिसाब चुकता हो चुका है!',

    saveExpense: 'खर्चा सेव करें',
    editExpense: 'खर्चा बदलें',
    whoPaid: 'किसने दिया?',
    splitMethod: 'बांटने का तरीका',
    equalOptOut: 'बराबर (वैकल्पिक)',
    exactAmounts: 'सटीक रकम',
    percentageShares: 'प्रतिशत %',
    poolMoreCash: 'किटी में पैसे डालें',
    logChaiToll: 'चाय / टोल लिखें',
    payWithUpi: 'UPI और QR से चुकाएं',
    markPaid: 'चुकाया गया मार्क करें',
    cancel: 'रद्द करें',
    close: 'बंद करें',

    stayHotel: 'होटल / स्टे',
    foodDrinks: 'खाना और ड्रिंक्स',
    travelFuel: 'यात्रा / पेट्रोल',
    activities: 'मनोरंजन / एक्टिविटी',
    groceries: 'किराना सामान',
    misc: 'अन्य खर्चे',

    groupBanker: 'ग्रुप का बैंकर',
    chaiLover: 'चाय-नाश्ता प्रेमी',
    bigSplurger: 'सबसे बड़ा बिल',
    budgetNinja: 'बजट निंजा',
  },

  hinglish: {
    expenses: 'Kharcha List',
    settleUp: 'Hisaab Chuktao (UPI)',
    sharedKitty: 'Shared Kitty Cash',
    insightsWrapped: 'Trip Wrapped',
    friends: 'Dost (Friends)',

    addExpense: '+ Kharcha Add Karo',
    scanBill: 'Bill Scan Karo',
    voiceEntry: 'Bol kar Add Karo',
    joinTrip: 'Trip Join Karo',
    invite: 'Invite Friends',
    export: 'Share / Export',
    loadDemo: 'Demo Data',
    installApp: 'Install App',
    playStoreReady: 'Play Store Ready',

    totalGroupSpend: 'Total Group Kharcha',
    avgPerFriend: 'Per Head Average',
    topSpender: 'Sabse Bada Spender',
    availableKitty: 'Kitty Me Cash Bacha',
    netStanding: 'Kisne Kitna Dena / Lena Hai',
    netBalance: 'Net Balance',
    owes: 'owes',
    getsBack: 'paayega',
    allSettled: 'Sabka hisaab barabar ho gaya!',

    saveExpense: 'Kharcha Save Karo',
    editExpense: 'Edit Karo',
    whoPaid: 'Payment Kisne Ki?',
    splitMethod: 'Kaise Baante?',
    equalOptOut: 'Barabar Baanto',
    exactAmounts: 'Fix Rupee Baanto',
    percentageShares: 'Percentage %',
    poolMoreCash: 'Kitty Me Paise Daalo',
    logChaiToll: 'Chai / Toll Entry',
    payWithUpi: 'UPI QR Se Pay Karo',
    markPaid: 'Paid Mark Karo',
    cancel: 'Cancel',
    close: 'Band Karo',

    stayHotel: 'Hotel / Villa',
    foodDrinks: 'Food & Drinks',
    travelFuel: 'Cab / Petrol',
    activities: 'Activities & Fun',
    groceries: 'Groceries & Snacks',
    misc: 'Misc / Khulle',

    groupBanker: 'The Group Banker',
    chaiLover: 'Chai & Snacks Lover',
    bigSplurger: 'Sabse Bada Bill',
    budgetNinja: 'Smart Saver Ninja',
  },

  mr: {
    expenses: 'खर्च (Expenses)',
    settleUp: 'हिशोब करा (UPI)',
    sharedKitty: 'शेअर्ड किटी',
    insightsWrapped: 'ट्रिप रॅप्ड',
    friends: 'मित्र (Friends)',

    addExpense: 'खर्च जोडा',
    scanBill: 'बिल स्कॅन करा',
    voiceEntry: 'आवाजाने जोडा',
    joinTrip: 'ट्रिपमध्ये सामील व्हा',
    invite: 'आमंत्रण द्या',
    export: 'निर्यात (Export)',
    loadDemo: 'डेमो ट्रिप',
    installApp: 'ॲप इंस्टॉल करा',
    playStoreReady: 'प्ले स्टोअर रेडी',

    totalGroupSpend: 'एकूण ग्रुप खर्च',
    avgPerFriend: 'प्रत्येकी सरासरी',
    topSpender: 'सर्वाधिक खर्च करणारा',
    availableKitty: 'शिल्लक किटी कॅश',
    netStanding: 'ग्रुपमधील अंतिम शिल्लक',
    netBalance: 'शिल्लक रक्कम',
    owes: 'देणे आहे',
    getsBack: 'मिळणे आहे',
    allSettled: 'सर्व हिशोब पूर्णपणे क्लिअर झाले आहेत!',

    saveExpense: 'खर्च जतन करा',
    editExpense: 'खर्च संपादित करा',
    whoPaid: 'कोणी भरले?',
    splitMethod: 'वाटप पद्धत',
    equalOptOut: 'समान वाटप',
    exactAmounts: 'निश्चित रक्कम',
    percentageShares: 'टक्केवारी %',
    poolMoreCash: 'किटीमध्ये जमा करा',
    logChaiToll: 'चहा / टोल नोंदवा',
    payWithUpi: 'UPI व QR ने द्या',
    markPaid: 'पेड मार्क करा',
    cancel: 'रद्द करा',
    close: 'बंद करा',

    stayHotel: 'हॉटेल / स्टे',
    foodDrinks: 'खाद्यपदार्थ व पेये',
    travelFuel: 'प्रवास / इंधन',
    activities: 'ऍक्टिव्हिटीज',
    groceries: 'किराणा सामान',
    misc: 'इतर',

    groupBanker: 'ग्रुपचा बँकर',
    chaiLover: 'चहा-नाश्ता प्रेमी',
    bigSplurger: 'सर्वात मोठे बिल',
    budgetNinja: 'बजेट निन्जा',
  },

  gu: {
    expenses: 'ખર્ચાઓ (Expenses)',
    settleUp: 'હિસાબ ચુકવો (UPI)',
    sharedKitty: 'શેર્ડ કીટી (Kitty)',
    insightsWrapped: 'ટ્રિપ સારાંશ',
    friends: 'મિત્રો (Friends)',

    addExpense: 'ખર્ચ ઉમેરો',
    scanBill: 'બિલ સ્કેન કરો',
    voiceEntry: 'બોલીને ઉમેરો',
    joinTrip: 'ટ્રિપમાં જોડાઓ',
    invite: 'આમંત્રણ આપો',
    export: 'નિકાસ (Export)',
    loadDemo: 'ડેમો ડેટા',
    installApp: 'ઍપ ઇન્સ્ટોલ કરો',
    playStoreReady: 'પ્લે સ્ટોર રેડી',

    totalGroupSpend: 'કુલ ગ્રૂપ ખર્ચ',
    avgPerFriend: 'પ્રતિ વ્યક્તિ સરેરાશ',
    topSpender: 'સૌથી વધુ ખર્ચનાર',
    availableKitty: 'ઉપલબ્ધ કીટી રોકડ',
    netStanding: 'ગ્રૂપ સ્ટેન્ડિંગ',
    netBalance: 'ચોખ્ખો હિસાબ',
    owes: 'આપવાના છે',
    getsBack: 'લેવાના છે',
    allSettled: 'બધા હિસાબ ચુકતે થઈ ગયા છે!',

    saveExpense: 'ખર્ચ સાચવો',
    editExpense: 'ખર્ચ સુધારો',
    whoPaid: 'કોણે ચૂકવ્યું?',
    splitMethod: 'ભાગ કરવાની રીત',
    equalOptOut: 'સરખા ભાગે',
    exactAmounts: 'ચોક્કસ રકમ',
    percentageShares: 'ટકાવારી %',
    poolMoreCash: 'કીટીમાં પૈસા ઉમેરો',
    logChaiToll: 'ચા / ટોલ નોંધો',
    payWithUpi: 'UPI થી ચુકવો',
    markPaid: 'ચૂકવાઈ ગયું',
    cancel: 'રદ કરો',
    close: 'બંધ કરો',

    stayHotel: 'હોટેલ / રોકાણ',
    foodDrinks: 'ખોરાક અને પીણાં',
    travelFuel: 'પ્રવાસ / પેટ્રોલ',
    activities: 'મનોરંજન',
    groceries: 'કરિયાણું',
    misc: 'અન્ય',

    groupBanker: 'ગ્રૂપ બેન્કર',
    chaiLover: 'ચા-નાસ્તા પ્રેમી',
    bigSplurger: 'સૌથી મોટું બિલ',
    budgetNinja: 'બજેટ નિન્જા',
  },

  bn: {
    expenses: 'খরচ (Expenses)',
    settleUp: 'হিসাব মেটান (UPI)',
    sharedKitty: 'শেয়ার্ড কিটি',
    insightsWrapped: 'ট্রিপ সারাংশ',
    friends: 'বন্ধুরা (Friends)',

    addExpense: 'খরচ যোগ করুন',
    scanBill: 'বিল স্ক্যান করুন',
    voiceEntry: 'মুখে বলে লিখুন',
    joinTrip: 'ট্রিপে যোগ দিন',
    invite: 'আমন্ত্রণ জানান',
    export: 'রপ্তানি (Export)',
    loadDemo: 'ডেমো ট্রিপ',
    installApp: 'অ্যাপ ইনস্টল করুন',
    playStoreReady: 'প্লে স্টোর রেডি',

    totalGroupSpend: 'গ্রুপের মোট খরচ',
    avgPerFriend: 'মাথাপিছু গড়',
    topSpender: 'সবচেয়ে বেশি খরচকারী',
    availableKitty: 'কিটি ক্যাশ অবশিষ্ট',
    netStanding: 'গ্রুপের মোট হিসাব',
    netBalance: 'ব্যালেন্স',
    owes: 'দিতে হবে',
    getsBack: 'পাবে',
    allSettled: 'সব হিসাব মিটে গেছে!',

    saveExpense: 'খরচ সংরক্ষণ করুন',
    editExpense: 'খরচ সম্পাদনা',
    whoPaid: 'কে দিয়েছে?',
    splitMethod: 'ভাগ করার পদ্ধতি',
    equalOptOut: 'সমান ভাগ',
    exactAmounts: 'নির্দিষ্ট টাকা',
    percentageShares: 'শতাংশ %',
    poolMoreCash: 'কিটিতে জমা দিন',
    logChaiToll: 'চা / টোল যোগ করুন',
    payWithUpi: 'UPI ও QR দিয়ে দিন',
    markPaid: 'পরিশোধিত করুন',
    cancel: 'বাতিল',
    close: 'বন্ধ করুন',

    stayHotel: 'হোটেল / থাকার জায়গা',
    foodDrinks: 'খাবার ও পানীয়',
    travelFuel: 'ভ্রমণ / তেল',
    activities: 'বিনোদন',
    groceries: 'মুদির বাজার',
    misc: 'অন্যান্য',

    groupBanker: 'গ্রুপ ব্যাংকার',
    chaiLover: 'চা ও স্ন্যাকস প্রেমিক',
    bigSplurger: 'সর্বোচ্চ একক বিল',
    budgetNinja: 'বাজেট মাস্টার',
  },

  ta: {
    expenses: 'செலவுகள் (Expenses)',
    settleUp: 'கணக்கு தீர்க்க (UPI)',
    sharedKitty: 'பொது கிட்டி (Kitty)',
    insightsWrapped: 'பயண தொகுப்பு',
    friends: 'நண்பர்கள் (Friends)',

    addExpense: 'செலவு சேர்',
    scanBill: 'பில் ஸ்கேன்',
    voiceEntry: 'குரல் பதிவு',
    joinTrip: 'பயணத்தில் சேர்',
    invite: 'அழைப்பிதழ்',
    export: 'ஏற்றுமதி (Export)',
    loadDemo: 'டெமோ தரவு',
    installApp: 'செயலி நிறுவவும்',
    playStoreReady: 'Play Store தயார்',

    totalGroupSpend: 'குழுவின் மொத்த செலவு',
    avgPerFriend: 'ஒருவருக்கு சராசரி',
    topSpender: 'அதிகம் செலவழித்தவர்',
    availableKitty: 'கிட்டி ரொக்கம்',
    netStanding: 'குழு கணக்கு விபரம்',
    netBalance: 'மீதி தொகை',
    owes: 'தர வேண்டும்',
    getsBack: 'பெற வேண்டும்',
    allSettled: 'அனைத்து கணக்குகளும் தீர்க்கப்பட்டன!',

    saveExpense: 'செலவை சேமிக்க',
    editExpense: 'செலவை மாற்ற',
    whoPaid: 'யார் செலுத்தினார்?',
    splitMethod: 'பிரிக்கும் முறை',
    equalOptOut: 'சமமாக',
    exactAmounts: 'சரியான தொகை',
    percentageShares: 'சதவீதம் %',
    poolMoreCash: 'கிட்டி சேர்க்க',
    logChaiToll: 'டீ / சுங்க கட்டணம்',
    payWithUpi: 'UPI QR மூலம் செலுத்து',
    markPaid: 'செலுத்தப்பட்டது',
    cancel: 'ரத்து செய்',
    close: 'மூடு',

    stayHotel: 'தங்குமிடம் / விடுதி',
    foodDrinks: 'உணவு மற்றும் பானங்கள்',
    travelFuel: 'பயணம் / எரிபொருள்',
    activities: 'கேளிக்கைகள்',
    groceries: 'மளிகை பொருட்கள்',
    misc: 'மற்றவை',

    groupBanker: 'குழுவின் வங்கியாளர்',
    chaiLover: 'டீ பிரியர்',
    bigSplurger: 'பெரிய பில்',
    budgetNinja: 'சிக்கன நிபுணர்',
  },

  te: {
    expenses: 'ఖర్చులు (Expenses)',
    settleUp: 'లెక్క తేల్చండి (UPI)',
    sharedKitty: 'షేర్డ్ కిట్టీ (Kitty)',
    insightsWrapped: 'ట్రిప్ విశ్లేషణ',
    friends: 'స్నేహితులు (Friends)',

    addExpense: 'ఖర్చు చేర్చండి',
    scanBill: 'బిల్లు స్కాన్ చేయండి',
    voiceEntry: 'మాటతో రాయండి',
    joinTrip: 'ట్రిప్‌లో చేరండి',
    invite: 'ఆహ్వానించండి',
    export: 'ఎగుమతి (Export)',
    loadDemo: 'డెమో డేటా',
    installApp: 'యాప్ ఇన్‌స్టాల్ చేయండి',
    playStoreReady: 'Play Store సిద్ధం',

    totalGroupSpend: 'మొత్తం గ్రూప్ ఖర్చు',
    avgPerFriend: 'ఒక్కొక్కరికి సగటు',
    topSpender: 'ఎక్కువ ఖర్చు చేసిన వ్యక్తి',
    availableKitty: 'కిట్టీ నగదు మిగులు',
    netStanding: 'గ్రూప్ నికర లెక్కలు',
    netBalance: 'నికర బ్యాలెన్స్',
    owes: 'ఇవ్వాలి',
    getsBack: 'రావాలి',
    allSettled: 'అందరి లెక్కలు పూర్తయ్యాయి!',

    saveExpense: 'ఖర్చు సేవ్ చేయండి',
    editExpense: 'ఖర్చు సవరించండి',
    whoPaid: 'ఎవరు చెల్లించారు?',
    splitMethod: 'పంచే విధానం',
    equalOptOut: 'సమానంగా',
    exactAmounts: 'ఖచ్చితమైన మొత్తం',
    percentageShares: 'శాతం %',
    poolMoreCash: 'కిట్టీకి డబ్బు వేయండి',
    logChaiToll: 'టీ / టోల్ నమోదు',
    payWithUpi: 'UPI QR తో చెల్లించండి',
    markPaid: 'చెల్లించినట్లు నమోదు',
    cancel: 'రద్దు చేయండి',
    close: 'మూసివేయండి',

    stayHotel: 'హోటల్ / వసతి',
    foodDrinks: 'ఆహారం & పానీయాలు',
    travelFuel: 'ప్రయాణం / ఇంధనం',
    activities: 'వినోదం',
    groceries: 'కిరాణా సామాగ్రి',
    misc: 'ఇతరాలు',

    groupBanker: 'గ్రూప్ బ్యాంకర్',
    chaiLover: 'టీ ప్రియుడు',
    bigSplurger: 'అత్యధిక సింగిల్ బిల్లు',
    budgetNinja: 'బడ్జెట్ మాస్టర్',
  },

  kn: {
    expenses: 'ವೆಚ್ಚಗಳು (Expenses)',
    settleUp: 'ಲೆಕ್ಕ ಚುಕ್ತಾ (UPI)',
    sharedKitty: 'ಹಂಚಿಕೊಂಡ ಕಿಟ್ಟಿ',
    insightsWrapped: 'ಪ್ರವಾಸದ ಸಾರಾಂಶ',
    friends: 'ಸ್ನೇಹಿತರು (Friends)',

    addExpense: 'ವೆಚ್ಚ ಸೇರಿಸಿ',
    scanBill: 'ಬಿಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    voiceEntry: 'ಧ್ವನಿ ಮೂಲಕ ಸೇರಿಸಿ',
    joinTrip: 'ಟ್ರಿಪ್‌ಗೆ ಸೇರಿ',
    invite: 'ಆಹ್ವಾನಿಸಿ',
    export: 'ರಫ್ತು (Export)',
    loadDemo: 'ಡೆಮೊ ಮಾಹಿತಿ',
    installApp: 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
    playStoreReady: 'Play Store ಸಿದ್ಧತೆ',

    totalGroupSpend: 'ಒಟ್ಟು ಗುಂಪಿನ ಖರ್ಚು',
    avgPerFriend: 'ತಲಾ ಸರಾಸರಿ',
    topSpender: 'ಅತಿ ಹೆಚ್ಚು ಖರ್ಚು ಮಾಡಿದವರು',
    availableKitty: 'ಲಭ್ಯವಿರುವ ಕಿಟ್ಟಿ ಹಣ',
    netStanding: 'ಅಂತಿಮ ಬ್ಯಾಲೆನ್ಸ್',
    netBalance: 'ಬ್ಯಾಲೆನ್ಸ್',
    owes: 'ಕೊಡಬೇಕು',
    getsBack: 'ಬರಬೇಕು',
    allSettled: 'ಎಲ್ಲಾ ಸ್ನೇಹಿತರ ಲೆಕ್ಕ ಚುಕ್ತಾ ಆಗಿದೆ!',

    saveExpense: 'ವೆಚ್ಚ ಉಳಿಸಿ',
    editExpense: 'ವೆಚ್ಚ ತಿದ್ದಿ',
    whoPaid: 'ಯಾರು ಪಾವತಿಸಿದರು?',
    splitMethod: 'ಹಂಚಿಕೆ ವಿಧಾನ',
    equalOptOut: 'ಸಮಾನ ಹಂಚಿಕೆ',
    exactAmounts: 'ನಿಖರ ಮೊತ್ತ',
    percentageShares: 'ಶೇಕಡಾವಾರು %',
    poolMoreCash: 'ಕಿಟ್ಟಿಗೆ ಹಣ ಹಾಕಿ',
    logChaiToll: 'ಚಹಾ / ಟೋಲ್ ನಮೂದಿಸಿ',
    payWithUpi: 'UPI QR ಮೂಲಕ ಪಾವತಿಸಿ',
    markPaid: 'ಪಾವತಿಸಲಾಗಿದೆ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    close: 'ಮುಚ್ಚಿ',

    stayHotel: 'ಹೋಟೆಲ್ / ವಸತಿ',
    foodDrinks: 'ಆಹಾರ ಮತ್ತು ಪಾನೀಯ',
    travelFuel: 'ಪ್ರಯಾಣ / ಇಂಧನ',
    activities: 'ಚಟುವಟಿಕೆಗಳು',
    groceries: 'ದಿನಸಿ ವಸ್ತುಗಳು',
    misc: 'ಇತರೆ',

    groupBanker: 'ಗುಂಪಿನ ಬ್ಯಾಂಕರ್',
    chaiLover: 'ಚಹಾ ಪ್ರೇಮಿ',
    bigSplurger: 'ದೊಡ್ಡ ಬಿಲ್',
    budgetNinja: 'ಬಜೆಟ್ ನಿಂಜಾ',
  },
};

export function getTranslation(lang: SupportedLanguage): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
