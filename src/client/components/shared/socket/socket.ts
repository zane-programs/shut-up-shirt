import type { WebSocketHook } from "react-use-websocket/dist/lib/types";
import { createContext, useContext } from "react";

type ISocketContext = {
  socket: WebSocketHook<unknown>;
  sendImage: (image: Blob, mode?: RefreshMode) => void;
};

export const SocketContext = createContext<ISocketContext>(
  {} as ISocketContext
);

/**
 * Refresh modes for the display
 * NOTE: Not all modes are supported by our socket server.
 * Learn more about the modes in the Waveshare documentation.
 * @see https://www.waveshare.net/w/upload/c/c4/E-paper-mode-declaration.pdf
 */
export const REFRESH_MODES = {
  /** Partial A2 refresh mode (B&W only, ~120ms refresh time) */
  PARTIAL_A2: new Uint8Array([0]),
  /** Partial DU refresh mode (B&W only, ~260ms refresh time) */
  PARTIAL_DU: new Uint8Array([1]),
  /** Full refresh mode (Full grayscale, ~450ms refresh time) */
  FULL_GC16: new Uint8Array([2]),
} as const;

/** Keys of the refresh modes for the display */
export type RefreshMode = keyof typeof REFRESH_MODES;

/** Hook to use the socket context */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
