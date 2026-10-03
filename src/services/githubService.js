import { syncGitHubReposToFileSystem } from "../constantes/filesystem.js";

export const languageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Vue: "#41b883",
  React: "#61dafb",
  Default: "#88c0d0"
};

/**
 * Contas oficiais do GitHub exibidas no portfólio.
 * Para incluir mais contas, basta adicionar os usernames nesta lista.
 */
export const CONFIGURED_GITHUB_USERS = [
  "hubertramos",
  "hubertvariant"
];

let repoCache = null;
let isFetching = false;
const listeners = [];

/**
 * Retorna as contas de GitHub configuradas oficialmente
 */
export function getConfiguredGitHubUsers() {
  return [...CONFIGURED_GITHUB_USERS];
}

export function onReposUpdated(callback) {
  listeners.push(callback);
}

function notifyListeners(repos) {
  listeners.forEach((cb) => {
    try {
      cb(repos);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Busca automaticamente os repositórios de todas as contas oficiais configuradas
 */
export async function getGitHubRepos(forceRefresh = false) {
  if (repoCache && !forceRefresh) {
    return repoCache;
  }

  if (isFetching) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isFetching) {
          clearInterval(checkInterval);
          resolve(repoCache || []);
        }
      }, 50);
    });
  }

  isFetching = true;
  const users = getConfiguredGitHubUsers();

  try {
    const usersQuery = encodeURIComponent(users.join(","));
    let res = await fetch(`/api/repos?users=${usersQuery}`);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        repoCache = data;
        syncGitHubReposToFileSystem(data);
        notifyListeners(data);
        isFetching = false;
        return data;
      }
    }

    // Fallback de busca direta caso o backend não esteja disponível
    const directRepos = [];
    for (const user of users) {
      try {
        const directRes = await fetch(
          `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=100`
        );
        if (directRes.ok) {
          const directData = await directRes.json();
          if (Array.isArray(directData)) {
            directRepos.push(
              ...directData.map((r) => ({
                ...r,
                github_user: user
              }))
            );
          }
        }
      } catch (userErr) {
        console.warn(`Could not direct fetch for ${user}:`, userErr);
      }
    }

    if (directRepos.length > 0) {
      directRepos.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
      repoCache = directRepos;
      syncGitHubReposToFileSystem(directRepos);
      notifyListeners(directRepos);
      isFetching = false;
      return directRepos;
    }
  } catch (err) {
    console.warn("Could not fetch remote repositories, using cached/fallback:", err);
  }

  isFetching = false;

  // Fallback seguro caso a API esteja temporariamente indisponível
  if (!repoCache) {
    repoCache = [
      {
        id: 1,
        name: "Portif-lio",
        description: "Meu portfólio interativo desenvolvido em formato de terminal Linux.",
        language: "JavaScript",
        stargazers_count: 1,
        forks_count: 0,
        html_url: "https://github.com/HubertRamos/Portif-lio",
        homepage: "",
        github_user: "hubertramos",
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "python-automations",
        description: "Scripts em Python para automações cotidianas e web scraping.",
        language: "Python",
        stargazers_count: 0,
        forks_count: 0,
        html_url: "https://github.com/hubertramos",
        homepage: "",
        github_user: "hubertramos",
        updated_at: new Date().toISOString()
      }
    ];
    syncGitHubReposToFileSystem(repoCache);
    notifyListeners(repoCache);
  }

  return repoCache;
}

/**
 * Filtra e ordena os repositórios das contas configuradas
 */
export function filterAndSortRepos(repos, { query = "", language = "all", user = "all", sort = "updated" } = {}) {
  if (!Array.isArray(repos)) return [];

  let result = [...repos];

  // Filtro por usuário/conta GitHub
  if (user && user !== "all") {
    const targetUser = user.toLowerCase().replace(/^@/, "");
    result = result.filter((repo) => {
      const repoUser = (repo.github_user || repo.owner?.login || "").toLowerCase();
      return repoUser === targetUser;
    });
  }

  // Filtro por termo de busca
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter((repo) => {
      const name = (repo.name || "").toLowerCase();
      const desc = (repo.description || "").toLowerCase();
      const lang = (repo.language || "").toLowerCase();
      const repoUser = (repo.github_user || repo.owner?.login || "").toLowerCase();
      const topics = Array.isArray(repo.topics) ? repo.topics.join(" ").toLowerCase() : "";
      return (
        name.includes(q) ||
        desc.includes(q) ||
        lang.includes(q) ||
        topics.includes(q) ||
        repoUser.includes(q)
      );
    });
  }

  // Filtro por linguagem
  if (language && language !== "all") {
    const targetLang = language.toLowerCase();
    result = result.filter((repo) => (repo.language || "").toLowerCase() === targetLang);
  }

  // Ordenação
  if (sort === "stars") {
    result.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  } else if (sort === "name") {
    result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else {
    // padrão: atualizados recentemente
    result.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  }

  return result;
}

/**
 * Extrai as linguagens únicas presentes nos repositórios
 */
export function extractLanguages(repos) {
  if (!Array.isArray(repos)) return [];
  const set = new Set();
  repos.forEach((r) => {
    if (r.language) {
      set.add(r.language);
    }
  });
  return Array.from(set).sort();
}
