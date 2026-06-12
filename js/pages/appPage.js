(function (global) {
  const state = global.AppState && global.AppState.state;
  if (!state) throw new Error('AppState must load before AppPage');

const $ = (id) => document.getElementById(id);

    const fileInput = $("fileInput");
    const originalCanvas = $("originalCanvas");
    const patternCanvas = $("patternCanvas");
    const patternReferenceCanvas = $("patternReferenceCanvas");
    const patternWrap = $("patternWrap");
    const patternStage = $("patternStage");
    const patternOverlay = $("patternOverlay");
    const operationPad = $("operationPad");
    const operationCursorBox = $("operationCursorBox");
    // 原来的独立“图纸编辑”页已移除；编辑功能现在复用预览画布。
    const editorCanvas = $("editorCanvas") || patternCanvas;
    const editorReferenceCanvas = $("editorReferenceCanvas") || patternReferenceCanvas;
    const exportPreviewWrap = $("exportPreviewWrap");
    const exportSvgMount = $("exportSvgMount");
    const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });
    const patternCtx = patternCanvas.getContext("2d", { willReadFrequently: true });
    const patternReferenceCtx = patternReferenceCanvas.getContext("2d", { willReadFrequently: true });
    const editorCtx = editorCanvas.getContext("2d", { willReadFrequently: true });
    const editorReferenceCtx = editorReferenceCanvas.getContext("2d", { willReadFrequently: true });
    const editorStage = $("editorStage") || patternStage;
    const editorOverlay = $("editorOverlay") || patternOverlay;

    // Mutable UI, pattern, history, preview, and export state is centralized in state.js.
    const MAX_HISTORY = 60;
    const MIN_PREVIEW_ZOOM = 0.03;
    const MAX_PREVIEW_ZOOM = 8;
    const MIN_EXPORT_ZOOM = 0.03;
    const MAX_EXPORT_ZOOM = 8;
    const MAX_PREVIEW_BACKING_PIXELS = 12000000;
    const MAX_EDITOR_BACKING_PIXELS = 10000000;
    const MAX_EXPORT_PREVIEW_BACKING_PIXELS = 6000000;
    const MAX_CANVAS_OUTPUT_SCALE = 4;
    const SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789△○□◇☆✚✦♢♣♠♥●▲■◆".split("");
    const EXPORT_SITE_LABEL = "https://hc592.github.io/perler_bead_pattern_tool/";
    const ALPHA_THRESHOLD = 10;
    const WHITE_BG_THRESHOLD = 242;
    const MAX_EDITOR_COLOR_UI_OPTIONS = 512;
    const BEAD_COLOR_CHART_NAME = "Mard 221";
    const MARD_BEAD_PALETTE = [
      ["A1", "#faf5cd"], ["A2", "#fcfed6"], ["A3", "#fcff92"], ["A4", "#f7ec5c"], ["A5", "#f0d83a"], ["A6", "#fda951"], ["A7", "#fa8c4f"], ["A8", "#fbda4d"], ["A9", "#f79d5f"], ["A10", "#f47e38"], ["A11", "#fedb99"], ["A12", "#fda276"], ["A13", "#fec667"], ["A14", "#f75842"], ["A15", "#fbf65e"], ["A16", "#feff97"], ["A17", "#fde173"], ["A18", "#fcbf80"], ["A19", "#fd7e77"], ["A20", "#f9d666"], ["A21", "#fae393"], ["A22", "#edf878"], ["A23", "#e4c8ba"], ["A24", "#f3f6a9"], ["A25", "#fdf785"], ["A26", "#ffc734"],
      ["B1", "#dff13b"], ["B2", "#64f343"], ["B3", "#a1f586"], ["B4", "#5fdf34"], ["B5", "#39e158"], ["B6", "#64e0a4"], ["B7", "#3eae7c"], ["B8", "#1d9b54"], ["B9", "#2a5037"], ["B10", "#9ad1ba"], ["B11", "#627032"], ["B12", "#1a6e3d"], ["B13", "#c8e87d"], ["B14", "#abe84f"], ["B15", "#305335"], ["B16", "#c0ed9c"], ["B17", "#9eb33e"], ["B18", "#e6ed4f"], ["B19", "#26b78e"], ["B20", "#cbeccf"], ["B21", "#18616a"], ["B22", "#0a4241"], ["B23", "#343b1a"], ["B24", "#e8faa6"], ["B25", "#4e846d"], ["B26", "#907c35"], ["B27", "#d0e0af"], ["B28", "#9ee5bb"], ["B29", "#c6df5f"], ["B30", "#e3fbb1"], ["B31", "#b4e691"], ["B32", "#92ad60"],
      ["C1", "#f0fee4"], ["C2", "#abf8fe"], ["C3", "#a2e0f7"], ["C4", "#44cdfb"], ["C5", "#06aadf"], ["C6", "#54a7e9"], ["C7", "#3977ca"], ["C8", "#0f52bd"], ["C9", "#3349c3"], ["C10", "#3cbce3"], ["C11", "#2aded3"], ["C12", "#1e334e"], ["C13", "#cde7fe"], ["C14", "#d5fcf7"], ["C15", "#21c5c4"], ["C16", "#1858a2"], ["C17", "#02d1f3"], ["C18", "#213244"], ["C19", "#18869d"], ["C20", "#1a70a9"], ["C21", "#bcddfc"], ["C22", "#6bb1bb"], ["C23", "#c8e2fd"], ["C24", "#7ec5f9"], ["C25", "#a9e8e0"], ["C26", "#42adcf"], ["C27", "#d0def9"], ["C28", "#bdcee8"], ["C29", "#364a89"],
      ["D1", "#acb7ef"], ["D2", "#868dd3"], ["D3", "#3554af"], ["D4", "#162d7b"], ["D5", "#b34ec6"], ["D6", "#b37bdc"], ["D7", "#8758a9"], ["D8", "#e3d2fe"], ["D9", "#d5b9f4"], ["D10", "#301a49"], ["D11", "#beb9e2"], ["D12", "#dc99ce"], ["D13", "#b5038d"], ["D14", "#862993"], ["D15", "#2f1f8c"], ["D16", "#e2e4f0"], ["D17", "#c7d3f9"], ["D18", "#9a64b8"], ["D19", "#d8c2d9"], ["D20", "#9a35ad"], ["D21", "#940595"], ["D22", "#38389a"], ["D23", "#eadbf8"], ["D24", "#768ae1"], ["D25", "#4950c2"], ["D26", "#d6c6eb"],
      ["E1", "#f6d4cb"], ["E2", "#fcc1dd"], ["E3", "#f6bde8"], ["E4", "#e8649e"], ["E5", "#f0569f"], ["E6", "#eb4172"], ["E7", "#c53674"], ["E8", "#fddbe9"], ["E9", "#e376c7"], ["E10", "#d13b95"], ["E11", "#f7dad4"], ["E12", "#f693bf"], ["E13", "#b5026a"], ["E14", "#fad4bf"], ["E15", "#f5c9ca"], ["E16", "#fbf4ec"], ["E17", "#f7e3ec"], ["E18", "#f9c8db"], ["E19", "#f6bbd1"], ["E20", "#d7c6ce"], ["E21", "#c09da4"], ["E22", "#b38c9f"], ["E23", "#937d8a"], ["E24", "#debee5"],
      ["F1", "#fe9381"], ["F2", "#f63d4b"], ["F3", "#ee4e3e"], ["F4", "#fb2a40"], ["F5", "#e10328"], ["F6", "#913635"], ["F7", "#911932"], ["F8", "#bb0126"], ["F9", "#e0677a"], ["F10", "#874628"], ["F11", "#592323"], ["F12", "#f3536b"], ["F13", "#f45c45"], ["F14", "#fcadb2"], ["F15", "#d50527"], ["F16", "#f8c0a9"], ["F17", "#e89b7d"], ["F18", "#d07f4a"], ["F19", "#be454a"], ["F20", "#c69495"], ["F21", "#f2b8c6"], ["F22", "#f7c3d0"], ["F23", "#ed806c"], ["F24", "#e09daf"], ["F25", "#e84854"],
      ["G1", "#ffe4d3"], ["G2", "#fcc6ac"], ["G3", "#f1c4a5"], ["G4", "#dcb387"], ["G5", "#e7b34e"], ["G6", "#e3a014"], ["G7", "#985c3a"], ["G8", "#713d2f"], ["G9", "#e4b685"], ["G10", "#da8c42"], ["G11", "#dac898"], ["G12", "#fec993"], ["G13", "#b2714b"], ["G14", "#8b684c"], ["G15", "#f6f8e3"], ["G16", "#f2d8c1"], ["G17", "#77544e"], ["G18", "#ffe3d5"], ["G19", "#dd7d41"], ["G20", "#a5452f"], ["G21", "#b38561"],
      ["H1", "#ffffff"], ["H2", "#fbfbfb"], ["H3", "#b4b4b4"], ["H4", "#878787"], ["H5", "#464648"], ["H6", "#2c2c2c"], ["H7", "#010101"], ["H8", "#e7d6dc"], ["H9", "#efedee"], ["H10", "#ebebeb"], ["H11", "#cdcdcd"], ["H12", "#fdf6ee"], ["H13", "#f4edf1"], ["H14", "#ced7d4"], ["H15", "#9aa6a6"], ["H16", "#1b1213"], ["H17", "#f0eeef"], ["H18", "#fcfff6"], ["H19", "#f2eee5"], ["H20", "#96a09f"], ["H21", "#f8fbe6"], ["H22", "#cacad2"], ["H23", "#9b9c94"],
      ["M1", "#bbc6b6"], ["M2", "#909994"], ["M3", "#697e81"], ["M4", "#e0d4bc"], ["M5", "#d1ccaf"], ["M6", "#b0aa86"], ["M7", "#b0a796"], ["M8", "#ae8082"], ["M9", "#a68862"], ["M10", "#c4b3bb"], ["M11", "#9d7693"], ["M12", "#644b51"], ["M13", "#c79266"], ["M14", "#c27563"], ["M15", "#747d7a"]
    ].map(([code, hex]) => ({ code, hex, rgb: null }));

    const BAYER_4 = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];

    const PALETTES = {
      bw2: ["#000000", "#ffffff"],
      grayscale8: ["#000000", "#242424", "#494949", "#6d6d6d", "#919191", "#b6b6b6", "#dadada", "#ffffff"]
    };

    // 颜色模式默认使用“自动压缩为指定色数”。
    // 编辑模式中的画笔 / 替换 / 描边颜色不再受颜色模式限制，
    // 界面只保留一个原生自由选色器，内部仍会自动加入图纸调色板。
    const IMAGE_DERIVED_PALETTE_LIMITS = {};
    function isImageDerivedPaletteMode(mode) {
      return mode === "custom";
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function getDevicePixelScale() {
      return clamp(window.devicePixelRatio || 1, 1, 2);
    }
    function getCanvasOutputScale(baseW, baseH, displayZoom = 1, maxPixels = MAX_PREVIEW_BACKING_PIXELS) {
      const basePixels = Math.max(1, baseW * baseH);
      const desired = Math.max(0.25, displayZoom * getDevicePixelScale());
      const maxByPixels = Math.sqrt(Math.max(1, maxPixels) / basePixels);
      return clamp(Math.min(desired, maxByPixels), 0.25, MAX_CANVAS_OUTPUT_SCALE);
    }
    function getCanvasBaseWidth(canvas) {
      return Math.max(1, parseFloat(canvas.dataset.baseWidth || '') || (canvas.width / Math.max(0.001, parseFloat(canvas.dataset.outputScale || '1'))) || canvas.width || 1);
    }
    function getCanvasBaseHeight(canvas) {
      return Math.max(1, parseFloat(canvas.dataset.baseHeight || '') || (canvas.height / Math.max(0.001, parseFloat(canvas.dataset.outputScale || '1'))) || canvas.height || 1);
    }
    function hexToRgb(hex) {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function rgbToHex(r, g, b) {
      return "#" + [r, g, b].map(v => {
        const s = clamp(Math.round(v), 0, 255).toString(16);
        return s.length === 1 ? "0" + s : s;
      }).join("");
    }
    function normalizeColor(color) {
      if (!color || color === "transparent") return "transparent";
      if (color.startsWith("#") && color.length === 7) return color.toLowerCase();
      const temp = document.createElement("canvas");
      const ctx = temp.getContext("2d");
      ctx.fillStyle = color;
      return ctx.fillStyle.toLowerCase();
    }
    function distSq(a, b) {
      const dr = a[0] - b[0];
      const dg = a[1] - b[1];
      const db = a[2] - b[2];
      return dr * dr + dg * dg + db * db;
    }
    function nearestPaletteColor(r, g, b, paletteRgb) {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < paletteRgb.length; i++) {
        const d = distSq([r, g, b], paletteRgb[i]);
        if (d < bestD) { bestD = d; best = i; }
      }
      return paletteRgb[best];
    }
    function quantizeWebSafe(v) { return Math.round(v / 51) * 51; }
    function applyOrderedDither(r, g, b, x, y, amount = 38) {
      const threshold = (BAYER_4[y % 4][x % 4] / 15 - 0.5) * amount;
      return [clamp(r + threshold, 0, 255), clamp(g + threshold, 0, 255), clamp(b + threshold, 0, 255)];
    }
    const BACKGROUND_COLOR_MATCHERS = {
      white: (r, g, b) => r > 215 && g > 215 && b > 215,
      black: (r, g, b) => r < 55 && g < 55 && b < 55,
      gray: (r, g, b) => {
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const avg = (r + g + b) / 3;
        return max - min <= 28 && avg >= 55 && avg <= 220;
      },
      red: (r, g, b) => r >= 120 && r - g >= 28 && r - b >= 28,
      orange: (r, g, b) => r >= 150 && g >= 80 && g <= 190 && b <= 130 && r > g,
      yellow: (r, g, b) => r >= 150 && g >= 150 && b <= 135,
      green: (r, g, b) => g >= 95 && g - r >= 15 && g - b >= 15,
      blue: (r, g, b) => b >= 100 && b - r >= 10 && b - g >= 10,
      purple: (r, g, b) => r >= 95 && b >= 95 && g <= 150,
      pink: (r, g, b) => r >= 170 && b >= 120 && g >= 80 && r >= g,
    };
    function matchesBackgroundCleanupColor(color, mode = "white") {
      if (!color || color === "transparent") return false;
      const [r, g, b] = hexToRgb(color);
      const matcher = BACKGROUND_COLOR_MATCHERS[mode] || BACKGROUND_COLOR_MATCHERS.white;
      return matcher(r, g, b);
    }
    function removeOuterBackgroundBeadsAfterPattern(patternData, enabled, targetColorMode = "white") {
      if (!enabled || !patternData || !patternData.width || !patternData.height) return 0;
      const { width, height, palette, pixels } = patternData;
      const visited = new Uint8Array(width * height);
      const queue = [];

      function tryAdd(x, y) {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        const p = y * width + x;
        if (visited[p]) return;
        const index = pixels[y][x];
        if (!index || !matchesBackgroundCleanupColor(palette[index], targetColorMode)) return;
        visited[p] = 1;
        queue.push(p);
      }

      for (let x = 0; x < width; x++) {
        tryAdd(x, 0);
        tryAdd(x, height - 1);
      }
      for (let y = 1; y < height - 1; y++) {
        tryAdd(0, y);
        tryAdd(width - 1, y);
      }

      for (let head = 0; head < queue.length; head++) {
        const p = queue[head];
        const x = p % width;
        const y = Math.floor(p / width);
        tryAdd(x + 1, y);
        tryAdd(x - 1, y);
        tryAdd(x, y + 1);
        tryAdd(x, y - 1);
      }

      for (const p of queue) {
        const x = p % width;
        const y = Math.floor(p / width);
        pixels[y][x] = 0;
      }
      return queue.length;
    }
    function signedText(v) { return (v > 0 ? "+" : "") + v; }
    function getBeadDiameterMm() {
      // 界面已删除“拼豆规格”，内部默认按常规 5mm 计算导出元数据。
      return 5;
    }
    function formatMm(mm) {
      if (mm >= 1000) return (mm / 1000).toFixed(2) + "m";
      if (mm >= 100) return (mm / 10).toFixed(1) + "cm";
      return Math.round(mm) + "mm";
    }
    function getToneSettings() {
      return {
        brightness: parseInt($("brightnessRange").value, 10),
        contrast: parseInt($("contrastRange").value, 10),
        saturation: parseInt($("saturationRange").value, 10),
        temperature: parseInt($("temperatureRange").value, 10)
      };
    }
    const STYLE_PRESETS = {
      original: {
        label: "原图",
        values: { brightness: 0, contrast: 0, saturation: 0, temperature: 0 }
      },
      classic: {
        label: "经典鲜艳",
        values: { brightness: 6, contrast: 16, saturation: 24, temperature: 0 }
      },
      candy: {
        label: "糖果亮色",
        values: { brightness: 14, contrast: 6, saturation: 30, temperature: 2 }
      },
      pastel: {
        label: "马卡龙",
        values: { brightness: 18, contrast: -12, saturation: -24, temperature: 6 }
      },
      retro: {
        label: "复古像素",
        values: { brightness: -4, contrast: 18, saturation: -10, temperature: 18 }
      },
      contrast: {
        label: "高对比",
        values: { brightness: 0, contrast: 34, saturation: 8, temperature: 0 }
      },
      warm: {
        label: "暖色童话",
        values: { brightness: 8, contrast: 10, saturation: 14, temperature: 26 }
      },
      cool: {
        label: "冷色赛博",
        values: { brightness: -2, contrast: 18, saturation: 18, temperature: -24 }
      },
      mono: {
        label: "黑白漫画",
        values: { brightness: 4, contrast: 36, saturation: -100, temperature: 0 }
      }
    };

    function getStyleSettings() {
      const preset = STYLE_PRESETS[activeStylePreset] || STYLE_PRESETS.original;
      return preset.values || STYLE_PRESETS.original.values;
    }
    function resetToneSlidersToZero() {
      ["brightnessRange", "contrastRange", "saturationRange", "temperatureRange"].forEach(id => {
        const el = $(id);
        if (el) el.value = 0;
      });
      updateToneLabels();
    }
    function updateStylePresetUI(nextId = activeStylePreset) {
      activeStylePreset = STYLE_PRESETS[nextId] ? nextId : "original";
      document.querySelectorAll(".style-preset-btn").forEach(btn => {
        const active = btn.dataset.stylePreset === activeStylePreset;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
    }
    function applyStylePreset(presetId) {
      const preset = STYLE_PRESETS[presetId] || STYLE_PRESETS.original;
      if (sourceImage && !confirmInvalidatingAdjustments("切换风格")) {
        updateStylePresetUI(activeStylePreset);
        return false;
      }
      updateStylePresetUI(presetId);
      resetToneSlidersToZero();
      if (sourceImage) {
        const ok = generatePattern({ skipInvalidatingConfirm: true, reason: "切换风格" });
        if (ok) showToast(presetId === "original" ? "已切换为原图" : `已应用${preset.label}风格`);
        return ok;
      } else {
        rememberSafeInvalidatingControlValues();
        showToast(presetId === "original" ? "已选择原图" : `已选择${preset.label}风格，选择图片后生效`);
        return true;
      }
    }

    function updateToneLabels() {
      const values = {
        brightness: signedText(parseInt($("brightnessRange").value, 10)),
        contrast: signedText(parseInt($("contrastRange").value, 10)),
        saturation: signedText(parseInt($("saturationRange").value, 10)),
        temperature: signedText(parseInt($("temperatureRange").value, 10))
      };
      $("brightnessValue").textContent = values.brightness;
      $("contrastValue").textContent = values.contrast;
      $("saturationValue").textContent = values.saturation;
      $("temperatureValue").textContent = values.temperature;
    }
    function applyToneAdjustments(imageData, settings, alphaThreshold) {
      const adjusted = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
      const data = adjusted.data;
      const brightnessShift = settings.brightness * 1.2;
      const contrastValue = settings.contrast * 2.55;
      const contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue || 1));
      const saturationFactor = Math.max(0, (100 + settings.saturation) / 100);
      const temperatureShift = settings.temperature * 1.1;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] <= alphaThreshold) continue;
        let r = data[i], g = data[i + 1], b = data[i + 2];
        r += brightnessShift; g += brightnessShift; b += brightnessShift;
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * saturationFactor;
        g = gray + (g - gray) * saturationFactor;
        b = gray + (b - gray) * saturationFactor;
        r += temperatureShift; g += temperatureShift * 0.12; b -= temperatureShift;
        data[i] = clamp(r, 0, 255); data[i + 1] = clamp(g, 0, 255); data[i + 2] = clamp(b, 0, 255);
      }
      return adjusted;
    }
    function medianCutPalette(pixels, colorCount) {
      if (!pixels.length) return [[255, 255, 255]];
      let boxes = [pixels.slice()];
      const channelRange = (box, c) => {
        let min = 255, max = 0;
        for (const p of box) { if (p[c] < min) min = p[c]; if (p[c] > max) max = p[c]; }
        return max - min;
      };
      while (boxes.length < colorCount) {
        let bestIndex = -1, bestRange = -1;
        for (let i = 0; i < boxes.length; i++) {
          if (boxes[i].length <= 1) continue;
          const range = Math.max(channelRange(boxes[i], 0), channelRange(boxes[i], 1), channelRange(boxes[i], 2));
          if (range > bestRange) { bestRange = range; bestIndex = i; }
        }
        if (bestIndex === -1) break;
        const box = boxes.splice(bestIndex, 1)[0];
        const ranges = [channelRange(box, 0), channelRange(box, 1), channelRange(box, 2)];
        const channel = ranges.indexOf(Math.max(...ranges));
        box.sort((a, b) => a[channel] - b[channel]);
        const mid = Math.floor(box.length / 2);
        boxes.push(box.slice(0, mid), box.slice(mid));
      }
      return boxes.map(box => {
        let r = 0, g = 0, b = 0;
        for (const p of box) { r += p[0]; g += p[1]; b += p[2]; }
        const len = Math.max(1, box.length);
        return [Math.round(r / len), Math.round(g / len), Math.round(b / len)];
      });
    }
    function buildPaletteFromMode(imageData, mode, colorCount, alphaThreshold) {
      if (isImageDerivedPaletteMode(mode)) {
        const targetCount = mode === "custom" ? colorCount : IMAGE_DERIVED_PALETTE_LIMITS[mode];
        const pixels = [];
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] <= alphaThreshold) continue;
          pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        return medianCutPalette(pixels, targetCount);
      }
      if (PALETTES[mode]) return PALETTES[mode].map(hexToRgb);
      return null;
    }

    function processImageToPattern(imageData, mode, colorCount, dither, alphaThreshold) {
      const { width, height, data } = imageData;
      const pixels = [];
      const palette = ["transparent"];
      const paletteMap = new Map([["transparent", 0]]);
      const removeWhiteBg = $("removeWhiteBg").checked;
      const backgroundCleanupColor = $("backgroundCleanupColor")?.value || "white";
      const fixedPalette = buildPaletteFromMode(imageData, mode, colorCount, alphaThreshold);

      if (fixedPalette) {
        palette.length = 0; paletteMap.clear();
        const seen = new Set();
        const colors = ["transparent"];
        for (const rgb of fixedPalette) {
          const key = rgbToHex(rgb[0], rgb[1], rgb[2]).toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          colors.push(key);
        }
        colors.forEach((key, i) => {
          palette.push(key); paletteMap.set(key, i);
        });
      }

      for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          let r = data[i], g = data[i + 1], b = data[i + 2];
          const a = data[i + 3];
          if (a <= alphaThreshold) { row.push(0); continue; }
          if (dither === "ordered" && mode !== "free") [r, g, b] = applyOrderedDither(r, g, b, x, y);
          if (mode === "websafe") { r = quantizeWebSafe(r); g = quantizeWebSafe(g); b = quantizeWebSafe(b); }
          else if (fixedPalette) { [r, g, b] = nearestPaletteColor(r, g, b, fixedPalette); }
          const key = rgbToHex(r, g, b).toLowerCase();
          let index = paletteMap.get(key);
          if (index === undefined) { index = palette.length; palette.push(key); paletteMap.set(key, index); }
          row.push(index);
        }
        pixels.push(row);
      }
      const patternData = {
        width, height, palette, pixels,
        meta: {
          type: "perler-bead-pattern",
          version: 1,
          source: "perler-bead-pattern-tool",
          paletteMode: mode,
          paletteSource: isImageDerivedPaletteMode(mode) ? "image-derived" : (mode === "free" ? "free-image-colors" : "fixed-palette"),
          beadDiameterMm: getBeadDiameterMm(),
          note: "pixels[y][x] is the palette index. palette[0] is transparent / no bead."
        }
      };
      const removedWhiteBgBeads = removeOuterBackgroundBeadsAfterPattern(patternData, removeWhiteBg, backgroundCleanupColor);
      patternData.meta.whiteBackgroundRemoval = removeWhiteBg ? `post-pattern-edge-connected-${backgroundCleanupColor}-beads` : "off";
      patternData.meta.backgroundCleanupColor = backgroundCleanupColor;
      patternData.meta.removedWhiteBgBeads = removedWhiteBgBeads;
      return patternData;
    }

    function clonePatternData(data) {
      return {
        width: data.width,
        height: data.height,
        palette: data.palette.slice(),
        pixels: data.pixels.map(row => row.slice()),
        meta: data.meta ? { ...data.meta } : undefined
      };
    }
    function pushHistory() {
      if (!lastPatternData) return;
      undoStack.push(clonePatternData(lastPatternData));
      if (undoStack.length > MAX_HISTORY) undoStack.shift();
      redoStack.length = 0;
      hasPendingPatternEdits = true;
      updateUndoRedoButtons();
      updatePreviewEditModeUI();
    }
    function undo() {
      if (!undoStack.length || !lastPatternData) return;
      redoStack.push(clonePatternData(lastPatternData));
      lastPatternData = undoStack.pop();
      refreshAllViews();
      showToast("已撤销");
    }
    function redo() {
      if (!redoStack.length || !lastPatternData) return;
      undoStack.push(clonePatternData(lastPatternData));
      lastPatternData = redoStack.pop();
      refreshAllViews();
      showToast("已重做");
    }
    function updateUndoRedoButtons() {
      ["undoBtn", "previewUndoBtn"].forEach(id => { const el = $(id); if (el) el.disabled = !lastPatternData || undoStack.length === 0; });
      ["redoBtn", "previewRedoBtn"].forEach(id => { const el = $(id); if (el) el.disabled = !lastPatternData || redoStack.length === 0; });
    }

    const INVALIDATING_CONTROL_IDS = [
      "beadWidth",
      "customColors",
      "brightnessRange",
      "contrastRange",
      "saturationRange",
      "temperatureRange",
      "paletteMode",
      "ditherMode",
      "removeWhiteBg",
      "backgroundCleanupColor"
    ];
    const INVALIDATING_ACTION_LABELS = {
      beadWidth: "修改图纸规格",
      customColors: "修改色数",
      brightnessRange: "调整亮度",
      contrastRange: "调整对比度",
      saturationRange: "调整饱和度",
      temperatureRange: "调整色温",
      paletteMode: "修改颜色模式",
      ditherMode: "修改抖动效果",
      removeWhiteBg: "修改背景清理",
      backgroundCleanupColor: "修改背景颜色"
    };
    let lastSafeInvalidatingControlValues = {};
    let imageReplacementConfirmed = false;

    function getControlStoredValue(id) {
      const el = $(id);
      if (!el) return undefined;
      return el.type === "checkbox" ? !!el.checked : el.value;
    }
    function setControlStoredValue(id, value) {
      const el = $(id);
      if (!el || value === undefined) return;
      if (el.type === "checkbox") el.checked = !!value;
      else el.value = value;
    }
    function syncInvalidatingControlLabels() {
      const beadWidthValue = $("beadWidthValue");
      const customColorsValue = $("customColorsValue");
      if (beadWidthValue && $("beadWidth")) beadWidthValue.textContent = $("beadWidth").value;
      if (customColorsValue && $("customColors")) customColorsValue.textContent = $("customColors").value;
      updateToneLabels();
      updateGridLineOptionsUI();
    }
    function rememberSafeInvalidatingControlValues() {
      lastSafeInvalidatingControlValues = {};
      INVALIDATING_CONTROL_IDS.forEach(id => {
        lastSafeInvalidatingControlValues[id] = getControlStoredValue(id);
      });
      lastSafeInvalidatingControlValues.activeStylePreset = activeStylePreset;
    }
    function restoreSafeInvalidatingControlValues() {
      INVALIDATING_CONTROL_IDS.forEach(id => setControlStoredValue(id, lastSafeInvalidatingControlValues[id]));
      if (lastSafeInvalidatingControlValues.activeStylePreset) updateStylePresetUI(lastSafeInvalidatingControlValues.activeStylePreset);
      syncInvalidatingControlLabels();
    }
    function hasInvalidatingPatternEdits() {
      return !!lastPatternData && !!hasPendingPatternEdits;
    }
    function confirmInvalidatingAdjustments(actionName = "这个操作") {
      if (!hasInvalidatingPatternEdits()) return true;
      const message = `${actionName}会重新生成或清空当前图纸，之前用画笔、橡皮、同色处理、填充、描边或镜像做过的调整会被覆盖，并且不能再撤销。是否继续？`;
      const ok = window.confirm(message);
      if (!ok) showToast("已取消，当前图纸已保留");
      return ok;
    }
    function confirmImageReplacement() {
      if (imageReplacementConfirmed) {
        imageReplacementConfirmed = false;
        return true;
      }
      return confirmInvalidatingAdjustments("重新选择图片");
    }
    function ensureColorInPalette(color) {
      color = normalizeColor(color);
      if (color === "transparent") return 0;
      let index = lastPatternData.palette.indexOf(color);
      if (index === -1) { index = lastPatternData.palette.length; lastPatternData.palette.push(color); }
      return index;
    }

    function getMaterialCounts(patternData = lastPatternData) {
      const counts = Array(patternData.palette.length).fill(0);
      for (const row of patternData.pixels) for (const index of row) {
        if (index !== 0 && patternData.palette[index] !== "transparent") counts[index]++;
      }
      return counts;
    }
    function getUsedPaletteEntries(patternData = lastPatternData) {
      if (!patternData) return [];
      const counts = getMaterialCounts(patternData);
      const entries = [];
      for (let i = 1; i < patternData.palette.length; i++) {
        if (counts[i] > 0) entries.push({ index: i, color: patternData.palette[i], count: counts[i], symbol: SYMBOLS[(i - 1) % SYMBOLS.length] || String(i) });
      }
      return entries;
    }

    function getNearestBeadColorCode(color) {
      if (!color || color === "transparent") return { code: "-", hex: "transparent", distance: 0 };
      const normalized = normalizeColor(color);
      const cached = beadColorCodeCache.get(normalized);
      if (cached) return cached;
      const rgb = hexToRgb(normalized);
      let best = null;
      let bestD = Infinity;
      for (const bead of MARD_BEAD_PALETTE) {
        if (!bead.rgb) bead.rgb = hexToRgb(bead.hex);
        const d = distSq(rgb, bead.rgb);
        if (d < bestD) { bestD = d; best = bead; }
      }
      const result = { code: best ? best.code : "-", hex: best ? best.hex : normalized, distance: Math.sqrt(bestD) };
      beadColorCodeCache.set(normalized, result);
      return result;
    }
    function getMaterialNumberLabel(entry) {
      if (!entry) return "";
      return String(entry.index);
    }
    function getMaterialColorCode(entry) {
      if (!entry) return "";
      return useBeadColorCodes ? getNearestBeadColorCode(entry.color).code : entry.color.toUpperCase();
    }
    function getMaterialColorTitle() {
      return useBeadColorCodes ? `${BEAD_COLOR_CHART_NAME} 色卡编号` : "HEX 色号";
    }
    function updateBeadCodeButton() {
      const btn = $("toggleBeadCodeBtn");
      if (!btn) return;
      btn.textContent = useBeadColorCodes ? "清单用 HEX 色号" : "清单用色卡编号";
      btn.classList.toggle("active", useBeadColorCodes);
      btn.title = useBeadColorCodes
        ? "当前只把材料清单中的 HEX 色号显示为近似 Mard 拼豆色卡编号；图纸上的数字编号保持不变。点击切回 HEX。"
        : "点击后，只把材料清单中的 HEX 色号改成近似 Mard 拼豆色卡编号；图纸上的数字编号不变。";
    }
    function toggleBeadColorCodeMode() {
      useBeadColorCodes = !useBeadColorCodes;
      updateBeadCodeButton();
      updateExportSection(false);
      showToast(useBeadColorCodes ? "清单已使用色卡编号" : "清单已使用 HEX 色号");
    }
    function countTotalBeads(patternData = lastPatternData) {
      return getMaterialCounts(patternData).reduce((sum, n, i) => i === 0 ? sum : sum + n, 0);
    }

    function getGridLineMode() {
      return $("gridLineMode")?.value || "black";
    }
    function isWhiteGridLineSelected() {
      return getGridLineMode() === "white";
    }
    function shouldShowGridLines() {
      return getGridLineMode() !== "none";
    }
    function getCoordGuideStep() {
      const value = $("coordGuideMode")?.value || "none";
      return value === "5" ? 5 : value === "10" ? 10 : 0;
    }
    function getGridLineColor() {
      // 黑线使用纯黑，避免在浅色/彩色图纸上发灰不明显。
      return isWhiteGridLineSelected() ? "#ffffff" : "#000000";
    }
    function getGridLineWidth() {
      // 相比上一版整体削弱约 30%，让普通网格线更轻一些。
      return isWhiteGridLineSelected() ? 0.8 : 0.88;
    }
    function getCoordGuideLineColor() {
      // 辅助线固定使用黄色，不再用加粗黑/白线。
      return "#ffd400";
    }
    function getCoordGuideLineWidth() {
      // 辅助线不再加粗，和普通网格线保持一致。
      return getGridLineWidth();
    }
    function drawCanvasGridLines(ctx, width, height, cell, margin, color, lineWidth = 1, step = 1, skipOuter = false) {
      if (!width || !height || !cell) return;
      const offset = Math.round(lineWidth) % 2 === 1 ? 0.5 : 0;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "butt";
      ctx.beginPath();
      const startX = skipOuter ? step : 0;
      const endX = skipOuter ? width - 1 : width;
      for (let x = startX; x <= endX; x += step) {
        const gx = margin + x * cell + offset;
        ctx.moveTo(gx, margin);
        ctx.lineTo(gx, margin + height * cell);
      }
      const startY = skipOuter ? step : 0;
      const endY = skipOuter ? height - 1 : height;
      for (let y = startY; y <= endY; y += step) {
        const gy = margin + y * cell + offset;
        ctx.moveTo(margin, gy);
        ctx.lineTo(margin + width * cell, gy);
      }
      ctx.stroke();
      ctx.restore();
    }
    function updateGridLineOptionsUI() {
      // 网格线和辅助线现在都由下拉框直接控制，不再需要额外显示/隐藏选项。
    }

    function getPatternRenderOptions(forExport = false) {
      const maxDim = Math.max(lastPatternData ? lastPatternData.width : 1, lastPatternData ? lastPatternData.height : 1);
      let cell = forExport ? 52 : clamp(Math.floor(900 / maxDim), 8, 28);
      if (!forExport && maxDim > 110) cell = 7;
      return {
        cell,
        margin: forExport ? 40 : 16,
        renderMode: $("renderMode").value,
        labelMode: $("labelMode").value,
        showGrid: shouldShowGridLines(),
        showCoords: getCoordGuideStep() > 0,
        coordGuideStep: getCoordGuideStep(),
        gridLineColor: getGridLineColor(),
        gridLineWidth: getGridLineWidth(),
        coordGuideLineColor: getCoordGuideLineColor(),
        coordGuideLineWidth: getCoordGuideLineWidth(),
        suppressTextLabels: false
      };
    }
    function getPreviewRenderOptions() {
      const options = getPatternRenderOptions(false);
      // 预览页要求图纸左右直接贴合手机两侧，因此预览画布不再保留左右留白边距；导出仍保留原有边距。
      options.margin = 0;
      const hasZoomedIn = previewZoom > initialPreviewZoom + 0.001;
      // 预览默认自动适配时先不画编号/符号，避免缩小后的文字糊成一片；
      // 一旦用户主动放大预览，就恢复当前“颜色编号 / 符号 / 不显示文字”的显示设置。
      // 对于大尺寸图纸，基础 cell 可能只有 7px，因此这里放宽文字绘制阈值，
      // 让放大后的 CSS 画布也能看到编号/符号。
      options.suppressTextLabels = !hasZoomedIn;
      options.textLabelMinCell = hasZoomedIn ? 1 : 12;
      options.coordLabelMinCell = hasZoomedIn ? 1 : 12;
      options.compactTextLabels = hasZoomedIn;
      return options;
    }
    function luminance(hex) {
      if (hex === "transparent") return 255;
      const [r, g, b] = hexToRgb(hex);
      return 0.299 * r + 0.587 * g + 0.114 * b;
    }
    function drawPatternToCanvas(canvas, ctx, patternData, options) {
      const { width, height, palette, pixels } = patternData;
      const { cell, margin, renderMode, labelMode, showGrid, showCoords } = options;
      const outputScale = Math.max(0.05, Number(options.outputScale || 1));
      const w = width * cell + margin * 2;
      const h = height * cell + margin * 2;
      canvas.dataset.baseWidth = String(w);
      canvas.dataset.baseHeight = String(h);
      canvas.dataset.outputScale = String(outputScale);
      canvas.width = Math.max(1, Math.round(w * outputScale));
      canvas.height = Math.max(1, Math.round(h * outputScale));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      if (!options.transparentBackground) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = pixels[y][x];
          const color = palette[index];
          const px = margin + x * cell;
          const py = margin + y * cell;
          if (!index || !color || color === "transparent") {
            if (!options.transparentBackground) {
              ctx.fillStyle = "rgba(0,0,0,.025)";
              ctx.fillRect(px, py, cell, cell);
            }
            continue;
          }
          if (renderMode === "squares") {
            ctx.fillStyle = color;
            ctx.fillRect(px, py, cell, cell);
          } else {
            const cx = px + cell / 2;
            const cy = py + cell / 2;
            const radius = Math.max(2, cell * 0.42);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,.14)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          const textLabelMinCell = options.textLabelMinCell === undefined ? 12 : options.textLabelMinCell;
          if (!options.suppressTextLabels && labelMode !== "none" && cell >= textLabelMinCell) {
            const normalFontSize = Math.max(8, Math.floor(cell * .33));
            const compactFontSize = clamp(Math.floor(cell * .56), 4, Math.max(4, cell - 2));
            ctx.fillStyle = luminance(color) < 135 ? "#ffffff" : "#202020";
            ctx.font = `700 ${options.compactTextLabels ? compactFontSize : normalFontSize}px Microsoft YaHei, Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const text = labelMode === "symbol" ? (SYMBOLS[(index - 1) % SYMBOLS.length] || String(index)) : String(index);
            ctx.fillText(text, px + cell / 2, py + cell / 2 + .5);
          }
        }
      }

      if (showGrid) {
        drawCanvasGridLines(ctx, width, height, cell, margin, options.gridLineColor || getGridLineColor(), options.gridLineWidth || getGridLineWidth(), 1, false);
      }
      if (showCoords) {
        const coordStep = options.coordGuideStep || 5;
        // 辅助坐标线必须在图案和普通网格线之后绘制，否则会被色块覆盖。
        drawCanvasGridLines(ctx, width, height, cell, margin, options.coordGuideLineColor || getCoordGuideLineColor(), options.coordGuideLineWidth || getCoordGuideLineWidth(), coordStep, true);
      }

      const coordLabelMinCell = options.coordLabelMinCell === undefined ? 12 : options.coordLabelMinCell;
      if (!options.suppressTextLabels && showCoords && cell >= coordLabelMinCell) {
        const coordStep = options.coordGuideStep || 5;
        ctx.fillStyle = "#61758a";
        ctx.font = `${options.compactTextLabels ? Math.max(6, Math.floor(cell * .7)) : 11}px Microsoft YaHei, Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let x = 0; x < width; x += coordStep) ctx.fillText(String(x + 1), margin + x * cell + cell / 2, margin - 10);
        ctx.textAlign = "right";
        for (let y = 0; y < height; y += coordStep) ctx.fillText(String(y + 1), margin - 8, margin + y * cell + cell / 2);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    function updatePatternInfo() {
      if (!lastPatternData) return;
      const total = countTotalBeads();
      const zoomText = previewZoom && Math.abs(previewZoom - 1) > 0.01 ? `，预览 ${Math.round(previewZoom * 100)}%` : "";
      const patternInfoEl = $("patternInfo");
      if (patternInfoEl) patternInfoEl.textContent = `${lastPatternData.width} × ${lastPatternData.height}，${total} 颗${zoomText}`;
    }
    function applyPreviewZoom() {
      const zoom = clamp(previewZoom, MIN_PREVIEW_ZOOM, MAX_PREVIEW_ZOOM);
      previewZoom = zoom;
      const baseW = getCanvasBaseWidth(patternCanvas);
      const baseH = getCanvasBaseHeight(patternCanvas);
      const displayW = Math.max(1, baseW * zoom);
      const displayH = Math.max(1, baseH * zoom);
      patternCanvas.style.width = `${displayW}px`;
      patternCanvas.style.height = `${displayH}px`;
      patternCanvas.style.background = showOriginalBase ? "transparent" : "#fff";
      patternReferenceCanvas.style.width = `${displayW}px`;
      patternReferenceCanvas.style.height = `${displayH}px`;
      patternStage.style.width = `${displayW}px`;
      patternStage.style.height = `${displayH}px`;
      patternOverlay.style.width = `${displayW}px`;
      patternOverlay.style.height = `${displayH}px`;
      patternOverlay.style.opacity = "0";
      patternOverlay.style.backgroundImage = "none";
      syncPatternStageCentering();
    }
    function legacyLockPreviewButtonFrameToDefaultSize() {
      if (!patternWrap || !patternCanvas) return;
      const displayH = Math.max(1, getCanvasBaseHeight(patternCanvas) * previewZoom);
      const maxFrameH = Math.max(220, Math.round(window.innerHeight * 0.72));
      const fixedH = Math.max(180, Math.min(Math.ceil(displayH), maxFrameH));
      patternWrap.style.setProperty("--preview-fixed-frame-height", `${fixedH}px`);
    }
    function getOriginalPreviewDisplaySize() {
      const rect = patternWrap.getBoundingClientRect();
      const availableW = Math.max(180, Math.round((rect.width || patternWrap.clientWidth || 320) - 24));
      const availableH = Math.max(180, Math.round((rect.height || patternWrap.clientHeight || 360) - 24));
      return { width: availableW, height: availableH };
    }
    function getPatternWrapViewportSize() {
      if (!patternWrap) return { width: 320, height: 360 };
      const styles = window.getComputedStyle(patternWrap);
      const padX = (parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
      const padY = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
      const width = Math.max(180, Math.round((patternWrap.clientWidth || 320) - padX));
      const height = Math.max(180, Math.round((patternWrap.clientHeight || 360) - padY));
      return { width, height };
    }
    function getPatternContentOffset() {
      return {
        left: (patternStage ? patternStage.offsetLeft : 0) + (patternCanvas ? patternCanvas.offsetLeft : 0),
        top: (patternStage ? patternStage.offsetTop : 0) + (patternCanvas ? patternCanvas.offsetTop : 0)
      };
    }
    function syncPatternStageCentering() {
      if (!patternWrap || !patternStage) return;
      const displayH = Math.max(1, parseFloat(patternStage.style.height || "0") || getCanvasBaseHeight(patternCanvas) * previewZoom);
      const spareH = Math.max(0, (patternWrap.clientHeight || 0) - displayH);
      const verticalGap = Math.floor(spareH / 2);

      // CSS 里有若干处使用了 margin: 0 auto !important。
      // 普通的 inline marginTop 会被它压住，导致手机端看起来永远贴着顶部。
      // 这里必须用 setProperty(..., "important") 强制接管居中间距。
      const bottomGap = Math.max(0, spareH - verticalGap);
      patternStage.style.setProperty("--pattern-stage-margin-top", `${verticalGap}px`);
      patternStage.style.setProperty("--pattern-stage-margin-bottom", `${bottomGap}px`);
      patternStage.style.setProperty("margin-left", "auto", "important");
      patternStage.style.setProperty("margin-right", "auto", "important");
      patternStage.style.setProperty("margin-top", `${verticalGap}px`, "important");
      patternStage.style.setProperty("margin-bottom", `${bottomGap}px`, "important");
    }
    function centerPreviewScroll() {
      if (!patternWrap || !patternCanvas) return;
      syncPatternStageCentering();
      const contentOffset = getPatternContentOffset();
      const scaledW = Math.max(1, getCanvasBaseWidth(patternCanvas) * previewZoom);
      const scaledH = Math.max(1, getCanvasBaseHeight(patternCanvas) * previewZoom);
      patternWrap.scrollLeft = Math.max(0, contentOffset.left + scaledW / 2 - (patternWrap.clientWidth || 0) / 2);
      patternWrap.scrollTop = Math.max(0, contentOffset.top + scaledH / 2 - (patternWrap.clientHeight || 0) / 2);
    }
    function legacyFitPreviewZoomToOriginalSize() {
      if (!lastPatternData || !sourceImage) return;
      const viewportSize = getPatternWrapViewportSize();
      const renderOptions = getPreviewRenderOptions();
      const baseW = Math.max(1, lastPatternData.width * renderOptions.cell + renderOptions.margin * 2);
      const baseH = Math.max(1, lastPatternData.height * renderOptions.cell + renderOptions.margin * 2);

      // 初始预览按“整张图纸画布”适配宽度，而不是只按豆格主体适配。
      // 这样无论横向豆数是多少，刚打开时都会贴合当前页面可视宽度，
      // 不会一进来就出现横向超出和底部横向滚动条。
      previewZoom = clamp(
        viewportSize.width / baseW,
        MIN_PREVIEW_ZOOM,
        MAX_PREVIEW_ZOOM
      );
      initialPreviewZoom = previewZoom;
      drawPreviewPattern();
      legacyLockPreviewButtonFrameToDefaultSize();
      requestAnimationFrame(() => {
        const contentOffset = getPatternContentOffset();
        const scaledW = baseW * previewZoom;
        const scaledH = baseH * previewZoom;
        patternWrap.scrollLeft = 0;
        patternWrap.scrollTop = 0;

        // 如果缩放后画布比容器更窄，则保持居中；如果更高，则从顶部开始显示。
        if (scaledW < patternWrap.clientWidth) {
          patternWrap.scrollLeft = Math.max(0, contentOffset.left - (patternWrap.clientWidth - scaledW) / 2);
        }
        if (scaledH < patternWrap.clientHeight) {
          patternWrap.scrollTop = Math.max(0, contentOffset.top - (patternWrap.clientHeight - scaledH) / 2);
        }
      });
      updatePatternInfo();
    }
    function drawPreviewPattern() {
      if (!lastPatternData) return;
      const options = getPreviewRenderOptions();
      const baseW = lastPatternData.width * options.cell + options.margin * 2;
      const baseH = lastPatternData.height * options.cell + options.margin * 2;
      options.outputScale = getCanvasOutputScale(baseW, baseH, previewZoom, MAX_PREVIEW_BACKING_PIXELS);
      options.transparentBackground = showOriginalBase && !isOriginalCompareActive;
      drawPatternToCanvas(patternCanvas, patternCtx, lastPatternData, options);
      applyPreviewZoom();
      drawPreviewReferenceCanvas();
      updatePreviewReferenceLayer();
      updatePatternInfo();
      updateOperationCursorOverlay();
    }
    function schedulePreviewRedraw(anchor = null, delay = 90) {
      clearTimeout(previewRedrawTimer);
      previewRedrawTimer = setTimeout(() => {
        drawPreviewPattern();
        if (anchor) {
          requestAnimationFrame(() => {
            const contentOffset = getPatternContentOffset();
            patternWrap.scrollLeft = Math.max(0, contentOffset.left + anchor.xInCanvas * previewZoom - anchor.xInWrap);
            patternWrap.scrollTop = Math.max(0, contentOffset.top + anchor.yInCanvas * previewZoom - anchor.yInWrap);
          });
        }
      }, delay);
    }
    function setPreviewZoom(value, evt = null) {
      if (!lastPatternData) return;
      const oldZoom = previewZoom;
      const newZoom = clamp(value, MIN_PREVIEW_ZOOM, MAX_PREVIEW_ZOOM);
      if (Math.abs(newZoom - oldZoom) < 0.001) return;

      let anchor = null;
      if (evt && evt.zoomAnchor) {
        anchor = {
          xInCanvas: evt.zoomAnchor.xInContent,
          yInCanvas: evt.zoomAnchor.yInContent,
          xInWrap: evt.zoomAnchor.xInWrap,
          yInWrap: evt.zoomAnchor.yInWrap
        };
      } else if (evt) {
        const rect = patternCanvas.getBoundingClientRect();
        const wrapRect = patternWrap.getBoundingClientRect();
        anchor = {
          xInCanvas: (evt.clientX - rect.left) / Math.max(oldZoom, 0.001),
          yInCanvas: (evt.clientY - rect.top) / Math.max(oldZoom, 0.001),
          xInWrap: evt.clientX - wrapRect.left,
          yInWrap: evt.clientY - wrapRect.top
        };
      }

      previewZoom = newZoom;
      userAdjustedZoom = true;
      applyPreviewZoom();
      updateOperationCursorOverlay();
      if (anchor) {
        requestAnimationFrame(() => {
          const contentOffset = getPatternContentOffset();
          patternWrap.scrollLeft = Math.max(0, contentOffset.left + anchor.xInCanvas * newZoom - anchor.xInWrap);
          patternWrap.scrollTop = Math.max(0, contentOffset.top + anchor.yInCanvas * newZoom - anchor.yInWrap);
        });
      }
      updatePatternInfo();
      schedulePreviewRedraw(anchor);
    }
    function drawOriginalImage(img) {
      const max = 720;
      const ratio = Math.min(1, max / img.width, max / img.height);
      originalCanvas.width = Math.round(img.width * ratio);
      originalCanvas.height = Math.round(img.height * ratio);
      originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
      originalCtx.imageSmoothingEnabled = true;
      originalCtx.drawImage(img, 0, 0, originalCanvas.width, originalCanvas.height);
      $("originalInfo").textContent = `${img.width} × ${img.height}`;
    }

    function updateOpacityControlsUI() {
      const panels = [$("previewOpacityPanel"), $("editorOpacityPanel")];
      const patternRanges = [$("previewPatternOpacityRange"), $("patternOpacityRange")];
      const patternValues = [$("previewPatternOpacityValue"), $("patternOpacityValue")];
      const inlineOpacity = $("patternOpacityInline");
      const inlineBaseToggle = $("showOriginalBaseInline");
      panels.forEach(panel => { if (panel) panel.classList.toggle("show", !!showOriginalBase); });
      if (inlineOpacity) inlineOpacity.classList.toggle("show", !!showOriginalBase);
      if (inlineBaseToggle) inlineBaseToggle.checked = !!showOriginalBase;
      patternRanges.forEach(range => { if (range) range.value = String(patternTransparency); });
      patternValues.forEach(value => { if (value) value.textContent = String(patternTransparency); });
    }

    function getBaseCanvasOpacity() {
      return 1;
    }

    function getPatternCanvasOpacity() {
      return clamp(1 - patternTransparency / 100, 0, 1);
    }

    function drawPreviewReferenceCanvas() {
      if (!lastPatternData || !sourceImage) {
        patternReferenceCanvas.width = 1;
        patternReferenceCanvas.height = 1;
        patternReferenceCanvas.style.width = "1px";
        patternReferenceCanvas.style.height = "1px";
        return;
      }
      const opt = getPreviewRenderOptions();
      const outputScale = Math.max(0.05, parseFloat(patternCanvas.dataset.outputScale || "1") || 1);
      const baseW = getCanvasBaseWidth(patternCanvas);
      const baseH = getCanvasBaseHeight(patternCanvas);
      patternReferenceCanvas.dataset.baseWidth = String(baseW);
      patternReferenceCanvas.dataset.baseHeight = String(baseH);
      patternReferenceCanvas.dataset.outputScale = String(outputScale);
      patternReferenceCanvas.width = patternCanvas.width;
      patternReferenceCanvas.height = patternCanvas.height;
      patternReferenceCtx.setTransform(1, 0, 0, 1, 0, 0);
      patternReferenceCtx.clearRect(0, 0, patternReferenceCanvas.width, patternReferenceCanvas.height);
      patternReferenceCtx.imageSmoothingEnabled = true;
      patternReferenceCtx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      patternReferenceCtx.fillStyle = "#ffffff";
      patternReferenceCtx.fillRect(0, 0, baseW, baseH);
      patternReferenceCtx.drawImage(
        sourceImage,
        opt.margin,
        opt.margin,
        lastPatternData.width * opt.cell,
        lastPatternData.height * opt.cell
      );
      patternReferenceCtx.strokeStyle = "rgba(88, 123, 157, .28)";
      patternReferenceCtx.lineWidth = 1;
      patternReferenceCtx.strokeRect(opt.margin + 0.5, opt.margin + 0.5, lastPatternData.width * opt.cell - 1, lastPatternData.height * opt.cell - 1);
      patternReferenceCtx.setTransform(1, 0, 0, 1, 0, 0);
      patternReferenceCanvas.style.width = patternCanvas.style.width;
      patternReferenceCanvas.style.height = patternCanvas.style.height;
    }

    function updatePreviewReferenceLayer() {
      const compareBtn = $("previewCompareOriginalBtn");
      const baseBtn = $("previewToggleOriginalBaseBtn");
      updateOpacityControlsUI();
      if (!lastPatternData || !sourceImage) {
        patternReferenceCanvas.style.display = "none";
        patternReferenceCanvas.style.opacity = "0";
        patternCanvas.style.visibility = "visible";
        patternOverlay.style.visibility = "visible";
        patternCanvas.style.opacity = "1";
        patternCanvas.style.background = "#fff";
        if (compareBtn) compareBtn.classList.remove("active");
        if (baseBtn) baseBtn.classList.remove("active");
        return;
      }
      if (isOriginalCompareActive) {
        patternReferenceCanvas.style.display = "block";
        patternReferenceCanvas.style.opacity = "1";
        patternCanvas.style.visibility = "hidden";
        patternOverlay.style.visibility = "hidden";
        if (compareBtn) compareBtn.classList.add("active");
        if (baseBtn) baseBtn.classList.toggle("active", showOriginalBase);
        return;
      }
      patternCanvas.style.visibility = "visible";
      patternOverlay.style.visibility = "visible";
      patternCanvas.style.opacity = String(getPatternCanvasOpacity());
      patternCanvas.style.background = showOriginalBase ? "transparent" : "#fff";
      if (compareBtn) compareBtn.classList.remove("active");
      if (showOriginalBase) {
        patternReferenceCanvas.style.display = "block";
        patternReferenceCanvas.style.opacity = String(getBaseCanvasOpacity());
      } else {
        patternReferenceCanvas.style.display = "none";
        patternReferenceCanvas.style.opacity = "0";
        patternCanvas.style.opacity = "1";
      }
      if (baseBtn) baseBtn.classList.toggle("active", showOriginalBase);
    }

    function drawEditorReferenceCanvas() {
      if (!lastPatternData || !sourceImage) {
        editorReferenceCanvas.width = 1;
        editorReferenceCanvas.height = 1;
        editorReferenceCanvas.style.width = "1px";
        editorReferenceCanvas.style.height = "1px";
        return;
      }
      const opt = getEditorRenderOptions();
      const outputScale = Math.max(0.05, parseFloat(editorCanvas.dataset.outputScale || "1") || 1);
      const baseW = getCanvasBaseWidth(editorCanvas);
      const baseH = getCanvasBaseHeight(editorCanvas);
      editorReferenceCanvas.dataset.baseWidth = String(baseW);
      editorReferenceCanvas.dataset.baseHeight = String(baseH);
      editorReferenceCanvas.dataset.outputScale = String(outputScale);
      editorReferenceCanvas.width = editorCanvas.width;
      editorReferenceCanvas.height = editorCanvas.height;
      editorReferenceCtx.setTransform(1, 0, 0, 1, 0, 0);
      editorReferenceCtx.clearRect(0, 0, editorReferenceCanvas.width, editorReferenceCanvas.height);
      editorReferenceCtx.imageSmoothingEnabled = true;
      editorReferenceCtx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      editorReferenceCtx.fillStyle = "#ffffff";
      editorReferenceCtx.fillRect(0, 0, baseW, baseH);
      editorReferenceCtx.drawImage(
        sourceImage,
        opt.margin,
        opt.margin,
        lastPatternData.width * opt.cell,
        lastPatternData.height * opt.cell
      );
      editorReferenceCtx.strokeStyle = "rgba(88, 123, 157, .28)";
      editorReferenceCtx.lineWidth = 1;
      editorReferenceCtx.strokeRect(opt.margin + 0.5, opt.margin + 0.5, lastPatternData.width * opt.cell - 1, lastPatternData.height * opt.cell - 1);
      editorReferenceCtx.setTransform(1, 0, 0, 1, 0, 0);
      editorReferenceCanvas.style.width = `${baseW}px`;
      editorReferenceCanvas.style.height = `${baseH}px`;
    }

    function updateEditorReferenceLayer() {
      // 独立编辑画布已移除，原图对比/打底统一由预览画布处理。
      if (editorCanvas === patternCanvas) return;
      const compareBtn = $("compareOriginalBtn");
      const baseBtn = $("toggleOriginalBaseBtn");
      updateOpacityControlsUI();
      if (!lastPatternData || !sourceImage) {
        editorReferenceCanvas.style.display = "none";
        editorReferenceCanvas.style.opacity = "0";
        editorCanvas.style.visibility = "visible";
        editorOverlay.style.visibility = "visible";
        editorCanvas.style.opacity = "1";
        editorCanvas.style.background = "#fff";
        if (compareBtn) compareBtn.classList.remove("active");
        if (baseBtn) baseBtn.classList.remove("active");
        return;
      }
      if (isOriginalCompareActive) {
        editorReferenceCanvas.style.display = "block";
        editorReferenceCanvas.style.opacity = "1";
        editorCanvas.style.visibility = "hidden";
        editorOverlay.style.visibility = "hidden";
        if (compareBtn) compareBtn.classList.add("active");
        if (baseBtn) baseBtn.classList.toggle("active", showOriginalBase);
        return;
      }
      editorCanvas.style.visibility = "visible";
      editorOverlay.style.visibility = "visible";
      editorCanvas.style.opacity = String(getPatternCanvasOpacity());
      if (compareBtn) compareBtn.classList.remove("active");
      if (showOriginalBase) {
        editorReferenceCanvas.style.display = "block";
        editorReferenceCanvas.style.opacity = String(getBaseCanvasOpacity());
      } else {
        editorReferenceCanvas.style.display = "none";
        editorReferenceCanvas.style.opacity = "0";
        editorCanvas.style.opacity = "1";
      }
      if (baseBtn) baseBtn.classList.toggle("active", showOriginalBase);
    }

    function setOriginalCompareActive(active) {
      isOriginalCompareActive = !!active;
      updatePreviewReferenceLayer();
      updateEditorReferenceLayer();
    }

    function toggleOriginalBase() {
      if (!lastPatternData || !sourceImage) return;
      showOriginalBase = !showOriginalBase;
      if (showOriginalBase) patternTransparency = 15;
      drawPreviewPattern();
      if (previewEditModeActive) drawPreviewPattern();
      updatePreviewReferenceLayer();
      updateEditorReferenceLayer();
    }

    function generatePattern(options = {}) {
      if (!sourceImage) { showToast("请先选择图片", true); return false; }
      const opts = typeof options === "string" ? { reason: options } : (options || {});
      if (!opts.skipInvalidatingConfirm && !confirmInvalidatingAdjustments(opts.reason || "重新生成图纸")) return false;
      const targetW = parseInt($("beadWidth").value, 10);
      const targetH = Math.max(1, Math.round(sourceImage.height * targetW / sourceImage.width));
      const temp = document.createElement("canvas");
      const tempCtx = temp.getContext("2d", { willReadFrequently: true });
      temp.width = targetW;
      temp.height = targetH;
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.clearRect(0, 0, targetW, targetH);
      tempCtx.drawImage(sourceImage, 0, 0, targetW, targetH);
      const alphaThreshold = ALPHA_THRESHOLD;
      const base = tempCtx.getImageData(0, 0, targetW, targetH);
      const styled = applyToneAdjustments(base, getStyleSettings(), alphaThreshold);
      const adjusted = applyToneAdjustments(styled, getToneSettings(), alphaThreshold);
      lastPatternData = processImageToPattern(
        adjusted,
        $("paletteMode").value,
        parseInt($("customColors").value, 10),
        $("ditherMode").value,
        alphaThreshold
      );
      lastPatternData.meta.stylePreset = activeStylePreset;
      lastPatternData.meta.styleAdjustments = getStyleSettings();
      lastPatternData.meta.toneAdjustments = getToneSettings();
      undoStack = [];
      redoStack = [];
      hasPendingPatternEdits = false;
      selectedPaletteIndex = null;
      selectedSeed = null;
      fillEmptyModeActive = false;
      operationControlsActive = false;
      activeTool = "paint";
      previewEditModeActive = false;
      previewZoom = 1;
      initialPreviewZoom = 1;
      clearTimeout(previewRedrawTimer);
      exportPreviewZoom = 1;
      useBeadColorCodes = true;
      beadColorCodeCache.clear();
      updateBeadCodeButton();
      userAdjustedZoom = false;
      rememberSafeInvalidatingControlValues();
      setButtonsEnabled(true);
      setTool("paint");
      setPreviewEditMode(false);
      updateFillEmptyModeUI();
      updateOperationControlsUI();
      let renderOk = true;
      try {
        refreshAllViews();
        fitPreviewZoomToOriginalSize();
        if (previewEditModeActive) updatePreviewEditModeUI();
      } catch (err) {
        renderOk = false;
        console.error("刷新图纸视图时出错：", err);
        // 这里不再弹出红色错误提示，避免正常生成后被误导性的兜底提示打断。
        // 真实错误仍会保留在控制台，方便后续调试。
      }
      if (renderOk) showToast("图纸已生成");
      return true;
    }

    function getEditorRenderOptions() {
      return getPreviewRenderOptions();
    }

    function drawEditor() {
      // 独立编辑画布已删除，预览画布会在 refreshAllViews / drawPreviewPattern 中刷新。
      drawPreviewPattern();
    }
    function computeFitZoom() { return 16; }
    function setEditorZoom(value, markManual = true) {
      setPreviewZoom(previewZoom, null);
    }
    function autoFitZoom() { fitPreviewZoomToOriginalSize(); }

    function renderPaletteBox(container) {
      if (!container) return;
      container.innerHTML = "";
      if (!lastPatternData) return;
      const allEntries = getUsedPaletteEntries().sort((a, b) => b.count - a.count || a.index - b.index);
      let entries = allEntries;
      if (allEntries.length > MAX_EDITOR_COLOR_UI_OPTIONS) {
        entries = allEntries.slice(0, MAX_EDITOR_COLOR_UI_OPTIONS);
        if (selectedPaletteIndex !== null && !entries.some(e => e.index === selectedPaletteIndex)) {
          const selectedEntry = allEntries.find(e => e.index === selectedPaletteIndex);
          if (selectedEntry) entries.push(selectedEntry);
        }
      }
      entries.forEach(entry => {
        const swatch = document.createElement("div");
        swatch.className = "swatch" + (entry.index === selectedPaletteIndex ? " selected" : "");
        swatch.title = `${entry.index}: ${entry.color}，${entry.count} 颗`;
        swatch.style.background = entry.color;
        const idx = document.createElement("span");
        idx.className = "idx";
        idx.textContent = entry.index;
        swatch.appendChild(idx);
        swatch.addEventListener("click", () => { selectPaletteIndex(entry.index); setTool("paint"); });
        container.appendChild(swatch);
      });
      if (allEntries.length > MAX_EDITOR_COLOR_UI_OPTIONS) {
        const note = document.createElement("div");
        note.className = "status-line";
        note.style.width = "100%";
        note.textContent = `颜色较多，编辑面板仅显示用量最多的 ${MAX_EDITOR_COLOR_UI_OPTIONS} 种；其他颜色可用取色工具直接从图纸上选中。`;
        container.appendChild(note);
      }
    }
    function renderPalettes() {
      renderPaletteBox($("editorPaletteBox"));
      updateEditableColorSelectors();
    }
    function buildWebSafePalette() {
      const values = [0, 51, 102, 153, 204, 255];
      const colors = [];
      for (const r of values) for (const g of values) for (const b of values) colors.push(rgbToHex(r, g, b).toLowerCase());
      return colors;
    }
    function getCurrentPaletteMode() {
      return lastPatternData?.meta?.paletteMode || $("paletteMode").value;
    }
    function getEditableColorOptions() {
      let colors = [];
      if (lastPatternData) {
        // 编辑模式永远优先使用当前图纸真实调色板，不再被“颜色模式”限制。
        colors = lastPatternData.palette.filter(color => color && color !== "transparent");
      }
      [
        selectedColor,
        "#000000",
        $("editColor")?.value,
        $("replaceColor")?.value,
        $("outlineColor")?.value,
        $("editColorPicker")?.value,
        $("replaceColorPicker")?.value,
        $("outlineColorPicker")?.value
      ].forEach(color => {
        color = normalizeColor(color);
        if (color && color !== "transparent") colors.push(color);
      });
      if (!colors.length) colors = ["#000000", "#ffffff", "#ff004d"];

      const seen = new Set();
      let uniqueColors = colors
        .map(normalizeColor)
        .filter(color => color && color !== "transparent")
        .filter(color => {
          if (seen.has(color)) return false;
          seen.add(color);
          return true;
        });

      if (lastPatternData && uniqueColors.length > MAX_EDITOR_COLOR_UI_OPTIONS) {
        const counts = getMaterialCounts(lastPatternData);
        const mustKeep = [
          selectedColor,
          "#000000",
          selectedPaletteIndex !== null ? lastPatternData.palette[selectedPaletteIndex] : null,
          $("editColor")?.value,
          $("replaceColor")?.value,
          $("outlineColor")?.value,
          $("editColorPicker")?.value,
          $("replaceColorPicker")?.value,
          $("outlineColorPicker")?.value
        ].map(normalizeColor).filter(color => color && color !== "transparent");

        uniqueColors = uniqueColors
          .map(color => {
            const index = lastPatternData.palette.indexOf(color);
            return { color, index, count: index >= 0 ? counts[index] : 0 };
          })
          .sort((a, b) => b.count - a.count || a.index - b.index)
          .slice(0, MAX_EDITOR_COLOR_UI_OPTIONS)
          .map(item => item.color);

        mustKeep.forEach(color => {
          if (!uniqueColors.includes(color)) uniqueColors.push(color);
        });
      }
      return uniqueColors;
    }
    function getPaletteLabelForColor(color, fallbackIndex) {
      const index = lastPatternData ? lastPatternData.palette.indexOf(color) : -1;
      if (index > 0) return `编号 ${index} · ${color}`;
      return `颜色 ${fallbackIndex + 1} · ${color}`;
    }
    function addColorOptionIfMissing(select, color) {
      if (!select || !color || color === "transparent") return false;
      color = normalizeColor(color);
      const exists = [...select.options].some(option => normalizeColor(option.value) === color);
      if (exists) return false;
      const option = document.createElement("option");
      option.value = color;
      option.textContent = getPaletteLabelForColor(color, select.options.length);
      option.style.backgroundColor = color;
      option.style.color = luminance(color) < 145 ? "#ffffff" : "#243447";
      select.appendChild(option);
      return true;
    }
    function updateColorSelectPreview(id) {
      const select = $(id);
      const preview = $(`${id}Preview`);
      if (!select || !preview) return;
      const color = normalizeColor(select.value || "#000000");
      preview.style.background = color;
      preview.title = color;
      const picker = $(`${id}Picker`);
      if (picker && /^#[0-9a-f]{6}$/i.test(color)) picker.value = color;
      if (id === "editColor") updateEditMardColorBall(color);
    }
    function updateEditMardColorBall(color) {
      const ball = $("editColorPicker");
      if (!ball) return;
      const normalized = normalizeColor(color || selectedColor || "#000000");
      const bead = getNearestBeadColorCode(normalized);
      ball.value = normalized;
      ball.style.setProperty("--ball-color", bead.hex && bead.hex !== "transparent" ? bead.hex : normalized);
      ball.title = `Mard ${bead.code} · ${normalized}`;
      ball.innerHTML = `<span class="draw-ball-code">${bead.code || "-"}</span>`;
      updateMardPickerActive(normalized);
    }
    function renderMardColorPickerPanel() {
      const panel = $("mardColorPickerPanel");
      if (!panel || panel.dataset.rendered === "1") return;
      panel.innerHTML = "";
      for (const bead of MARD_BEAD_PALETTE) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "mard-color-bead";
        btn.dataset.hex = normalizeColor(bead.hex);
        btn.dataset.code = bead.code;
        btn.style.setProperty("--bead-color", bead.hex);
        btn.textContent = bead.code;
        btn.title = `${bead.code} · ${bead.hex}`;
        btn.addEventListener("click", evt => {
          evt.stopPropagation();
          applyMardDrawColor(bead.hex);
          setMardPickerOpen(false);
        });
        panel.appendChild(btn);
      }
      panel.dataset.rendered = "1";
      updateMardPickerActive(selectedColor);
    }
    function updateMardPickerActive(color) {
      const panel = $("mardColorPickerPanel");
      if (!panel || panel.dataset.rendered !== "1") return;
      const nearest = getNearestBeadColorCode(color || selectedColor || "#000000");
      panel.querySelectorAll(".mard-color-bead").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.code === nearest.code);
      });
    }
    function setMardPickerOpen(open) {
      const panel = $("mardColorPickerPanel");
      if (!panel) return;
      if (open) renderMardColorPickerPanel();
      panel.classList.toggle("open", !!open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    }
    function applyMardDrawColor(hex) {
      const color = normalizeColor(hex);
      selectedColor = color;
      if (lastPatternData) selectedPaletteIndex = ensureColorInPalette(selectedColor);
      setColorSelectValue("editColor", selectedColor);
      updateSelectedColorUI();
      renderPalettes();
      setTool("paint");
    }
    function syncColorSelect(id, colors, preferredColor) {
      const select = $(id);
      if (!select) return null;
      const preferred = normalizeColor(preferredColor || select.value || colors[0] || "#000000");
      const previous = normalizeColor(select.value || preferred);
      const merged = colors.slice();
      [preferred, previous].forEach(color => {
        color = normalizeColor(color);
        if (color && color !== "transparent" && !merged.includes(color)) merged.push(color);
      });
      const seen = new Set();
      const normalizedColors = merged
        .map(normalizeColor)
        .filter(color => color && color !== "transparent")
        .filter(color => {
          if (seen.has(color)) return false;
          seen.add(color);
          return true;
        });
      select.innerHTML = "";
      normalizedColors.forEach((color, i) => {
        const option = document.createElement("option");
        option.value = color;
        option.textContent = getPaletteLabelForColor(color, i);
        option.style.backgroundColor = color;
        option.style.color = luminance(color) < 145 ? "#ffffff" : "#243447";
        select.appendChild(option);
      });
      const value = normalizedColors.includes(preferred) ? preferred : (normalizedColors.includes(previous) ? previous : normalizedColors[0]);
      if (value) select.value = value;
      updateColorSelectPreview(id);
      return select.value;
    }
    function updateEditableColorSelectors() {
      const colors = getEditableColorOptions();
      if (!colors.length) return;
      const editPreferred = selectedColor || $("editColorPicker")?.value || colors[0];
      const editValue = syncColorSelect("editColor", colors, editPreferred);
      syncColorSelect("replaceColor", colors, $("replaceColor")?.value || $("replaceColorPicker")?.value || editValue || colors[0]);
      syncColorSelect("fillColor", colors, $("fillColor")?.value || $("fillColorPicker")?.value || editValue || colors[0]);
      syncColorSelect("outlineColor", colors, $("outlineColor")?.value || $("outlineColorPicker")?.value || "#000000");
      if (editValue) selectedColor = normalizeColor(editValue);
    }
    function setColorSelectValue(id, color) {
      const select = $(id);
      if (!select || !color || color === "transparent") return false;
      color = normalizeColor(color);
      addColorOptionIfMissing(select, color);
      select.value = color;
      updateColorSelectPreview(id);
      return true;
    }
    function selectPaletteIndex(index) {
      if (!lastPatternData) return;
      selectedPaletteIndex = index;
      const color = lastPatternData.palette[index] || "transparent";
      if (color !== "transparent") { selectedColor = normalizeColor(color); setColorSelectValue("editColor", selectedColor); }
      updateSelectedColorUI();
      renderPalettes();
    }
    function updateSelectedColorUI() {
      const color = selectedPaletteIndex === null || !lastPatternData ? selectedColor : lastPatternData.palette[selectedPaletteIndex];
      $("selectedColorText").textContent = color || selectedColor;
      $("pickedIndexText").textContent = selectedPaletteIndex === null ? "未选择" : `编号 ${selectedPaletteIndex}`;
      $("pickedSeedText").textContent = selectedSeed ? `${selectedSeed.x + 1}, ${selectedSeed.y + 1}` : "未记录";
      if (color && color !== "transparent") setColorSelectValue("editColor", color);
    }
    function updateMaterialsTable() {
      const wrap = $("materialsTableWrap");
      if (!lastPatternData) { wrap.innerHTML = ""; updateBeadCodeButton(); return; }
      const entries = getUsedPaletteEntries().sort((a, b) => b.count - a.count);
      const total = entries.reduce((sum, e) => sum + e.count, 0);
      let html = `<table class="materials-table"><thead><tr><th>图纸编号</th><th>${getMaterialColorTitle()}</th><th>符号</th><th>数量</th><th>建议准备</th></tr></thead><tbody>`;
      for (const e of entries) {
        const extra = Math.ceil(e.count * 1.08);
        const numberLabel = getMaterialNumberLabel(e);
        const colorCode = getMaterialColorCode(e);
        html += `<tr><td>${numberLabel}</td><td><span class="color-chip" style="background:${e.color}"></span><span class="mono">${colorCode}</span></td><td>${e.symbol}</td><td>${e.count}</td><td>${extra}</td></tr>`;
      }
      html += `</tbody><tfoot><tr><th colspan="3">总计</th><th>${total}</th><th>${Math.ceil(total * 1.08)}</th></tr></tfoot></table>`;
      wrap.innerHTML = html;
      updateBeadCodeButton();
    }

    function getExportLayout(patternData = lastPatternData) {
      if (!patternData) return { w: 1, h: 1 };
      const opt = getPatternRenderOptions(true);
      const entries = getUsedPaletteEntries(patternData).sort((a, b) => a.index - b.index);
      const gridW = patternData.width * opt.cell;
      const gridH = patternData.height * opt.cell;
      const drawingW = gridW + opt.margin * 2;
      const drawingH = gridH + opt.margin * 2;
      const pagePad = 40;
      const headerH = 66;
      const materialGap = entries.length ? 30 : 0;
      const materialTitleH = entries.length ? 86 : 0;
      const itemW = 640;
      const itemH = 118;
      const itemGapY = 30;
      const minHeaderW = Math.ceil(EXPORT_SITE_LABEL.length * 21 + 320);
      const minContentW = Math.max(900, minHeaderW);
      const contentW = Math.max(drawingW, minContentW);
      const itemsPerRow = Math.max(1, Math.floor(contentW / itemW));
      const materialRows = entries.length ? Math.ceil(entries.length / itemsPerRow) : 0;
      const materialsH = entries.length ? materialTitleH + materialRows * itemH + Math.max(0, materialRows - 1) * itemGapY : 0;
      const drawingX = pagePad + (contentW - drawingW) / 2;
      const drawingY = pagePad + headerH;
      const materialX = pagePad;
      const materialY = drawingY + drawingH + materialGap;
      const w = contentW + pagePad * 2;
      const h = pagePad + headerH + drawingH + materialGap + materialsH + pagePad;
      return {
        opt, entries, pagePad, headerH, contentW, drawingW, drawingH,
        drawingX, drawingY, gridX: drawingX + opt.margin, gridY: drawingY + opt.margin,
        materialX, materialY, itemW, itemH, itemGapY, materialTitleH, itemsPerRow,
        w: Math.ceil(w), h: Math.ceil(h)
      };
    }
    function getExportSvgSize() {
      const layout = getExportLayout();
      return { w: layout.w, h: layout.h };
    }
    function ensureExportPreviewCanvas() {
      if (!exportSvgMount) return null;
      let canvas = exportSvgMount.querySelector("canvas");
      if (!canvas) {
        exportSvgMount.innerHTML = '<canvas id="exportPreviewCanvas" aria-label="导出图纸预览"></canvas>';
        canvas = exportSvgMount.querySelector("canvas");
      }
      return canvas;
    }
    function getExportPreviewCanvas() {
      return exportSvgMount ? exportSvgMount.querySelector("canvas") : null;
    }
    function clearExportPreview() {
      if (!exportSvgMount) return;
      exportSvgMount.innerHTML = '<div class="export-empty">生成图纸后，这里会显示导出效果预览。<br>预览使用 Canvas 缓存渲染，放大拖动更流畅。</div>';
      exportSvgMount.style.width = "";
      exportSvgMount.style.height = "";
      if ($("exportPreviewInfo")) $("exportPreviewInfo").textContent = "等待生成";
      updateBeadCodeButton();
    }
    function updateExportZoomLabel() {
      // 仅保留内部缩放逻辑供鼠标滚轮和触屏双指使用；界面不再显示缩放比例。
    }
    function getExportPreviewOutputScale(w, h) {
      const pixels = Math.max(1, w * h);
      const maxByPixels = Math.sqrt(MAX_EXPORT_PREVIEW_BACKING_PIXELS / pixels);
      return clamp(Math.min(1, maxByPixels), 0.16, 1);
    }
    function drawExportPreviewCanvas() {
      if (!lastPatternData || !exportSvgMount) return null;
      const canvas = ensureExportPreviewCanvas();
      if (!canvas) return null;
      const ctx = canvas.getContext("2d", { alpha: false });
      const layout = getExportLayout(lastPatternData);
      const opt = layout.opt;
      const { width, height, palette, pixels } = lastPatternData;
      const { w, h } = layout;
      const outputScale = getExportPreviewOutputScale(w, h);

      canvas.dataset.baseWidth = String(w);
      canvas.dataset.baseHeight = String(h);
      canvas.dataset.outputScale = String(outputScale);
      canvas.width = Math.max(1, Math.round(w * outputScale));
      canvas.height = Math.max(1, Math.round(h * outputScale));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.style.maxWidth = "none";
      canvas.style.maxHeight = "none";
      canvas.style.display = "block";
      canvas.style.borderRadius = "0";
      canvas.style.transformOrigin = "top left";
      canvas.style.willChange = "transform";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
      ctx.imageSmoothingEnabled = false;

      // 页头
      ctx.fillStyle = "#243447";
      ctx.font = "800 40px Arial, Microsoft YaHei, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(EXPORT_SITE_LABEL, layout.pagePad, 34);
      ctx.fillStyle = "#6f8092";
      ctx.font = "16px Arial, Microsoft YaHei, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${width} × ${height}｜${countTotalBeads()} 颗`, w - layout.pagePad, 34);

      // 图纸主体
      ctx.save();
      ctx.translate(layout.drawingX, layout.drawingY);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, layout.drawingW, layout.drawingH);
      ctx.strokeStyle = "rgba(88,123,157,.18)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, layout.drawingW - 1, layout.drawingH - 1);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = pixels[y][x];
          const color = palette[index];
          if (!index || !color || color === "transparent") continue;
          const px = opt.margin + x * opt.cell;
          const py = opt.margin + y * opt.cell;
          if (opt.renderMode === "squares") {
            ctx.fillStyle = color;
            ctx.fillRect(px, py, opt.cell, opt.cell);
          } else {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(px + opt.cell / 2, py + opt.cell / 2, opt.cell * .42, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,.16)";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          if (opt.labelMode !== "none" && opt.cell >= 12) {
            const text = opt.labelMode === "symbol" ? (SYMBOLS[(index - 1) % SYMBOLS.length] || String(index)) : String(index);
            ctx.fillStyle = luminance(color) < 135 ? "#ffffff" : "#202020";
            ctx.font = `700 ${Math.max(8, Math.floor(opt.cell * .33))}px Arial, Microsoft YaHei, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(text, px + opt.cell / 2, py + opt.cell / 2 + opt.cell * .08);
          }
        }
      }

      if (opt.showGrid) {
        drawCanvasGridLines(ctx, width, height, opt.cell, opt.margin, opt.gridLineColor || getGridLineColor(), opt.gridLineWidth || getGridLineWidth(), 1, false);
      }
      if (opt.showCoords) {
        const coordStep = opt.coordGuideStep || 5;
        drawCanvasGridLines(ctx, width, height, opt.cell, opt.margin, opt.coordGuideLineColor || getCoordGuideLineColor(), opt.coordGuideLineWidth || getCoordGuideLineWidth(), coordStep, true);
      }

      if (opt.showCoords) {
        const coordStep = opt.coordGuideStep || 5;
        ctx.fillStyle = "#61758a";
        ctx.font = "11px Arial, Microsoft YaHei, sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        for (let x = 0; x < width; x += coordStep) ctx.fillText(String(x + 1), opt.margin + x * opt.cell + opt.cell / 2, opt.margin - 10);
        ctx.textAlign = "right";
        for (let y = 0; y < height; y += coordStep) ctx.fillText(String(y + 1), opt.margin - 8, opt.margin + y * opt.cell + opt.cell / 2);
      }
      ctx.restore();

      // 材料清单
      if (layout.entries.length) {
        ctx.save();
        ctx.translate(layout.materialX, layout.materialY);
        ctx.fillStyle = "#243447";
        ctx.font = "800 32px Arial, Microsoft YaHei, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("材料清单", 0, 32);
        ctx.fillStyle = "#6f8092";
        ctx.font = "17px Arial, Microsoft YaHei, sans-serif";
        ctx.fillText(`图纸编号 / ${getMaterialColorTitle()} / 数量`, 150, 32);

        layout.entries.forEach((e, i) => {
          const col = i % layout.itemsPerRow;
          const row = Math.floor(i / layout.itemsPerRow);
          const x = col * layout.itemW;
          const y = layout.materialTitleH + row * (layout.itemH + layout.itemGapY);
          const textFill = luminance(e.color) < 135 ? "#ffffff" : "#202020";
          ctx.save();
          ctx.translate(x, y);
          ctx.fillStyle = e.color;
          ctx.strokeStyle = "rgba(0,0,0,.18)";
          ctx.lineWidth = 1;
          if (opt.renderMode === "squares") {
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(0, 6, 96, 96, 16);
              ctx.fill();
              ctx.stroke();
            } else {
              ctx.fillRect(0, 6, 96, 96);
              ctx.strokeRect(0.5, 6.5, 95, 95);
            }
          } else {
            ctx.beginPath();
            ctx.arc(48, 54, 45, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.fillStyle = textFill;
          ctx.font = "800 39px Arial, Microsoft YaHei, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(getMaterialNumberLabel(e), 48, 54);
          ctx.fillStyle = "#243447";
          ctx.font = "51px Arial, Microsoft YaHei, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText(`${getMaterialColorCode(e)} ×${e.count}`, 126, 54);
          ctx.restore();
        });
        ctx.restore();
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      return canvas;
    }
    function applyExportPreviewZoom() {
      if (!lastPatternData || !exportSvgMount) { updateExportZoomLabel(); return; }
      const canvas = getExportPreviewCanvas();
      if (!canvas) { updateExportZoomLabel(); return; }
      const { w, h } = getExportSvgSize();
      exportPreviewZoom = clamp(exportPreviewZoom, MIN_EXPORT_ZOOM, MAX_EXPORT_ZOOM);
      canvas.style.width = `${Math.max(1, w)}px`;
      canvas.style.height = `${Math.max(1, h)}px`;
      canvas.style.maxWidth = "none";
      canvas.style.maxHeight = "none";
      canvas.style.display = "block";
      canvas.style.borderRadius = "0";
      canvas.style.transformOrigin = "top left";
      canvas.style.transform = `scale(${exportPreviewZoom})`;
      exportSvgMount.style.width = `${Math.max(1, w * exportPreviewZoom)}px`;
      exportSvgMount.style.height = `${Math.max(1, h * exportPreviewZoom)}px`;
      updateExportZoomLabel();
    }
    function fitExportPreviewZoom() {
      if (!lastPatternData || !exportPreviewWrap) return;
      const { w, h } = getExportSvgSize();
      const availableW = Math.max(1, exportPreviewWrap.clientWidth - 28);
      const availableH = Math.max(1, exportPreviewWrap.clientHeight - 28);
      exportPreviewZoom = clamp(Math.min(availableW / w, availableH / h), MIN_EXPORT_ZOOM, MAX_EXPORT_ZOOM);
      applyExportPreviewZoom();
      requestAnimationFrame(() => {
        exportPreviewWrap.scrollLeft = 0;
        exportPreviewWrap.scrollTop = 0;
      });
    }
    function setExportPreviewZoom(value, evt = null) {
      if (!lastPatternData) return;
      const oldZoom = exportPreviewZoom || 1;
      const newZoom = clamp(value, MIN_EXPORT_ZOOM, MAX_EXPORT_ZOOM);
      if (Math.abs(newZoom - oldZoom) < 0.001) return;

      let anchor = null;
      const canvas = getExportPreviewCanvas();
      if (evt && evt.zoomAnchor) {
        anchor = {
          xInCanvas: evt.zoomAnchor.xInContent,
          yInCanvas: evt.zoomAnchor.yInContent,
          xInWrap: evt.zoomAnchor.xInWrap,
          yInWrap: evt.zoomAnchor.yInWrap
        };
      } else if (evt && canvas && exportPreviewWrap) {
        const rect = canvas.getBoundingClientRect();
        const wrapRect = exportPreviewWrap.getBoundingClientRect();
        anchor = {
          xInCanvas: (evt.clientX - rect.left) / Math.max(oldZoom, 0.001),
          yInCanvas: (evt.clientY - rect.top) / Math.max(oldZoom, 0.001),
          xInWrap: evt.clientX - wrapRect.left,
          yInWrap: evt.clientY - wrapRect.top
        };
      }

      exportPreviewZoom = newZoom;
      applyExportPreviewZoom();
      if (anchor && canvas) {
        requestAnimationFrame(() => {
          exportPreviewWrap.scrollLeft = Math.max(0, canvas.offsetLeft + anchor.xInCanvas * newZoom - anchor.xInWrap);
          exportPreviewWrap.scrollTop = Math.max(0, canvas.offsetTop + anchor.yInCanvas * newZoom - anchor.yInWrap);
        });
      }
    }
    function renderExportPreview(autoFit = false) {
      if (!lastPatternData || !exportSvgMount) { clearExportPreview(); return; }
      const canvas = drawExportPreviewCanvas();
      const { w, h } = getExportSvgSize();
      const total = countTotalBeads();
      if ($("exportPreviewInfo")) {
        const scale = canvas ? Number(canvas.dataset.outputScale || "1") : 1;
        const tip = scale < 0.999 ? `，预览缓存 ${Math.round(scale * 100)}%` : "";
        $("exportPreviewInfo").textContent = `${Math.round(w)} × ${Math.round(h)} px，${total} 颗${tip}`;
      }
      if (autoFit) fitExportPreviewZoom();
      else applyExportPreviewZoom();
    }
    function updateExportSection(autoFitPreview = false) {
      renderExportPreview(autoFitPreview);
      updateMaterialsTable();
    }
    function mirrorCurrentPattern() {
      if (!lastPatternData) return;
      pushHistory();
      lastPatternData.pixels = lastPatternData.pixels.map(row => row.slice().reverse());
      if (selectedSeed) selectedSeed = { x: lastPatternData.width - 1 - selectedSeed.x, y: selectedSeed.y };
      lastPatternData.meta = { ...(lastPatternData.meta || {}), mirroredAt: new Date().toISOString() };
      refreshAllViews();
      showToast("已镜像当前图案");
    }
    function updateStats() {
      if (!lastPatternData) return;
      const total = countTotalBeads();
      const entries = getUsedPaletteEntries();
      $("statSize").textContent = `${lastPatternData.width}×${lastPatternData.height}`;
      $("statColors").textContent = entries.length;
      $("statBeads").textContent = total;
      updatePatternInfo();
    }
    function refreshAllViews() {
      if (!lastPatternData) return;
      drawPreviewPattern();
      updateEditableColorSelectors();
      renderPalettes();
      updateSelectedColorUI();
      if ($("dataSection").classList.contains("active")) updateExportSection();
      updateStats();
      updateUndoRedoButtons();
      updatePreviewEditModeUI();
      updateOperationControlsUI();
    }
    function setButtonsEnabled(enabled) {
      ["openEditorBtn", "openExportPageBtn", "downloadPngBtn", "downloadSvgBtn", "downloadCsvBtn", "mirrorPatternBtn", "toggleBeadCodeBtn", "deleteColorBtn", "replaceColorBtn", "fillTransparentBtn", "undoBtn", "redoBtn", "previewUndoBtn", "previewRedoBtn", "compareOriginalBtn", "toggleOriginalBaseBtn", "previewCompareOriginalBtn", "previewToggleOriginalBaseBtn", "applyOutlineBtn", "previewEditModeBtn", "operationToggleBtn"].forEach(id => {
        const el = $(id); if (el) el.disabled = !enabled;
      });
      updateUndoRedoButtons();
      updatePreviewEditModeUI();
    }

    function getEditorCellFromEvent(evt) {
      if (!lastPatternData) return null;
      const rect = patternCanvas.getBoundingClientRect();
      const opt = getPreviewRenderOptions();
      const scaleX = patternCanvas.width / Math.max(1, rect.width);
      const scaleY = patternCanvas.height / Math.max(1, rect.height);
      const outputScale = Math.max(0.05, parseFloat(patternCanvas.dataset.outputScale || "1") || 1);
      const canvasX = (evt.clientX - rect.left) * scaleX / outputScale;
      const canvasY = (evt.clientY - rect.top) * scaleY / outputScale;
      const x = Math.floor((canvasX - opt.margin) / opt.cell);
      const y = Math.floor((canvasY - opt.margin) / opt.cell);
      if (x < 0 || y < 0 || x >= lastPatternData.width || y >= lastPatternData.height) return null;
      return { x, y };
    }
    function updateBrushSizeUI() {
      const sliderWrap = $("drawSizeSliderWrap");
      const slider = $("drawSizeSlider");
      const value = $("drawSizeValue");
      const paintBtn = $("toolPaint");
      const eraseBtn = $("toolErase");
      const pickBtn = $("toolPick");
      const colorBall = $("editColorPicker");
      const operationBtn = $("operationToggleBtn");
      if (!sliderWrap || !slider || !value) return;
      if (activeTool === "paint" || activeTool === "erase") {
        const size = activeTool === "erase" ? eraseBrushSize : paintBrushSize;
        sliderWrap.classList.remove("hidden");
        slider.value = String(size);
        value.textContent = `${size}×${size}`;
        if (paintBtn) paintBtn.style.order = "1";
        if (eraseBtn) eraseBtn.style.order = "3";
        if (pickBtn) pickBtn.style.order = "5";
        if (colorBall) colorBall.style.order = "6";
        if (operationBtn) operationBtn.style.order = "7";
        sliderWrap.style.order = activeTool === "paint" ? "2" : "4";
      } else {
        sliderWrap.classList.add("hidden");
        if (paintBtn) paintBtn.style.order = "1";
        if (eraseBtn) eraseBtn.style.order = "2";
        if (pickBtn) pickBtn.style.order = "3";
        if (colorBall) colorBall.style.order = "4";
        if (operationBtn) operationBtn.style.order = "5";
        sliderWrap.style.order = "6";
      }
    }
    function updateFillEmptyModeUI() {
      const btn = $("fillTransparentBtn");
      if (!btn) return;
      btn.classList.toggle("active", fillEmptyModeActive);
      btn.classList.toggle("secondary", !fillEmptyModeActive);
      btn.setAttribute("aria-pressed", fillEmptyModeActive ? "true" : "false");
      btn.textContent = fillEmptyModeActive ? "填充空豆中" : "填充空豆";
    }
    function setFillEmptyMode(active) {
      fillEmptyModeActive = !!active && !!lastPatternData;
      if (fillEmptyModeActive) {
        setPreviewEditMode(true);
        setTool("pick");
      }
      updateFillEmptyModeUI();
    }
    function setTool(tool) {
      activeTool = tool;
      [["toolPaint", "paint"], ["toolErase", "erase"], ["toolPick", "pick"]].forEach(([id, name]) => {
        $(id).classList.toggle("active", tool === name);
        $(id).classList.toggle("secondary", tool !== name);
      });
      if (tool !== "pick" && fillEmptyModeActive) setFillEmptyMode(false);
      updateBrushSizeUI();
      updateOperationCursorOverlay();
    }
    function paintCell(cell, index) {
      if (!lastPatternData || !cell) return false;
      if (lastPatternData.pixels[cell.y][cell.x] === index) return false;
      lastPatternData.pixels[cell.y][cell.x] = index;
      return true;
    }
    function getCurrentBrushSize() {
      return activeTool === "erase" ? eraseBrushSize : paintBrushSize;
    }
    function applyBrushStroke(cell, index, size = 1) {
      if (!lastPatternData || !cell) return false;
      const { width, height } = lastPatternData;
      const brushSize = Math.max(1, Math.min(12, parseInt(size, 10) || 1));
      const left = Math.floor((brushSize - 1) / 2);
      const right = brushSize - left - 1;
      let changed = false;
      for (let y = cell.y - left; y <= cell.y + right; y++) {
        if (y < 0 || y >= height) continue;
        for (let x = cell.x - left; x <= cell.x + right; x++) {
          if (x < 0 || x >= width) continue;
          if (paintCell({ x, y }, index)) changed = true;
        }
      }
      return changed;
    }
    function handleEditorCellAction(cell) {
      if (!cell || !lastPatternData) return;
      const size = activeTool === "pick" ? 1 : getCurrentBrushSize();
      const key = `${cell.x},${cell.y},${activeTool},${size}`;
      if (key === lastPaintKey && activeTool !== "pick") return;
      lastPaintKey = key;

      if (fillEmptyModeActive) {
        const fillColor = $("fillColor")?.value || $("fillColorPicker")?.value || selectedColor;
        const nextIndex = ensureColorInPalette(fillColor);
        fillTransparentRegionAt(cell, nextIndex);
        return;
      }

      if (activeTool === "pick") {
        const index = lastPatternData.pixels[cell.y][cell.x];
        selectedSeed = { x: cell.x, y: cell.y, index };
        selectPaletteIndex(index);
        showToast(index === 0 ? "已选择空豆" : `已选择颜色 ${index}`);
        return;
      }

      const nextIndex = activeTool === "erase" ? 0 : ensureColorInPalette(selectedColor);
      if (applyBrushStroke(cell, nextIndex, size)) {
        drawPreviewPattern();
        updateStats();
      }
    }
    function handleEditorAction(evt) {
      const cell = getEditorCellFromEvent(evt);
      handleEditorCellAction(cell);
    }
    function getConnectedRegion(seedX, seedY, targetIndex) {
      const result = [];
      if (!lastPatternData) return result;
      const { width, height, pixels } = lastPatternData;
      const seen = Array.from({ length: height }, () => Array(width).fill(false));
      const queue = [[seedX, seedY]];
      seen[seedY][seedX] = true;
      while (queue.length) {
        const [x, y] = queue.shift();
        if (pixels[y][x] !== targetIndex) continue;
        result.push([x, y]);
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < width && ny < height && !seen[ny][nx]) {
            seen[ny][nx] = true; queue.push([nx, ny]);
          }
        });
      }
      return result;
    }
    function fillTransparentRegionAt(cell, replacementIndex) {
      if (!lastPatternData || !cell) return false;
      const current = lastPatternData.pixels[cell.y]?.[cell.x];
      if (current !== 0) {
        showToast("请点击空豆区域", true);
        return false;
      }
      const cells = getConnectedRegion(cell.x, cell.y, 0);
      if (!cells.length) return false;
      pushHistory();
      cells.forEach(([x, y]) => { lastPatternData.pixels[y][x] = replacementIndex; });
      cleanupPalette(false);
      refreshAllViews();
      showToast(`已填充 ${cells.length} 个空豆`);
      setFillEmptyMode(false);
      return true;
    }
    function editSelectedColor(replacementIndex) {
      if (!lastPatternData || selectedPaletteIndex === null) { showToast("请先取色选择一种颜色", true); return; }
      const target = selectedPaletteIndex;
      if (target === 0 && replacementIndex === 0) return;
      pushHistory();
      let changed = 0;
      if ($("connectedOnly").checked) {
        if (!selectedSeed || selectedSeed.index !== target) { showToast("连通区域模式需要先在画面中取色", true); return; }
        const cells = getConnectedRegion(selectedSeed.x, selectedSeed.y, target);
        cells.forEach(([x, y]) => { lastPatternData.pixels[y][x] = replacementIndex; changed++; });
      } else {
        for (let y = 0; y < lastPatternData.height; y++) {
          for (let x = 0; x < lastPatternData.width; x++) {
            if (lastPatternData.pixels[y][x] === target) { lastPatternData.pixels[y][x] = replacementIndex; changed++; }
          }
        }
      }
      cleanupPalette(false);
      selectedPaletteIndex = null; selectedSeed = null;
      refreshAllViews();
      showToast(`已修改 ${changed} 格`);
    }
    function deleteSelectedColor() { editSelectedColor(0); }
    function replaceSelectedColor() {
      if (!lastPatternData) return;
      const replacementColor = $("replaceColor")?.value || $("replaceColorPicker")?.value || selectedColor;
      const index = ensureColorInPalette(replacementColor);
      editSelectedColor(index);
    }
    function cleanupPalette(show = true) {
      if (!lastPatternData) return;
      const used = new Set([0]);
      for (const row of lastPatternData.pixels) for (const index of row) used.add(index);
      const newPalette = ["transparent"];
      const remap = new Map([[0, 0]]);
      for (let i = 1; i < lastPatternData.palette.length; i++) {
        if (used.has(i)) { remap.set(i, newPalette.length); newPalette.push(lastPatternData.palette[i]); }
      }
      for (let y = 0; y < lastPatternData.height; y++) for (let x = 0; x < lastPatternData.width; x++) {
        lastPatternData.pixels[y][x] = remap.get(lastPatternData.pixels[y][x]) ?? 0;
      }
      lastPatternData.palette = newPalette;
      if (show) { refreshAllViews(); showToast("已清理未用颜色"); }
    }

    function isVisibleIndex(index, patternData = lastPatternData) {
      return index !== 0 && !!patternData && patternData.palette[index] !== "transparent";
    }
    function getEightNeighbors(x, y) {
      return [
        [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
        [x - 1, y],                 [x + 1, y],
        [x - 1, y + 1], [x, y + 1], [x + 1, y + 1]
      ];
    }
    function applyOutline() {
      if (!lastPatternData) return;
      const mode = $("outlineMode").value;
      const thickness = clamp(parseInt($("outlineThickness").value, 10) || 1, 1, 4);
      const outlineColor = normalizeColor($("outlineColor").value);
      const outlineIndex = ensureColorInPalette(outlineColor);

      pushHistory();
      if (mode === "add") {
        applyAddOutline(outlineIndex, thickness);
        showToast(`已新增 ${thickness} 层描边`);
      } else {
        applyReplaceOutline(outlineIndex, thickness);
        showToast(`已替换最外层 ${thickness} 圈像素`);
      }
      selectedSeed = null;
      cleanupPalette(false);
      refreshAllViews();
    }
    function applyAddOutline(outlineIndex, thickness) {
      const oldData = lastPatternData;
      const oldWidth = oldData.width;
      const oldHeight = oldData.height;
      const offset = thickness;
      const newWidth = oldWidth + offset * 2;
      const newHeight = oldHeight + offset * 2;
      const newPixels = Array.from({ length: newHeight }, () => Array(newWidth).fill(0));

      for (let y = 0; y < oldHeight; y++) {
        for (let x = 0; x < oldWidth; x++) {
          newPixels[y + offset][x + offset] = oldData.pixels[y][x];
        }
      }

      const workingData = {
        width: newWidth,
        height: newHeight,
        palette: oldData.palette,
        pixels: newPixels,
        meta: oldData.meta
      };

      for (let step = 0; step < thickness; step++) {
        const current = workingData.pixels.map(row => row.slice());
        const toPaint = [];
        for (let y = 0; y < workingData.height; y++) {
          for (let x = 0; x < workingData.width; x++) {
            if (!isVisibleIndex(current[y][x], workingData)) continue;
            for (const [nx, ny] of getEightNeighbors(x, y)) {
              if (nx < 0 || ny < 0 || nx >= workingData.width || ny >= workingData.height) continue;
              if (current[ny][nx] === 0) toPaint.push([nx, ny]);
            }
          }
        }
        for (const [x, y] of toPaint) {
          if (workingData.pixels[y][x] === 0) workingData.pixels[y][x] = outlineIndex;
        }
      }

      lastPatternData.width = newWidth;
      lastPatternData.height = newHeight;
      lastPatternData.pixels = workingData.pixels;
    }
    function applyReplaceOutline(outlineIndex, thickness) {
      const width = lastPatternData.width;
      const height = lastPatternData.height;
      const visibleMask = Array.from({ length: height }, (_, y) =>
        Array.from({ length: width }, (_, x) => isVisibleIndex(lastPatternData.pixels[y][x]))
      );
      const toReplaceSet = new Set();

      for (let step = 0; step < thickness; step++) {
        const layer = [];
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (!visibleMask[y][x]) continue;
            let isBoundary = false;
            for (const [nx, ny] of getEightNeighbors(x, y)) {
              if (nx < 0 || ny < 0 || nx >= width || ny >= height || !visibleMask[ny][nx]) {
                isBoundary = true;
                break;
              }
            }
            if (isBoundary) layer.push([x, y]);
          }
        }
        if (!layer.length) break;
        for (const [x, y] of layer) {
          toReplaceSet.add(`${x},${y}`);
          visibleMask[y][x] = false;
        }
      }

      for (const key of toReplaceSet) {
        const [x, y] = key.split(",").map(Number);
        lastPatternData.pixels[y][x] = outlineIndex;
      }
    }

    function downloadText(filename, content, type = "text/plain;charset=utf-8") {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }
    function downloadCanvasPng() {
      if (!lastPatternData) return;
      const svgText = buildPatternSvg(true);
      const { w, h } = getExportSvgSize();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = w;
      canvas.height = h;
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        canvas.toBlob(pngBlob => {
          if (!pngBlob) { showToast("PNG 导出失败"); return; }
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement("a");
          a.href = pngUrl; a.download = "bead-pattern.png"; a.click();
          URL.revokeObjectURL(pngUrl);
          showToast("已导出 PNG 图纸");
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        showToast("PNG 导出失败");
      };
      img.src = url;
    }
    function escapeSvgAttr(value) {
      return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function buildPatternSvg(includeXmlDeclaration = true) {
      if (!lastPatternData) return "";
      const layout = getExportLayout(lastPatternData);
      const opt = layout.opt;
      const { width, height, palette, pixels } = lastPatternData;
      const { w, h } = layout;
      const lines = [];
      if (includeXmlDeclaration) lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
        '<rect width="100%" height="100%" fill="#ffffff"/>',
        `<text x="${layout.pagePad}" y="34" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="40" font-weight="800" fill="#243447">${escapeSvgAttr(EXPORT_SITE_LABEL)}</text>`,
        `<text x="${w - layout.pagePad}" y="34" text-anchor="end" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="16" fill="#6f8092">${width} × ${height}｜${countTotalBeads()} 颗</text>`
      );

      lines.push(`<g id="pattern" transform="translate(${layout.drawingX}, ${layout.drawingY})">`);
      lines.push(`<rect x="0" y="0" width="${layout.drawingW}" height="${layout.drawingH}" fill="#ffffff" stroke="rgba(88,123,157,.18)" stroke-width="1"/>`);
      for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
        const index = pixels[y][x];
        const color = palette[index];
        const px = opt.margin + x * opt.cell;
        const py = opt.margin + y * opt.cell;
        if (!index || !color || color === "transparent") continue;
        if (opt.renderMode === "squares") lines.push(`<rect x="${px}" y="${py}" width="${opt.cell}" height="${opt.cell}" fill="${escapeSvgAttr(color)}"/>`);
        else lines.push(`<circle cx="${px + opt.cell / 2}" cy="${py + opt.cell / 2}" r="${opt.cell * .42}" fill="${escapeSvgAttr(color)}" stroke="rgba(0,0,0,.16)" stroke-width="1"/>`);
        if (opt.labelMode !== "none" && opt.cell >= 12) {
          const text = opt.labelMode === "symbol" ? (SYMBOLS[(index - 1) % SYMBOLS.length] || String(index)) : String(index);
          const fill = luminance(color) < 135 ? "#ffffff" : "#202020";
          lines.push(`<text x="${px + opt.cell / 2}" y="${py + opt.cell / 2 + opt.cell * .12}" text-anchor="middle" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="${Math.max(8, Math.floor(opt.cell * .33))}" font-weight="700" fill="${fill}">${escapeSvgAttr(text)}</text>`);
        }
      };
      const gridStroke = escapeSvgAttr(opt.gridLineColor || getGridLineColor());
      if (opt.showGrid) {
        const gridStrokeWidth = opt.gridLineWidth || getGridLineWidth();
        for (let x = 0; x <= width; x++) lines.push(`<line x1="${opt.margin + x * opt.cell}" y1="${opt.margin}" x2="${opt.margin + x * opt.cell}" y2="${opt.margin + height * opt.cell}" stroke="${gridStroke}" stroke-width="${gridStrokeWidth}" shape-rendering="crispEdges"/>`);
        for (let y = 0; y <= height; y++) lines.push(`<line x1="${opt.margin}" y1="${opt.margin + y * opt.cell}" x2="${opt.margin + width * opt.cell}" y2="${opt.margin + y * opt.cell}" stroke="${gridStroke}" stroke-width="${gridStrokeWidth}" shape-rendering="crispEdges"/>`);
      }
      if (opt.showCoords) {
        const coordStep = opt.coordGuideStep || 5;
        const guideStroke = escapeSvgAttr(opt.coordGuideLineColor || getCoordGuideLineColor());
        const guideStrokeWidth = opt.coordGuideLineWidth || getCoordGuideLineWidth();
        for (let x = coordStep; x < width; x += coordStep) lines.push(`<line x1="${opt.margin + x * opt.cell}" y1="${opt.margin}" x2="${opt.margin + x * opt.cell}" y2="${opt.margin + height * opt.cell}" stroke="${guideStroke}" stroke-width="${guideStrokeWidth}" shape-rendering="crispEdges"/>`);
        for (let y = coordStep; y < height; y += coordStep) lines.push(`<line x1="${opt.margin}" y1="${opt.margin + y * opt.cell}" x2="${opt.margin + width * opt.cell}" y2="${opt.margin + y * opt.cell}" stroke="${guideStroke}" stroke-width="${guideStrokeWidth}" shape-rendering="crispEdges"/>`);
      }
      if (opt.showCoords) {
        const coordStep = opt.coordGuideStep || 5;
        lines.push(`<g font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="11" fill="#61758a">`);
        for (let x = 0; x < width; x += coordStep) lines.push(`<text x="${opt.margin + x * opt.cell + opt.cell / 2}" y="${opt.margin - 10}" text-anchor="middle" dominant-baseline="middle">${x + 1}</text>`);
        for (let y = 0; y < height; y += coordStep) lines.push(`<text x="${opt.margin - 8}" y="${opt.margin + y * opt.cell + opt.cell / 2}" text-anchor="end" dominant-baseline="middle">${y + 1}</text>`);
        lines.push(`</g>`);
      }
      lines.push(`</g>`);

      if (layout.entries.length) {
        lines.push(`<g id="materials" transform="translate(${layout.materialX}, ${layout.materialY})">`);
        lines.push(`<text x="0" y="32" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="32" font-weight="800" fill="#243447">材料清单</text>`);
        lines.push(`<text x="150" y="32" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="17" fill="#6f8092">图纸编号 / ${escapeSvgAttr(getMaterialColorTitle())} / 数量</text>`);
        layout.entries.forEach((e, i) => {
          const col = i % layout.itemsPerRow;
          const row = Math.floor(i / layout.itemsPerRow);
          const x = col * layout.itemW;
          const y = layout.materialTitleH + row * (layout.itemH + layout.itemGapY);
          const textFill = luminance(e.color) < 135 ? "#ffffff" : "#202020";
          lines.push(`<g transform="translate(${x}, ${y})">`);
          if (opt.renderMode === "squares") {
            lines.push(`<rect x="0" y="6" width="96" height="96" rx="16" ry="16" fill="${escapeSvgAttr(e.color)}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`);
            lines.push(`<text x="48" y="54" text-anchor="middle" dominant-baseline="middle" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="39" font-weight="800" fill="${textFill}">${escapeSvgAttr(getMaterialNumberLabel(e))}</text>`);
          } else {
            lines.push(`<circle cx="48" cy="54" r="45" fill="${escapeSvgAttr(e.color)}" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`);
            lines.push(`<text x="48" y="54" text-anchor="middle" dominant-baseline="middle" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="39" font-weight="800" fill="${textFill}">${escapeSvgAttr(getMaterialNumberLabel(e))}</text>`);
          }
          const materialText = `${getMaterialColorCode(e)} ×${e.count}`;
          lines.push(`<text x="126" y="54" dominant-baseline="middle" font-family="Microsoft YaHei, 微软雅黑, sans-serif" font-size="51" fill="#243447">${escapeSvgAttr(materialText)}</text>`);
          lines.push(`</g>`);
        });
        lines.push(`</g>`);
      }

      lines.push('</svg>');
      return lines.join("\n");
    }
    function downloadSvg() {
      if (!lastPatternData) return;
      downloadText("bead-pattern.svg", buildPatternSvg(true), "image/svg+xml;charset=utf-8");
      showToast("已导出 SVG 图纸");
    }
    function downloadCsv() {
      if (!lastPatternData) return;
      const lines = [useBeadColorCodes ? "index,bead_code,symbol,count,recommended_count" : "index,hex_color,symbol,count,recommended_count"];
      getUsedPaletteEntries().forEach(e => {
        const colorCode = getMaterialColorCode(e);
        lines.push(`${e.index},${colorCode},${e.symbol},${e.count},${Math.ceil(e.count * 1.08)}`);
      });
      downloadText("bead-materials.csv", lines.join("\n"), "text/csv;charset=utf-8");
      showToast("已导出材料清单");
    }
    function clearAll(options = {}) {
      const opts = typeof options === "string" ? { reason: options } : (options || {});
      if (!opts.skipInvalidatingConfirm && !confirmInvalidatingAdjustments(opts.reason || "清空当前图纸")) return false;
      sourceImage = null; lastPatternData = null; selectedPaletteIndex = null; selectedSeed = null;
      hasPendingPatternEdits = false;
      showOriginalBase = false; isOriginalCompareActive = false;
      originalBaseTransparency = 0; patternTransparency = 0;
      updateOpacityControlsUI();
      undoStack = []; redoStack = []; fileInput.value = "";
      Array.from(new Set([originalCanvas, patternCanvas, patternReferenceCanvas, editorCanvas, editorReferenceCanvas])).forEach(c => { if (c) { c.width = 1; c.height = 1; } });
      previewZoom = 1;
      initialPreviewZoom = 1;
      exportPreviewZoom = 1;
      patternCanvas.style.width = "1px"; patternCanvas.style.height = "1px";
      patternReferenceCanvas.style.width = "1px"; patternReferenceCanvas.style.height = "1px";
      patternStage.style.width = "1px"; patternStage.style.height = "1px";
      patternReferenceCanvas.style.display = "none";
      patternReferenceCanvas.style.opacity = "0";
      patternCanvas.style.visibility = "visible";
      patternCanvas.style.opacity = "1";
      patternCanvas.style.background = "#fff";
      patternOverlay.style.visibility = "visible";
      if (editorCanvas !== patternCanvas) {
        editorReferenceCanvas.style.display = "none";
        editorReferenceCanvas.style.opacity = "0";
        editorCanvas.style.visibility = "visible";
        editorCanvas.style.opacity = "1";
        editorCanvas.style.background = "#fff";
        editorOverlay.style.visibility = "visible";
      }
      setPreviewEditMode(false);
      operationControlsActive = false;
      updateOperationControlsUI();
      $("originalInfo").textContent = "未选择图片"; const patternInfoEl = $("patternInfo"); if (patternInfoEl) patternInfoEl.textContent = "等待生成";
      $("statSize").textContent = "-"; $("statColors").textContent = "-"; $("statBeads").textContent = "-";
      const paletteBox = $("paletteBox"); if (paletteBox) paletteBox.innerHTML = ""; $("editorPaletteBox").innerHTML = ""; $("materialsTableWrap").innerHTML = ""; clearExportPreview();
      setButtonsEnabled(false); setConfirmImageReady(false); rememberSafeInvalidatingControlValues(); showToast("已清空");
      return true;
    }
    function clampOperationCursor() {
      if (!lastPatternData) {
        operationCursorX = 0;
        operationCursorY = 0;
        return;
      }
      operationCursorX = clamp(parseInt(operationCursorX, 10) || 0, 0, lastPatternData.width - 1);
      operationCursorY = clamp(parseInt(operationCursorY, 10) || 0, 0, lastPatternData.height - 1);
    }
    function getOperationBrushRect() {
      if (!lastPatternData) return null;
      clampOperationCursor();
      const size = activeTool === "pick" ? 1 : getCurrentBrushSize();
      const brushSize = Math.max(1, Math.min(12, parseInt(size, 10) || 1));
      const leftSpan = Math.floor((brushSize - 1) / 2);
      const rightSpan = brushSize - leftSpan - 1;
      const x1 = clamp(operationCursorX - leftSpan, 0, lastPatternData.width - 1);
      const y1 = clamp(operationCursorY - leftSpan, 0, lastPatternData.height - 1);
      const x2 = clamp(operationCursorX + rightSpan, 0, lastPatternData.width - 1);
      const y2 = clamp(operationCursorY + rightSpan, 0, lastPatternData.height - 1);
      return { x: x1, y: y1, width: x2 - x1 + 1, height: y2 - y1 + 1 };
    }
    function updateOperationControlsUI() {
      const toggleBtn = $("operationToggleBtn");
      if (toggleBtn) {
        toggleBtn.disabled = !lastPatternData;
        toggleBtn.classList.toggle("active", !!operationControlsActive);
        toggleBtn.classList.toggle("secondary", !operationControlsActive);
        toggleBtn.setAttribute("aria-pressed", operationControlsActive ? "true" : "false");
      }
      if (operationPad) {
        operationPad.classList.toggle("active", !!operationControlsActive && !!lastPatternData);
        operationPad.setAttribute("aria-hidden", operationControlsActive && lastPatternData ? "false" : "true");
      }
      if (patternWrap) patternWrap.classList.toggle("operation-mode", !!operationControlsActive && !!lastPatternData);
      updateOperationCursorOverlay();
    }
    function updateOperationCursorOverlay() {
      if (!operationCursorBox) return;
      if (!operationControlsActive || !previewEditModeActive || !lastPatternData) {
        operationCursorBox.classList.remove("active");
        return;
      }
      const opt = getPreviewRenderOptions();
      const rect = getOperationBrushRect();
      if (!rect) {
        operationCursorBox.classList.remove("active");
        return;
      }
      const left = (opt.margin + rect.x * opt.cell) * previewZoom;
      const top = (opt.margin + rect.y * opt.cell) * previewZoom;
      const width = Math.max(1, rect.width * opt.cell * previewZoom);
      const height = Math.max(1, rect.height * opt.cell * previewZoom);
      operationCursorBox.style.left = `${left}px`;
      operationCursorBox.style.top = `${top}px`;
      operationCursorBox.style.width = `${width}px`;
      operationCursorBox.style.height = `${height}px`;
      operationCursorBox.classList.add("active");
    }
    function setOperationCursor(cell, shouldScrollIntoView = false) {
      if (!lastPatternData || !cell) return;
      operationCursorX = clamp(parseInt(cell.x, 10) || 0, 0, lastPatternData.width - 1);
      operationCursorY = clamp(parseInt(cell.y, 10) || 0, 0, lastPatternData.height - 1);
      updateOperationCursorOverlay();
      updateOperationCursorInfo();
      if (shouldScrollIntoView) scrollOperationCursorIntoView();
    }
    function resetOperationCursorToCenter() {
      if (!lastPatternData) return;
      if (!Number.isFinite(operationCursorX) || !Number.isFinite(operationCursorY)) {
        operationCursorX = Math.floor(lastPatternData.width / 2);
        operationCursorY = Math.floor(lastPatternData.height / 2);
      }
      clampOperationCursor();
      updateOperationCursorOverlay();
    }
    function moveOperationCursor(dx, dy) {
      if (!lastPatternData) return;
      setPreviewEditMode(true);
      setOperationCursor({ x: operationCursorX + dx, y: operationCursorY + dy }, true);
    }
    function scrollOperationCursorIntoView() {
      if (!lastPatternData || !patternWrap) return;
      const opt = getPreviewRenderOptions();
      const rect = getOperationBrushRect();
      if (!rect) return;
      const left = (opt.margin + rect.x * opt.cell) * previewZoom;
      const top = (opt.margin + rect.y * opt.cell) * previewZoom;
      const width = rect.width * opt.cell * previewZoom;
      const height = rect.height * opt.cell * previewZoom;
      const contentOffset = getPatternContentOffset();
      const targetLeft = contentOffset.left + left;
      const targetTop = contentOffset.top + top;
      const pad = 40;
      if (targetLeft < patternWrap.scrollLeft + pad) patternWrap.scrollLeft = Math.max(0, targetLeft - pad);
      else if (targetLeft + width > patternWrap.scrollLeft + patternWrap.clientWidth - pad) {
        patternWrap.scrollLeft = Math.max(0, targetLeft + width - patternWrap.clientWidth + pad);
      }
      if (targetTop < patternWrap.scrollTop + pad) patternWrap.scrollTop = Math.max(0, targetTop - pad);
      else if (targetTop + height > patternWrap.scrollTop + patternWrap.clientHeight - pad) {
        patternWrap.scrollTop = Math.max(0, targetTop + height - patternWrap.clientHeight + pad);
      }
    }
    function updateOperationCursorInfo() {
      const patternInfoEl = $("patternInfo");
      if (!patternInfoEl || !lastPatternData || !operationControlsActive) return;
      const modeText = $("renderMode").value === "squares" ? "方格" : "圆珠";
      patternInfoEl.textContent = `${lastPatternData.width} × ${lastPatternData.height}，${modeText}显示，选中 ${operationCursorX + 1}, ${operationCursorY + 1}，缩放 ${previewZoom.toFixed(2)}x`;
    }
    function setOperationControlsActive(active) {
      const wasActive = !!operationControlsActive;
      operationControlsActive = !!active && !!lastPatternData;
      if (operationControlsActive) {
        if (!wasActive) {
          operationCursorX = Math.floor(lastPatternData.width / 2);
          operationCursorY = Math.floor(lastPatternData.height / 2);
        }
        setPreviewEditMode(true);
        resetOperationCursorToCenter();
        scrollOperationCursorIntoView();
      }
      updateOperationControlsUI();
      updatePreviewEditModeUI();
    }
    function toggleOperationControls() {
      if (!lastPatternData) {
        showToast("请先生成图纸", true);
        return;
      }
      setOperationControlsActive(!operationControlsActive);
      showToast(operationControlsActive ? "已开启操作按键" : "已关闭操作按键");
    }
    function applyOperationAtCursor() {
      if (!operationControlsActive || !lastPatternData) return;
      setPreviewEditMode(true);
      const cell = { x: operationCursorX, y: operationCursorY };
      lastPaintKey = "";
      if (activeTool !== "pick") pushHistory();
      handleEditorCellAction(cell);
      cleanupPalette(false);
      refreshAllViews();
      updateOperationCursorOverlay();
    }

    function updatePreviewEditModeUI() {
      const btn = $("previewEditModeBtn");
      const hint = $("previewEditModeHint");
      if (btn) {
        btn.disabled = !lastPatternData;
        btn.textContent = previewEditModeActive ? "退出编辑模式" : "进入编辑模式";
        btn.classList.toggle("active", previewEditModeActive);
        btn.classList.toggle("secondary", !previewEditModeActive);
      }
      if (hint) {
        hint.textContent = previewEditModeActive
          ? (operationControlsActive ? "操作按键中：方向键移动选中框，中间键执行画笔或橡皮。" : "编辑模式中：左键/单指编辑，右键或双指拖动，滚轮或双指缩放。")
          : "未进入编辑模式时，图纸区域用于拖动和缩放查看。";
      }
      if (patternWrap) {
        patternWrap.classList.toggle("preview-editing", previewEditModeActive);
        patternWrap.style.cursor = operationControlsActive ? "default" : (previewEditModeActive ? "crosshair" : "grab");
      }
    }

    function setPreviewEditMode(active) {
      previewEditModeActive = !!active && !!lastPatternData;
      isDrawing = false;
      isPanning = false;
      isPreviewPanning = false;
      lastPaintKey = "";
      if (!previewEditModeActive && fillEmptyModeActive) {
        fillEmptyModeActive = false;
      }
      if (!previewEditModeActive && operationControlsActive) {
        operationControlsActive = false;
      }
      updatePreviewEditModeUI();
      updateFillEmptyModeUI();
      updateOperationControlsUI();
    }

    function switchTab(tab) {
      // 旧版的“图纸编辑”独立页已经删除；现在始终停留在预览页。
      const previewSection = $("previewSection");
      if (previewSection) previewSection.classList.add("active");
      const appPage = $("appPage");
      if (appPage) appPage.classList.remove("editor-active");
      updatePreviewEditModeUI();
    }

    function showToast(text, isError = false) {
      const toast = $("toast");
      toast.textContent = text;
      toast.style.color = isError ? "var(--danger)" : "var(--ok)";
      toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("show"), 1700);
    }



    function safePreventDefault(evt) {
      if (evt && evt.cancelable !== false) evt.preventDefault();
    }
    function touchPoint(touch) {
      return { clientX: touch.clientX, clientY: touch.clientY };
    }
    function touchDistance(t1, t2) {
      return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
    function touchMidpoint(t1, t2) {
      return {
        clientX: (t1.clientX + t2.clientX) / 2,
        clientY: (t1.clientY + t2.clientY) / 2
      };
    }
    function makeClientEvent(point) {
      return { clientX: point.clientX, clientY: point.clientY, button: 0 };
    }
    function finishEditorTouchDrawing() {
      if (!isDrawing) return;
      isDrawing = false;
      lastPaintKey = "";
      cleanupPalette(false);
      refreshAllViews();
    }
    function bindTouchPanAndPinch(wrap, getZoom, setZoom, cursorReset, getContentElement) {
      if (!wrap) return;
      let touchMode = "";
      let startX = 0;
      let startY = 0;
      let startScrollLeft = 0;
      let startScrollTop = 0;
      let pinchStartDistance = 1;
      let pinchStartZoom = 1;
      let pinchAnchor = null;

      function getPinchAnchor(mid, zoom) {
        const content = typeof getContentElement === "function" ? getContentElement() : null;
        if (!content) return null;
        const rect = content.getBoundingClientRect();
        const wrapRect = wrap.getBoundingClientRect();
        return {
          xInContent: (mid.clientX - rect.left) / Math.max(zoom, 0.001),
          yInContent: (mid.clientY - rect.top) / Math.max(zoom, 0.001),
          xInWrap: mid.clientX - wrapRect.left,
          yInWrap: mid.clientY - wrapRect.top
        };
      }

      function makeZoomEventFromPinch(mid) {
        const zoomEvt = makeClientEvent(mid);
        if (pinchAnchor) {
          const wrapRect = wrap.getBoundingClientRect();
          zoomEvt.zoomAnchor = {
            xInContent: pinchAnchor.xInContent,
            yInContent: pinchAnchor.yInContent,
            xInWrap: mid.clientX - wrapRect.left,
            yInWrap: mid.clientY - wrapRect.top
          };
        }
        return zoomEvt;
      }

      wrap.addEventListener("touchstart", evt => {
        if (!lastPatternData) return;
        if (wrap === patternWrap && previewEditModeActive && evt.touches.length === 1) return;
        if (evt.touches.length === 1) {
          const t = evt.touches[0];
          touchMode = "pan";
          startX = t.clientX;
          startY = t.clientY;
          startScrollLeft = wrap.scrollLeft;
          startScrollTop = wrap.scrollTop;
          pinchAnchor = null;
          wrap.style.cursor = "grabbing";
          safePreventDefault(evt);
        } else if (evt.touches.length >= 2) {
          touchMode = "pinch";
          pinchStartDistance = Math.max(1, touchDistance(evt.touches[0], evt.touches[1]));
          pinchStartZoom = getZoom();
          pinchAnchor = getPinchAnchor(touchMidpoint(evt.touches[0], evt.touches[1]), pinchStartZoom);
          safePreventDefault(evt);
        }
      }, { passive: false });

      wrap.addEventListener("touchmove", evt => {
        if (!lastPatternData || !touchMode) return;
        if (touchMode === "pinch" && evt.touches.length >= 2) {
          const nextDistance = Math.max(1, touchDistance(evt.touches[0], evt.touches[1]));
          const mid = touchMidpoint(evt.touches[0], evt.touches[1]);
          setZoom(pinchStartZoom * (nextDistance / pinchStartDistance), makeZoomEventFromPinch(mid));
          safePreventDefault(evt);
          return;
        }
        if (touchMode === "pan" && evt.touches.length === 1) {
          const t = evt.touches[0];
          wrap.scrollLeft = startScrollLeft - (t.clientX - startX);
          wrap.scrollTop = startScrollTop - (t.clientY - startY);
          safePreventDefault(evt);
        }
      }, { passive: false });

      const endTouch = () => {
        if (!touchMode) return;
        touchMode = "";
        pinchAnchor = null;
        wrap.style.cursor = cursorReset || "grab";
      };
      wrap.addEventListener("touchend", endTouch, { passive: true });
      wrap.addEventListener("touchcancel", endTouch, { passive: true });
    }

    let editorTouchMode = "";

    function bindEditorTouchControls() {
      const wrap = patternWrap;
      if (!wrap) return;
      wrap.addEventListener("touchstart", evt => {
        if (!previewEditModeActive || !lastPatternData) return;
        if (evt.touches.length >= 2) return; // 双指交给预览缩放/拖动逻辑
        if (evt.touches.length !== 1) return;
        const point = touchPoint(evt.touches[0]);
        const fakeEvt = makeClientEvent(point);
        const cell = getEditorCellFromEvent(fakeEvt);
        if (!cell) return;
        if (operationControlsActive) {
          setOperationCursor(cell, false);
          safePreventDefault(evt);
          return;
        }
        editorTouchMode = "draw";
        isDrawing = true;
        lastPaintKey = "";
        if (activeTool !== "pick") pushHistory();
        handleEditorAction(fakeEvt);
        safePreventDefault(evt);
      }, { passive: false });

      wrap.addEventListener("touchmove", evt => {
        if (!previewEditModeActive || !lastPatternData) return;
        if (evt.touches.length >= 2) return;
        if (operationControlsActive && evt.touches.length === 1) {
          const cell = getEditorCellFromEvent(makeClientEvent(touchPoint(evt.touches[0])));
          if (cell) setOperationCursor(cell, false);
          safePreventDefault(evt);
          return;
        }
        if (editorTouchMode === "draw" && isDrawing && evt.touches.length === 1) {
          handleEditorAction(makeClientEvent(touchPoint(evt.touches[0])));
          safePreventDefault(evt);
        }
      }, { passive: false });

      const endTouch = () => {
        if (editorTouchMode === "draw") finishEditorTouchDrawing();
        editorTouchMode = "";
      };
      wrap.addEventListener("touchend", endTouch, { passive: true });
      wrap.addEventListener("touchcancel", endTouch, { passive: true });
    }

    function openImagePicker() {
      imageReplacementConfirmed = false;
      if (!confirmInvalidatingAdjustments("重新选择图片")) return false;
      imageReplacementConfirmed = true;
      fileInput.value = "";
      fileInput.click();
      return true;
    }

    function setConfirmImageReady() {}

    // Page-level DOM bindings moved to js/pages/*.js.

    (function bindEditableIntegerValues() {
      const bindings = [
        { rangeId: "beadWidth", valueId: "beadWidthValue" },
        { rangeId: "customColors", valueId: "customColorsValue" },
        { rangeId: "brightnessRange", valueId: "brightnessValue", signed: true },
        { rangeId: "contrastRange", valueId: "contrastValue", signed: true },
        { rangeId: "saturationRange", valueId: "saturationValue", signed: true },
        { rangeId: "temperatureRange", valueId: "temperatureValue", signed: true }
      ];

      const normalizeIntegerText = (text, allowNegative) => {
        let value = String(text || "").trim();
        value = allowNegative
          ? value.replace(/(?!^-)[^0-9]/g, "").replace(/^-+/, "-")
          : value.replace(/[^0-9]/g, "");
        if (allowNegative) {
          const negative = value.startsWith("-");
          value = (negative ? "-" : "") + value.replace(/-/g, "");
        }
        return value;
      };

      const commitRangeInteger = (range, rawValue) => {
        const min = Number.isFinite(parseInt(range.min, 10)) ? parseInt(range.min, 10) : -Infinity;
        const max = Number.isFinite(parseInt(range.max, 10)) ? parseInt(range.max, 10) : Infinity;
        const fallback = parseInt(range.value, 10) || 0;
        let next = parseInt(rawValue, 10);
        if (!Number.isFinite(next)) next = fallback;
        next = Math.round(clamp(next, min, max));
        range.value = String(next);
        range.dispatchEvent(new Event("input", { bubbles: true }));
        range.dispatchEvent(new Event("change", { bubbles: true }));
      };

      const startNumberEdit = (valueEl, range, allowNegative) => {
        if (!valueEl || !range || valueEl.dataset.editing === "true") return;
        valueEl.dataset.editing = "true";
        const originalText = valueEl.textContent;
        const input = document.createElement("input");
        input.type = "number";
        input.className = "value-inline-input";
        input.step = "1";
        input.min = range.min || "";
        input.max = range.max || "";
        input.inputMode = allowNegative ? "numeric" : "numeric";
        input.pattern = allowNegative ? "-?[0-9]*" : "[0-9]*";
        input.value = String(parseInt(range.value, 10) || 0);
        valueEl.textContent = "";
        valueEl.appendChild(input);
        input.focus();
        input.select();

        let finished = false;
        const finish = (shouldCommit) => {
          if (finished) return;
          finished = true;
          const nextText = input.value;
          valueEl.dataset.editing = "false";
          valueEl.textContent = originalText;
          if (shouldCommit) commitRangeInteger(range, nextText);
          else range.dispatchEvent(new Event("input", { bubbles: true }));
        };

        input.addEventListener("input", () => {
          const next = normalizeIntegerText(input.value, allowNegative);
          if (input.value !== next) input.value = next;
        });
        input.addEventListener("keydown", evt => {
          if (evt.key === "Enter") {
            evt.preventDefault();
            finish(true);
          } else if (evt.key === "Escape") {
            evt.preventDefault();
            finish(false);
          }
        });
        input.addEventListener("blur", () => finish(true));
      };

      bindings.forEach(({ rangeId, valueId, signed }) => {
        const range = $(rangeId);
        const valueEl = $(valueId);
        if (!range || !valueEl) return;
        valueEl.classList.add("number-value-editable");
        valueEl.setAttribute("role", "button");
        valueEl.setAttribute("tabindex", "0");
        valueEl.setAttribute("title", "点击输入整数");
        valueEl.addEventListener("click", () => startNumberEdit(valueEl, range, !!signed));
        valueEl.addEventListener("keydown", evt => {
          if (evt.key === "Enter" || evt.key === " ") {
            evt.preventDefault();
            startNumberEdit(valueEl, range, !!signed);
          }
        });
      });
    })();

  

    /* 本次调整：根据底部功能面板高度动态压缩图纸预览区，并按横/纵方向自动适配图纸 */
    let responsivePreviewLayoutRaf = 0;

    function syncWorkModeShellClass() {
      const shell = document.querySelector(".mobile-shell");
      const app = $("appPage");
      if (!shell || !app) return;
      shell.classList.toggle("work-mode-active", app.classList.contains("active"));
    }

    function getActiveWorkViewportHeight() {
      const app = $("appPage");
      const shell = document.querySelector(".mobile-shell");
      const visualH = window.visualViewport && window.visualViewport.height ? window.visualViewport.height : window.innerHeight;
      const appRect = app ? app.getBoundingClientRect() : null;
      const shellRect = shell ? shell.getBoundingClientRect() : null;
      let h = appRect && appRect.height ? appRect.height : 0;
      if (!h || h < 280) h = shellRect && shellRect.height ? shellRect.height : 0;
      if (!h || h < 280) h = visualH || window.innerHeight || 640;
      return Math.max(320, Math.round(h));
    }

    function updateResponsivePreviewLayout() {
      syncWorkModeShellClass();
      const app = $("appPage");
      const wrap = $("patternWrap");
      if (!app || !wrap || !app.classList.contains("active")) return { width: 320, height: 260 };

      const nav = app.querySelector(".app-nav");
      const main = app.querySelector("main");
      const controls = app.querySelector(".controls.control-dock");
      const controlFloat = app.querySelector(".control-panel-float");
      const tabStrip = app.querySelector(".tool-tab-strip");
      if (!main || !controls || !controlFloat || !tabStrip) return getPatternWrapViewportSize();

      const appH = getActiveWorkViewportHeight();
      const navH = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
      const mainStyle = window.getComputedStyle(main);
      const mainPadY = (parseFloat(mainStyle.paddingTop) || 0) + (parseFloat(mainStyle.paddingBottom) || 0);
      const availableMainH = Math.max(250, Math.round(appH - navH - mainPadY));
      const tabH = Math.max(42, Math.ceil(tabStrip.getBoundingClientRect().height || 45));
      const minPreviewH = availableMainH <= 620 ? 118 : 150;
      const maxFloatH = Math.max(74, Math.floor(availableMainH - tabH - minPreviewH));

      document.documentElement.style.setProperty("--control-panel-max-height", `${maxFloatH}px`);
      controlFloat.style.setProperty("max-height", `${maxFloatH}px`, "important");
      controlFloat.style.setProperty("min-height", "0px", "important");

      // 重新读取一次底部控制区高度，确保当前功能面板变化后，预览区会立刻让出空间。
      const controlsH = Math.ceil(controls.getBoundingClientRect().height || (controlFloat.getBoundingClientRect().height + tabH));
      const frameH = Math.max(minPreviewH, Math.floor(availableMainH - controlsH));
      wrap.style.setProperty("--preview-fixed-frame-height", `${frameH}px`);

      const wrapRect = wrap.getBoundingClientRect();
      const viewport = getPatternWrapViewportSize();
      return {
        width: Math.max(180, Math.round(viewport.width || wrapRect.width || wrap.clientWidth || 320)),
        height: Math.max(118, Math.round(viewport.height || frameH))
      };
    }

    function scheduleResponsivePreviewLayout(refit = false) {
      cancelAnimationFrame(responsivePreviewLayoutRaf);
      responsivePreviewLayoutRaf = requestAnimationFrame(() => {
        updateResponsivePreviewLayout();
        if (refit && lastPatternData && !userAdjustedZoom) {
          fitPreviewZoomToOriginalSize();
        } else if (lastPatternData) {
          syncPatternStageCentering();
        }
      });
    }

    function lockPreviewButtonFrameToDefaultSize() {
      updateResponsivePreviewLayout();
    }

    function fitPreviewZoomToOriginalSize() {
      if (!lastPatternData || !sourceImage) {
        updateResponsivePreviewLayout();
        return;
      }
      const viewportSize = updateResponsivePreviewLayout();
      const renderOptions = getPreviewRenderOptions();
      const baseW = Math.max(1, lastPatternData.width * renderOptions.cell + renderOptions.margin * 2);
      const baseH = Math.max(1, lastPatternData.height * renderOptions.cell + renderOptions.margin * 2);
      const targetZoom = Math.min(viewportSize.width / baseW, viewportSize.height / baseH);

      previewZoom = clamp(targetZoom, MIN_PREVIEW_ZOOM, MAX_PREVIEW_ZOOM);
      initialPreviewZoom = previewZoom;
      userAdjustedZoom = false;
      drawPreviewPattern();
      updateResponsivePreviewLayout();
      syncPatternStageCentering();

      requestAnimationFrame(centerPreviewScroll);
      updatePatternInfo();
    }

    (function bindResponsivePreviewLayoutFix() {
      syncWorkModeShellClass();
      document.querySelectorAll(".tool-tab").forEach(btn => {
        btn.addEventListener("click", () => scheduleResponsivePreviewLayout(false));
      });
      ["appPage", "homePage", "exportPage", "myPatternsPage"].forEach(id => {
        const page = $(id);
        if (!page || !window.MutationObserver) return;
        new MutationObserver(() => scheduleResponsivePreviewLayout(false)).observe(page, { attributes: true, attributeFilter: ["class"] });
      });
      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => scheduleResponsivePreviewLayout(false));
        const controlFloat = document.querySelector(".control-panel-float");
        const tabStrip = document.querySelector(".tool-tab-strip");
        if (controlFloat) ro.observe(controlFloat);
        if (tabStrip) ro.observe(tabStrip);
      }
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", () => scheduleResponsivePreviewLayout(true));
      }
      window.addEventListener("orientationchange", () => scheduleResponsivePreviewLayout(true));
      scheduleResponsivePreviewLayout(false);
    })();

