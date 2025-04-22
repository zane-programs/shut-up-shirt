import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./drawing-canvas.module.scss";
import { Button, Flex } from "../../core/core";

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  colorMode: "light" | "dark";
  setColorMode: React.Dispatch<React.SetStateAction<"light" | "dark">>;
  onChange?: (blob: Blob) => void;
  onClear?: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  colorMode,
  setColorMode,
  onChange,
  onClear,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<Point | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const throttleTimeoutRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Original canvas dimensions
  const originalWidth = 1872;
  const originalHeight = 1404;

  // Throttle rate for canvas updates in milliseconds
  // const THROTTLE_RATE = 50; // 20 updates per second should be good for e-ink displays
  const THROTTLE_RATE = 200;

  // Setup canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initial setup
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      // Clean up any pending timeouts when component unmounts
      if (throttleTimeoutRef.current !== null) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = colorMode === "dark" ? "#000000" : "#FFFFFF"; // Set background color based on theme
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [colorMode]);

  const handleResize = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit container while maintaining aspect ratio
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Limit to maximum of 1

    // Calculate new dimensions
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;

    // Set canvas display size (CSS)
    canvas.style.width = `${scaledWidth}px`;
    canvas.style.height = `${scaledHeight}px`;

    // Set canvas drawing buffer size to match original dimensions for consistent drawing quality
    canvas.width = originalWidth;
    canvas.height = originalHeight;

    // Set drawing styles
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  // Convert event coordinates to canvas coordinates
  const getCanvasCoordinates = (e: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ("touches" in e) {
      // Touch event
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculate the scale ratio between the CSS size and the internal canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Convert client coordinates to canvas coordinates
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Draw smooth curve
  const drawSmoothLine = (newPoint: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Add the new point to our collection
    pointsRef.current.push(newPoint);

    // Need at least 2 points to draw a line
    if (pointsRef.current.length < 2) return;

    // If we have exactly 2 points, draw a straight line
    if (pointsRef.current.length === 2) {
      const p1 = pointsRef.current[0];
      const p2 = pointsRef.current[1];

      ctx.beginPath();
      ctx.strokeStyle = colorMode === "dark" ? "#FFFFFF" : "#000000"; // Set stroke color based on theme
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      return;
    }

    // For 3 or more points, use a quadratic curve for smoothing

    // Get the last 3 points
    const points = pointsRef.current.slice(-3);

    // Start a new path for this segment
    ctx.beginPath();

    // If this is the 3rd point (just starting the smooth curve)
    if (pointsRef.current.length === 3) {
      // Move to the first point
      ctx.moveTo(points[0].x, points[0].y);
    } else {
      // We're continuing an existing curve
      // Move to the midpoint of the 1st and 2nd points
      const midX1 = (points[0].x + points[1].x) / 2;
      const midY1 = (points[0].y + points[1].y) / 2;
      ctx.moveTo(midX1, midY1);
    }

    // Calculate the midpoint between points 2 and 3
    const midX2 = (points[1].x + points[2].x) / 2;
    const midY2 = (points[1].y + points[2].y) / 2;

    // Draw a quadratic curve from current position to the midpoint,
    // with the middle point as control point
    ctx.quadraticCurveTo(points[1].x, points[1].y, midX2, midY2);

    ctx.stroke();

    // Keep only the last 50 points to prevent memory issues
    // on very long strokes
    if (pointsRef.current.length > 50) {
      pointsRef.current = pointsRef.current.slice(-50);
    }
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    const point = getCanvasCoordinates(e.nativeEvent);
    if (!point) return;

    setIsDrawing(true);
    lastPointRef.current = point;
    pointsRef.current = [point]; // Reset the points array

    // Draw a dot at the starting point
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(point.x, point.y, 1, 0, Math.PI * 2);
    ctx.fill();

    // Initial update for onChange callback
    updateCanvasBlob();
  };

  // Draw line
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();

    if (!isDrawing) return;

    const currentPoint = getCanvasCoordinates(e.nativeEvent);
    if (!currentPoint || !lastPointRef.current) return;

    // Calculate distance from last point
    const dx = currentPoint.x - lastPointRef.current.x;
    const dy = currentPoint.y - lastPointRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only process points that are at least a minimum distance apart
    // This helps smooth out the drawing and improve performance
    if (distance >= 2) {
      drawSmoothLine(currentPoint);
      lastPointRef.current = currentPoint;

      // Trigger canvas update for onChange callback
      updateCanvasBlob();
    }
  };

  // Convert canvas to Blob and call onChange callback
  const updateCanvasBlob = useCallback(() => {
    if (!onChange) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const now = Date.now();

    // Throttle updates
    if (now - lastUpdateTimeRef.current < THROTTLE_RATE) {
      // If an update is already scheduled, don't schedule another one
      if (throttleTimeoutRef.current !== null) return;

      // Schedule an update for later
      throttleTimeoutRef.current = window.setTimeout(() => {
        updateCanvasBlob();
        throttleTimeoutRef.current = null;
      }, THROTTLE_RATE - (now - lastUpdateTimeRef.current));

      return;
    }

    // Update the last update time
    lastUpdateTimeRef.current = now;

    // Use requestAnimationFrame to ensure this doesn't block the UI thread
    requestAnimationFrame(() => {
      canvas.toBlob((blob) => {
        if (blob && onChange) {
          onChange(blob);
        }
      }, "image/png");
    });
  }, [onChange]);

  // Stop drawing
  const stopDrawing = () => {
    if (isDrawing) {
      // Ensure we get a final update when drawing stops
      updateCanvasBlob();
    }

    setIsDrawing(false);
    lastPointRef.current = null;

    // Clear any pending throttled updates
    if (throttleTimeoutRef.current !== null) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }

    // Manually trigger a canvas update to ensure the last stroke is captured
    updateCanvasBlob();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = colorMode === "dark" ? "#000000" : "#FFFFFF"; // Set background color based on theme
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pointsRef.current = []; // Clear the points array
    lastPointRef.current = null;

    setIsDrawing(false);

    // Run onClear callback if provided
    if (onClear) {
      onClear();
    }
  };

  const toggleColorMode = () => {
    setColorMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className={styles.drawingCanvasContainer} ref={containerRef}>
      <canvas
        ref={canvasRef}
        className={styles.drawingCanvas}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
      <Flex style={{ gap: "1rem" }}>
        <Button onClick={clear}>Clear</Button>
        <Button onClick={toggleColorMode}>
          {colorMode === "dark" ? "Go Light" : "Go Dark"}
        </Button>
      </Flex>
    </div>
  );
};

export default DrawingCanvas;
