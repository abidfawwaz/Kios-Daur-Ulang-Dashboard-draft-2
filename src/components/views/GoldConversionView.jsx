import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate, formatDateTime, calculateGoldGrams, MIN_CONVERSION_THRESHOLD, BSI_GOLD_PRICE_PER_GRAM } from '../../utils/formatters';
import {
  Coins,
  CheckCircle2,
  Clock,
  ArrowRight,
  SendHorizontal,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export const GoldConversionView = () => {
  const { 
    currentUser, 
    locations, 
    getFilteredConversions, 
    getFilteredCustomers, 
    requestConversion, 
    verifyConversion,
    setActiveMenu 
  } = useApp();

  const conversions = getFilteredConversions();
  const customers = getFilteredCustomers();
  const eligibleCustomers = customers.filter(c => c.balance >= MIN_CONVERSION_THRESHOLD);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Request Form
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedCustId, setSelectedCustId] = useState(eligibleCustomers[0]?.id || '');
  const [requestAmount, setRequestAmount] = useState(50000);
  const [requestNotes, setRequestNotes] = useState('');

  // Super Admin Verification Modal
  const [verifyingConversion, setVerifyingConversion] = useState(null);
  const [byondCode, setByondCode] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');

  const filtered = conversions.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.goldAccountNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustId);

  const handleSubmitNewRequest = (e) => {
    e.preventDefault();
    if (!selectedCustId) return;

    const ok = requestConversion({
      customerId: selectedCustId,
      amountRp: Number(requestAmount),
      notes: requestNotes,
    });

    if (ok) {
      setShowNewRequestModal(false);
      setRequestNotes('');
    }
  };

  const handleConfirmVerify = (e) => {
    e.preventDefault();
    if (!verifyingConversion) return;

    const ok = verifyConversion({
      conversionId: verifyingConversion.id,
      byondRefNo: byondCode,
      notes: verifyNotes,
    });

    if (ok) {
      setVerifyingConversion(null);
      setByondCode('');
      setVerifyNotes('');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MENUNGGU_VERIFIKASI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Menunggu Verifikasi Super Admin
          </span>
        );
      case 'DIPROSES_BYOND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <SendHorizontal className="w-3 h-3 text-blue-600" />
            Diproses Transfer Byond
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Selesai (Bukti Terverifikasi)
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Alur Permintaan Konversi Tabungan Emas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 7
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            FR-4: Alur terstandarisasi pengajuan saldo daur ulang ke rekening Tabungan Emas BSI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMenu('byond_transfer')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            <SendHorizontal className="w-4 h-4 text-bsi-teal" />
            <span>Ke Alur Transfer Byond (Menu 8)</span>
          </button>

          {currentUser.role !== 'bsi_viewer' && (
            <button
              onClick={() => {
                if (eligibleCustomers.length === 0) {
                  alert('Tidak ada nasabah yang memiliki saldo ≥ Rp 50.000 saat ini.');
                  return;
                }
                setSelectedCustId(eligibleCustomers[0].id);
                setRequestAmount(Math.min(eligibleCustomers[0].balance, 100000));
                setShowNewRequestModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bsi-gold hover:bg-bsi-gold-600 text-slate-900 text-xs font-extrabold shadow-sm active:scale-95 transition-all"
            >
              <Coins className="w-4 h-4" />
              <span>+ Ajukan Konversi Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Business Workflow Infographic (FR-4) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
        <h3 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-4">
          Visualisasi Alur Standar Konversi Emas (FR-4 End-to-End Flow)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs">
            <span className="w-6 h-6 rounded-full bg-bsi-teal text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">1</span>
            <span className="font-bold text-slate-800 block">Setor Sampah</span>
            <span className="text-[10px] text-slate-500">Saldo nasabah &ge; Rp 50.000</span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs">
            <span className="w-6 h-6 rounded-full bg-bsi-teal text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">2</span>
            <span className="font-bold text-slate-800 block">Pengajuan</span>
            <span className="text-[10px] text-slate-500">Admin Lokasi ajukan request</span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs">
            <span className="w-6 h-6 rounded-full bg-bsi-teal text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">3</span>
            <span className="font-bold text-slate-800 block">Verifikasi</span>
            <span className="text-[10px] text-slate-500">Super Admin setujui & terbitkan ref</span>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs">
            <span className="w-6 h-6 rounded-full bg-bsi-teal text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">4</span>
            <span className="font-bold text-slate-800 block">Transfer Byond</span>
            <span className="text-[10px] text-slate-500">Eksekusi transfer & upload bukti</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2">5</span>
            <span className="font-bold text-emerald-800 block">Selesai & Audit</span>
            <span className="text-[10px] text-emerald-700">Saldo terdebet, emas bertambah</span>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Konversi, Nama Nasabah, No Tabungan Emas..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">Semua Status Alur</option>
            <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
            <option value="DIPROSES_BYOND">Diproses Byond</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
      </div>

      {/* Table of Conversions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID Pengajuan</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nasabah & Akun Emas</th>
                <th className="py-3 px-4">Lokasi Kios</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-right">Estimasi Gram</th>
                <th className="py-3 px-4 text-center">Status Alur</th>
                <th className="py-3 px-4 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Tidak ada pengajuan konversi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-bsi-teal block">{c.id}</span>
                      <span className="text-[10px] text-slate-400">Oleh: @{c.requestedBy}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(c.requestDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{c.customerName}</span>
                      <span className="font-mono text-[10px] text-slate-500">{c.goldAccountNo}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.locationName}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-slate-900 text-sm">
                        {formatRupiah(c.amountRp)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                      ~{c.goldGrams} gr
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.status === 'MENUNGGU_VERIFIKASI' && currentUser.role === 'super_admin' ? (
                        <button
                          onClick={() => {
                            setVerifyingConversion(c);
                            setByondCode(`BYD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition-all"
                        >
                          Verifikasi
                        </button>
                      ) : c.status === 'DIPROSES_BYOND' ? (
                        <button
                          onClick={() => setActiveMenu('byond_transfer')}
                          className="px-3 py-1.5 rounded-lg bg-bsi-teal/10 hover:bg-bsi-teal/20 text-bsi-teal font-bold text-[11px] transition-all"
                        >
                          Upload Bukti
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {c.byondRefNo || 'Tervalidasi'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajukan Konversi Baru */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-bsi-gold" />
              Pengajuan Konversi Emas Baru
            </h3>

            <form onSubmit={handleSubmitNewRequest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Pilih Nasabah (Hanya yang Saldo &ge; Rp 50.000)
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => {
                    setSelectedCustId(e.target.value);
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setRequestAmount(Math.min(cust.balance, 100000));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                  required
                >
                  {eligibleCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Saldo: {formatRupiah(c.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rekening Tabungan Emas:</span>
                    <span className="font-mono font-bold text-bsi-teal">{selectedCustomer.goldAccountNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saldo Tersedia:</span>
                    <span className="font-bold text-slate-800">{formatRupiah(selectedCustomer.balance)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nominal Dikonversi (Rp) *
                </label>
                <input
                  type="number"
                  min={MIN_CONVERSION_THRESHOLD}
                  max={selectedCustomer?.balance || 50000}
                  step={5000}
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900"
                  required
                />
                <span className="text-[11px] text-amber-600 block mt-1">
                  Estimasi emas: ~{calculateGoldGrams(requestAmount)} gr
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan</label>
                <input
                  type="text"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="Catatan pengajuan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-900 bg-bsi-gold hover:bg-bsi-gold-600 rounded-xl shadow-sm"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Verifikasi Super Admin */}
      {verifyingConversion && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Verifikasi Super Admin (Konversi {verifyingConversion.id})
            </h3>
            <p className="text-xs text-slate-500">
              Verifikasi transfer saldo sampah menjadi saldo Tabungan Emas melalui aplikasi Byond BSI.
            </p>

            <form onSubmit={handleConfirmVerify} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nasabah:</span>
                  <span className="font-bold text-slate-800">{verifyingConversion.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rekening Emas:</span>
                  <span className="font-mono text-bsi-teal font-bold">{verifyingConversion.goldAccountNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal:</span>
                  <span className="font-black text-slate-900 text-sm">{formatRupiah(verifyingConversion.amountRp)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor Referensi Transaksi Byond BSI *
                </label>
                <input
                  type="text"
                  value={byondCode}
                  onChange={(e) => setByondCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-bsi-teal"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Verifikasi</label>
                <input
                  type="text"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Disetujui oleh Tim ESG BSI..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setVerifyingConversion(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Setujui & Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
