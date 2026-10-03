export default function WelcomeBanner(container) {
  if (!container) return;

  const now = new Date();
  const dateString = now.toLocaleDateString("pt-BR", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const banner = document.createElement("div");
  banner.className = "welcome-banner";
  banner.innerHTML = `
    <div style="font-family: monospace; color: #d8dee9; line-height: 1.5; margin-bottom: 20px;">
      <div style="color: #88c0d0; font-weight: bold; font-size: 15px; margin-bottom: 6px;">
        ┌──(HubertOS Linux v5.15.0-generic)-[x86_64]
      </div>
      <div style="border-left: 2px solid #4c566a; padding-left: 12px; margin-left: 4px;">
        <p style="margin: 3px 0; color: #a3be8c; font-weight: bold;">
          ★ Bem-vindo ao Terminal Interativo de Hubert Prado Ramos!
        </p>
        <p style="margin: 3px 0; color: #81a1c1; font-size: 13px;">
          • Sessão iniciada em: <span style="color: #eceff4;">${dateString}</span>
        </p>
        <p style="margin: 3px 0; color: #81a1c1; font-size: 13px;">
          • Terminal: <span style="color: #ebcb8b;">zsh 5.9</span> com tema <span style="color: #b48ead;">starship</span>
        </p>
        <p style="margin: 3px 0; color: #81a1c1; font-size: 13px;">
          • Navegação disponível: <span style="color: #88c0d0; font-weight: bold;">ls</span>, <span style="color: #88c0d0; font-weight: bold;">cd &lt;dir&gt;</span>, <span style="color: #88c0d0; font-weight: bold;">cat &lt;file&gt;</span>, <span style="color: #88c0d0; font-weight: bold;">pwd</span>, <span style="color: #88c0d0; font-weight: bold;">help</span>
        </p>
        <p style="margin: 6px 0 2px 0; color: #d8dee9; font-size: 12px;">
          Dica: Digite <code style="background: #3b4252; color: #a3be8c; padding: 2px 6px; border-radius: 4px; font-weight: bold;">help</code> para ver todos os comandos ou clique nos comandos sugeridos.
        </p>
      </div>
      <div style="color: #88c0d0; font-weight: bold; font-size: 15px; margin-top: 6px;">
        └───────────────────────────────────────────────
      </div>
    </div>
  `;

  container.appendChild(banner);
}
