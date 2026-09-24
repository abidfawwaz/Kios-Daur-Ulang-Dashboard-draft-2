import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_WASTE_TYPES,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_CONVERSIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import { calculateGoldGrams, MIN_CONVERSION_THRESHOLD } from '../utils/formatters';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Load from localStorage or use initial seed
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [wasteTypes, setWasteTypes] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_waste_types');
    return saved ? JSON.parse(saved) : INITIAL_WASTE_TYPES;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default: Super Admin
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [conversions, setConversions] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_conversions');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSIONS;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('bsi_kios_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Navigation State (1 to 15)
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedReceiptTrx, setSelectedReceiptTrx] = useState(null);
  const [notification, setNotification] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bsi_kios_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_waste_types', JSON.stringify(wasteTypes));
  }, [wasteTypes]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_conversions', JSON.stringify(conversions));
  }, [conversions]);

  useEffect(() => {
    localStorage.setItem('bsi_kios_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Toast / Notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Helper to add audit log
  const logAuditAction = ({ action, target, details }) => {
    const newLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      locationId: currentUser.locationId || null,
      locationName: currentUser.locationName || 'Pusat',
      action,
      target,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 100 + 10),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Switch Active User / Role
  const switchUser = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      showToast(`Beralih akun ke: ${targetUser.name} (${targetUser.role})`, 'info');
      logAuditAction({
        action: 'SWITCH_ACCOUNT',
        target: targetUser.username,
        details: `Sesi login dialihkan ke pengguna ${targetUser.name}`,
      });
    }
  };

  // ==================== ROW LEVEL SECURITY (RLS) HELPERS ====================
  // If currentUser is admin_lokasi, filter data strictly by their assigned location!
  const getFilteredTransactions = () => {
    if (currentUser.role === 'admin_lokasi' && currentUser.locationId) {
      return transactions.filter(t => t.locationId === currentUser.locationId);
    }
    return transactions;
  };

  const getFilteredCustomers = () => {
    if (currentUser.role === 'admin_lokasi' && currentUser.locationId) {
      return customers.filter(c => c.locationId === currentUser.locationId);
    }
    return customers;
  };

  const getFilteredConversions = () => {
    if (currentUser.role === 'admin_lokasi' && currentUser.locationId) {
      return conversions.filter(c => c.locationId === currentUser.locationId);
    }
    return conversions;
  };

  const getFilteredLocations = () => {
    if (currentUser.role === 'admin_lokasi' && currentUser.locationId) {
      return locations.filter(l => l.id === currentUser.locationId);
    }
    return locations;
  };

  // ==================== BUSINESS FLOW ACTIONS ====================

  // 1. Create Transaction (FR-2)
  const createTransaction = ({ customerId, items, notes, locationIdOverride }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      showToast('Nasabah tidak ditemukan!', 'error');
      return null;
    }

    // Determine location: if admin_lokasi, force their location; otherwise use customer's or provided location
    const effectiveLocationId = currentUser.role === 'admin_lokasi' 
      ? currentUser.locationId 
      : (locationIdOverride || customer.locationId);
    
    const location = locations.find(l => l.id === effectiveLocationId);

    const totalWeight = items.reduce((acc, item) => acc + (parseFloat(item.weightKg) || 0), 0);
    const totalAmount = items.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);

    const trxId = `TRX-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(transactions.length + 1).padStart(3, '0')}`;
    const receiptNo = `RCP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(transactions.length + 1).padStart(3, '0')}`;

    const newTransaction = {
      id: trxId,
      receiptNo,
      customerId,
      customerName: customer.name,
      locationId: effectiveLocationId,
      locationName: location ? location.name : 'Kios BSI',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.username,
      totalWeight: Number(totalWeight.toFixed(2)),
      totalAmount: Math.round(totalAmount),
      items: items.map(item => ({
        wasteTypeId: item.wasteTypeId,
        wasteName: item.wasteName,
        weightKg: Number(item.weightKg),
        pricePerKg: Number(item.pricePerKg),
        subtotal: Math.round(item.subtotal),
      })),
      notes: notes || 'Transaksi setor sampah kios.',
    };

    // Update Customer Balance & Stats
    const updatedBalance = customer.balance + Math.round(totalAmount);
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              balance: updatedBalance,
              totalKg: Number((c.totalKg + totalWeight).toFixed(2)),
              totalTransactions: (c.totalTransactions || 0) + 1,
            }
          : c
      )
    );

    // Save transaction
    setTransactions(prev => [newTransaction, ...prev]);

    // Audit Log
    logAuditAction({
      action: 'CREATE_TRANSACTION',
      target: trxId,
      details: `Transaksi baru Rp ${Math.round(totalAmount).toLocaleString('id-ID')} (${totalWeight.toFixed(2)} kg) untuk nasabah ${customer.name}`,
    });

    const isNowEligible = updatedBalance >= MIN_CONVERSION_THRESHOLD;
    showToast(
      `Transaksi ${trxId} berhasil! Saldo baru: Rp ${updatedBalance.toLocaleString('id-ID')}` +
      (isNowEligible ? ' 🎉 Nasabah kini ELIGIBLE konversi Tabungan Emas!' : ''),
      'success'
    );

    setSelectedReceiptTrx(newTransaction);
    return newTransaction;
  };

  // 2. Request Gold Conversion (FR-4)
  const requestConversion = ({ customerId, amountRp, notes }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      showToast('Nasabah tidak valid!', 'error');
      return false;
    }

    if (amountRp < MIN_CONVERSION_THRESHOLD) {
      showToast(`Nominal konversi minimum adalah Rp ${MIN_CONVERSION_THRESHOLD.toLocaleString('id-ID')}`, 'error');
      return false;
    }

    if (amountRp > customer.balance) {
      showToast(`Saldo nasabah tidak mencukupi (Saldo saat ini: Rp ${customer.balance.toLocaleString('id-ID')})`, 'error');
      return false;
    }

    const cnvId = `CNV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(conversions.length + 1).padStart(3, '0')}`;
    const location = locations.find(l => l.id === customer.locationId);
    const goldGrams = calculateGoldGrams(amountRp);

    const newConversion = {
      id: cnvId,
      customerId,
      customerName: customer.name,
      bsiAccountNo: customer.bsiAccountNo,
      goldAccountNo: customer.goldAccountNo,
      locationId: customer.locationId,
      locationName: location ? location.name : '-',
      amountRp,
      goldGrams,
      status: 'MENUNGGU_VERIFIKASI',
      requestDate: new Date().toISOString(),
      requestedBy: currentUser.username,
      verifiedBy: null,
      verifiedDate: null,
      byondRefNo: null,
      proofImageUrl: null,
      notes: notes || 'Permintaan konversi saldo sampah ke Tabungan Emas BSI.',
    };

    setConversions(prev => [newConversion, ...prev]);

    logAuditAction({
      action: 'REQUEST_CONVERSION',
      target: cnvId,
      details: `Pengajuan konversi Rp ${amountRp.toLocaleString('id-ID')} (~${goldGrams} gr emas) untuk nasabah ${customer.name}`,
    });

    showToast(`Pengajuan konversi ${cnvId} berhasil dikirim! Menunggu verifikasi Super Admin.`, 'success');
    return true;
  };

  // 3. Super Admin Verifies Conversion
  const verifyConversion = ({ conversionId, byondRefNo, notes }) => {
    if (currentUser.role !== 'super_admin') {
      showToast('Hanya Super Admin yang berhak memverifikasi konversi!', 'error');
      return false;
    }

    setConversions(prev =>
      prev.map(c => {
        if (c.id === conversionId) {
          return {
            ...c,
            status: 'DIPROSES_BYOND',
            verifiedBy: currentUser.username,
            verifiedDate: new Date().toISOString(),
            byondRefNo: byondRefNo || `BYD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`,
            notes: notes ? `${c.notes} | Verifikasi: ${notes}` : c.notes,
          };
        }
        return c;
      })
    );

    logAuditAction({
      action: 'VERIFY_CONVERSION',
      target: conversionId,
      details: `Super Admin memverifikasi pengajuan konversi ${conversionId} dengan kode Byond ${byondRefNo}`,
    });

    showToast(`Konversi ${conversionId} diverifikasi! Silakan lanjut upload bukti transfer Byond.`, 'success');
    return true;
  };

  // 4. Complete Byond Transfer (Upload Bukti & Update Saldo)
  const completeByondTransfer = ({ conversionId, proofImageUrl, byondRefNo }) => {
    const cnv = conversions.find(c => c.id === conversionId);
    if (!cnv) {
      showToast('Data konversi tidak ditemukan!', 'error');
      return false;
    }

    // Debit customer balance
    setCustomers(prev =>
      prev.map(cust => {
        if (cust.id === cnv.customerId) {
          const newBalance = Math.max(0, cust.balance - cnv.amountRp);
          return { ...cust, balance: newBalance };
        }
        return cust;
      })
    );

    // Update conversion status to SELESAI
    setConversions(prev =>
      prev.map(c => {
        if (c.id === conversionId) {
          return {
            ...c,
            status: 'SELESAI',
            proofImageUrl: proofImageUrl || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
            byondRefNo: byondRefNo || c.byondRefNo || `BYD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`,
            completedAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    logAuditAction({
      action: 'COMPLETE_BYOND_TRANSFER',
      target: conversionId,
      details: `Transfer Byond selesai untuk ${cnv.customerName}. Saldo Rp ${cnv.amountRp.toLocaleString('id-ID')} telah dikonversi ke Tabungan Emas.`,
    });

    showToast(`Transfer Byond konversi ${conversionId} SELESAI! Saldo nasabah berhasil didebet.`, 'success');
    return true;
  };

  // 5. Customer CRUD
  const addCustomer = (customerData) => {
    const newId = `cust_${Date.now()}`;
    const code = `NSB-${String(customers.length + 101).padStart(5, '0')}`;
    const newCustomer = {
      ...customerData,
      id: newId,
      code,
      balance: 0,
      totalKg: 0,
      totalTransactions: 0,
      registeredAt: new Date().toISOString(),
    };

    setCustomers(prev => [newCustomer, ...prev]);

    logAuditAction({
      action: 'REGISTER_CUSTOMER',
      target: code,
      details: `Pendaftaran nasabah baru: ${newCustomer.name} (${newCustomer.phone})`,
    });

    showToast(`Nasabah ${newCustomer.name} berhasil didaftarkan!`, 'success');
    return newCustomer;
  };

  const updateCustomer = (customerId, updatedFields) => {
    setCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, ...updatedFields } : c))
    );

    logAuditAction({
      action: 'UPDATE_CUSTOMER',
      target: customerId,
      details: `Update data profil nasabah ID: ${customerId}`,
    });

    showToast('Data profil nasabah berhasil diperbarui.', 'success');
  };

  // 6. Waste Catalog Price Update (Master Data)
  const updateWastePrice = (wasteId, newPrice) => {
    if (currentUser.role === 'bsi_viewer') {
      showToast('Akun Viewer hanya memiliki akses baca!', 'error');
      return;
    }

    setWasteTypes(prev =>
      prev.map(w => (w.id === wasteId ? { ...w, pricePerKg: Number(newPrice) } : w))
    );

    const waste = wasteTypes.find(w => w.id === wasteId);
    logAuditAction({
      action: 'UPDATE_WASTE_PRICE',
      target: wasteId,
      details: `Harga jenis sampah ${waste?.name} diperbarui menjadi Rp ${Number(newPrice).toLocaleString('id-ID')}/kg`,
    });

    showToast(`Harga ${waste?.name} berhasil diperbarui!`, 'success');
  };

  // 7. Toggle User Status (RBAC)
  const toggleUserStatus = (userId) => {
    if (currentUser.role !== 'super_admin') {
      showToast('Hanya Super Admin yang berhak mengelola akun pengguna!', 'error');
      return;
    }

    setUsers(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          logAuditAction({
            action: 'TOGGLE_USER_STATUS',
            target: u.username,
            details: `Status pengguna ${u.username} diubah menjadi ${nextStatus}`,
          });
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );

    showToast('Status pengguna berhasil diperbarui.', 'info');
  };

  // 8. Reset to Seed Data
  const resetAllData = () => {
    localStorage.clear();
    setLocations(INITIAL_LOCATIONS);
    setWasteTypes(INITIAL_WASTE_TYPES);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCustomers(INITIAL_CUSTOMERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setConversions(INITIAL_CONVERSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    showToast('Seluruh data berhasil di-reset ke data bawaan awal!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        locations,
        wasteTypes,
        users,
        currentUser,
        setCurrentUser,
        switchUser,
        customers,
        transactions,
        conversions,
        auditLogs,
        activeMenu,
        setActiveMenu,
        selectedReceiptTrx,
        setSelectedReceiptTrx,
        notification,
        showToast,
        // RLS queries
        getFilteredTransactions,
        getFilteredCustomers,
        getFilteredConversions,
        getFilteredLocations,
        // Actions
        createTransaction,
        requestConversion,
        verifyConversion,
        completeByondTransfer,
        addCustomer,
        updateCustomer,
        updateWastePrice,
        toggleUserStatus,
        resetAllData,
        logAuditAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
