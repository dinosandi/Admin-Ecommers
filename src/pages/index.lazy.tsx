import { useState } from "react";
import { CreateLogin } from "../hooks/useMutation/LoginAdmin";
import { FormCreateLogin } from "../Types";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import loginImage from "../assets/logo1.png";
import logoLogin from "../assets/admin.png"

export const Route = createLazyFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const [form, setForm] = useState<FormCreateLogin>({
    email: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { mutate, isPending } = CreateLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    mutate(form, {
      onSuccess: (data) => {
        if (data?.Token) {
          const userObject = {
            email: data.Email,
            role: data.Role,
            userId: data.UserId,
          };

          localStorage.setItem("token", data.Token);
          localStorage.setItem("user", JSON.stringify(userObject));

          setTimeout(() => navigate({ to: "/dashboard" }), 1500);
        } else {
          setErrorMessage("Login gagal. Token tidak ditemukan.");
        }
      },
      onError: (err: any) => {
        const message =
          err?.response?.data?.message || "Login gagal. Coba lagi.";
        setErrorMessage(message);
      },
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flex: 1,
          backgroundImage: `url(${loginImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Right Login Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f6fa",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: 600,
            borderRadius: 4,
            backgroundColor: "#FFD500",
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
    <img
      src={logoLogin}
      alt="Login Logo"
      style={{ width: "120px", height: "120px", objectFit: "contain" }}
    />
  </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Selamat Datang Di Admin Panel
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username/Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ style: { borderRadius: 50, backgroundColor: "#fff" } }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ style: { borderRadius: 50, backgroundColor: "#fff" } }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                py: 1.5,
                borderRadius: 50,
                backgroundColor: "#000", // Dark blue button
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
              disabled={isPending}
            >
              {isPending ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>

            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {successMessage}
              </Alert>
            )}
          </form>
        </Paper>
      </Box>
    </Box>
  );
}
