import { Metadata } from "next";
import LandingClient from "@/components/LandingClient";

export const metadata: Metadata = {
  title: "PDF 2 Pages Per Sheet - Save Paper",
  description: "Combine 2 PDF pages into one sheet with minimal spacing. The most elegant way to print 2 pages per sheet.",
  alternates: {
    canonical: "/pdf-2-pages-per-sheet",
  },
};

export default function Page() {
  return (
    <LandingClient
      initialMode="1x2"
      title={
        <>
          PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">2 Pages</span> Per Sheet
        </>
      }
      subtitle={
        <>
          Save paper when printing PDFs.<br />
          Combine 2 pages into one sheet side-by-side with minimal spacing.
        </>
      }
      seoHeading="How to print 2 pages per sheet PDF?"
      seoText="This tool provides an elegant way to print 2 PDF pages on a single sheet. We automatically remove excessive white borders and align your pages side-by-side, maximizing readability and saving paper costs instantly without any complex software."
    />
  );
}
