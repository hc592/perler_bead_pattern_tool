(function (global) {
function init(ctx) {
  const {
    $,
    showPage,
    bindTouchPanAndPinch,
    getExportPreviewCanvas,
    setExportPreviewZoom,
    downloadCanvasPng,
    downloadSvg,
    downloadCsv,
    mirrorCurrentPattern,
    toggleBeadColorCodeMode,
    clearAll
  } = ctx;
  const exportPreviewWrap = $("exportPreviewWrap");

    $("backToAppFromExportBtn").addEventListener("click", () => showPage("appPage", "back"));
    $("backHomeFromExportBtn").addEventListener("click", () => showPage("homePage", "back"));


    $("downloadPngBtn").addEventListener("click", downloadCanvasPng);
    $("downloadSvgBtn").addEventListener("click", downloadSvg);
    $("downloadCsvBtn").addEventListener("click", downloadCsv);
    $("mirrorPatternBtn").addEventListener("click", mirrorCurrentPattern);
    $("toggleBeadCodeBtn").addEventListener("click", toggleBeadColorCodeMode);
    const clearBtn = $("clearBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearAll);

    bindTouchPanAndPinch(exportPreviewWrap, () => exportPreviewZoom, setExportPreviewZoom, "grab", () => getExportPreviewCanvas());

    exportPreviewWrap.addEventListener("wheel", evt => {
      if (!lastPatternData) return;
      evt.preventDefault();
      evt.stopPropagation();
      const factor = evt.deltaY < 0 ? 1.12 : 1 / 1.12;
      setExportPreviewZoom(exportPreviewZoom * factor, evt);
    }, { passive: false });
    exportPreviewWrap.addEventListener("mousedown", evt => {
      if (!lastPatternData || evt.button !== 0) return;
      isExportPreviewPanning = true;
      exportPreviewPanStartX = evt.clientX;
      exportPreviewPanStartY = evt.clientY;
      exportPreviewPanStartScrollLeft = exportPreviewWrap.scrollLeft;
      exportPreviewPanStartScrollTop = exportPreviewWrap.scrollTop;
      exportPreviewWrap.style.cursor = "grabbing";
      evt.preventDefault();
    });
    exportPreviewWrap.addEventListener("mousemove", evt => {
      if (!isExportPreviewPanning) return;
      exportPreviewWrap.scrollLeft = exportPreviewPanStartScrollLeft - (evt.clientX - exportPreviewPanStartX);
      exportPreviewWrap.scrollTop = exportPreviewPanStartScrollTop - (evt.clientY - exportPreviewPanStartY);
    });
    exportPreviewWrap.addEventListener("mouseleave", () => {
      if (isExportPreviewPanning) {
        isExportPreviewPanning = false;
        exportPreviewWrap.style.cursor = "grab";
      }
    });


}

  global.ExportPage = { init };
})(window);
