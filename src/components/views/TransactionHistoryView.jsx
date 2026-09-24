import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg, formatDate, formatDateTime, calculateEnvironmentalImpact } from '../../utils/formatters';
import {
  Search,
  Filter,
  Receipt,
  FileSpreadsheet,
  Eye,
  Calendar,
  MapPin,
  Clock,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import { exportTransactionsToExcel } from '../../utils/excelExporter';

export const TransactionHistoryView = () => {
  const { 
    currentUser, 
    locations, 
    getFilteredTransactions, 
    setSelectedReceiptTrx, 
    setActiveMenu 
  } = useApp();

  const transactions = getFilteredTransactions();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedDetailTrx, setSelectedDetailTrx] = useState(null);

  // Filtered transactions
  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.receiptNo && t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.createdBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = 
      selectedLocation === 'ALL' || t.locationId === selectedLocation;

    return matchesSearch && matchesLocation;
  });

  const handleExport = () => {
    const locName = selectedLocation === 'ALL' 
      ? 'Semua Lokasi' 
      : (locations.find(l => l.id === selectedLocation)?.name || 'Filter');
    exportTransactionsToExcel(filtered, locName);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Riwayat Transaksi Setor Sampah</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 3
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar audit seluruh transaksi timbangan sampah yang tercatat di sistem mandiri BSI.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Ekspor XLSX ({filtered.length} Data)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID Transaksi, No Struk, Nama Nasabah, Petugas..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
          />
        </div>

        {/* Location Filter (only useful if cross-location access) */}
        {currentUser.role !== 'admin_lokasi' && (
          <div className="w-full md:w-64">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
            >
              <option value="ALL">Semua 5 Lokasi Kios</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Nasabah</th>
                <th className="py-3 px-4">Lokasi Kios</th>
                <th className="py-3 px-4 text-right">Total Berat</th>
                <th className="py-3 px-4 text-right">Nilai Rupiah</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Tidak ada transaksi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-bsi-teal block">{t.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.receiptNo}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700 block">{formatDate(t.createdAt)}</span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(t.createdAt).split(',')[1]}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{t.customerName}</span>
                      <span className="text-[10px] text-slate-400">Admin: @{t.createdBy}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="truncate max-w-[160px] block">{t.locationName}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-700">
                      {formatKg(t.totalWeight)}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {t.items.length} jenis
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-bsi-teal text-sm">
                        +{formatRupiah(t.totalAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedDetailTrx(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-bsi-teal hover:bg-teal-50 transition-colors"
                          title="Lihat Detail Item"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReceiptTrx(t);
                            setActiveMenu('receipt');
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Cetak Struk Resmi"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Transaksi */}
      {selectedDetailTrx && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Rincian Transaksi {selectedDetailTrx.id}
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedDetailTrx.receiptNo} • {formatDateTime(selectedDetailTrx.createdAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailTrx(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nama Nasabah:</span>
                  <span className="font-bold text-slate-800">{selectedDetailTrx.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Lokasi Kios:</span>
                  <span className="font-bold text-slate-800">{selectedDetailTrx.locationName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-3">Jenis Sampah</th>
                      <th className="py-2 px-3 text-right">Berat</th>
                      <th className="py-2 px-3 text-right">Harga/kg</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDetailTrx.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-800">{item.wasteName}</td>
                        <td className="py-2 px-3 text-right font-semibold">{item.weightKg} kg</td>
                        <td className="py-2 px-3 text-right text-slate-500">{formatRupiah(item.pricePerKg)}</td>
                        <td className="py-2 px-3 text-right font-bold text-bsi-teal">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td className="py-2.5 px-3">Total Setoran</td>
                      <td className="py-2.5 px-3 text-right">{formatKg(selectedDetailTrx.totalWeight)}</td>
                      <td></td>
                      <td className="py-2.5 px-3 text-right text-base text-bsi-teal">
                        {formatRupiah(selectedDetailTrx.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedDetailTrx.notes && (
                <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  Catatan: {selectedDetailTrx.notes}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedDetailTrx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedReceiptTrx(selectedDetailTrx);
                  setSelectedDetailTrx(null);
                  setActiveMenu('receipt');
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-bsi-teal hover:bg-bsi-teal-dark rounded-xl shadow-sm"
              >
                <Receipt className="w-4 h-4" />
                <span>Buka Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
