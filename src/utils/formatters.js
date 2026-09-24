// Formatting utilities for BSI x Kepul Dashboard

export const formatRupiah = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatKg = (weight) => {
  if (weight === undefined || weight === null || isNaN(weight)) return '0 kg';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(weight) + ' kg';
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Estimasi konversi emas berdasarkan harga acuan emas BSI (contoh: Rp 1.350.000 / gram)
export const BSI_GOLD_PRICE_PER_GRAM = 1350000;
export const MIN_CONVERSION_THRESHOLD = 50000; // Rp 50.000 sesuai PRD

export const calculateGoldGrams = (amountRp) => {
  if (!amountRp || amountRp < MIN_CONVERSION_THRESHOLD) return 0;
  return Number((amountRp / BSI_GOLD_PRICE_PER_GRAM).toFixed(4));
};

// Environmental impact equivalents
export const calculateEnvironmentalImpact = (totalKg) => {
  const kg = totalKg || 0;
  return {
    treesSaved: Number((kg * 0.017).toFixed(1)), // ~17 trees per 1000 kg paper/recycled
    co2ReducedKg: Number((kg * 1.85).toFixed(1)), // ~1.85 kg CO2e per kg recycled
    energySavedKwh: Number((kg * 4.12).toFixed(1)), // ~4.12 kWh per kg recycled
  };
};
