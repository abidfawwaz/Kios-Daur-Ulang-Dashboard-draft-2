import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../utils/formatters';
import {
  ClipboardList,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const AuditLogView = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const exportAuditLogsToExcel = () => {
    const data = filteredLogs.map((l, idx) => ({
      'No': idx + 1,
      'Timestamp': formatDateTime(l.timestamp),
      'Pelaku (User)': l.userName,
      'Role': l.userRole,
      'Lokasi': l.locationName,
      'Tipe Aksi': l.action,
      'Target ID': l.target || '-',
      'Detail Perubahan': l.details,
      'IP Address': l.ipAddress,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Trail Log');
    XLSX.writeFile(wb, `Audit_Trail_BSI_Kios_Daur_Ulang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getActionBadge = (action) => {
    if (action.includes('TRANSACTION')) {
      return 'bg-teal-100 text-teal-800 border-teal-200';
    }
    if (action.includes('CONVERSION') || action.includes('BYOND')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (action.includes('CUSTOMER')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (action.includes('RESET') || action.includes('PRICE') || action.includes('STATUS')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Log Audit & Jejak Aktivitas Sistem (Audit Trail)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 15
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            FR-7: Pencatatan otomatis setiap aksi kunci transaksi, konversi emas, dan perubahan data demi tata kelola ESG transparan.
          </p>
        </div>

        <button
          onClick={exportAuditLogsToExcel}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Ekspor Log XLSX ({filteredLogs.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pelaku aksi, target ID (TRX/CNV), detail kata kunci..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
          />
        </div>

        <div className="w-full md:w-64">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">Semua Tipe Aksi</option>
            <option value="CREATE_TRANSACTION">Transaksi Setoran</option>
            <option value="REQUEST_CONVERSION">Pengajuan Konversi</option>
            <option value="VERIFY_CONVERSION">Verifikasi Konversi</option>
            <option value="COMPLETE_BYOND_TRANSFER">Penyelesaian Byond</option>
            <option value="REGISTER_CUSTOMER">Registrasi Nasabah</option>
            <option value="UPDATE_WASTE_PRICE">Perubahan Harga Sampah</option>
            <option value="SWITCH_ACCOUNT">Peralihan Sesi Akun</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu (Timestamp)</th>
                <th className="py-3 px-4">Pengguna & Peran</th>
                <th className="py-3 px-4">Tipe Aksi</th>
                <th className="py-3 px-4">Target Entitas</th>
                <th className="py-3 px-4">Rincian Perubahan</th>
                <th className="py-3 px-4 text-center">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Tidak ada aktivitas log yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400">{log.userRole} • {log.locationName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-bsi-teal">
                      {log.target || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
