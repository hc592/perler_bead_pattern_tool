(function (global) {
  function assertNamespace(name) {
    if (!global[name]) throw new Error(name + ' must load before app.js');
    return global[name];
  }

  function initPageModule(name, module, context) {
    try {
      module.init(context);
    } catch (error) {
      console.error('Failed to initialize ' + name, error);
      throw error;
    }
  }

  function init() {
    const AppState = assertNamespace('AppState');
    const AppRouter = assertNamespace('AppRouter');
    const HomePage = assertNamespace('HomePage');
    const MyPatternsPage = assertNamespace('MyPatternsPage');
    const AppPage = assertNamespace('AppPage');
    const ExportPage = assertNamespace('ExportPage');

    const context = AppPage.createContext(AppRouter);

    AppRouter.configurePagePreparation({
      appPage() {
        if (!lastPatternData) return;
        context.switchTab('preview');
        requestAnimationFrame(() => {
          context.fitPreviewZoomToOriginalSize();
        });
      },
      exportPage() {
        if (!lastPatternData) return;
        requestAnimationFrame(() => context.updateExportSection(true));
      }
    });

    global.perlerBeadApp = {
      state: AppState.state,
      showPage: AppRouter.showPage,
      generatePattern: context.generatePattern,
      refreshAllViews: context.refreshAllViews,
      updateExportSection: context.updateExportSection
    };

    initPageModule('homePage', HomePage, context);
    initPageModule('myPatternsPage', MyPatternsPage, context);
    initPageModule('appPage', AppPage, context);
    initPageModule('exportPage', ExportPage, context);
    context.initSliderProgressZeroFix();
    document.documentElement.dataset.perlerAppReady = 'true';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})(window);
