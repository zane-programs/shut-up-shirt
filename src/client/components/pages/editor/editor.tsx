import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { useCallback, useEffect, useRef } from "react";

import styles from "./editor.module.scss";
import { Box, Button } from "../../core/core";
import { handleDeleteSelected, handleSelectAll } from "./util";

// E-ink screen dimensions
const WIDTH = 1872;
const HEIGHT = 1404;

export default function Editor() {
  const { editor, onReady } = useFabricJSEditor();

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (editor) {
      // Set to 4:3 aspect ratio
      if (window.innerWidth > window.innerHeight) {
        // Landscape
        editor.canvas.setDimensions({
          width: window.innerHeight,
          height: window.innerHeight * (HEIGHT / WIDTH),
        });
      } else {
        // Portrait
        editor.canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerWidth * (HEIGHT / WIDTH),
        });
      }
      editor.canvas.requestRenderAll();
    }
  }, [editor]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  const handleEditorKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log("Key pressed:", e.key);
      if (!editor?.canvas) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        handleDeleteSelected(editor.canvas);
      } else if (e.key === "a" && e.metaKey) {
        e.preventDefault();
        // Cmd + A: Select all
        handleSelectAll(editor.canvas);
      } else {
        // All else: text entry
        // handleTextEntry(e, editor.canvas);
      }
    },
    [editor?.canvas]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleEditorKeyDown);
    return () => {
      window.removeEventListener("keydown", handleEditorKeyDown);
    };
  }, [handleEditorKeyDown]);

  const onAddCircle = () => {
    editor?.addCircle();
  };
  const onAddRectangle = () => {
    editor?.addRectangle();
  };

  return (
    <Box className={styles.editor}>
      <Button onClick={onAddCircle}>Add circle</Button>
      <Button onClick={onAddRectangle}>Add Rectangle</Button>
      <Box ref={editorContainerRef}>
        <FabricJSCanvas className={styles.fabricCanvas} onReady={onReady} />
      </Box>
    </Box>
  );
}
