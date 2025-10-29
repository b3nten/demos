// basic

const content = "Hello, world!";

if (import.meta.main) {
  const title = document.createElement("hi");
  title.style.position = "absolute";
  title.style.top = "50%";
  title.style.left = "50%";
  title.style.transform = "translate(-50%, -50%)";
  title.style.color = "white";
  title.style.fontSize = "2em";
  title.style.textAlign = "center";
  title.style.zIndex = "100";
  title.textContent = content;
  playground.appendChild(title);
}
