// Vercel Serverless Function for /api/repos
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { users = 'hubertramos,hubertvariant' } = req.query;
  const usernames = users
    .split(',')
    .map((u) => u.trim().replace(/^@/, ''))
    .filter(Boolean);

  if (usernames.length === 0) {
    usernames.push('hubertramos');
  }

  const allRepos = [];

  for (const username of usernames) {
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
          allRepos.push(...tagged);
        }
      } else {
        console.warn(`GitHub API status ${response.status} for ${username}`);
      }
    } catch (err) {
      console.error(`Failed to fetch GitHub repos for user ${username}:`, err);
    }
  }

  allRepos.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  return res.status(200).json(allRepos);
}