function initSliderProgressZeroFix() {
(function () {
    const TRACK_FILL = "rgba(78, 162, 245, .44)";
    const TRACK_BASE = "rgba(108, 136, 166, .24)";

    function clampPercent(value) {
      return Math.max(0, Math.min(100, value));
    }

    function isToneRange(range) {
      return !!(range && range.closest && range.closest('.tool-panel[data-panel="tone"]'));
    }

    function getRangePercent(range) {
      const min = Number.parseFloat(range.min || "0");
      const max = Number.parseFloat(range.max || "100");
      const value = Number.parseFloat(range.value || "0");
      if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return 0;
      return clampPercent(((value - min) / (max - min)) * 100);
    }

    function setRangeProgress(range) {
      if (!range || range.type !== "range") return;
      const min = Number.parseFloat(range.min || "0");
      const max = Number.parseFloat(range.max || "100");
      const valuePct = getRangePercent(range);
      range.style.setProperty("--range-progress", valuePct.toFixed(3) + "%");

      if (isToneRange(range) && Number.isFinite(min) && Number.isFinite(max) && min < 0 && max > 0) {
        const zeroPct = clampPercent(((0 - min) / (max - min)) * 100);
        const start = Math.min(valuePct, zeroPct).toFixed(3);
        const end = Math.max(valuePct, zeroPct).toFixed(3);
        range.style.setProperty(
          "--range-track-bg",
          `linear-gradient(to right, ${TRACK_BASE} 0%, ${TRACK_BASE} ${start}%, ${TRACK_FILL} ${start}%, ${TRACK_FILL} ${end}%, ${TRACK_BASE} ${end}%, ${TRACK_BASE} 100%)`
        );
      } else {
        const pct = valuePct.toFixed(3);
        range.style.setProperty(
          "--range-track-bg",
          `linear-gradient(to right, ${TRACK_FILL} 0%, ${TRACK_FILL} ${pct}%, ${TRACK_BASE} ${pct}%, ${TRACK_BASE} 100%)`
        );
      }
    }

    function ensureToneZeroMarkers() {
      document.querySelectorAll('.tool-panel[data-panel="tone"] .tone-slider-card input[type="range"]').forEach(range => {
        const min = Number.parseFloat(range.min || "0");
        const max = Number.parseFloat(range.max || "100");
        if (!(Number.isFinite(min) && Number.isFinite(max) && min < 0 && max > 0)) return;
        const card = range.closest('.tone-slider-card');
        if (!card || card.querySelector(':scope > .tone-zero-marker')) return;
        const marker = document.createElement('span');
        marker.className = 'tone-zero-marker';
        marker.setAttribute('aria-hidden', 'true');
        range.insertAdjacentElement('afterend', marker);
      });
    }

    function syncAllRangeProgress() {
      ensureToneZeroMarkers();
      document.querySelectorAll('input[type="range"]').forEach(setRangeProgress);
    }

    document.addEventListener('input', evt => {
      if (evt.target && evt.target.matches && evt.target.matches('input[type="range"]')) {
        setRangeProgress(evt.target);
      }
    }, true);

    document.addEventListener('change', evt => {
      if (evt.target && evt.target.matches && evt.target.matches('input[type="range"]')) {
        setRangeProgress(evt.target);
      }
    }, true);

    document.addEventListener('click', () => {
      requestAnimationFrame(syncAllRangeProgress);
    }, true);

    window.addEventListener('resize', () => requestAnimationFrame(syncAllRangeProgress));
    syncAllRangeProgress();
    requestAnimationFrame(syncAllRangeProgress);
  })();
}

