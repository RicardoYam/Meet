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
} from "@mui/material";
import PostCard from "../components/PostCard";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import { getProfile, updateAvatar, updateBanner } from "../api/user";

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

  const currentUsername =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  const isCurrentUser = !profileUsername || profileUsername === currentUsername;

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
          setBannerUrl(response.data.banner);
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

              <IconButton>
                <MoreHorizIcon />
              </IconButton>
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
            <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Joined{" "}
                {new Date(userProfile.createdTime).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
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

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
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
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
