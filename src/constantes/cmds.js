import Projects from "../app/projects.js";

export const comandos = [
    { cmd: "neofetch", label: "neofetch", desc: "Exibe o resumo do perfil" },
    { cmd: "skills", label: "cat skills.md", desc: "Lista as tecnologias e stacks" },
    { cmd: "projects", label: "git clone projects", desc: "Mostra os principais projetos" },
    { cmd: "contact", label: "contact --me", desc: "Formas de contato e redes" },
    { cmd: "clear", label: "clear", desc: "Limpa o terminal" }
  ];

export function Commands(comandoEscolhido) {
  console.log("Comando escolhido:", comandoEscolhido);
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
      windowStates = [{ id: 1, type: "profile", title: "neofetch" }];
      renderWindows();
      break;

    default:
      console.log("Comando desconhecido");
  }
}

export function Windows(type, conteiner){
  if(type === "skills"){
    conteiner.innerHTML = `
      Tá funfando
    `
  }else if(type === "projects"){
    Projects(conteiner)
  }
}
