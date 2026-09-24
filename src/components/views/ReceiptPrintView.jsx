import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg, formatDateTime, calculateEnvironmentalImpact } from '../../utils/formatters';
import {
  Printer,
  Receipt,
  Search,
  CheckCircle2,
  TreePine,
  Download,
  Share2,
  Building2,
  QrCode,
  ArrowLeft
} from 'lucide-react';

export const ReceiptPrintView = () => {
  const { 
    transactions, 
    selectedReceiptTrx, 
    setSelectedReceiptTrx, 
    customers,
    locations,
    setActiveMenu 
  } = useApp();

  const [searchReceiptId, setSearchReceiptId] = useState('');

  // Current active transaction for receipt
  const currentTrx = selectedReceiptTrx || transactions[0];
  const customer = customers.find(c => c.id === currentTrx?.customerId);
  const location = locations.find(l => l.id === currentTrx?.locationId);

  const envImpact = currentTrx ? calculateEnvironmentalImpact(currentTrx.totalWeight) : null;

  const handleSearchReceipt = (e) => {
    e.preventDefault();
    const found = transactions.find(t => 
      t.id.toLowerCase() === searchReceiptId.trim().toLowerCase() ||
      (t.receiptNo && t.receiptNo.toLowerCase() === searchReceiptId.trim().toLowerCase())
    );
    if (found) {
      setSelectedReceiptTrx(found);
    } else {
      alert('Transaksi tidak ditemukan!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentTrx) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-700">Belum ada transaksi untuk dicetak</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Silakan buat transaksi baru terlebih dahulu</p>
        <button
          onClick={() => setActiveMenu('create_transaction')}
          className="px-4 py-2 bg-bsi-teal text-white rounded-xl text-xs font-bold"
        >
          Buat Transaksi Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Cetak Struk Transaksi Resmi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 4
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Struk bukti setor sampah resmi BSI x Kepul untuk nasabah kios daur ulang.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMenu('transactions')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Riwayat</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bsi-teal hover:bg-bsi-teal-dark text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk (Print)</span>
          </button>
        </div>
      </div>

      {/* Quick Lookup Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex items-center gap-3 no-print">
        <form onSubmit={handleSearchReceipt} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchReceiptId}
              onChange={(e) => setSearchReceiptId(e.target.value)}
              placeholder="Cari No. Transaksi (cth: TRX-202609-001) atau No. Struk..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-colors"
          >
            Cari
          </button>
        </form>

        <span className="text-xs text-slate-400">|</span>

        {/* Dropdown selector of recent 5 transactions */}
        <select
          value={currentTrx.id}
          onChange={(e) => {
            const found = transactions.find(t => t.id === e.target.value);
            if (found) setSelectedReceiptTrx(found);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
        >
          {transactions.map(t => (
            <option key={t.id} value={t.id}>
              {t.id} — {t.customerName} ({formatRupiah(t.totalAmount)})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Thermal/Official Slip Card */}
      <div className="flex justify-center">
        <div
          id="printable-receipt"
          className="w-full max-w-md bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-elevated font-mono text-slate-800 space-y-4 relative"
        >
          {/* Header BSI & Kepul */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-sans font-black text-xl text-bsi-teal tracking-tight">BSI</span>
              <span className="text-xs font-sans font-bold text-slate-400">×</span>
              <span className="font-sans font-extrabold text-sm text-amber-500">KEPUL</span>
            </div>
            <h4 className="font-sans font-bold text-xs uppercase text-slate-800 tracking-wider">
              KIOS DAUR ULANG TABUNGAN EMAS
            </h4>
            <p className="text-[11px] text-slate-600 mt-1 font-sans">
              {currentTrx.locationName}
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              PT Bank Syariah Indonesia Tbk • ESG Sustainable Initiative
            </p>
          </div>

          {/* Meta Details */}
          <div className="text-xs space-y-1 py-1 border-b border-dashed border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">No. Transaksi:</span>
              <span className="font-bold">{currentTrx.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">No. Struk:</span>
              <span>{currentTrx.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Waktu:</span>
              <span>{formatDateTime(currentTrx.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Petugas Kios:</span>
              <span>@{currentTrx.createdBy}</span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="text-xs space-y-1 py-1 border-b border-dashed border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Nasabah:</span>
              <span className="font-bold">{currentTrx.customerName}</span>
            </div>
            {customer && (
              <>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">No. Tabungan Emas:</span>
                  <span className="font-mono">{customer.goldAccountNo}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">No. Rekening BSI:</span>
                  <span className="font-mono">{customer.bsiAccountNo}</span>
                </div>
              </>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2 border-b-2 border-dashed border-slate-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase flex justify-between mb-2">
              <span>Item / Jenis Sampah</span>
              <span>Subtotal</span>
            </div>
            <div className="space-y-2 text-xs">
              {currentTrx.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold block text-slate-800">{item.wasteName}</span>
                    <span className="text-[11px] text-slate-500">
                      {item.weightKg} kg × {formatRupiah(item.pricePerKg)}
                    </span>
                  </div>
                  <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Balance */}
          <div className="text-xs space-y-1.5 py-1 border-b border-dashed border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>Total Timbangan:</span>
              <span className="font-bold">{formatKg(currentTrx.totalWeight)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1">
              <span className="text-slate-900">NILAI TRANSAKSI:</span>
              <span className="text-bsi-teal text-base">+{formatRupiah(currentTrx.totalAmount)}</span>
            </div>
            {customer && (
              <div className="flex justify-between text-xs font-bold pt-2 border-t border-slate-100">
                <span className="text-slate-700">Saldo Akumulasi:</span>
                <span className="text-slate-900">{formatRupiah(customer.balance)}</span>
              </div>
            )}
          </div>

          {/* Environmental Equivalents */}
          {envImpact && (
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[10px] space-y-1 font-sans">
              <div className="font-bold text-bsi-teal flex items-center gap-1">
                <TreePine className="w-3.5 h-3.5" />
                <span>Kontribusi Keberlanjutan Lingkungan (ESG):</span>
              </div>
              <p className="text-slate-600">
                Setoran Anda berkontribusi mengurangi <b>{envImpact.co2ReducedKg} kg CO₂</b> dan menghemat energi <b>{envImpact.energySavedKwh} kWh</b>.
              </p>
            </div>
          )}

          {/* Barcode & Footer Mock */}
          <div className="text-center pt-2 space-y-2">
            <div className="inline-block p-2 bg-slate-50 rounded-lg border border-slate-200">
              <QrCode className="w-16 h-16 mx-auto text-slate-800" />
              <span className="text-[9px] text-slate-400 block mt-1 tracking-widest">
                VERIFIED BY BSI ESG
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Terima kasih atas kepedulian Anda terhadap lingkungan.<br />
              Kumpulkan saldo hingga Rp 50.000 untuk konversi Tabungan Emas BSI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
