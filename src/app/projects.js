import { comandos, Commands } from "../constantes/cmds.js";
import CommandInput from "../components/CmdInput/index.js";

export default function Projects(conteiner) {
  conteiner.innerHTML = `
    <div style="font-family: monospace; color: #c0caf5;">
      <p style="color: #a3be8c; font-weight: bold;">// Pasta de Projetos</p>
      <p style="color: #565f89;">----------------------------------------</p>
      <p>Navegue pelos subdiretórios ou digite um comando:</p>
    </div>
  `;

  const commandWrapper = document.createElement("div");
  conteiner.appendChild(commandWrapper);

  CommandInput(commandWrapper, (comandoEscolhido) => {
    console.log("Comando escolhido:", comandoEscolhido);
    Commands(comandoEscolhido);
    
    if (comandoEscolhido === "clear") {
      // Lógica do clear se houver
    }
  }, comandos);
}
