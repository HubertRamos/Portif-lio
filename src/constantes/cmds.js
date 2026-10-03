import Projects from "../app/projects.js";
import { listDir, changeDir, readFile } from "./filesystem.js";
import ListaLinguagens from "./linguagens.js";
import {
  getGitHubRepos,
  filterAndSortRepos,
  languageColors,
  getConfiguredGitHubUsers
} from "../services/githubService.js";

export const comandos = [
  { cmd: "help", label: "help", desc: "Lista todos os comandos disponíveis" },
  { cmd: "ls", label: "ls", desc: "Lista arquivos e pastas do diretório atual" },
  { cmd: "cd projects", label: "cd projects", desc: "Navega para a pasta de projetos" },
  { cmd: "projects", label: "projects [filtro]", desc: "Puxa e filtra repositórios do GitHub" },
  { cmd: "github", label: "github", desc: "Exibe contas do GitHub conectadas" },
  { cmd: "cat skills.md", label: "cat skills.md", desc: "Lê o arquivo de habilidades e stacks" },
  { cmd: "cat bio.txt", label: "cat bio.txt", desc: "Lê a biografia do desenvolvedor" },
  { cmd: "cat contact.sh", label: "cat contact.sh", desc: "Exibe formas de contato" },
  { cmd: "pwd", label: "pwd", desc: "Exibe o diretório de trabalho atual" },
  { cmd: "neofetch", label: "neofetch", desc: "Exibe o resumo do perfil e stacks" },
  { cmd: "skills", label: "skills", desc: "Abre o painel de tecnologias" },
  { cmd: "contact", label: "contact", desc: "Abre o painel de contato" },
  { cmd: "clear", label: "clear", desc: "Limpa a saída do terminal" },
  { cmd: "whoami", label: "whoami", desc: "Exibe o usuário logado" },
  { cmd: "date", label: "date", desc: "Exibe a data e hora atual" },
  { cmd: "history", label: "history", desc: "Lista os comandos executados" }
];

/**
 * Executes a terminal command string within the terminal session
 */
