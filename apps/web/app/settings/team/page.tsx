import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OrganizationProfile } from "@clerk/nextjs";

export default async function TeamSettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">Invite members and manage roles.</p>
      </div>

      <OrganizationProfile
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border rounded-lg w-full",
          },
        }}
      />
    </div>
  );
}
