import { useCallback } from "react";
import useWebSocket from "react-use-websocket";

import { REFRESH_MODES, type RefreshMode, SocketContext } from "./socket";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const socket = useWebSocket("ws://slage-rpi4-1.local:8765", {
    shouldReconnect: () => {
      return true;
    },
  });

  const sendImage = useCallback(
    (image: Blob, mode: RefreshMode = "FULL_GC16") => {
      const newBlob = new Blob([REFRESH_MODES[mode], image], {
        type: "image/png",
      });
      socket.sendMessage(newBlob);
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ socket, sendImage }}>
      {children}
    </SocketContext.Provider>
  );
}
