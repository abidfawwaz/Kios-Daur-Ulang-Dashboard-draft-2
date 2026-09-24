import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import {
  Tags,
  Search,
  Edit2,
  Check,
  X,
  Package,
  Layers,
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';

export const WasteCatalogView = () => {
  const { 
    currentUser, 
    wasteTypes, 
    updateWastePrice 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [editingId, setEditingId] = useState(null);
  const [tempPrice, setTempPrice] = useState('');

  const categories = ['ALL', 'Plastik', 'Kertas', 'Logam', 'Kaca', 'Lainnya'];

  const filtered = wasteTypes.filter(w => {
    const matchesCategory = categoryFilter === 'ALL' || w.category === categoryFilter;
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartEdit = (waste) => {
    if (currentUser.role === 'bsi_viewer') {
      alert('Akun Viewer hanya memiliki izin baca!');
      return;
    }
    setEditingId(waste.id);
    setTempPrice(waste.pricePerKg);
  };

  const handleSavePrice = (wasteId) => {
    if (!tempPrice || isNaN(tempPrice) || Number(tempPrice) <= 0) {
      alert('Masukkan harga yang valid!');
      return;
    }
    updateWastePrice(wasteId, Number(tempPrice));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'Plastik':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Kertas':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Logam':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Kaca':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Lainnya':
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Katalog Master 16 Jenis Sampah & Harga Pembelian</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 9
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar acuan harga per kilogram yang digunakan otomatis pada kalkulasi setoran sampah di 5 lokasi kios.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
          <Tags className="w-4 h-4 text-bsi-teal" />
          <span>Total: 16 Jenis Sampah Standar</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari jenis sampah, contoh: Botol PET, Kardus, Besi, Aluminium..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat
                  ? 'bg-bsi-teal text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Waste Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(w => {
          const isEditing = editingId === w.id;

          return (
            <div
              key={w.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-bsi-teal/40 shadow-card hover:shadow-bsi transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getCategoryBadgeColor(w.category)}`}>
                    {w.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {w.id}</span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm mb-1.5">
                  {w.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {w.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Harga Beli / Kg</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-slate-500">Rp</span>
                      <input
                        type="number"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-bold border border-bsi-teal rounded-lg focus:outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <span className="text-base font-black text-bsi-teal">
                      {formatRupiah(w.pricePerKg)}
                      <span className="text-xs font-normal text-slate-400"> / kg</span>
                    </span>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSavePrice(w.id)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Simpan Harga"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    currentUser.role !== 'bsi_viewer' && (
                      <button
                        onClick={() => handleStartEdit(w)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-bsi-teal hover:bg-teal-50 rounded-lg transition-colors border border-slate-200"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Ubah Harga</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
