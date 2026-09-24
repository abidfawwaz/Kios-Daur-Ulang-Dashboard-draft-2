import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg, calculateEnvironmentalImpact } from '../../utils/formatters';
import {
  PieChart as PieIcon,
  BarChart2,
  Scale,
  Coins,
  Sparkles,
  TreePine,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const WasteAnalyticsView = () => {
  const { wasteTypes, transactions } = useApp();

  // Aggregate items across all transactions
  const wasteStatsMap = {};
  wasteTypes.forEach(w => {
    wasteStatsMap[w.id] = {
      id: w.id,
      name: w.name,
      category: w.category,
      pricePerKg: w.pricePerKg,
      totalKg: 0,
      totalRp: 0,
      transactionCount: 0,
    };
  });

  transactions.forEach(t => {
    t.items.forEach(item => {
      if (wasteStatsMap[item.wasteTypeId]) {
        wasteStatsMap[item.wasteTypeId].totalKg += Number(item.weightKg) || 0;
        wasteStatsMap[item.wasteTypeId].totalRp += Number(item.subtotal) || 0;
        wasteStatsMap[item.wasteTypeId].transactionCount += 1;
      }
    });
  });

  const wasteStatsList = Object.values(wasteStatsMap);

  // Top by volume
  const topByVolume = [...wasteStatsList]
    .sort((a, b) => b.totalKg - a.totalKg)
    .slice(0, 5)
    .map(w => ({ name: w.name.length > 20 ? w.name.slice(0, 18) + '...' : w.name, berat: Number(w.totalKg.toFixed(1)) }));

  // Top by economic value
  const topByValue = [...wasteStatsList]
    .sort((a, b) => b.totalRp - a.totalRp)
    .slice(0, 5)
    .map(w => ({ name: w.name.length > 20 ? w.name.slice(0, 18) + '...' : w.name, rupiah: w.totalRp }));

  const COLORS = ['#00A39D', '#F8AD3C', '#0D9488', '#E09525', '#334155'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Analitik Komposisi Sampah & Nilai Ekonomi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 12
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis jenis sampah dengan volume setoran tertinggi dan kontribusi nilai ekonomi rupiah bagi nasabah BSI.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-bsi-teal">
          <Layers className="w-4 h-4" />
          <span>Analitik 16 Katalog Sampah</span>
        </div>
      </div>

      {/* Top 5 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Volume (Kg) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                5 Jenis Sampah Terbanyak (Volume Kg)
              </h3>
              <p className="text-xs text-slate-500">
                Paling sering disetor oleh masyarakat di kios
              </p>
            </div>
            <Scale className="w-4 h-4 text-bsi-teal" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByVolume} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                <Tooltip formatter={(val) => `${val} kg`} />
                <Bar dataKey="berat" name="Total Berat (kg)" fill="#00A39D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top by Economic Value (Rp) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                5 Jenis Sampah Tertinggi (Nilai Rupiah)
              </h3>
              <p className="text-xs text-slate-500">
                Memberikan akumulasi saldo Tabungan Emas terbesar
              </p>
            </div>
            <Coins className="w-4 h-4 text-bsi-gold" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topByValue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp${val/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                <Tooltip formatter={(val) => formatRupiah(val)} />
                <Bar dataKey="rupiah" name="Total Nilai (Rp)" fill="#F8AD3C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Catalog Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Rincian Analitik Seluruh 16 Jenis Sampah
          </h3>
          <span className="text-xs text-slate-400">Total Akumulasi Transaksi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Jenis Sampah</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Harga Beli / Kg</th>
                <th className="py-3 px-4 text-right">Total Setoran</th>
                <th className="py-3 px-4 text-right">Total Nilai Ekonomi</th>
                <th className="py-3 px-4 text-center">Frekuensi Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wasteStatsList.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">{item.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-600">{formatRupiah(item.pricePerKg)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">{formatKg(item.totalKg)}</td>
                  <td className="py-3 px-4 text-right font-black text-bsi-teal">{formatRupiah(item.totalRp)}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{item.transactionCount}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
