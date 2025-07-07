import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Badge, // Import Badge
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useGetCustomers } from '../../hooks/useQuery/GetCustomer';
import DashboardLayout from '../../component/template/DashboardLayout';

const SENDER_ID_LOCAL_STORAGE_KEY = 'chatSenderId';
const USER_DATA_LOCAL_STORAGE_KEY = 'user';

type Customer = {
  Id: string;
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  ImageUrl: string;
  ImageFile: string | null;
  LicenseNumber: string | null;
  VehicleInfo: string | null;
  Role: number;
  DriverId: string | null;
};

const CustomerTable: React.FC = () => {
  const { data: customers, isLoading, isError, error } = useGetCustomers();
  const navigate = useNavigate();

  const [currentLoggedInUserCustomerId, setCurrentLoggedInUserCustomerId] = useState<string | null>(null);
  const [currentLoggedInUserProfile, setCurrentLoggedInUserProfile] = useState<Customer | null>(null);
  // Menggunakan Map untuk melacak pelanggan mana yang memiliki pesan belum dibaca
  // Key: CustomerId, Value: boolean (true jika ada notifikasi) atau bisa juga jumlah pesan
  const [unreadMessageStatus, setUnreadMessageStatus] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const userString = localStorage.getItem(USER_DATA_LOCAL_STORAGE_KEY);
    if (userString) {
      try {
        const user = JSON.parse(userString);
        const loggedInUserId = user.userId || user.username;

        if (loggedInUserId && customers) {
          const foundProfile = customers.find(c => c.UserId === loggedInUserId && c.Role === 0);
          if (foundProfile) {
            setCurrentLoggedInUserCustomerId(foundProfile.Id);
            setCurrentLoggedInUserProfile(foundProfile);
            localStorage.setItem(SENDER_ID_LOCAL_STORAGE_KEY, foundProfile.Id);
          } else {
            console.warn("User logged in does not have a Role 0 Customer profile or profile not found.");
            setCurrentLoggedInUserCustomerId(null);
            setCurrentLoggedInUserProfile(null);
            localStorage.removeItem(SENDER_ID_LOCAL_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        setCurrentLoggedInUserCustomerId(null);
        setCurrentLoggedInUserProfile(null);
        localStorage.removeItem(SENDER_ID_LOCAL_STORAGE_KEY);
      }
    } else {
      setCurrentLoggedInUserCustomerId(null);
      setCurrentLoggedInUserProfile(null);
      localStorage.removeItem(SENDER_ID_LOCAL_STORAGE_KEY);
    }
  }, [customers]);

  // --- Efek Simulasi Notifikasi Pesan Masuk ---
  // Notifikasi akan muncul secara acak dan tetap ada sampai baris diklik.
  useEffect(() => {
    const interval = setInterval(() => {
      if (customers && customers.length > 0) {
        // Filter pelanggan yang akan ditampilkan di tabel (bukan diri sendiri, bukan Role 0)
        const eligibleCustomers = customers.filter(c => 
          c.Role !== 0 && c.Id !== currentLoggedInUserCustomerId
        );

        if (eligibleCustomers.length > 0) {
          const randomCustomer = eligibleCustomers[Math.floor(Math.random() * eligibleCustomers.length)];
          
          // Tambahkan notifikasi jika belum ada untuk pelanggan ini
          setUnreadMessageStatus(prev => {
            const newMap = new Map(prev);
            if (!newMap.has(randomCustomer.Id)) { // Hanya tambahkan jika belum ada
              newMap.set(randomCustomer.Id, true);
              console.log(`Simulating new message for: ${randomCustomer.FullName}`);
            }
            return newMap;
          });
        }
      }
    }, 7000); // Pesan baru masuk setiap 7 detik (simulasi)

    return () => clearInterval(interval);
  }, [customers, currentLoggedInUserCustomerId]); // Dependensi

  const handleRowClick = (receiverCustomer: Customer) => {
    if (currentLoggedInUserCustomerId) {
      // Hapus notifikasi untuk pelanggan ini saat diklik
      setUnreadMessageStatus(prev => {
        const newMap = new Map(prev);
        if (newMap.has(receiverCustomer.Id)) {
          newMap.delete(receiverCustomer.Id); // Hapus notifikasi saat chat dibuka
          console.log(`Notification cleared for: ${receiverCustomer.FullName}`);
        }
        return newMap;
      });
      navigate({
        to: '/dashboard/chat/$customerId',
        params: { customerId: receiverCustomer.Id },
      });
    } else {
      alert("Anda belum teridentifikasi sebagai pengirim (Role 0). Mohon pastikan Anda login dengan akun Role 0.");
    }
  };

  const customersToShowInTable = customers?.filter(c => c.Role !== 0 && c.Id !== currentLoggedInUserCustomerId) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading Customers...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'error.main' }}>
          <Typography variant="h6">Error loading customers: {(error as Error).message}</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (!currentLoggedInUserCustomerId && !isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
          <Typography variant="h6" color="error">
            Akses Chat Dibatasi: Tidak ada profil pelanggan dengan Role 0 yang terhubung dengan akun Anda.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Silakan login dengan akun yang memiliki Role 0 untuk memulai chat.
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (customersToShowInTable.length === 0) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Typography variant="h6" color="text.secondary">No customer data (excluding Role 0 and logged-in user) available.</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={currentLoggedInUserProfile?.ImageUrl || '/default-avatar.png'} sx={{ width: 96, height: 56 }} />
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Chat Sebagai: {currentLoggedInUserProfile?.FullName || "Memuat..."}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID Pengirim Anda: {currentLoggedInUserCustomerId || "N/A"}
          </Typography>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ mt: 6, mx: 'auto', maxWidth: 1500 }}>
        <Table sx={{ minWidth: 650 }} aria-label="customer table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}></TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>Phone Number</TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>Address</TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>User ID</TableCell>
              <TableCell sx={{ bgcolor: '#FFD500', fontWeight: 'bold' }}>Customer ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customersToShowInTable.map((customer) => {
              // Cek apakah pelanggan ini memiliki notifikasi pesan masuk
              const hasUnreadMessage = unreadMessageStatus.has(customer.Id);

              return (
                <TableRow
                  key={customer.Id}
                  onClick={() => handleRowClick(customer)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot" // Menampilkan titik merah
                      color="error"
                      invisible={!hasUnreadMessage}
                    >
                      <Avatar
                        src={customer.ImageUrl || '/default-avatar.png'}
                        alt={customer.FullName}
                        sx={{ width: 40, height: 40 }}
                      />
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.FullName}</TableCell>
                  <TableCell>{customer.Email}</TableCell>
                  <TableCell>{customer.PhoneNumber}</TableCell>
                  <TableCell>{customer.Address}</TableCell>
                  <TableCell>{customer.Role}</TableCell>
                  <TableCell>{customer.UserId}</TableCell>
                  <TableCell>{customer.Id}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardLayout>
  );
};

export default CustomerTable;