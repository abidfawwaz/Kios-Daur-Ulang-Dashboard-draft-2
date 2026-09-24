import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg } from '../../utils/formatters';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  User,
  Target,
  CheckCircle2,
  Users,
  Coins,
  Scale
} from 'lucide-react';

export const KioskLocationsView = () => {
  const { 
    currentUser, 
    locations, 
    transactions, 
    customers 
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daftar 5 Titik Lokasi Kios Daur Ulang BSI</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 10
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi detail operasional, PIC admin, target bulanan, dan cakupan wilayah masing-masing kios.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Semua 5 Kios Operasional & Terhubung</span>
        </div>
      </div>

      {/* Grid of 5 Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc, idx) => {
          const locTrx = transactions.filter(t => t.locationId === loc.id);
          const locCust = customers.filter(c => c.locationId === loc.id);
          const actualKg = locTrx.reduce((acc, curr) => acc + (curr.totalWeight || 0), 0);
          const actualRp = locTrx.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
          const pct = Math.min(100, Math.round((actualKg / loc.targetKgMonthly) * 100));

          const isUserLocation = currentUser.locationId === loc.id;

          return (
            <div
              key={loc.id}
              className={`bg-white rounded-2xl p-6 border shadow-card transition-all flex flex-col justify-between ${
                isUserLocation 
                  ? 'border-bsi-teal ring-2 ring-bsi-teal/20 shadow-bsi' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-bsi-teal font-extrabold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {loc.code}
                    </span>
                  </div>

                  {isUserLocation ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-bsi-teal text-white">
                      Lokasi Anda
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {loc.status}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-base mb-2">
                  {loc.name}
                </h3>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-bsi-teal shrink-0 mt-0.5" />
                    <span>{loc.address}, {loc.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{loc.operatingHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>PIC: <b>{loc.picName}</b> (@{loc.adminUsername})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                </div>
              </div>

              {/* Progress and Stats */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-semibold">Nasabah Kios</span>
                    <span className="font-bold text-slate-800">{locCust.length} Orang</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Setoran</span>
                    <span className="font-bold text-bsi-teal">{formatRupiah(actualRp)}</span>
                  </div>
                </div>

                {/* Progress Bar vs Target */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Capaian Target Kg:</span>
                    <span className="font-bold text-slate-800">
                      {formatKg(actualKg)} / {loc.targetKgMonthly} kg ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-bsi-teal to-teal-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
