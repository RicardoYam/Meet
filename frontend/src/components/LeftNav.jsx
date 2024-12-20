import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import TopicIcon from "@mui/icons-material/Topic";
import AddIcon from "@mui/icons-material/Add";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import { createTopic, createCategory } from "../api/blog";
import { getProfile } from "../api/user";

function LeftNav() {
  const navigate = useNavigate();
  const [customFeedsOpen, setCustomFeedsOpen] = useState(true);
  const [communitiesOpen, setCommunitiesOpen] = useState(true);
  const [openTopicDialog, setOpenTopicDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
  });
  const [newCategory, setNewCategory] = useState({
    title: "",
    description: "",
  });
  const [error, setError] = useState({
    open: false,
    message: "",
  });
  const [success, setSuccess] = useState({
    open: false,
    message: "",
  });
  const [userInterests, setUserInterests] = useState(null);

  const username =
    localStorage.getItem("username") || sessionStorage.getItem("username");

  const isLoggedIn = Boolean(
    localStorage.getItem("token") || sessionStorage.getItem("token")
  );

  useEffect(() => {
    const fetchUserInterests = async () => {
      if (!username) return;

      try {
        const response = await getProfile(username);
        if (response.status === 200) {
          setUserInterests(response.data);
        }
      } catch (error) {
        console.error("Error fetching user interests:", error);
      }
    };

    fetchUserInterests();
  }, [username]);

  const handleOpenTopicDialog = () => {
    setOpenTopicDialog(true);
  };

  const handleCloseTopicDialog = () => {
    setOpenTopicDialog(false);
    setNewTopic({ title: "", description: "" });
  };

  const handleOpenCategoryDialog = () => {
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setNewCategory({ title: "", description: "" });
  };

  const handleCreateTopic = async () => {
    try {
      const response = await createTopic(newTopic);
      if (response.status === 201) {
        handleCloseTopicDialog();
        setSuccess({
          open: true,
          message: "Topic created successfully!",
        });
      } else {
        setError({
          open: true,
          message: response.data.message || "Failed to create topic",
        });
      }
    } catch (error) {
      setError({
        open: true,
        message: error.response?.data || "Failed to create topic",
      });
    }
  };

  const handleCreateCategory = async () => {
    try {
      const response = await createCategory(newCategory);
      if (response.status === 201) {
        handleCloseCategoryDialog();
        setSuccess({
          open: true,
          message: "Category created successfully!",
        });
      } else {
        setError({
          open: true,
          message: response.data.message || "Failed to create category",
        });
      }
    } catch (error) {
      setError({
        open: true,
        message: error.response?.data || "Failed to create category",
      });
    }
  };

  const handleCloseError = () => {
    setError({
      open: false,
      message: "",
    });
  };

  const handleCloseSuccess = () => {
    setSuccess({
      open: false,
      message: "",
    });
  };

  return (
    <>
      <Box
        sx={{
          width: "256px",
          height: "calc(100vh - 64px)",
          position: "fixed",
          left: 0,
          top: 64,
          backgroundColor: "white",
          borderRight: "1px solid #e0e0e0",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <List component="nav" sx={{ px: 2 }}>
          <ListItem
            button
            onClick={() => navigate("/")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate("/categories")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItem>
          <ListItem
            button
            onClick={() => navigate("/topics")}
            sx={{ borderRadius: 1 }}
          >
            <ListItemIcon>
              <TopicIcon />
            </ListItemIcon>
            <ListItemText primary="Topics" />
          </ListItem>

          {isLoggedIn && (
            <>
              <Divider sx={{ my: 2 }} />

              {/* Topics Section */}
              <ListItem
                button
                onClick={() => setCustomFeedsOpen(!customFeedsOpen)}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color="textSecondary">
                      Topics
                    </Typography>
                  }
                />
                {customFeedsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={customFeedsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    sx={{ pl: 4, borderRadius: 1 }}
                    onClick={handleOpenTopicDialog}
                  >
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Create New" />
                  </ListItem>
                  {userInterests?.tags?.map((tag, index) => (
                    <ListItem
                      key={index}
                      button
                      sx={{ pl: 4, borderRadius: 1 }}
                      onClick={() => navigate(`/tag/${tag.title}`)}
                    >
                      <ListItemText
                        primary={`${tag.title}`}
                        primaryTypographyProps={{
                          variant: "body2",
                          style: {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              <Divider sx={{ my: 2 }} />

              {/* Categories Section */}
              <ListItem
                button
                onClick={() => setCommunitiesOpen(!communitiesOpen)}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color="textSecondary">
                      Categories
                    </Typography>
                  }
                />
                {communitiesOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={communitiesOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    sx={{ pl: 4, borderRadius: 1 }}
                    onClick={handleOpenCategoryDialog}
                  >
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Create New" />
                  </ListItem>
                  {userInterests?.categories?.map((category, index) => (
                    <ListItem
                      key={index}
                      button
                      sx={{ pl: 4, borderRadius: 1 }}
                      onClick={() => navigate(`/category/${category.title}`)}
                    >
                      <ListItemText
                        primary={category.title}
                        primaryTypographyProps={{
                          variant: "body2",
                          style: {
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          },
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>

      {/* Create Topic Dialog */}
      <Dialog
        open={openTopicDialog}
        onClose={handleCloseTopicDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
          },
        }}
      >
        <DialogTitle>Create a New Topic</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Topic Title"
              fullWidth
              variant="outlined"
              value={newTopic.title}
              onChange={(e) =>
                setNewTopic({ ...newTopic, title: e.target.value })
              }
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#9333ea",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#9333ea",
                },
              }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newTopic.description}
              onChange={(e) =>
                setNewTopic({ ...newTopic, description: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#9333ea",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#9333ea",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseTopicDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateTopic}
            variant="contained"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!newTopic.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
          },
        }}
      >
        <DialogTitle>Create a New Category</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Category Title"
              fullWidth
              variant="outlined"
              value={newCategory.title}
              onChange={(e) =>
                setNewCategory({ ...newCategory, title: e.target.value })
              }
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#9333ea",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#9333ea",
                },
              }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "#9333ea",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#9333ea",
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCategoryDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateCategory}
            variant="contained"
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!newCategory.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={error.open}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error.message}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={success.open}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          sx={{ width: "100%" }}
        >
          {success.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LeftNav;
