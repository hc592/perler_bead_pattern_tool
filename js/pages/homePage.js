(function (global) {
function init(ctx) {
  const { $, openImagePicker, drawOriginalImage, generatePattern, showToast, showPage, confirmImageReplacement } = ctx;
  const fileInput = $("fileInput");

  $("startGenerateBtn")?.addEventListener("click", openImagePicker);
  $("myPatternsBtn")?.addEventListener("click", () => showPage("myPatternsPage", "forward"));

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;
      if (typeof confirmImageReplacement === "function" && !confirmImageReplacement()) {
        fileInput.value = "";
        return;
      }
      const img = new Image();
      img.onload = () => {
        sourceImage = img;
        lastPatternData = null;
        hasPendingPatternEdits = false;
        drawOriginalImage(img);
        showPage("appPage", "forward");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            generatePattern();
          });
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => showToast("图片读取失败", true);
      img.src = URL.createObjectURL(file);
    });


}

  global.HomePage = { init };
})(window);
