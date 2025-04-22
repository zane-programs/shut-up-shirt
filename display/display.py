from IT8951.display import AutoEPDDisplay
from IT8951 import constants

# Initialize the display
display = AutoEPDDisplay(vcom=-1.50, rotate=None, mirror=True, spi_hz=24000000)


def clear_display(dark=False):
    color = 0x00 if dark else 0xFF
    display.frame_buf.paste(color, box=(0, 0, display.width, display.height))
    display.draw_full(constants.DisplayModes.GC16)
