import { Navbar } from "@/components/layout/Navbar";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <RequireAuth>{children}</RequireAuth>
      </main>
    </div>
  );
}
