import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg } from '../../utils/formatters';
import {
  TrendingUp,
  Award,
  Target,
  Scale,
  Coins,
  ArrowUpRight,
  Medal,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const LocationPerformanceView = () => {
  const { locations, transactions, customers } = useApp();

  // Aggregate performance per location
  const performanceData = locations.map(loc => {
    const locTrx = transactions.filter(t => t.locationId === loc.id);
    const locCust = customers.filter(c => c.locationId === loc.id);
    const actualKg = locTrx.reduce((acc, curr) => acc + (curr.totalWeight || 0), 0);
    const actualRp = locTrx.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const pctKg = loc.targetKgMonthly ? Math.round((actualKg / loc.targetKgMonthly) * 100) : 0;
    const pctRp = loc.targetRpMonthly ? Math.round((actualRp / loc.targetRpMonthly) * 100) : 0;

    return {
      id: loc.id,
      name: loc.name,
      shortName: loc.code,
      targetKg: loc.targetKgMonthly,
      actualKg: Number(actualKg.toFixed(1)),
      targetRp: loc.targetRpMonthly,
      actualRp,
      pctKg,
      pctRp,
      totalCustomers: locCust.length,
      totalTransactions: locTrx.length,
    };
  });

  // Sort by highest kg realized for leaderboard
  const sortedByKg = [...performanceData].sort((a, b) => b.actualKg - a.actualKg);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Performa & Pencapaian Target Antar-Lokasi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 11
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi capaian volume dan nilai ekonomi 5 Kios Daur Ulang terhadap target bulanan ESG.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
          <Award className="w-4 h-4 text-bsi-gold" />
          <span>Leaderboard Peringkat Kios Teraktif</span>
        </div>
      </div>

      {/* Top Leaderboard Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedByKg.slice(0, 3).map((kios, idx) => {
          const medals = ['🥇 Juara 1', '🥈 Juara 2', '🥉 Juara 3'];
          const borders = ['border-amber-400 bg-amber-50/30', 'border-slate-300 bg-slate-50/50', 'border-amber-700/30 bg-orange-50/20'];

          return (
            <div
              key={kios.id}
              className={`rounded-2xl p-5 border-2 shadow-card ${borders[idx]} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black tracking-wider uppercase">
                    {medals[idx]}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{kios.shortName}</span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1">{kios.name}</h3>
                <span className="text-xs text-slate-500">{kios.totalCustomers} Nasabah Terdaftar</span>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Volume</span>
                  <span className="text-lg font-black text-slate-900">{formatKg(kios.actualKg)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Nilai Ekonomi</span>
                  <span className="text-base font-extrabold text-bsi-teal">{formatRupiah(kios.actualRp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Volume Kg (Target vs Realized) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Target vs Realisasi Volume Sampah (Kg)
              </h3>
              <p className="text-xs text-slate-500">
                Pencapaian bobot daur ulang per kios
              </p>
            </div>
            <Scale className="w-4 h-4 text-bsi-teal" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="targetKg" name="Target (kg)" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualKg" name="Realisasi (kg)" fill="#00A39D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Nilai Rupiah (Target vs Realized) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Target vs Realisasi Nilai Ekonomi (Rp)
              </h3>
              <p className="text-xs text-slate-500">
                Kontribusi nilai konversi ke saldo nasabah
              </p>
            </div>
            <Coins className="w-4 h-4 text-bsi-gold" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="shortName" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp${val/1000}k`} />
                <Tooltip formatter={(val) => formatRupiah(val)} />
                <Legend />
                <Bar dataKey="targetRp" name="Target (Rp)" fill="#FCD34D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualRp" name="Realisasi (Rp)" fill="#F8AD3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Scorecard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-800 text-sm">
            Matriks Lengkap Capaian Indikator Kinerja Kios (KPI)
          </h3>
          <span className="text-xs text-slate-400">Periode Berjalan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kios Daur Ulang</th>
                <th className="py-3 px-4 text-right">Target Kg</th>
                <th className="py-3 px-4 text-right">Realisasi Kg</th>
                <th className="py-3 px-4 text-center">% Capaian Kg</th>
                <th className="py-3 px-4 text-right">Target Rp</th>
                <th className="py-3 px-4 text-right">Realisasi Rp</th>
                <th className="py-3 px-4 text-center">% Capaian Rp</th>
                <th className="py-3 px-4 text-center">Nasabah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performanceData.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {row.name} ({row.shortName})
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">{row.targetKg} kg</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">{formatKg(row.actualKg)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-teal-50 text-bsi-teal border border-teal-200">
                      {row.pctKg}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">{formatRupiah(row.targetRp)}</td>
                  <td className="py-3 px-4 text-right font-bold text-bsi-teal">{formatRupiah(row.actualRp)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                      {row.pctRp}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium text-slate-700">{row.totalCustomers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
