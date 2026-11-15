// ลูกศรบอกผู้ใช้ว่าพื้นที่เลื่อนนี้ยังเลื่อนต่อได้ และหายไปเมื่อเลื่อนสุดแล้ว
const REMAINING_THRESHOLD = 4;

export function initScrollHint(scroller, host, direction = "vertical") {
  if (!scroller || !host) {
    return;
  }

  const vertical = direction === "vertical";
  const button = document.createElement("button");

  button.type = "button";
  button.className = `scroll-hint scroll-hint--${direction}`;
  button.textContent = vertical ? "⌄" : "›";
  button.setAttribute(
    "aria-label",
    vertical ? "เลื่อนลงเพื่อดูเพิ่มเติม" : "เลื่อนไปทางขวาเพื่อดูเพิ่มเติม"
  );
  button.hidden = true;
  host.append(button);

  const update = () => {
    const remaining = vertical
      ? scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
      : scroller.scrollWidth - scroller.scrollLeft - scroller.clientWidth;

    button.hidden = remaining <= REMAINING_THRESHOLD;
  };

  button.addEventListener("click", () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const distance =
      (vertical ? scroller.clientHeight : scroller.clientWidth) * 0.8;

    scroller.scrollBy({
      [vertical ? "top" : "left"]: distance,
      behavior: reduceMotion ? "auto" : "smooth"
    });
  });

  scroller.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  new ResizeObserver(update).observe(scroller);
  new MutationObserver(update).observe(scroller, {
    childList: true,
    subtree: true
  });
  update();
}
