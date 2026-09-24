import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatDate, formatDateTime } from '../../utils/formatters';
import {
  SendHorizontal,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export const ByondTransferView = () => {
  const { 
    currentUser, 
    conversions, 
    completeByondTransfer, 
    verifyConversion 
  } = useApp();

  const [selectedForUpload, setSelectedForUpload] = useState(null);
  const [proofUrlInput, setProofUrlInput] = useState('');
  const [byondRefInput, setByondRefInput] = useState('');
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Conversions requiring action or in transfer stage
  const pendingOrProcessing = conversions.filter(c => 
    c.status === 'DIPROSES_BYOND' || c.status === 'MENUNGGU_VERIFIKASI'
  );
  const completedTransfers = conversions.filter(c => c.status === 'SELESAI');

  const handleOpenUpload = (conversion) => {
    setSelectedForUpload(conversion);
    setProofUrlInput(conversion.proofImageUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80');
    setByondRefInput(conversion.byondRefNo || `BYD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const handleConfirmUploadAndComplete = (e) => {
    e.preventDefault();
    if (!selectedForUpload) return;

    completeByondTransfer({
      conversionId: selectedForUpload.id,
      proofImageUrl: proofUrlInput,
      byondRefNo: byondRefInput,
    });

    setSelectedForUpload(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Transfer Byond & Bukti Konversi Emas</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-bsi-teal/10 text-bsi-teal border border-bsi-teal/20 font-bold">
              Menu 8
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen verifikasi transfer aplikasi Byond BSI dan pengunggahan bukti transfer ke storage bucket.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-bsi-teal font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Akses Role: Admin (Upload) • Super Admin (Verifikasi) • Viewer (Lihat)</span>
        </div>
      </div>

      {/* Action Cards: Need Transfer or Need Proof Upload */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Antrean Transfer & Unggah Bukti Byond ({pendingOrProcessing.length})
            </h3>
            <p className="text-xs text-slate-500">
              Pengajuan yang sedang menunggu transfer saldo emas atau upload bukti transaksi.
            </p>
          </div>
        </div>

        {pendingOrProcessing.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Semua antrean transfer Byond telah selesai!</p>
            <p className="text-[11px] text-slate-400">Tidak ada pengajuan yang memerlukan tindak lanjut.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrProcessing.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-bsi-teal/50 bg-slate-50/60 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-bsi-teal block">{item.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.customerName}</h4>
                    <span className="text-[11px] text-slate-500 block">
                      {item.locationName} • Tabungan: <span className="font-mono font-semibold">{item.goldAccountNo}</span>
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'DIPROSES_BYOND'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'DIPROSES_BYOND' ? 'Siap Upload Bukti' : 'Menunggu Verifikasi'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nominal Transfer:</span>
                    <span className="font-extrabold text-slate-900">{formatRupiah(item.amountRp)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Estimasi Emas:</span>
                    <span className="font-mono font-bold text-amber-600">~{item.goldGrams} gr</span>
                  </div>
                </div>

                {item.byondRefNo && (
                  <div className="text-[11px] font-mono text-slate-600 bg-teal-50/50 p-2 rounded-lg border border-teal-100">
                    Ref Byond: <b>{item.byondRefNo}</b>
                  </div>
                )}

                <div className="pt-1 flex items-center justify-end gap-2">
                  {currentUser.role !== 'bsi_viewer' && (
                    <button
                      onClick={() => handleOpenUpload(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bsi-teal hover:bg-bsi-teal-dark text-white font-bold text-xs shadow-sm transition-all"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Bukti & Konfirmasi Selesai</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Transfers with Proof Bucket Preview */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-card">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 mb-1">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          Riwayat Transfer Sukses & Arsip Bukti ({completedTransfers.length})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Daftar transfer Tabungan Emas yang telah selesai diverifikasi beserta bukti transfer tersimpan.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">ID & Ref Byond</th>
                <th className="py-3 px-4">Tanggal Selesai</th>
                <th className="py-3 px-4">Nasabah</th>
                <th className="py-3 px-4">Lokasi Kios</th>
                <th className="py-3 px-4 text-right">Nominal Emas</th>
                <th className="py-3 px-4 text-center">Bukti Transfer</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedTransfers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-bsi-teal block">{c.id}</span>
                    <span className="font-mono text-[10px] text-slate-500">{c.byondRefNo}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {formatDate(c.completedAt || c.requestDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{c.customerName}</span>
                    <span className="font-mono text-[10px] text-slate-500">{c.goldAccountNo}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {c.locationName}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-extrabold text-slate-900 block">{formatRupiah(c.amountRp)}</span>
                    <span className="text-[10px] font-mono text-amber-600">~{c.goldGrams} gr</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {c.proofImageUrl ? (
                      <button
                        onClick={() => setPreviewImageModal(c.proofImageUrl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-bsi-teal font-bold text-[11px] transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Lihat Slip</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Selesai
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Upload Bukti Transfer */}
      {selectedForUpload && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-bsi-teal" />
              Upload Bukti Transfer Byond
            </h3>
            <p className="text-xs text-slate-500">
              Unggah tangkapan layar bukti transfer berhasil dari aplikasi Byond BSI untuk ID {selectedForUpload.id}.
            </p>

            <form onSubmit={handleConfirmUploadAndComplete} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nasabah:</span>
                  <span className="font-bold text-slate-800">{selectedForUpload.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nominal:</span>
                  <span className="font-black text-slate-900">{formatRupiah(selectedForUpload.amountRp)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nomor Referensi Transaksi Byond
                </label>
                <input
                  type="text"
                  value={byondRefInput}
                  onChange={(e) => setByondRefInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-bsi-teal"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  URL / File Bukti Transfer (Storage Bucket)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={proofUrlInput}
                    onChange={(e) => setProofUrlInput(e.target.value)}
                    placeholder="URL gambar bukti transfer..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-bsi-teal/50 transition-colors">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-500 block">
                      Klik simulasi unggah foto struk / tangkapan layar Byond
                    </span>
                    <button
                      type="button"
                      onClick={() => setProofUrlInput('https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80')}
                      className="mt-2 text-[10px] font-bold text-bsi-teal hover:underline"
                    >
                      Gunakan Sample Struk BSI Byond
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedForUpload(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-bsi-teal hover:bg-bsi-teal-dark rounded-xl shadow-sm"
                >
                  Simpan & Selesaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImageModal && (
        <div 
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-xs text-slate-800">Bukti Transfer Byond BSI</span>
              <button onClick={() => setPreviewImageModal(null)} className="text-slate-400 text-xs px-2 py-1 rounded bg-slate-100">✕</button>
            </div>
            <img src={previewImageModal} alt="Bukti Transfer" className="rounded-xl w-full h-80 object-cover" />
            <p className="text-[10px] text-slate-400 mt-2 text-center">Tersimpan di Storage Bucket Mandiri BSI</p>
          </div>
        </div>
      )}
    </div>
  );
};
