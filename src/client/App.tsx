import { Routes, Route } from "react-router";

// Pages
import Home from "./components/pages/home/home.js";
import Editor from "./components/pages/editor/editor.js";
import { TextModalProvider } from "./components/shared/text-modal/text-modal.js";

export default function App() {
  return (
    <TextModalProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="editor" element={<Editor />} />
      </Routes>
    </TextModalProvider>
  );
}
