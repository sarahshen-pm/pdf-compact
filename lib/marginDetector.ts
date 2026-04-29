export interface MarginPercents {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export async function detectMargins(file: File): Promise<MarginPercents[]> {
  // Dynamically import to avoid Next.js SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Ensure worker is configured
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const margins: MarginPercents[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      // Use a small scale to be fast. We only need general bounds.
      const viewport = page.getViewport({ scale: 0.5 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        margins.push({ left: 0, top: 0, right: 0, bottom: 0 });
        continue;
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the page on the off-screen canvas
      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;

      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;

      // Detect non-white/non-transparent pixels
      const isWhiteOrTransparent = (r: number, g: number, b: number, a: number) => {
        if (a < 5) return true; // transparent
        return r > 245 && g > 245 && b > 245; // practically white
      };

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          if (!isWhiteOrTransparent(pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3])) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX > maxX || minY > maxY) {
        // Empty page or failed detection
        margins.push({ left: 0, top: 0, right: 0, bottom: 0 });
      } else {
        // Add a small 2% padding so we don't clip text too tightly
        const paddingX = canvas.width * 0.02;
        const paddingY = canvas.height * 0.02;

        minX = Math.max(0, minX - paddingX);
        minY = Math.max(0, minY - paddingY);
        maxX = Math.min(canvas.width, maxX + paddingX);
        maxY = Math.min(canvas.height, maxY + paddingY);

        margins.push({
          left: minX / canvas.width,
          top: minY / canvas.height,
          right: (canvas.width - maxX) / canvas.width,
          bottom: (canvas.height - maxY) / canvas.height,
        });
      }
    } catch (e) {
      console.error(`Failed to detect margin for page ${i}`, e);
      margins.push({ left: 0, top: 0, right: 0, bottom: 0 });
    }
  }

  return margins;
}
