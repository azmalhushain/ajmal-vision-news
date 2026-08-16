import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchPostsTool from "./tools/search-posts";
import getPostTool from "./tools/get-post";
import listPodcastsTool from "./tools/list-podcasts";
import listMatchesTool from "./tools/list-matches";
import listPlayersTool from "./tools/list-players";
import listTeamsTool from "./tools/list-teams";
import getMyProfileTool from "./tools/get-my-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "ajmal-akhtar-azad",
  title: "AJMAL AKHTAR AZAD",
  version: "0.1.0",
  instructions:
    "Tools for the AJMAL AKHTAR AZAD website. Read news articles, podcast episodes, cricket tournament fixtures, teams and players, and the signed-in user's profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchPostsTool,
    getPostTool,
    listPodcastsTool,
    listMatchesTool,
    listPlayersTool,
    listTeamsTool,
    getMyProfileTool,
  ],
});
