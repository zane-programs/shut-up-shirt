import sys
import asyncio
import io

import websockets
from PIL import Image
from IT8951 import constants
from IT8951.display import AutoEPDDisplay

# Initialize the display
display = AutoEPDDisplay(vcom=-1.50, rotate=None, mirror=True, spi_hz=24000000)


def clear_display(dark=False):
    color = 0x00 if dark else 0xFF
    display.frame_buf.paste(color, box=(0, 0, display.width, display.height))
    display.draw_full(constants.DisplayModes.GC16)


def show_full(image_path, dark=False):
    # Clear the display to white or black, depending on the mode
    clear_display(dark)

    # Load the image
    img = Image.open(image_path)
    dims = (display.width, display.height)
    img.thumbnail(dims)

    # Align image with bottom of display
    paste_coords = [dims[i] - img.size[i] for i in (0, 1)]

    display.frame_buf.paste(img, paste_coords)
    display.draw_full(constants.DisplayModes.GC16)


async def handle_websocket(websocket):
    """Handle WebSocket connections and display received PNG data."""
    print("Client connected")

    try:
        async for message in websocket:
            if isinstance(message, bytes):
                # Process PNG data
                img = Image.open(io.BytesIO(message))

                # Get display dimensions
                dims = (display.width, display.height)
                img.thumbnail(dims)

                # img.save("FRAME.png")

                # Align image with bottom of display (same as original)
                paste_coords = [dims[i] - img.size[i] for i in (0, 1)]

                # Paste the image on the frame buffer
                display.frame_buf.paste(img, paste_coords)

                # Use partial update for faster refresh
                display.draw_partial(constants.DisplayModes.DU)

                print(f"Updated display with image of size {img.size}")

            # Optional support for dark mode toggle via text message
            elif message == "dark":
                # Clear the display to black
                clear_display(dark=True)
                print("Set display to dark mode")

            elif message == "light":
                # Clear the display to white
                clear_display(dark=False)
                print("Set display to light mode")

    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")


async def ws_main():
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


def stdin_main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        parts = line.split()
        if not parts:
            continue

        img_path = parts[0]
        dark = len(parts) > 1 and parts[1].lower() == "dark"

        try:
            show(img_path, dark)
            print(f"Displayed: {img_path}" + (" (dark mode)" if dark else ""))
        except Exception as e:
            print(f"Error displaying {img_path}: {e}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(ws_main())
    stdin_main()
