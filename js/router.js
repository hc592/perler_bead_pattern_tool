(function (global) {
  const APP_PAGE_IDS = ["homePage", "myPatternsPage", "appPage", "exportPage"];
  let currentPageId = document.querySelector(".app-page.active")?.id || "homePage";
  let pageTransitionToken = 0;
  let pageTransitionTimer = 0;
  let pagePreparationHooks = {};

  const $ = (id) => document.getElementById(id);

  function removePageAnimationClasses(page) {
    if (!page) return;
    page.classList.remove(
      "page-entering",
      "page-leaving",
      "slide-in-forward",
      "fade-out-forward",
      "fade-in-back",
      "slide-out-back"
    );
  }

  function configurePagePreparation(hooks = {}) {
    pagePreparationHooks = { ...hooks };
  }

  function preparePageContent(pageId) {
    const prepare = pagePreparationHooks[pageId];
    if (typeof prepare === "function") prepare();
  }

  function finalizePageTransition(pageId) {
    const shell = document.querySelector(".mobile-shell");
    APP_PAGE_IDS.forEach(id => {
      const page = $(id);
      if (!page) return;
      removePageAnimationClasses(page);
      page.classList.toggle("active", id === pageId);
    });
    if (shell) {
      shell.classList.remove("page-transitioning");
      shell.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }

  function showPage(pageId, direction = "forward") {
    const toPage = $(pageId);
    if (!toPage) return;
    if (pageTransitionTimer) clearTimeout(pageTransitionTimer);

    if (pageId === currentPageId) {
      finalizePageTransition(pageId);
      preparePageContent(pageId);
      return;
    }

    const fromPage = $(currentPageId);
    const shell = document.querySelector(".mobile-shell");
    const isBack = direction === "back";
    const token = ++pageTransitionToken;

    APP_PAGE_IDS.forEach(id => {
      const page = $(id);
      if (!page) return;
      removePageAnimationClasses(page);
      if (id !== currentPageId && id !== pageId) page.classList.remove("active");
    });

    if (shell) shell.classList.add("page-transitioning");

    if (fromPage) {
      fromPage.classList.add(
        "active",
        "page-leaving",
        isBack ? "slide-out-back" : "fade-out-forward"
      );
    }

    toPage.classList.add(
      "active",
      "page-entering",
      isBack ? "fade-in-back" : "slide-in-forward"
    );

    currentPageId = pageId;
    preparePageContent(pageId);

    const finish = () => {
      if (token !== pageTransitionToken) return;
      finalizePageTransition(pageId);
    };
    toPage.addEventListener("animationend", finish, { once: true });
    pageTransitionTimer = setTimeout(finish, 380);
  }

  global.AppRouter = {
    APP_PAGE_IDS,
    get currentPageId() { return currentPageId; },
    configurePagePreparation,
    preparePageContent,
    finalizePageTransition,
    showPage
  };
})(window);
