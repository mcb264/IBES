import CloudBootstrap from "@/components/CloudBootstrap";
import GlobalInbox from "@/components/GlobalInbox";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <CloudBootstrap>
      {children}
      <GlobalInbox />
    </CloudBootstrap>
  );
}
