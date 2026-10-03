import { comandos, Commands } from "../constantes/cmds.js";
import CommandInput from "../components/CmdInput/index.js";
import {
  getGitHubRepos,
  filterAndSortRepos,
  extractLanguages,
  languageColors,
  getConfiguredGitHubUsers
} from "../services/githubService.js";

export default function Projects(conteiner) {
  if (!conteiner) return;

  const configuredUsers = getConfiguredGitHubUsers();
  const showUserFilter = configuredUsers.length > 1;

  conteiner.innerHTML = `
    <div class="projects-container" style="font-family: monospace; color: #eceff4; display: flex; flex-direction: column; height: 100%;">
      <!-- Header -->
      <div style="margin-bottom: 10px; border-bottom: 1px solid rgba(67, 76, 94, 0.6); padding-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="color: #a3be8c; font-weight: bold; font-size: 14px;">📁 ~/projects</span>
            <span style="color: #81a1c1; font-size: 12px; margin-left: 8px;">(Repositórios do GitHub)</span>
          </div>
          <div id="projects-status-badge" style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #88c0d0; background: rgba(59, 66, 82, 0.5); padding: 3px 8px; border-radius: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #a3be8c; display: inline-block;"></span>
            <span id="projects-status-text">Sincronizando...</span>
            <button id="btn-refresh-repos" title="Recarregar repositórios do GitHub" style="background: none; border: none; color: #88c0d0; cursor: pointer; font-size: 12px; padding: 0 2px;">⟳</button>
          </div>
        </div>

        <!-- Read-only GitHub Accounts Info Bar -->
        <div style="margin-top: 8px; background: rgba(30, 34, 42, 0.6); border: 1px solid rgba(67, 76, 94, 0.5); border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="color: #81a1c1; font-size: 11px; font-weight: bold;">Contas Conectadas:</span>
          <div id="github-users-list" style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${configuredUsers
              .map(
                (u) => `
                <a href="https://github.com/${u}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; background: #3b4252; color: #88c0d0; border: 1px solid #434c5e; border-radius: 4px; padding: 2px 7px; font-size: 11px; text-decoration: none;" title="Ver perfil no GitHub">
                  <span>@${u}</span>
                  <span style="font-size: 9px; color: #81a1c1;">↗</span>
                </a>
              `
              )
              .join("")}
          </div>
        </div>

        <!-- Filter, Account Filter and Search Controls -->
        <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; min-width: 180px;">
            <span style="position: absolute; left: 10px; top: 7px; color: #81a1c1; font-size: 12px;">🔍</span>
            <input 
              type="text" 
              id="projects-search-input" 
              placeholder="Filtrar por nome, descrição ou tag..." 
              autocomplete="off"
              spellcheck="false"
              style="width: 100%; box-sizing: border-box; background: rgba(30, 34, 42, 0.8); border: 1px solid #434c5e; border-radius: 5px; color: #eceff4; font-family: monospace; font-size: 12px; padding: 6px 10px 6px 28px; outline: none;"
            />
          </div>

          ${
            showUserFilter
              ? `
            <select id="projects-user-select" style="background: rgba(30, 34, 42, 0.8); border: 1px solid #434c5e; border-radius: 5px; color: #d8dee9; font-family: monospace; font-size: 12px; padding: 6px 10px; outline: none; cursor: pointer;">
              <option value="all">Todas as Contas</option>
              ${configuredUsers.map((u) => `<option value="${u}">@${u}</option>`).join("")}
            </select>
          `
              : ""
          }

          <!-- Sort selector -->
          <select id="projects-sort-select" style="background: rgba(30, 34, 42, 0.8); border: 1px solid #434c5e; border-radius: 5px; color: #d8dee9; font-family: monospace; font-size: 12px; padding: 6px 10px; outline: none; cursor: pointer;">
            <option value="updated">Mais Recentes</option>
            <option value="stars">Mais Estrelas ★</option>
            <option value="name">Nome (A-Z)</option>
          </select>
        </div>

        <!-- Language Filter Chips -->
        <div id="language-chips" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
          <button class="lang-chip active" data-lang="all" style="background: #88c0d0; color: #2e3440; border: none; border-radius: 4px; padding: 3px 8px; font-size: 11px; font-weight: bold; cursor: pointer; font-family: monospace;">
            Todos
          </button>
        </div>
      </div>

      <!-- Project Cards Scroll Area -->
      <div id="projects-list" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
        <div style="color: #81a1c1; font-size: 13px; text-align: center; padding: 30px 0;">
          Carregando repositórios do GitHub...
        </div>
      </div>

      <!-- Terminal Input for Projects Window -->
      <div id="projects-cmd-wrapper" style="margin-top: 12px; border-top: 1px solid rgba(67, 76, 94, 0.4); padding-top: 8px;"></div>
    </div>
  `;

  const searchInput = conteiner.querySelector("#projects-search-input");
  const userSelect = conteiner.querySelector("#projects-user-select");
  const sortSelect = conteiner.querySelector("#projects-sort-select");
  const chipsContainer = conteiner.querySelector("#language-chips");
  const listContainer = conteiner.querySelector("#projects-list");
  const statusText = conteiner.querySelector("#projects-status-text");
  const btnRefresh = conteiner.querySelector("#btn-refresh-repos");
  const cmdWrapper = conteiner.querySelector("#projects-cmd-wrapper");

  let allRepos = [];
  let currentFilter = {
    query: "",
    language: "all",
    user: "all",
    sort: "updated"
  };

  function renderCards(repos) {
    if (!listContainer) return;

    if (!repos || repos.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: #81a1c1;">
          <p style="margin: 0 0 6px 0; font-size: 14px;">Nenhum repositório encontrado com os filtros atuais.</p>
          <p style="margin: 0; font-size: 12px; color: #616e88;">Tente mudar o termo de busca ou selecionar "Todos".</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = repos
      .map((repo) => {
        const lang = repo.language || "Sem linguagem";
        const langColor = languageColors[lang] || languageColors.Default;
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const repoOwner = repo.github_user || repo.owner?.login || "hubertramos";
        const updatedDate = repo.updated_at
          ? new Date(repo.updated_at).toLocaleDateString("pt-BR", { month: "short", day: "numeric", year: "numeric" })
          : "";

        const homepageBtn = repo.homepage
          ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" style="background: rgba(163, 190, 140, 0.2); color: #a3be8c; border: 1px solid #a3be8c; padding: 2px 7px; border-radius: 4px; font-size: 10px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
              <span>🌐</span> Live Demo
            </a>`
          : "";

        return `
        <div class="project-card" style="background: rgba(46, 52, 64, 0.7); border: 1px solid #434c5e; border-radius: 6px; padding: 12px 14px; transition: border-color 0.15s ease, background 0.15s ease;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="color: #88c0d0; font-size: 14px;">📁</span>
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color: #88c0d0; font-weight: bold; font-size: 14px; text-decoration: none;" title="Abrir no GitHub">
                ${repo.name}
              </a>
              ${
                showUserFilter
                  ? `<a href="https://github.com/${repoOwner}" target="_blank" rel="noopener noreferrer" style="background: rgba(136, 192, 208, 0.15); color: #81a1c1; border: 1px solid rgba(136, 192, 208, 0.3); padding: 1px 6px; border-radius: 3px; font-size: 10px; text-decoration: none;" title="Conta GitHub">@${repoOwner}</a>`
                  : ""
              }
            </div>
            
            <div style="display: flex; align-items: center; gap: 8px;">
              ${homepageBtn}
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="background: #3b4252; color: #eceff4; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Ver código no GitHub">
                <span>↗ GitHub</span>
              </a>
            </div>
          </div>

          <p style="color: #d8dee9; font-size: 12px; margin: 8px 0; line-height: 1.4;">
            ${repo.description || '<span style="color: #616e88; font-style: italic;">Sem descrição fornecida no repositório.</span>'}
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: 11px; color: #81a1c1;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="display: inline-flex; align-items: center; gap: 5px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${langColor}; display: inline-block;"></span>
                <span style="color: #eceff4;">${lang}</span>
              </span>

              ${stars > 0 ? `<span style="color: #ebcb8b;">★ ${stars}</span>` : ""}
              ${forks > 0 ? `<span style="color: #81a1c1;">⑂ ${forks}</span>` : ""}
            </div>

            <div style="color: #616e88;">
              Atualizado em ${updatedDate}
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    listContainer.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.borderColor = "#88c0d0";
        card.style.background = "rgba(59, 66, 82, 0.7)";
      });
      card.addEventListener("mouseleave", () => {
        card.style.borderColor = "#434c5e";
        card.style.background = "rgba(46, 52, 64, 0.7)";
      });
    });
  }

  function updateView() {
    const filtered = filterAndSortRepos(allRepos, currentFilter);
    renderCards(filtered);

    if (statusText) {
      statusText.textContent = `${filtered.length} de ${allRepos.length} repositórios`;
    }
  }

  function renderChips() {
    if (!chipsContainer) return;
    const languages = extractLanguages(allRepos);

    let html = `
      <button class="lang-chip ${currentFilter.language === "all" ? "active" : ""}" data-lang="all" style="${getChipStyle(
      currentFilter.language === "all"
    )}">
        Todos (${allRepos.length})
      </button>
    `;

    languages.forEach((lang) => {
      const count = allRepos.filter((r) => r.language === lang).length;
      const isActive = currentFilter.language.toLowerCase() === lang.toLowerCase();
      html += `
        <button class="lang-chip ${isActive ? "active" : ""}" data-lang="${lang}" style="${getChipStyle(isActive)}">
          ${lang} (${count})
        </button>
      `;
    });

    chipsContainer.innerHTML = html;

    chipsContainer.querySelectorAll(".lang-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        currentFilter.language = lang;
        renderChips();
        updateView();
      });
    });
  }

  function getChipStyle(isActive) {
    if (isActive) {
      return "background: #88c0d0; color: #2e3440; border: none; border-radius: 4px; padding: 3px 9px; font-size: 11px; font-weight: bold; cursor: pointer; font-family: monospace;";
    }
    return "background: rgba(59, 66, 82, 0.6); color: #d8dee9; border: 1px solid #434c5e; border-radius: 4px; padding: 3px 9px; font-size: 11px; cursor: pointer; font-family: monospace;";
  }

  async function loadData(forceRefresh = false) {
    if (statusText) {
      statusText.textContent = "Sincronizando com GitHub...";
    }
    const repos = await getGitHubRepos(forceRefresh);
    allRepos = Array.isArray(repos) ? repos : [];
    renderChips();
    updateView();
  }

  // Filter Listeners
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentFilter.query = e.target.value;
      updateView();
    });
  }

  if (userSelect) {
    userSelect.addEventListener("change", (e) => {
      currentFilter.user = e.target.value;
      updateView();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentFilter.sort = e.target.value;
      updateView();
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      loadData(true);
    });
  }

  // Initial load
  loadData();

  // Bottom CommandInput in projects pane
  if (cmdWrapper) {
    CommandInput(
      cmdWrapper,
      (comandoEscolhido) => {
        const parts = comandoEscolhido.trim().split(/\s+/);
        const first = parts[0].toLowerCase();

        if (first === "filter" || first === "search" || first === "find") {
          const query = parts.slice(1).join(" ");
          currentFilter.query = query;
          if (searchInput) searchInput.value = query;
          updateView();
          return;
        }

        if (first === "lang" || first === "language") {
          const lang = parts.slice(1).join(" ");
          currentFilter.language = lang || "all";
          renderChips();
          updateView();
          return;
        }

        Commands(comandoEscolhido);
      },
      comandos,
      { currentPath: "~/projects" }
    );
  }
}
