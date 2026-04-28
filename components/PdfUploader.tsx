"use client";

import { useState } from "react";
import { processPdf } from "@/lib/pdfProcessor";

export default function PdfUploader({ mode }: { mode: string }) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const result = await processPdf(file, mode);

    const blob = new Blob([result as any], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "output.pdf";
    a.click();
  };

  return (
    <div className="border p-4 rounded-xl">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Generate PDF
      </button>
    </div>
  );
}
