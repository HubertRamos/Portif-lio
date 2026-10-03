// Virtual File System for Terminal Navigation
export const fileSystem = {
  "~": {
    type: "dir",
    children: {
      "projects": {
        type: "dir",
        children: {
          "portfolio-cli": {
            type: "dir",
            children: {
              "README.md": {
                type: "file",
                content: "# Portfolio CLI\nInterface de terminal interativa desenvolvida com JavaScript puro, HTML5 e CSS3 estilo Nord Linux.\nSuporta navegação por comandos (ls, cd, cat, pwd), histórico e exibição de perfil."
              },
              "index.html": {
                type: "file",
                content: "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n  <title>Hubert Ramos - Portfolio</title>\n</head>\n<body>\n  <div id=\"terminal\"></div>\n</body>\n</html>"
              }
            }
          },
          "task-manager": {
            type: "dir",
            children: {
              "README.md": {
                type: "file",
                content: "# Task Manager CLI\nGerenciador de tarefas e notas pelo terminal com persistência de dados local e tags."
              },
              "tasks.json": {
                type: "file",
                content: "[\n  {\"id\": 1, \"title\": \"Refatorar UI do terminal\", \"done\": true},\n  {\"id\": 2, \"title\": \"Adicionar navegação de arquivos cd/ls\", \"done\": true},\n  {\"id\": 3, \"title\": \"Publicar novos projetos\", \"done\": false}\n]"
              }
            }
          },
          "python-automations": {
            type: "dir",
            children: {
              "scraper.py": {
                type: "file",
                content: "#!/usr/bin/env python3\n# Script de automação e web scraping\nimport sys\n\ndef main():\n    print('[OK] Automação iniciada com sucesso')\n\nif __name__ == '__main__':\n    main()\n"
              },
              "README.md": {
                type: "file",
                content: "# Automações em Python\nColeção de scripts para automação de tarefas cotidianas e coleta de dados."
              }
            }
          },
          "dev-tools": {
            type: "dir",
            children: {
              "config.zsh": {
                type: "file",
                content: "# Configuração do Zsh + Starship\nexport ZSH_THEME='starship'\nalias ll='ls -la'\nalias gs='git status'\nalias c='clear'\n"
              }
            }
          }
        }
      },
      "skills.md": {
        type: "file",
        content: `# Tecnologias & Stacks de Hubert Prado Ramos

## Linguagens Principais
- JavaScript (ES6+, Node.js, Express)
- TypeScript
- Python (Automação, Scripts, Web Scraping)
- HTML5 / CSS3 (Flexbox, Grid, Responsividade)

## Ferramentas & Ambiente de Desenvolvimento
- Sistema Operacional: Linux (Debian / Arch / Ubuntu)
- Shell & Terminal: Zsh + Starship prompt
- Controle de Versão: Git & GitHub
- Editores: VS Code, Neovim

## Competências
- Arquitetura de interfaces interativas e limpas
- Desenvolvimento web sem frameworks pesados (Vanilla JS)
- Criação de CLI e emuladores de terminal
- Automação e produtividade no ambiente Linux`
      },
      "bio.txt": {
        type: "file",
        content: `Hubert Prado Ramos
================================================
Desenvolvedor de Software focado em soluções web,
automações e interfaces intuitivas com estilo terminal.
Entusiasta de código aberto, Linux e ferramentas CLI.
Sempre aprendendo novas tecnologias e aprimorando a experiência do usuário.`
      },
      "contact.sh": {
        type: "file",
        content: `#!/usr/bin/env bash
# Formas de contato e redes de Hubert Prado Ramos:
echo "GitHub:    https://github.com/hubertramos"
echo "Email:     0hubertpradoramos@gmail.com"
echo "Portfólio: Terminal Interativo HubertOS"
echo "Status:    Aberto a novos projetos e colaborações!"`
      },
      "README.md": {
        type: "file",
        content: `# Bem-vindo ao Terminal Interativo de Hubert Ramos!

Comandos de navegação básica suportados:
  ls              - Lista arquivos e diretórios na pasta atual
  cd <pasta>      - Entra em um diretório (ex: cd projects, cd ..)
  pwd             - Mostra o caminho da pasta atual
  cat <arquivo>   - Exibe o conteúdo de um arquivo (ex: cat skills.md)
  help            - Lista todos os comandos disponíveis
  clear           - Limpa a saída do terminal
  neofetch        - Exibe o resumo do perfil e tecnologias`
      }
    }
  }
};

/**
 * Resolves a given path into an array of path segments starting from root "~"
 */
