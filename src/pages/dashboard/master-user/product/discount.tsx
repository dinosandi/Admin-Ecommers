import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  Button,
  Skeleton,
  TextField,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { useState } from "react";
import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { GetBundle } from "../../../../hooks/useQuery/GetBundle";
import DashboardLayout from "../../../../component/template/DashboardLayout";

// Import new icons for expired bundles and warning
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'; // For the terms and conditions
import EventBusyIcon from '@mui/icons-material/EventBusy'; // Icon for expired bundles
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon for "I have read" button

export const Route = createFileRoute("/dashboard/master-user/product/discount")(
  {
    component: DiscountPage,
  }
);

// BASE_URL untuk mengakses gambar
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5230";

// Fungsi untuk mendapatkan URL gambar diskon
const getDiscountImageUrl = (imagePath: string) => {
  if (imagePath?.startsWith("/images/bundle")) {
    return `${BASE_URL}${imagePath}`;
  }
  return "/placeholder-image.jpg"; // Gambar placeholder jika path tidak valid
};

// Definisikan interface untuk data diskon (sesuai dengan API Anda)
interface DiscountItem {
  ProductId: string;
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  TotalPrice: number;
}

interface Discount {
  Id: string;
  Name: string;
  Description: string;
  DiscountPercentage: number;
  Image: string;
  TotalOriginalPrice: number;
  TotalDiscountedPrice: number;
  TotalSavings: number;
  StartDate: string;
  EndDate: string;
  Items: DiscountItem[]; // Array of discounted products
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(price);
}

function formatDate(dateString: string) {
  if (!dateString || dateString === "0001-01-01T00:00:00") return "-";
  return new Date(dateString).toLocaleDateString("id-ID");
}

