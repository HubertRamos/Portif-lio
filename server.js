import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// In-memory cache per GitHub user
const userRepoCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache per user

// Multi-user GitHub repositories proxy endpoint
app.get('/api/repos', async (req, res) => {
  const usersParam = req.query.users || 'hubertramos';
  const usernames = usersParam
    .split(',')
    .map((u) => u.trim().replace(/^@/, ''))
    .filter(Boolean);

  if (usernames.length === 0) {
    usernames.push('hubertramos');
  }

  const now = Date.now();
  const allRepos = [];

  for (const username of usernames) {
    const cached = userRepoCache.get(username.toLowerCase());
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      allRepos.push(...cached.data);
      continue;
    }

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
        {
          headers: {
            'User-Agent': 'HubertRamos-Portfolio/1.0',
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      if (response.ok) {
        const repos = await response.json();
        if (Array.isArray(repos)) {
          const tagged = repos.map((r) => ({
            ...r,
            github_user: username
          }));
          userRepoCache.set(username.toLowerCase(), { data: tagged, timestamp: now });
          allRepos.push(...tagged);
        }
      } else {
        console.warn(`GitHub API returned status ${response.status} for user ${username}`);
        if (cached) {
          allRepos.push(...cached.data);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch GitHub repos for user ${username}:`, err);
      if (cached) {
        allRepos.push(...cached.data);
      }
    }
  }

  allRepos.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  return res.json(allRepos);
});

// Static assets
app.use(express.static(__dirname));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
