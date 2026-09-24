import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';
import { Menu, X } from 'lucide-react';

// Views for the 15 Menus
import { DashboardView } from './components/views/DashboardView';
import { CreateTransactionView } from './components/views/CreateTransactionView';
import { TransactionHistoryView } from './components/views/TransactionHistoryView';
import { ReceiptPrintView } from './components/views/ReceiptPrintView';
import { CustomerManagementView } from './components/views/CustomerManagementView';
import { BalanceEligibilityView } from './components/views/BalanceEligibilityView';
import { GoldConversionView } from './components/views/GoldConversionView';
import { ByondTransferView } from './components/views/ByondTransferView';
import { WasteCatalogView } from './components/views/WasteCatalogView';
import { KioskLocationsView } from './components/views/KioskLocationsView';
import { LocationPerformanceView } from './components/views/LocationPerformanceView';
import { WasteAnalyticsView } from './components/views/WasteAnalyticsView';
import { ExcelExportView } from './components/views/ExcelExportView';
import { UserManagementView } from './components/views/UserManagementView';
import { AuditLogView } from './components/views/AuditLogView';

const MainLayout = () => {
  const { activeMenu } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardView />;
      case 'create_transaction':
        return <CreateTransactionView />;
      case 'transactions':
        return <TransactionHistoryView />;
      case 'receipt':
        return <ReceiptPrintView />;
      case 'customers':
        return <CustomerManagementView />;
      case 'balances':
        return <BalanceEligibilityView />;
      case 'gold_conversion':
        return <GoldConversionView />;
      case 'byond_transfer':
        return <ByondTransferView />;
      case 'waste_catalog':
        return <WasteCatalogView />;
      case 'kiosk_locations':
        return <KioskLocationsView />;
      case 'location_performance':
        return <LocationPerformanceView />;
      case 'waste_analytics':
        return <WasteAnalyticsView />;
      case 'excel_export':
        return <ExcelExportView />;
      case 'rbac_users':
        return <UserManagementView />;
      case 'audit_logs':
        return <AuditLogView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col font-sans">
      {/* Top Corporate Navigation */}
      <Header />

      {/* Mobile Toggle Button */}
      <div className="lg:hidden p-3 bg-white border-b border-slate-200 flex items-center justify-between no-print">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>15 Menu Kios</span>
        </button>
        <span className="text-[11px] font-semibold text-bsi-teal">
          BSI x Kepul Kios Daur Ulang
        </span>
      </div>

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          closeMobileSidebar={() => setIsMobileMenuOpen(false)} 
        />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Toast */}
      <Toast />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-400 no-print">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1600px] mx-auto">
          <span>
            © 2026 PT Bank Syariah Indonesia Tbk • ESG Operations & Communication (Draft v2.0)
          </span>
          <span className="text-[11px] text-slate-400">
            Sistem Mandiri Kios Daur Ulang x Tabungan Emas BSI
          </span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
