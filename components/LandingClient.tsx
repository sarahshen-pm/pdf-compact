"use client";

import { useState } from "react";
import Image from "next/image";
import PdfUploader from "@/components/PdfUploader";

interface LandingClientProps {
  initialMode: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  seoHeading?: React.ReactNode;
  seoText?: React.ReactNode;
}

export default function LandingClient({ initialMode, title, subtitle, seoHeading, seoText }: LandingClientProps) {
  const [isStarted, setIsStarted] = useState(false);

  if (isStarted) {
    return <PdfUploader mode={initialMode} onClose={() => setIsStarted(false)} />;
  }

  return (
    <main className="w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-800">
      <div className="flex min-h-[100svh] flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-teal-400/20 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-[-50%] right-[-20%] w-[300px] h-[300px] bg-emerald-400/20 rounded-full blur-[80px] -z-10" />

        <div className="max-w-4xl text-center space-y-6 z-10 relative w-full">
          <div className="flex flex-col items-center justify-center mb-6">
            <Image
              src="/logo2.png"
              alt="PrintPDF Logo"
              width={360}
              height={68}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight tracking-tight w-full max-w-5xl mx-auto md:whitespace-nowrap">
            {title}
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium mb-6">
            {subtitle}
            <span className="block mt-4 text-emerald-600 font-bold bg-emerald-100/50 inline-block px-6 py-2 rounded-full border border-emerald-200 shadow-sm">
              100% Free • Secure • Runs in your browser
            </span>
          </p>

          <div className="pt-2">
            <button 
              onClick={() => setIsStarted(true)}
              className="bg-emerald-600 text-white px-10 py-4 rounded-full text-xl font-bold shadow-xl hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-4 ring-emerald-600/20"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {seoHeading && seoText && (
        <div className="max-w-3xl mx-auto px-6 pb-24 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">{seoHeading}</h2>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">{seoText}</p>
        </div>
      )}
    </main>
  );
}
