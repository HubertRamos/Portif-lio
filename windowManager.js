import CommandInput from "./src/components/CmdInput/index.js";
import { Commands, Windows, comandos } from "./src/constantes/cmds.js";
import NeoFetch from "./src/components/NeoFetch/index.js";

const style = {
  windowTitlebar: `
    background: #3b4252;
    padding: 8px 12px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    color: #eceff4;
    flex-shrink: 0; 
  `,
  buttonClose: `
    background: #bf616a; 
    border: none; 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    cursor: pointer;
  `,
  buttonMaximize: `
    background: #a3be8c; 
    border: none; 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    cursor: pointer;
  `,
  windowButtons: `
    display: flex;
    gap: 6px;
    align-items: center;
  `
};

let windowStates = [{ id: 1, type: "profile", title: "neofetch" }];

export default function renderWindows() {
  const conteiner = document.querySelector("main");
  if (!conteiner) return;

  conteiner.innerHTML = "";

  windowStates.forEach((win) => {
    const painel = document.createElement("div");
    painel.className = "window-pane";
    painel.id = `window-${win.id}`;

    // Botão de fechar (apenas se não for a primeira janela)
    const botaoFechar =
      win.id === 1
        ? ""
        : `<button onclick="window.closeWindow(${win.id})" style="${style.buttonClose}" title="Fechar"></button>`;

    // Botão de maximizar presente em todas as janelas
    const botaoMaximizar = `<button onclick="window.toggleMaximize(${win.id})" style="${style.buttonMaximize}" title="Maximizar"></button>`;

    painel.innerHTML = `
      <div style="${style.windowTitlebar}">
        <span>~/${win.title}</span>
        <div style="${style.windowButtons}">
          ${botaoMaximizar}
          ${botaoFechar}
        </div>
      </div>
      <div class="window-content terminal" id="content-${win.id}" style="padding: 15px; flex: 1; overflow-y: auto;">
      </div>
    `;

    conteiner.appendChild(painel);

    const contentConteiner = document.getElementById(`content-${win.id}`);

    if (win.type === "profile") {
      NeoFetch(contentConteiner);

      const commandWrapper = document.createElement("div");
      contentConteiner.appendChild(commandWrapper);

      CommandInput( commandWrapper, (comandoEscolhido) => {
        console.log("Comando escolhido:", comandoEscolhido);
        Commands(comandoEscolhido);
        if (comandoEscolhido === "clear") {
        }
      }, comandos );
    } else {
      Windows(win.type, contentConteiner);
    }
  });
}

window.openWindow = function (type, title) {
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
