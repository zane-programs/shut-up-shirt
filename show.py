import sys

from IT8951 import constants
from IT8951.display import AutoEPDDisplay
from PIL import Image

display = AutoEPDDisplay(vcom=-1.50, rotate=None, mirror=True, spi_hz=24000000)


def show(image_path, dark=False):
    # Clear the display to white or black, depending on the mode
    color = 0x00 if dark else 0xFF
    display.frame_buf.paste(color, box=(0, 0, display.width, display.height))

    # Load the image
    img = Image.open(image_path)
    dims = (display.width, display.height)
    img.thumbnail(dims)

    # Align image with bottom of display
    paste_coords = [dims[i] - img.size[i] for i in (0, 1)]

    display.frame_buf.paste(img, paste_coords)
    display.draw_full(constants.DisplayModes.GC16)


if __name__ == "__main__":
    # Process input lines from stdin
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
