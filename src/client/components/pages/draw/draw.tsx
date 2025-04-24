import { useEffect, useState } from "react";
import DrawingCanvas from "../../shared/drawing-canvas/drawing-canvas";

import useWebSocket from "react-use-websocket";
import { useSocket } from "../../shared/socket/socket";

export default function Draw() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");

  const { sendImage, socket } = useSocket();

  const handleDraw = (data: Blob) => {
    sendImage(data, "PARTIAL_A2");
  };

  const handleClear = () => {
    socket.sendMessage(colorMode);
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
