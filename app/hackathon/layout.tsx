import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "CineMatch Intelligence - RecSys Telemetry & Diagnostic Matrix",
  description: "Personalized OTT catalog recommendations, subscriber taste clustering, and predictive retention telemetry.",
};

export default function HackathonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}