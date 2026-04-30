import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { PortalSidebar } from "@/components/portal/sidebar";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/portal" className="flex items-center gap-2 font-bold text-xl">
            <Logo size={28} />
            LaunchKit
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/portal" className="text-muted-foreground hover:text-foreground transition-colors">Portal</Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <PortalSidebar />
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
