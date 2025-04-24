import styles from "./render-text.module.scss";
import html2canvas from "html2canvas";

const MAX_FONT_SIZE = 500;
const MIN_FONT_SIZE = 200;

export async function renderText(
  textContent: string,
  colorMode: "light" | "dark" = "light"
): Promise<Blob> {
  const elem = document.createElement("div");

  // Set classes on the element for styling
  elem.classList.add(styles.textBox);
  elem.classList.add(styles[colorMode]);

  // Calculate font size based on text length
  const textLength = textContent.length;
  let fontSize = Math.max(
    MAX_FONT_SIZE - (textLength * (MAX_FONT_SIZE - MIN_FONT_SIZE)) / 20,
    MIN_FONT_SIZE
  );
  elem.style.fontSize = `${fontSize}px`;

  // Set the text content
  const textNode = document.createTextNode(textContent);
  const textDiv = document.createElement("div");
  textDiv.appendChild(textNode);
  elem.appendChild(textDiv);

  // Add to body so we can render it
  document.body.appendChild(elem);

  // Set the position to be off-screen
  elem.style.position = "absolute";
  elem.style.left = "-9999px";
  elem.style.top = "-9999px";
  document.body.style.overflow = "hidden";

  // Render the element to a canvas
  const canvas = await html2canvas(elem, {
    scale: 1,
  });

  // Reset the body overflow and remove the element
  document.body.style.removeProperty("overflow");
  document.body.removeChild(elem);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject("Failed to create blob")),
      "image/png"
    )
  );

  return blob;
}