export function executeCommand(rawInput, session) {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const argString = args.join(" ");

  switch (cmd) {
    case "help": {
      return `
<div style="font-family: monospace; color: #d8dee9; line-height: 1.6;">
  <p style="color: #88c0d0; font-weight: bold; margin: 4px 0;">╔════════════════════════════════════════════════════════════════════╗</p>
  <p style="color: #88c0d0; font-weight: bold; margin: 4px 0;">║                 MANUAL DE COMANDOS - HUBERT OS                     ║</p>
  <p style="color: #88c0d0; font-weight: bold; margin: 4px 0;">╚════════════════════════════════════════════════════════════════════╝</p>
  
  <p style="color: #a3be8c; font-weight: bold; margin: 8px 0 2px 0;">[ NAVEGAÇÃO E SISTEMA DE ARQUIVOS ]</p>
  <div style="padding-left: 12px;">
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">ls [caminho]</span> <span style="color: #eceff4;">Lista arquivos (abre painel ao listar projects)</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">cd &lt;pasta&gt;</span> <span style="color: #eceff4;">Navega para diretório (ex: <code style="color:#a3be8c;">cd projects</code>, <code style="color:#a3be8c;">cd ..</code>)</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">pwd</span> <span style="color: #eceff4;">Exibe o caminho do diretório atual</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">cat &lt;arquivo&gt;</span> <span style="color: #eceff4;">Lê o conteúdo de um arquivo (ex: <code style="color:#a3be8c;">cat skills.md</code>)</span></div>
  </div>

  <p style="color: #a3be8c; font-weight: bold; margin: 10px 0 2px 0;">[ PROJETOS & REPOSITÓRIOS ]</p>
  <div style="padding-left: 12px;">
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">projects [filtro]</span> <span style="color: #eceff4;">Abre projetos com filtro opcional (ex: <code style="color:#a3be8c;">projects python</code>)</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">github</span> <span style="color: #eceff4;">Exibe as contas do GitHub conectadas</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">filter &lt;termo&gt;</span> <span style="color: #eceff4;">Filtra repositórios por nome, linguagem ou descrição</span></div>
  </div>

  <p style="color: #a3be8c; font-weight: bold; margin: 10px 0 2px 0;">[ PERFIL & INFORMAÇÕES ]</p>
  <div style="padding-left: 12px;">
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">neofetch</span> <span style="color: #eceff4;">Mostra as informações visuais de perfil e stacks</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">skills</span> <span style="color: #eceff4;">Exibe habilidades e abre painel dedicado</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">contact</span> <span style="color: #eceff4;">Exibe meios de contato e redes sociais</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">bio</span> <span style="color: #eceff4;">Exibe resumo biográfico do desenvolvedor</span></div>
  </div>

  <p style="color: #a3be8c; font-weight: bold; margin: 10px 0 2px 0;">[ UTILITÁRIOS ]</p>
  <div style="padding-left: 12px;">
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">clear</span> <span style="color: #eceff4;">Limpa o histórico da tela do terminal</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">history</span> <span style="color: #eceff4;">Exibe o histórico de comandos digitados</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">whoami</span> <span style="color: #eceff4;">Exibe o usuário logado na sessão</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">date</span> <span style="color: #eceff4;">Exibe a data e hora do sistema</span></div>
    <div><span style="color: #ebcb8b; font-weight: bold; width: 170px; display: inline-block;">echo &lt;texto&gt;</span> <span style="color: #eceff4;">Imprime mensagem no terminal</span></div>
  </div>
</div>
      `;
    }

    case "ls":
    case "dir": {
      const isProjectsDir =
        session.currentPath === "~/projects" ||
        session.currentPath.startsWith("~/projects/") ||
        argString.trim().startsWith("projects") ||
        argString.trim().startsWith("~/projects");

      if (isProjectsDir) {
        if (typeof window !== "undefined" && window.openWindow) {
          window.openWindow("projects", "projects/");
        }
      }

      const res = listDir(session.currentPath, argString);
      if (res.error) {
        return `<span style="color: #bf616a;">${res.error}</span>`;
      }
      if (!res.items || res.items.length === 0) {
        return `<span style="color: #4c566a;">(diretório vazio)</span>`;
      }
      const formatted = res.items
        .map((item) => {
          if (item.type === "dir") {
            return `<span style="color: #88c0d0; font-weight: bold;">📁 ${item.name}</span>`;
          }
          if (item.rawName.endsWith(".sh") || item.rawName.endsWith(".py")) {
            return `<span style="color: #a3be8c;">⚙️ ${item.name}</span>`;
          }
          if (item.rawName.endsWith(".md")) {
            return `<span style="color: #ebcb8b;">📝 ${item.name}</span>`;
          }
          return `<span style="color: #eceff4;">📄 ${item.name}</span>`;
        })
        .join("&nbsp;&nbsp;&nbsp;&nbsp;");

      const projectsNotice = isProjectsDir
        ? `<div style="color: #a3be8c; font-size: 12px; margin-bottom: 6px;">[ Abrindo painel de projetos com os seus repositórios do GitHub ]</div>`
        : "";

      return `${projectsNotice}<div style="display: flex; flex-wrap: wrap; gap: 14px; margin: 4px 0;">${formatted}</div>`;
    }

    case "cd": {
      const res = changeDir(session.currentPath, argString);
      if (!res.success) {
        return `<span style="color: #bf616a;">${res.error}</span>`;
      }
      session.setPath(res.newPath);
      return `<span style="color: #81a1c1;">Diretório atual: <strong style="color: #88c0d0;">${res.newPath}</strong></span>`;
    }

    case "pwd": {
      const fullPath = session.currentPath === "~" ? "/home/hubert" : `/home/hubert/${session.currentPath.replace(/^~\/?/, "")}`;
      return `<span style="color: #88c0d0; font-family: monospace;">${fullPath}</span>`;
    }

    case "cat": {
      const res = readFile(session.currentPath, argString);
      if (res.error) {
        return `<span style="color: #bf616a;">${res.error}</span>`;
      }
      const escaped = res.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre style="font-family: monospace; color: #eceff4; margin: 4px 0; white-space: pre-wrap; line-height: 1.4;">${escaped}</pre>`;
    }

    case "bio": {
      const res = readFile("~", "bio.txt");
      return `<pre style="font-family: monospace; color: #eceff4; margin: 4px 0; white-space: pre-wrap; line-height: 1.4;">${res.content}</pre>`;
    }

    case "whoami": {
      return `<div style="font-family: monospace; color: #a3be8c;">hubert <span style="color: #81a1c1;">(Hubert Prado Ramos - Software Developer)</span></div>`;
    }

    case "date": {
      const now = new Date();
      return `<div style="font-family: monospace; color: #ebcb8b;">${now.toString()}</div>`;
    }

    case "echo": {
      return `<div style="font-family: monospace; color: #eceff4;">${argString}</div>`;
    }

    case "history": {
      if (!session.history || session.history.length === 0) {
        return `<span style="color: #4c566a;">(nenhum comando no histórico)</span>`;
      }
      const list = session.history
        .map((h, i) => `<div style="color: #81a1c1;">  ${(i + 1).toString().padStart(3, " ")}  <span style="color: #eceff4;">${h}</span></div>`)
        .join("");
      return `<div style="font-family: monospace; line-height: 1.4;">${list}</div>`;
    }

    case "github": {
      const users = getConfiguredGitHubUsers();
      return `
<div style="font-family: monospace; color: #eceff4;">
  <p style="color: #88c0d0; font-weight: bold; margin: 0 0 6px 0;">Contas GitHub Conectadas:</p>
  <div style="padding-left: 8px;">
    ${users
      .map(
        (u) =>
          `<div>• <strong style="color: #a3be8c;">@${u}</strong> <a href="https://github.com/${u}" target="_blank" rel="noopener noreferrer" style="color: #81a1c1; text-decoration: underline; font-size: 11px;">(github.com/${u})</a></div>`
      )
      .join("")}
  </div>
</div>
      `;
    }

    case "neofetch": {
      const ano = new Date().getFullYear();
      const styleList = "width: 20px; height: 20px; padding: 2px; vertical-align: middle;";
      return `
<div style="display: flex; align-items: center; gap: 20px; font-family: monospace; color: #c0caf5; margin: 10px 0; flex-wrap: wrap;">
  <img style="width: 130px; height: 130px; border-radius: 10px; object-fit: cover; flex-shrink: 0;" src="https://github.com/hubertramos.png" alt="Foto de Hubert Prado Ramos" />
  <div style="display: flex; flex-direction: column; gap: 4px;">
    <p style="color: #a3be8c; font-weight: bold; margin: 0; font-size: 14px;">hubertPradoRamos@Developer</p>
    <p style="color: #565f89; margin: 0;">--------------------------</p>
    <p style="margin: 0; font-size: 13px;"><span style="color: #88c0d0; font-weight: bold;">OS:</span> Linux (Debian/Ubuntu/Arch)</p>
    <p style="margin: 0; font-size: 13px;"><span style="color: #88c0d0; font-weight: bold;">Editor:</span> VS Code / Neovim</p>
    <p style="margin: 0; font-size: 13px;"><span style="color: #88c0d0; font-weight: bold;">Terminal:</span> Zsh + Starship</p>
    <p style="margin: 0; font-size: 13px;"><span style="color: #88c0d0; font-weight: bold;">Uptime:</span> Codando há ${ano - 2025} anos</p>
    <p style="margin: 0; font-size: 13px;"><span style="color: #88c0d0; font-weight: bold;">GitHub:</span> Codando há ${ano - 2024} anos</p>
    <div style="margin-top: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <span style="color: #88c0d0; font-weight: bold;">Stacks:</span>
      <div style="display: flex; flex-wrap: wrap; gap: 4px;">
        ${ListaLinguagens(styleList)}
      </div>
    </div>
  </div>
</div>
      `;
    }

    case "skills": {
      if (typeof window !== "undefined" && window.openWindow) {
        window.openWindow("skills", "skills.md");
      }
      const res = readFile("~", "skills.md");
      return `
<div style="font-family: monospace; color: #eceff4;">
  <p style="color: #a3be8c; margin: 0 0 6px 0;">[ Painel de Skills aberto em nova janela ]</p>
  <pre style="white-space: pre-wrap; color: #d8dee9; line-height: 1.4; margin: 0;">${res.content}</pre>
</div>
      `;
    }

    case "projects":
    case "filter":
    case "find": {
      if (typeof window !== "undefined" && window.openWindow) {
        window.openWindow("projects", "projects/");
      }

      const query = argString.trim();
      try {
        getGitHubRepos().then(() => {});
      } catch (e) {
        // silent
      }

      return `
<div style="font-family: monospace; color: #eceff4;">
  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; margin-bottom: 6px;">
    <span style="color: #a3be8c; font-weight: bold;">[ Painel de Projetos aberto & sincronizado ]</span>
    <span style="color: #81a1c1; font-size: 11px;">github.com/hubertramos</span>
  </div>
  <p style="color: #d8dee9; margin: 4px 0; font-size: 12px;">
    ${query ? `Filtrando por: <strong style="color: #88c0d0;">"${query}"</strong>` : "Carregando repositórios das contas configuradas..."}
  </p>
  <div style="font-size: 12px; color: #81a1c1; margin-top: 6px;">
    Use a janela de projetos à direita para busca instantânea e filtros por linguagem (JavaScript, Python, HTML/CSS, etc.) ou navegue via terminal com <code style="color: #a3be8c;">cd projects</code> e <code style="color: #a3be8c;">ls</code>.
  </div>
</div>
      `;
    }

    case "contact": {
      if (typeof window !== "undefined" && window.openWindow) {
        window.openWindow("contact", "contact.sh");
      }
      return `
<div style="font-family: monospace; color: #c0caf5;">
  <p style="color: #a3be8c; font-weight: bold; margin: 0 0 6px 0;">// Informações de Contato</p>
  <p style="color: #565f89; margin: 0 0 6px 0;">----------------------------------------</p>
  <p style="margin: 4px 0;"><span style="color: #88c0d0; font-weight: bold;">GitHub:</span> <a href="https://github.com/hubertramos" target="_blank" rel="noopener noreferrer" style="color: #a3be8c; text-decoration: underline;">github.com/hubertramos</a></p>
  <p style="margin: 4px 0;"><span style="color: #88c0d0; font-weight: bold;">Email:</span> <a href="mailto:0hubertpradoramos@gmail.com" style="color: #a3be8c; text-decoration: underline;">0hubertpradoramos@gmail.com</a></p>
  <p style="margin: 4px 0;"><span style="color: #88c0d0; font-weight: bold;">Status:</span> Disponível para novas oportunidades e conexões!</p>
</div>
      `;
    }

    case "clear": {
      session.clear();
      return null;
    }

    default:
      return `<div style="color: #bf616a; font-family: monospace;">Comando não encontrado: '<strong>${cmd}</strong>'. Digite <code style="color: #a3be8c; font-weight: bold;">help</code> para ver os comandos disponíveis.</div>`;
  }
}

/**
 * Legacy interface for compatibility with any existing callers
 */
export function Commands(comandoEscolhido) {
  if (typeof window !== "undefined" && window.terminalSession) {
    window.terminalSession.runCommand(comandoEscolhido);
    return;
  }
  switch (comandoEscolhido) {
    case "neofetch":
      break;
    case "skills":
      window.openWindow("skills", "skills.md");
      break;
    case "projects":
      window.openWindow("projects", "projects/");
      break;
    case "contact":
      window.openWindow("contact", "contact.sh");
      break;
    case "clear":
      if (typeof window !== "undefined" && window.resetWindows) {
        window.resetWindows();
      }
      break;
    default:
      console.log("Comando desconhecido:", comandoEscolhido);
  }
}

export function Windows(type, conteiner) {
  if (type === "skills") {
    const res = readFile("~", "skills.md");
    conteiner.innerHTML = `
      <div style="font-family: monospace; color: #eceff4; line-height: 1.5;">
        <pre style="white-space: pre-wrap; color: #d8dee9; margin: 0;">${res.content}</pre>
      </div>
    `;
  } else if (type === "projects") {
    Projects(conteiner);
  } else if (type === "contact") {
    conteiner.innerHTML = `
      <div style="font-family: monospace; color: #c0caf5;">
        <p style="color: #a3be8c; font-weight: bold;">// Informações de Contato</p>
        <p style="color: #565f89;">----------------------------------------</p>
        <p><span style="color: #88c0d0; font-weight: bold;">GitHub:</span> <a href="https://github.com/hubertramos" target="_blank" rel="noopener noreferrer" style="color: #a3be8c; text-decoration: underline;">github.com/hubertramos</a></p>
        <p><span style="color: #88c0d0; font-weight: bold;">Email:</span> <a href="mailto:0hubertpradoramos@gmail.com" style="color: #a3be8c; text-decoration: underline;">0hubertpradoramos@gmail.com</a></p>
      </div>
    `;
  }
}
