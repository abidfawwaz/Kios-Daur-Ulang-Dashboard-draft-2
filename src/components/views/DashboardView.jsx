import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  formatRupiah, 
  formatKg, 
  calculateEnvironmentalImpact, 
  MIN_CONVERSION_THRESHOLD,
  BSI_GOLD_PRICE_PER_GRAM
} from '../../utils/formatters';
import {
  TrendingUp,
  Coins,
  Scale,
  Users,
  TreePine,
  CloudRain,
  Zap,
  ArrowUpRight,
  PlusCircle,
  History,
  FileSpreadsheet,
  Store,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const DashboardView = () => {
  const { 
    currentUser, 
    locations, 
    customers, 
    getFilteredTransactions, 
    getFilteredCustomers, 
    getFilteredLocations,
    setActiveMenu,
    setSelectedReceiptTrx,
    conversions
  } = useApp();

  const [periodFilter, setPeriodFilter] = useState('ALL');

  const filteredTransactions = getFilteredTransactions();
  const filteredCustomers = getFilteredCustomers();
  const filteredLocations = getFilteredLocations();

  // Aggregate stats
  const totalVolumeKg = filteredTransactions.reduce((acc, t) => acc + (t.totalWeight || 0), 0);
  const totalEconomicRp = filteredTransactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const activeCustomersCount = filteredCustomers.length;
  
  // Eligible balance calculation
  const eligibleCustomers = filteredCustomers.filter(c => c.balance >= MIN_CONVERSION_THRESHOLD);
  const totalEligibleBalance = eligibleCustomers.reduce((acc, c) => acc + c.balance, 0);

  // Environmental impact
  const envImpact = calculateEnvironmentalImpact(totalVolumeKg);

  // Category distribution calculation
  const categoryMap = { Plastik: 0, Kertas: 0, Logam: 0, Kaca: 0, Lainnya: 0 };
  filteredTransactions.forEach(t => {
    t.items.forEach(item => {
      // Find category or classify
      if (item.wasteName.includes('Plastik') || item.wasteName.includes('PET') || item.wasteName.includes('PP') || item.wasteName.includes('HDPE')) {
        categoryMap['Plastik'] += item.subtotal;
      } else if (item.wasteName.includes('Kardus') || item.wasteName.includes('Kertas') || item.wasteName.includes('Koran')) {
        categoryMap['Kertas'] += item.subtotal;
      } else if (item.wasteName.includes('Aluminium') || item.wasteName.includes('Besi') || item.wasteName.includes('Tembaga') || item.wasteName.includes('Kuningan')) {
        categoryMap['Logam'] += item.subtotal;
      } else if (item.wasteName.includes('Kaca')) {
        categoryMap['Kaca'] += item.subtotal;
      } else {
        categoryMap['Lainnya'] += item.subtotal;
      }
    });
  });

  const categoryChartData = Object.keys(categoryMap).map(key => ({
    name: key,
    value: categoryMap[key] || 1000,
  }));

  const CATEGORY_COLORS = ['#00A39D', '#F8AD3C', '#0D9488', '#E09525', '#64748B'];

  // Trend data by transaction dates
  const trendData = [
    { tanggal: '18 Sep', berat: 24, rupiah: 98000 },
    { tanggal: '19 Sep', berat: 18, rupiah: 74000 },
    { tanggal: '20 Sep', berat: 32, rupiah: 142000 },
    { tanggal: '21 Sep', berat: 18, rupiah: 76000 },
    { tanggal: '22 Sep', berat: 42, rupiah: 181200 },
    { tanggal: '23 Sep', berat: 49, rupiah: 124200 },
    { tanggal: '24 Sep', berat: 40, rupiah: 105800 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with BSI Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bsi-teal-dark via-bsi-teal to-[#14B8A6] p-6 lg:p-8 text-white shadow-bsi">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-amber-200 mb-3 border border-white/20">
            <span>🌿 Inisiatif Keuangan Berkelanjutan BSI ESG</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Kios Daur Ulang x Tabungan Emas</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2">
            Selamat Datang, {currentUser.name}
          </h2>
          <p className="text-sm text-teal-50/90 leading-relaxed max-w-2xl">
            {currentUser.role === 'admin_lokasi'
              ? `Anda sedang memantau operasional ${currentUser.locationName}. Catat setoran sampah warga, pantau saldo nasabah, dan ajukan konversi emas langsung ke sistem BSI.`
              : currentUser.role === 'bsi_viewer'
              ? `Mode Pemantauan BSI ESG (Read-Only). Memantau 5 lokasi Kios Daur Ulang: Malibu Village, Vila Dago, Samara Village, Pasar Modern, dan Pesantren Hafidz.`
              : `Akses Penuh Super Admin ESG BSI. Kelola konfigurasi sistem, validasi konversi Tabungan Emas, serta pantau integrasi transfer Byond.`}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {currentUser.role !== 'bsi_viewer' && (
              <button
                onClick={() => setActiveMenu('create_transaction')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bsi-gold hover:bg-bsi-gold-600 text-slate-900 font-extrabold text-xs transition-all shadow-md active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Input Transaksi Setoran Sampah
              </button>
            )}
            <button
              onClick={() => setActiveMenu('balances')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs transition-all border border-white/30"
            >
              <Coins className="w-4 h-4 text-bsi-gold" />
              Kelayakan Konversi ({eligibleCustomers.length} Nasabah)
            </button>
            <button
              onClick={() => setActiveMenu('excel_export')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all border border-white/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Ekspor Laporan ESG
            </button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute right-24 top-6 w-32 h-32 rounded-full bg-bsi-gold/20 blur-xl pointer-events-none"></div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Nilai Ekonomi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-bsi transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Nilai Ekonomi
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-bsi-teal flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            {formatRupiah(totalEconomicRp)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% bulan ini</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-bsi-teal to-teal-400"></div>
        </div>

        {/* Total Volume Sampah */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-bsi transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Berat Sampah
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-bsi-gold flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            {formatKg(totalVolumeKg)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Dari 16 jenis katalog sampah</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-bsi-gold to-amber-400"></div>
        </div>

        {/* Nasabah Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-bsi transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nasabah Terdaftar
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 tracking-tight mb-1">
            {activeCustomersCount} Nasabah
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <span>Tersebar di {filteredLocations.length} lokasi kios</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </div>

        {/* Saldo Tereligibel Tabungan Emas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-bsi transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saldo Tereligibel Emas
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <SparklesIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mb-1">
            {formatRupiah(totalEligibleBalance)}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <span>{eligibleCustomers.length} nasabah (Saldo ≥ Rp 50k)</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>
      </div>

      {/* ESG Sustainability Impact Metrics Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl p-5 text-white shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-800 text-emerald-300">🌱</span>
              <h3 className="font-extrabold text-sm tracking-wide">
                ESG Environmental Footprint Reduction
              </h3>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              Dampak ekologis nyata yang dihasilkan dari setoran sampah Kios Daur Ulang BSI x Kepul
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700/50">
            Standard GHG Protocol Scope 3
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TreePine className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{envImpact.treesSaved} Pohon</div>
              <div className="text-xs text-emerald-200/80">Ekuivalen Pohon Terselamatkan</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{envImpact.co2ReducedKg} kg CO₂e</div>
              <div className="text-xs text-emerald-200/80">Reduksi Emisi Karbon Dioksida</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold">{envImpact.energySavedKwh} kWh</div>
              <div className="text-xs text-emerald-200/80">Konservasi Energi Terhemat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Tren Transaksi & Komposisi Sampah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Tren Nilai Ekonomi & Berat Setoran Sampah
              </h3>
              <p className="text-xs text-slate-500">
                Aktivitas transaksi setor harian di kios
              </p>
            </div>
            <span className="text-xs font-bold text-bsi-teal bg-teal-50 px-2.5 py-1 rounded-lg">
              7 Hari Terakhir
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRupiah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A39D" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00A39D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="tanggal" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'rupiah' ? formatRupiah(value) : `${value} kg`,
                    name === 'rupiah' ? 'Nilai Ekonomi' : 'Berat Sampah'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="rupiah" 
                  stroke="#00A39D" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorRupiah)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Category Breakdown (1 Col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 text-sm">
                Distribusi Kategori Sampah
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Nilai Rp</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Porsi kontribusi nilai ekonomis per kategori
            </p>

            <div className="h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {categoryChartData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Kiosk Locations Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Status 5 Titik Kios Daur Ulang BSI x Kepul
            </h3>
            <p className="text-xs text-slate-500">
              Pemantauan target bulanan, PIC petugas, dan realisasi volume
            </p>
          </div>
          <button
            onClick={() => setActiveMenu('kiosk_locations')}
            className="text-xs font-bold text-bsi-teal hover:underline flex items-center gap-1"
          >
            Lihat Detail Lokasi <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Nama Kios</th>
                <th className="py-2.5 px-3">Kota</th>
                <th className="py-2.5 px-3">Admin / PIC</th>
                <th className="py-2.5 px-3 text-right">Target (kg)</th>
                <th className="py-2.5 px-3 text-right">Target (Rp)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-800 block">{loc.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{loc.code}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{loc.city}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{loc.picName}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-700">{loc.targetKgMonthly} kg</td>
                  <td className="py-3 px-3 text-right font-bold text-bsi-teal">{formatRupiah(loc.targetRpMonthly)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {loc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Transaksi Terkini
            </h3>
            <p className="text-xs text-slate-500">
              Daftar setoran sampah paling baru yang tercatat di sistem
            </p>
          </div>
          <button
            onClick={() => setActiveMenu('transactions')}
            className="text-xs font-bold text-bsi-teal hover:underline flex items-center gap-1"
          >
            Lihat Semua Transaksi <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTransactions.slice(0, 5).map(trx => (
            <div key={trx.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-bsi-teal flex items-center justify-center font-bold text-xs shrink-0">
                  TRX
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{trx.customerName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{trx.id}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {trx.locationName} • {trx.totalWeight} kg ({trx.items.length} item)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-sm text-bsi-teal block">
                  +{formatRupiah(trx.totalAmount)}
                </span>
                <button
                  onClick={() => {
                    setSelectedReceiptTrx(trx);
                    setActiveMenu('receipt');
                  }}
                  className="text-[11px] font-semibold text-slate-500 hover:text-bsi-teal transition-colors underline"
                >
                  Cetak Struk
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SparklesIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);
