import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Receipt,
  Users,
  Wallet,
  Coins,
  SendHorizontal,
  Tags,
  Store,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  ShieldCheck,
  ClipboardList,
  Lock,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { 
    activeMenu, 
    setActiveMenu, 
    currentUser, 
    conversions,
    customers 
  } = useApp();

  const pendingConversionsCount = conversions.filter(c => c.status === 'MENUNGGU_VERIFIKASI').length;
  const eligibleCustomersCount = customers.filter(c => c.balance >= 50000).length;

  // The 15 menus defined in PRD Section 5
  const menuSections = [
    {
      title: 'OPERASIONAL KIOS',
      items: [
        {
          id: 'dashboard',
          number: 1,
          name: 'Ringkasan (Dashboard)',
          icon: LayoutDashboard,
          roles: ['admin_lokasi', 'bsi_viewer', 'super_admin'],
        },
        {
          id: 'create_transaction',
          number: 2,
          name: 'Buat Transaksi',
          icon: PlusCircle,
          badgeText: 'Input',
          roles: ['admin_lokasi', 'super_admin'],
        },
        {
          id: 'transactions',
          number: 3,
          name: 'Riwayat Transaksi',
          icon: History,
          roles: ['admin_lokasi', 'bsi_viewer', 'super_admin'],
        },
        {
          id: 'receipt',
          number: 4,
          name: 'Cetak Struk',
          icon: Receipt,
          roles: ['admin_lokasi', 'super_admin', 'bsi_viewer'],
        },
        {
          id: 'customers',
          number: 5,
          name: 'Data Nasabah',
          icon: Users,
          roles: ['admin_lokasi', 'super_admin', 'bsi_viewer'],
        },
        {
          id: 'balances',
          number: 6,
          name: 'Saldo & Kelayakan',
          icon: Wallet,
          badgeCount: eligibleCustomersCount > 0 ? eligibleCustomersCount : null,
          badgeColor: 'bg-emerald-500 text-white',
          roles: ['admin_lokasi', 'bsi_viewer', 'super_admin'],
        },
      ],
    },
    {
      title: 'TABUNGAN EMAS & BYOND',
      items: [
        {
          id: 'gold_conversion',
          number: 7,
          name: 'Konversi Emas',
          icon: Coins,
          badgeCount: pendingConversionsCount > 0 ? pendingConversionsCount : null,
          badgeColor: 'bg-amber-500 text-white',
          roles: ['admin_lokasi', 'super_admin', 'bsi_viewer'],
        },
        {
          id: 'byond_transfer',
          number: 8,
          name: 'Transfer Byond',
          icon: SendHorizontal,
          badgeText: 'Alur',
          roles: ['admin_lokasi', 'super_admin', 'bsi_viewer'],
        },
      ],
    },
    {
      title: 'MASTER DATA & LOKASI',
      items: [
        {
          id: 'waste_catalog',
          number: 9,
          name: 'Katalog Harga Sampah',
          icon: Tags,
          roles: ['admin_lokasi', 'super_admin', 'bsi_viewer'],
        },
        {
          id: 'kiosk_locations',
          number: 10,
          name: 'Lokasi Kios',
          icon: Store,
          badgeText: '5 Kios',
          roles: ['bsi_viewer', 'admin_lokasi', 'super_admin'],
        },
        {
          id: 'location_performance',
          number: 11,
          name: 'Performa & Target Lokasi',
          icon: TrendingUp,
          roles: ['bsi_viewer', 'super_admin', 'admin_lokasi'],
        },
        {
          id: 'waste_analytics',
          number: 12,
          name: 'Sampah & Nilai Ekonomi',
          icon: PieChart,
          roles: ['bsi_viewer', 'admin_lokasi', 'super_admin'],
        },
      ],
    },
    {
      title: 'PELAPORAN & GOVERNANCE',
      items: [
        {
          id: 'excel_export',
          number: 13,
          name: 'Laporan Export Excel',
          icon: FileSpreadsheet,
          badgeText: 'XLSX',
          roles: ['bsi_viewer', 'admin_lokasi', 'super_admin'],
        },
        {
          id: 'rbac_users',
          number: 14,
          name: 'Pengguna & RBAC',
          icon: ShieldCheck,
          roles: ['super_admin'],
          restrictedForOthers: true,
        },
        {
          id: 'audit_logs',
          number: 15,
          name: 'Log Audit',
          icon: ClipboardList,
          roles: ['bsi_viewer', 'super_admin', 'admin_lokasi'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[65px] h-screen lg:h-[calc(100vh-65px)] w-68 bg-white border-r border-slate-200 z-40 transition-transform duration-200 ease-in-out flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside mobile view */}
        <div className="p-4 border-b border-slate-100 lg:hidden flex items-center justify-between">
          <span className="font-bold text-slate-800 text-sm">Daftar Menu Kios</span>
          <button
            onClick={closeMobileSidebar}
            className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-100"
          >
            Tutup
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div className="px-3 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">
                  {section.title}
                </span>
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeMenu === item.id;
                  const isAccessible = item.roles.includes(currentUser.role);
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          if (isAccessible) {
                            setActiveMenu(item.id);
                            if (closeMobileSidebar) closeMobileSidebar();
                          }
                        }}
                        disabled={!isAccessible}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                          isActive
                            ? 'bg-bsi-teal text-white shadow-md shadow-bsi-teal/20 font-bold'
                            : isAccessible
                            ? 'text-slate-700 hover:bg-slate-100/80 hover:text-bsi-teal'
                            : 'text-slate-350 bg-slate-50/50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-5 text-[10px] font-bold text-center shrink-0 ${
                              isActive ? 'text-bsi-teal-100' : 'text-slate-400'
                            }`}
                          >
                            {item.number}.
                          </span>
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-white'
                                : isAccessible
                                ? 'text-slate-500 group-hover:text-bsi-teal'
                                : 'text-slate-300'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {/* Badges or Lock */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badgeCount && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                isActive ? 'bg-white text-bsi-teal' : item.badgeColor
                              }`}
                            >
                              {item.badgeCount}
                            </span>
                          )}
                          {item.badgeText && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.badgeText}
                            </span>
                          )}
                          {!isAccessible && (
                            <Lock className="w-3 h-3 text-slate-300 shrink-0" />
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer info: BSI ESG & Kepul Partnership note */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-bsi-teal/10 to-amber-500/10 border border-bsi-teal/20 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-bsi-teal-dark mb-0.5">
              <span>🌱 ESG BSI Berkelanjutan</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">
              Daur ulang bernilai emas dengan prinsip syariah & transparansi data.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
