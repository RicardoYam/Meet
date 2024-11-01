import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PostCard from "./PostCard";
import { useNavigate } from "react-router-dom";
import { getAllPosts } from "../api/blog";
import { getProfile, updateAvatar } from "../api/user";

const UserProfile = ({ username, avatar, likes, comments, posts, userId }) => {
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState(
    avatar
      ? avatar
      : `https://ui-avatars.com/api/?name=${username}&background=4284f5&color=fff`
  );
  const fileInputRef = useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const response = await updateAvatar(userId, file);

        if (response.status === 200) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error updating avatar:", error);
      }
    }
  };

  return (
    <Card className="mb-4 rounded-xl shadow-md">
      <CardContent>
        <Box className="flex flex-col items-center">
          <Box className="relative">
            <Avatar
              src={avatarUrl}
              sx={{ width: 80, height: 80 }}
              className="mb-2"
            />
            <IconButton
              size="small"
              className="absolute bottom-0 right-0 bg-white shadow-md"
              onClick={handleAvatarClick}
              sx={{ padding: "4px" }}
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
          </Box>
          <Typography variant="h6">{username}</Typography>
          <Box className="flex justify-around w-full mt-4">
            <Box className="text-center">
              <Typography variant="h6">{likes}</Typography>
              <Typography variant="body2">likes</Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="h6">{comments}</Typography>
              <Typography variant="body2">comments</Typography>
            </Box>
            <Box className="text-center">
              <Typography variant="h6">{posts}</Typography>
              <Typography variant="body2">posts</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            className="mt-4 bg-purple-600 w-full hover:bg-purple-700"
            onClick={() => navigate("/create-post")}
          >
            Create Post
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const TopicsList = ({ topics }) => (
  <Card className="mb-4 rounded-xl shadow-md">
    <CardContent>
      <Typography variant="h6" className="mb-2">
        Topics you follow
      </Typography>
      <Box className="flex flex-wrap">
        {topics.map((topic, index) => (
          <Typography
            key={index}
            variant="body2"
            className="bg-gray-200 rounded-full px-3 py-1 m-1"
          >
            {topic}
          </Typography>
        ))}
      </Box>
    </CardContent>
  </Card>
);

const FeaturedPost = ({ title, image }) => (
  <Card className="mb-4 rounded-xl shadow-md">
    <CardMedia component="img" height="140" image={image} alt={title} />
    <CardContent>
      <Typography variant="h6">{title}</Typography>
    </CardContent>
  </Card>
);

function Explore() {
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
    last: false,
  });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getAllPosts(0, 5).then((response) => {
      if (response.status === 200) {
        const data = response.data;
        setPosts(data.content);
        setPageInfo({
          number: data.number,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          last: data.last,
        });
      }
    });

    getProfile(
      localStorage.getItem("username") || sessionStorage.getItem("username")
    ).then((response) => {
      if (response.status === 200) {
        setCurrentUser(response.data);
      }
    });
  }, []);

  const loadMorePosts = () => {
    if (!pageInfo.last) {
      getAllPosts(pageInfo.number + 1, pageInfo.size).then((response) => {
        if (response.status === 200) {
          const data = response.data;
          setPosts((prevPosts) => [...prevPosts, ...data.content]);
          setPageInfo({
            number: data.number,
            size: data.size,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            last: data.last,
          });
        }
      });
    }
  };

  return (
    <Box className="container mx-auto px-4 py-8">
      <Box className="flex flex-col md:flex-row">
        {posts?.length > 0 ? (
          <Box className="w-full md:w-2/3 md:pr-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                author={post.author}
                avatar={post.avatar}
                categories={post.categories}
                tags={post.tags}
                upVotes={post.upVotes}
                comments={post.comments}
                createdTime={post.createdTime}
                votes={post.votes}
              />
            ))}
            {!pageInfo.last && (
              <Button
                variant="contained"
                onClick={loadMorePosts}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
                fullWidth
              >
                Load More
              </Button>
            )}
          </Box>
        ) : (
          <Box className="w-full md:w-2/3 md:pr-4">
            <Typography variant="h6">No posts found</Typography>
          </Box>
        )}
        <Box className="w-full md:w-1/3 mt-4 md:mt-0">
          {currentUser && (
            <UserProfile
              username={currentUser.name}
              avatar={currentUser.avatar}
              likes={currentUser.totalUpVotes}
              comments={currentUser.totalComments}
              posts={currentUser.blogs?.length || 0}
              userId={currentUser.id}
            />
          )}
          {currentUser?.tags && <TopicsList topics={currentUser.tags} />}
          <FeaturedPost
            title="THE FISHEYE NO.2 AND DOUBLE EXPOSURE – A MULTILAYER ADVENTURE"
            image="https://source.unsplash.com/random/800x600?camera"
          />
        </Box>
      </Box>
    </Box>
  );
}

export default Explore;
