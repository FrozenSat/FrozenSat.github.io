/*
    Future Imperfect by HTML5 UP
    html5up.net | @ajlkn
    Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

"use strict";

(() => {
  // Breakpoints.
  if (typeof breakpoints !== "undefined") {
    breakpoints({
      xlarge: ["1281px", "1680px"],
      large: ["981px", "1280px"],
      medium: ["737px", "980px"],
      small: ["481px", "736px"],
      xsmall: [null, "480px"],
    });
  }

  // Execute DOM manipulation after the DOM is fully loaded.
  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const menu = document.getElementById("menu");
    const sidebar = document.getElementById("sidebar");
    const main = document.getElementById("main");

    // Play initial animations on page load.
    window.addEventListener("load", () => {
      window.setTimeout(() => {
        body.classList.remove("is-preload");
      }, 100);
    });

    // Menu.
    if (menu) {
      // Append menu to body.
      body.appendChild(menu);

      // Initialize panel using the Util object.
      if (typeof Util !== "undefined" && typeof Util.panel === "function") {
        Util.panel(menu, {
          delay: 500,
          hideOnClick: true,
          hideOnSwipe: true,
          resetScroll: true,
          resetForms: true,
          side: "right",
          target: body,
          visibleClass: "is-menu-visible",
        });
      } else {
        console.warn("Util.panel not found. Please ensure util.js is loaded.");
      }
    }

    // Search (header).
    const search = document.getElementById("search");

    if (search) {
      const searchInput = search.querySelector("input");

      // Event delegation for the search toggle button.
      body.addEventListener("click", (event) => {
        const target = event.target.closest('[href="#search"]');
        if (target) {
          event.preventDefault();

          // Not visible?
          if (!search.classList.contains("visible")) {
            // Reset form.
            if (typeof search.reset === "function") {
              search.reset();
            }

            // Show.
            search.classList.add("visible");

            // Focus input.
            if (searchInput) {
              searchInput.focus();
            }
          }
        }
      });

      if (searchInput) {
        // Remove focus on ESC key press.
        searchInput.addEventListener("keydown", (event) => {
          if (event.key === "Escape" || event.keyCode === 27) {
            searchInput.blur();
          }
        });

        // Close search on blur.
        searchInput.addEventListener("blur", () => {
          window.setTimeout(() => {
            search.classList.remove("visible");
          }, 100);
        });
      }
    }

    // Intro.
    const intro = document.getElementById("intro");

    if (intro && typeof breakpoints !== "undefined") {
      // Move to main on <=large.
      breakpoints.on("<=large", () => {
        if (main) main.prepend(intro);
      });

      // Move back to sidebar on >large.
      breakpoints.on(">large", () => {
        if (sidebar) sidebar.prepend(intro);
      });
    }
  });
})();
