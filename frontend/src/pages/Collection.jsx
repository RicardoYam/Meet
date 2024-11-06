import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import PostCard from "../components/PostCard";
import { getAllPosts } from "../api/blog";

function Collection() {
  const { title } = useParams();
  const location = useLocation();
  const isCategory = location.pathname.includes("/category/");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0,
    last: false,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await getAllPosts(
          0,
          5,
          isCategory ? title : null,
          !isCategory ? title : null
        );

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
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [title, isCategory]);

  const loadMorePosts = async () => {
    if (!pageInfo.last) {
      try {
        const response = await getAllPosts(
          pageInfo.number + 1,
          pageInfo.size,
          isCategory ? title : null,
          !isCategory ? title : null
        );

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
      } catch (error) {
        console.error("Error loading more posts:", error);
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="py-8">
      <Box className="mx-8">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            <span>{title}</span>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {pageInfo.totalElements} posts
          </Typography>
        </Box>

        {/* Posts */}
        {posts.length > 0 ? (
          <Box>
            {posts.map((post, index) => (
              <React.Fragment key={post.id}>
                <PostCard
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
                {index < posts.length - 1 && (
                  <Divider sx={{ my: 4, borderColor: "#eee" }} />
                )}
              </React.Fragment>
            ))}

            {/* Load More Button */}
            {!pageInfo.last && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Button
                  variant="contained"
                  onClick={loadMorePosts}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Load More
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No posts found for this {isCategory ? "category" : "topic"}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Collection;
