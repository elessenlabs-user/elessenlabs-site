export const BOOKINGS_URL =
  "https://outlook.office.com/book/ElessenLabs@pawzy.app/?ismsaljsauthenabled";

export function openBookingPopup(): void {
  if (typeof window === "undefined") {
    return;
  }

  const isMobile = window.matchMedia(
    "(max-width: 767px)",
  ).matches;

  /*
   * Mobile browsers generally ignore popup dimensions.
   * Open Microsoft Bookings in a full browser tab instead.
   */
  if (isMobile) {
    window.open(
      BOOKINGS_URL,
      "_blank",
      "noopener,noreferrer",
    );

    return;
  }

  const popupWidth = Math.min(
    980,
    window.screen.availWidth - 40,
  );

  const popupHeight = Math.min(
    820,
    window.screen.availHeight - 80,
  );

  const left =
    window.screenX +
    Math.max(
      0,
      (window.outerWidth - popupWidth) / 2,
    );

  const top =
    window.screenY +
    Math.max(
      0,
      (window.outerHeight - popupHeight) / 2,
    );

  const bookingWindow = window.open(
    BOOKINGS_URL,
    "elessen-booking",
    [
      "popup=yes",
      `width=${Math.round(popupWidth)}`,
      `height=${Math.round(popupHeight)}`,
      `left=${Math.round(left)}`,
      `top=${Math.round(top)}`,
      "scrollbars=yes",
      "resizable=yes",
    ].join(","),
  );

  if (bookingWindow) {
    bookingWindow.opener = null;
    bookingWindow.focus();
    return;
  }

  /*
   * Fallback when the browser blocks the popup.
   */
  window.open(
    BOOKINGS_URL,
    "_blank",
    "noopener,noreferrer",
  );
}