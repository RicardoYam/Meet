import React from "react";
import TopNav from "./TopNav";
import LeftNav from "./LeftNav";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

function Layout({ children }) {
  const location = useLocation();

  // List of routes where we don't want to show navigation
  const noNavRoutes = ["/login", "/signup"];
  const shouldShowNav = !noNavRoutes.includes(location.pathname);

  return (
    <Box>
      {shouldShowNav && <TopNav />}
      {shouldShowNav && <LeftNav />}
      <Box className={shouldShowNav ? "pl-64 pt-16" : ""}>{children}</Box>
    </Box>
  );
}

export default Layout;
