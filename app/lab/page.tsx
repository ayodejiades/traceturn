import { DashboardShell } from "@/components/dashboard-shell";
import { ChaosLab } from "@/components/chaos-lab";

export const metadata = {
  title: "Reliability & Chaos Lab | System Resilience Verification",
  description: "Interactive stress-testing, fault injection, and self-healing telemetry.",
};

export default function LabPage() {
  return (
    <DashboardShell project="traceturn Platform">
      <ChaosLab />
    </DashboardShell>
  );
}
