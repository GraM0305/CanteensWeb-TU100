import { createElement } from "./dom.js";

// Square photo area shown at the top of each vendor card. Vendors without a
// photo (or whose photo fails to load) get a neutral placeholder so every
// card keeps the same height. Only DOM properties are used, never innerHTML.
export function createVendorMedia(vendor) {
  const media = createElement("div", "vendor-card__media");

  const showPlaceholder = () => {
    const icon = createElement("span", "vendor-card__placeholder", "🍽️");

    icon.setAttribute("aria-hidden", "true");
    media.classList.add("vendor-card__media--empty");
    media.replaceChildren(icon);
  };

  if (!vendor.image_url) {
    showPlaceholder();
    return media;
  }

  const image = document.createElement("img");

  image.className = "vendor-card__image";
  image.alt = `หน้าร้าน ${vendor.name}`;
  image.width = 800;
  image.height = 800;
  image.loading = "lazy";
  image.decoding = "async";

  image.addEventListener("load", () => {
    media.classList.add("vendor-card__media--loaded");
  });
  image.addEventListener("error", showPlaceholder);

  image.src = vendor.image_url;
  media.append(image);

  return media;
}
