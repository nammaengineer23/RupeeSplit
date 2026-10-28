/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { 
  Expense, 
  KittyContribution, 
  Member, 
  SettlementRecord, 
  SimplifiedDebt, 
  Trip 
} from './types';
import { ParsedExpenseResult } from './utils/nlpParser';
import { ScanReceiptOutput } from './utils/receiptScanner';
import { 
  DEMO_TRIP, 
  DEMO_EXPENSES, 
  DEMO_KITTY_CONTRIBUTIONS, 
  DEMO_SETTLEMENTS 
} from './data/demoTrip';
import { calculateMemberBalances, simplifyDebts } from './utils/settlement';
import { formatMoney } from './utils/format';
import { SupportedLanguage, getTranslation } from './utils/i18n';

// Firebase Real-time Services
import { testFirestoreConnection } from './firebase/config';
import { 
  subscribeToTrips, 
  subscribeToExpenses, 
  subscribeToKitty, 
  subscribeToSettlements,
  saveTripToCloud,
  saveExpenseToCloud,
  deleteExpenseFromCloud,
  saveKittyContributionToCloud,
  saveSettlementToCloud,
  joinTripByInvite
} from './firebase/service';

// Components
import { Header } from './components/Header';
import { ExpenseList } from './components/ExpenseList';
import { SettlementTab } from './components/SettlementTab';
import { KittyTab } from './components/KittyTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { FriendsTab } from './components/FriendsTab';
import { ItineraryTab } from './components/ItineraryTab';

// Modals
import { AddExpenseModal } from './components/AddExpenseModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { SpeechInputModal } from './components/SpeechInputModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { KittyModal } from './components/KittyModal';
import { TripModal } from './components/TripModal';
import { InviteModal } from './components/InviteModal';
import { ExportModal } from './components/ExportModal';
import { JoinTripModal } from './components/JoinTripModal';
import { PlayStoreModal } from './components/PlayStoreModal';
import { LoginScreen } from './components/LoginScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './firebase/authContext';

import { 
  Receipt, 
  Scale, 
  Coins, 
  BarChart3, 
  Users, 
  Plus, 
  Mic, 
  Sparkles,
  CalendarDays
} from 'lucide-react';

const STORAGE_KEYS = {
  TRIPS: 'rupeesplit_trips_v1',
  CURRENT_TRIP_ID: 'rupeesplit_current_trip_id_v1',
  EXPENSES: 'rupeesplit_expenses_v1',
  KITTY: 'rupeesplit_kitty_v1',
  SETTLEMENTS: 'rupeesplit_settlements_v1',
};

