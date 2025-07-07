// src/pages/dashboard/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import DashboardLayout from "../../component/template/DashboardLayout";
import errorImage from "../../assets/bundleallert.png"; // Sesuaikan path
import { useQuery } from "@tanstack/react-query";
import { api } from "../../config/api";
import {
  Box,
  CircularProgress,
  Typography,
  TextField,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { Store, Transaction, Product, Bundle } from "../../Types";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TuneIcon from "@mui/icons-material/Tune";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
const defaultIcon = L.icon({
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export const GetStore = () => {
  return useQuery<Store[]>({
    queryKey: ["store"],
    queryFn: async () => {
      const res = await api.get("/Store");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error("Error fetching store data:", err);
    },
  });
};

export const GetTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/Transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error("Error fetching transactions data:", err);
    },
  });
};

export const GetProduct = () => {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get("/Products");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error("Error fetching products data:", err);
    },
  });
};

export const GetBundle = () => {
  return useQuery<Bundle[]>({
    queryKey: ["bundle"],
    queryFn: async () => {
      const res = await api.get("/Bundle");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error("Error fetching bundle data:", err);
    },
  });
};

export const Route = createFileRoute("/dashboard/")({
  component: AdminDashboard,
});

function FitBoundsToMarkers({ stores }: { stores: Store[] }) {
  const map = useMap();

  useEffect(() => {
    if (stores && stores.length > 0) {
      const bounds = L.latLngBounds(
        stores.map((store) => [store.Latitude, store.Longitude])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else if (stores.length === 1) {
        map.setView([stores[0].Latitude, stores[0].Longitude], 13);
      }
    } else {
      map.fitBounds([
        [-11.0, 95.0],
        [6.0, 141.0],
      ]);
    }
  }, [map, stores]);

  return null;
}

function AdminDashboard() {
  const {
    data: stores,
    isLoading: isLoadingStores,
    isError: isErrorStores,
    error: errorStores,
  } = GetStore();
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = GetTransactions();
  const {
    data: products,
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
    error: errorProducts,
  } = GetProduct();
  const {
    data: bundles,
    isLoading: isLoadingBundles,
    isError: isErrorBundles,
    error: errorBundles,
  } = GetBundle();

  const [searchTerm, setSearchTerm] = useState("");
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>("all"); // 'all' or specific store ID
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all"); // 'all', 'daily', 'weekly', 'monthly', 'custom'
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const filteredStores = useMemo(() => {
    if (!stores) return [];
    if (!searchTerm) return stores;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return stores.filter(
      (store) =>
        store.Name.toLowerCase().includes(lowerCaseSearchTerm) ||
        store.Provinces.toLowerCase().includes(lowerCaseSearchTerm) ||
        store.Cities.toLowerCase().includes(lowerCaseSearchTerm) ||
        store.Districts.toLowerCase().includes(lowerCaseSearchTerm) ||
        (store.Villages &&
          store.Villages.toLowerCase().includes(lowerCaseSearchTerm)) ||
        store.Email.toLowerCase().includes(lowerCaseSearchTerm) ||
        store.PhoneNumber.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [stores, searchTerm]);

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleCloseFilterDialog = () => {
    setOpenFilterDialog(false);
  };

  const handleApplyFilters = () => {
    setOpenFilterDialog(false);
  };

  const {
    topStores,
    topProducts,
    topBundles,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    totalOverallRevenue,
  } = useMemo(() => {
    if (!transactions || !products || !bundles) {
      return {
        topStores: [],
        topProducts: [],
        topBundles: [],
        dailyRevenue: { categories: [], data: [] },
        weeklyRevenue: { categories: [], data: [] },
        monthlyRevenue: { categories: [], data: [] },
        totalOverallRevenue: 0,
      };
    }

    let currentFilteredTransactions = transactions;

    // Filter by store
    if (selectedStoreFilter !== "all") {
      currentFilteredTransactions = currentFilteredTransactions.filter(
        (transaction) => transaction.StoreId === selectedStoreFilter
      );
    }

    // Filter by date range (for 'custom' or generally applying to all timeframe calculations)
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      currentFilteredTransactions = currentFilteredTransactions.filter(
        (transaction) => {
          const transactionDate = new Date(transaction.TransactionDate);
          return transactionDate >= start && transactionDate <= end;
        }
      );
    }

    const storeSales: { [key: string]: number } = {};
    const productSales: { [key: string]: number } = {};
    const bundleSales: { [key: string]: number } = {};
    const revenueByDay: { [key: string]: number } = {};
    const revenueByWeek: { [key: string]: number } = {};
    const revenueByMonth: { [key: string]: number } = {};
    let currentTotalOverallRevenue = 0; // Renamed to avoid conflict

    currentFilteredTransactions.forEach((transaction) => {
      if (transaction.StoreId) {
        storeSales[transaction.StoreId] =
          (storeSales[transaction.StoreId] || 0) + 1;
      }

      transaction.Items.forEach((item) => {
        if (item.ProductId) {
          productSales[item.ProductId] =
            (productSales[item.ProductId] || 0) + item.Quantity;
        } else if (item.BundleId) {
          bundleSales[item.BundleId] =
            (bundleSales[item.BundleId] || 0) + item.Quantity;
        }
      });
      currentTotalOverallRevenue += transaction.TotalAmount;

      const transactionDate = new Date(transaction.TransactionDate);
      const year = transactionDate.getFullYear();
      const month = String(transactionDate.getMonth() + 1).padStart(2, "0");
      const day = String(transactionDate.getDate()).padStart(2, "0");

      const dateKey = `${year}-${month}-${day}`;
      revenueByDay[dateKey] =
        (revenueByDay[dateKey] || 0) + transaction.TotalAmount;

      const monthKey = `${year}-${month}`;
      revenueByMonth[monthKey] =
        (revenueByMonth[monthKey] || 0) + transaction.TotalAmount;

      const dateForWeek = new Date(transactionDate.valueOf());
      dateForWeek.setDate(
        dateForWeek.getDate() + 4 - (dateForWeek.getDay() || 7)
      );
      const yearStart = new Date(dateForWeek.getFullYear(), 0, 1);
      const weekNo = Math.ceil(
        ((dateForWeek.valueOf() - yearStart.valueOf()) / 86400000 + 1) / 7
      );
      const weekKey = `${year}-${String(weekNo).padStart(2, "0")}`;
      revenueByWeek[weekKey] =
        (revenueByWeek[weekKey] || 0) + transaction.TotalAmount;
    });

    const sortedDailyRevenue = Object.entries(revenueByDay)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateA).getTime() - new Date(dateB).getTime()
      )
      .reduce(
        (acc, [date, amount]) => {
          acc.categories.push(date);
          acc.data.push(amount);
          return acc;
        },
        { categories: [] as string[], data: [] as number[] }
      );

    const sortedWeeklyRevenue = Object.entries(revenueByWeek)
      .sort()
      .reduce(
        (acc, [week, amount]) => {
          acc.categories.push(
            `Minggu ${week.split("-")[1]} (${week.split("-")[0]})`
          );
          acc.data.push(amount);
          return acc;
        },
        { categories: [] as string[], data: [] as number[] }
      );

    const sortedMonthlyRevenue = Object.entries(revenueByMonth)
      .sort()
      .reduce(
        (acc, [month, amount]) => {
          const [yearStr, monthStr] = month.split("-");
          const monthName = new Date(
            parseInt(yearStr),
            parseInt(monthStr) - 1,
            1
          ).toLocaleString("id-ID", { month: "long" });
          acc.categories.push(`${monthName} ${yearStr}`);
          acc.data.push(amount);
          return acc;
        },
        { categories: [] as string[], data: [] as number[] }
      );

    const sortedStores = Object.entries(storeSales)
      .map(([storeId, count]) => {
        const store = stores?.find((s) => s.Id === storeId);
        return {
          name: store
            ? store.Name
            : `Toko Tidak Dikenal (${storeId.substring(0, 4)}...)`,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const sortedProducts = Object.entries(productSales)
      .map(([productId, count]) => {
        const product = products?.find((p) => p.Id === productId);
        return {
          name: product
            ? product.Name
            : `Produk Tidak Dikenal (${productId.substring(0, 4)}...)`,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const sortedBundles = Object.entries(bundleSales)
      .map(([bundleId, count]) => {
        const bundle = bundles?.find((b) => b.Id === bundleId);
        return {
          name: bundle
            ? bundle.Name
            : `Paket Tidak Dikenal (${bundleId.substring(0, 4)}...)`,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      topStores: sortedStores,
      topProducts: sortedProducts,
      topBundles: sortedBundles,
      dailyRevenue: sortedDailyRevenue,
      weeklyRevenue: sortedWeeklyRevenue,
      monthlyRevenue: sortedMonthlyRevenue,
      totalOverallRevenue: currentTotalOverallRevenue, // Use the filtered total
    };
  }, [
    transactions,
    stores,
    products,
    bundles,
    selectedStoreFilter,
    customStartDate,
    customEndDate,
  ]);

  const isLoadingAny =
    isLoadingStores ||
    isLoadingTransactions ||
    isLoadingProducts ||
    isLoadingBundles;
  const isErrorAny =
    isErrorStores || isErrorTransactions || isErrorProducts || isErrorBundles;
  const errorAny =
    errorStores || errorTransactions || errorProducts || errorBundles;

  if (isLoadingAny) {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress />
          <Typography ml={2}>Memuat data dashboard...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (isErrorAny) {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
          flexDirection="column"
          textAlign="center"
          gap={2}
        >
          <img
            src={errorImage}
            alt="Gagal memuat data"
            style={{ maxWidth: "300px", width: "100%" }}
          />
          <Typography color="error">Gagal memuat data dashboard</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  const indonesiaBounds: L.LatLngBoundsExpression = [
    [-11.0, 95.0],
    [6.0, 141.0],
  ];

  const initialCenter: [number, number] = [-2.5, 118.0];
  const initialZoom = 5;

  const commonBarChartOptions = (
    title: string,
    categories: string[],
    tooltipLabel: string
  ): ApexOptions => ({
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: -6,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#fff"],
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Jumlah",
      },
    },
    yaxis: {
      title: {
        text: "",
      },
    },
    title: {
      text: title,
      align: "left",
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val + ` ${tooltipLabel}`;
        },
      },
    },
  });

  const splineAreaChartOptions = (
    title: string,
    categories: string[],
    unit: string
  ): ApexOptions => ({
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      type: "category",
      categories: categories,
      title: {
        text: "Periode",
      },
    },
    yaxis: {
      title: {
        text: `Pendapatan (${unit})`,
      },
      labels: {
        formatter: (value) => `Rp ${value.toLocaleString("id-ID")}`,
      },
    },
    tooltip: {
      x: {
        format: "dd/MM/yy",
      },
      y: {
        formatter: (value) => `Rp ${value.toLocaleString("id-ID")}`,
      },
    },
    title: {
      text: title,
      align: "left",
    },
  });

  const columnChartOptions = (
    title: string,
    categories: string[],
    unit: string
  ): ApexOptions => ({
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return `Rp ${val.toLocaleString("id-ID")}`;
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    xaxis: {
      categories: categories,
      title: {
        text: "Bulan",
      },
      labels: {
        rotate: -45,
        rotateAlways: true,
      },
    },
    yaxis: {
      title: {
        text: `Pendapatan (${unit})`,
      },
      labels: {
        formatter: (value) => `Rp ${value.toLocaleString("id-ID")}`,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (value) => `Rp ${value.toLocaleString("id-ID")}`,
      },
    },
    title: {
      text: title,
      align: "left",
    },
  });

  const pieChartOptions = (
    title: string,
    labels: string[],
    total: number
  ): ApexOptions => ({
    chart: {
      type: "pie",
      height: 350,
    },
    labels: labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    title: {
      text: title,
      align: "left",
    },
    tooltip: {
      y: {
        formatter: (value) =>
          `${value} transaksi (${((value / total) * 100).toFixed(2)}%)`,
      },
    },
    legend: {
      position: "bottom",
    },
  });

  return (
    <DashboardLayout>
      <div className="p-4">
        {/* Map Section */}
        <Paper sx={{ p: 2, mt: 4, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              mb: 3,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TextField
              label="Cari Toko Alamat Toko"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { backgroundColor: "white" } }}
            />
          </Box>

          <Typography variant="h6" mb={2}>
            Lokasi Toko pada Peta
          </Typography>
          {filteredStores.length > 0 ? (
            <Box
              sx={{
                width: "100%",
                height: "500px",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <MapContainer
                center={initialCenter}
                zoom={initialZoom}
                scrollWheelZoom={true}
                maxBounds={indonesiaBounds}
                minZoom={5}
                maxZoom={18}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredStores.map((store) => (
                  <Marker
                    key={store.Id}
                    position={[store.Latitude, store.Longitude]}
                  >
                    <Popup>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {store.Name}
                        </Typography>
                        <Typography variant="body2">
                          Alamat: {store.Villages ? store.Villages + ", " : ""}
                          {store.Districts}, {store.Cities}, {store.Provinces}
                        </Typography>
                        <Typography variant="body2">
                          Email: {store.Email}
                        </Typography>
                        <Typography variant="body2">
                          Telepon: {store.PhoneNumber}
                        </Typography>
                        <Typography variant="body2">
                          Jam Operasional: {store.OperationalHours}
                        </Typography>
                      </Box>
                    </Popup>
                  </Marker>
                ))}
                <FitBoundsToMarkers stores={filteredStores} />
              </MapContainer>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Tidak ada data toko yang ditemukan untuk kriteria pencarian ini.
            </Typography>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              mt: 3,
              flexWrap: "wrap",
            }}
          >
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                flex: "1 1 auto",
                minWidth: "200px",
                maxWidth: "300px",
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                {stores ? stores.length : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Jumlah Toko Keseluruhan
              </Typography>
            </Paper>
            {/* Total Pendapatan box - now reflects filters */}
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                flex: "1 1 auto",
                minWidth: "200px",
                maxWidth: "300px",
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                Rp {totalOverallRevenue.toLocaleString("id-ID")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pendapatan
              </Typography>
            </Paper>
          </Box>
        </Paper>

        {/* Charts Section - Now in individual Paper components */}
        <Box sx={{ mt: 10, mb: 3 }}>
          {" "}
          {/* This Box is the new wrapper for all individual chart Papers */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography variant="h6">Statistik Penjualan</Typography>
            <Button
              variant="contained"
              onClick={handleOpenFilterDialog}
              startIcon={<TuneIcon />}
              sx={{
                backgroundColor: "#FFD500",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#e6c200",
                },
              }}
            >
              Edit
            </Button>
          </Box>
          <Grid container spacing={4}>
            {selectedStoreFilter === "all" && (
              <Grid item xs={14} md={4}>
                {" "}
                {/* Changed to md={6} for 50% width */}
                <Paper sx={{ p: 4, height: "100%" }}>
                  <Chart
                    options={commonBarChartOptions(
                      "Toko Paling Laris",
                      topStores.map((s) => s.name),
                      "transaksi"
                    )}
                    series={[
                      {
                        name: "Jumlah Transaksi",
                        data: topStores.map((s) => s.count),
                      },
                    ]}
                    type="bar"
                    height={450}
                    width="250%"
                  />
                </Paper>
              </Grid>
            )}

            <Grid item xs={14} md={4}>
              {" "}
              {/* Changed to md={6} for 50% width */}
              <Paper sx={{ p: 4, height: "100%" }}>
                <Chart
                  options={splineAreaChartOptions(
                    "Pendapatan Harian", // Removed "(Semua Toko)" as it's now filterable
                    dailyRevenue.categories,
                    "Rp"
                  )}
                  series={[{ name: "Pendapatan", data: dailyRevenue.data }]}
                  type="area"
                  height={450}
                  width="220%"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              {" "}
              {/* Changed to md={6} for 50% width */}
              <Paper sx={{ p: 4, height: "100%" }}>
                <Chart
                  options={splineAreaChartOptions(
                    "Pendapatan Mingguan", // Removed "(Semua Toko)" as it's now filterable
                    weeklyRevenue.categories,
                    "Rp"
                  )}
                  series={[{ name: "Pendapatan", data: weeklyRevenue.data }]}
                  type="area"
                  height={450}
                  width="250%"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              {" "}
              {/* Changed to md={6} for 50% width */}
              <Paper sx={{ p: 2, height: "100%" }}>
                <Chart
                  options={columnChartOptions(
                    "Pendapatan Bulanan", // Removed "(Semua Toko)" as it's now filterable
                    monthlyRevenue.categories,
                    "Rp"
                  )}
                  series={[{ name: "Pendapatan", data: monthlyRevenue.data }]}
                  type="bar"
                  height={450}
                  width="230%"
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              {" "}
              {/* Changed to md={6} for 50% width */}
              <Paper sx={{ p: 2, height: "100%" }}>
                <Chart
                  options={commonBarChartOptions(
                    "Produk Paling Laku (Kuantitas Terjual)",
                    topProducts.map((p) => p.name),
                    "kuantitas"
                  )}
                  series={[
                    {
                      name: "Kuantitas Terjual",
                      data: topProducts.map((p) => p.count),
                    },
                  ]}
                  type="bar"
                  height={450}
                  width="260%"
                />
              </Paper>
            </Grid>

            {/* Display Bundle Chart only if there's data in topBundles */}
            {topBundles.length > 0 && (
              <Grid item xs={12} md={6}>
                {" "}
                {/* Changed to md={6} for 50% width */}
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Chart
                    options={pieChartOptions(
                      "Distribusi Paket Paling Laku (Berdasarkan Kuantitas Terjual)",
                      topBundles.map((b) => b.name),
                      topBundles.reduce((sum, b) => sum + b.count, 0)
                    )}
                    series={topBundles.map((b) => b.count)}
                    type="pie"
                    height={450}
                    width="230%"
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>
      </div>

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={handleCloseFilterDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter Statistik Penjualan</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="store-select-label">Pilih Toko</InputLabel>
            <Select
              labelId="store-select-label"
              id="store-select"
              value={selectedStoreFilter}
              label="Pilih Toko"
              onChange={(e) => setSelectedStoreFilter(e.target.value as string)}
            >
              <MenuItem value="all">Semua Toko</MenuItem>
              {stores?.map((store) => (
                <MenuItem key={store.Id} value={store.Id}>
                  {store.Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="timeframe-select-label">
              Kurun Waktu Transaksi
            </InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={selectedTimeframe}
              label="Kurun Waktu Transaksi"
              onChange={(e) => {
                setSelectedTimeframe(e.target.value as string);
                // Clear custom dates if not selecting custom
                if (e.target.value !== "custom") {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }
              }}
            >
              <MenuItem value="all">Semua Waktu</MenuItem>
              <MenuItem value="daily">Harian</MenuItem>
              <MenuItem value="weekly">Mingguan</MenuItem>
              <MenuItem value="monthly">Bulanan</MenuItem>
              <MenuItem value="custom">Rentang Kustom</MenuItem>
            </Select>
          </FormControl>

          {selectedTimeframe === "custom" && (
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                label="Mulai Tanggal"
                type="date"
                fullWidth
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Sampai Tanggal"
                type="date"
                fullWidth
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFilterDialog}>Batal</Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Terapkan Filter
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
