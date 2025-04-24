import { Routes, Route } from "react-router";

// Providers
import { TextModalProvider } from "./components/shared/text-modal/text-modal";

// Pages
import Home from "./components/pages/home/home.js";
import Editor from "./components/pages/editor/editor.js";
import Draw from "./components/pages/draw/draw.js";
import SocketProvider from "./components/shared/socket/provider";

export default function App() {
  return (
    <SocketProvider>
      <TextModalProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="draw" element={<Draw />} />
          <Route path="editor" element={<Editor />} />
        </Routes>
      </TextModalProvider>
    </SocketProvider>
  );
}
