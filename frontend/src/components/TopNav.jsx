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
  Popover,
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
import { getPostsBySearchTerm } from "../api/blog";

function TopNav() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);

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

  const handleSearch = async (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    setAnchorEl(event.currentTarget);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.trim()) {
      const newTimeout = setTimeout(async () => {
        try {
          const response = await getPostsBySearchTerm(value);
          if (response.status === 200) {
            setSearchResults(response.data.content || []);
          }
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        }
      }, 300);
      setSearchTimeout(newTimeout);
    } else {
      setSearchResults([]);
    }
  };

  const handleCloseSearch = () => {
    setAnchorEl(null);
    setSearchResults([]);
  };

  const handleResultClick = (postId) => {
    navigate(`/posts/${postId}`);
    handleCloseSearch();
    setSearchTerm("");
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
      <Toolbar className="justify-between gap-3">
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            maxWidth: { xs: "90%", sm: "70%", md: "50%" },
            margin: "0 auto",
            position: "relative",
          }}
        >
          <Box
            className="flex bg-gray-100 rounded-full px-3 py-1 items-center relative"
            sx={{ width: "100%" }}
          >
            <SearchIcon className="text-gray-500 mr-2" />
            <InputBase
              placeholder="Search…"
              className="text-sm"
              value={searchTerm}
              onChange={handleSearch}
              inputProps={{ "aria-label": "search" }}
              sx={{ width: "100%" }}
            />

            <Popover
              open={Boolean(anchorEl) && searchResults?.length > 0}
              anchorEl={anchorEl}
              onClose={handleCloseSearch}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                sx: {
                  width: { xs: "60%", sm: "70%", md: "50%" },
                  mt: 1,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  borderRadius: "10px",
                  position: "fixed",
                },
              }}
            >
              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {searchResults?.map((result) => (
                  <Box
                    key={result.id}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                      borderBottom: "1px solid #eee",
                    }}
                    onClick={() => handleResultClick(result.id)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar
                        src={
                          result.avatar ||
                          `https://ui-avatars.com/api/?name=${result.author}&background=4284f5&color=fff`
                        }
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {result.author[0].toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2">
                        {result.author}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {result.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Popover>
          </Box>
        </Box>

        <Box className="flex items-center">
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
