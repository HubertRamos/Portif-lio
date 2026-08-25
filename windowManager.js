import CommandInput from "./src/components/CmdInput/index.js";
import Commands from "./src/constantes/cmds.js";
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
  button: `
    background: #bf616a; 
    border: none; 
    width: 12px; 
    height: 12px; 
    border-radius: 50%; 
    cursor: pointer;
  `,
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

    const botaoFechar =
      win.id === 1
        ? ""
        : `<button onclick="window.closeWindow(${win.id})" style="${style.button}"></button>`;

    painel.innerHTML = `
      <div style="${style.windowTitlebar}">
        <span>~/${win.title}</span>
        ${botaoFechar} 
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

      CommandInput(commandWrapper, (comandoEscolhido) => {
        console.log("Comando escolhido:", comandoEscolhido);
        Commands(comandoEscolhido);
        if (comandoEscolhido === "clear") {
        }
      });
    }
  });
}

window.openWindow = function(type, title) {
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

window.closeWindow = function(id) {
  if (windowStates.length === 1) return;

  windowStates = windowStates.filter((win) => win.id !== id);

  renderWindows();
};
