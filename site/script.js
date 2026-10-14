(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- стена из крышек ---------- */
  const lids = document.getElementById("lids");
  const RIMS = ["#f2c12e", "#4a46b5", "#b4472c", "#f2eee5", "#5f9e4a"];
  // угол (град), радиус (% от блока), размер (% от блока), глубина для параллакса
  const ITEMS = [
    { img: "gw032.jpg", a: -90, r: 33, s: 21, d: 1.0 },
    { img: "gw043.jpg", a: -38, r: 34, s: 18, d: 0.7 },
    { text: "Салют!", a: 8, r: 33, s: 15, d: 1.2 },
    { img: "gw021.jpg", a: 52, r: 34, s: 20, d: 0.8 },
    { img: "gw012.jpg", a: 100, r: 33, s: 19, d: 1.1 },
    { img: "g-kid.jpg", a: 148, r: 34, s: 17, d: 0.6 },
    { img: "gw001.jpg", a: 196, r: 33, s: 19, d: 0.9 },
    { text: "5,0", a: 238, r: 35, s: 15, d: 1.3 },
    { img: "g-morgans.jpg", a: -64, r: 47, s: 11, d: 1.6 },
    { img: "gw055.jpg", a: -14, r: 47, s: 12, d: 1.5 },
    { img: "scissors.jpg", a: 30, r: 47, s: 10, d: 1.8 },
    { img: "gw030.jpg", a: 76, r: 47, s: 11, d: 1.4 },
    { text: "Все свои", a: 124, r: 47, s: 12, d: 1.7 },
    { img: "gw101.jpg", a: 172, r: 47, s: 11, d: 1.5 },
    { img: "gw085.jpg", a: 218, r: 47, s: 10, d: 1.9 },
    { img: "g-products.jpg", a: 262, r: 47, s: 11, d: 1.6 },
  ];

  const nodes = ITEMS.map((it, i) => {
    const el = document.createElement("div");
    el.className = "lid" + (it.text ? " lid--text" : "");
    el.style.setProperty("--rim", RIMS[i % RIMS.length]);
    const rad = (it.a * Math.PI) / 180;
    el.style.left = 50 + Math.cos(rad) * it.r + "%";
    el.style.top = 50 + Math.sin(rad) * it.r + "%";
    el.style.width = it.s + "%";
    el.innerHTML = it.text
      ? `<span>${it.text}</span>`
      : `<img src="img/${it.img}" alt="" loading="eager">`;
    lids.appendChild(el);
    return { el, it, tilt: (i % 2 ? 1 : -1) * (4 + (i % 5) * 3) };
  });

  // один выход на сцену: крышки по очереди «прилипают» к стене
  nodes.forEach((n, i) => {
    n.el.style.transform = `rotate(${n.tilt}deg) scale(${reduce ? 1 : 0.4})`;
    setTimeout(() => {
      n.el.classList.add("is-in");
      if (!reduce) {
        n.el.animate(
          [
            { transform: `rotate(${n.tilt - 90}deg) scale(.4)` },
            { transform: `rotate(${n.tilt + 6}deg) scale(1.06)`, offset: 0.7 },
            { transform: `rotate(${n.tilt}deg) scale(1)` },
          ],
          { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
        );
      }
    }, reduce ? 0 : 250 + i * 70);
  });

  // крышки слегка смещаются за мышью, каждая на свою глубину
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      nodes.forEach(({ el, it }) => {
        el.style.translate = `calc(-50% + ${cx * it.d * 14}px) calc(-50% + ${cy * it.d * 14}px)`;
      });
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX / innerWidth - 0.5;
      ty = e.clientY / innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* ---------- шапка ---------- */
  const bar = document.querySelector(".bar");
  const onScrollBar = () => bar.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScrollBar, { passive: true });
  onScrollBar();

  /* ---------- место: вертикальный скролл двигает ленту вбок ---------- */
  const place = document.getElementById("place");
  const track = document.getElementById("placeTrack");
  if (!reduce) {
    const moveTrack = () => {
      const rect = place.getBoundingClientRect();
      const total = place.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / total));
      const max = track.scrollWidth - innerWidth;
      track.style.transform = `translate3d(${-p * Math.max(0, max)}px,0,0)`;
    };
    addEventListener("scroll", moveTrack, { passive: true });
    addEventListener("resize", moveTrack);
    moveTrack();
  }

  /* ---------- работы: крупный просмотр ---------- */
  const box = document.getElementById("lightbox");
  const boxImg = box.querySelector("img");
  const close = () => { box.hidden = true; document.body.style.overflow = ""; };
  document.getElementById("worksGrid").addEventListener("click", (e) => {
    const img = e.target.closest("button")?.querySelector("img");
    if (!img) return;
    boxImg.src = img.src;
    boxImg.alt = img.alt;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    box.querySelector(".lightbox__close").focus();
  });
  box.addEventListener("click", (e) => { if (e.target !== boxImg) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
})();
