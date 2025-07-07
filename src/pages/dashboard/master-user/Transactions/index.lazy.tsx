import { createLazyFileRoute } from '@tanstack/react-router';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { TransactionCard } from '../../../../component/template/TransactionCard';
import { GetTransactions } from '../../../../hooks/useQuery/GetTransaction';
import DashboardLayout from '../../../../component/template/DashboardLayout';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const Route = createLazyFileRoute('/dashboard/master-user/Transactions/')({
  component: TransactionListPage,
});

function TransactionListPage() {
  const { data: transactions = [], isLoading, isError } = GetTransactions();

  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchTanggal, setSearchTanggal] = useState('');
  const [searchMetodeBayar, setSearchMetodeBayar] = useState('');
  const [searchPengiriman, setSearchPengiriman] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'All'];

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((transaction) => {
      const matchesInvoice = transaction.InvoiceNumber.toLowerCase().includes(searchInvoice.toLowerCase());

      const transactionDate = format(new Date(transaction.TransactionDate), "dd MMMM", { locale: id });
      const matchesTanggal = searchTanggal ? transactionDate.toLowerCase().includes(searchTanggal.toLowerCase()) : true;

      const matchesMetodeBayar = transaction.PaymentMethod.toLowerCase().includes(searchMetodeBayar.toLowerCase());
      const matchesPengiriman = transaction.DeliveryMethod.toLowerCase().includes(searchPengiriman.toLowerCase());
      const matchesStatus = searchStatus === 'All' || searchStatus === '' || transaction.Status.toLowerCase() === searchStatus.toLowerCase();

      return matchesInvoice && matchesTanggal && matchesMetodeBayar && matchesPengiriman && matchesStatus;
    });
  }, [transactions, searchInvoice, searchTanggal, searchMetodeBayar, searchPengiriman, searchStatus]);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text('Daftar Transaksi', 14, 16);

    const tableColumn = ["Invoice", "Tanggal", "Metode Bayar", "Pengiriman", "Status", "Total"];
    const tableRows: any[] = [];

    filteredTransactions.forEach(trx => {
      const transactionData = [
        trx.InvoiceNumber,
        format(new Date(trx.TransactionDate), "dd MMMM HH:mm", { locale: id }),
        trx.PaymentMethod,
        trx.DeliveryMethod,
        trx.Status,
        `Rp ${trx.TotalAmount.toLocaleString("id-ID")}`
      ];
      tableRows.push(transactionData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 209, 0], textColor: [0,0,0] },
    });

    doc.save('daftar_transaksi.pdf');
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" textAlign="center" mt={4}>
          Gagal memuat data transaksi.
        </Typography>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" mb={2} fontWeight="bold">
            Daftar Transaksi
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              label="Invoice"
              variant="outlined"
              size="small"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
            />
            <TextField
              label="Tanggal"
              variant="outlined"
              size="small"
              value={searchTanggal}
              onChange={(e) => setSearchTanggal(e.target.value)}
            />
            <TextField
              label="Metode Bayar"
              variant="outlined"
              size="small"
              value={searchMetodeBayar}
              onChange={(e) => setSearchMetodeBayar(e.target.value)}
            />
            <TextField
              label="Pengiriman"
              variant="outlined"
              size="small"
              value={searchPengiriman}
              onChange={(e) => setSearchPengiriman(e.target.value)}
            />
            <FormControl variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                label="Status"
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadPdf}
              sx={{ backgroundColor: '#FFD100', color: 'black', '&:hover': { backgroundColor: '#e6bb00' } }}
            >
              Download PDF
            </Button>
          </Box>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: '#FFD100' }}>
                <TableRow>
                  <TableCell />
                  <TableCell>Invoice</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Metode Bayar</TableCell>
                  <TableCell>Pengiriman</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ringkasan Item</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((trx: any) => (
                  <TransactionCard key={trx.Id} transaction={trx} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </DashboardLayout>
  );
}