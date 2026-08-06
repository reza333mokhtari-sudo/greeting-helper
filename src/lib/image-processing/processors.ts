
import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";
import { toast } from "sonner";

/**
 * Client-side background removal using @imgly/background-removal (WASM).
 */
export async function removeBackground(imageSrc: string): Promise<string> {
  try {
    const blob = await imglyRemoveBackground(imageSrc, {
      model: "isnet",
      output: {
        format: "image/png",
        quality: 0.9,
      },
      debug: false,
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Background removal failed:", error);
    toast.error("Background removal failed. Please try again.");
    throw error;
  }
}

/**
 * Pixelate an image using Canvas 2D.
 */
export async function pixelate(imageSrc: string, blockSize: number = 8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw downscaled
      const smallW = Math.max(1, Math.floor(img.width / blockSize));
      const smallH = Math.max(1, Math.floor(img.height / blockSize));
      const offscreen = document.createElement("canvas");
      offscreen.width = smallW;
      offscreen.height = smallH;
      const octx = offscreen.getContext("2d")!;
      octx.drawImage(img, 0, 0, smallW, smallH);

      // Draw back upscaled (pixelated)
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, img.width, img.height);
      
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

/**
 * Apply CSS-like filters and bake them into the image.
 */
export async function applyFilter(
  imageSrc: string,
  filter: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.filter = filter;
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

/**
 * Toon/Cartoon effect using edge detection and posterization.
 */
export async function toonify(imageSrc: string): Promise<string> {
  // Simple toon effect: high contrast + saturation + posterize-like feel via filter
  return applyFilter(imageSrc, "contrast(1.5) saturate(2) brightness(1.1) grayscale(0.2)");
}
