import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  UserCheck, 
  MapPin, 
  ChevronDown, 
  RotateCcw, 
  ShieldAlert, 
  Sparkles,
  Coins,
  Bell,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const Header = () => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    resetAllData, 
    conversions,
    customers,
    locations
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Quick stats for notification bell
  const pendingConversions = conversions.filter(c => c.status === 'MENUNGGU_VERIFIKASI').length;
  const eligibleCustomers = customers.filter(c => c.balance >= 50000).length;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return { label: 'SUPER ADMIN (BSI Pusat)', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'bsi_viewer':
        return { label: 'BSI ESG VIEWER (Read-Only)', bg: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'admin_lokasi':
        return { label: 'ADMIN KIOS LOKASI', bg: 'bg-amber-100 text-amber-850 border-amber-300' };
      default:
        return { label: role, bg: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const badge = getRoleBadge(currentUser.role);
  const userLocation = locations.find(l => l.id === currentUser.locationId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* BSI Styled Emblem */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-bsi-teal to-bsi-teal-dark flex items-center justify-center text-white font-bold shadow-md shadow-bsi-teal/20 relative overflow-hidden">
              <span className="text-xl tracking-tight font-extrabold">BSI</span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bsi-gold rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-base lg:text-lg tracking-tight leading-none">
                  Kios Daur Ulang <span className="text-bsi-teal font-black">BSI</span>
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20">
                  x Kepul
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Tabungan Emas
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Sistem Mandiri ESG Operations & Sustainability PT Bank Syariah Indonesia Tbk
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Active Location indicator, Role Switcher, and User Profile */}
        <div className="flex items-center gap-3">
          {/* Location Badge (RLS Visibility Indicator) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <MapPin className="w-4 h-4 text-bsi-teal" />
            <div>
              <span className="text-slate-400 block text-[10px] leading-tight">Cakupan Lokasi (RLS):</span>
              <span className="font-bold text-slate-700 truncate max-w-[190px] block">
                {currentUser.role === 'admin_lokasi' && userLocation 
                  ? userLocation.name 
                  : '5 Lokasi Kios (Semua Data)'}
              </span>
            </div>
          </div>

          {/* Role Switcher Dropdown (Essential for testing all 7 accounts) */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:border-bsi-teal/50 hover:bg-bsi-teal/5 transition-all text-left shadow-sm group"
              title="Klik untuk beralih akun simulasi RBAC"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-bsi-teal/30"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                    {currentUser.role}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block leading-tight truncate max-w-[170px]">
                  {currentUser.unit}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-bsi-teal transition-transform" />
            </button>

            {/* Dropdown Menu for Switching Accounts */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Simulasi Akses Pengguna (RBAC)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Pilih akun untuk menguji batasan hak akses sesuai PRD Bagian 3
                  </p>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
                  {users.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-bsi-teal/5 border-l-4 border-bsi-teal' : ''
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {u.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-bsi-teal shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-bsi-teal block">
                            @{u.username} • {u.role}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {u.locationName}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data Sistem ke Default
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Mock Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Reset Seluruh Data?
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Tindakan ini akan mengembalikan data 5 lokasi kios, 16 katalog sampah, saldo nasabah, transaksi, dan audit trail ke kondisi awal seed PRD.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
