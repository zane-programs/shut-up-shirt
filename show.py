import asyncio
import io

import websockets
from PIL import Image
from IT8951 import constants
from IT8951.display import AutoEPDDisplay

# Initialize the display
display = AutoEPDDisplay(vcom=-1.50, rotate='flip',
                         mirror=True, spi_hz=24000000)


async def handle_websocket(websocket):
    """Handle WebSocket connections and display received PNG data."""
    print("Client connected")

    try:
        async for message in websocket:
            if isinstance(message, bytes):
                # The first byte indicates the mode:
                # 0 = B&W partial refresh (faster, ~120ms)
                # 1 = Graytone partial refresh (slower, ~260ms)
                # 2 = Full picture render (slowest, ~450ms)
                # TODO: Support other modes as necessary
                mode = message[0]

                # Process PNG data
                img = Image.open(io.BytesIO(message[1:]))

                # Get display dimensions
                dims = (display.width, display.height)
                if img.width != dims[0] or img.height != dims[1]:
                    img.thumbnail(dims)

                # Align image with bottom of display (same as original)
                paste_coords = [dims[i] - img.size[i] for i in (0, 1)]

                # Paste the image on the frame buffer
                display.frame_buf.paste(img, paste_coords)

                # Full or partial refresh, depending on first byte
                if mode == 0:
                    # B&W partial refresh (faster, ~120ms)
                    display.draw_partial(constants.DisplayModes.A2)
                elif mode == 1:
                    # Graytone partial refresh (slower, ~260ms)
                    display.draw_partial(constants.DisplayModes.DU)
                else:
                    # Full picture render (slowest, ~450ms)
                    # Mode 2, but also any other value (via else)
                    display.draw_full(constants.DisplayModes.GC16)

                print(f"[{mode}] Updated display with image of size {img.size}")

            # Optional support for dark mode toggle via text message
            elif message == "dark":
                # Clear the display to black
                display.frame_buf.paste(0x00, box=(
                    0, 0, display.width, display.height))
                display.draw_full(constants.DisplayModes.GC16)
                print("Set display to dark mode")

            elif message == "light":
                # Clear the display to white
                display.frame_buf.paste(0xFF, box=(
                    0, 0, display.width, display.height))
                display.draw_full(constants.DisplayModes.GC16)
                print("Set display to light mode")

    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")


def clear_display(dark=False):
    color = 0x00 if dark else 0xFF
    display.frame_buf.paste(color, box=(0, 0, display.width, display.height))
    display.draw_full(constants.DisplayModes.GC16)


async def main():
    clear_display()

    # Start WebSocket server
    server = await websockets.serve(
        handle_websocket,
        "0.0.0.0",    # Host
        8765          # Port
    )

    print("WebSocket server started on localhost:8765")

    # Keep the server running
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
