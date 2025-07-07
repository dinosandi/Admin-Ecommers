import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Skeleton,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Search as SearchIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

import DashboardLayout from '../../../component/template/DashboardLayout';
import { GetStore } from '../../../hooks/useQuery/GetStore';
import { CreateStore } from '../../../hooks/useMutation/PostStore';
import { FormCreateStore } from '../../../Types';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Import your store icon image
import StoreIcon from '../../../assets/store.jpg'; // Adjust this path if your image is in a different location

// Pastikan Anda memiliki definisi antarmuka ini di file Types.ts atau di sini
interface ProductInStore {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  ImageUrl: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

interface BundleInStore {
  Id: string;
  Name: string;
  Description: string;
  DiscountPercentage: number;
  StartDate: string;
  ImagePath: string;
  EndDate: string;
  UpdatedAt: string;
  TotalPriceBeforeDiscount: number;
  TotalPriceAfterDiscount: number;
  BundleItems: any;
}

export interface Store {
  Id: string;
  Name: string;
  Provinces: string;
  Cities: string;
  Districts: string;
  Villages: string;
  Email: string;
  PhoneNumber: string;
  OperationalHours: string;
  Latitude: number;
  Longitude: number;
  Products: ProductInStore[];
  Bundles: BundleInStore[];
}

export const Route = createFileRoute('/dashboard/store/')({
  component: StorePage,
});

// Fungsi pembantu untuk format tanggal dan harga
export function formatDate(dateString: string | null) {
  if (!dateString || dateString === '0001-01-01T00:00:00' || dateString === '0001-01-01T07:00:00') {
    return '-';
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(price);
}

// Komponen StoreRow
function StoreRow({ store }: { store: Store }) {
  const [open, setOpen] = useState(false);

  const fullAddress = [store.Villages, store.Districts, store.Cities, store.Provinces]
    .filter(Boolean)
    .join(', ');

  const handleDownloadPdfForStore = (storeData: Store) => {
    const doc = new jsPDF();

    // Judul Dokumen
    doc.setFontSize(18);
    doc.text(`Detail Toko: ${storeData.Name}`, 14, 20);

    let yOffset = 30; // Mulai offset Y untuk konten

    // Informasi Toko Utama
    doc.setFontSize(12);
    doc.text(`Alamat: ${fullAddress || '-'}`, 14, yOffset);
    yOffset += 7;
    doc.text(`Telepon: ${storeData.PhoneNumber || '-'}`, 14, yOffset);
    yOffset += 7;
    doc.text(`Email: ${storeData.Email || '-'}`, 14, yOffset);
    yOffset += 7;
    doc.text(`Jam Operasional: ${storeData.OperationalHours || '-'}`, 14, yOffset);
    yOffset += 7;
    doc.text(`Latitude: ${storeData.Latitude}, Longitude: ${storeData.Longitude}`, 14, yOffset);
    yOffset += 15; // Tambah spasi sebelum tabel

    // Tabel Produk
    if (storeData.Products && storeData.Products.length > 0) {
      doc.setFontSize(14);
      doc.text(`Produk (${storeData.Products.length})`, 14, yOffset);
      yOffset += 5; // Spasi kecil
      (doc as any).autoTable({
        startY: yOffset,
        head: [['Nama Produk', 'Harga', 'Stok', 'Status Aktif']],
        body: storeData.Products.map(product => [
          product.Name,
          formatPrice(product.Price),
          product.Stock,
          product.IsActive ? 'Aktif' : 'Tidak Aktif'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [255, 209, 0], textColor: [0, 0, 0] },
        styles: { fontSize: 10, cellPadding: 2 },
        margin: { left: 14, right: 14 },
        didParseCell: function(data: any) {
          if (data.section === 'body' && data.column.index === 3) { // Kolom 'Status Aktif'
            if (data.cell.raw === 'Aktif') {
              data.cell.styles.fillColor = [209, 250, 229]; // Hijau muda
              data.cell.styles.textColor = [6, 95, 70]; // Hijau tua
            } else if (data.cell.raw === 'Tidak Aktif') {
              data.cell.styles.fillColor = [254, 226, 226]; // Merah muda
              data.cell.styles.textColor = [153, 27, 27]; // Merah tua
            }
            data.cell.styles.halign = 'center';
          }
        },
      });
      yOffset = (doc as any).autoTable.previous.finalY + 10; // Update yOffset
    } else {
      doc.setFontSize(10);
      doc.text('Tidak ada produk terkait.', 14, yOffset);
      yOffset += 10;
    }

    // Tabel Bundle Diskon
    if (storeData.Bundles && storeData.Bundles.length > 0) {
      doc.setFontSize(14);
      doc.text(`Bundle Diskon (${storeData.Bundles.length})`, 14, yOffset);
      yOffset += 5; // Spasi kecil
      (doc as any).autoTable({
        startY: yOffset,
        head: [['Nama Bundle', 'Deskripsi', 'Diskon (%)', 'Harga Awal', 'Harga Diskon', 'Mulai', 'Berakhir']],
        body: storeData.Bundles.map(bundle => [
          bundle.Name,
          bundle.Description || '-',
          `${bundle.DiscountPercentage}%`,
          formatPrice(bundle.TotalPriceBeforeDiscount),
          formatPrice(bundle.TotalPriceAfterDiscount),
          formatDate(bundle.StartDate),
          formatDate(bundle.EndDate)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [255, 209, 0], textColor: [0, 0, 0] },
        styles: { fontSize: 10, cellPadding: 2 },
        margin: { left: 14, right: 14 }
      });
      yOffset = (doc as any).autoTable.previous.finalY + 10; // Update yOffset
    } else {
      doc.setFontSize(10);
      doc.text('Tidak ada bundle diskon terkait.', 14, yOffset);
      yOffset += 10;
    }

    doc.save(`detail_toko_${storeData.Name.replace(/\s/g, '_')}.pdf`);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {store.Name}
        </TableCell>
        <TableCell>{fullAddress || '-'}</TableCell>
        <TableCell>{store.PhoneNumber || '-'}</TableCell>
        <TableCell>{store.Email || '-'}</TableCell>
        <TableCell>{store.OperationalHours || '-'}</TableCell>
        <TableCell align="center">{store.Products?.length || 0}</TableCell>
        <TableCell align="center">{store.Bundles?.length || 0}</TableCell>
        <TableCell align="center">
          <IconButton
            color="primary"
            onClick={() => handleDownloadPdfForStore(store)}
            aria-label={`download pdf for ${store.Name}`}
            sx={{ color: '#4CAF50' }}
          >
            <DownloadIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Detail Toko
              </Typography>
              <Typography variant="body2">
                Latitude: {store.Latitude}, Longitude: {store.Longitude}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Produk ({store.Products?.length || 0})
              </Typography>
              {store.Products && store.Products.length > 0 ? (
                <Table size="small" aria-label="products in store">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableCell>Nama Produk</TableCell>
                      <TableCell>Harga</TableCell>
                      <TableCell>Stok</TableCell>
                      <TableCell>Status Aktif</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {store.Products.map((product) => (
                      <TableRow key={product.Id}>
                        <TableCell>{product.Name}</TableCell>
                        <TableCell>{formatPrice(product.Price)}</TableCell>
                        <TableCell>{product.Stock}</TableCell>
                        <TableCell>
                          <span
                            style={{
                              backgroundColor: product.IsActive ? '#d1fae5' : '#fee2e2',
                              color: product.IsActive ? '#065f46' : '#991b1b',
                              padding: '2px 6px',
                              borderRadius: '6px',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}
                          >
                            {product.IsActive ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">Tidak ada produk terkait.</Typography>
              )}

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Bundle Diskon ({store.Bundles?.length || 0})
              </Typography>
              {store.Bundles && store.Bundles.length > 0 ? (
                <Table size="small" aria-label="bundles in store">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableCell>Nama Bundle</TableCell>
                      <TableCell>Deskripsi</TableCell>
                      <TableCell>Diskon (%)</TableCell>
                      <TableCell>Harga Awal</TableCell>
                      <TableCell>Harga Diskon</TableCell>
                      <TableCell>Mulai</TableCell>
                      <TableCell>Berakhir</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {store.Bundles.map((bundle) => (
                      <TableRow key={bundle.Id}>
                        <TableCell>{bundle.Name}</TableCell>
                        <TableCell>{bundle.Description || '-'}</TableCell>
                        <TableCell>{bundle.DiscountPercentage}%</TableCell>
                        <TableCell>{formatPrice(bundle.TotalPriceBeforeDiscount)}</TableCell>
                        <TableCell>{formatPrice(bundle.TotalPriceAfterDiscount)}</TableCell>
                        <TableCell>{formatDate(bundle.StartDate)}</TableCell>
                        <TableCell>{formatDate(bundle.EndDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">Tidak ada bundle diskon terkait.</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

const createStoreSchema = z.object({
  Name: z.string().min(1, 'Nama toko wajib diisi'),
  Provinces: z.string().min(1, 'Provinsi wajib diisi'),
  Cities: z.string().min(1, 'Kota wajib diisi'),
  Districts: z.string().min(1, 'Kecamatan wajib diisi'),
  Villages: z.string().min(1, 'Desa/Kelurahan wajib diisi'),
  Email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  PhoneNumber: z.string().min(1, 'Nomor telepon wajib diisi'),
  OperationalHours: z.string().min(1, 'Jam operasional wajib diisi'),
  Latitude: z.coerce.number().min(-90, 'Latitude tidak valid').max(90, 'Latitude tidak valid'),
  Longitude: z.coerce.number().min(-180, 'Longitude tidak valid').max(180, 'Longitude tidak valid'),
});

function StorePage() {
  const { data: stores = [], isLoading, error, refetch } = GetStore();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormCreateStore>({
    resolver: zodResolver(createStoreSchema),
  });

  const createStoreMutation = CreateStore();

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const onSubmit = async (data: FormCreateStore) => {
    try {
      await createStoreMutation.mutateAsync(data);
      setSnackbar({ open: true, message: 'Toko berhasil ditambahkan!', severity: 'success' });
      handleCloseDialog();
      queryClient.invalidateQueries({ queryKey: ["store"] });
    } catch (err: any) {
      console.error("Gagal menambahkan toko:", err);
      setSnackbar({ open: true, message: `Gagal menambahkan toko: ${err.message || 'Terjadi kesalahan'}`, severity: 'error' });
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const isTambahDataActive = openDialog || location.pathname.includes('/dashboard/store/create');
  const isListStoreActive = !isTambahDataActive && location.pathname === '/dashboard/store/';

  const filteredStores = useMemo(() => {
    if (!searchTerm) {
      return stores;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return stores.filter(store =>
      store.Name.toLowerCase().includes(lowercasedSearchTerm) ||
      store.Email.toLowerCase().includes(lowercasedSearchTerm) ||
      store.PhoneNumber.toLowerCase().includes(lowercasedSearchTerm) ||
      [store.Villages, store.Districts, store.Cities, store.Provinces].filter(Boolean).join(', ').toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [stores, searchTerm]);

  const handleDownloadAllStoresPdf = () => {
    const doc = new jsPDF();

    const tableColumn = ["Nama Toko", "Alamat", "Telepon", "Email", "Jam Operasional", "Jml. Produk", "Jml. Bundle"];
    const tableRows: any[] = [];

    filteredStores.forEach(store => {
      const storeData = [
        store.Name,
        [store.Villages, store.Districts, store.Cities, store.Provinces].filter(Boolean).join(', ') || '-',
        store.PhoneNumber || '-',
        store.Email || '-',
        store.OperationalHours || '-',
        store.Products?.length || 0,
        store.Bundles?.length || 0,
      ];
      tableRows.push(storeData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      headStyles: { fillColor: [255, 209, 0], textColor: [0, 0, 0] },
      didDrawPage: function (data: any) {
        doc.setFontSize(18);
        doc.text("Daftar Toko", data.settings.margin.left, 15);
      },
    });

    doc.save('daftar_toko_keseluruhan.pdf');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <nav style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            <div style={{ marginRight: '20px' }}>
              <Link
                component={Link}
                to="/dashboard/store/"
                style={{
                  padding: '8px 4px',
                  borderBottom: isListStoreActive ? '2px solid #2563eb' : '2px solid transparent',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isListStoreActive ? '#2563eb' : '#6B7280'
                }}
                onMouseEnter={(e) => { if (!isListStoreActive) e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={(e) => { if (!isListStoreActive) e.currentTarget.style.color = '#6B7280'; }}
                onClick={() => {
                  if (openDialog) handleCloseDialog();
                }}
              >
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: isListStoreActive ? '#2563eb' : 'black'
                  }}
                >
                  List Store
                </Typography>
              </Link>
            </div>

            <div style={{ marginLeft: '' }}>
              <Button
                component={Link}
                to="/dashboard/store/create"
                style={{
                  padding: '8px 4px',
                  borderBottom: isTambahDataActive ? '2px solid #2563eb' : '2px solid transparent',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isTambahDataActive ? '#2563eb' : '#6B7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'none'
                }}
                onMouseEnter={(e) => { if (!isTambahDataActive) e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={(e) => { if (!isTambahDataActive) e.currentTarget.style.color = '#6B7280'; }}
              >
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: isTambahDataActive ? '#2563eb' : 'black'
                  }}
                >
                  Tambah Data
                </Typography>
              </Button>
            </div>
          </nav>
        </Box>

        <Paper elevation={2} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ color: 'text.primary' }}>
              Daftar Toko
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Cari toko..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#FFD100',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFD100',
                    },
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff',
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: '#FFD100', color: '#000', '&:hover': { bgcolor: '#e6bb00' } }}
                onClick={handleOpenDialog}
              >
                + Tambah Toko Baru
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                sx={{ bgcolor: '#4CAF50', color: '#fff', '&:hover': { bgcolor: '#45a049' } }}
                onClick={handleDownloadAllStoresPdf}
              >
                Download Semua PDF
              </Button>
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ p: 3 }}>
              {[...Array(5)].map((_, index) => (
                <Box key={index} sx={{ my: 2 }}>
                  <Skeleton variant="rectangular" height={50} animation="wave" />
                </Box>
              ))}
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, color: 'error.main' }}>
              <Typography>Gagal memuat data toko: {error.message}</Typography>
              <Button onClick={() => refetch()} variant="outlined" sx={{ mt: 2 }}>
                Coba Lagi
              </Button>
            </Box>
          ) : filteredStores.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>Tidak ada data toko yang ditemukan.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table aria-label="collapsible store table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#FFD100' }}>
                    <TableCell />
                    <TableCell>Nama Toko</TableCell>
                    <TableCell>Alamat</TableCell>
                    <TableCell>Telepon</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Jam Operasional</TableCell>
                    <TableCell align="center">Jml. Produk</TableCell>
                    <TableCell align="center">Jml. Bundle</TableCell>
                    <TableCell align="center"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStores.map((store: Store) => (
                    <StoreRow key={store.Id} store={store} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </div>

<Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
  <DialogTitle sx={{ backgroundColor: '#FFD500', fontWeight: 'bold' }}>
    Tambah Toko Baru
  </DialogTitle>
  <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
    <DialogContent dividers>
      <Box display="flex" gap={4}>
        {/* Icon di kiri */}
        <Box display="flex" justifyContent="center" alignItems="flex-start" pt={9}>
          <img src={StoreIcon} alt="Store Icon" style={{ width: 400, height: 400, objectFit: 'contain' }} />
        </Box>

        {/* Form di kanan */}
        <Box flex={1}>
          <TextField
            margin="dense"
            label="Nama Toko"
            type="text"
            fullWidth
            variant="outlined"
            {...register("Name")}
            error={!!errors.Name}
            helperText={errors.Name?.message}
          />
          <TextField
            margin="dense"
            label="Provinsi"
            type="text"
            fullWidth
            variant="outlined"
            {...register("Provinces")}
            error={!!errors.Provinces}
            helperText={errors.Provinces?.message}
          />
          <TextField
            margin="dense"
            label="Kota"
            type="text"
            fullWidth
            variant="outlined"
            {...register("Cities")}
            error={!!errors.Cities}
            helperText={errors.Cities?.message}
          />
          <TextField
            margin="dense"
            label="Kecamatan"
            type="text"
            fullWidth
            variant="outlined"
            {...register("Districts")}
            error={!!errors.Districts}
            helperText={errors.Districts?.message}
          />
          <TextField
            margin="dense"
            label="Desa/Kelurahan"
            type="text"
            fullWidth
            variant="outlined"
            {...register("Villages")}
            error={!!errors.Villages}
            helperText={errors.Villages?.message}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            {...register("Email")}
            error={!!errors.Email}
            helperText={errors.Email?.message}
          />
          <TextField
            margin="dense"
            label="Nomor Telepon"
            type="tel"
            fullWidth
            variant="outlined"
            {...register("PhoneNumber")}
            error={!!errors.PhoneNumber}
            helperText={errors.PhoneNumber?.message}
          />
          <TextField
            margin="dense"
            label="Jam Operasional (contoh: 09:00 - 21:00)"
            type="text"
            fullWidth
            variant="outlined"
            {...register("OperationalHours")}
            error={!!errors.OperationalHours}
            helperText={errors.OperationalHours?.message}
          />
          <TextField
            margin="dense"
            label="Latitude"
            type="number"
            fullWidth
            variant="outlined"
            {...register("Latitude")}
            error={!!errors.Latitude}
            helperText={errors.Latitude?.message}
          />
          <TextField
            margin="dense"
            label="Longitude"
            type="number"
            fullWidth
            variant="outlined"
            {...register("Longitude")}
            error={!!errors.Longitude}
            helperText={errors.Longitude?.message}
          />
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button 
      sx={{ color: '#f44336' }}
      onClick={handleCloseDialog} variant="outlined" color="secondary">
        Batal
      </Button>
      <Button
        type="submit"
        variant="contained"
        sx={{ bgcolor: '#FFD100', color: '#000', '&:hover': { bgcolor: '#e6bb00' } }}
        disabled={createStoreMutation.isPending}
      >
        {createStoreMutation.isPending ? <CircularProgress size={24} /> : 'Tambah'}
      </Button>
    </DialogActions>
  </Box>
</Dialog>


      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}