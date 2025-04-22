import sys

from PIL import Image
from IT8951 import constants

from .display import display, clear_display


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
