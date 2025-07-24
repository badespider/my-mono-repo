import { SimpleAppShell } from "@/components/layout/SimpleAppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SimpleAppShell>{children}</SimpleAppShell>;
}
