/**
 * Utility functions for handling Firebase Storage images
 */

/**
 * Converts a Firebase Storage URL to a public, token-free URL
 * @param {string} firebaseUrl - Original Firebase Storage URL
 * @returns {string} Clean URL without token for public access
 */
export function getPublicImageUrl(firebaseUrl) {
  if (!firebaseUrl) return "";

  try {
    // Remove any existing tokens from the URL
    let cleanUrl = firebaseUrl;

    // Remove token parameter if present
    if (cleanUrl.includes("&token=")) {
      cleanUrl = cleanUrl.split("&token=")[0];
    } else if (cleanUrl.includes("?token=")) {
      // If token is the first parameter, replace with alt=media
      cleanUrl = cleanUrl.split("?token=")[0] + "?alt=media";
    }

    // Ensure alt=media is present for proper image serving
    if (!cleanUrl.includes("alt=media")) {
      cleanUrl += cleanUrl.includes("?") ? "&alt=media" : "?alt=media";
    }

    return cleanUrl;
  } catch (error) {
    console.error("Error processing image URL:", error);
    return firebaseUrl; // Return original URL as fallback
  }
}

/**
 * Generates a cache-busted URL for forcing image reload
 * @param {string} imageUrl - Base image URL
 * @returns {string} URL with cache busting parameter
 */
export function getCacheBustedUrl(imageUrl) {
  const cleanUrl = getPublicImageUrl(imageUrl);
  const separator = cleanUrl.includes("?") ? "&" : "?";
  return `${cleanUrl}${separator}cb=${Date.now()}`;
}

/**
 * Validates if a URL is a Firebase Storage URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if it's a Firebase Storage URL
 */
export function isFirebaseStorageUrl(url) {
  return url && url.includes("firebasestorage.googleapis.com");
}

/**
 * Creates a dummy/placeholder image URL
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Text to display in placeholder
 * @returns {string} Data URL for placeholder image
 */
export function createPlaceholderImage(
  width = 300,
  height = 200,
  text = "Image not available"
) {
  return `data:image/svg+xml,%3Csvg width='${width}' height='${height}' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%2364748b' text-anchor='middle' dy='.3em'%3E${encodeURIComponent(
    text
  )}%3C/text%3E%3C/svg%3E`;
}

/**
 * Preloads an image to check if it's accessible
 * @param {string} imageUrl - URL to preload
 * @returns {Promise<boolean>} Promise that resolves to true if image loads successfully
 */
export function preloadImage(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}
