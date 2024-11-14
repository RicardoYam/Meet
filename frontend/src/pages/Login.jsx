import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  TextField,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import loginBanner from "/images/login_banner.jpg";
import { login } from "../api/login";
import { FormControlLabel, Checkbox } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

function Login() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const username = urlParams.get("username");
    const userId = urlParams.get("userId");
    const email = urlParams.get("email");

    if (token && username && userId && email) {
      sessionStorage.setItem("token", `Bearer ${token}`);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("id", userId);
      sessionStorage.setItem("email", email);

      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await login(account, password);
      if (response.status === 200) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(
          "token",
          response.data.tokenType + " " + response.data.token
        );
        storage.setItem("username", response.data.username);
        storage.setItem("id", response.data.userId);
        storage.setItem("email", response.data.email);
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError("Invalid username or password");
            break;
          case 404:
            setError("Account not found");
            break;
          default:
            setError("An error occurred during login. Please try again.");
        }
      } else if (error.request) {
        setError("Unable to connect to the server. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  return (
    <Box className="flex h-screen w-screen">
      <Grid container className="h-full">
        {/* Left side - Login Form */}
        <Grid
          item
          xs={12}
          md={5}
          className="p-8 flex flex-col justify-center relative overflow-hidden bg-white"
        >
          <Box className="max-w-md mx-auto w-full relative z-10">
            <Typography variant="h4" className="font-bold mb-2 text-purple-600">
              Welcome
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              Log in to access our discussion boards
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                placeholder="Enter your name or email address"
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />

              <div className="flex justify-between items-center">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                  }
                  label="Remember me"
                />
                <Link
                  to="/forgot-password"
                  className="text-gray-600 no-underline hover:text-gray-800"
                >
                  Forgot password?
                </Link>
              </div>
              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="bg-purple-600 text-white hover:bg-purple-800 normal-case py-3"
              >
                Log in
              </Button>

              {/* Divider with text */}
              <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2 }}
                >
                  Or continue with
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              {/* GitHub button */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleGitHubLogin}
                sx={{
                  py: 1.5,
                  color: "#24292e",
                  borderColor: "#24292e",
                  "&:hover": {
                    borderColor: "#24292e",
                    backgroundColor: "rgba(36, 41, 46, 0.04)",
                  },
                  display: "flex",
                  gap: 2,
                  textTransform: "none",
                }}
                startIcon={<GitHubIcon />}
              >
                GitHub
              </Button>
            </form>

            <Typography
              variant="body2"
              className="mt-4 text-center text-gray-600"
            >
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500 hover:underline">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Grid>

        {/* Right side - Login Banner */}
        <Grid item xs={12} md={7} className="relative">
          <Box
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${loginBanner})`,
            }}
          >
            <Box className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-12 text-white">
              <Typography variant="h4" className="font-bold mb-4">
                Join the world's largest network
              </Typography>
              <Typography variant="h5" className="mb-6">
                of designers and digital creatives
              </Typography>
              <Box className="flex space-x-4">
                <Button
                  variant="outlined"
                  className="normal-case text-white border-white"
                >
                  Join and get inspired
                </Button>
                <Button
                  variant="outlined"
                  className="normal-case text-white border-white"
                >
                  Share your work
                </Button>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Login;
