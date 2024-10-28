import React from "react";
import { Box } from "@mui/material";
import TopNav from "./TopNav";
import { useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();
  const noNavPaths = ["/login", "/signup", "/forgot-password"];
  const showNav = !noNavPaths.includes(location.pathname);

  return (
    <Box className="flex flex-col min-h-screen">
      {showNav && <TopNav />}
      <Box component="main" className="flex-grow bg-gray-100">
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
