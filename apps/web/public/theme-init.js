// Applies the saved or system theme before first paint, to avoid a flash.
// External file so the Content-Security-Policy needs no inline scripts.
(function () {
  var theme;
  try {
    theme = localStorage.getItem("theme");
  } catch (e) {}
  if (theme !== "light" && theme !== "dark") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
})();
