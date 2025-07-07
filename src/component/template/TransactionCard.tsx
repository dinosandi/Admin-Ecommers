import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Delete as DeleteIcon,
  Download as DownloadIconOutline,
} from '@mui/icons-material';
import { useState } from 'react';
import { format as formatDateFns } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Link } from '@tanstack/react-router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useQueryClient } from '@tanstack/react-query';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import { Transaction, Driver, TransactionItem } from '../../Types';
import deleteConfirmationImage from '../../../src/assets/delete.jpg';

interface Store {
  Name: string;
  Provinces: string;
  Cities: string;
  Districts: string;
  Villages: string | null;
  Latitude: number;
  Longitude: number;
  Email: string;
  PhoneNumber: string;
  OperationalHours: string;
  ProductIds: string[];
  BundleIds: string[];
}

declare module '../../Types' {
  export interface Transaction {
    Store: Store;
  }
}

import { UpdateTransactions } from '../../hooks/useMutation/UpdateStatusTransactions';
import { DeleteTransactions } from '../../hooks/useMutation/DeleteTransactions';
import { useAssignDriverMutation } from '../../hooks/useMutation/UpdateTransactionDriver';
import { GetDrivers } from '../../hooks/useQuery/GetDriver';

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
}

const statusOptionsCard = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

