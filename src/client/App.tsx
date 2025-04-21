import { Routes, Route } from "react-router";

// Pages
import Home from "./components/pages/home/home";
import Editor from "./components/pages/editor/editor";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="editor" element={<Editor />} />
    </Routes>
  );
}
