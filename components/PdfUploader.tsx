"use client";

import { useState, useEffect, useRef } from "react";
import { processPdf } from "@/lib/pdfProcessor";
import Image from "next/image";

export default function PdfUploader({ mode: initialMode, onClose }: { mode: string; onClose?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageStats, setPageStats] = useState<{ original: number; final: number } | null>(null);
  const [removeMargins, setRemoveMargins] = useState(true);
  const [marginsCache, setMarginsCache] = useState<{ file: File; margins: any[] } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate preview whenever file, mode, or orientation changes
  useEffect(() => {
    let active = true;

    const generatePreview = async () => {
      if (!file) {
        setPreviewUrl(null);
        setPageStats(null);
        return;
      }

      setIsProcessing(true);
      try {
        let marginsToUse = undefined;
        if (removeMargins) {
          if (marginsCache?.file === file) {
            marginsToUse = marginsCache.margins;
          } else {
            const { detectMargins } = await import("@/lib/marginDetector");
            marginsToUse = await detectMargins(file);
            if (active) setMarginsCache({ file, margins: marginsToUse });
          }
        }

        const { pdfBytes, originalPageCount } = await processPdf(file, currentMode, orientation, marginsToUse);
        if (!active) return;
        
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        
        setPreviewUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });

        let perPage = 9;
        if (currentMode === "2x2") perPage = 4;
        if (currentMode === "1x2") perPage = 2;
        
        setPageStats({
          original: originalPageCount,
          final: Math.ceil(originalPageCount / perPage)
        });

      } catch (error) {
        console.error(error);
      } finally {
        if (active) setIsProcessing(false);
      }
    };

    generatePreview();

    return () => {
      active = false;
    };
  }, [file, currentMode, orientation, removeMargins, marginsCache]);

  const handleDownload = () => {
    if (!previewUrl || !file) return;
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `PDF-Compact-${currentMode}-${orientation}-${file.name}`;
    a.click();
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleClose = () => {
    setFile(null);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-in fade-in duration-300">
      {/* Header: 1 Row */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center">
          <Image src="/logo2.png" alt="PDF-Compact Logo" width={240} height={46} className="object-contain drop-shadow-sm" priority />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClose}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors px-3 py-2 hover:bg-slate-50 rounded-lg"
            title="Close Workspace"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6">
        
        {/* Left Side: Controls & Info */}
        <div className="w-full md:w-[320px] lg:w-[360px] flex flex-col gap-4 shrink-0 overflow-y-auto hide-scrollbar pb-2">
          
          <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 p-4 rounded-xl flex flex-col items-center justify-center transition-colors hover:bg-emerald-50">
            <label className="cursor-pointer w-full flex flex-col items-center">
              <svg className="w-8 h-8 text-emerald-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <span className="bg-emerald-600 text-white px-6 py-2 rounded-full font-bold shadow-sm hover:bg-emerald-700 w-full text-center transition-all text-sm">
                {file ? "Replace PDF File" : "Choose PDF File"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {file && (
            <>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-800 mb-1 truncate text-sm" title={file.name}>
                  📄 {file.name}
                </h3>
                {pageStats && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs">Original</span>
                      <span className="font-bold text-slate-700">{pageStats.original} <span className="text-xs font-normal text-slate-400">pages</span></span>
                    </div>
                    <div className="text-emerald-300 text-xs">➜</div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-500 text-xs">Compressed</span>
                      <span className="font-bold text-emerald-600">{pageStats.final} <span className="text-xs font-normal text-emerald-400">sheets</span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-500 ml-1">Grid Layout</span>
                <div className="grid grid-cols-3 bg-slate-200 p-1 rounded-lg shadow-inner">
                  {[
                    { id: "3x3", label: "9 Pages", url: "/pdf-9-pages-per-sheet" },
                    { id: "2x2", label: "4 Pages", url: "/pdf-4-pages-per-sheet" },
                    { id: "1x2", label: "2 Pages", url: "/pdf-2-pages-per-sheet" },
                  ].map((grid) => (
                    <button
                      key={grid.id}
                      onClick={() => {
                        setCurrentMode(grid.id);
                        window.history.pushState(null, "", grid.url);
                      }}
                      className={`py-1.5 rounded-md text-xs font-semibold transition-all ${
                        currentMode === grid.id
                          ? "bg-white text-emerald-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {grid.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-slate-500 ml-1">Orientation</span>
                <div className="flex bg-slate-200 p-1 rounded-lg shadow-inner">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      orientation === "portrait"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    📄 Portrait
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      orientation === "landscape"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    🗤 Landscape
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <div className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg>
                    <span className="text-xs font-bold text-slate-700">Auto-Trim Margins</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={removeMargins}
                      onChange={(e) => setRemoveMargins(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-2">
                <button
                  onClick={handlePrint}
                  disabled={!previewUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-semibold px-4 py-3 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50 shadow-sm text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Direct Print
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!previewUrl || isProcessing}
                  className="w-full relative group overflow-hidden bg-slate-900 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 text-sm"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 disabled:hidden" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download PDF
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 relative bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden flex flex-col items-center justify-center">
          {!file ? (
            <div className="text-slate-400 flex flex-col items-center">
              <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="text-lg font-medium text-slate-500">Please choose a PDF file from the left panel to begin</p>
            </div>
          ) : isProcessing ? (
            <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center bg-white/80 backdrop-blur-sm z-10">
              <svg className="animate-spin h-8 w-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-slate-600">Processing Pages...</span>
            </div>
          ) : previewUrl ? (
            <iframe
              ref={iframeRef}
              src={`${previewUrl}#toolbar=0`}
              className="w-full h-full border-none bg-slate-200/50"
              title="PDF Preview"
            />
          ) : null}
        </div>
        
      </div>
    </div>
  );
}