export function TransactionCard({ transaction }: { transaction: Transaction }) {
  const [open, setOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(transaction.DriverId || null);

  const queryClient = useQueryClient();

  const { mutate: updateStatusMutate, isPending: isUpdatingStatus } = UpdateTransactions();
  const { mutate: deleteMutate, isPending: isDeleting } = DeleteTransactions();
  const { mutate: assignDriverMutate, isPending: isAssigningDriver } = useAssignDriverMutation();

  const { data: driversData, isLoading: isLoadingDrivers, isError: isErrorDrivers } = GetDrivers();
  const drivers: Driver[] = driversData?.Data || [];

  const handleDeleteClick = () => setOpenDeleteDialog(true);
  const handleDeleteClose = () => setOpenDeleteDialog(false);

  const handleDeleteConfirm = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required to delete transaction.');
      handleDeleteClose();
      return;
    }

    deleteMutate({ id: transaction.Id, token }, {
      onSuccess: () => {
        toast.success(`Transaksi ${transaction.InvoiceNumber} berhasil dihapus.`);
        handleDeleteClose();
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
      onError: (error: any) => {
        toast.error(`Gagal menghapus transaksi: ${error?.message || 'Terjadi kesalahan.'}`);
        handleDeleteClose();
      },
    });
  };

  const handleStatusChange = (status: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required to update status.');
      return;
    }

    updateStatusMutate({ id: transaction.Id, status, token }, {
      onSuccess: () => {
        toast.success(`Status berhasil diubah menjadi "${status}".`);
        queryClient.invalidateQueries({ queryKey: ['transactions', transaction.Id] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
      onError: (error: any) =>
        toast.error(`Gagal mengubah status: ${error?.response?.data?.message || 'Terjadi kesalahan'}`),
    });
  };

  const handleAssignDriver = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication required to assign a driver.');
      return;
    }

    if (!selectedDriverId) {
      toast.warn('Please select a driver first.');
      return;
    }

    assignDriverMutate({ transactionId: transaction.Id, driverId: selectedDriverId, token }, {
      onSuccess: () => {
        toast.success(`Driver berhasil ditugaskan ke transaksi ${transaction.InvoiceNumber}.`);
        queryClient.invalidateQueries({ queryKey: ['transactions', transaction.Id] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
      onError: (error: any) => {
        toast.error(`Gagal menugaskan driver: ${error?.response?.data?.message || 'Terjadi kesalahan.'}`);
      },
    });
  };

  const handleTrackOrder = (trackingNumber: string | null) => {
    if (trackingNumber) {
      window.open(`https://www.google.com/search?q=${trackingNumber}`, '_blank');
    }
  };

  const getItemSummary = (items: TransactionItem[]) => {
    if (!items || items.length === 0) return '-';
    if (items.length === 1) {
      return items[0].ItemType === "Product" && items[0].Product?.Name
        ? items[0].Product.Name
        : items[0].ItemType === "Bundle" && items[0].Bundle?.Name
          ? items[0].Bundle.Name
          : "Produk/Paket";
    }
    const names = items.slice(0, 3).map(item =>
      item.ItemType === "Product" && item.Product?.Name
        ? item.Product.Name
        : item.ItemType === "Bundle" && item.Bundle?.Name
          ? item.Bundle.Name
          : "Item"
    );
    return names.join(', ') + (items.length > 3 ? '...' : '');
  };

  const assignedDriverName = drivers.find(d => d.Id === transaction.DriverId)?.FullName || 'Belum ditugaskan';

  const storeAddress = [
    transaction.Store?.Villages,
    transaction.Store?.Districts,
    transaction.Store?.Cities,
    transaction.Store?.Provinces
  ].filter(Boolean).join(', ') || '-';

  const isStatusButtonDisabled = (currentStatus: string, buttonStatus: string) => {
    const currentIndex = statusOptionsCard.indexOf(currentStatus);
    const buttonIndex = statusOptionsCard.indexOf(buttonStatus);
    return isUpdatingStatus || buttonIndex <= currentIndex;
  };

  const canAssignDriver = transaction.DeliveryMethod === 'Delivery' &&
                          (transaction.Status === 'Processing' || transaction.Status === 'Shipped');

  const handleDownloadSingleTransactionPdf = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Detail Transaksi', 14, 20);

    doc.setFontSize(10);
    let yOffset = 30;

    const addText = (label: string, value: string | number) => {
      doc.text(`${label}: ${value}`, 14, yOffset);
      yOffset += 7;
    };

    addText('Invoice', transaction.InvoiceNumber);
    addText('Tanggal Transaksi', formatDateFns(new Date(transaction.TransactionDate), "dd MMMM HH:mm", { locale: idLocale }));
    addText('Metode Bayar', transaction.PaymentMethod);
    addText('Metode Pengiriman', transaction.DeliveryMethod);
    addText('Status', transaction.Status);
    addText('Total Jumlah', `Rp ${transaction.TotalAmount.toLocaleString("id-ID")}`);
    addText('Penerima', transaction.RecipientName || '-');
    addText('Telepon Penerima', transaction.RecipientPhone || '-');
    addText('Alamat Pengiriman', `${transaction.ShippingAddress || '-'}, ${transaction.ShippingCity || '-'}, ${transaction.ShippingPostalCode || '-'}`);
    if (transaction.TrackingNumber) {
      addText('Nomor Pelacakan', transaction.TrackingNumber);
    }
    addText('Driver Ditugaskan', assignedDriverName);

    yOffset += 10;

    doc.setFontSize(14);
    doc.text('Item Pesanan', 14, yOffset);
    yOffset += 5;

    const itemsTableColumn = ["Nama Produk", "Tipe", "Jumlah", "Harga Satuan", "Total"];
    const itemsTableRows: any[] = [];

    transaction.Items.forEach(item => {
      itemsTableRows.push([
        item.ItemType === "Product" && item.Product?.Name
          ? item.Product.Name
          : item.ItemType === "Bundle" && item.Bundle?.Name
            ? item.Bundle.Name
            : item.ItemName || "N/A",
        item.ItemType,
        item.Quantity,
        `Rp ${item.UnitPrice.toLocaleString("id-ID")}`,
        `Rp ${item.TotalPrice.toLocaleString("id-ID")}`
      ]);
    });

    (doc as any).autoTable({
      head: [itemsTableColumn],
      body: itemsTableRows,
      startY: yOffset,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 209, 0], textColor: [0,0,0] },
    });

    yOffset = (doc as any).autoTable.previous.finalY + 10;

    doc.setFontSize(14);
    doc.text('Riwayat Status', 14, yOffset);
    yOffset += 5;

    transaction.StatusHistories.forEach(history => {
      doc.setFontSize(10);
      doc.text(`${formatDateFns(new Date(history.UpdatedAt), "dd MMMM HH:mm", { locale: idLocale })}: ${history.Status}`, 14, yOffset);
      yOffset += 7;
    });

    doc.save(`Transaksi_${transaction.InvoiceNumber}.pdf`);
    toast.success(`Mendownload detail untuk Invoice ${transaction.InvoiceNumber}`);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{transaction.InvoiceNumber}</TableCell>
        <TableCell>{formatDateFns(new Date(transaction.TransactionDate), "dd MMMM HH:mm", { locale: idLocale })}</TableCell>
        <TableCell>{transaction.PaymentMethod}</TableCell>
        <TableCell>{transaction.DeliveryMethod}</TableCell>
        <TableCell>
          <Chip
            label={transaction.Status}
            color={getStatusColor(transaction.Status)}
            variant="outlined"
            size="small"
          />
        </TableCell>
        <TableCell>{getItemSummary(transaction.Items)}</TableCell>
        <TableCell align="right">
          Rp {transaction.TotalAmount.toLocaleString("id-ID")}
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
            <IconButton
              size="small"
              color="error"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              title="Delete Transaksi"
            >
              {isDeleting ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
            </IconButton>
            <IconButton
              size="small"
              color="info"
              onClick={handleDownloadSingleTransactionPdf}
              title="Download Detail Transaksi sebagai PDF"
            >
              <DownloadIconOutline fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={2}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Detail Toko:
              </Typography>
              {transaction.Store ? (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nama Toko: <b>{transaction.Store.Name}</b>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Alamat Toko: {storeAddress}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email Toko: {transaction.Store.Email || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Telepon Toko: {transaction.Store.PhoneNumber || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Jam Operasional: {transaction.Store.OperationalHours || '-'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Informasi toko tidak tersedia.</Typography>
              )}

              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Detail Pengiriman & Penerima:
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Penerima: {transaction.RecipientName || '-'} ({transaction.RecipientPhone || '-'})
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Alamat: {transaction.ShippingAddress || '-'}, {transaction.ShippingCity || '-'}, {transaction.ShippingPostalCode || '-'}
                </Typography>
                {transaction.TrackingNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Typography variant="body2">Tracking: {transaction.TrackingNumber}</Typography>
                    <Button variant="outlined" size="small" onClick={() => handleTrackOrder(transaction.TrackingNumber)}>
                      Lacak
                    </Button>
                  </Box>
                )}
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Item Pesanan:</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama Produk</TableCell>
                      <TableCell>Tipe</TableCell>
                      <TableCell align="right">Jumlah</TableCell>
                      <TableCell align="right">Harga Satuan</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transaction.Items.map((item) => (
                      <TableRow key={item.Id}>
                        <TableCell>
                          {item.ItemType === "Product" && item.Product?.Name
                            ? item.Product.Name
                            : item.ItemType === "Bundle" && item.Bundle?.Name
                              ? item.Bundle.Name
                              : item.ItemName || "N/A"}
                        </TableCell>
                        <TableCell>{item.ItemType}</TableCell>
                        <TableCell align="right">{item.Quantity}</TableCell>
                        <TableCell align="right">Rp {item.UnitPrice.toLocaleString("id-ID")}</TableCell>
                        <TableCell align="right">Rp {item.TotalPrice.toLocaleString("id-ID")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Riwayat Status:</Typography>
                {transaction.StatusHistories.map((history) => (
                  <Typography key={history.Id} variant="body2" color="text.secondary">
                    {formatDateFns(new Date(history.UpdatedAt), "dd MMMM HH:mm", { locale: idLocale })}: {history.Status}
                  </Typography>
                ))}
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Tugaskan Driver:</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Driver saat ini: <b>{assignedDriverName}</b>
                </Typography>
                <FormControl sx={{ minWidth: 200, mr: 2 }} size="small" disabled={isLoadingDrivers || isAssigningDriver || !canAssignDriver}>
                  <InputLabel id="driver-select-label">Pilih Driver</InputLabel>
                  <Select
                    labelId="driver-select-label"
                    value={selectedDriverId || ''}
                    label="Pilih Driver"
                    onChange={(event) => setSelectedDriverId(event.target.value as string)}
                  >
                    <MenuItem value="">
                      <em>Tidak Ada</em>
                    </MenuItem>
                    {isLoadingDrivers ? (
                      <MenuItem disabled>
                        <CircularProgress size={16} /> Loading Drivers...
                      </MenuItem>
                    ) : isErrorDrivers ? (
                      <MenuItem disabled>Error loading drivers</MenuItem>
                    ) : drivers.length === 0 ? (
                      <MenuItem disabled>Tidak ada driver tersedia</MenuItem>
                    ) : (
                      drivers.map((driver) => (
                        <MenuItem key={driver.Id} value={driver.Id}>
                          {driver.FullName}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignDriver}
                  disabled={!selectedDriverId || isAssigningDriver || selectedDriverId === transaction.DriverId || !canAssignDriver}
                >
                  {isAssigningDriver ? <CircularProgress size={20} /> : 'Tugaskan Driver'}
                </Button>
                {transaction.DriverId && transaction.DriverId === selectedDriverId && (
                    <Chip label="Driver Sudah Ditugaskan" color="success" size="small" sx={{ ml: 1 }} />
                )}
                {!canAssignDriver && transaction.DeliveryMethod === 'Delivery' && (
                    <Chip label="Tugaskan Driver hanya saat status Processing atau Shipped" color="info" size="small" sx={{ ml: 1 }} />
                )}
                {transaction.DeliveryMethod !== 'Delivery' && (
                    <Chip label="Tidak Perlu Driver (Bukan Pengiriman)" color="default" size="small" sx={{ ml: 1 }} />
                )}
              </Box>

              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Ubah Status:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {statusOptionsCard.map((s) => (
                    <Button
                      key={s}
                      variant="outlined"
                      size="small"
                      color={getStatusColor(s)}
                      disabled={isUpdatingStatus || isStatusButtonDisabled(transaction.Status, s)}
                      onClick={() => handleStatusChange(s)}
                    >
                      {isUpdatingStatus && transaction.Status === s ? <CircularProgress size={16} /> : s}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Konfirmasi Penghapusan Transaksi"}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 0 }}>
          
          <img
            src={deleteConfirmationImage}
            alt="Delete Confirmation"
            style={{ maxWidth: '200px', margin: '0 auto' }}
          />
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus transaksi dengan Invoice <b>{transaction.InvoiceNumber}</b>? Aksi ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary" disabled={isDeleting}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}