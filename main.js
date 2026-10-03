import renderWindows from "./windowManager.js";
import { getGitHubRepos } from "./src/services/githubService.js";

function Render() {
  renderWindows();
  // Automatically pull GitHub repositories in the background
  getGitHubRepos().catch((err) => {
    console.warn("Background GitHub repos prefetch error:", err);
  });
}

window.addEventListener("DOMContentLoaded", Render);
