import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Trash2,
  Route,
  Wallet,
  Save,
  X,
  Sparkles,
  Copy,
  Printer,
  Compass,
  Utensils,
  Bed,
  ShoppingBag,
  Car,
  Camera,
  Info,
  CheckCircle2,
  Share2,
  MessageCircle,
  Check,
  FileText,
} from 'lucide-react';
import { Trip } from '../types';
import { formatMoney } from '../utils/format';
import { auth } from '../firebase/config';
import {
  deleteTripItineraryStop,
  ItineraryStop,
  ItineraryTemplate,
  loadTripItinerary,
  publishItineraryTemplate,
  saveTripItineraryStop,
  searchItineraryTemplates,
} from '../firebase/service';

export interface ItineraryItem {
  id: string;
  date: string;
  time: string;
  timeFrom?: string;
  timeTo?: string;
  title: string;
  location: string;
  category: string;
  activities?: string;
  budget: string;
  notes: string;
}

export interface ItineraryRowDraft {
  tempId: string;
  id?: string;
  date: string;
  timeFrom: string;
  timeTo: string;
  title: string;
  location: string;
  category: string;
  activities: string;
  budget: string;
  notes: string;
}

interface ItineraryTabProps {
  trip: Trip;
}

const CATEGORIES = [
  'Activity',
  'Sightseeing',
  'Food & Drinks',
  'Travel',
  'Accommodation',
  'Shopping',
  'Nightlife',
  'Other',
];

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: React.FC<{ className?: string }> }> = {
  Activity: { bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: Compass },
  Sightseeing: { bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', icon: Camera },
  'Food & Drinks': { bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: Utensils },
  Travel: { bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: Car },
  Accommodation: { bg: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: Bed },
  Shopping: { bg: 'bg-pink-50 dark:bg-pink-950/60 border-pink-200 dark:border-pink-800', text: 'text-pink-700 dark:text-pink-300', icon: ShoppingBag },
  Nightlife: { bg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300', icon: Sparkles },
  Other: { bg: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-700 dark:text-slate-300', icon: Info },
};

const makeId = () => `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const parseTimeRange = (timeStr: string): { timeFrom: string; timeTo: string } => {
  if (!timeStr) return { timeFrom: '09:00', timeTo: '' };
  if (timeStr.includes(' - ')) {
    const [from, to] = timeStr.split(' - ');
    return { timeFrom: from.trim(), timeTo: to ? to.trim() : '' };
  }
  return { timeFrom: timeStr.trim(), timeTo: '' };
};

const formatTimeRange = (timeFrom: string, timeTo: string): string => {
  const from = timeFrom.trim();
  const to = timeTo.trim();
  if (from && to) return `${from} - ${to}`;
  return from || to || '09:00';
};

const createEmptyRow = (date: string, defaultTimeFrom = '09:00', defaultTimeTo = '11:00'): ItineraryRowDraft => ({
  tempId: makeId(),
  date,
  timeFrom: defaultTimeFrom,
  timeTo: defaultTimeTo,
  title: '',
  location: '',
  category: 'Activity',
  activities: '',
  budget: '',
  notes: '',
});

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ trip }) => {
  const storageKey = `rupeesplit_itinerary_v1_${trip.id}`;
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // Multi-row guide form state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderRows, setBuilderRows] = useState<ItineraryRowDraft[]>([]);
  const [isEditingSingleId, setIsEditingSingleId] = useState<string | null>(null);

  // Share tour guide state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedGuideText, setCopiedGuideText] = useState(false);

  // Shared template state
  const [templateQuery, setTemplateQuery] = useState(trip.destination || '');
  const [templates, setTemplates] = useState<ItineraryTemplate[]>([]);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [templateMessage, setTemplateMessage] = useState('');

  // Initial load
  useEffect(() => {
    let active = true;
    setLoaded(false);
    setItems([]);
    loadTripItinerary(trip.id)
      .then((saved) => {
        if (!active) return;
        const normalized: ItineraryItem[] = (saved || []).map((stop) => {
          const { timeFrom, timeTo } = parseTimeRange(stop.time);
          return {
            ...stop,
            timeFrom: stop.timeFrom || timeFrom,
            timeTo: stop.timeTo || timeTo,
          };
        });
        setItems(normalized);
        try {
          localStorage.setItem(storageKey, JSON.stringify(normalized));
        } catch {
          // optional cache
        }
      })
      .catch(() => {
        try {
          const saved = localStorage.getItem(storageKey);
          const parsed = saved ? JSON.parse(saved) : [];
          if (active) setItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          if (active) setItems([]);
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    setIsBuilderOpen(false);
    setBuilderRows([]);
    setIsEditingSingleId(null);

    return () => {
      active = false;
    };
  }, [storageKey, trip.id]);

  // Sync to local cache
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Could not save itinerary locally:', error);
    }
  }, [items, loaded, storageKey]);

  // Derived calculations
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [items]
  );

  const totalBudget = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(0, Number(item.budget) || 0), 0),
    [items]
  );

  const dates = useMemo(() => {
    const all = new Set(items.map((item) => item.date));
    if (trip.startDate) all.add(trip.startDate);
    if (trip.endDate) all.add(trip.endDate);
    return [...all].filter(Boolean).sort();
  }, [items, trip.startDate, trip.endDate]);

  const filteredItems = useMemo(() => {
    if (selectedDayFilter === 'ALL') return sortedItems;
    return sortedItems.filter((item) => item.date === selectedDayFilter);
  }, [sortedItems, selectedDayFilter]);

  // Builder row management
  const openMultiRowBuilder = (date?: string) => {
    const targetDate = date || trip.startDate || new Date().toISOString().slice(0, 10);
    setBuilderRows([
      createEmptyRow(targetDate, '09:00', '11:00'),
      createEmptyRow(targetDate, '11:30', '14:00'),
      createEmptyRow(targetDate, '15:00', '18:00'),
    ]);
    setIsEditingSingleId(null);
    setIsBuilderOpen(true);
  };

  const openSingleEdit = (item: ItineraryItem) => {
    const { timeFrom, timeTo } = parseTimeRange(item.time);
    setBuilderRows([
      {
        tempId: item.id,
        id: item.id,
        date: item.date,
        timeFrom: item.timeFrom || timeFrom,
        timeTo: item.timeTo || timeTo,
        title: item.title,
        location: item.location || '',
        category: item.category || 'Activity',
        activities: item.activities || '',
        budget: item.budget || '',
        notes: item.notes || '',
      },
    ]);
    setIsEditingSingleId(item.id);
    setIsBuilderOpen(true);
  };

  const handleUpdateRow = (tempId: string, field: keyof ItineraryRowDraft, value: string) => {
    setBuilderRows((current) =>
      current.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRow = () => {
    const lastRow = builderRows[builderRows.length - 1];
    const nextDate = lastRow ? lastRow.date : trip.startDate || new Date().toISOString().slice(0, 10);
    let nextFrom = '18:30';
    let nextTo = '21:00';
    if (lastRow && lastRow.timeTo) {
      nextFrom = lastRow.timeTo;
      nextTo = '';
    }
    setBuilderRows((current) => [...current, createEmptyRow(nextDate, nextFrom, nextTo)]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = builderRows[index];
    if (!target) return;
    const duplicated: ItineraryRowDraft = {
      ...target,
      tempId: makeId(),
      id: undefined,
      title: `${target.title} (Copy)`.trim(),
    };
    const updated = [...builderRows];
    updated.splice(index + 1, 0, duplicated);
    setBuilderRows(updated);
  };

  const handleRemoveRow = (tempId: string) => {
    if (builderRows.length <= 1) return;
    setBuilderRows((current) => current.filter((r) => r.tempId !== tempId));
  };

  const handleCancelBuilder = () => {
    setIsBuilderOpen(false);
    setBuilderRows([]);
    setIsEditingSingleId(null);
  };

  // Bulk save all builder rows
  const handleSaveAllRows = async () => {
    const validRows = builderRows.filter((r) => r.title.trim().length > 0 && r.date);
    if (validRows.length === 0) return;

    try {
      const stopsToPersist: ItineraryItem[] = validRows.map((r) => {
        const id = r.id || makeId();
        const fullTime = formatTimeRange(r.timeFrom, r.timeTo);
        return {
          id,
          date: r.date,
          time: fullTime,
          timeFrom: r.timeFrom,
          timeTo: r.timeTo,
          title: r.title.trim(),
          location: r.location.trim(),
          category: r.category,
          activities: r.activities.trim(),
          budget: r.budget.trim(),
          notes: r.notes.trim(),
        };
      });

      // Save all to Firestore
      await Promise.all(
        stopsToPersist.map((stop) => saveTripItineraryStop(trip.id, stop as ItineraryStop))
      );

      // Update local state
      setItems((current) => {
        if (isEditingSingleId) {
          const updatedOne = stopsToPersist[0];
          return current.map((item) => (item.id === isEditingSingleId ? updatedOne : item));
        }
        return [...current, ...stopsToPersist];
      });

      setTemplateMessage(
        isEditingSingleId
          ? 'Itinerary stop updated successfully.'
          : `Added ${stopsToPersist.length} stops to your trip guide.`
      );
      handleCancelBuilder();
    } catch {
      setTemplateMessage('Could not save stops to Firestore. Check connection and access permissions.');
    }
  };

  const removeItem = async (id: string) => {
    try {
      await deleteTripItineraryStop(trip.id, id);
      setItems((current) => current.filter((item) => item.id !== id));
      setTemplateMessage('Stop deleted from itinerary.');
    } catch {
      setTemplateMessage('Could not delete stop from Firestore.');
    }
  };

  const searchTemplates = async () => {
    setTemplateBusy(true);
    setTemplateMessage('');
    try {
      setTemplates(await searchItineraryTemplates(templateQuery));
    } catch {
      setTemplateMessage('Could not search shared itineraries.');
      setTemplates([]);
    } finally {
      setTemplateBusy(false);
    }
  };

  const useTemplate = async (template: ItineraryTemplate) => {
    const copied: ItineraryItem[] = template.stops.map((stop, index) => {
      const { timeFrom, timeTo } = parseTimeRange(stop.time);
      return {
        ...stop,
        id: makeId() + '-' + index,
        date: trip.startDate || new Date().toISOString().slice(0, 10),
        timeFrom: stop.timeFrom || timeFrom,
        timeTo: stop.timeTo || timeTo,
        activities: stop.activities || '',
        budget: stop.budget || '',
        notes: '',
      };
    });

    try {
      await Promise.all(copied.map((stop) => saveTripItineraryStop(trip.id, stop as ItineraryStop)));
      setItems((current) => [...current, ...copied]);
      setTemplateMessage(`Added ${copied.length} stops from “${template.title}”.`);
    } catch {
      setTemplateMessage('Could not copy template to trip.');
    }
  };

  const shareTemplate = async () => {
    try {
      if (!auth.currentUser) {
        setTemplateMessage('Sign in with Google to share a reusable itinerary.');
        return;
      }
      await publishItineraryTemplate(trip, items as ItineraryStop[], auth.currentUser.uid);
      setTemplateMessage('Shared destination guide published for other travelers. Private notes were excluded.');
    } catch (error) {
      setTemplateMessage(error instanceof Error ? error.message : 'Could not publish itinerary.');
    }
  };

  const generateTourGuideText = () => {
    let text = `🗺️ *${trip.name.toUpperCase()} - COMPLETE TOUR GUIDE*\n`;
    text += `📍 Destination: ${trip.destination}\n`;
    text += `📅 Dates: ${trip.startDate} to ${trip.endDate}\n`;
    text += `💰 Estimated Total: ${formatMoney(totalBudget, trip.currency || 'INR')}\n`;
    if (trip.members && trip.members.length > 0) {
      text += `👥 Travelers: ${trip.members.map((m) => m.name).join(', ')}\n\n`;
    } else {
      text += `\n`;
    }

    dates.forEach((date, idx) => {
      const dayItems = sortedItems.filter((item) => item.date === date);
      if (!dayItems.length) return;
      const dateObj = new Date(`${date}T12:00:00`);
      const dateStr = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
        : date;

      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `📅 *DAY ${idx + 1}: ${dateStr}*\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;

      dayItems.forEach((item, sIdx) => {
        text += `\n${sIdx + 1}. *${item.title}* [${item.category}]\n`;
        text += `   ⏰ Time: ${item.time || 'Schedule'}\n`;
        if (item.location) text += `   📍 Location: ${item.location}\n`;
        if (item.activities) text += `   ✨ Activities: ${item.activities}\n`;
        if (Number(item.budget) > 0) text += `   💵 Cost: ${formatMoney(Number(item.budget), trip.currency || 'INR')}\n`;
        if (item.notes) text += `   📝 Note: ${item.notes}\n`;
      });
      text += `\n`;
    });

    const webUrl = typeof window !== 'undefined' ? window.location.origin : 'https://rupeesplit.app';
    text += `\nShared via RupeeSplit: ${webUrl}`;
    return text;
  };

  const handleCopyGuideText = async () => {
    try {
      await navigator.clipboard.writeText(generateTourGuideText());
      setCopiedGuideText(true);
      setTimeout(() => setCopiedGuideText(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleNativeShareGuide = async () => {
    const guideText = generateTourGuideText();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${trip.name} - Complete Tour Guide`,
          text: guideText,
        });
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          handleCopyGuideText();
        }
      }
    } else {
      handleCopyGuideText();
    }
  };

  const handlePrintGuide = () => {
    window.print();
  };

  // Builder Row UI component
  const renderBuilderRow = (row: ItineraryRowDraft, index: number) => {
    return (
      <div
        key={row.tempId}
        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-4 space-y-3 relative transition-all"
      >
        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {index + 1}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Stop / Event {index + 1}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleDuplicateRow(index)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="Duplicate this stop"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {builderRows.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveRow(row.tempId)}
                className="p-1.5 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Remove this stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              min={trip.startDate || undefined}
              max={trip.endDate || undefined}
              value={row.date}
              onChange={(e) => handleUpdateRow(row.tempId, 'date', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Time From */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Time From *
            </label>
            <div className="relative">
              <input
                type="time"
                value={row.timeFrom}
                onChange={(e) => handleUpdateRow(row.tempId, 'timeFrom', e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Time To */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Time To (optional)
            </label>
            <input
              type="time"
              value={row.timeTo}
              onChange={(e) => handleUpdateRow(row.tempId, 'timeTo', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={row.category}
              onChange={(e) => handleUpdateRow(row.tempId, 'category', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Stop / Event Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scuba Diving at Grande Island, Fort Aguada Walk"
              value={row.title}
              onChange={(e) => handleUpdateRow(row.tempId, 'title', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Location */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Location / Area
            </label>
            <input
              type="text"
              placeholder="e.g. Sinquerim Beach, Candolim"
              value={row.location}
              onChange={(e) => handleUpdateRow(row.tempId, 'location', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Activities / What to Do */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Activities & Things to Do (Complete Trip Guide)</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g. Water sports, boat ride, photography, beach volleyball, cafe hopping"
              value={row.activities}
              onChange={(e) => handleUpdateRow(row.tempId, 'activities', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Estimated Cost ({trip.currency || 'INR'})
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0.00"
              value={row.budget}
              onChange={(e) => handleUpdateRow(row.tempId, 'budget', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Notes & Booking details */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Notes & Booking Details
            </label>
            <input
              type="text"
              placeholder="e.g. Reservation ID #8921, carry swimming gear, reach 15 min early"
              value={row.notes}
              onChange={(e) => handleUpdateRow(row.tempId, 'notes', e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      {/* Clean Document Header for Printouts (Visible ONLY during print/PDF export) */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">RupeeSplit Travel Guide</div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{trip.name}</h1>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              📍 {trip.destination} · 📅 {trip.startDate} to {trip.endDate}
            </p>
            {trip.members && trip.members.length > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                Travelers: {trip.members.map((m) => m.name).join(', ')}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold">Estimated Budget</p>
            <p className="text-xl font-black text-slate-900">{formatMoney(totalBudget, trip.currency || 'INR')}</p>
            <p className="text-xs text-slate-600 mt-0.5">{items.length} Planned Stops across {dates.length} Days</p>
          </div>
        </div>
      </div>

      {/* Hero Trip Guide Banner (Hidden during print) */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-5 sm:p-7 text-white shadow-md no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/15 p-3 shrink-0">
              <Route className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                  Complete Trip Guide & Itinerary
                </span>
                <span className="text-[10px] bg-white/20 font-semibold px-2 py-0.5 rounded-full">
                  {dates.length} Days Planned
                </span>
              </div>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{trip.name}</h2>
              <p className="mt-1 text-sm text-emerald-100">
                {trip.destination} · {trip.startDate} to {trip.endDate}
              </p>
              <p className="mt-2 text-xs text-emerald-50 max-w-xl">
                Plan stops with start and end times, multiple activity highlights, locations, estimated budgets, and booking notes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-stretch gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openMultiRowBuilder()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-900 hover:bg-emerald-50 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>{items.length === 0 ? 'Build Trip Guide' : 'Add Multiple Stops'}</span>
            </button>

            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                  title="Share Tour Guide on WhatsApp or copy itinerary"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
                  <span>Share Guide</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintGuide}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 hover:bg-white/25 px-3 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                  title="Print Tour Guide / Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 uppercase font-semibold">Total Stops & Events</p>
            <p className="mt-1 text-xl sm:text-2xl font-black">{items.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <p className="text-[11px] text-emerald-200 uppercase font-semibold">Estimated Budget</p>
            <p className="mt-1 text-xl sm:text-2xl font-black">
              {formatMoney(totalBudget, trip.currency || 'INR')}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs col-span-2 sm:col-span-1">
            <p className="text-[11px] text-emerald-200 uppercase font-semibold">Destination</p>
            <p className="mt-1 text-sm sm:text-base font-bold truncate">{trip.destination}</p>
          </div>
        </div>
      </div>

      {/* Multi-Row Trip Guide Builder Form */}
      {isBuilderOpen && (
        <div className="rounded-2xl border-2 border-emerald-500/80 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200 no-print">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Route className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {isEditingSingleId ? 'Edit Itinerary Stop' : 'Trip Guide Builder (Multiple Stops & Events)'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add multiple rows for your events, specify Date, Time From to To, location, activities, and budget.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancelBuilder}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Close builder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rows List */}
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {builderRows.map((row, index) => renderBuilderRow(row, index))}
          </div>

          {/* Builder Actions Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            {!isEditingSingleId ? (
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Another Stop / Event Row</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelBuilder}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAllRows}
                disabled={!builderRows.some((r) => r.title.trim().length > 0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isEditingSingleId
                    ? 'Save Changes'
                    : `Save All Stops (${builderRows.filter((r) => r.title.trim()).length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Template Search & Community Guides (no-print) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 no-print">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Community Destination Guides
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search itineraries shared by other travelers, or publish your own reusable destination guide.
          </p>
        </div>

        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void searchTemplates();
          }}
        >
          <input
            value={templateQuery}
            onChange={(event) => setTemplateQuery(event.target.value)}
            placeholder="Search destination, e.g. Goa, Manali, Kerala"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs sm:text-sm font-medium"
          />
          <button
            type="submit"
            disabled={templateBusy || !templateQuery.trim()}
            className="rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {templateBusy ? 'Searching…' : 'Search Guides'}
          </button>
        </form>

        {templates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/40"
          >
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{template.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {template.destination} · {template.stops.length} stops · {template.currency}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void useTemplate(template)}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Use Guide
            </button>
          </div>
        ))}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => void shareTemplate()}
            disabled={!items.length}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Share Reusable Destination Guide</span>
          </button>
        </div>

        {templateMessage && (
          <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {templateMessage}
          </p>
        )}
      </div>

      {/* Day Filter Pills (no-print) */}
      {dates.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar no-print">
          <button
            type="button"
            onClick={() => setSelectedDayFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              selectedDayFilter === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            All Days ({sortedItems.length})
          </button>

          {dates.map((date, idx) => {
            const count = sortedItems.filter((item) => item.date === date).length;
            const dateObj = new Date(`${date}T12:00:00`);
            const label = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
              : date;

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDayFilter(date)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  selectedDayFilter === date
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                Day {idx + 1}: {label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Itinerary Timeline / Trip Guide View */}
      {sortedItems.length === 0 && !isBuilderOpen ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-14 text-center no-print">
          <CalendarDays className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
            Build Your Complete Trip Guide
          </h3>
          <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Plan multiple stops or events with start to end times, activities, locations, budgets, and booking details.
          </p>
          <button
            type="button"
            onClick={() => openMultiRowBuilder()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stops & Build Guide</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const dayItems = filteredItems.filter((item) => item.date === date);
            if (!dayItems.length) return null;

            const dateObj = new Date(`${date}T12:00:00`);
            const dateTitle = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString(undefined, {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : date;

            const dayBudget = dayItems.reduce((acc, it) => acc + (Number(it.budget) || 0), 0);

            return (
              <div key={date} className="space-y-3 print-avoid-break">
                {/* Day Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100/80 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {dateTitle}
                    </h3>
                    <span className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {dayItems.length} {dayItems.length === 1 ? 'stop' : 'stops'}
                    </span>
                    {dayBudget > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        ({formatMoney(dayBudget, trip.currency || 'INR')})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openMultiRowBuilder(date)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800 transition-colors cursor-pointer no-print"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Stops for this Day</span>
                  </button>
                </div>

                {/* Day Stops Timeline */}
                <div className="space-y-3 border-l-2 border-emerald-200 dark:border-emerald-900/60 ml-2 pl-3 sm:pl-5">
                  {dayItems.map((item) => {
                    const categoryStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Other;
                    const CategoryIcon = categoryStyle.icon;

                    return (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 print-avoid-break"
                      >
                        {/* Top: Time Range & Category */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                              <Clock3 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{item.time || 'Schedule'}</span>
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${categoryStyle.bg} ${categoryStyle.text}`}
                            >
                              <CategoryIcon className="w-3 h-3" />
                              <span>{item.category}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1 no-print">
                            <button
                              type="button"
                              onClick={() => openSingleEdit(item)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Delete stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Location */}
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            {item.title}
                          </h4>
                          {item.location && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{item.location}</span>
                            </p>
                          )}
                        </div>

                        {/* Activities & Key Highlights (Complete Trip Guide) */}
                        {item.activities && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-750 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Activities & Things to Do:</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 pl-5">
                              {item.activities}
                            </p>
                          </div>
                        )}

                        {/* Notes & Estimated Cost */}
                        {(item.notes || Number(item.budget) > 0) && (
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                            {item.notes ? (
                              <p className="text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 not-italic" />
                                <span>{item.notes}</span>
                              </p>
                            ) : (
                              <div />
                            )}

                            {Number(item.budget) > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-800/80">
                                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Est. {formatMoney(Number(item.budget), trip.currency || 'INR')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 no-print">
        Trip stops and complete guide details are synced in real-time to Firestore and cached locally for offline travel access.
      </p>

      {/* Share Tour Guide Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Share Complete Tour Guide</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {trip.name} · {trip.destination}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* 1-Click WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateTourGuideText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg cursor-pointer text-center"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>Share Tour Guide on WhatsApp</span>
              </a>

              {/* Action Buttons: Print/PDF & Copy */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setTimeout(() => handlePrintGuide(), 300);
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyGuideText}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {copiedGuideText ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Text</span>
                    </>
                  )}
                </button>
              </div>

              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  type="button"
                  onClick={handleNativeShareGuide}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share via other apps (Email, Telegram, Notes...)</span>
                </button>
              )}

              {/* Live Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Formatted WhatsApp Guide Preview</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{items.length} stops</span>
                </div>
                <div className="max-h-56 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
                  {generateTourGuideText()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
