import { ActiveSelection, type Canvas } from "fabric";

export function handleSelectAll(canvas: Canvas) {
  // Ensure there's something to be selected
  // (Filter for selectable because we do NOT
  // want the Fleethearts box to be selected)
  const selectableObjects = canvas
    .getObjects()
    .filter((object) => object.selectable);
  if (selectableObjects.length === 0) return;

  // Select all selectable objects
  canvas.discardActiveObject();
  const sel = new ActiveSelection(selectableObjects, {
    canvas,
  });
  canvas.setActiveObject(sel);
  canvas.requestRenderAll();
}

export function handleDeleteSelected(canvas: Canvas) {
  // Remove all selected objects
  canvas.getActiveObjects().forEach((o) => canvas.remove(o));
  // Deselect all objects
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}
