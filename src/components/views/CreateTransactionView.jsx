import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg, MIN_CONVERSION_THRESHOLD } from '../../utils/formatters';
import {
  Plus,
  Trash2,
  Receipt,
  UserCheck,
  Scale,
  Coins,
  CheckCircle2,
  Sparkles,
  Search,
  UserPlus,
  AlertCircle
} from 'lucide-react';

export const CreateTransactionView = () => {
  const { 
    currentUser, 
    locations, 
    wasteTypes, 
    getFilteredCustomers, 
    createTransaction, 
    setActiveMenu,
    setSelectedReceiptTrx,
    addCustomer
  } = useApp();

  const customers = getFilteredCustomers();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { wasteTypeId: wasteTypes[0]?.id || '', weightKg: '', pricePerKg: wasteTypes[0]?.pricePerKg || 0, subtotal: 0, wasteName: wasteTypes[0]?.name || '' }
  ]);

  // Quick Add Customer modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustBsi, setNewCustBsi] = useState('');
  const [newCustGold, setNewCustGold] = useState('');

  // Search customer query
  const [customerSearch, setCustomerSearch] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Filter customers for dropdown/search
  const filteredCustomersList = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  // Handle item change
  const handleItemWasteChange = (index, wasteTypeId) => {
    const waste = wasteTypes.find(w => w.id === wasteTypeId);
    if (!waste) return;

    setItems(prev => {
      const updated = [...prev];
      const weight = parseFloat(updated[index].weightKg) || 0;
      updated[index] = {
        ...updated[index],
        wasteTypeId: waste.id,
        wasteName: waste.name,
        pricePerKg: waste.pricePerKg,
        subtotal: Math.round(weight * waste.pricePerKg),
      };
      return updated;
    });
  };

  const handleItemWeightChange = (index, weightStr) => {
    const weight = parseFloat(weightStr) || 0;
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        weightKg: weightStr,
        subtotal: Math.round(weight * updated[index].pricePerKg),
      };
      return updated;
    });
  };

  const handleAddItem = () => {
    const defaultWaste = wasteTypes[0];
    setItems(prev => [
      ...prev,
      {
        wasteTypeId: defaultWaste.id,
        wasteName: defaultWaste.name,
        pricePerKg: defaultWaste.pricePerKg,
        weightKg: '',
        subtotal: 0,
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Calculations
  const totalWeight = items.reduce((acc, curr) => acc + (parseFloat(curr.weightKg) || 0), 0);
  const totalAmount = items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);
  const currentBalance = selectedCustomer?.balance || 0;
  const projectedBalance = currentBalance + totalAmount;
  const isProjectedEligible = projectedBalance >= MIN_CONVERSION_THRESHOLD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Pilih nasabah terlebih dahulu!');
      return;
    }
    if (totalWeight <= 0 || totalAmount <= 0) {
      alert('Masukkan berat sampah yang valid (> 0 kg)!');
      return;
    }

    const validItems = items.filter(i => (parseFloat(i.weightKg) || 0) > 0);
    const newTrx = createTransaction({
      customerId: selectedCustomerId,
      items: validItems,
      notes,
    });

    if (newTrx) {
      // Reset form
      setItems([
        { wasteTypeId: wasteTypes[0]?.id || '', weightKg: '', pricePerKg: wasteTypes[0]?.pricePerKg || 0, subtotal: 0, wasteName: wasteTypes[0]?.name || '' }
      ]);
      setNotes('');
    }
  };

  const handleQuickAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      alert('Nama dan No. HP wajib diisi!');
      return;
    }

    const effectiveLocId = currentUser.role === 'admin_lokasi' ? currentUser.locationId : locations[0].id;
    const created = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      bsiAccountNo: newCustBsi || `719${Math.floor(1000000 + Math.random() * 9000000)}`,
      goldAccountNo: newCustGold || `BSIGOLD-${Math.floor(100000 + Math.random() * 900000)}`,
      locationId: effectiveLocId,
      address: 'Nasabah Kios BSI',
    });

    if (created) {
      setSelectedCustomerId(created.id);
      setShowAddCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustBsi('');
      setNewCustGold('');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Input Transaksi Setoran Sampah</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 2
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan timbangan sampah nasabah dengan auto-kalkulasi nilai rupiah dan estimasi kelayakan emas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddCustomerModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all shadow-sm group"
        >
          <UserPlus className="w-4 h-4 text-bsi-teal" />
          <span>+ Tambah Nasabah Baru</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-bsi-teal" />
                Pilih Nasabah
              </label>
              <span className="text-xs text-slate-500">
                Total: {filteredCustomersList.length} nasabah tersedia
              </span>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Cari berdasarkan nama, kode, atau no. telepon..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal transition-all"
              />
            </div>

            {/* Select Dropdown */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal transition-all"
              required
            >
              {filteredCustomersList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) — Saldo: {formatRupiah(c.balance)}
                </option>
              ))}
            </select>

            {/* Customer Details Preview Card */}
            {selectedCustomer && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">No. Tabungan Emas BSI:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCustomer.goldAccountNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">No. Rekening BSI:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCustomer.bsiAccountNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Saldo Saat Ini:</span>
                  <span className="font-bold text-bsi-teal">{formatRupiah(selectedCustomer.balance)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  {selectedCustomer.balance >= MIN_CONVERSION_THRESHOLD ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Eligible (≥ Rp 50rb)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Belum Eligible (&lt; Rp 50rb)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Waste Items Entry Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-bsi-teal" />
                  Rincian Timbangan Sampah
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih jenis dari 16 katalog sampah dan masukkan bobot kilogram.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-bsi-teal font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris
              </button>
            </div>

            {/* Items Table / List */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-bsi-teal/40 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Select Waste Type */}
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Jenis Sampah (16 Katalog)
                    </label>
                    <select
                      value={item.wasteTypeId}
                      onChange={(e) => handleItemWasteChange(index, e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                    >
                      {wasteTypes.map(w => (
                        <option key={w.id} value={w.id}>
                          [{w.category}] {w.name} — {formatRupiah(w.pricePerKg)}/kg
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Input Weight in Kg */}
                  <div className="w-full sm:w-32">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Berat (kg)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      value={item.weightKg}
                      onChange={(e) => handleItemWeightChange(index, e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal text-right"
                      required
                    />
                  </div>

                  {/* Subtotal Display */}
                  <div className="w-full sm:w-36 text-right sm:pt-4">
                    <span className="text-[10px] text-slate-400 block sm:hidden">Subtotal:</span>
                    <span className="font-bold text-xs text-bsi-teal">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed sm:pt-4"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Notes Input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Catatan Transaksi (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sampah bersih terpilah dari warga RT 03"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Confirmation (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card sticky top-24 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm tracking-wide border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Ringkasan Transaksi</span>
              <Coins className="w-4 h-4 text-bsi-gold" />
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Jumlah Item:</span>
                <span className="font-bold text-slate-800">{items.length} item</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Berat:</span>
                <span className="font-bold text-slate-800">{formatKg(totalWeight)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-700 font-semibold">Total Nilai Transaksi:</span>
                <span className="text-base font-extrabold text-bsi-teal">
                  +{formatRupiah(totalAmount)}
                </span>
              </div>

              {/* Balance Simulation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Saldo Awal:</span>
                  <span className="font-mono text-slate-700">{formatRupiah(currentBalance)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Ditambah Setoran:</span>
                  <span className="font-mono text-emerald-600 font-bold">+{formatRupiah(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="font-bold text-slate-800">Saldo Akhir Nasabah:</span>
                  <span className="font-bold text-bsi-teal text-sm">{formatRupiah(projectedBalance)}</span>
                </div>
              </div>

              {/* Status Eligibility Alert */}
              {isProjectedEligible ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Status: ELIGIBLE KONVERSI</span>
                    <span className="text-[11px] text-emerald-800">
                      Saldo nasabah mencapai/melebihi Rp 50.000 dan dapat langsung diajukan ke Tabungan Emas BSI!
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Belum Mencapai Ambang Batas</span>
                    <span className="text-[11px] text-amber-800">
                      Kurang {formatRupiah(MIN_CONVERSION_THRESHOLD - projectedBalance)} lagi untuk mencapai ambang batas konversi emas Rp 50.000.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={totalWeight <= 0 || totalAmount <= 0}
                className="w-full py-3 px-4 rounded-xl bg-bsi-teal hover:bg-bsi-teal-dark disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Transaksi & Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-bsi-teal" />
              Pendaftaran Nasabah Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Daftarkan nasabah baru di kios untuk langsung mencatat transaksi setor sampah.
            </p>

            <form onSubmit={handleQuickAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Contoh: Muhammad Ihsan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP *</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="Contoh: 0812-9988-7766"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. Rekening BSI (Opsional)</label>
                <input
                  type="text"
                  value={newCustBsi}
                  onChange={(e) => setNewCustBsi(e.target.value)}
                  placeholder="Contoh: 7190123456"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. Rekening Tabungan Emas BSI (Opsional)</label>
                <input
                  type="text"
                  value={newCustGold}
                  onChange={(e) => setNewCustGold(e.target.value)}
                  placeholder="Contoh: BSIGOLD-719012"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-bsi-teal hover:bg-bsi-teal-dark rounded-xl shadow-sm"
                >
                  Simpan Nasabah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
