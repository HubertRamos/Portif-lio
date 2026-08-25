const linguagens = [
  { 
    img: "src/assets/html.png", 
    background: "background-color:#ff4d04;"
  },
  { 
    img: "src/assets/css-3.png",
    background: "background-color:#0267f5;"
  },
  { 
    img: "src/assets/python.png", 
    background: "background-color:#79e0e9;"
  },
  { 
    img: "src/assets/js.png",
    background: "background-color:#ffdf00;"
  }, 
]

export default function ListaLinguagens(style) {
  let htmlGerado = "";

  for (let i = 0; i < linguagens.length; i++) {
    htmlGerado += `
      <img style="${style} ${linguagens[i].background}" src="${linguagens[i].img}"/>
    `;
  }

  return htmlGerado;
}
