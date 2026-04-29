import LandingClient from "@/components/LandingClient";

export default function Home() {
  return (
    <LandingClient
      initialMode="3x3"
      title={
        <>
          Save <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">paper</span> when printing PDFs
        </>
      }
      subtitle="Combine multiple pages into one sheet with minimal spacing."
    />
  );
}
