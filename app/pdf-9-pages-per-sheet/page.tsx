import { Metadata } from "next";
import LandingClient from "@/components/LandingClient";

export const metadata: Metadata = {
  title: "PDF 9 Pages Per Sheet - Save Paper",
  description: "Combine 9 PDF pages into one sheet with minimal spacing. The most elegant way to print 9 pages per sheet.",
  alternates: {
    canonical: "/pdf-9-pages-per-sheet",
  },
};

export default function Page() {
  return (
    <LandingClient
      initialMode="3x3"
      title={
        <>
          PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">9 Pages</span> Per Sheet
        </>
      }
      subtitle={
        <>
          Save paper when printing PDFs.<br />
          Combine 9 pages into one sheet with minimal spacing.
        </>
      }
      seoHeading="How to print 9 pages per sheet PDF?"
      seoText="This tool lets you combine 9 PDF pages into one single sheet effortlessly. Simply upload your file, and we will arrange your document into a highly optimized 3x3 grid layout with minimal margins. It's the perfect solution for saving paper and ink without sacrificing readability."
    />
  );
}
