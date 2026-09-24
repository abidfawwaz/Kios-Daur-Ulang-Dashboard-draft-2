import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg, MIN_CONVERSION_THRESHOLD, calculateGoldGrams, BSI_GOLD_PRICE_PER_GRAM } from '../../utils/formatters';
import {
  Wallet,
  Coins,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const BalanceEligibilityView = () => {
  const { 
    currentUser, 
    locations, 
    getFilteredCustomers, 
    requestConversion, 
    setActiveMenu 
  } = useApp();

  const customers = getFilteredCustomers();

  const [activeTab, setActiveTab] = useState('ELIGIBLE'); // 'ALL' | 'ELIGIBLE' | 'NOT_ELIGIBLE'
  const [searchQuery, setSearchQuery] = useState('');

  // Conversion Request Modal state
  const [targetCustomer, setTargetCustomer] = useState(null);
  const [conversionAmount, setConversionAmount] = useState(50000);
  const [conversionNotes, setConversionNotes] = useState('');

  const eligibleList = customers.filter(c => c.balance >= MIN_CONVERSION_THRESHOLD);
  const notEligibleList = customers.filter(c => c.balance < MIN_CONVERSION_THRESHOLD);

  const totalAllBalance = customers.reduce((acc, c) => acc + c.balance, 0);
  const totalEligibleBalance = eligibleList.reduce((acc, c) => acc + c.balance, 0);

  // Tab filtering
  let currentList = customers;
  if (activeTab === 'ELIGIBLE') currentList = eligibleList;
  if (activeTab === 'NOT_ELIGIBLE') currentList = notEligibleList;

  const filtered = currentList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.goldAccountNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConversionModal = (customer) => {
    setTargetCustomer(customer);
    // Suggest maximum round multiple or full balance
    setConversionAmount(Math.min(customer.balance, 100000));
    setConversionNotes(`Pengajuan konversi saldo Tabungan Emas untuk ${customer.name}`);
  };

  const handleConfirmConversion = (e) => {
    e.preventDefault();
    if (!targetCustomer) return;

    const ok = requestConversion({
      customerId: targetCustomer.id,
      amountRp: Number(conversionAmount),
      notes: conversionNotes,
    });

    if (ok) {
      setTargetCustomer(null);
      setActiveMenu('gold_conversion');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Pemantauan Saldo & Kelayakan Konversi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 6
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring saldo sampah nasabah terhadap ambang batas minimal Rp 50.000 untuk konversi Tabungan Emas BSI.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <Coins className="w-4 h-4 text-bsi-gold" />
          <span>Ambang Batas Konversi: <b>Rp 50.000</b></span>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Total Saldo Nasabah</span>
            <Wallet className="w-4 h-4 text-bsi-teal" />
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            {formatRupiah(totalAllBalance)}
          </div>
          <span className="text-xs text-slate-500">{customers.length} total nasabah terdaftar</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
            <span>Saldo Siap Konversi Emas</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mb-1">
            {formatRupiah(totalEligibleBalance)}
          </div>
          <span className="text-xs font-bold text-emerald-600">
            {eligibleList.length} nasabah memenuhi syarat (≥ Rp 50k)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Belum Mencapai Ambang</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            {notEligibleList.length} Nasabah
          </div>
          <span className="text-xs text-slate-500">Saldo masih di bawah Rp 50.000</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ELIGIBLE')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ELIGIBLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligible Konversi ({eligibleList.length})
            </button>
            <button
              onClick={() => setActiveTab('NOT_ELIGIBLE')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'NOT_ELIGIBLE'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Eligible ({notEligibleList.length})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({customers.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama nasabah atau no emas..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
            />
          </div>
        </div>

        {/* List of Customers */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nasabah</th>
                <th className="py-3 px-4">No. Tabungan Emas</th>
                <th className="py-3 px-4">Lokasi Kios</th>
                <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                <th className="py-3 px-4 text-right">Estimasi Gram Emas</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Tidak ada nasabah pada tab ini.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const loc = locations.find(l => l.id === c.locationId);
                  const isEligible = c.balance >= MIN_CONVERSION_THRESHOLD;
                  const goldEst = calculateGoldGrams(c.balance);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.phone}</span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-bsi-teal">
                        {c.goldAccountNo}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {loc?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-black text-slate-800 text-sm block">
                          {formatRupiah(c.balance)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                        {isEligible ? `~${goldEst} gr` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Kurang {formatRupiah(MIN_CONVERSION_THRESHOLD - c.balance)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEligible && currentUser.role !== 'bsi_viewer' ? (
                          <button
                            onClick={() => handleOpenConversionModal(c)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bsi-gold hover:bg-bsi-gold-600 text-slate-900 font-extrabold text-[11px] shadow-sm active:scale-95 transition-all mx-auto"
                          >
                            <span>Ajukan Konversi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {isEligible ? 'Hanya Lihat' : 'Tunggu Setoran'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajukan Konversi Emas */}
      {targetCustomer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Coins className="w-5 h-5 text-bsi-gold" />
                  Ajukan Konversi Tabungan Emas
                </h3>
                <span className="text-xs text-slate-500">
                  Untuk nasabah: {targetCustomer.name} ({targetCustomer.goldAccountNo})
                </span>
              </div>
              <button
                onClick={() => setTargetCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmConversion} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo Nasabah Tersedia:</span>
                  <span className="font-bold text-bsi-teal">{formatRupiah(targetCustomer.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ambang Batas Minimum:</span>
                  <span className="font-bold text-slate-700">{formatRupiah(MIN_CONVERSION_THRESHOLD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Harga Acuan Emas BSI:</span>
                  <span className="font-mono text-slate-700">{formatRupiah(BSI_GOLD_PRICE_PER_GRAM)} / gr</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nominal Saldo yang Ingin Dikonversi (Rp) *
                </label>
                <input
                  type="number"
                  min={MIN_CONVERSION_THRESHOLD}
                  max={targetCustomer.balance}
                  step={5000}
                  value={conversionAmount}
                  onChange={(e) => setConversionAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Estimasi emas yang didapat: <b className="text-amber-600 font-mono">~{calculateGoldGrams(conversionAmount)} gram</b>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Pengajuan</label>
                <input
                  type="text"
                  value={conversionNotes}
                  onChange={(e) => setConversionNotes(e.target.value)}
                  placeholder="Catatan untuk verifikator..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTargetCustomer(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-900 bg-bsi-gold hover:bg-bsi-gold-600 rounded-xl shadow-sm"
                >
                  Kirim Pengajuan Konversi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
