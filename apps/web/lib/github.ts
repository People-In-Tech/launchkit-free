import { Octokit } from "@octokit/rest";

/**
 * GitHub collaborator invite helper. Uses a single bot PAT stored in
 * LAUNCHKIT_GITHUB_TOKEN with `repo` scope on the private LaunchKit repo.
 *
 * The repo is configured via LAUNCHKIT_PRIVATE_REPO_SLUG in `owner/repo` form
 * (e.g. "People-In-Tech/launchkit-pro").
 */
function getOctokit(): Octokit {
  const token = process.env.LAUNCHKIT_GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "LAUNCHKIT_GITHUB_TOKEN is not set. Add a bot PAT with `repo` scope to .env.local.",
    );
  }
  return new Octokit({ auth: token });
}

function getRepoSlug(): { owner: string; repo: string } {
  const slug = process.env.LAUNCHKIT_PRIVATE_REPO_SLUG;
  if (!slug || !slug.includes("/")) {
    throw new Error(
      "LAUNCHKIT_PRIVATE_REPO_SLUG is not set. Use the form 'owner/repo'.",
    );
  }
  const [owner, repo] = slug.split("/");
  return { owner, repo };
}

/**
 * Add `username` as a read-only collaborator on the private LaunchKit repo.
 * Idempotent at the GitHub level — re-inviting an already-invited user is a
 * no-op on GitHub's side. Throws on GitHub API errors (caller surfaces them).
 */
export async function inviteCollaborator(username: string): Promise<void> {
  const octokit = getOctokit();
  const { owner, repo } = getRepoSlug();
  await octokit.rest.repos.addCollaborator({
    owner,
    repo,
    username,
    permission: "pull",
  });
}
