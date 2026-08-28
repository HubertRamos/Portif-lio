
const style = {
  input: `
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #c0caf5;
    font-family: monospace;
    font-size: 14px;
  `,
  autocomplete: `
    display: none;
    position: absolute;
    left: 0;
    top: 30px;
    width: 100%;
    max-width: 320px;
    background-color: rgba(30, 34, 42, 0.95);
    border: 1px solid #434c5e;
    border-radius: 6px;
    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    z-index: 100;
    overflow: hidden;
  `,
  cmdOptions: `
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
    color: #d8dee9;
  `,
};

export default function CommandInput(container, onExecuteCommand, comandos) {
  if (!container) return;

  let selectedIndex = 0;

  container.innerHTML = `
    <div class="terminal-prompt-wrapper" style="margin-top: 15px; font-family: monospace; position: relative;">
      <div style="display: flex; align-items: center; gap: 8px; color: #a3be8c;">
        <span>hubert@developer:~$</span>
        <div style="position: relative; flex: 1;">
          <input 
            type="text" 
            id="command-input-field" 
            placeholder="Clique ou digite um comando..." 
            autocomplete="off"
            style="${style.input}"
          />
        </div>
      </div>

      <div id="autocomplete-dropdown" style="${style.autocomplete}">
        ${comandos
      .map(
        (item, index) => `
          <div class="command-option" data-index="${index}" data-cmd="${item.cmd}" style="background-color: ${index === selectedIndex ? "#3b4252" : "transparent"};">
            <span style="color: #88c0d0; font-weight: bold;">${item.label}</span>
            <span style="color: #616e88; font-size: 11px;">${item.desc}</span>
          </div>
        `,
      )
      .join("")}
      </div>
    </div>
  `;

  const inputField = container.querySelector("#command-input-field");
  const dropdown = container.querySelector("#autocomplete-dropdown");
  const options = dropdown.querySelectorAll(".command-option");

  // Funções de controle do dropdown
  const showDropdown = () => {
    dropdown.style.display = "block";
  };
  const hideDropdown = () => {
    setTimeout(() => {
      dropdown.style.display = "none";
    }, 200);
  };

  inputField.addEventListener("focus", showDropdown);
  inputField.addEventListener("blur", hideDropdown);

  inputField.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    showDropdown();
  });

  options.forEach((option) => {
    option.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const chosenCmd = option.getAttribute("data-cmd");
      inputField.value = chosenCmd;
      hideDropdown();
      if (onExecuteCommand) onExecuteCommand(chosenCmd);
    });
  });

  // Navegação por teclado
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      selectedIndex = (selectedIndex + 1) % comandos.length;
      updateSelection();
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      selectedIndex = (selectedIndex - 1 + comandos.length) % comandos.length;
      updateSelection();
      e.preventDefault();
    } else if (e.key === "Enter") {
      const activeCommand = comandos[selectedIndex].cmd;
      inputField.value = activeCommand;
      hideDropdown();
      if (onExecuteCommand) onExecuteCommand(activeCommand);
      e.preventDefault();
    }
  });

  function updateSelection() {
    options.forEach((opt, idx) => {
      opt.style.backgroundColor =
        idx === selectedIndex ? "#3b4252" : "transparent";
    });
  }
}
