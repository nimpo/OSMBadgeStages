// ==UserScript==
// @name         Show Level Overlay on Staged Badges in OSM
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Overlay level number on images whose alt ends with " - Lvl X"
// @match        *://www.onlinescoutmanager.co.uk/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function processImage(img) {
        if (img.dataset.levelProcessed) return; // avoid double-processing

        const alt = img.alt || "";
        const match = alt.match(/ - Lvl (\d+)$/);
        if (!match) return;

        const level = match[1];
        let displayText = level;

        // Custom staged membership mapping for 23rd Manchester Staged version of Membership badge.
        if (alt.includes("Membership Badge (Section Staged)")) {
          const stagedMap = {
            1: "Squirrel",
            2: "Beaver",
            3: "Cub",
            4: "Scout",
            5: "Explorer",
            6: "Network",
            7: "Adult"
          };
          displayText = stagedMap[level] || level;
        }

        // mark as processed
        img.dataset.levelProcessed = "true";

        // ensure parent is positioned
        const wrapper = img.parentElement;
        if (!wrapper) return;

        if (getComputedStyle(wrapper).position === "static") {
            wrapper.style.position = "relative";
        }

        // create overlay
        const badge = document.createElement("div");
        badge.textContent = displayText;
        badge.style.position = "absolute";
        badge.style.bottom = "2px";
        badge.style.right = "2px";
        badge.style.background = "rgba(0, 0, 0, 0.6)";
        badge.style.color = "white";
        badge.style.padding = "2px 4px";
        badge.style.fontSize = "12px";
        badge.style.fontFamily = "Arial, sans-serif";
        badge.style.borderRadius = "3px";
        badge.style.pointerEvents = "none";
        badge.style.zIndex = "9999";

        wrapper.appendChild(badge);
    }

    function scan() {
        document.querySelectorAll('img[alt$="Lvl 1"], img[alt$="Lvl 2"], img[alt$="Lvl 3"], img[alt*=" - Lvl "]').forEach(processImage);
    }

    // Run once immediately
    scan();

    // Watch for dynamically added images
    const observer = new MutationObserver(() => scan());
    observer.observe(document.body, { childList: true, subtree: true });
})();