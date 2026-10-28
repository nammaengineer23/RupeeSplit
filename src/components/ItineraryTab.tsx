import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, MapPin, Plus, Trash2, Route, Wallet, Save, X } from 'lucide-react';
import { Trip } from '../types';
import { formatMoney } from '../utils/format';

type ItineraryItem = {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  category: string;
  budget: string;
  notes: string;
};

interface ItineraryTabProps {
  trip: Trip;
}

const CATEGORIES = ['Travel', 'Food & Drinks', 'Accommodation', 'Activity', 'Sightseeing', 'Shopping', 'Other'];
const makeId = () => `itinerary-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const makeItem = (date: string): ItineraryItem => ({
  id: makeId(), date, time: '09:00', title: '', location: '', category: 'Activity', budget: '', notes: '',
});

export const ItineraryTab: React.FC<ItineraryTabProps> = ({ trip }) => {
  const storageKey = `rupeesplit_itinerary_v1_${trip.id}`;
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ItineraryItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setLoaded(false);
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
    setEditingId(null);
    setDraft(null);
    setShowCreate(false);
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Could not save itinerary locally:', error);
    }
  }, [items, loaded, storageKey]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    [items],
  );
  const totalBudget = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(0, Number(item.budget) || 0), 0),
    [items],
  );
  const dates = useMemo(() => {
    const all = new Set(items.map((item) => item.date));
    if (trip.startDate) all.add(trip.startDate);
    return [...all].sort();
  }, [items, trip.startDate]);

  const startCreate = (date = trip.startDate || new Date().toISOString().slice(0, 10)) => {
    setDraft(makeItem(date));
    setEditingId(null);
    setShowCreate(true);
  };
  const startEdit = (item: ItineraryItem) => {
    setDraft({ ...item });
    setEditingId(item.id);
    setShowCreate(false);
  };
  const updateDraft = (field: keyof ItineraryItem, value: string) => {
    setDraft((current) => current ? { ...current, [field]: value } : current);
  };
  const saveDraft = () => {
    if (!draft || !draft.title.trim() || !draft.date) return;
    const clean = { ...draft, title: draft.title.trim(), location: draft.location.trim(), notes: draft.notes.trim(), budget: draft.budget.trim() };
    setItems((current) => editingId
      ? current.map((item) => item.id === editingId ? clean : item)
      : [...current, clean]);
    setDraft(null);
    setEditingId(null);
    setShowCreate(false);
  };
  const cancelEdit = () => { setDraft(null); setEditingId(null); setShowCreate(false); };
  const removeItem = (id: string) => setItems((current) => current.filter((item) => item.id !== id));
  const editor = draft && (showCreate || editingId) ? (
    <form onSubmit={(event) => { event.preventDefault(); saveDraft(); }} className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100">{editingId ? 'Edit itinerary stop' : 'Add itinerary stop'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Every field can be changed later.</p>
        </div>
        <button type="button" onClick={cancelEdit} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Cancel editing"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Activity / stop *
          <input required autoFocus value={draft.title} onChange={(e) => updateDraft('title', e.target.value)} placeholder="e.g. Breakfast at a local cafe" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100" />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Category
          <select value={draft.category} onChange={(e) => updateDraft('category', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100">
            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Date *
          <input required type="date" min={trip.startDate || undefined} max={trip.endDate || undefined} value={draft.date} onChange={(e) => updateDraft('date', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100" />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Time
          <input type="time" value={draft.time} onChange={(e) => updateDraft('time', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100" />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Location / address
          <input value={draft.location} onChange={(e) => updateDraft('location', e.target.value)} placeholder="Place, area, or address" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100" />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Estimated cost (${trip.currency || 'INR'})
          <input type="number" min="0" step="0.01" value={draft.budget} onChange={(e) => updateDraft('budget', e.target.value)} placeholder="0.00" className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100" />
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 sm:col-span-2">Notes / booking details
          <textarea rows={3} value={draft.notes} onChange={(e) => updateDraft('notes', e.target.value)} placeholder="Reservation, ticket, meeting point, what to bring…" className="mt-1 w-full resize-y rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm font-normal text-slate-900 dark:text-slate-100" />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={cancelEdit} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold">Cancel</button>
        <button type="submit" disabled={!draft.title.trim() || !draft.date} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save className="w-4 h-4" />Save stop</button>
      </div>
    </form>
  ) : null;

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-600 p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/15 p-3"><Route className="w-6 h-6" /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-100 font-bold">Trip itinerary</p>
              <h2 className="mt-1 text-2xl font-extrabold">{trip.name}</h2>
              <p className="mt-1 text-sm text-emerald-50">{trip.destination} · {trip.startDate} – {trip.endDate}</p>
              <p className="mt-2 text-sm text-emerald-50">Plan every day, then edit dates, times, places, costs, and notes whenever plans change.</p>
            </div>
          </div>
          <button onClick={() => startCreate()} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-emerald-800 hover:bg-emerald-50"><Plus className="w-4 h-4" />Add itinerary stop</button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-emerald-100">Planned stops</p><p className="mt-1 text-2xl font-extrabold">{items.length}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-xs text-emerald-100">Estimated total</p><p className="mt-1 text-xl font-extrabold">{formatMoney(totalBudget, trip.currency || 'INR')}</p></div>
        </div>
      </div>

      {editor}

      {sortedItems.length === 0 && !editor ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-base font-bold">Build your itinerary</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">Add your first stop, then keep adjusting the schedule as your group decides on plans.</p>
          <button onClick={() => startCreate()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white"><Plus className="w-4 h-4" />Create first stop</button>
        </div>
      ) : (
        <div className="space-y-5">
          {dates.map((date) => {
            const dayItems = sortedItems.filter((item) => item.date === date);
            if (!dayItems.length) return null;
            return <div key={date} className="space-y-3">
              <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-600" /><h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</h3><span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500">{dayItems.length} {dayItems.length === 1 ? 'stop' : 'stops'}</span><button onClick={() => startCreate(date)} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800"><Plus className="h-3.5 w-3.5" />Add stop</button></div>
              <div className="space-y-3 border-l-2 border-emerald-100 dark:border-emerald-950 pl-3 sm:pl-5">
                {dayItems.map((item) => {
                  return <article key={item.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 sm:w-20 sm:pt-1"><Clock3 className="h-4 w-4" />{item.time || 'No time'}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><h4 className="font-bold text-slate-900 dark:text-slate-100">{item.title}</h4><span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">{item.category}</span></div>
                        {item.location && <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{item.location}</p>}
                        {item.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{item.notes}</p>}
                        {Number(item.budget) > 0 && <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 dark:text-slate-200"><Wallet className="h-4 w-4 text-emerald-600" />{formatMoney(Number(item.budget), trip.currency || 'INR')}</p>}
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-start">
                        <button type="button" onClick={() => startEdit(item)} title="Edit all fields" aria-label={`Edit ${item.title}`} className="rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-slate-800">Edit</button>
                        <button type="button" onClick={() => removeItem(item.id)} title="Delete stop" aria-label={`Delete ${item.title}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </article>;
                })}
              </div>
            </div>;
          })}
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400">Itinerary edits are saved on this device for this trip. They are not yet shared with other group members.</p>
    </section>
  );
};