function Row({ discount }: { discount: Discount }) {
  const [open, setOpen] = useState(false);

  // Logic to check if discount has ended
  const isExpired = new Date(discount.EndDate) < new Date();

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          <img
            src={getDiscountImageUrl(discount.Image)}
            alt={discount.Name}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg";
            }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 6,
              objectFit: "cover",
            }}
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {discount.Name}
            {isExpired && (
              <EventBusyIcon
                fontSize="small"
                color="error"
                sx={{ ml: 0.5 }}
                titleAccess="This bundle has expired"
              />
            )}
          </Box>
        </TableCell>
        <TableCell>{discount.DiscountPercentage}%</TableCell>
        <TableCell>{formatPrice(discount.TotalOriginalPrice)}</TableCell>
        <TableCell>{formatPrice(discount.TotalDiscountedPrice)}</TableCell>
        <TableCell>{formatPrice(discount.TotalSavings)}</TableCell>
        <TableCell>{formatDate(discount.StartDate)}</TableCell>
        <TableCell>{formatDate(discount.EndDate)}</TableCell>
        {/* Kolom Aksi dihapus sesuai permintaan */}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          {" "}
          {/* Sesuaikan colSpan menjadi 9 karena 1 kolom aksi dihapus */}
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle2" gutterBottom component="div">
                Deskripsi:
              </Typography>
              <Typography variant="body2" sx={{ maxWidth: "600px", mb: 2 }}>
                {discount.Description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom component="div">
                Produk dalam Diskon:
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Produk</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell align="right">Harga Satuan</TableCell>
                    <TableCell align="right">Total Harga</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discount.Items.map((item) => (
                    <TableRow key={item.ProductId}>
                      <TableCell component="th" scope="row">
                        {item.ProductName}
                      </TableCell>
                      <TableCell>{item.Quantity}</TableCell>
                      <TableCell align="right">
                        {formatPrice(item.UnitPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatPrice(item.TotalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function DiscountPage() {
  const { data: discounts = [], isLoading, error, refetch } = GetBundle();
  const location = useLocation();

  // New state to track if terms are acknowledged
  const [termsAcknowledged, setTermsAcknowledged] = useState(false);

  const handleAcknowledgeTerms = () => {
    setTermsAcknowledged(true);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 4, backgroundColor: '#fff', minHeight: '100vh' }}>
        {/* Sub-navbar / Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <nav
            style={{ display: "flex", alignItems: "center", padding: "0 16px" }}
          >
            {/* List Product - Posisi Kiri */}
            <Box
              sx={{
                marginRight: "20px",
                borderBottom:
                  location.pathname === "/dashboard/master-user/product"
                    ? "3px solid #FFD100"
                    : "none",
                pb: 1,
              }}
            >
              <Link
                to="/dashboard/master-user/product"
                style={{
                  padding: "8px 4px",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: "#6B7280",
                }}
              >
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: location.pathname === "/dashboard/master-user/product" ? "#000" : "#6B7280",
                    "&:hover": {
                      color: "#374151",
                    },
                  }}
                >
                  List Product
                </Typography>
              </Link>
            </Box>

            {/* List Diskon - Posisi Kanan */}
            <Box
              sx={{
                marginLeft: "",
                borderBottom:
                  location.pathname === "/dashboard/master-user/product/discount"
                    ? "3px solid #FFD100"
                    : "none",
                pb: 1,
              }}
            >
              <Link
                to="/dashboard/master-user/product/discount"
                style={{
                  padding: "8px 4px",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: "#6B7280",
                }}
              >
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: location.pathname === "/dashboard/master-user/product/discount" ? "#000" : "#6B7280",
                    "&:hover": {
                      color: "#374151",
                    },
                  }}
                >
                  List Diskon
                </Typography>
              </Link>
            </Box>
          </nav>
        </Box>

        {/* Konten halaman Diskon */}
        {location.pathname === "/dashboard/master-user/product/discount" && (
          <Paper elevation={2} sx={{ borderRadius: "8px", overflow: "hidden" }}>
            <Box
              sx={{
                p: 3,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h5"
                component="h1"
                fontWeight="bold"
                sx={{ color: "text.primary" }}
              >
                List Diskon
              </Typography>
              {/* Conditional rendering for "Add New Diskon" button based on termsAcknowledged */}
              <Button
                variant="contained"
                sx={{
                  bgcolor: termsAcknowledged ? "#FFD100" : "#e0e0e0", // Change color when active
                  color: termsAcknowledged ? "#000" : "#a0a0a0", // Change text color when active
                  "&:hover": { bgcolor: termsAcknowledged ? "#e6bb00" : "#e0e0e0" },
                  cursor: termsAcknowledged ? "pointer" : "not-allowed",
                }}
                component={Link}
                to="/dashboard/master-user/product/creatediscount"
                disabled={!termsAcknowledged} // Disable if terms not acknowledged
              >
                + Add New Diskon
              </Button>
            </Box>

            {isLoading ? (
              <Box sx={{ p: 3 }}>
                {[...Array(5)].map((_, index) => (
                  <Box key={index} sx={{ my: 2 }}>
                    <Skeleton
                      variant="rectangular"
                      height={50}
                      animation="wave"
                    />
                  </Box>
                ))}
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, color: "error.main" }}>
                <Typography>Gagal memuat diskon: {error.message}</Typography>
                <Button
                  onClick={() => refetch()}
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Coba Lagi
                </Button>
              </Box>
            ) : discounts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                <Typography>Tidak ada diskon yang ditemukan.</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table aria-label="collapsible discount table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#FFD100" }}>
                      <TableCell />
                      <TableCell>Gambar</TableCell>
                      <TableCell>Nama Diskon</TableCell>
                      <TableCell>Persentase</TableCell>
                      <TableCell>Harga Asli</TableCell>
                      <TableCell>Harga Diskon</TableCell>
                      <TableCell>Penghematan</TableCell>
                      <TableCell>Mulai</TableCell>
                      <TableCell>Berakhir</TableCell>
                      {/* Kolom Aksi telah dihapus dari TableHead */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {discounts.map((discount: Discount) => (
                      <Row key={discount.Id} discount={discount} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination Section (opsional, sesuaikan jika ada pagination untuk diskon) */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                p: 2,
                borderTop: "1px solid #e0e0e0",
                gap: 1,
              }}
            >
              <IconButton size="small" disabled>
                {"<<"}
              </IconButton>
              <IconButton size="small" disabled>
                {"<"}
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                Go to Page
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                defaultValue="1"
                sx={{
                  width: 60,
                  ".MuiInputBase-input": { textAlign: "center" },
                }}
              />
              <IconButton size="small" disabled>
                {">"}
              </IconButton>
              <IconButton size="small" disabled>
                {">>"}
              </IconButton>
              <Typography variant="body2" sx={{ ml: 2, mr: 1 }}>
                Max
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                defaultValue="0"
                sx={{
                  width: 60,
                  ".MuiInputBase-input": { textAlign: "center" },
                }}
              />
            </Box>
          </Paper>
        )}

        {/* Syarat dan Ketentuan untuk membuat Bundle */}
        <Paper elevation={2} sx={{ p: 3, mt: 4, borderRadius: "8px", bgcolor: '#fff', border: '1px solid #FFD100' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <WarningAmberRoundedIcon sx={{ color: '#FFD100', fontSize: 30 }} />
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ color: 'text.primary' }}>
              Syarat & Ketentuan Pembuatan Bundle Diskon
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Mohon perhatikan bahwa setiap Bundle Diskon yang telah dibuat dan disimpan tidak dapat dihapus. Pastikan semua detail seperti nama diskon, deskripsi, persentase diskon, tanggal mulai dan berakhir, serta produk yang termasuk dalam bundle sudah benar dan sesuai dengan yang Anda inginkan sebelum melakukan penyimpanan. Kebijakan ini diberlakukan untuk menjaga integritas data promosi yang telah berjalan.
          </Typography>
          {/* New button to acknowledge terms */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleAcknowledgeTerms}
              disabled={termsAcknowledged} // Disable once clicked
              startIcon={termsAcknowledged ? <CheckCircleOutlineIcon /> : null}
              sx={{
                bgcolor: termsAcknowledged ? '#4CAF50' : '#FFD100', // Green if acknowledged, blue otherwise
                color: '#fff',
                borderRadius: '8px',
                px: 3,
                py: 1,
                '&:hover': {
                  bgcolor: termsAcknowledged ? '#4CAF50' : '#FFD500', // Green if acknowledged, blue otherwise
                },
              }}
            >
              {termsAcknowledged ? 'Sudah Dibaca' : 'Saya Sudah Membaca'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}