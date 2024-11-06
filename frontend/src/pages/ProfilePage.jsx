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
} from "@mui/material";
import PostCard from "../components/PostCard";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import { getProfile, updateAvatar } from "../api/user";

const generateRandomGradient = () => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const ProfilePage = () => {
  const { username: profileUsername } = useParams(); // Get username from URL
  const [gradient, setGradient] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();

  // Get current user's username
  const currentUsername =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  // Determine if this is the current user's profile
  const isCurrentUser = !profileUsername || profileUsername === currentUsername;

  // Use the appropriate username for fetching profile
  const targetUsername = isCurrentUser ? currentUsername : profileUsername;

  useEffect(() => {
    setGradient(generateRandomGradient());

    const fetchProfile = async () => {
      try {
        const response = await getProfile(targetUsername);
        if (response.status === 200) {
          setUserProfile(response.data);
          setAvatarUrl(
            response.data.avatar ||
              `https://ui-avatars.com/api/?name=${response.data.name}&background=4284f5&color=fff`
          );
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
  }, [targetUsername]);

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

  if (loading || !userProfile) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box height={200} style={{ background: gradient }} />
      <Box maxWidth="1200px" margin="auto" mt={-10} px={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Box display="flex" alignItems="center">
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={avatarUrl}
                      sx={{ width: 120, height: 120, mr: 3 }}
                    />
                    {isCurrentUser && (
                      <>
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 24,
                            backgroundColor: "white",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                            padding: "4px",
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
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {userProfile.name}
                    </Typography>
                    {isCurrentUser && (
                      <Typography variant="body1" color="text.secondary">
                        {localStorage.getItem("email") ||
                          sessionStorage.getItem("email")}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {isCurrentUser && (
                  <IconButton>
                    <MoreHorizIcon />
                  </IconButton>
                )}
              </Box>
              <Box display="flex" mb={2}>
                <Box display="flex" alignItems="center" mr={3}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">
                    Joined{" "}
                    {new Date(userProfile.createdTime).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Typography variant="h5" fontWeight="bold" mb={2}>
              Posts
            </Typography>
            {userProfile.blogs?.map((post, index) => (
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
                  comments={post.comments}
                  createdTime={post.createdTime}
                />
                {index < userProfile.blogs.length - 1 && (
                  <Divider sx={{ my: 4 }} />
                )}
              </React.Fragment>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4 }}>
              <Typography variant="h6" gutterBottom>
                Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    {userProfile.totalUpVotes}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    Likes
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    {userProfile.totalComments}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    Comments
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    {userProfile.blogs?.length || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    Posts
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Followed Categories */}
            {userProfile.categories?.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Following Categories
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {userProfile.categories.map((category) => (
                    <Chip
                      key={category.id}
                      label={category.title}
                      variant="outlined"
                      onClick={() => navigate(`/category/${category.title}`)}
                      sx={{
                        borderRadius: "16px",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}

            {/* Followed Topics */}
            {userProfile.tags?.length > 0 && (
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Following Topics
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {userProfile.tags.map((tag) => (
                    <Chip
                      key={tag.id}
                      label={`#${tag.title}`}
                      variant="outlined"
                      onClick={() => navigate(`/tag/${tag.title}`)}
                      sx={{
                        borderRadius: "16px",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: "primary.main",
                          color: "white",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilePage;