function MainAppContent() {
  const { user, loading: authLoading } = useAuth();
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  // 1. Trips state
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      return saved ? JSON.parse(saved) : [DEMO_TRIP];
    } catch {
      return [DEMO_TRIP];
    }
  });

  const [currentTripId, setCurrentTripId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRIP_ID);
      return saved || DEMO_TRIP.id;
    } catch {
      return DEMO_TRIP.id;
    }
  });

  // 2. Expenses state (keyed by tripId)
  const [allExpenses, setAllExpenses] = useState<Record<string, Expense[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : { [DEMO_TRIP.id]: DEMO_EXPENSES };
    } catch {
      return { [DEMO_TRIP.id]: DEMO_EXPENSES };
    }
  });

  // 3. Kitty contributions state (keyed by tripId)
  const [allKitty, setAllKitty] = useState<Record<string, KittyContribution[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KITTY);
      return saved ? JSON.parse(saved) : { [DEMO_TRIP.id]: DEMO_KITTY_CONTRIBUTIONS };
    } catch {
      return { [DEMO_TRIP.id]: DEMO_KITTY_CONTRIBUTIONS };
    }
  });

  // 4. Settlements state (keyed by tripId)
  const [allSettlements, setAllSettlements] = useState<Record<string, SettlementRecord[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
      return saved ? JSON.parse(saved) : { [DEMO_TRIP.id]: DEMO_SETTLEMENTS };
    } catch {
      return { [DEMO_TRIP.id]: DEMO_SETTLEMENTS };
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    'expenses' | 'itinerary' | 'settle' | 'kitty' | 'analytics' | 'friends'
  >('expenses');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpenseData, setEditingExpenseData] = useState<Partial<Expense> | undefined>(undefined);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isKittyModalOpen, setIsKittyModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isPlayStoreOpen, setIsPlayStoreOpen] = useState(false);

  // Language & i18n state
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('rupeesplit_lang_v1');
      return (saved as SupportedLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('rupeesplit_lang_v1', lang);
    } catch {
      // ignore
    }
  };

  const t = useMemo(() => getTranslation(currentLanguage), [currentLanguage]);

  // UPI payment modal state
  const [selectedDebtForUpi, setSelectedDebtForUpi] = useState<SimplifiedDebt | null>(null);

  // Android back behavior: stay in the app on the first press; exit only on a
  // second press within 2 seconds. Web/PWA uses browser history as a fallback.
  useEffect(() => {
    let lastBackPressAt = 0;
    let toastTimer: ReturnType<typeof setTimeout> | undefined;
    let toast: HTMLDivElement | undefined;

    const showExitHint = () => {
      if (!toast) {
        toast = document.createElement('div');
        toast.setAttribute('role', 'status');
        toast.textContent = 'Press back again to exit';
        Object.assign(toast.style, {
          position: 'fixed',
          left: '50%',
          bottom: '28px',
          transform: 'translateX(-50%)',
          zIndex: '9999',
          background: '#0f172a',
          color: '#fff',
          padding: '10px 16px',
          borderRadius: '999px',
          fontSize: '14px',
          boxShadow: '0 4px 16px rgba(0,0,0,.25)',
          whiteSpace: 'nowrap',
        });
        document.body.appendChild(toast);
      }
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast?.remove();
        toast = undefined;
      }, 2200);
    };

    const handleBackPress = async () => {
      const now = Date.now();
      if (now - lastBackPressAt <= 2000) {
        if (toastTimer) clearTimeout(toastTimer);
        toast?.remove();
        toast = undefined;
        if (Capacitor.isNativePlatform()) {
          await CapacitorApp.exitApp();
        } else {
          window.history.back();
        }
        lastBackPressAt = 0;
        return;
      }
      lastBackPressAt = now;
      showExitHint();
    };

    if (Capacitor.isNativePlatform()) {
      let removeListener: (() => void) | undefined;
      const listener = CapacitorApp.addListener('backButton', () => {
        void handleBackPress();
      });
      void listener.then((handle) => {
        removeListener = () => { void handle.remove(); };
      });

      return () => {
        removeListener?.();
        if (toastTimer) clearTimeout(toastTimer);
        toast?.remove();
      };
    }

    // Browser/PWA fallback: only intercept back twice at the app's root URL.
    const pushGuardState = () => window.history.pushState({ rupeeSplitBackGuard: true }, '');
    pushGuardState();
    const onPopState = () => {
      const now = Date.now();
      if (now - lastBackPressAt <= 2000) {
        if (toastTimer) clearTimeout(toastTimer);
        toast?.remove();
        toast = undefined;
        lastBackPressAt = 0;
        return;
      }
      lastBackPressAt = now;
      showExitHint();
      pushGuardState();
    };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      if (toastTimer) clearTimeout(toastTimer);
      toast?.remove();
    };
  }, []);

  // Initial Boot: Test cloud connection & Seed demo data if needed
  useEffect(() => {
    let isMounted = true;
    testFirestoreConnection().then((ok) => {
      if (isMounted) setIsCloudConnected(ok);
    });

    // Check URL search params for ?code=... or PWA shortcut actions (?action=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const actionParam = params.get('action');
      if (actionParam === 'add_expense') {
        setIsAddExpenseOpen(true);
      } else if (actionParam === 'kitty') {
        setActiveTab('kitty');
      } else if (actionParam === 'settle') {
        setActiveTab('settle');
      }

      const inviteCodeParam = params.get('code');
      const inviteTripId = params.get('tripId');
      if (inviteCodeParam && inviteTripId && user && window.confirm('Join this RupeeSplit trip using the invite link?')) {
        joinTripByInvite(inviteTripId, inviteCodeParam, { uid: user.uid, displayName: user.displayName, email: user.email }).then((found) => {
          if (found && isMounted) {
            setTrips((prev) => [found, ...prev.filter((t) => t.id !== found.id)]);
            setCurrentTripId(found.id);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }).catch((error) => console.warn('Could not redeem trip invite:', error));
      }
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Real-time Cloud Subscriptions
  // 1. Trips listener
  useEffect(() => {
    if (!user) {
      setIsCloudConnected(false);
      // Never keep another signed-in account's cached trip list visible.
      setTrips([]);
      setCurrentTripId(DEMO_TRIP.id);
      return;
    }
    const unsubscribe = subscribeToTrips(
      (cloudTrips) => {
        setIsCloudConnected(true);
        if (cloudTrips.length > 0) {
          setTrips(cloudTrips);
          // If current trip id doesn't exist, pick first
          setCurrentTripId((prev) => {
            if (cloudTrips.some((t) => t.id === prev)) return prev;
            return cloudTrips[0].id;
          });
        } else {
          // This account has no cloud trips; discard any prior account's local trip list.
          setTrips([]);
          setCurrentTripId(DEMO_TRIP.id);
        }
      },
      (err) => {
        console.warn('Real-time trips subscription error, using local fallback:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 2. Sub-collections listeners for the active trip (Expenses, Kitty, Settlements)
  useEffect(() => {
    if (!currentTripId) return;

    const unExpenses = subscribeToExpenses(
      currentTripId,
      (expenses) => {
        setAllExpenses((prev) => ({
          ...prev,
          [currentTripId]: expenses,
        }));
      },
      (err) => console.warn('Expenses sync error:', err)
    );

    const unKitty = subscribeToKitty(
      currentTripId,
      (kitty) => {
        setAllKitty((prev) => ({
          ...prev,
          [currentTripId]: kitty,
        }));
      },
      (err) => console.warn('Kitty sync error:', err)
    );

    const unSettlements = subscribeToSettlements(
      currentTripId,
      (settlements) => {
        setAllSettlements((prev) => ({
          ...prev,
          [currentTripId]: settlements,
        }));
      },
      (err) => console.warn('Settlements sync error:', err)
    );

    return () => {
      unExpenses();
      unKitty();
      unSettlements();
    };
  }, [currentTripId]);

  // Local storage backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error(e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TRIP_ID, currentTripId);
    } catch (e) {
      console.error(e);
    }
  }, [currentTripId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(allExpenses));
    } catch (e) {
      console.error(e);
    }
  }, [allExpenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KITTY, JSON.stringify(allKitty));
    } catch (e) {
      console.error(e);
    }
  }, [allKitty]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(allSettlements));
    } catch (e) {
      console.error(e);
    }
  }, [allSettlements]);

  // Current active trip object
  const currentTrip = useMemo(() => {
    return trips.find((t) => t.id === currentTripId) || trips[0] || DEMO_TRIP;
  }, [trips, currentTripId]);

  // Current trip data lists
  const currentExpenses = useMemo(() => {
    return allExpenses[currentTrip.id] || [];
  }, [allExpenses, currentTrip.id]);

  const currentKitty = useMemo(() => {
    return allKitty[currentTrip.id] || [];
  }, [allKitty, currentTrip.id]);

  const currentSettlements = useMemo(() => {
    return allSettlements[currentTrip.id] || [];
  }, [allSettlements, currentTrip.id]);

  // Balances and simplified debt calculations
  const { balances, kittySummary } = useMemo(() => {
    return calculateMemberBalances(
      currentTrip.members,
      currentExpenses,
      currentKitty,
      currentSettlements
    );
  }, [currentTrip.members, currentExpenses, currentKitty, currentSettlements]);

  const simplifiedDebts = useMemo(() => {
    return simplifyDebts(currentTrip.members, balances);
  }, [currentTrip.members, balances]);

  // Handlers for Resetting Demo
  const handleResetDemo = async () => {
    setTrips([DEMO_TRIP]);
    setCurrentTripId(DEMO_TRIP.id);
    setAllExpenses({ [DEMO_TRIP.id]: DEMO_EXPENSES });
    setAllKitty({ [DEMO_TRIP.id]: DEMO_KITTY_CONTRIBUTIONS });
    setAllSettlements({ [DEMO_TRIP.id]: DEMO_SETTLEMENTS });
    setActiveTab('expenses');

    // Reset is local demo data only; never overwrite a user's cloud trip.
  };

  // Handlers for Trip Creation
  const handleCreateTrip = async (newTrip: Trip) => {
    if (!user?.uid) throw new Error('Sign in with Google before creating a trip.');
    const ownedTrip: Trip = { ...newTrip, ownerUid: user.uid, memberUids: [user.uid] };
    setTrips([ownedTrip, ...trips]);
    setCurrentTripId(ownedTrip.id);
    setAllExpenses({ ...allExpenses, [ownedTrip.id]: [] });
    setAllKitty({ ...allKitty, [newTrip.id]: [] });
    setAllSettlements({ ...allSettlements, [newTrip.id]: [] });
    setActiveTab('expenses');

    // Save to Firestore
    await saveTripToCloud(ownedTrip);
  };

  // Joining requires the full QR/link invite (tripId + secret code), not a public directory/code search.
  const handleJoinTripByCode = async (inviteLink: string): Promise<boolean> => {
    if (!user?.uid) throw new Error('Sign in with Google before joining a trip.');
    try {
      const url = new URL(inviteLink);
      const tripId = url.searchParams.get('tripId');
      const code = url.searchParams.get('code');
      if (!tripId || !code) return false;
      const foundTrip = await joinTripByInvite(tripId, code, { uid: user.uid, displayName: user.displayName, email: user.email });
      if (!foundTrip) return false;
      setTrips((prev) => [foundTrip, ...prev.filter((t) => t.id !== foundTrip.id)]);
      setCurrentTripId(foundTrip.id);
      setActiveTab('expenses');
      return true;
    } catch {
      return false;
    }
  };

  // Handlers for Expenses
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: Date.now(),
    };

    setAllExpenses((prev) => ({
      ...prev,
      [currentTrip.id]: [newExpense, ...(prev[currentTrip.id] || [])],
    }));

    setEditingExpenseData(undefined);

    // Save to cloud Firestore for instant multi-device sync
    await saveExpenseToCloud(currentTrip.id, newExpense);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setAllExpenses((prev) => ({
      ...prev,
      [currentTrip.id]: (prev[currentTrip.id] || []).filter((e) => e.id !== expenseId),
    }));

    // Delete in cloud Firestore
    await deleteExpenseFromCloud(currentTrip.id, expenseId);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpenseData(expense);
    setIsAddExpenseOpen(true);
  };

  // Handler for Bill Scanner apply
  const handleApplyScanResult = (output: ScanReceiptOutput) => {
    setEditingExpenseData({
      title: output.title,
      category: output.category,
      amount: output.amount,
      date: output.date,
      receiptDetails: output.receiptDetails,
    });
    setIsAddExpenseOpen(true);
  };

  // Handler for Speech-to-expense apply
  const handleApplySpeechResult = (parsed: ParsedExpenseResult) => {
    const splitPerPerson = parsed.amount / Math.max(1, parsed.participantIds.length);
    const splits = parsed.participantIds.map((pId: string) => ({
      memberId: pId,
      amount: Math.round(splitPerPerson * 100) / 100,
    }));

    setEditingExpenseData({
      title: parsed.title,
      amount: parsed.amount,
      category: parsed.category,
      date: new Date().toISOString().split('T')[0],
      paidBy:
        parsed.paidByType === 'KITTY'
          ? { type: 'KITTY' }
          : { type: 'SINGLE', singlePayerId: parsed.payerId },
      splitType: 'EQUAL',
      splits,
    });
    setIsAddExpenseOpen(true);
  };

  // Handler for Kitty Top Up
  const handleAddKittyContributions = async (
    contributions: { memberId: string; amount: number; note?: string }[]
  ) => {
    const newItems: KittyContribution[] = contributions.map((c, i) => ({
      id: `kc-${Date.now()}-${i}`,
      tripId: currentTrip.id,
      memberId: c.memberId,
      amount: c.amount,
      date: new Date().toISOString().split('T')[0],
      note: c.note,
      createdAt: Date.now(),
    }));

    setAllKitty((prev) => ({
      ...prev,
      [currentTrip.id]: [...(prev[currentTrip.id] || []), ...newItems],
    }));

    // Save each to cloud Firestore
    for (const item of newItems) {
      await saveKittyContributionToCloud(currentTrip.id, item);
    }
  };

  // Handler for Settlement
  const handleConfirmSettlement = async (record: {
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    note?: string;
    upiRef?: string;
  }) => {
    const newSettlement: SettlementRecord = {
      id: `set-${Date.now()}`,
      tripId: currentTrip.id,
      fromMemberId: record.fromMemberId,
      toMemberId: record.toMemberId,
      amount: record.amount,
      date: new Date().toISOString().split('T')[0],
      note: record.note,
      upiRef: record.upiRef,
      createdAt: Date.now(),
    };

    setAllSettlements((prev) => ({
      ...prev,
      [currentTrip.id]: [newSettlement, ...(prev[currentTrip.id] || [])],
    }));

    // Save to cloud Firestore
    await saveSettlementToCloud(currentTrip.id, newSettlement);
  };

  // Handlers for Member Management
  const handleAddMember = async (newMember: Member) => {
    const updatedTrip: Trip = {
      ...currentTrip,
      members: [...currentTrip.members, newMember],
    };
    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));

    // Save updated members to cloud
    await saveTripToCloud(updatedTrip);
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    const updatedMembers = currentTrip.members.map((m) =>
      m.id === updatedMember.id ? updatedMember : m
    );
    const updatedTrip: Trip = {
      ...currentTrip,
      members: updatedMembers,
    };
    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));

    // Save updated members to cloud
    await saveTripToCloud(updatedTrip);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (currentTrip.members.length <= 2) return;
    const updatedTrip: Trip = {
      ...currentTrip,
      members: currentTrip.members.filter((m) => m.id !== memberId),
    };
    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));

    // Save updated members to cloud
    await saveTripToCloud(updatedTrip);
  };

  const tripCurrency = currentTrip.currency || 'INR';

  // Authentication gate: If user is not logged in, prompt Google Login
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-emerald-400">Loading RupeeSplit...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* App Header with Live Cloud Sync, Language Switcher & Install triggers */}
      <Header
        currentTrip={currentTrip}
        allTrips={trips}
        onSelectTrip={(id) => setCurrentTripId(id)}
        onOpenNewTripModal={() => setIsTripModalOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPlayStoreModal={() => setIsPlayStoreOpen(true)}
        onResetDemo={handleResetDemo}
        isCloudConnected={isCloudConnected}
        currentLanguage={currentLanguage}
        onChangeLanguage={handleLanguageChange}
        t={t}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Tab 1: Expenses */}
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'expenses'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{t.expenses}</span>
              <span className="text-[11px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400">
                {currentExpenses.length}
              </span>
            </button>

            {/* Trip itinerary */}
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'itinerary'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Itinerary</span>
            </button>

            {/* Tab 2: Settle Up */}
            <button
              onClick={() => setActiveTab('settle')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'settle'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{t.settleUp}</span>
              {simplifiedDebts.length > 0 && (
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full">
                  {simplifiedDebts.length}
                </span>
              )}
            </button>

            {/* Tab 3: Shared Kitty */}
            <button
              onClick={() => setActiveTab('kitty')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'kitty'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{t.sharedKitty}</span>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded">
                {formatMoney(kittySummary.remainingCash, tripCurrency)}
              </span>
            </button>

            {/* Tab 4: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t.insightsWrapped}</span>
            </button>

            {/* Tab 5: Friends */}
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'friends'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.friends} ({currentTrip.members.length})</span>
            </button>
          </nav>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={currentExpenses}
            members={currentTrip.members}
            kittyBalance={kittySummary.remainingCash}
            onAddExpenseClick={() => {
              setEditingExpenseData(undefined);
              setIsAddExpenseOpen(true);
            }}
            onScanBillClick={() => setIsScannerOpen(true)}
            onVoiceInputClick={() => setIsVoiceOpen(true)}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
            currency={tripCurrency}
            t={t}
          />
        )}

        {activeTab === 'itinerary' && <ItineraryTab trip={currentTrip} />}

        {activeTab === 'settle' && (
          <SettlementTab
            members={currentTrip.members}
            balances={balances}
            simplifiedDebts={simplifiedDebts}
            settlements={currentSettlements}
            onOpenUpiModal={(debt) => setSelectedDebtForUpi(debt)}
            onQuickSettle={handleConfirmSettlement}
            currency={tripCurrency}
            t={t}
          />
        )}

        {activeTab === 'kitty' && (
          <KittyTab
            members={currentTrip.members}
            kittyContributions={currentKitty}
            expenses={currentExpenses}
            onOpenTopUpModal={() => setIsKittyModalOpen(true)}
            onLogPettyCash={() => {
              setEditingExpenseData({
                title: 'Highway Tea & Toll',
                category: 'Food & Drinks',
                paidBy: { type: 'KITTY' },
              });
              setIsAddExpenseOpen(true);
            }}
            currency={tripCurrency}
            t={t}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            expenses={currentExpenses}
            members={currentTrip.members}
            balances={balances}
            kittyBalance={kittySummary.remainingCash}
            currency={tripCurrency}
            t={t}
          />
        )}

        {activeTab === 'friends' && (
          <FriendsTab
            members={currentTrip.members}
            balances={balances}
            inviteCode={currentTrip.inviteCode}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onRemoveMember={handleRemoveMember}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onOpenUpiForMember={(m) => {
              const dummyDebt: SimplifiedDebt = {
                id: `direct-${m.id}`,
                fromMemberId: currentTrip.members[0]?.id || '',
                toMemberId: m.id,
                amount: 500,
              };
              setSelectedDebtForUpi(dummyDebt);
            }}
          />
        )}
      </main>

      {/* Floating Bottom Quick Action on Mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            setEditingExpenseData(undefined);
            setIsAddExpenseOpen(true);
          }}
          className="w-13 h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          title="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpenseData(undefined);
        }}
        onSaveExpense={handleSaveExpense}
        tripId={currentTrip.id}
        members={currentTrip.members}
        kittyBalance={kittySummary.remainingCash}
        initialData={editingExpenseData}
        onOpenScanner={() => {
          setIsAddExpenseOpen(false);
          setIsScannerOpen(true);
        }}
        onOpenVoiceInput={() => {
          setIsAddExpenseOpen(false);
          setIsVoiceOpen(true);
        }}
        currency={tripCurrency}
        t={t}
      />

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onApplyParsedExpense={handleApplyScanResult}
        currency={tripCurrency}
      />

      <SpeechInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        members={currentTrip.members}
        onApplyParsedExpense={handleApplySpeechResult}
      />

      <UpiPaymentModal
        isOpen={!!selectedDebtForUpi}
        onClose={() => setSelectedDebtForUpi(null)}
        debt={selectedDebtForUpi}
        debtor={currentTrip.members.find((m) => m.id === selectedDebtForUpi?.fromMemberId)}
        creditor={currentTrip.members.find((m) => m.id === selectedDebtForUpi?.toMemberId)}
        tripName={currentTrip.name}
        onConfirmSettlement={handleConfirmSettlement}
        currency={tripCurrency}
      />

      <KittyModal
        isOpen={isKittyModalOpen}
        onClose={() => setIsKittyModalOpen(false)}
        members={currentTrip.members}
        onAddContributions={handleAddKittyContributions}
      />

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        onCreateTrip={handleCreateTrip}
      />

      <JoinTripModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinByCode={handleJoinTripByCode}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        trip={currentTrip}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        trip={currentTrip}
        expenses={currentExpenses}
        settlements={currentSettlements}
        kittyContributions={currentKitty}
        simplifiedDebts={simplifiedDebts}
        currency={tripCurrency}
        t={t}
      />

      <PlayStoreModal
        isOpen={isPlayStoreOpen}
        onClose={() => setIsPlayStoreOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

