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
    img_path = sys.argv[1]
    dark = sys.argv[2] == "dark" if len(sys.argv) > 2 else False
    show(img_path, dark)
