import styles from "./render-text.module.scss";
import html2canvas from "html2canvas";

const MAX_FONT_SIZE = 384;
const MIN_FONT_SIZE = 96;

export async function renderText(
  textContent: string,
  colorMode: "light" | "dark" = "dark"
): Promise<FormData> {
  const elem = document.createElement("div");

  elem.classList.add(styles.textBox);
  elem.classList.add(styles[colorMode]);

  // Calculate font size based on text length
  const textLength = textContent.length;
  let fontSize = Math.max(MAX_FONT_SIZE - textLength * 12, MIN_FONT_SIZE);
  elem.style.fontSize = `${fontSize}px`;

  const textNode = document.createTextNode(textContent);
  elem.appendChild(textNode);

  document.body.appendChild(elem);

  const canvas = await html2canvas(elem, {
    scale: 1,
  });

  document.body.removeChild(elem);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject("Failed to create blob")),
      "image/png"
    )
  );

  const fd = new FormData();
  fd.append("pngFile", blob, "text.png");

  return fd;
}
