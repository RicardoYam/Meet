import React from "react";
import TopNav from "./TopNav";
import LeftNav from "./LeftNav";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(
    location.pathname
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNav />
      <LeftNav />
      <Box
        sx={{
          marginLeft: "256px",
          marginTop: "64px",
          minHeight: "calc(100vh - 64px)",
          bgcolor: "background.default",
        }}
      >
        {children}
      </Box>
    </>
  );
}

export default Layout;
