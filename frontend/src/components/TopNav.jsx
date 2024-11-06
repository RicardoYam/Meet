import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Avatar from "@mui/material/Avatar";
import StoreIcon from "@mui/icons-material/Store";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { getProfile } from "../api/user";

function TopNav() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const username =
      sessionStorage.getItem("username") || localStorage.getItem("username");
    if (username) {
      getProfile(username)
        .then((response) => {
          if (response.status === 200) {
            setUserProfile(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setUserProfile(null);
    handleMenuClose();
    navigate("/login");
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate(`/profile`);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "white",
        color: "black",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "none",
        zIndex: 1200,
      }}
    >
      <Toolbar className="justify-between">
        {/* Left side */}
        <Box className="flex items-center">
          <Typography
            variant="h6"
            component={Link}
            to="/"
            className="text-black font-bold mr-4 no-underline"
          >
            Meet
          </Typography>
        </Box>

        {/* Right side */}
        <Box className="flex items-center">
          <Box className="flex bg-gray-100 rounded-full px-3 py-1 mr-4 items-center">
            <SearchIcon className="text-gray-500 mr-2" />
            <InputBase
              placeholder="Search…"
              className="text-sm"
              inputProps={{ "aria-label": "search" }}
            />
          </Box>
          {userProfile ? (
            <>
              <IconButton color="inherit">
                <MailOutlineIcon />
              </IconButton>
              <IconButton color="inherit">
                <NotificationsNoneIcon />
              </IconButton>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <Avatar
                  alt={userProfile.name}
                  src={
                    userProfile.avatar ||
                    `https://ui-avatars.com/api/?name=${userProfile.name}&background=4284f5&color=fff`
                  }
                />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                    mt: 1.5,
                    "& .MuiAvatar-root": {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: "background.paper",
                      transform: "translateY(-50%) rotate(45deg)",
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem onClick={handleProfileClick}>
                  <Avatar
                    alt={userProfile.name}
                    src={
                      userProfile.avatar ||
                      `https://ui-avatars.com/api/?name=${userProfile.name}&background=4284f5&color=fff`
                    }
                  />
                  <Box ml={1}>
                    <Typography variant="subtitle1">
                      {userProfile.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {localStorage.getItem("email") ||
                        sessionStorage.getItem("email")}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Log Out</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={handleLogin}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopNav;