function createContext(router) {
  const showPage = router.showPage;
  return {
    $,
    state,
    showPage,
    openImagePicker,
    drawOriginalImage,
    generatePattern,
    showToast,
    updateToneLabels,
    updateGridLineOptionsUI,
    updateEditableColorSelectors,
    refreshAllViews,
    updateFillEmptyModeUI,
    updateOperationControlsUI,
    setOperationControlsActive,
    toggleOperationControls,
    moveOperationCursor,
    applyOperationAtCursor,
    setOperationCursor,
    switchTab,
    applyStylePreset,
    updateStylePresetUI,
    setTool,
    setPreviewEditMode,
    updateBrushSizeUI,
    updateEditMardColorBall,
    normalizeColor,
    ensureColorInPalette,
    updateColorSelectPreview,
    updateSelectedColorUI,
    renderPalettes,
    setColorSelectValue,
    setMardPickerOpen,
    setEditorZoom,
    setOriginalCompareActive,
    toggleOriginalBase,
    updateOpacityControlsUI,
    updatePreviewReferenceLayer,
    updateEditorReferenceLayer,
    undo,
    redo,
    deleteSelectedColor,
    replaceSelectedColor,
    setFillEmptyMode,
    applyOutline,
    bindTouchPanAndPinch,
    setPreviewZoom,
    getExportPreviewCanvas,
    setExportPreviewZoom,
    bindEditorTouchControls,
    getEditorCellFromEvent,
    handleEditorAction,
    handleEditorCellAction,
    pushHistory,
    cleanupPalette,
    downloadCanvasPng,
    downloadSvg,
    downloadCsv,
    mirrorCurrentPattern,
    toggleBeadColorCodeMode,
    clearAll,
    confirmInvalidatingAdjustments,
    confirmImageReplacement,
    setButtonsEnabled,
    fitPreviewZoomToOriginalSize,
    keepPreviewLayout() { scheduleResponsivePreviewLayout(false); },
    hasUserAdjustedPreviewZoom() { return !!userAdjustedZoom; },
    updateExportSection,
    initSliderProgressZeroFix
  };
}

