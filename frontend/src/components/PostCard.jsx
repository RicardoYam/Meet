import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Grid,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";

const PostCard = ({ username, handle, content, images, likes, comments }) => (
  <Card className="mb-4 rounded-xl shadow-md">
    <CardContent className="p-4">
      <Box className="flex items-center mb-3">
        <Avatar
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${username}`}
          className="mr-3"
        />
        <Box>
          <Typography variant="subtitle1" className="font-bold">
            {username}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            @{handle}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1" className="mb-3">
        {content}
      </Typography>
      <Grid container spacing={1} className="mb-3">
        {images.map((image, index) => (
          <Grid item xs={images.length > 1 ? 6 : 12} key={index}>
            <img
              src={image}
              alt={`Post image ${index + 1}`}
              className="w-full h-auto rounded-lg"
            />
          </Grid>
        ))}
      </Grid>
      <Box className="flex items-center text-gray-500">
        <IconButton size="small" className="mr-1">
          <FavoriteIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" className="mr-4">
          {likes}
        </Typography>
        <IconButton size="small" className="mr-1">
          <ChatBubbleOutlineIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" className="mr-4">
          {comments}
        </Typography>
        <IconButton size="small">
          <ShareIcon fontSize="small" />
        </IconButton>
      </Box>
    </CardContent>
  </Card>
);

export default PostCard;
