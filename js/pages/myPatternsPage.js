(function (global) {
function init(ctx) {
  const { $, showPage } = ctx;

  $("myPatternsBackBtn")?.addEventListener("click", () => showPage("homePage", "back"));
}

  global.MyPatternsPage = { init };
})(window);
