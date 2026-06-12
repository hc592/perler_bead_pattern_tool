(function (global) {
const state = {
  lastPatternData: null,
  originalImage: null,
  showOriginalBase: false,
  isOriginalCompareActive: false,
  originalBaseTransparency: 0,
  patternTransparency: 0,
  activeTool: "paint",
  paintBrushSize: 1,
  eraseBrushSize: 1,
  selectedPaletteIndex: null,
  selectedColor: "#ff004d",
  selectedSeed: null,
  fillEmptyModeActive: false,
  editorZoom: 16,
  previewZoom: 1,
  initialPreviewZoom: 1,
  previewRedrawTimer: 0,
  exportPreviewZoom: 1,
  useBeadColorCodes: true,
  activeStylePreset: "original",
  beadColorCodeCache: new Map(),
  isPreviewPanning: false,
  previewPanStartX: 0,
  previewPanStartY: 0,
  previewPanStartScrollLeft: 0,
  previewPanStartScrollTop: 0,
  isExportPreviewPanning: false,
  exportPreviewPanStartX: 0,
  exportPreviewPanStartY: 0,
  exportPreviewPanStartScrollLeft: 0,
  exportPreviewPanStartScrollTop: 0,
  isDrawing: false,
  previewEditModeActive: false,
  operationControlsActive: false,
  operationCursorX: 0,
  operationCursorY: 0,
  isPanning: false,
  panStartX: 0,
  panStartY: 0,
  panStartScrollLeft: 0,
  panStartScrollTop: 0,
  lastPaintKey: "",
  undoStack: [],
  redoStack: [],
  userAdjustedZoom: false,
  hasPendingPatternEdits: false,
  palette: [],
  toneAdjustments: { brightness: 0, contrast: 0, saturation: 0, temperature: 0 },
  exportConfig: { useBeadColorCodes: true, previewZoom: 1 }
};

Object.defineProperty(state, "sourceImage", {
  get() { return state.originalImage; },
  set(value) { state.originalImage = value; }
});

function defineGlobalStateProperty(globalName, stateName = globalName) {
  if (Object.prototype.hasOwnProperty.call(globalThis, globalName)) return;
  Object.defineProperty(globalThis, globalName, {
    configurable: true,
    get() { return state[stateName]; },
    set(value) {
      state[stateName] = value;
      if (globalName === "exportPreviewZoom") state.exportConfig.previewZoom = value;
      if (globalName === "useBeadColorCodes") state.exportConfig.useBeadColorCodes = value;
    }
  });
}

defineGlobalStateProperty("sourceImage", "originalImage");
defineGlobalStateProperty("originalImage", "originalImage");
[
  "lastPatternData",
  "showOriginalBase",
  "isOriginalCompareActive",
  "originalBaseTransparency",
  "patternTransparency",
  "activeTool",
  "paintBrushSize",
  "eraseBrushSize",
  "selectedPaletteIndex",
  "selectedColor",
  "selectedSeed",
  "fillEmptyModeActive",
  "editorZoom",
  "previewZoom",
  "initialPreviewZoom",
  "previewRedrawTimer",
  "exportPreviewZoom",
  "useBeadColorCodes",
  "activeStylePreset",
  "beadColorCodeCache",
  "isPreviewPanning",
  "previewPanStartX",
  "previewPanStartY",
  "previewPanStartScrollLeft",
  "previewPanStartScrollTop",
  "isExportPreviewPanning",
  "exportPreviewPanStartX",
  "exportPreviewPanStartY",
  "exportPreviewPanStartScrollLeft",
  "exportPreviewPanStartScrollTop",
  "isDrawing",
  "previewEditModeActive",
  "operationControlsActive",
  "operationCursorX",
  "operationCursorY",
  "isPanning",
  "panStartX",
  "panStartY",
  "panStartScrollLeft",
  "panStartScrollTop",
  "lastPaintKey",
  "undoStack",
  "redoStack",
  "userAdjustedZoom",
  "hasPendingPatternEdits"
].forEach(name => defineGlobalStateProperty(name));

  global.AppState = {
    state,
    defineGlobalStateProperty
  };
})(window);
