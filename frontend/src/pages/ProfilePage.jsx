import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import PostCard from "../components/PostCard";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import {
  getProfile,
  updateAvatar,
  updateBanner,
  followUser,
  unfollowUser,
  updateProfile,
} from "../api/user";

const generateRandomGradient = () => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const ProfilePage = () => {
  const { username: profileUsername } = useParams();
  const [gradient, setGradient] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);
  const navigate = useNavigate();
  const bannerInputRef = useRef(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    bio: "",
  });

  const currentUsername =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  const isCurrentUser = !profileUsername || profileUsername === currentUsername;

  const targetUsername = isCurrentUser ? currentUsername : profileUsername;

  useEffect(() => {
    setGradient(generateRandomGradient());

    const fetchProfile = async () => {
      try {
        if (currentUsername && !isCurrentUser) {
          const [profileResponse, currentUserResponse] = await Promise.all([
            getProfile(targetUsername),
            getProfile(currentUsername),
          ]);

          if (profileResponse.status === 200) {
            setUserProfile(profileResponse.data);
            setAvatarUrl(
              profileResponse.data.avatar ||
                `https://ui-avatars.com/api/?name=${profileResponse.data.name}&background=4284f5&color=fff`
            );
            setBannerUrl(profileResponse.data.banner);

            if (currentUserResponse?.data) {
              const following = currentUserResponse.data.following || [];
              setIsFollowing(
                following.some((user) => user.id === profileResponse.data.id)
              );
            }
          }
        } else {
          const profileResponse = await getProfile(targetUsername);

          if (profileResponse.status === 200) {
            setUserProfile(profileResponse.data);
            setAvatarUrl(
              profileResponse.data.avatar ||
                `https://ui-avatars.com/api/?name=${profileResponse.data.name}&background=4284f5&color=fff`
            );
            setBannerUrl(profileResponse.data.banner);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (targetUsername) {
      fetchProfile();
    }
  }, [targetUsername, currentUsername, isCurrentUser]);

  const handleAvatarClick = () => {
    if (isCurrentUser) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const response = await updateAvatar(userProfile.id, file);
        if (response.status === 200) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setAvatarUrl(reader.result);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    }
  };

  const handleBannerChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const response = await updateBanner(userProfile.id, file);
        if (response.status === 200) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setBannerUrl(reader.result);
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Error updating banner:", error);
      }
    }
  };

  const handleFollowToggle = async () => {
    const currentUserId =
      localStorage.getItem("id") || sessionStorage.getItem("id");

    try {
      if (isFollowing) {
        await unfollowUser(currentUserId, userProfile.id);
        setIsFollowing(false);
      } else {
        await followUser(currentUserId, userProfile.id);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    setEditFormData({
      username: userProfile.name,
      bio: userProfile.bio || "",
    });
    setOpenEditDialog(true);
    handleMenuClose();
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
  };

  const handleFormChange = (event) => {
    setEditFormData({
      ...editFormData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await updateProfile({
        userId: sessionStorage.getItem("id") || localStorage.getItem("id"),
        username: editFormData.username,
        bio: editFormData.bio,
      });

      if (response.status === 200) {
        setUserProfile({
          ...userProfile,
          name: editFormData.username,
          bio: editFormData.bio,
        });
        handleEditClose();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading || !userProfile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box
        height={200}
        style={{
          background: bannerUrl ? `url(${bannerUrl}) center/cover` : gradient,
          position: "relative",
        }}
      >
        {isCurrentUser && (
          <>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                backgroundColor: "white",
                "&:hover": { backgroundColor: "#f5f5f5" },
                padding: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onClick={() => bannerInputRef.current.click()}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              style={{ display: "none" }}
              accept="image/*"
            />
          </>
        )}

        <Box
          sx={{
            position: "absolute",
            left: "20%",
            bottom: "-60px",
            transform: "translateX(-50%)",
            zIndex: 2,
          }}
        >
          <Box position="relative">
            <Avatar
              src={avatarUrl}
              sx={{
                width: 120,
                height: 120,
                border: "4px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            {isCurrentUser && (
              <>
                <IconButton
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                    padding: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                  onClick={handleAvatarClick}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  accept="image/*"
                />
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box maxWidth="1200px" margin="auto" px={3} pt={6}>
        <Box
          sx={{
            display: "flex",
            gap: 3,
            mt: "60px",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                  {userProfile.name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {!isCurrentUser && currentUsername && (
                  <Button
                    variant="outlined"
                    onClick={handleFollowToggle}
                    sx={{
                      borderRadius: "20px",
                      textTransform: "none",
                      minWidth: "100px",
                      color: "#9333ea",
                      borderColor: "#9333ea",
                      "&:hover": {
                        borderColor: "#891fed",
                        backgroundColor: "#f5d7fc",
                      },
                    }}
                  >
                    {isFollowing ? "Following" : "+ Follow"}
                  </Button>
                )}
                {isCurrentUser && (
                  <IconButton onClick={handleMenuClick}>
                    <MoreHorizIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {isCurrentUser && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {localStorage.getItem("email") ||
                  sessionStorage.getItem("email")}
              </Typography>
            )}
            {userProfile.bio ? (
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {userProfile.bio}
              </Typography>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  color: "text.secondary",
                  lineHeight: 1.5,
                  fontStyle: "italic",
                }}
              >
                Oops, no bio written
              </Typography>
            )}

            <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {userProfile.follower?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  followers
                </Typography>
              </Box>
              <Typography color="text.secondary">|</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography variant="body2" fontWeight="bold">
                  {userProfile.following?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  following
                </Typography>
              </Box>
              <Typography color="text.secondary">|</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Joined{" "}
                  {new Date(userProfile.createdTime).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Box
                sx={{
                  backgroundColor: "#f3f0ff",
                  borderRadius: "12px",
                  p: 2,
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {userProfile.totalUpVotes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Likes
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#e8f4ff",
                  borderRadius: "12px",
                  p: 2,
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {userProfile.totalComments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comments
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#e6fffa",
                  borderRadius: "12px",
                  p: 2,
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {userProfile.blogs?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Posts
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Posts
          </Typography>

          {loading ? (
            // Loading animation
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : userProfile.blogs?.length > 0 ? (
            // Posts content
            userProfile.blogs.map((post, index) => (
              <React.Fragment key={post.id}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  author={userProfile.name}
                  avatar={userProfile.avatar}
                  categories={post.categories}
                  tags={post.tags}
                  upVotes={post.upVotes}
                  comments={post.comments.length}
                  createdTime={post.createdTime}
                />
                {index < userProfile.blogs.length - 1 && (
                  <Divider sx={{ my: 4 }} />
                )}
              </React.Fragment>
            ))
          ) : (
            // No content message
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
                color: "text.secondary",
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
              }}
            >
              <Typography>No posts yet</Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isCurrentUser && (
          <MenuItem onClick={handleEditClick}>Edit Profile</MenuItem>
        )}
      </Menu>

      <Dialog open={openEditDialog} onClose={handleEditClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.username}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="bio"
            label="Bio"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editFormData.bio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
