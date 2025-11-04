const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
      header: "eyJmaWQiOjEzODczMzcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg5MkE0NDgzMzUyQjFGMDFmODViMjg5NjVmZmUzMjU2RkRlYmNEMzc4In0",
      payload: "eyJkb21haW4iOiJodXNhLXJvdWdlLnZlcmNlbC5hcHAifQ",
      signature: "ew0+c33OtG/rV6+XpEE6tlU6JvGT3BH2T+MC8SDfXW19cBpzxLAiQFylMcASbLJivAy90UD0d4+4czsaXzwuGhs="
  },
  miniapp: {
    version: "1",
    name: "Driving Road",
    subtitle: "Your AI Companion",
    description: "Get ready to hit the road! Driving Road is a fun and fast-paced mini driving game where you test your reflexes and driving skills.",
    screenshots: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#e6e6e6",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/blue-hero.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/blue-hero.png`
  },
  baseBuilder: {
    ownerAddress: "0x162cc17627C728839fb208b77f001688D04b9641"
  }
} as const;
