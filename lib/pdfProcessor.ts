import { PDFDocument } from "pdf-lib";
import type { MarginPercents } from "./marginDetector";

export async function processPdf(
  file: File,
  mode: string,
  orientation: "portrait" | "landscape" = "portrait",
  margins?: MarginPercents[]
) {
  const bytes = await file.arrayBuffer();

  const pdfDoc = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();

  const pages = pdfDoc.getPages();

  let perPage = 9;
  let cols = 3;
  let rows = 3;

  if (mode === "2x2") {
    perPage = 4;
    cols = 2;
    rows = 2;
  } else if (mode === "1x2") {
    perPage = 2;
    cols = 1;
    rows = 2;
  }

  const A4_WIDTH = 595;
  const A4_HEIGHT = 842;

  const pageW = orientation === "landscape" ? A4_HEIGHT : A4_WIDTH;
  const pageH = orientation === "landscape" ? A4_WIDTH : A4_HEIGHT;

  if (mode === "1x2" && orientation === "landscape") {
    cols = 2;
    rows = 1;
  }

  for (let i = 0; i < pages.length; i += perPage) {
    const newPage = newPdf.addPage([pageW, pageH]);

    const chunk = pages.slice(i, i + perPage);

    const cellWidth = pageW / cols;
    const cellHeight = pageH / rows;

    for (let j = 0; j < chunk.length; j++) {
      const p = chunk[j];
      const pageIndex = i + j;
      
      let boundingBox = undefined;
      if (margins && margins[pageIndex]) {
        const m = margins[pageIndex];
        const { width, height } = p.getSize();
        
        // Ensure valid margins
        if (m.left < 1 && m.right < 1 && m.top < 1 && m.bottom < 1) {
          const newX = width * m.left;
          const newY = height * m.bottom; // bottom-left origin
          const newWidth = width * (1 - m.left - m.right);
          const newHeight = height * (1 - m.top - m.bottom);
          
          boundingBox = {
            left: newX,
            bottom: newY,
            right: newX + newWidth,
            top: newY + newHeight,
          };
        }
      }

      const embedded = await newPdf.embedPage(p, boundingBox);

      const row = Math.floor(j / cols);
      const col = j % cols;

      // Proportional scaling to fit within the cell
      const scale = Math.min(cellWidth / embedded.width, cellHeight / embedded.height);
      const scaledWidth = embedded.width * scale;
      const scaledHeight = embedded.height * scale;
      
      // Center the scaled page within the cell
      const xOffset = (cellWidth - scaledWidth) / 2;
      const yOffset = (cellHeight - scaledHeight) / 2;

      newPage.drawPage(embedded, {
        x: col * cellWidth + xOffset,
        y: pageH - (row + 1) * cellHeight + yOffset,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
  }

  return {
    pdfBytes: await newPdf.save(),
    originalPageCount: pages.length,
  };
}
