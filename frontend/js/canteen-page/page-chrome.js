// Small pieces of page behaviour that are not about the vendor list.

// Phone: the data notice sits behind an (i) button.
export function setupNoticeToggle({ toggle, popover }) {
  const setOpen = open => {
    popover.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => {
    setOpen(popover.hidden);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
}

// The sticky filter bar sits right below the sticky page header, so
// measure the header instead of guessing its height.
export function trackHeaderHeight(header) {
  const update = () => {
    document.documentElement.style.setProperty(
      "--canteen-header-height",
      `${header.offsetHeight}px`
    );
  };

  update();

  new ResizeObserver(update).observe(header);
}
