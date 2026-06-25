"use strict";

const Util = (() => {
  /**
   * Generate an indented list of links from a nav. Meant for use with panel().
   * @param {HTMLElement} element Target nav element.
   * @return {string} HTML string.
   */
  const navList = (element) => {
    if (!element) return "";

    const links = element.querySelectorAll("a");
    const htmlArray = [];

    links.forEach((a) => {
      let indent = 0;
      let current = a.parentElement;

      // Calculate indent depth by counting the number of parent li elements.
      while (current && current !== element) {
        if (current.tagName.toLowerCase() === "li") {
          indent++;
        }
        current = current.parentElement;
      }
      indent = Math.max(0, indent - 1);

      const href = a.getAttribute("href");
      const target = a.getAttribute("target");

      let html = `<a class="link depth-${indent}"`;
      if (target) html += ` target="${target}"`;
      if (href) html += ` href="${href}"`;
      html += `><span class="indent-${indent}"></span>${a.textContent}</a>`;

      htmlArray.push(html);
    });

    return htmlArray.join("");
  };

  /**
   * Panel-ify an element.
   * @param {HTMLElement|NodeList|string} elements Target element(s) or selector.
   * @param {object} userConfig User config.
   */
  const panel = (elements, userConfig = {}) => {
    const els =
      typeof elements === "string"
        ? document.querySelectorAll(elements)
        : elements instanceof NodeList || Array.isArray(elements)
          ? elements
          : [elements];

    // No elements? Bail.
    if (!els || els.length === 0) return;

    els.forEach((el) => {
      const id = el.id;

      // Merge with default config.
      const config = Object.assign(
        {
          delay: 0,
          hideOnClick: false,
          hideOnEscape: false,
          hideOnSwipe: false,
          resetScroll: false,
          resetForms: false,
          side: null,
          target: el,
          visibleClass: "visible",
        },
        userConfig,
      );

      const targetEl =
        typeof config.target === "string"
          ? document.querySelector(config.target)
          : config.target;

      if (!targetEl) return;

      // Hide panel function.
      const _hide = (event) => {
        // Already hidden? Bail.
        if (!targetEl.classList.contains(config.visibleClass)) return;

        // If an event was provided, cancel it.
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        // Hide.
        targetEl.classList.remove(config.visibleClass);

        // Post-hide stuff.
        window.setTimeout(() => {
          // Reset scroll position.
          if (config.resetScroll) el.scrollTop = 0;

          // Reset forms.
          if (config.resetForms) {
            el.querySelectorAll("form").forEach((form) => form.reset());
          }
        }, config.delay);
      };

      // Vendor fixes.
      el.style.msOverflowStyle = "-ms-autohiding-scrollbar";
      el.style.webkitOverflowScrolling = "touch";

      // Hide on click.
      if (config.hideOnClick) {
        el.querySelectorAll("a").forEach((a) => {
          a.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        });

        el.addEventListener("click", (event) => {
          const a = event.target.closest("a");
          if (!a) return;

          const href = a.getAttribute("href");
          const target = a.getAttribute("target");

          if (!href || href === "#" || href === "" || href === `#${id}`) return;

          // Cancel original event.
          event.preventDefault();
          event.stopPropagation();

          // Hide panel.
          _hide();

          // Redirect to href.
          window.setTimeout(() => {
            if (target === "_blank") window.open(href);
            else window.location.href = href;
          }, config.delay + 10);
        });
      }

      // Event: Touch stuff.
      let touchPosX = null;
      let touchPosY = null;

      el.addEventListener("touchstart", (event) => {
        touchPosX = event.touches[0].pageX;
        touchPosY = event.touches[0].pageY;
      });

      el.addEventListener("touchmove", (event) => {
        if (touchPosX === null || touchPosY === null) return;

        const diffX = touchPosX - event.touches[0].pageX;
        const diffY = touchPosY - event.touches[0].pageY;
        const th = el.offsetHeight;
        const ts = el.scrollHeight - el.scrollTop;

        // Hide on swipe?
        if (config.hideOnSwipe) {
          let result = false;
          const boundary = 20;
          const delta = 50;

          switch (config.side) {
            case "left":
              result = diffY < boundary && diffY > -boundary && diffX > delta;
              break;
            case "right":
              result = diffY < boundary && diffY > -boundary && diffX < -delta;
              break;
            case "top":
              result = diffX < boundary && diffX > -boundary && diffY > delta;
              break;
            case "bottom":
              result = diffX < boundary && diffX > -boundary && diffY < -delta;
              break;
          }

          if (result) {
            touchPosX = null;
            touchPosY = null;
            _hide();
            return;
          }
        }

        // Prevent vertical scrolling past the top or bottom.
        if (
          (el.scrollTop < 0 && diffY < 0) ||
          (ts > th - 2 && ts < th + 2 && diffY > 0)
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      // Event: Prevent certain events inside the panel from bubbling.
      ["click", "touchend", "touchstart", "touchmove"].forEach((evt) => {
        el.addEventListener(evt, (e) => e.stopPropagation());
      });

      // Event: Hide panel if a child anchor tag pointing to its ID is clicked.
      el.addEventListener("click", (event) => {
        const a = event.target.closest(`a[href="#${id}"]`);
        if (a) {
          event.preventDefault();
          event.stopPropagation();
          targetEl.classList.remove(config.visibleClass);
        }
      });

      // Body Events.

      // Event: Hide panel on body click/tap.
      const hideOnBodyInteraction = (event) => _hide(event);
      document.body.addEventListener("click", hideOnBodyInteraction);
      document.body.addEventListener("touchend", hideOnBodyInteraction);

      // Event: Toggle.
      document.body.addEventListener("click", (event) => {
        const a = event.target.closest(`a[href="#${id}"]`);
        if (a) {
          event.preventDefault();
          event.stopPropagation();
          targetEl.classList.toggle(config.visibleClass);
        }
      });

      // Window Events.

      // Event: Hide on ESC.
      if (config.hideOnEscape) {
        window.addEventListener("keydown", (event) => {
          if (event.key === "Escape" || event.keyCode === 27) {
            _hide(event);
          }
        });
      }
    });
  };

  /**
   * Apply "placeholder" attribute polyfill to one or more forms.
   * @param {HTMLElement|NodeList|string} elements Target form element(s).
   */
  const placeholder = (elements) => {
    // Browser natively supports placeholders? Bail.
    if ("placeholder" in document.createElement("input")) return;

    const els =
      typeof elements === "string"
        ? document.querySelectorAll(elements)
        : elements instanceof NodeList || Array.isArray(elements)
          ? elements
          : [elements];

    // No elements? Bail.
    if (!els || els.length === 0) return;

    els.forEach((formEl) => {
      // Text, TextArea.
      formEl.querySelectorAll('input[type="text"], textarea').forEach((i) => {
        if (i.value === "" || i.value === i.getAttribute("placeholder")) {
          i.classList.add("polyfill-placeholder");
          i.value = i.getAttribute("placeholder");
        }

        i.addEventListener("blur", () => {
          if (i.name && i.name.match(/-polyfill-field$/)) return;
          if (i.value === "") {
            i.classList.add("polyfill-placeholder");
            i.value = i.getAttribute("placeholder");
          }
        });

        i.addEventListener("focus", () => {
          if (i.name && i.name.match(/-polyfill-field$/)) return;
          if (i.value === i.getAttribute("placeholder")) {
            i.classList.remove("polyfill-placeholder");
            i.value = "";
          }
        });
      });

      // Password.
      formEl.querySelectorAll('input[type="password"]').forEach((i) => {
        const x = document.createElement("input");
        x.type = "text";
        if (i.id) x.id = `${i.id}-polyfill-field`;
        if (i.name) x.name = `${i.name}-polyfill-field`;
        x.className = i.className;
        x.classList.add("polyfill-placeholder");
        x.value = i.getAttribute("placeholder");

        i.parentNode.insertBefore(x, i.nextSibling);

        if (i.value === "") {
          i.style.display = "none";
        } else {
          x.style.display = "none";
        }

        i.addEventListener("blur", (event) => {
          event.preventDefault();
          if (i.value === "") {
            i.style.display = "none";
            x.style.display = "";
          }
        });

        x.addEventListener("focus", (event) => {
          event.preventDefault();
          x.style.display = "none";
          i.style.display = "";
          i.focus();
        });

        x.addEventListener("keypress", (event) => {
          event.preventDefault();
          x.value = "";
        });
      });

      // Event: Submit.
      formEl.addEventListener("submit", () => {
        formEl
          .querySelectorAll(
            'input[type="text"], input[type="password"], textarea',
          )
          .forEach((i) => {
            if (i.name && i.name.match(/-polyfill-field$/)) {
              i.name = "";
            }
            if (i.value === i.getAttribute("placeholder")) {
              i.classList.remove("polyfill-placeholder");
              i.value = "";
            }
          });
      });

      // Event: Reset.
      formEl.addEventListener("reset", (event) => {
        event.preventDefault();

        formEl.querySelectorAll("select").forEach((select) => {
          select.value = select.options[0].value;
        });

        formEl.querySelectorAll("input, textarea").forEach((i) => {
          i.classList.remove("polyfill-placeholder");

          switch (i.type) {
            case "submit":
            case "reset":
              break;
            case "password":
              i.value = i.defaultValue;
              const x = i.parentNode.querySelector(
                `input[name="${i.name}-polyfill-field"]`,
              );
              if (x) {
                if (i.value === "") {
                  i.style.display = "none";
                  x.style.display = "";
                } else {
                  i.style.display = "";
                  x.style.display = "none";
                }
              }
              break;
            case "checkbox":
            case "radio":
              i.checked = i.defaultChecked;
              break;
            case "text":
            case "textarea":
              i.value = i.defaultValue;
              if (i.value === "") {
                i.classList.add("polyfill-placeholder");
                i.value = i.getAttribute("placeholder");
              }
              break;
            default:
              i.value = i.defaultValue;
              break;
          }
        });
      });
    });
  };

  /**
   * WeakMap to keep track of moved elements for priority toggling.
   */
  const prioritizeMap = new WeakMap();

  /**
   * Moves elements to/from the first positions of their respective parents.
   * @param {HTMLElement|NodeList|string} elements Elements (or selector) to move.
   * @param {boolean} condition If true, moves elements to the top. Otherwise, moves elements back to their original locations.
   */
  const prioritize = (elements, condition) => {
    const els =
      typeof elements === "string"
        ? document.querySelectorAll(elements)
        : elements instanceof NodeList || Array.isArray(elements)
          ? elements
          : [elements];

    if (!els || els.length === 0) return;

    // Step through elements.
    els.forEach((e) => {
      const parent = e.parentElement;

      // No parent? Bail.
      if (!parent) return;

      const movedRef = prioritizeMap.get(e);

      // Not moved? Move it.
      if (!movedRef) {
        // Condition is false? Bail.
        if (!condition) return;

        // Get placeholder (which will serve as our point of reference for when this element needs to move back).
        const prevSibling = e.previousElementSibling;

        // Couldn't find anything? Means this element's already at the top, so bail.
        if (!prevSibling) return;

        // Move element to top of parent.
        parent.prepend(e);

        // Mark element as moved.
        prioritizeMap.set(e, prevSibling);
      }
      // Moved already?
      else {
        // Condition is true? Bail.
        if (condition) return;

        // Move element back to its original location (using our placeholder).
        movedRef.after(e);

        // Unmark element as moved.
        prioritizeMap.delete(e);
      }
    });
  };

  // Return object for external access.
  return {
    navList,
    panel,
    placeholder,
    prioritize,
  };
})();
