import CommandInput from "./src/components/CmdInput/index.js";
import { executeCommand, Windows, comandos } from "./src/constantes/cmds.js";
import NeoFetch from "./src/components/NeoFetch/index.js";
import WelcomeBanner from "./src/components/WelcomeBanner/index.js";

const style = {
  windowTitlebar: `
    background: #3b4252;
    padding: 8px 14px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: #eceff4;
    flex-shrink: 0; 
    font-family: monospace;
    user-select: none;
    border-bottom: 1px solid rgba(46, 52, 64, 0.8);
  `,
  buttonClose: `
    background: #bf616a; 
    border: none; 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    cursor: pointer;
    transition: transform 0.1s ease, filter 0.1s ease;
  `,
  buttonMaximize: `
    background: #a3be8c; 
    border: none; 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    cursor: pointer;
    transition: transform 0.1s ease, filter 0.1s ease;
  `,
  windowButtons: `
    display: flex;
    gap: 7px;
    align-items: center;
  `
};

let currentPath = "~";
const commandHistory = [];
let windowStates = [{ id: 1, type: "profile", title: "~" }];
let primaryCmdInput = null;

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function renderWindows() {
  const conteiner = document.querySelector("main");
  if (!conteiner) return;

  conteiner.innerHTML = "";

  windowStates.forEach((win) => {
    const painel = document.createElement("div");
    painel.className = "window-pane";
    painel.id = `window-${win.id}`;

    // Botão de fechar (apenas se não for a primeira janela principal)
    const botaoFechar =
      win.id === 1
        ? ""
        : `<button onclick="window.closeWindow(${win.id})" style="${style.buttonClose}" title="Fechar Janela"></button>`;

    // Botão de maximizar presente em todas as janelas
    const botaoMaximizar = `<button onclick="window.toggleMaximize(${win.id})" style="${style.buttonMaximize}" title="Maximizar/Restaurar"></button>`;

    const displayTitle = win.id === 1 ? currentPath : win.title;

    painel.innerHTML = `
      <div style="${style.windowTitlebar}">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #88c0d0; font-weight: bold;">●</span>
          <span id="title-${win.id}" style="color: #d8dee9; font-weight: 500;">~/${displayTitle.replace(/^~\/?/, "")}</span>
        </div>
        <div style="${style.windowButtons}">
          ${botaoMaximizar}
          ${botaoFechar}
        </div>
      </div>
      <div class="window-content terminal" id="content-${win.id}">
      </div>
    `;

    conteiner.appendChild(painel);

    const contentConteiner = document.getElementById(`content-${win.id}`);

    if (win.type === "profile") {
      // 1. Welcome Message & MOTD banner on page load
      WelcomeBanner(contentConteiner);

      // 2. Initial NeoFetch visual profile
      const neofetchWrapper = document.createElement("div");
      neofetchWrapper.id = "initial-neofetch";
      neofetchWrapper.style.marginBottom = "20px";
      contentConteiner.appendChild(neofetchWrapper);
      NeoFetch(neofetchWrapper);

      // 3. Interactive log area where executed commands and outputs appear
      const terminalLog = document.createElement("div");
      terminalLog.id = "terminal-log";
      terminalLog.style.display = "flex";
      terminalLog.style.flexDirection = "column";
      terminalLog.style.gap = "12px";
      terminalLog.style.marginBottom = "14px";
      contentConteiner.appendChild(terminalLog);

      // 4. Command Input prompt at the bottom
      const commandWrapper = document.createElement("div");
      commandWrapper.id = "command-input-container";
      commandWrapper.style.marginTop = "auto";
      contentConteiner.appendChild(commandWrapper);

      const session = {
        get currentPath() {
          return currentPath;
        },
        get history() {
          return commandHistory;
        },
        setPath(newPath) {
          currentPath = newPath;
          if (primaryCmdInput) {
            primaryCmdInput.setPath(newPath);
          }
          const titleSpan = document.getElementById("title-1");
          if (titleSpan) {
            titleSpan.textContent = `~/${newPath.replace(/^~\/?/, "")}`;
          }
        },
        clear() {
          terminalLog.innerHTML = "";
          // Also hide or keep initial banner/neofetch clean
          const initialCard = document.getElementById("initial-neofetch");
          if (initialCard) {
            initialCard.style.display = "none";
          }
        }
      };

      primaryCmdInput = CommandInput(
        commandWrapper,
        (comandoEscolhido) => {
          const trimmed = comandoEscolhido.trim();
          if (!trimmed) {
            // Empty command: render empty prompt line
            const emptyEntry = document.createElement("div");
            emptyEntry.className = "terminal-entry";
            emptyEntry.style.fontFamily = "monospace";
            emptyEntry.innerHTML = `
              <div style="color: #a3be8c; font-weight: bold;">
                hubert@developer:<span style="color: #81a1c1;">${currentPath}</span>$
              </div>
            `;
            terminalLog.appendChild(emptyEntry);
            contentConteiner.scrollTop = contentConteiner.scrollHeight;
            return;
          }

          commandHistory.push(trimmed);

          // Render executed command prompt line
          const logEntry = document.createElement("div");
          logEntry.className = "terminal-entry";
          logEntry.style.fontFamily = "monospace";

          const cmdLine = document.createElement("div");
          cmdLine.style.color = "#a3be8c";
          cmdLine.style.fontWeight = "bold";
          cmdLine.innerHTML = `hubert@developer:<span style="color: #81a1c1;">${currentPath}</span>$ <span style="color: #eceff4; font-weight: normal;">${escapeHtml(
            trimmed
          )}</span>`;
          logEntry.appendChild(cmdLine);

          // Execute command via command handler
          const outputHtml = executeCommand(trimmed, session);

          if (outputHtml !== null) {
            const resultBox = document.createElement("div");
            resultBox.className = "cmd-result";
            resultBox.style.marginTop = "6px";
            resultBox.innerHTML = outputHtml;
            logEntry.appendChild(resultBox);
          }

          terminalLog.appendChild(logEntry);

          // Auto-scroll to keep latest command and prompt visible
          setTimeout(() => {
            contentConteiner.scrollTop = contentConteiner.scrollHeight;
          }, 30);
        },
        comandos,
        {
          currentPath,
          history: commandHistory
        }
      );
    } else {
      Windows(win.type, contentConteiner);
    }
  });
}

window.openWindow = function (type, title) {
  // Check if window of this type is already open
  const existing = windowStates.find((win) => win.type === type);
  if (existing) {
    const pane = document.getElementById(`window-${existing.id}`);
    if (pane) {
      pane.scrollIntoView({ behavior: "smooth" });
      pane.style.borderColor = "#88c0d0";
      setTimeout(() => {
        pane.style.borderColor = "";
      }, 800);
    }
    return;
  }

  const lastId =
    windowStates.length > 0 ? windowStates[windowStates.length - 1].id : 0;
  const newId = lastId + 1;

  windowStates.push({
    id: newId,
    type: type,
    title: title,
  });

  renderWindows();
};

window.closeWindow = function (id) {
  if (windowStates.length === 1) return;

  windowStates = windowStates.filter((win) => win.id !== id);

  renderWindows();
};

// Função para alternar o estado de maximizado da janela
window.toggleMaximize = function (id) {
  const painel = document.getElementById(`window-${id}`);
  if (painel) {
    painel.classList.toggle("maximized");
  }
};

window.resetWindows = function () {
  currentPath = "~";
  windowStates = [{ id: 1, type: "profile", title: "~" }];
  renderWindows();
};