export function resolvePathSegments(currentPath, targetPath) {
  let segments;
  if (!targetPath || targetPath === "~" || targetPath === "/") {
    return ["~"];
  }

  if (targetPath.startsWith("~/")) {
    segments = ["~", ...targetPath.slice(2).split("/").filter(Boolean)];
  } else if (targetPath.startsWith("/")) {
    segments = ["~", ...targetPath.slice(1).split("/").filter(Boolean)];
  } else {
    // Relative path
    segments = currentPath === "~" ? ["~"] : currentPath.split("/").filter(Boolean);
    const targetParts = targetPath.split("/").filter(Boolean);
    for (const part of targetParts) {
      if (part === ".") {
        continue;
      } else if (part === "..") {
        if (segments.length > 1) {
          segments.pop();
        }
      } else if (part === "~") {
        segments = ["~"];
      } else {
        segments.push(part);
      }
    }
  }
  return segments;
}

/**
 * Traverses the virtual file system tree to find the node at segments
 */
export function getNodeAtSegments(segments) {
  if (segments.length === 0 || segments[0] !== "~") return null;
  let curr = fileSystem["~"];
  for (let i = 1; i < segments.length; i++) {
    if (!curr || curr.type !== "dir" || !curr.children) return null;
    curr = curr.children[segments[i]];
  }
  return curr;
}

/**
 * Lists the directory at the given path
 */
export function listDir(currentPath, targetDir = "") {
  const segments = targetDir ? resolvePathSegments(currentPath, targetDir) : resolvePathSegments(currentPath, "");
  const node = getNodeAtSegments(segments);
  if (!node) {
    return { error: `ls: não foi possível acessar '${targetDir}': Arquivo ou diretório não encontrado` };
  }
  if (node.type !== "dir") {
    return { error: `ls: '${targetDir}' não é um diretório` };
  }
  const items = Object.keys(node.children || {}).map((name) => {
    const child = node.children[name];
    return {
      name: child.type === "dir" ? `${name}/` : name,
      rawName: name,
      type: child.type
    };
  });
  return { items, path: segments.join("/") };
}

/**
 * Changes directory and returns { success, newPath, error }
 */
export function changeDir(currentPath, targetDir) {
  if (!targetDir || targetDir === "~") {
    return { success: true, newPath: "~" };
  }
  const segments = resolvePathSegments(currentPath, targetDir);
  const node = getNodeAtSegments(segments);
  if (!node) {
    return { success: false, error: `cd: '${targetDir}': Arquivo ou diretório não encontrado` };
  }
  if (node.type !== "dir") {
    return { success: false, error: `cd: '${targetDir}': Não é um diretório` };
  }
  return { success: true, newPath: segments.join("/") };
}

/**
 * Reads a file at targetPath
 */
export function readFile(currentPath, targetPath) {
  if (!targetPath) {
    return { error: "cat: argumento obrigatório faltando (uso: cat <arquivo>)" };
  }
  const segments = resolvePathSegments(currentPath, targetPath);
  const node = getNodeAtSegments(segments);
  if (!node) {
    return { error: `cat: '${targetPath}': Arquivo ou diretório não encontrado` };
  }
  if (node.type === "dir") {
    return { error: `cat: '${targetPath}': É um diretório` };
  }
  return { content: node.content };
}

/**
 * Dynamically synchronizes GitHub repositories into the virtual filesystem
 */
export function syncGitHubReposToFileSystem(repos) {
  if (!Array.isArray(repos)) return;
  if (!fileSystem["~"].children.projects) {
    fileSystem["~"].children.projects = { type: "dir", children: {} };
  }
  const projectsChildren = fileSystem["~"].children.projects.children;

  repos.forEach((repo) => {
    if (!repo || !repo.name) return;
    const desc = repo.description || "Projeto sem descrição no GitHub.";
    const lang = repo.language || "Geral";
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const date = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString("pt-BR") : "Recentemente";

    projectsChildren[repo.name] = {
      type: "dir",
      children: {
        "README.md": {
          type: "file",
          content: `# ${repo.name}\n\n${desc}\n\n• Linguagem: ${lang}\n• Estrelas: ${stars} ★\n• Forks: ${forks} ⑂\n• Repositório: ${repo.html_url}${repo.homepage ? `\n• Live Demo: ${repo.homepage}` : ""}\n• Última atualização: ${date}\n`
        },
        "url.txt": {
          type: "file",
          content: `${repo.html_url}\n`
        }
      }
    };
  });
}

