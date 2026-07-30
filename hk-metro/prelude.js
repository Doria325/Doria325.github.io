// Small browser wrapper for the supplied p5.js sketch.
(function () {
  const width = 1320;
  const height = 700;

  function fitPage() {
    const scale = Math.min(
      1,
      window.innerWidth / width,
      window.innerHeight / height
    );
    document.documentElement.style.setProperty("--page-scale", scale);
  }

  window.addEventListener("resize", fitPage);
  window.addEventListener("DOMContentLoaded", fitPage);

  const observer = new MutationObserver(() => {
    if (document.querySelector("canvas")) {
      document.getElementById("loading")?.remove();
      observer.disconnect();
    }
  });

  window.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true });
  });
})();
