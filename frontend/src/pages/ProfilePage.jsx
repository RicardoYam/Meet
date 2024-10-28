import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Grid,
  Paper,
  IconButton,
} from "@mui/material";
import PostCard from "../components/PostCard";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarIcon from "@mui/icons-material/Star";

const generateRandomGradient = () => {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  const color2 = colors[Math.floor(Math.random() * colors.length)];
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const ProfilePage = () => {
  const [gradient, setGradient] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setGradient(generateRandomGradient());
    // Fetch user posts here
    setPosts([
      {
        username: "Raj Mishra",
        handle: "coachraj",
        content: "Just finished an amazing training session!",
        images: ["https://source.unsplash.com/random/800x600?fitness"],
        likes: 42,
        comments: 7,
      },
      {
        username: "Raj Mishra",
        handle: "coachraj",
        content:
          "Here's a quick tip for staying motivated: set small, achievable goals!",
        images: [],
        likes: 31,
        comments: 5,
      },
    ]);
  }, []);

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
                  <Avatar
                    src="https://source.unsplash.com/random/150x150?face"
                    sx={{ width: 120, height: 120, mr: 3 }}
                  />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      Raj Mishra
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      @coachraj
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      My clients describe my training style as motivating and
                      life-changing.
                    </Typography>
                  </Box>
                </Box>
                <IconButton>
                  <MoreHorizIcon />
                </IconButton>
              </Box>
              <Box display="flex" mb={2}>
                <Box display="flex" alignItems="center" mr={3}>
                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">San Francisco, CA</Typography>
                </Box>
                <Box display="flex" alignItems="center" mr={3}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Joined April 2021</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <StarIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">5.0 (121)</Typography>
                </Box>
              </Box>
            </Paper>
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Posts
            </Typography>
            {posts.map((post, index) => (
              <PostCard key={index} {...post} />
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4 }}>
              <Button
                variant="contained"
                fullWidth
                sx={{ mb: 2, textTransform: "none", fontWeight: "bold" }}
              >
                Book a session
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2, textTransform: "none" }}
              >
                Message
              </Button>
              <Typography variant="body2" align="center" color="textSecondary">
                Profile views: 1,234
              </Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    351
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    Completed Sessions
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    color="primary"
                  >
                    2+
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    color="textSecondary"
                  >
                    Years Experience
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfilePage;