function init(ctx) {
  const {
    $,
    showPage,
    showToast,
    generatePattern,
    updateGridLineOptionsUI,
    updateToneLabels,
    updateEditableColorSelectors,
    refreshAllViews,
    updateFillEmptyModeUI,
    updateOperationControlsUI,
    setOperationControlsActive,
    toggleOperationControls,
    moveOperationCursor,
    applyOperationAtCursor,
    setOperationCursor,
    switchTab,
    applyStylePreset,
    updateStylePresetUI,
    setTool,
    setPreviewEditMode,
    updateBrushSizeUI,
    updateEditMardColorBall,
    normalizeColor,
    ensureColorInPalette,
    updateColorSelectPreview,
    updateSelectedColorUI,
    renderPalettes,
    setColorSelectValue,
    setMardPickerOpen,
    setEditorZoom,
    setOriginalCompareActive,
    toggleOriginalBase,
    updateOpacityControlsUI,
    updatePreviewReferenceLayer,
    updateEditorReferenceLayer,
    undo,
    redo,
    deleteSelectedColor,
    replaceSelectedColor,
    setFillEmptyMode,
    applyOutline,
    bindTouchPanAndPinch,
    setPreviewZoom,
    bindEditorTouchControls,
    getEditorCellFromEvent,
    handleEditorAction,
    pushHistory,
    cleanupPalette,
    fitPreviewZoomToOriginalSize,
    setButtonsEnabled
  } = ctx;
  const patternWrap = $("patternWrap");
  const patternCanvas = $("patternCanvas");
  const exportPreviewWrap = $("exportPreviewWrap");

    $("backHomeFromAppBtn").addEventListener("click", () => showPage("homePage", "back"));
    $("openExportPageBtn").addEventListener("click", () => {
      if (!lastPatternData) { showToast("请先生成图纸", true); return; }
      showPage("exportPage", "forward");
    });

    ["beadWidth", "customColors", "brightnessRange", "contrastRange", "saturationRange", "temperatureRange"].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("input", () => {
        syncInvalidatingControlLabels();
        if (sourceImage && !generatePattern({ reason: INVALIDATING_ACTION_LABELS[id] || "重新生成图纸" })) {
          restoreSafeInvalidatingControlValues();
        }
      });
    });
    ["paletteMode", "ditherMode", "removeWhiteBg", "backgroundCleanupColor"].forEach(id => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("change", () => {
        if (id === "paletteMode") el.value = "custom";
        if (sourceImage) {
          if (!generatePattern({ reason: INVALIDATING_ACTION_LABELS[id] || "重新生成图纸" })) {
            restoreSafeInvalidatingControlValues();
          }
          if (id === "ditherMode") updateDitherButtonState();
        } else {
          updateEditableColorSelectors();
          rememberSafeInvalidatingControlValues();
        }
      });
    });
    ["renderMode", "labelMode", "gridLineMode", "coordGuideMode"].forEach(id => $(id).addEventListener("change", () => {
      updateGridLineOptionsUI();
      if (lastPatternData) refreshAllViews();
    }));
    const paletteModeEl = $("paletteMode");
    if (paletteModeEl) {
      paletteModeEl.value = "custom";
      paletteModeEl.addEventListener("change", () => {
        paletteModeEl.value = "custom";
        $("customColorGroup").style.display = "block";
        updateEditableColorSelectors();
      });
    }
    function updateToneToggleState() {
      const group = $("toneControlGroup");
      const btn = $("toneToggleBtn");
      const state = $("toneToggleState");
      if (!group || !btn || !state) return;
      const open = group.classList.contains("tone-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      state.textContent = open ? "收起 ▲" : "展开 ▼";
    }
    $("toneToggleBtn").addEventListener("click", () => {
      $("toneControlGroup").classList.toggle("tone-open");
      updateToneToggleState();
    });
    updateToneToggleState();

    function setActiveToneControl(name) {
      document.querySelectorAll(".tone-adjust-btn[data-tone-target]").forEach(btn => {
        const active = btn.dataset.toneTarget === name;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        if (active) btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      });
      document.querySelectorAll(".tone-slider-card").forEach(card => {
        card.classList.toggle("active", card.dataset.toneRow === name);
      });
    }
    document.querySelectorAll(".tone-adjust-btn[data-tone-target]").forEach(btn => {
      btn.addEventListener("click", () => setActiveToneControl(btn.dataset.toneTarget));
    });
    function updateDitherButtonState() {
      const dither = $("ditherMode");
      const btn = $("toggleDitherBtn");
      if (!dither || !btn) return;
      const enabled = dither.value !== "none";
      btn.classList.toggle("active", enabled);
      btn.setAttribute("aria-pressed", enabled ? "true" : "false");
    }
    const ditherModeElForButton = $("ditherMode");
    if (ditherModeElForButton) ditherModeElForButton.addEventListener("change", updateDitherButtonState);
    const toggleDitherBtn = $("toggleDitherBtn");
    if (toggleDitherBtn) {
      toggleDitherBtn.addEventListener("click", () => {
        const dither = $("ditherMode");
        if (!dither) return;
        dither.value = dither.value === "none" ? "ordered" : "none";
        dither.dispatchEvent(new Event("change", { bubbles: true }));
        updateDitherButtonState();
      });
    }
    setActiveToneControl("brightness");
    updateDitherButtonState();
    updateFillEmptyModeUI();

    function updateCollapsibleToggleState(groupId, btnId, stateId) {
      const group = $(groupId);
      const btn = $(btnId);
      const state = $(stateId);
      if (!group || !btn || !state) return;
      const open = group.classList.contains("toggle-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      state.textContent = open ? "收起 ▲" : "展开 ▼";
    }
    function bindCollapsibleToggle(groupId, btnId, stateId) {
      const btn = $(btnId);
      const group = $(groupId);
      if (!btn || !group) return;
      btn.addEventListener("click", () => {
        group.classList.toggle("toggle-open");
        updateCollapsibleToggleState(groupId, btnId, stateId);
      });
      updateCollapsibleToggleState(groupId, btnId, stateId);
    }
    bindCollapsibleToggle("editToolsControlGroup", "editToolsToggleBtn", "editToolsToggleState");
    bindCollapsibleToggle("sameColorControlGroup", "sameColorToggleBtn", "sameColorToggleState");

    function setActiveToolPanel(name) {
      const controlFloat = document.querySelector(".control-panel-float");
      if (controlFloat) controlFloat.classList.toggle("style-panel-compact", name === "style");
      document.querySelectorAll(".tool-tab").forEach(btn => {
        const active = btn.dataset.tool === name;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        if (active) btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      });
      document.querySelectorAll(".tool-panel").forEach(panel => {
        panel.classList.toggle("active", panel.dataset.panel === name);
      });
      if (name === "draw") {
        if (fillEmptyModeActive) setFillEmptyMode(false);
        // 进入“绘制”面板时默认保持画笔/橡皮，不自动进入取色；只有点取色笔才切换为取色。
        setTool(activeTool === "erase" ? "erase" : "paint");
        if (lastPatternData) setPreviewEditMode(true);
      } else if (name === "same") {
        if (lastPatternData) {
          setPreviewEditMode(true);
          setTool("pick");
          showToast("已进入取色状态，请点击图纸中的颜色");
        }
      } else {
        if (operationControlsActive) setOperationControlsActive(false);
        if (fillEmptyModeActive) setFillEmptyMode(false);
      }
      scheduleResponsivePreviewLayout(false);
    }
    document.querySelectorAll(".tool-tab").forEach(btn => {
      btn.addEventListener("click", () => setActiveToolPanel(btn.dataset.tool));
    });
    setActiveToolPanel("spec");
    document.querySelectorAll(".style-preset-btn[data-style-preset]").forEach(btn => {
      btn.addEventListener("click", () => applyStylePreset(btn.dataset.stylePreset));
    });
    updateStylePresetUI("original");

    $("resetToneBtn").addEventListener("click", () => {
      if (sourceImage && !confirmInvalidatingAdjustments("重置调色")) return;
      ["brightnessRange", "contrastRange", "saturationRange", "temperatureRange"].forEach(id => $(id).value = 0);
      const dither = $("ditherMode");
      if (dither) dither.value = "none";
      updateToneLabels();
      updateDitherButtonState();
      if (sourceImage) generatePattern({ skipInvalidatingConfirm: true, reason: "重置调色" });
      else rememberSafeInvalidatingControlValues();
    });

    const convertBtn = $("convertBtn");
    if (convertBtn) convertBtn.addEventListener("click", () => generatePattern({ reason: "重新生成图纸" }));
    const openEditorBtn = $("openEditorBtn");
    if (openEditorBtn) openEditorBtn.addEventListener("click", () => switchTab("editor"));
    const tabPreviewBtn = $("tabPreview");
    const tabEditorBtn = $("tabEditor");
    if (tabPreviewBtn) tabPreviewBtn.addEventListener("click", () => switchTab("preview"));
    if (tabEditorBtn) tabEditorBtn.addEventListener("click", () => switchTab("editor"));
    const previewEditModeBtn = $("previewEditModeBtn");
    if (previewEditModeBtn) previewEditModeBtn.addEventListener("click", () => setPreviewEditMode(!previewEditModeActive));
    $("toolPaint").addEventListener("click", () => setTool("paint"));
    $("toolErase").addEventListener("click", () => setTool("erase"));
    $("toolPick").addEventListener("click", () => {
      if (lastPatternData) setPreviewEditMode(true);
      setTool("pick");
      showToast("已进入取色状态，请点击图纸中的颜色");
    });
    const operationToggleBtn = $("operationToggleBtn");
    if (operationToggleBtn) operationToggleBtn.addEventListener("click", toggleOperationControls);
    [["operationMoveUpBtn", 0, -1], ["operationMoveLeftBtn", -1, 0], ["operationMoveRightBtn", 1, 0], ["operationMoveDownBtn", 0, 1]].forEach(([id, dx, dy]) => {
      const btn = $(id);
      if (btn) btn.addEventListener("click", evt => { evt.preventDefault(); moveOperationCursor(dx, dy); });
    });
    const operationApplyBtn = $("operationApplyBtn");
    if (operationApplyBtn) operationApplyBtn.addEventListener("click", evt => { evt.preventDefault(); applyOperationAtCursor(); });
    $("drawSizeSlider").addEventListener("input", () => {
      const size = parseInt($("drawSizeSlider").value, 10) || 1;
      if (activeTool === "erase") eraseBrushSize = size;
      else paintBrushSize = size;
      updateBrushSizeUI();
      updateOperationControlsUI();
    });
    updateBrushSizeUI();
    updateEditMardColorBall(selectedColor);
    $("editColor").addEventListener("change", () => {
      selectedColor = normalizeColor($("editColor").value);
      updateColorSelectPreview("editColor");
      if (lastPatternData) selectedPaletteIndex = ensureColorInPalette(selectedColor);
      updateSelectedColorUI();
      renderPalettes();
    });
    $("replaceColor").addEventListener("change", () => updateColorSelectPreview("replaceColor"));
    $("outlineColor").addEventListener("change", () => updateColorSelectPreview("outlineColor"));
    function bindFreeColorPicker(selectId, onChange) {
      const picker = $(`${selectId}Picker`);
      if (!picker) return;
      picker.addEventListener("input", () => {
        const color = normalizeColor(picker.value);
        setColorSelectValue(selectId, color);
        if (onChange) onChange(color);
      });
    }
    bindFreeColorPicker("editColor", color => {
      selectedColor = color;
      if (lastPatternData) selectedPaletteIndex = ensureColorInPalette(selectedColor);
      updateSelectedColorUI();
      renderPalettes();
    });
    const editColorBall = $("editColorPicker");
    if (editColorBall) {
      editColorBall.addEventListener("click", evt => {
        evt.preventDefault();
        evt.stopPropagation();
        const panel = $("mardColorPickerPanel");
        setMardPickerOpen(!(panel && panel.classList.contains("open")));
      });
    }
    const mardPanel = $("mardColorPickerPanel");
    if (mardPanel) {
      mardPanel.addEventListener("click", evt => evt.stopPropagation());
      document.addEventListener("click", evt => {
        if (!mardPanel.classList.contains("open")) return;
        if (evt.target && (evt.target.closest("#mardColorPickerPanel") || evt.target.closest("#editColorPicker"))) return;
        setMardPickerOpen(false);
      });
    }
    $("fillColor")?.addEventListener("change", () => updateColorSelectPreview("fillColor"));
    bindFreeColorPicker("replaceColor");
    bindFreeColorPicker("fillColor");
    bindFreeColorPicker("outlineColor");
    const editorZoomSlider = $("editorZoom");
    if (editorZoomSlider) editorZoomSlider.addEventListener("input", () => setEditorZoom(parseInt(editorZoomSlider.value, 10), true));
    function bindOriginalCompareButton(id) {
      const btn = $(id);
      if (!btn) return;
      const stopCompareOriginal = () => setOriginalCompareActive(false);
      btn.addEventListener("mousedown", evt => { if (evt.button !== 0) return; evt.preventDefault(); setOriginalCompareActive(true); });
      btn.addEventListener("mouseup", stopCompareOriginal);
      btn.addEventListener("mouseleave", stopCompareOriginal);
      btn.addEventListener("touchstart", evt => { evt.preventDefault(); setOriginalCompareActive(true); }, { passive: false });
      btn.addEventListener("touchend", stopCompareOriginal);
      btn.addEventListener("touchcancel", stopCompareOriginal);
    }
    const toggleOriginalBaseBtn = $("toggleOriginalBaseBtn");
    if (toggleOriginalBaseBtn) toggleOriginalBaseBtn.addEventListener("click", toggleOriginalBase);
    const previewToggleOriginalBaseBtn = $("previewToggleOriginalBaseBtn");
    if (previewToggleOriginalBaseBtn) previewToggleOriginalBaseBtn.addEventListener("click", toggleOriginalBase);
    const showOriginalBaseInline = $("showOriginalBaseInline");
    if (showOriginalBaseInline) showOriginalBaseInline.addEventListener("change", () => {
      if (!lastPatternData || !sourceImage) {
        showOriginalBaseInline.checked = false;
        return;
      }
      if (!!showOriginalBase !== !!showOriginalBaseInline.checked) toggleOriginalBase();
    });
    bindOriginalCompareButton("compareOriginalBtn");
    bindOriginalCompareButton("previewCompareOriginalBtn");
    function bindOpacityRange(id, type) {
      const range = $(id);
      if (!range) return;
      range.addEventListener("input", () => {
        const value = parseInt(range.value, 10);
        if (type === "base") originalBaseTransparency = value;
        else patternTransparency = value;
        updateOpacityControlsUI();
        updatePreviewReferenceLayer();
        updateEditorReferenceLayer();
      });
    }
    bindOpacityRange("previewBaseOpacityRange", "base");
    bindOpacityRange("baseOpacityRange", "base");
    bindOpacityRange("previewPatternOpacityRange", "pattern");
    bindOpacityRange("patternOpacityRange", "pattern");
    const undoBtn = $("undoBtn");
    const redoBtn = $("redoBtn");
    if (undoBtn) undoBtn.addEventListener("click", undo);
    if (redoBtn) redoBtn.addEventListener("click", redo);
    $("previewUndoBtn").addEventListener("click", undo);
    $("previewRedoBtn").addEventListener("click", redo);
    $("deleteColorBtn").addEventListener("click", deleteSelectedColor);
    $("replaceColorBtn").addEventListener("click", replaceSelectedColor);
    $("fillTransparentBtn").addEventListener("click", () => {
      if (!lastPatternData) return;
      const next = !fillEmptyModeActive;
      setFillEmptyMode(next);
      showToast(next ? "请点击一块空豆区域进行填充" : "已取消填充空豆");
    });
    function syncOutlineModeUI(mode) {
      mode = mode === "add" ? "add" : "replace";
      const select = $("outlineMode");
      if (select) select.value = mode;
      const note = $("outlineModeNote");
      if (note) note.textContent = mode === "replace"
        ? "替换模式：厚度从图案外侧向内计算。"
        : "新增模式：描边会加在图案外侧，不覆盖原图。";
    }
    const outlineModeSelect = $("outlineMode");
    if (outlineModeSelect) outlineModeSelect.addEventListener("change", () => syncOutlineModeUI(outlineModeSelect.value));
    $("outlineThickness").addEventListener("input", () => { $("outlineThicknessValue").textContent = $("outlineThickness").value; });
    syncOutlineModeUI($("outlineMode")?.value || "replace");
    $("applyOutlineBtn").addEventListener("click", applyOutline);

    bindTouchPanAndPinch(patternWrap, () => previewZoom, setPreviewZoom, "grab", () => patternCanvas);

    patternWrap.addEventListener("wheel", evt => {
      if (!lastPatternData) return;
      evt.preventDefault();
      evt.stopPropagation();
      const factor = evt.deltaY < 0 ? 1.12 : 1 / 1.12;
      setPreviewZoom(previewZoom * factor, evt);
    }, { passive: false });
    patternWrap.addEventListener("mousedown", evt => {
      if (previewEditModeActive) return;
      if (!lastPatternData || evt.button !== 0) return;
      isPreviewPanning = true;
      previewPanStartX = evt.clientX;
      previewPanStartY = evt.clientY;
      previewPanStartScrollLeft = patternWrap.scrollLeft;
      previewPanStartScrollTop = patternWrap.scrollTop;
      patternWrap.style.cursor = "grabbing";
      evt.preventDefault();
    });
    patternWrap.addEventListener("mousemove", evt => {
      if (!isPreviewPanning) return;
      patternWrap.scrollLeft = previewPanStartScrollLeft - (evt.clientX - previewPanStartX);
      patternWrap.scrollTop = previewPanStartScrollTop - (evt.clientY - previewPanStartY);
    });
    patternWrap.addEventListener("mouseleave", () => {
      if (isPreviewPanning) {
        isPreviewPanning = false;
        patternWrap.style.cursor = "grab";
      }
    });

    bindEditorTouchControls();

    patternCanvas.addEventListener("contextmenu", evt => { if (previewEditModeActive) evt.preventDefault(); });
    patternCanvas.addEventListener("mousedown", evt => {
      if (!previewEditModeActive || !lastPatternData) return;
      if (evt.button === 2) {
        isPanning = true;
        panStartX = evt.clientX;
        panStartY = evt.clientY;
        panStartScrollLeft = patternWrap.scrollLeft;
        panStartScrollTop = patternWrap.scrollTop;
        patternWrap.style.cursor = "grabbing";
        evt.preventDefault();
        return;
      }
      if (evt.button !== 0) return;
      if (operationControlsActive) {
        const cell = getEditorCellFromEvent(evt);
        if (cell) setOperationCursor(cell, false);
        evt.preventDefault();
        return;
      }
      isDrawing = true;
      lastPaintKey = "";
      if (activeTool !== "pick") pushHistory();
      handleEditorAction(evt);
      evt.preventDefault();
    });
    patternCanvas.addEventListener("mousemove", evt => {
      if (!previewEditModeActive) return;
      if (isPanning) {
        patternWrap.scrollLeft = panStartScrollLeft - (evt.clientX - panStartX);
        patternWrap.scrollTop = panStartScrollTop - (evt.clientY - panStartY);
        return;
      }
      if (operationControlsActive) {
        updateOperationCursorInfo();
        return;
      }
      if (!isDrawing) {
        const cell = getEditorCellFromEvent(evt);
        const modeText = $("renderMode").value === "squares" ? "方格" : "圆珠";
        const patternInfoEl = $("patternInfo");
        if (patternInfoEl) patternInfoEl.textContent = cell && lastPatternData
          ? `${lastPatternData.width} × ${lastPatternData.height}，${modeText}显示，格子 ${cell.x + 1}, ${cell.y + 1}，缩放 ${previewZoom.toFixed(2)}x`
          : lastPatternData ? `${lastPatternData.width} × ${lastPatternData.height}，${modeText}显示，缩放 ${previewZoom.toFixed(2)}x` : "等待生成";
        return;
      }
      handleEditorAction(evt);
    });
    window.addEventListener("mouseup", () => {
      setOriginalCompareActive(false);
      if (isPreviewPanning) { isPreviewPanning = false; patternWrap.style.cursor = operationControlsActive ? "default" : (previewEditModeActive ? "crosshair" : "grab"); }
      if (isExportPreviewPanning) { isExportPreviewPanning = false; exportPreviewWrap.style.cursor = "grab"; }
      if (isPanning) { isPanning = false; patternWrap.style.cursor = operationControlsActive ? "default" : (previewEditModeActive ? "crosshair" : "grab"); }
      if (isDrawing) { isDrawing = false; lastPaintKey = ""; cleanupPalette(false); refreshAllViews(); }
    });
    window.addEventListener("blur", () => setOriginalCompareActive(false));
    window.addEventListener("resize", () => {
      if (lastPatternData) scheduleResponsivePreviewLayout(!userAdjustedZoom);
      else updateResponsivePreviewLayout();
    });
    window.addEventListener("keydown", evt => {
      const isTyping = evt.target && ["TEXTAREA", "INPUT", "SELECT"].includes(evt.target.tagName);
      if ((evt.ctrlKey || evt.metaKey) && ["+", "=", "-", "0"].includes(evt.key) && previewEditModeActive) {
        evt.preventDefault();
        if (evt.key === "+" || evt.key === "=") setPreviewZoom(previewZoom * 1.12);
        if (evt.key === "-") setPreviewZoom(previewZoom / 1.12);
        if (evt.key === "0") fitPreviewZoomToOriginalSize();
        return;
      }
      if (isTyping) return;
      if (operationControlsActive && lastPatternData) {
        const key = evt.key;
        if (key === "ArrowUp") { evt.preventDefault(); moveOperationCursor(0, -1); return; }
        if (key === "ArrowDown") { evt.preventDefault(); moveOperationCursor(0, 1); return; }
        if (key === "ArrowLeft") { evt.preventDefault(); moveOperationCursor(-1, 0); return; }
        if (key === "ArrowRight") { evt.preventDefault(); moveOperationCursor(1, 0); return; }
        if (key === " " || key === "Enter") { evt.preventDefault(); applyOperationAtCursor(); return; }
      }
      if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === "z") { evt.preventDefault(); undo(); }
      else if ((evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === "y") { evt.preventDefault(); redo(); }
      else if (evt.key.toLowerCase() === "b") setTool("paint");
      else if (evt.key.toLowerCase() === "e") setTool("erase");
      else if (evt.key.toLowerCase() === "i") setTool("pick");
    });

    $("beadWidthValue").textContent = $("beadWidth").value;
    $("customColorsValue").textContent = $("customColors").value;
    $("outlineThicknessValue").textContent = $("outlineThickness").value;
    syncOutlineModeUI("replace");
    $("customColorGroup").style.display = $("paletteMode").value === "custom" ? "block" : "none";
    updateToneLabels();
    updateEditableColorSelectors();
    setColorSelectValue("outlineColor", "#000000");
    setButtonsEnabled(false);
    rememberSafeInvalidatingControlValues();
    updateOperationControlsUI();
    updateSelectedColorUI();
  

    // 本次调整：让“规格”和“调色”右侧数字可点击，直接输入整数后同步滑条。

}

  global.AppPage = {
    createContext,
    init,
    initSliderProgressZeroFix
  };
})(window);
