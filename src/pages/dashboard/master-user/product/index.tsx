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
  CircularProgress,
  Button,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  FirstPage,
  LastPage,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Edit,
  Add,
  Delete,
} from "@mui/icons-material";
import { useState, forwardRef } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  LinkProps,
} from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../../config/api";
import { GetProduct } from "../../../../hooks/useQuery/GetProduct";
import DashboardLayout from "../../../../component/template/DashboardLayout";
import { GetCategory } from "../../../../hooks/useQuery/GetCategory";
import { AssignProductToCategory } from "../../../../hooks/useMutation/PostCategori";

export const Route = createFileRoute("/dashboard/master-user/product/")({
  component: ProductPage,
});

interface Category {
  Id: string;
  Name: string;
}

interface Product {
  Id: string;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  ImageUrl: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
  Categories: Category[];
}

interface FormCreaCategory {
  name: string;
}

const RouterLink = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link {...props} ref={ref} />
));

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5230";

const getImageUrl = (path: string) => {
  if (path && (path.startsWith("http://") || path.startsWith("https://"))) {
    return path;
  } else if (path?.startsWith("/uploads")) {
    const imageUrl = `${BASE_URL}${path}`;
    return imageUrl;
  }
  return "/placeholder-image.jpg";
};

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

export const DeleteProduct = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("token");

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/Products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("Produk berhasil dihapus!");
    },
    onError: (err: any) => {
      console.error(
        "Delete product failed:",
        err?.response?.data || err.message
      );
      alert(
        "Gagal menghapus produk: " +
          (err.response?.data?.message || err.message)
      );
    },
  });
};

export const CreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: FormCreaCategory) => {
      const token = localStorage.getItem("token");

      const response = await api.post("/Categories", JSON.stringify(form), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Category created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      alert("Kategori berhasil dibuat!");
    },
    onError: (error: any) => {
      console.error(
        "Failed to create category:",
        error?.response?.data || error.message
      );
      alert(
        "Gagal membuat kategori: " +
          (error?.response?.data?.message || error.message)
      );
    },
  });
};

