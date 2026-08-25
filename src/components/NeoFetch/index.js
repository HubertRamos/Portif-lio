import ListaLinguagens from "../../constantes/linguagens.js";

const style = {
  container: `
    display: flex;
    align-items: center;
    gap: 20px;
    font-family: monospace;
    color: #c0caf5;
    width: 100%;
    box-sizing: border-box;
  `,
  profileInfo: `
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%; /* Garante que as informações usem toda a largura da janela */
  `,
  img: `
    width: 150px;
    height: 150px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
  `,
  userTitle: `
    color: #a3be8c;
    font-weight: bold;
    margin: 0;
    font-size: 14px;
  `,
  key: `
    color: #88c0d0;
    font-weight: bold;
  `,
  linhaSeparadora: `
    margin: 0;
    color: #565f89;
  `,
  listInfo: `
    margin: 0;
    font-size: 13px;
  `,
  list: `
    width: 20px;
    height: 20px;
    padding: 2px;
    vertical-align: middle;
  `
};

export default function NeoFetch(container) {
  if (!container) return;

  const date = new Date();
  const ano = date.getFullYear();
  
  container.innerHTML = `
    <div style="${style.container}" class="neofetch-inner">
      <img style="${style.img}" class="perfil-foto" src="https://github.com/hubertramos.png" alt="Foto de perfil de Hubert Prado Ramos" />
      
      <div style="${style.profileInfo}">
        <p style="${style.userTitle}">hubertPradoRamos@Developer</p>
        <p style="${style.linhaSeparadora}">--------------------------</p>
        
        <p style="${style.listInfo}"><span style="${style.key}">OS:</span> Linux</p>
        <p style="${style.listInfo}"><span style="${style.key}">Editor:</span> VS Code / Neovim</p>
        <p style="${style.listInfo}"><span style="${style.key}">Terminal:</span> Zsh + Starship</p>
        <p style="${style.listInfo}"><span style="${style.key}">Uptime:</span> Codando há ${ano - 2025} anos</p>
        <p style="${style.listInfo}"><span style="${style.key}">GitHub:</span> Codando há ${ano - 2024} anos</p>
        
        <div style="margin-top: 5px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="${style.key}">Stacks:</span>
          <div style="display: flex; flex-wrap: wrap;">
            ${ListaLinguagens(style.list)}
          </div>
        </div>
      </div>
    </div>
  `;
}
