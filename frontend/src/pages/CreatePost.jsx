import React, { useRef, useState } from "react";
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
import { TextField, Button } from "@mui/material";

const extensions = [
  StarterKit,
  Superscript,
  Code,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Image,
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
          <i className="fas fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          <i className="fas fa-strikethrough"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={editor.isActive("superscript") ? "is-active" : ""}
        >
          <i className="fas fa-superscript"></i>
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          H4
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          H5
        </button>
      </div>

      <div className="menu-bar-buttons">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          <i className="fas fa-list-ul"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          <i className="fas fa-list-ol"></i>
        </button>
      </div>
      <div className="menu-bar-buttons">
        <button onClick={() => editor.chain().focus().toggleCode().run()}>
          <i className="fas fa-code"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          <i className="fas fa-file-code"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          <i className="fas fa-quote-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={editor.isActive("horizontalRule") ? "is-active" : ""}
        >
          <i className="fas fa-minus"></i>
        </button>
      </div>
      <div className="menu-bar-buttons">
        <button onClick={addImage} title="Add image">
          <i className="fas fa-image"></i>
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
          <i className="fas fa-align-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={
            editor.isActive({ textAlign: "center" }) ? "is-active" : ""
          }
        >
          <i className="fas fa-align-center"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
        >
          <i className="fas fa-align-right"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={
            editor.isActive({ textAlign: "justify" }) ? "is-active" : ""
          }
        >
          <i className="fas fa-align-justify"></i>
        </button>
      </div>
    </div>
  );
};

function CreatePost() {
  const [editorContent, setEditorContent] = useState("");
  const [title, setTitle] = useState("");

  const handlePost = () => {
    console.log("Title:", title);
    console.log("Content:", editorContent);
  };

  return (
    <div className="create-post-container">
      <div className="title-bar mb-4">
        <h1>Create Post</h1>
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
      <div className="editor-container">
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

      <div className="flex justify-end">
        <Button
          variant="contained"
          color="primary"
          className="post-button"
          onClick={handlePost}
        >
          Post
        </Button>
      </div>
    </div>
  );
}

export default CreatePost;
