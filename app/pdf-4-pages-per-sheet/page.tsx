import { Metadata } from "next";
import LandingClient from "@/components/LandingClient";

export const metadata: Metadata = {
  title: "PDF 4 Pages Per Sheet - Save Paper",
  description: "Combine 4 PDF pages into one sheet with minimal spacing. The most elegant way to print 4 pages per sheet.",
  alternates: {
    canonical: "/pdf-4-pages-per-sheet",
  },
};

export default function Page() {
  return (
    <LandingClient
      initialMode="2x2"
      title={
        <>
          PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">4 Pages</span> Per Sheet
        </>
      }
      subtitle={
        <>
          Save paper when printing PDFs.<br />
          Combine 4 pages into one sheet with minimal spacing.
        </>
      }
      seoHeading="How to print 4 pages per sheet PDF?"
      seoText="This tool helps you fit 4 pages on one sheet seamlessly. By using our advanced compression and alignment algorithms, your PDF will be formatted into a clean 2x2 layout with minimized margins, ensuring the text remains legible while significantly reducing your paper usage."
    />
  );
}
