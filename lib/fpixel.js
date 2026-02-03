export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

/**
 * Track Page Views
 * Standard function to tell Facebook which page the user is on.
 */
export const pageview = () => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};

/**
 * Track Standard & Custom Events
 * @param {string} name - The name of the event (e.g., 'Purchase', 'Lead')
 * @param {object} options - Extra data like value, currency, or content_name
 */
export const event = (name, options = {}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, options);
  } else {
    // Optional: Log to console in development so you know it *would* have fired
    if (process.env.NODE_ENV === 'development') {
      console.log(`[FB_PIXEL] Event "${name}" triggered with:`, options);
    }
  }
};