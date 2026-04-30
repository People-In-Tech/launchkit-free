"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitGithubUsername, type SubmitGithubResult } from "./actions";

export function GithubUsernameForm({
  initialUsername,
  alreadyInvited,
}: {
  initialUsername: string | null;
  alreadyInvited: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SubmitGithubResult | null>(
    alreadyInvited
      ? { ok: true, invited: true, message: "Invite sent to your GitHub." }
      : null,
  );

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          setResult(await submitGithubUsername(fd));
        })
      }
      className="flex flex-col gap-3"
    >
      <label className="text-sm font-medium">GitHub username</label>
      <div className="flex gap-2">
        <input
          name="githubUsername"
          required
          defaultValue={initialUsername ?? ""}
          placeholder="octocat"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send invite"}
        </Button>
      </div>
      {result && result.ok && (
        <p className="text-sm text-green-500">{result.message}</p>
      )}
      {result && !result.ok && (
        <p className="text-sm text-red-500">{result.error}</p>
      )}
    </form>
  );
}
