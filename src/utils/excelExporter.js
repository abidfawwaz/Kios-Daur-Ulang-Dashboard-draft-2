import * as XLSX from 'xlsx';
import { formatRupiah, formatKg, formatDate } from './formatters';

export const exportTransactionsToExcel = (transactions, filterLocationName = 'Semua Lokasi') => {
  const data = transactions.map((t, idx) => ({
    'No': idx + 1,
    'No Transaksi': t.id,
    'No Struk': t.receiptNo || '-',
    'Tanggal': formatDate(t.createdAt),
    'Lokasi Kios': t.locationName,
    'Nama Nasabah': t.customerName,
    'Total Berat (kg)': t.totalWeight,
    'Total Nilai (Rp)': t.totalAmount,
    'Rincian Sampah': t.items.map(i => `${i.wasteName} (${i.weightKg}kg)`).join('; '),
    'Admin Pencatat': t.createdBy,
    'Catatan': t.notes || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaksi Setor Sampah');
  
  // Set columns width
  worksheet['!cols'] = [
    { wch: 5 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 28 }, 
    { wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 40 }, { wch: 18 }, { wch: 25 }
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Laporan_Transaksi_BSI_Kios_${filterLocationName.replace(/\s+/g, '_')}_${dateStr}.xlsx`);
};

export const exportCustomersToExcel = (customers, locations) => {
  const data = customers.map((c, idx) => {
    const loc = locations.find(l => l.id === c.locationId);
    return {
      'No': idx + 1,
      'Kode Nasabah': c.code,
      'Nama Nasabah': c.name,
      'No Telepon': c.phone,
      'No Rekening BSI': c.bsiAccountNo,
      'No Tabungan Emas': c.goldAccountNo,
      'Lokasi Kios': loc ? loc.name : '-',
      'Saldo Saldo Terkumpul (Rp)': c.balance,
      'Total Setoran (kg)': c.totalKg,
      'Status Eligibilitas': c.balance >= 50000 ? 'ELIGIBLE KONVERSI' : 'BELUM ELIGIBLE',
      'Tanggal Registrasi': formatDate(c.registeredAt),
      'Alamat': c.address || '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Rekap Nasabah');

  worksheet['!cols'] = [
    { wch: 5 }, { wch: 14 }, { wch: 25 }, { wch: 16 }, { wch: 18 },
    { wch: 18 }, { wch: 28 }, { wch: 24 }, { wch: 18 }, { wch: 20 },
    { wch: 16 }, { wch: 35 }
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Laporan_Nasabah_BSI_Kios_Daur_Ulang_${dateStr}.xlsx`);
};

export const exportLocationPerformanceToExcel = (locations, transactions, customers) => {
  const data = locations.map((loc, idx) => {
    const locTransactions = transactions.filter(t => t.locationId === loc.id);
    const locCustomers = customers.filter(c => c.locationId === loc.id);
    
    const actualKg = locTransactions.reduce((acc, curr) => acc + (curr.totalWeight || 0), 0);
    const actualRp = locTransactions.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const pctKg = loc.targetKgMonthly ? Math.round((actualKg / loc.targetKgMonthly) * 100) : 0;
    const pctRp = loc.targetRpMonthly ? Math.round((actualRp / loc.targetRpMonthly) * 100) : 0;

    return {
      'No': idx + 1,
      'Kode': loc.code,
      'Nama Lokasi Kios': loc.name,
      'Kota': loc.city,
      'PIC Admin': loc.picName,
      'Target Volume (kg)': loc.targetKgMonthly,
      'Realisasi Volume (kg)': actualKg,
      '% Capaian Volume': `${pctKg}%`,
      'Target Nilai (Rp)': loc.targetRpMonthly,
      'Realisasi Nilai (Rp)': actualRp,
      '% Capaian Nilai': `${pctRp}%`,
      'Nasabah Terdaftar': locCustomers.length,
      'Total Transaksi': locTransactions.length,
      'Status': loc.status,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Performa Kios ESG');

  worksheet['!cols'] = [
    { wch: 5 }, { wch: 8 }, { wch: 32 }, { wch: 18 }, { wch: 24 },
    { wch: 18 }, { wch: 20 }, { wch: 16 }, { wch: 18 }, { wch: 20 },
    { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Laporan_Performa_5_Lokasi_Kios_BSI_${dateStr}.xlsx`);
};

export const exportConversionsToExcel = (conversions) => {
  const data = conversions.map((c, idx) => ({
    'No': idx + 1,
    'ID Pengajuan': c.id,
    'Tanggal Pengajuan': formatDate(c.requestDate),
    'Nama Nasabah': c.customerName,
    'Lokasi Kios': c.locationName,
    'No Tabungan Emas': c.goldAccountNo,
    'Nominal Saldo (Rp)': c.amountRp,
    'Estimasi Gram Emas': c.goldGrams,
    'Status Alur': c.status,
    'Diajukan Oleh': c.requestedBy,
    'Diverifikasi Oleh': c.verifiedBy || '-',
    'Kode Ref Byond': c.byondRefNo || '-',
    'Catatan': c.notes || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Konversi Tabungan Emas');

  worksheet['!cols'] = [
    { wch: 5 }, { wch: 16 }, { wch: 16 }, { wch: 25 }, { wch: 28 },
    { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 18 },
    { wch: 18 }, { wch: 22 }, { wch: 30 }
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Laporan_Konversi_Emas_BSI_Byond_${dateStr}.xlsx`);
};
