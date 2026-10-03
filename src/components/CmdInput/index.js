const style = {
  input: `
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #eceff4;
    font-family: monospace;
    font-size: 14px;
    caret-color: #88c0d0;
  `,
  autocomplete: `
    display: none;
    position: absolute;
    left: 0;
    bottom: 35px;
    width: 100%;
    max-width: 360px;
    background-color: rgba(30, 34, 42, 0.96);
    border: 1px solid #434c5e;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    z-index: 100;
    overflow: hidden;
    max-height: 220px;
    overflow-y: auto;
  `,
  cmdOption: `
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 13px;
    color: #d8dee9;
    border-bottom: 1px solid rgba(67, 76, 94, 0.4);
    transition: background-color 0.15s ease;
  `
};

export default function CommandInput(container, onExecuteCommand, comandos, options = {}) {
  if (!container) return;

  const currentPath = options.currentPath || "~";
  const history = options.history || [];
  let historyIndex = history.length;
  let selectedIndex = 0;
  let filteredCommands = [...comandos];

  container.innerHTML = `
    <div class="terminal-prompt-wrapper" style="margin-top: 10px; font-family: monospace; position: relative;">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="color: #a3be8c; font-weight: bold; white-space: nowrap;">
          hubert@developer:<span id="prompt-current-path" style="color: #81a1c1;">${currentPath}</span>$
        </span>
        <div style="position: relative; flex: 1; min-width: 180px;">
          <input 
            type="text" 
            id="command-input-field" 
            placeholder="Digite um comando (ex: ls, cd, help, neofetch)..." 
            autocomplete="off"
            spellcheck="false"
            style="${style.input}"
          />
        </div>
      </div>

      <div id="autocomplete-dropdown" style="${style.autocomplete}"></div>
    </div>
  `;

  const inputField = container.querySelector("#command-input-field");
  const dropdown = container.querySelector("#autocomplete-dropdown");
  const pathSpan = container.querySelector("#prompt-current-path");

  function renderDropdown(list) {
    if (!list || list.length === 0) {
      dropdown.style.display = "none";
      return;
    }
    dropdown.innerHTML = list
      .map(
        (item, index) => `
        <div class="command-option" data-index="${index}" data-cmd="${item.cmd}" style="${style.cmdOption} background-color: ${
          index === selectedIndex ? "#3b4252" : "transparent"
        };">
          <span style="color: #88c0d0; font-weight: bold;">${item.label || item.cmd}</span>
          <span style="color: #81a1c1; font-size: 11px; margin-left: 8px;">${item.desc || ""}</span>
        </div>
      `
      )
      .join("");

    dropdown.querySelectorAll(".command-option").forEach((opt) => {
      opt.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const chosenCmd = opt.getAttribute("data-cmd");
        inputField.value = chosenCmd;
        hideDropdown();
        if (onExecuteCommand) onExecuteCommand(chosenCmd);
      });
    });
  }

  const showDropdown = () => {
    filterAndShow(inputField.value);
  };

  const hideDropdown = () => {
    setTimeout(() => {
      dropdown.style.display = "none";
    }, 180);
  };

  function filterAndShow(val) {
    const query = val.toLowerCase().trim();
    if (!query) {
      filteredCommands = comandos.slice(0, 8);
    } else {
      filteredCommands = comandos.filter(
        (c) =>
          c.cmd.toLowerCase().startsWith(query) ||
          c.label.toLowerCase().includes(query) ||
          (c.desc && c.desc.toLowerCase().includes(query))
      );
    }

    if (filteredCommands.length > 0) {
      selectedIndex = 0;
      renderDropdown(filteredCommands);
      dropdown.style.display = "block";
    } else {
      dropdown.style.display = "none";
    }
  }

  function updateSelectionVisual() {
    const opts = dropdown.querySelectorAll(".command-option");
    opts.forEach((opt, idx) => {
      opt.style.backgroundColor = idx === selectedIndex ? "#3b4252" : "transparent";
    });
  }

  inputField.addEventListener("focus", showDropdown);
  inputField.addEventListener("blur", hideDropdown);

  inputField.addEventListener("input", (e) => {
    filterAndShow(e.target.value);
  });

  inputField.addEventListener("keydown", (e) => {
    // Dropdown arrow navigation
    const isDropdownVisible = dropdown.style.display === "block" && filteredCommands.length > 0;

    if (e.key === "Tab") {
      e.preventDefault();
      if (filteredCommands.length > 0) {
        inputField.value = filteredCommands[selectedIndex].cmd;
        filterAndShow(inputField.value);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isDropdownVisible) {
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        updateSelectionVisual();
      } else if (history.length > 0) {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          inputField.value = history[historyIndex];
        } else {
          historyIndex = history.length;
          inputField.value = "";
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isDropdownVisible && selectedIndex > 0) {
        selectedIndex--;
        updateSelectionVisual();
      } else if (history.length > 0) {
        if (historyIndex > 0) {
          historyIndex--;
          inputField.value = history[historyIndex];
        }
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const enteredCmd = inputField.value;
      hideDropdown();
      inputField.value = "";
      historyIndex = history.length + 1;
      if (onExecuteCommand) {
        onExecuteCommand(enteredCmd);
      }
    } else if (e.key === "Escape") {
      hideDropdown();
    }
  });

  // Focus input automatically
  setTimeout(() => {
    inputField.focus();
  }, 100);

  return {
    setPath(newPath) {
      if (pathSpan) {
        pathSpan.textContent = newPath;
      }
    },
    focus() {
      inputField.focus();
    },
    setValue(val) {
      inputField.value = val;
    }
  };
}