function Row({
  product,
  onDeleteClick,
  onAssignCategoryClick,
}: {
  product: Product;
  onDeleteClick: (id: string, name: string) => void;
  onAssignCategoryClick: (productId: string, productName: string) => void;
}) {
  const [open, setOpen] = useState(false);

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
            src={getImageUrl(product.ImageUrl)}
            alt={product.Name}
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
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {product.Name}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {formatPrice(product.Price)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {product.Stock}
          </Typography>
        </TableCell>
        <TableCell>
          <span
            style={{
              backgroundColor: product.IsActive ? "#d1fae5" : "#fee2e2",
              color: product.IsActive ? "#065f46" : "#991b1b",
              padding: "4px 8px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {product.IsActive ? "Aktif" : "Tidak Aktif"}
          </span>
        </TableCell>
        <TableCell>
          {product.Categories && product.Categories.length > 0 ? (
            product.Categories.map((category, index) => (
              <span
                key={category.Id}
                style={{
                  display: "inline-block",
                  backgroundColor: "#e0f2f7",
                  color: "#01579b",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  marginRight: "4px",
                  marginBottom: "4px",
                  fontWeight: "normal",
                }}
              >
                {category.Name}
              </span>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              -
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", gap: 1, flexDirection: "row" }}>
            <IconButton
              size="small"
              color="primary"
              component={RouterLink}
              to="/dashboard/master-user/product/editproduct"
              search={{ id: product.Id.toString() }}
              title="Edit Product"
              sx={{
                bgcolor: "#2196f3",
                color: "#fff",
                "&:hover": { bgcolor: "#1976d2" },
              }}
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onAssignCategoryClick(product.Id, product.Name)}
              title="Add Category"
              sx={{
                bgcolor: "#06923E",
                color: "white",
                "&:hover": { bgcolor: "#455a64" },
              }}
            >
              <Add />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDeleteClick(product.Id, product.Name)}
              title="Delete Product"
              sx={{
                bgcolor: "#FFD100",
                color: "#fff",
                "&:hover": { bgcolor: "#FFD300" },
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography
                variant="subtitle2"
                gutterBottom
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                Deskripsi
              </Typography>
              <Typography
                variant="body2"
                sx={{ maxWidth: "600px", fontWeight: "bold" }}
              >
                {product.Description}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function ProductPage() {
  const { data: products = [], isLoading, error, refetch } = GetProduct();
  const { data: categories = [], isLoading: isLoadingCategories } =
    GetCategory();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { mutate: deleteProduct, isPending: isDeleting } = DeleteProduct();
  const { mutate: createCategory, isPending: isCreatingCategory } =
    CreateCategory();
  const { mutate: assignProductToCategory, isPending: isAssigningCategory } =
    AssignProductToCategory();

  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<string | null>(
    null
  );
  const [productNameToDelete, setProductNameToDelete] = useState<string | null>(
    null
  );

  const [openCreateCategoryDialog, setOpenCreateCategoryDialog] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [openAssignCategoryDialog, setOpenAssignCategoryDialog] =
    useState(false);
  const [productIdToAssign, setProductIdToAssign] = useState<string | null>(
    null
  );
  const [productNameToAssign, setProductNameToAssign] = useState<string | null>(
    null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const [searchName, setSearchName] = useState("");
  const [searchPrice, setSearchPrice] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  const handleDeleteClick = (id: string, name: string) => {
    setProductIdToDelete(id);
    setProductNameToDelete(name);
    setOpenConfirmDelete(true);
  };

  const handleCloseConfirmDelete = () => {
    setOpenConfirmDelete(false);
    setProductIdToDelete(null);
    setProductNameToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (productIdToDelete) {
      deleteProduct(productIdToDelete);
    }
    handleCloseConfirmDelete();
  };

  const handleOpenCreateCategoryDialog = () => {
    setOpenCreateCategoryDialog(true);
    setNewCategoryName("");
  };

  const handleCloseCreateCategoryDialog = () => {
    setOpenCreateCategoryDialog(false);
  };

  const handleCreateCategorySubmit = () => {
    if (!newCategoryName.trim()) {
      alert("Nama kategori tidak boleh kosong!");
      return;
    }
    createCategory(
      { name: newCategoryName },
      {
        onSuccess: () => {
          handleCloseCreateCategoryDialog();
        },
        onError: (err: any) => {
          console.error("Error creating category:", err);
          alert(
            "Gagal membuat kategori: " +
              (err.response?.data?.message || err.message || "Unknown error")
          );
        },
      }
    );
  };

  const handleAssignCategoryClick = (
    productId: string,
    productName: string
  ) => {
    setProductIdToAssign(productId);
    setProductNameToAssign(productName);
    setSelectedCategoryId("");
    setOpenAssignCategoryDialog(true);
  };

  const handleCloseAssignCategoryDialog = () => {
    setOpenAssignCategoryDialog(false);
    setProductIdToAssign(null);
    setProductNameToAssign(null);
    setSelectedCategoryId("");
  };

  const handleAssignCategorySubmit = () => {
    if (!productIdToAssign || !selectedCategoryId) {
      alert("Produk atau kategori belum dipilih.");
      return;
    }

    assignProductToCategory(
      { categoryId: selectedCategoryId, productId: productIdToAssign },
      {
        onSuccess: () => {
          handleCloseAssignCategoryDialog();
          queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (err: any) => {
          console.error("Error assigning product to category:", err);
          alert(
            "Gagal menambahkan produk ke kategori: " +
              (err.response?.data?.message || err.message || "Unknown error")
          );
        },
      }
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesName = product.Name.toLowerCase().includes(
      searchName.toLowerCase()
    );
    const matchesPrice =
      searchPrice === "" || product.Price.toString().includes(searchPrice);
    const matchesStatus =
      searchStatus === "" ||
      (product.IsActive ? "aktif" : "tidak aktif").includes(
        searchStatus.toLowerCase()
      );
    const matchesCategory =
      searchCategory === "" ||
      product.Categories.some((cat) =>
        cat.Name.toLowerCase().includes(searchCategory.toLowerCase())
      );
    return matchesName && matchesPrice && matchesStatus && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
          <nav
            style={{ display: "flex", alignItems: "center", padding: "0 16px" }}
          >
            <div style={{ marginRight: "20px" }}>
              <Link
                to="/dashboard/master-user/product"
                style={{
                  padding: "8px 4px",
                  borderBottom:
                    location.pathname === "/dashboard/master-user/product"
                      ? "2px solid #2563eb"
                      : "2px solid transparent",
                  fontWeight: "bold",
                  textDecoration: "none",
                  color:
                    location.pathname === "/dashboard/master-user/product"
                      ? "#2563eb"
                      : "#6B7280",
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== "/dashboard/master-user/product")
                    e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== "/dashboard/master-user/product")
                    e.currentTarget.style.color = "#6B7280";
                }}
              >
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  List Product
                </Typography>
              </Link>
            </div>

            <div style={{ marginLeft: "" }}>
              <Link
                to="/dashboard/master-user/product/discount"
                style={{
                  padding: "8px 4px",
                  borderBottom:
                    location.pathname ===
                    "/dashboard/master-user/product/discount"
                      ? "2px solid #2563eb"
                      : "2px solid transparent",
                  fontWeight: "bold",
                  textDecoration: "none",
                  color:
                    location.pathname ===
                    "/dashboard/master-user/product/discount"
                      ? "#2563eb"
                      : "#6B7280",
                }}
                onMouseEnter={(e) => {
                  if (
                    location.pathname !==
                    "/dashboard/master-user/product/discount"
                  )
                    e.currentTarget.style.color = "#374151";
                }}
                onMouseLeave={(e) => {
                  if (
                    location.pathname !==
                    "/dashboard/master-user/product/discount"
                  )
                    e.currentTarget.style.color = "#6B7280";
                }}
              >
                <Typography
                  variant="body1"
                  component="span"
                  sx={{
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                    color: "black",
                  }}
                >
                  List Diskon
                </Typography>
              </Link>
            </div>
          </nav>
        </Box>
        <Outlet />

        {location.pathname === "/dashboard/master-user/product" && (
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
                List Product
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#FFD100",
                    color: "#000",
                    "&:hover": { bgcolor: "#e6bb00" },
                    fontWeight: "bold",
                  }}
                  onClick={handleOpenCreateCategoryDialog}
                >
                  + Add Category
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#FFD100",
                    color: "#000",
                    "&:hover": { bgcolor: "#e6bb00" },
                    fontWeight: "bold",
                  }}
                  component={Link}
                  to="/dashboard/master-user/product/create"
                >
                  + Add New Product
                </Button>
              </Box>
            </Box>

            {/* Tambahkan judul pencarian di sini */}
            <Box sx={{ px: 3, pt: 2 }}>
              {" "}
              {/* Tambahkan padding horizontal dan padding atas */}
            </Box>

            <Box
              sx={{
                p: 3,
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
                bgcolor: "#FFD100",
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                label="Nama Produk"
                InputLabelProps={{ sx: { fontWeight: "bold", color: "black" } }}
                InputProps={{
                  sx: {
                    bgcolor: "white",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  },
                }}
                sx={{ flexGrow: 1, minWidth: "180px" }}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <TextField
                variant="outlined"
                size="small"
                label="Harga"
                InputLabelProps={{ sx: { fontWeight: "bold", color: "black" } }}
                InputProps={{
                  sx: {
                    bgcolor: "white",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  },
                }}
                sx={{ flexGrow: 1, minWidth: "180px" }}
                value={searchPrice}
                onChange={(e) => setSearchPrice(e.target.value)}
              />
              <TextField
                variant="outlined"
                size="small"
                label="Status"
                InputLabelProps={{ sx: { fontWeight: "bold", color: "black" } }}
                InputProps={{
                  sx: {
                    bgcolor: "white",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  },
                }}
                sx={{ flexGrow: 1, minWidth: "180px" }}
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              />
              <TextField
                variant="outlined"
                size="small"
                label="Kategori"
                InputLabelProps={{ sx: { fontWeight: "bold", color: "black" } }}
                InputProps={{
                  sx: {
                    bgcolor: "white",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  },
                }}
                sx={{ flexGrow: 1, minWidth: "180px" }}
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
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
                <Typography sx={{ fontWeight: "bold" }}>
                  Gagal memuat produk: {error.message}
                </Typography>
                <Button
                  onClick={() => refetch()}
                  variant="outlined"
                  sx={{ mt: 2, fontWeight: "bold" }}
                >
                  Coba Lagi
                </Button>
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  Tidak ada produk yang ditemukan.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table aria-label="collapsible product table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#FFD100" }}>
                      <TableCell />
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Gambar
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Nama
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Harga
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Stok
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Status
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Kategori
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Aksi
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product: Product) => (
                      <Row
                        key={product.Id}
                        product={product}
                        onDeleteClick={handleDeleteClick}
                        onAssignCategoryClick={handleAssignCategoryClick}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

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
                <FirstPage />
              </IconButton>
              <IconButton size="small" disabled>
                <KeyboardArrowLeft />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1, fontWeight: "bold" }}>
                Go to Page
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                defaultValue="1"
                sx={{
                  width: 60,
                  ".MuiInputBase-input": {
                    textAlign: "center",
                    fontWeight: "bold",
                  },
                }}
              />
              <IconButton size="small" disabled>
                <KeyboardArrowRight />
              </IconButton>
              <IconButton size="small" disabled>
                <LastPage />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ ml: 2, mr: 1, fontWeight: "bold" }}
              >
                Max
              </Typography>
              <TextField
                variant="outlined"
                size="small"
                defaultValue="0"
                sx={{
                  width: 60,
                  ".MuiInputBase-input": {
                    textAlign: "center",
                    fontWeight: "bold",
                  },
                }}
              />
            </Box>
          </Paper>
        )}
      </div>
      <Dialog
        open={openConfirmDelete}
        onClose={handleCloseConfirmDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontWeight: "bold" }}>
          {"Konfirmasi Hapus Produk"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{ fontWeight: "bold" }}
          >
            Apakah Anda yakin ingin menghapus produk "{productNameToDelete}"?
            Aksi ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfirmDelete}
            disabled={isDeleting}
            sx={{ fontWeight: "bold" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            autoFocus
            disabled={isDeleting}
            sx={{ fontWeight: "bold" }}
          >
            {isDeleting ? <CircularProgress size={24} /> : "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openCreateCategoryDialog}
        onClose={handleCloseCreateCategoryDialog}
        aria-labelledby="create-category-dialog-title"
      >
        <DialogTitle
          id="create-category-dialog-title"
          sx={{ fontWeight: "bold" }}
        >
          Tambah Kategori Baru
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: "bold" }}>
            Masukkan nama untuk kategori baru.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="category-name"
            label="Nama Kategori"
            type="text"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={isCreatingCategory}
            InputLabelProps={{ sx: { fontWeight: "bold" } }}
            InputProps={{ sx: { fontWeight: "bold" } }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCreateCategoryDialog}
            disabled={isCreatingCategory}
            sx={{ fontWeight: "bold" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleCreateCategorySubmit}
            color="primary"
            disabled={isCreatingCategory}
            sx={{ fontWeight: "bold" }}
          >
            {isCreatingCategory ? <CircularProgress size={24} /> : "Buat"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAssignCategoryDialog}
        onClose={handleCloseAssignCategoryDialog}
        aria-labelledby="assign-category-dialog-title"
      >
        <DialogTitle
          id="assign-category-dialog-title"
          sx={{ fontWeight: "bold" }}
        >
          Tambahkan Kategori ke Produk "{productNameToAssign}"
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontWeight: "bold" }}>
            Pilih kategori yang ingin ditambahkan ke produk ini.
          </DialogContentText>
          <FormControl fullWidth margin="dense">
            <InputLabel id="select-category-label" sx={{ fontWeight: "bold" }}>
              Kategori
            </InputLabel>
            <Select
              labelId="select-category-label"
              id="select-category"
              value={selectedCategoryId}
              label="Kategori"
              onChange={(e) => setSelectedCategoryId(e.target.value as string)}
              disabled={isLoadingCategories || isAssigningCategory}
              MenuProps={{ PaperProps: { sx: { fontWeight: "bold" } } }}
              sx={{ fontWeight: "bold" }}
            >
              {isLoadingCategories ? (
                <MenuItem disabled sx={{ fontWeight: "bold" }}>
                  Memuat kategori...
                </MenuItem>
              ) : categories.length === 0 ? (
                <MenuItem disabled sx={{ fontWeight: "bold" }}>
                  Tidak ada kategori tersedia
                </MenuItem>
              ) : (
                categories.map((category: Category) => (
                  <MenuItem
                    key={category.Id}
                    value={category.Id}
                    sx={{ fontWeight: "bold" }}
                  >
                    {category.Name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseAssignCategoryDialog}
            disabled={isAssigningCategory}
            sx={{ fontWeight: "bold" }}
          >
            Batal
          </Button>
          <Button
            onClick={handleAssignCategorySubmit}
            color="primary"
            disabled={isAssigningCategory || !selectedCategoryId}
            sx={{ fontWeight: "bold" }}
          >
            {isAssigningCategory ? <CircularProgress size={24} /> : "Tambahkan"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
