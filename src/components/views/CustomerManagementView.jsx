import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatKg, formatDate, MIN_CONVERSION_THRESHOLD } from '../../utils/formatters';
import {
  Users,
  Search,
  UserPlus,
  Coins,
  History,
  FileSpreadsheet,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Building2,
  CreditCard
} from 'lucide-react';
import { exportCustomersToExcel } from '../../utils/excelExporter';

export const CustomerManagementView = () => {
  const { 
    currentUser, 
    locations, 
    transactions,
    getFilteredCustomers, 
    addCustomer, 
    updateCustomer, 
    setActiveMenu 
  } = useApp();

  const customers = getFilteredCustomers();

  const [searchQuery, setSearchQuery] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustDetail, setSelectedCustDetail] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // New customer form state
  const [formName, setFormName] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBsiAccount, setFormBsiAccount] = useState('');
  const [formGoldAccount, setFormGoldAccount] = useState('');
  const [formLocationId, setFormLocationId] = useState(
    currentUser.role === 'admin_lokasi' ? currentUser.locationId : locations[0].id
  );
  const [formAddress, setFormAddress] = useState('');

  // Filtered list
  const filtered = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.bsiAccountNo && c.bsiAccountNo.includes(searchQuery)) ||
      (c.goldAccountNo && c.goldAccountNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const isEligible = c.balance >= MIN_CONVERSION_THRESHOLD;
    const matchesEligibility = 
      eligibilityFilter === 'ALL' ||
      (eligibilityFilter === 'ELIGIBLE' && isEligible) ||
      (eligibilityFilter === 'NOT_ELIGIBLE' && !isEligible);

    return matchesSearch && matchesEligibility;
  });

  const handleOpenAdd = () => {
    setFormName('');
    setFormNik('');
    setFormPhone('');
    setFormBsiAccount(`719${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormGoldAccount(`BSIGOLD-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormLocationId(currentUser.role === 'admin_lokasi' ? currentUser.locationId : locations[0].id);
    setFormAddress('');
    setEditingCustomer(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setFormName(customer.name);
    setFormNik(customer.nik || '');
    setFormPhone(customer.phone);
    setFormBsiAccount(customer.bsiAccountNo);
    setFormGoldAccount(customer.goldAccountNo);
    setFormLocationId(customer.locationId);
    setFormAddress(customer.address || '');
    setShowAddModal(true);
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      alert('Nama dan No. WhatsApp wajib diisi!');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formName,
        nik: formNik,
        phone: formPhone,
        bsiAccountNo: formBsiAccount,
        goldAccountNo: formGoldAccount,
        locationId: formLocationId,
        address: formAddress,
      });
    } else {
      addCustomer({
        name: formName,
        nik: formNik,
        phone: formPhone,
        bsiAccountNo: formBsiAccount,
        goldAccountNo: formGoldAccount,
        locationId: formLocationId,
        address: formAddress,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Manajemen Data Nasabah Kios</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 5
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registrasi dan pemantauan akumulasi saldo setoran sampah nasabah per lokasi kios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCustomersToExcel(customers, locations)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor XLSX</span>
          </button>
          {currentUser.role !== 'bsi_viewer' && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bsi-teal hover:bg-bsi-teal-dark text-white text-xs font-extrabold shadow-sm active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Registrasi Nasabah</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama Nasabah, Kode, No HP, No Rekening BSI / Emas..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
          />
        </div>

        {/* Eligibility Filter */}
        <div className="w-full md:w-56">
          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
          >
            <option value="ALL">Semua Status Kelayakan</option>
            <option value="ELIGIBLE">Eligible (Saldo ≥ Rp 50.000)</option>
            <option value="NOT_ELIGIBLE">Belum Eligible (&lt; Rp 50.000)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nasabah</th>
                <th className="py-3 px-4">Kontak & NIK</th>
                <th className="py-3 px-4">Rekening BSI & Emas</th>
                <th className="py-3 px-4">Lokasi Kios</th>
                <th className="py-3 px-4 text-right">Total Setoran</th>
                <th className="py-3 px-4 text-right">Saldo Saat Ini</th>
                <th className="py-3 px-4 text-center">Eligibilitas</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Tidak ada nasabah yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const loc = locations.find(l => l.id === c.locationId);
                  const isEligible = c.balance >= MIN_CONVERSION_THRESHOLD;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-medium text-slate-700 block">{c.phone}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{c.nik || 'NIK: -'}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-bsi-teal font-semibold block">{c.goldAccountNo}</span>
                        <span className="text-slate-500 text-[10px]">Rek BSI: {c.bsiAccountNo}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="truncate max-w-[150px] block">{loc?.name || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-700">
                        {formatKg(c.totalKg)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {c.totalTransactions || 0}x setor
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-bsi-teal text-sm">
                          {formatRupiah(c.balance)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            Eligible Konversi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            &lt; Rp 50.000
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedCustDetail(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-bsi-teal hover:bg-teal-50 transition-colors"
                            title="Detail & Riwayat Transaksi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {currentUser.role !== 'bsi_viewer' && (
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Edit Data Nasabah"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Transaction History Modal */}
      {selectedCustDetail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedCustDetail.name} ({selectedCustDetail.code})
                </h3>
                <span className="text-xs text-slate-500">
                  Terdaftar sejak: {formatDate(selectedCustDetail.registeredAt)}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">No. Tabungan Emas:</span>
                <span className="font-mono font-bold text-bsi-teal">{selectedCustDetail.goldAccountNo}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Saldo Saat Ini:</span>
                <span className="font-extrabold text-slate-800 text-sm">{formatRupiah(selectedCustDetail.balance)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total Berat Disetor:</span>
                <span className="font-bold text-slate-800">{formatKg(selectedCustDetail.totalKg)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status Eligibilitas:</span>
                <span className={`font-bold ${selectedCustDetail.balance >= MIN_CONVERSION_THRESHOLD ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {selectedCustDetail.balance >= MIN_CONVERSION_THRESHOLD ? 'Eligible (≥ 50k)' : 'Belum Eligible'}
                </span>
              </div>
            </div>

            {/* Customer's Historical Transactions */}
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-bsi-teal" />
                Riwayat Transaksi Nasabah
              </h4>

              {(() => {
                const custTransactions = transactions.filter(t => t.customerId === selectedCustDetail.id);
                if (custTransactions.length === 0) {
                  return (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Belum ada transaksi setor sampah untuk nasabah ini.
                    </p>
                  );
                }

                return (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-600 text-[10px]">
                        <tr>
                          <th className="py-2 px-3">No. Transaksi</th>
                          <th className="py-2 px-3">Tanggal</th>
                          <th className="py-2 px-3 text-right">Berat</th>
                          <th className="py-2 px-3 text-right">Nilai Rupiah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {custTransactions.map(t => (
                          <tr key={t.id}>
                            <td className="py-2 px-3 font-mono font-bold text-bsi-teal">{t.id}</td>
                            <td className="py-2 px-3 text-slate-600">{formatDate(t.createdAt)}</td>
                            <td className="py-2 px-3 text-right font-semibold">{t.totalWeight} kg</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-600">
                              +{formatRupiah(t.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              {selectedCustDetail.balance >= MIN_CONVERSION_THRESHOLD && (
                <button
                  onClick={() => {
                    setSelectedCustDetail(null);
                    setActiveMenu('gold_conversion');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-bsi-gold hover:bg-bsi-gold-600 rounded-xl shadow-sm"
                >
                  <Coins className="w-4 h-4" />
                  <span>Ajukan Konversi Emas</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-bsi-teal" />
              {editingCustomer ? 'Edit Profil Nasabah' : 'Pendaftaran Nasabah Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingCustomer ? 'Perbarui data rekening dan kontak nasabah' : 'Masukkan identitas nasabah untuk program Kios Daur Ulang BSI'}
            </p>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Siti Aisyah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">No. WhatsApp / HP *</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 0812-3456-7890"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">NIK (KTP) Nasabah</label>
                <input
                  type="text"
                  value={formNik}
                  onChange={(e) => setFormNik(e.target.value)}
                  placeholder="Contoh: 3674012345670001"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Rekening BSI</label>
                  <input
                    type="text"
                    value={formBsiAccount}
                    onChange={(e) => setFormBsiAccount(e.target.value)}
                    placeholder="7190012345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Tabungan Emas</label>
                  <input
                    type="text"
                    value={formGoldAccount}
                    onChange={(e) => setFormGoldAccount(e.target.value)}
                    placeholder="BSIGOLD-719001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal font-mono"
                  />
                </div>
              </div>

              {currentUser.role !== 'admin_lokasi' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lokasi Kios Terdaftar</label>
                  <select
                    value={formLocationId}
                    onChange={(e) => setFormLocationId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Domisili</label>
                <textarea
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Contoh: Jl. Anggrek No. 12, RW 05"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-bsi-teal/30 focus:border-bsi-teal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-bsi-teal hover:bg-bsi-teal-dark rounded-xl shadow-sm"
                >
                  {editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Nasabah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
