import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { parseNaturalLanguageExpense, ParsedExpenseResult } from '../utils/nlpParser';
import { formatINR, CATEGORY_CONFIG } from '../utils/format';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Coins,
  Users,
  Tag
} from 'lucide-react';

interface SpeechInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onApplyParsedExpense: (parsed: ParsedExpenseResult) => void;
}

const SAMPLE_VOICE_PROMPTS = [
  'Paid 1200 rupees for dhaba lunch with Rahul and Pooja',
  'Spent 4500 on cab to Baga beach paid by Aman split equally',
  'Toll gate 380 rupees paid from kitty',
  'Dinner at Thalassa 5400 rs paid by Sneha with all',
  'Bought groceries for 850 rs paid by Sneha',
];

export const SpeechInputModal: React.FC<SpeechInputModalProps> = ({
  isOpen,
  onClose,
  members,
  onApplyParsedExpense,
}) => {
  const [transcript, setTranscript] = useState(SAMPLE_VOICE_PROMPTS[0]);
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedExpenseResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (transcript) {
        setParsedResult(parseNaturalLanguageExpense(transcript, members));
      }
    }
  }, [isOpen, transcript, members]);

  if (!isOpen) return null;

  const handleToggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate listening picking up speech
      setTimeout(() => {
        setIsListening(false);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setTranscript(sample);
    setParsedResult(parseNaturalLanguageExpense(sample, members));
  };

  const handleApply = () => {
    if (parsedResult) {
      onApplyParsedExpense(parsedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Speech & Natural Language Expense
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak or type in natural Indian context (rupees, dhabas, cabs, kitty)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Natural Language Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>What did you spend on?</span>
              <span className="text-[11px] text-slate-400">Real-time parser</span>
            </label>

            <div className="relative">
              <textarea
                rows={3}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="e.g. Paid 1400 rs for petrol at Shell pump by Aman with everyone"
                className="w-full text-sm p-3 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans text-slate-900 dark:text-slate-100"
              />

              <button
                type="button"
                onClick={handleToggleListening}
                title={isListening ? 'Listening...' : 'Simulate Voice Recording'}
                className={`absolute right-2.5 bottom-3.5 p-2 rounded-full transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-md ring-4 ring-rose-200 dark:ring-rose-900'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>

            {isListening && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                Listening to Indian speech... speak clearly with amount and friends.
              </p>
            )}
          </div>

          {/* Quick Sample Prompts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tap a sample phrase to test:</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="text-left text-xs bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-900 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Live Parsed Entity Card */}
          {parsedResult && (
            <div className="border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Parsed Entities</span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300">
                  {formatINR(parsedResult.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Title */}
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Title / Merchant</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{parsedResult.title}</p>
                </div>

                {/* Amount in ₹ */}
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Amount (INR)</span>
                  <p className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {formatINR(parsedResult.amount)}
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Category</span>
                  <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{parsedResult.category}</span>
                  </div>
                </div>

                {/* Paid By */}
                <div className="space-y-0.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Paid By</span>
                  <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                    <Coins className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{parsedResult.payerName || 'Friend'}</span>
                  </div>
                </div>

                {/* Participants */}
                <div className="col-span-2 space-y-0.5 border-t border-indigo-100/60 dark:border-indigo-900/40 pt-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>Split Among ({parsedResult.participantNames.length} friends):</span>
                  </span>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {parsedResult.participantNames.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedResult || parsedResult.amount <= 0}
            onClick={handleApply}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
              parsedResult && parsedResult.amount > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Transfer to Expense Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
