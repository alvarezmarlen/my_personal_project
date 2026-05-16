
let starCount = 400;
let maxTime = 30;
let universe = document.getElementById("universe");
let section = document.getElementById("banner-estrellas");

// Cambiamos width y height para que usen la sección
let width = section.clientWidth; 
let height = section.clientHeight;

for (let i = 0; i < starCount; ++i) {
  let ypos = Math.round(Math.random() * height);
  let star = document.createElement("div");
  let speed = 1000 * (Math.random() * maxTime + 1);
  
  star.setAttribute("class", "star" + (3 - Math.floor(speed / 1000 / 8)));
  star.style.backgroundColor = "white";

  universe.appendChild(star);
  
  star.animate(
    [
      { transform: "translate3d(" + width + "px, " + ypos + "px, 0)" },
      { transform: "translate3d(-" + (Math.random() * 256) + "px, " + ypos + "px, 0)" }
    ],
    {
      delay: Math.random() * -speed,
      duration: speed,
      iterations: Infinity // Mejor usar Infinity que 1000
    }
  );
}
