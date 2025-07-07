import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  MenuItem,
  IconButton,
  Dialog, // Import Dialog
  DialogTitle, // Import DialogTitle
  DialogContent, // Import DialogContent
  DialogActions, // Import DialogActions
} from "@mui/material";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { GetProduct } from "../../../../hooks/useQuery/GetProduct";
import { CreateBundle } from "../../../../hooks/useMutation/PostDiskon";
import DashboardLayout from "../../../../component/template/DashboardLayout";

import placeholderImage from "../../../../assets/bundle.png"; // Your image
import successImage from "../../../../assets/bundlepassed.jpg"; // Example image for success dialog
import errorImage from "../../../../assets/bundleallert.png"; // Example image for error dialog

import { ArrowBack } from "@mui/icons-material";

export const Route = createFileRoute(
  "/dashboard/master-user/product/creatediscount"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: products, isLoading: productsLoading } = GetProduct();
  const mutation = CreateBundle();

  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    DiscountPercentage: 0,
    imageFile: null as File | null,
    imagePreviewUrl: null as string | null,
    StartDate: "",
    EndDate: "",
    Items: [] as { ProductId: string; Quantity: number }[],
  });

  // State for the success/error dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    message: string;
    image: string;
  } | null>(null);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          imageFile: file,
          imagePreviewUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        imageFile: null,
        imagePreviewUrl: null,
      }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageFile: null,
      imagePreviewUrl: null,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.Items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, Items: updatedItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      Items: [...prev.Items, { ProductId: "", Quantity: 1 }],
    }));
  };

  const removeItem = (index: number) => {
    const updatedItems = [...formData.Items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({ ...prev, Items: updatedItems }));
  };

  const isFormValid = useMemo(() => {
    const { Name, Description, DiscountPercentage, StartDate, EndDate, Items } =
      formData;

    if (!Name.trim() || !Description.trim() || DiscountPercentage <= 0) {
      return false;
    }

    if (!StartDate || !EndDate) {
      return false;
    }

    const start = new Date(StartDate);
    const end = new Date(EndDate);
    if (start > end) {
      return false;
    }

    if (Items.length === 0) {
      return false;
    }
    const allItemsValid = Items.every(
      (item) => item.ProductId && item.Quantity > 0
    );
    if (!allItemsValid) {
      return false;
    }

    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      alert(
        "Please fill in all required fields and ensure product quantities are valid."
      );
      return;
    }

    const bundleData = new FormData();
    bundleData.append("Name", formData.Name);
    bundleData.append("Description", formData.Description);
    bundleData.append(
      "DiscountPercentage",
      String(formData.DiscountPercentage)
    );
    bundleData.append("StartDate", formData.StartDate);
    bundleData.append("EndDate", formData.EndDate);
    formData.Items.forEach((item, index) => {
      bundleData.append(`Items[${index}].ProductId`, item.ProductId);
      bundleData.append(`Items[${index}].Quantity`, String(item.Quantity));
    });

    if (formData.imageFile) {
      bundleData.append("Image", formData.imageFile);
    }

    try {
      await mutation.mutateAsync(bundleData); // Use mutateAsync to await the promise
      setDialogContent({
        title: "Success!",
        message: "Data Bundle created successfully.",
        image: successImage, // Path to your success image
      });
    } catch (error: any) {
      setDialogContent({
        title: "Error!",
        message: `Failed to create Data Bundle: ${error.message || "Unknown error"}`,
        image: errorImage, // Path to your error image
      });
    } finally {
      setOpenDialog(true); // Open the dialog after success or error
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogContent(null); // Clear dialog content on close
  };

  return (
    <DashboardLayout>
      <Box p={4} sx={{ backgroundColor: "#fff ", minHeight: "100vh" }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/dashboard/master-user/product/discount"
            startIcon={<ArrowBack />}
            sx={{ color: "#000", textTransform: "none", fontWeight: "bold" }}
          >
            Back
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            fontWeight="bold"
            sx={{ color: "text.primary" }}
          >
            <Box
              component="span"
              sx={{ borderLeft: "15px solid #FFD100", pl: 1, mr: 1 }}
            ></Box>
            New Data Bundle
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ ml: 2.5, color: "text.secondary" }}
          >
            Input Bundle
          </Typography>
        </Box>

        <Box display="flex" gap={4} alignItems="flex-start">
          <Box
            sx={{
              flexShrink: 0,
              width: "40%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <img
              src={placeholderImage}
              alt="Decorative illustration"
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
          </Box>

          <Card
            sx={{
              flexGrow: 1,
              width: "70%",
              borderRadius: "30px",
              boxShadow: "0 8px 12px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ mb: 6, fontWeight: "bold" }}
              >
                Buat Bundle Diskon
              </Typography>
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <TextField
                    label="Nama Bundle"
                    variant="outlined"
                    fullWidth
                    value={formData.Name}
                    onChange={(e) => handleChange("Name", e.target.value)}
                    sx={{
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD100",
                      },
                    }}
                  />
                  <TextField
                    label="Deskripsi"
                    variant="outlined"
                    fullWidth
                    multiline
                    minRows={3}
                    value={formData.Description}
                    onChange={(e) =>
                      handleChange("Description", e.target.value)
                    }
                    sx={{
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD100",
                      },
                    }}
                  />
                  <TextField
                    label="Persentase Diskon (%)"
                    variant="outlined"
                    fullWidth
                    type="number"
                    value={formData.DiscountPercentage}
                    onChange={(e) =>
                      handleChange("DiscountPercentage", Number(e.target.value))
                    }
                    sx={{
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD100",
                      },
                    }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        bgcolor: "#FFD100",
                        color: "#000",
                        "&:hover": { bgcolor: "#e6bb00" },
                        border: "1px solid #FFD100",
                      }}
                    >
                      Upload Gambar
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    {formData.imagePreviewUrl ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <img
                          src={formData.imagePreviewUrl}
                          alt="Preview"
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                        <Typography variant="body2">
                          {formData.imageFile?.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={removeImage}
                          color="error"
                        >
                          X
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        No image selected
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    label="Tanggal Mulai"
                    variant="outlined"
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.StartDate}
                    onChange={(e) => handleChange("StartDate", e.target.value)}
                    sx={{
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD100",
                      },
                    }}
                  />
                  <TextField
                    label="Tanggal Berakhir"
                    variant="outlined"
                    fullWidth
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.EndDate}
                    onChange={(e) => handleChange("EndDate", e.target.value)}
                    sx={{
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD100",
                      },
                    }}
                  />

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      sx={{ fontWeight: "bold", mb: 2 }}
                    >
                      Produk dalam Bundle
                    </Typography>

                    {productsLoading && <CircularProgress size={24} />}
                    {!productsLoading &&
                      formData.Items.map((item, index) => (
                        <Box
                          key={index}
                          display="flex"
                          gap={2}
                          alignItems="center"
                          mb={2}
                          sx={{
                            p: 1.5,
                            border: "1px solid #FFD100",
                            borderRadius: "8px",
                            backgroundColor: "#fffbe6",
                          }}
                        >
                          <TextField
                            select
                            label="Produk"
                            value={item.ProductId}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "ProductId",
                                e.target.value
                              )
                            }
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{
                              ".MuiOutlinedInput-notchedOutline": {
                                borderColor: "#FFD100",
                              },
                            }}
                          >
                            {products?.map((product: any) => (
                              <MenuItem key={product.Id} value={product.Id}>
                                {product.Name}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            label="Jumlah"
                            type="number"
                            value={item.Quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "Quantity",
                                Number(e.target.value)
                              )
                            }
                            sx={{
                              width: 100,
                              ".MuiOutlinedInput-notchedOutline": {
                                borderColor: "#FFD100",
                              },
                            }}
                            variant="outlined"
                            size="small"
                          />
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeItem(index)}
                            sx={{
                              borderColor: "#f44336",
                              color: "#f44336",
                              "&:hover": {
                                backgroundColor: "rgba(244, 67, 54, 0.04)",
                                borderColor: "#d32f2f",
                              },
                            }}
                          >
                            Hapus
                          </Button>
                        </Box>
                      ))}

                    <Button
                      onClick={addItem}
                      variant="contained"
                      sx={{
                        mt: 1,
                        bgcolor: "#FFD100",
                        color: "#000",
                        "&:hover": { bgcolor: "#e6bb00" },
                      }}
                    >
                      Tambah Produk
                    </Button>
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={mutation.isPending || !isFormValid}
                    sx={{
                      mt: 3,
                      p: 1.5,
                      bgcolor: "#ffD500",
                      color: "#fff",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "#ffD500" },
                    }}
                  >
                    {mutation.isPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Simpan Bundle"
                    )}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* Material-UI Alert Dialog with Image */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          {dialogContent && (
            <>
              <DialogTitle id="alert-dialog-title">
                {dialogContent.title}
              </DialogTitle>
              <DialogContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  p: 4,
                }}
              >
                <img
                  src={dialogContent.image}
                  alt="Dialog Illustration"
                  style={{
                    maxWidth: "500px",
                    height: "auto",
                    marginBottom: "60px",
                  }}
                />
                <Typography
                  id="alert-dialog-description"
                  variant="body1"
                  align="center"
                >
                  {dialogContent.message}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleCloseDialog}
                  autoFocus
                  sx={{ color: "#093FB4" }}
                >
                  OK
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
