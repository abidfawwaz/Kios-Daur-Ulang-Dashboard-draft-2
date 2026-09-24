import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const UserManagementView = () => {
  const { 
    currentUser, 
    users, 
    locations, 
    toggleUserStatus, 
    switchUser,
    showToast,
    logAuditAction 
  } = useApp();

  const [selectedUserForReset, setSelectedUserForReset] = useState(null);

  const handleResetPin = (user) => {
    logAuditAction({
      action: 'RESET_USER_CREDENTIALS',
      target: user.username,
      details: `Super Admin mereset kredensial akses untuk akun @${user.username}`,
    });
    showToast(`Kredensial dan PIN untuk @${user.username} berhasil di-reset ke default!`, 'success');
    setSelectedUserForReset(null);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'bsi_viewer':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'admin_lokasi':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // RBAC Matrix definition for explanation
  const rbacMatrix = [
    { menu: '1. Ringkasan (Dashboard)', admin: 'Lokasi Sendiri', viewer: 'Semua Lokasi', super: 'Akses Penuh' },
    { menu: '2. Buat Transaksi', admin: 'Input & Simpan', viewer: 'Tidak Ada Akses', super: 'Akses Penuh' },
    { menu: '3. Riwayat Transaksi', admin: 'Lokasi Sendiri', viewer: 'Semua Lokasi', super: 'Akses Penuh' },
    { menu: '4. Cetak Struk', admin: 'Cetak & Unduh', viewer: 'Hanya Lihat', super: 'Akses Penuh' },
    { menu: '5. Data Nasabah', admin: 'Input & Kelola', viewer: 'Hanya Lihat', super: 'Akses Penuh' },
    { menu: '6. Saldo & Kelayakan', admin: 'Lokasi Sendiri', viewer: 'Semua Lokasi', super: 'Akses Penuh' },
    { menu: '7. Konversi Emas', admin: 'Ajukan Permintaan', viewer: 'Hanya Lihat', super: 'Verifikasi & Approval' },
    { menu: '8. Transfer Byond', admin: 'Upload Bukti', viewer: 'Hanya Lihat', super: 'Verifikasi & Konfirmasi' },
    { menu: '9. Katalog Harga', admin: 'Lihat / Usulkan', viewer: 'Hanya Lihat', super: 'Kelola & Ubah Harga' },
    { menu: '10. Lokasi Kios', admin: 'Lokasi Sendiri', viewer: 'Semua Lokasi', super: 'Konfigurasi Pusat' },
    { menu: '11. Performa & Target', admin: 'Lokasi Sendiri', viewer: 'Analitik Penuh', super: 'Kelola Target' },
    { menu: '12. Sampah & Nilai', admin: 'Lokasi Sendiri', viewer: 'Analitik Penuh', super: 'Analitik Penuh' },
    { menu: '13. Export Excel', admin: 'Lokasi Sendiri', viewer: 'Semua Lokasi', super: 'Semua Lokasi' },
    { menu: '14. Pengguna & RBAC', admin: 'Tidak Ada Akses', viewer: 'Tidak Ada Akses', super: 'Kelola Akun Penuh' },
    { menu: '15. Log Audit', admin: 'Aktivitas Sendiri', viewer: 'Review Seluruh Log', super: 'Akses Penuh' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Manajemen Pengguna & Hak Akses (RBAC)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 14
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            FR-1: Kontrol autentikasi berbasis role (5 admin lokasi, 1 bsi viewer, super admin) dengan isolasi data RLS.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-bsi-teal">
          <ShieldCheck className="w-4 h-4" />
          <span>7 Akun Kredensial Terkonfigurasi</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Daftar Akun Pengguna Sistem
          </h3>
          <span className="text-xs text-slate-400">Total: {users.length} Akun Aktif</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Role Akses</th>
                <th className="py-3 px-4">Unit Kerja / Lokasi Terikat (RLS)</th>
                <th className="py-3 px-4">Kontak & Email</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Tindakan Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isCurrent = u.id === currentUser.id;

                return (
                  <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-teal-50/40' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                            {u.name}
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-bsi-teal text-white font-extrabold">
                                ANDA
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-bsi-teal font-semibold">
                            @{u.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold block">{u.locationName}</span>
                      <span className="text-[10px] text-slate-400">{u.unit}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="block">{u.email}</span>
                      <span className="text-[10px] text-slate-400">{u.phone}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => switchUser(u.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-bsi-teal hover:bg-teal-50 rounded-lg transition-colors border border-bsi-teal/30"
                          title="Simulasikan login sebagai pengguna ini"
                        >
                          Login Simulasi
                        </button>

                        {currentUser.role === 'super_admin' && (
                          <>
                            <button
                              onClick={() => setSelectedUserForReset(u)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                              title="Reset Akses & PIN"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                            {u.id !== currentUser.id && (
                              <button
                                onClick={() => toggleUserStatus(u.id)}
                                className={`p-1 rounded-lg ${
                                  u.status === 'ACTIVE'
                                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                    : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={u.status === 'ACTIVE' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                              >
                                {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Permission Matrix Explanatory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-bsi-teal" />
          <h3 className="font-extrabold text-slate-900 text-sm">
            Matriks Hak Akses RBAC (Role-Based Access Control)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Pemetaan wewenang 3 role pengguna terhadap seluruh 15 modul menu sistem Kios Daur Ulang BSI x Kepul.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Modul Menu (15 Menu)</th>
                <th className="py-2.5 px-3">admin_lokasi (5 Kios)</th>
                <th className="py-2.5 px-3">bsi_viewer (1 Akun)</th>
                <th className="py-2.5 px-3">super_admin (BSI Pusat)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-semibold text-slate-800">{row.menu}</td>
                  <td className="py-2 px-3 text-slate-600">{row.admin}</td>
                  <td className="py-2 px-3 text-slate-600">{row.viewer}</td>
                  <td className="py-2 px-3 font-bold text-bsi-teal">{row.super}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Modal */}
      {selectedUserForReset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              Reset Kredensial Pengguna
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Konfirmasi reset password dan PIN untuk akun <b>@{selectedUserForReset.username}</b> ({selectedUserForReset.name}).
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedUserForReset(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => handleResetPin(selectedUserForReset)}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
