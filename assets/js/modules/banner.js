export function iniciarBanner() {
    const universe = document.getElementById("universe");
    const section = document.getElementById("banner-estrellas");
    if (!universe || !section) return;

    const starCount = 400;
    const maxTime = 30;
    const width = section.clientWidth;
    const height = section.clientHeight;

    for (let i = 0; i < starCount; ++i) {
        const ypos = Math.round(Math.random() * height);
        const star = document.createElement("div");
        const speed = 1000 * (Math.random() * maxTime + 1);

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
                iterations: Infinity
            }
        );
    }
}
