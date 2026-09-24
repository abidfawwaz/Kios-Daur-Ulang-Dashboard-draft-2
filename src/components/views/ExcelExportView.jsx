import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  exportTransactionsToExcel,
  exportCustomersToExcel,
  exportLocationPerformanceToExcel,
  exportConversionsToExcel,
} from '../../utils/excelExporter';
import {
  FileSpreadsheet,
  Download,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  FileCheck
} from 'lucide-react';

export const ExcelExportView = () => {
  const { 
    locations, 
    transactions, 
    customers, 
    conversions, 
    currentUser 
  } = useApp();

  const [selectedLocFilter, setSelectedLocFilter] = useState('ALL');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  const showSuccess = (msg) => {
    setDownloadSuccessMessage(msg);
    setTimeout(() => setDownloadSuccessMessage(''), 4000);
  };

  const handleExportTransactions = () => {
    const filteredTrx = selectedLocFilter === 'ALL'
      ? transactions
      : transactions.filter(t => t.locationId === selectedLocFilter);
    const locName = selectedLocFilter === 'ALL' 
      ? 'Semua Lokasi' 
      : (locations.find(l => l.id === selectedLocFilter)?.name || 'Filter');
    exportTransactionsToExcel(filteredTrx, locName);
    showSuccess(`Laporan Transaksi (${filteredTrx.length} baris) berhasil diunduh dalam format XLSX.`);
  };

  const handleExportCustomers = () => {
    exportCustomersToExcel(customers, locations);
    showSuccess(`Laporan Rekapitulasi Nasabah (${customers.length} data) berhasil diunduh.`);
  };

  const handleExportPerformance = () => {
    exportLocationPerformanceToExcel(locations, transactions, customers);
    showSuccess('Laporan Performa 5 Kios Daur Ulang ESG berhasil diunduh.');
  };

  const handleExportConversions = () => {
    exportConversionsToExcel(conversions);
    showSuccess(`Laporan Konversi Tabungan Emas (${conversions.length} data) berhasil diunduh.`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Pusat Unduhan Laporan ESG & Excel (XLSX)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 13
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            FR-6: Ekspor data terformat standar untuk kebutuhan pelaporan internal BSI, Sustainability Report, dan audit.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Format Microsoft Excel (.xlsx) Standar</span>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Filter Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-bsi-teal" />
          <span>Filter Cakupan Lokasi Transaksi:</span>
        </div>

        <select
          value={selectedLocFilter}
          onChange={(e) => setSelectedLocFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 w-full sm:w-72"
        >
          <option value="ALL">Semua 5 Lokasi Kios (Agregat)</option>
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* 4 Standard Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Transactions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-bsi-teal/40 shadow-card transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-bsi-teal flex items-center justify-center font-bold mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              1. Laporan Transaksi Setor Sampah
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memuat log transaksi rinci: Tanggal, ID Transaksi, No Struk, Nama Nasabah, Lokasi Kios, Total Berat (kg), Nilai Rupiah, Rincian Sampah, dan Admin Pencatat.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Tersedia: {transactions.length} baris data
            </span>
            <button
              onClick={handleExportTransactions}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bsi-teal hover:bg-bsi-teal-dark text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
          </div>
        </div>

        {/* Report 2: Customers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-bsi-teal/40 shadow-card transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              2. Laporan Rekapitulasi Nasabah & Saldo
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Daftar seluruh nasabah terdaftar: No Rekening BSI, Rekening Tabungan Emas, Lokasi Kios, Akumulasi Saldo, Total Kg Disetor, dan Status Eligibilitas (&ge; Rp 50.000).
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Tersedia: {customers.length} data nasabah
            </span>
            <button
              onClick={handleExportCustomers}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
          </div>
        </div>

        {/* Report 3: Location Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-bsi-teal/40 shadow-card transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-bsi-gold flex items-center justify-center font-bold mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              3. Laporan Kinerja & Target 5 Kios (ESG)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tabel rekapitulasi performa 5 lokasi: Target vs Realisasi Volume (Kg), Target vs Realisasi Rupiah, Persentase Capaian Bulanan, dan Rasio Partisipasi Nasabah.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Mencakup 5 lokasi aktif
            </span>
            <button
              onClick={handleExportPerformance}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bsi-gold hover:bg-bsi-gold-600 text-slate-900 text-xs font-extrabold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
          </div>
        </div>

        {/* Report 4: Gold Conversions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-bsi-teal/40 shadow-card transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-1">
              4. Laporan Konversi Tabungan Emas & Byond
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Arsip verifikasi konversi: ID Pengajuan, Tanggal, Rekening Emas, Nominal Rupiah, Gram Emas, Kode Ref Byond, dan Pelaku Verifikasi Super Admin BSI.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Tersedia: {conversions.length} data konversi
            </span>
            <button
              onClick={handleExportConversions}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
