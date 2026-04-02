import { PublicShell } from "@/components/website/PublicShell";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
