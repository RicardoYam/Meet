import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Typography, Button, TextField, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import signupBanner from "/images/login_banner.jpg";
import { signup } from "../api/login";
import successIcon from "/images/success.gif";

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

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(name, email, password);
      if (response.status === 201) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error(error);
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
              Create account
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              Join our 100% free creative network.
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
              />
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={email !== "" && !/\S+@\S+\.\S+/.test(email)}
                helperText={
                  email !== "" && !/\S+@\S+\.\S+/.test(email)
                    ? "Please enter a valid email address"
                    : ""
                }
                required
                placeholder="Enter your email"
              />
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="bg-purple-600 hover:bg-purple-800 normal-case py-3"
              >
                Sign up
              </Button>
            </form>

            <Typography variant="body2" className="mt-4 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Log in
              </Link>
            </Typography>
          </Box>
        </Grid>

        {/* Right side - Signup Banner */}
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

export default Signup;
