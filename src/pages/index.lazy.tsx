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
  Link,
} from "@mui/material";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

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

          setSuccessMessage("Login berhasil. Mengarahkan ke dashboard...");
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
    <Box className="flex items-center justify-center min-h-screen bg-gray-100">
      <Paper elevation={4} className="w-full max-w-md p-8 rounded-lg bg-white">
        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Selamat Datang
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Silakan login untuk melanjutkan
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isPending}
            sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
          >
            {isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
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

        <Typography variant="body2" textAlign="right" mt={1}>
          <Link href="/ForgotPassword" underline="hover" color="primary">
            Lupa Password?
          </Link>
        </Typography>
        <Typography variant="body2" textAlign="center" mt={3}>
          Belum punya akun?{" "}
          <Link href="/register" underline="hover">
            Daftar di sini
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
