import { Routes, Route } from "react-router";

// Providers
import { TextModalProvider } from "./components/shared/text-modal/text-modal.js";

// Pages
import Home from "./components/pages/home/home.js";
import Editor from "./components/pages/editor/editor.js";
import Draw from "./components/pages/draw/draw.js";

export default function App() {
  return (
    <TextModalProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="draw" element={<Draw />} />
        <Route path="editor" element={<Editor />} />
      </Routes>
    </TextModalProvider>
  );
}
