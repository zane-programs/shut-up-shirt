import { useEffect, useState } from "react";
import DrawingCanvas from "../../shared/drawing-canvas/drawing-canvas";

import useWebSocket from "react-use-websocket";

export default function Draw() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  const { sendMessage } = useWebSocket("ws://slage-rpi4-1.local:8765", {
    onOpen: () => console.log("WebSocket connection opened"),
  });

  const handleDraw = (data: Blob) => {
    sendMessage(data);
  };

  const handleClear = () => {
    sendMessage(colorMode);
  };

  useEffect(() => {
    handleClear();
  }, [colorMode]);

  return (
    <DrawingCanvas
      colorMode={colorMode}
      setColorMode={setColorMode}
      onChange={handleDraw}
      onClear={handleClear}
    />
  );
}
