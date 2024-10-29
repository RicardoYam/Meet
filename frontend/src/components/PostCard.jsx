import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const PostCard = ({
  id,
  title,
  content,
  author,
  avatar,
  categories,
  upVotes,
  createdTime,
}) => {
  const navigate = useNavigate();

  // Create a temporary div to parse HTML content
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // Extract the first image if exists
  const firstImage = tempDiv.querySelector("img")?.src;

  // Get text content without HTML tags
  const textContent = tempDiv.textContent || tempDiv.innerText;
  // Limit text preview to ~100 characters
  const textPreview =
    textContent.slice(0, 100) + (textContent.length > 100 ? "..." : "");

  const handleCardClick = (e) => {
    // Prevent navigation if clicking on the upvote button
    if (e.target.closest(".upvote-button")) {
      return;
    }
    navigate(`/posts/${id}`);
  };

  return (
    <Card
      className="mb-4 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <Box className="flex">
        {firstImage && (
          <div className="flex justify-center items-center w-48 h-48">
            <img
              src={firstImage}
              alt="Post preview"
              className="w-40 h-40 object-cover rounded-xl"
            />
          </div>
        )}
        <Box className="flex-1 flex flex-col">
          <CardContent className="flex-1">
            <Box className="flex items-center gap-2 mb-2">
              <Avatar
                src={
                  avatar ||
                  `https://api.dicebear.com/6.x/initials/svg?seed=${author}`
                }
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="body2" className="font-medium">
                {author}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                •
              </Typography>
              {categories && categories[0] && (
                <Typography variant="body2" color="textSecondary">
                  {categories[0]}
                </Typography>
              )}
            </Box>
            <Typography variant="h6" className="mb-2 font-bold">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" className="mb-4">
              {textPreview}
            </Typography>
            <Box className="flex items-center gap-4 text-gray-500">
              <Box className="flex items-center gap-2">
                <AccessTimeIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  {new Date(createdTime).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
              </Box>
              <Box className="flex items-center gap-2">
                <VisibilityIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2" color="textSecondary">
                  {Math.ceil(textContent.length / 200)} min read
                </Typography>
              </Box>
              <Box className="flex-grow" />
              <Box className="flex items-center gap-1 upvote-button">
                <IconButton size="small">
                  <ThumbUpOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography variant="body2">{upVotes}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Box>
    </Card>
  );
};

export default PostCard;
