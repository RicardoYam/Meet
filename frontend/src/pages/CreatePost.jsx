import React, { useRef, useState, useEffect } from "react";
import {
  EditorProvider,
  useCurrentEditor,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Superscript from "@tiptap/extension-superscript";
import Code from "@tiptap/extension-code";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import "./CreatePost.css";
import { TextField, Button, Autocomplete } from "@mui/material";
import { getTags, getCategories, createPost } from "../api/blog";
import Strike from "@tiptap/extension-strike";
import { markPasteRule } from "@tiptap/core";
import HardBreak from "@tiptap/extension-hard-break";
import ImageResize from "tiptap-extension-resize-image";

const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))/g;

const CustomStrike = Strike.extend({
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ];
  },
});

const extensions = [
  StarterKit.configure({
    strike: false,
    hardBreak: false,
    code: false,
    image: false,
  }),
  Superscript,
  Code,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Image,
  CustomStrike,
  HardBreak.extend({
    addKeyboardShortcuts() {
      return {
        Enter: () => this.editor.commands.setHardBreak(),
      };
    },
  }),
  ImageResize,
];

const content = "";

const MenuBar = () => {
  const { editor } = useCurrentEditor();
  const imageInputRef = useRef(null);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const input = imageInputRef.current;
    if (input) {
      input.click();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        editor.chain().focus().setImage({ src: imageUrl }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="menu-bar">
      <div className="menu-bar-buttons">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          <i className="fa-solid fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <i className="fa-solid fa-italic"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          <i className="fa-solid fa-strikethrough"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "is-active" : ""}
        >
          <i className="fa-solid fa-superscript"></i>
        </button>
      </div>

      <div className="menu-bar-buttons">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <i className="fa-solid fa-list-ul"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <i className="fa-solid fa-list-ol"></i>
        </button>
      </div>
      <div className="menu-bar-buttons">
        <button onClick={() => editor.chain().focus().toggleCode().run()}>
          <i className="fa-solid fa-code"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          <i className="fa-solid fa-file-code"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          <i className="fa-solid fa-quote-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={editor.isActive("horizontalRule") ? "is-active" : ""}
        >
          <i className="fa-solid fa-minus"></i>
        </button>
      </div>
      <div className="menu-bar-buttons">
        <button onClick={addImage} title="Add image">
          <i className="fa-solid fa-image"></i>
        </button>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: "none" }}
        />
      </div>
      <div>
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
        >
          <i className="fa-solid fa-align-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <i className="fa-solid fa-align-center"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <i className="fa-solid fa-align-right"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
          }
        >
          <i className="fa-solid fa-align-justify"></i>
        </button>
      </div>
    </div>
  );
};

function CreatePost() {
  const [editorContent, setEditorContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getTags().then((response) => {
      if (response.status === 200) {
        setTags(response.data);
      }
    });
    getCategories().then((response) => {
      if (response.status === 200) {
        setCategories(response.data);
      }
    });
  }, []);

  const handlePost = async () => {
    console.log(editorContent);
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!editorContent.trim()) {
      alert("Please add some content");
      return;
    }

    if (selectedCategory.length === 0) {
      alert("Please select at least one category");
      return;
    }

    try {
      setIsSubmitting(true);

      const postData = {
        title: title.trim(),
        content: editorContent,
        authorName:
          localStorage.getItem("username") ||
          sessionStorage.getItem("username"),
        categories: selectedCategory.map((cat) => cat.title),
        tags: selectedTags.map((tag) => tag.title),
      };

      const response = await createPost(postData);

      if (response.status === 201) {
        alert("Post created successfully!");
        // Reset form
        setTitle("");
        setEditorContent("");
        setSelectedCategory([]);
        setSelectedTags([]);
      } else {
        alert("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while creating the post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="mb-4">
        <h1>Create Post</h1>
      </div>

      <div className="mb-4">
        <Autocomplete
          multiple
          options={categories}
          getOptionLabel={(option) => option.title}
          value={selectedCategory}
          onChange={(event, newValue) => {
            setSelectedCategory(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categories"
              placeholder="Add categories"
              InputProps={{
                ...params.InputProps,
                classes: {
                  root: "title-input-root",
                  focused: "title-input-focused",
                },
              }}
              className="categories-field"
            />
          )}
        />
      </div>

      <TextField
        fullWidth
        label="Title"
        variant="outlined"
        required
        placeholder="Enter your title"
        className="mb-4 create-post-title"
        InputProps={{
          classes: {
            root: "title-input-root",
            focused: "title-input-focused",
          },
        }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div className="editor-container mb-4">
        <EditorProvider
          slotBefore={<MenuBar />}
          extensions={extensions}
          content={content}
          onUpdate={({ editor }) => {
            setEditorContent(editor.getHTML());
          }}
        >
          {/* <FloatingMenu editor={null}>This is the floating menu</FloatingMenu>
            <BubbleMenu editor={null}>This is the bubble menu</BubbleMenu> */}
        </EditorProvider>
      </div>

      <div className="mb-4">
        <Autocomplete
          multiple
          id="tags-outlined"
          options={tags}
          getOptionLabel={(option) => option.title}
          filterSelectedOptions
          value={selectedTags}
          onChange={(event, newValue) => {
            setSelectedTags(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tags"
              placeholder="Add tags"
              InputProps={{
                ...params.InputProps,
                classes: {
                  root: "title-input-root",
                  focused: "title-input-focused",
                },
              }}
              className="create-post-title"
            />
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="contained"
          color="primary"
          className="post-button"
          onClick={handlePost}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}

export default CreatePost;
