import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, TextField, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import signupBanner from "/images/login_banner.jpg";
import { oauthSignup } from "../api/login";
import successIcon from "/images/success.gif";
import GitHubIcon from "@mui/icons-material/GitHub";

const SuccessMessage = () => (
  <Box className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
    <Box className="text-center">
      <img src={successIcon} alt="Success" className="w-20 h-20 mx-auto mb-4" />
      <Typography variant="h5" className="font-bold mb-2">
        Account created successfully!
      </Typography>
      <Typography variant="body1" className="text-gray-600">
        Redirecting to login page...
      </Typography>
    </Box>
  </Box>
);

function OauthSignup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    const email = urlParams.get("email");
    const token = urlParams.get("token");

    if (username && email && token) {
      setFormData((prev) => ({
        ...prev,
        username,
        email,
        token,
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      const response = await oauthSignup(
        formData.username,
        formData.email,
        formData.password,
        token
      );

      if (response.status === 201) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.response?.data || "Failed to create account");
      }
    } catch (error) {
      setError(error.response.data || "Failed to create account");
      console.error("Error during signup:", error);
    }
  };

  return (
    <Box className="flex h-screen">
      <Grid container className="h-full">
        {showSuccess && <SuccessMessage />}
        {/* Left side - Signup Form */}
        <Grid
          item
          xs={12}
          md={5}
          className="p-8 flex flex-col justify-center relative overflow-hidden bg-white"
        >
          <Box className="max-w-md mx-auto">
            <Typography variant="h4" className="font-bold mb-2 text-purple-600">
              Complete your account
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              Please set a password for your account.
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={formData.username}
                disabled
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={formData.email}
                disabled
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="Create a password"
                error={!!error}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                placeholder="Confirm your password"
                error={!!error}
                helperText={error}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="bg-purple-600 hover:bg-purple-800 normal-case py-3"
              >
                <i className="fab fa-github mr-2"></i>
                Complete Sign up
              </Button>
            </form>
          </Box>
        </Grid>

        {/* Right side - Banner */}
        <Grid item xs={12} md={7} className="relative">
          <Box
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${signupBanner})`,
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

export default OauthSignup;
