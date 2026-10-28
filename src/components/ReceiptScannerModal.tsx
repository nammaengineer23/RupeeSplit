import React, { useState } from 'react';
import { 
  SAMPLE_INDIAN_RECEIPTS, 
  SampleReceipt, 
  simulateReceiptOcr, 
  ScanReceiptOutput 
} from '../utils/receiptScanner';
import { formatMoney } from '../utils/format';
import { getCurrencyInfo } from '../utils/currency';
import { 
  X, 
  ScanLine, 
  Check, 
  Upload, 
  Receipt, 
  Sparkles, 
  ArrowRight,
  Store,
  Calendar,
  FileText
} from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedExpense: (output: ScanReceiptOutput) => void;
  currency?: string;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedExpense,
  currency = 'INR',
}) => {
  const currInfo = getCurrencyInfo(currency);
  const formatPrice = (amt: number) => formatMoney(amt, currency);
  const [selectedSample, setSelectedSample] = useState<SampleReceipt>(SAMPLE_INDIAN_RECEIPTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [scannedResult, setScannedResult] = useState<ScanReceiptOutput | null>(null);

  if (!isOpen) return null;

  const handleStartScan = (sample?: SampleReceipt) => {
    setIsScanning(true);
    setScanProgress(15);
    setScanStep('Analyzing document texture & orientation...');
    setScannedResult(null);

    setTimeout(() => {
      setScanProgress(45);
      setScanStep('Locating Merchant Details & Tax IDs...');
    }, 400);

    setTimeout(() => {
      setScanProgress(75);
      setScanStep(`Parsing line items and prices (${currInfo.symbol})...`);
    }, 850);

    setTimeout(async () => {
      setScanProgress(100);
      setScanStep(`Verifying ${currInfo.symbol} totals and taxes...`);
      const result = await simulateReceiptOcr(sample || selectedSample);
      setScannedResult(result);
      setIsScanning(false);
    }, 1300);
  };

  const handleApply = () => {
    if (scannedResult) {
      onApplyParsedExpense(scannedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <ScanLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Receipt Scanner ({currInfo.code})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate instant OCR extraction from restaurant, hotel, fuel & shop bills
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
          {/* Sample Bills Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try Sample Receipts:</span>
              </label>
              <span className="text-[11px] text-slate-400">1-click instant test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_INDIAN_RECEIPTS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setSelectedSample(sample);
                    handleStartScan(sample);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedSample.id === sample.id
                      ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {sample.name}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {formatPrice(sample.total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{sample.tag}</span>
                    <span>{sample.items.length} items</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Box Alternative */}
          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="bill-upload-input"
              onChange={() => handleStartScan()}
            />
            <label
              htmlFor="bill-upload-input"
              className="cursor-pointer flex flex-col items-center gap-1.5"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Or upload any bill image from phone / camera
              </span>
              <span className="text-[11px] text-slate-400">
                Supports JPG, PNG invoices & tax slips
              </span>
            </label>
          </div>

          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2.5 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <ScanLine className="w-4 h-4 animate-spin" />
                <span>{scanStep}</span>
              </div>
              <div className="w-full bg-emerald-200/70 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Scanned Result Card */}
          {scannedResult && !isScanning && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-800/80 shadow-xs">
              <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Extracted Invoice Data
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {formatPrice(scannedResult.amount)}
                </span>
              </div>

              <div className="p-4 space-y-3 text-xs">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/80 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                      <Store className="w-3 h-3 text-slate-400" />
                      <span>Merchant</span>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {scannedResult.receiptDetails.merchantName}
                    </p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] justify-end">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Date</span>
                    </div>
                    <p className="font-mono text-slate-800 dark:text-slate-200">{scannedResult.date}</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Detected Line Items
                  </span>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {scannedResult.receiptDetails.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs"
                      >
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-mono font-medium shrink-0 text-slate-900 dark:text-slate-100">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotals & GST */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {formatPrice(scannedResult.receiptDetails.subtotal || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Taxes / GST:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {formatPrice(scannedResult.receiptDetails.gst || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-700 text-sm">
                    <span>Total Bill:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">
                      {formatPrice(scannedResult.amount)}
                    </span>
                  </div>
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
            disabled={!scannedResult || isScanning}
            onClick={handleApply}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-sm ${
              scannedResult && !isScanning
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Apply to Expense Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
