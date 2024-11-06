import React, { useState } from "react";
import {
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import DraftsIcon from "@mui/icons-material/Drafts";
import PasswordIcon from "@mui/icons-material/Password";
import { useNavigate } from "react-router-dom";
import { sendVerificationCode, codeMatch, changePassword } from "../api/login";

const steps = ["Enter Email", "Verify Code", "Reset Password"];

const ForgotPassword = () => {
  const [stage, setStage] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await sendVerificationCode(email);
      if (response.status === 200) {
        setStage(1);
      } else {
        setError(response.data.message || "Failed to send verification code");
      }
    } catch (error) {
      setError("We can't find your email. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setError("");
    try {
      const response = await codeMatch(email, code.join(""));
      if (response.status === 200) {
        setStage(2);
      } else {
        setError(response.data.message || "Invalid verification code");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleSetNewPassword = async () => {
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await changePassword(email, newPassword);
      if (response.status === 200) {
        setStage(3);
      } else {
        setError(response.data.message || "Failed to change password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleCodeChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const renderStage = () => {
    switch (stage) {
      case 0:
        return (
          <>
            <Box className="flex justify-center mb-6">
              <MailOutlineIcon style={{ fontSize: 50, color: "#6B46C1" }} />
            </Box>
            <Typography variant="h4" className="font-bold mb-2 text-center">
              Forgot password?
            </Typography>
            <Typography
              variant="body1"
              className="text-gray-600 mb-6 text-center"
            >
              Enter your email for instructions.
            </Typography>
            <TextField
              fullWidth
              label="Enter your email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendCode}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 py-3 mb-4"
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send 6-digit code"
              )}
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Box className="flex justify-center mb-6">
              <DraftsIcon style={{ fontSize: 50, color: "#6B46C1" }} />
            </Box>
            <Typography variant="h4" className="font-bold mb-2">
              Enter your code
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              We sent a code to {email}
            </Typography>
            <Box className="flex justify-between mb-4">
              {code.map((digit, index) => (
                <TextField
                  key={index}
                  id={`code-${index}`}
                  variant="outlined"
                  value={digit}
                  onChange={(e) =>
                    handleCodeChange(index, e.target.value.slice(0, 1))
                  }
                  className="w-12"
                  inputProps={{ maxLength: 1 }}
                />
              ))}
            </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyCode}
              className="bg-purple-600 hover:bg-purple-700 py-3 mb-4"
            >
              Verify code
            </Button>
            <Typography variant="body2" className="text-center">
              Didn't receive the code?{" "}
              <span
                className="text-purple-600 cursor-pointer"
                onClick={handleSendCode}
              >
                Click to resend
              </span>
            </Typography>
          </>
        );
      case 2:
        return (
          <>
            <Box className="flex justify-center mb-6">
              <PasswordIcon style={{ fontSize: 50, color: "#6B46C1" }} />
            </Box>
            <Typography variant="h4" className="font-bold mb-2">
              Set new password
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              Must be at least 8 characters.
            </Typography>
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mb-4"
            />
            <TextField
              fullWidth
              label="Confirm password"
              variant="outlined"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-4"
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSetNewPassword}
              className="bg-purple-600 hover:bg-purple-700 py-3"
            >
              Set new password
            </Button>
          </>
        );
      case 3:
        return (
          <>
            <Typography variant="h4" className="font-bold mb-2">
              All done!
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              Your password has been reset. Would you like to login?
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/login")}
              className="border-purple-600 text-purple-600 hover:bg-purple-50 py-3"
            >
              Login now
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box className="flex flex-col min-h-screen w-full bg-white">
      <Box className="w-full py-2">
        <IconButton
          className="absolute top-2 left-2"
          onClick={() => navigate("/login")}
          aria-label="back to login"
        >
          <ArrowBackIcon />
        </IconButton>
        <Stepper
          activeStep={stage}
          alternativeLabel
          className="max-w-sm mx-auto pt-2"
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  style: {
                    color:
                      stage === steps.indexOf(label) ? "#6B46C1" : "#d1c4e9",
                    width: "24px",
                    height: "24px",
                  },
                }}
              >
                <Typography className="text-black text-sm">{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box className="flex-grow flex items-center justify-center relative">
        <Box className="w-full max-w-md px-6 py-12 mx-auto">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          {renderStage()}
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
