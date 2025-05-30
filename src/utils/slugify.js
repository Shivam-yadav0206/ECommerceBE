// customSlugify.js (or wherever you define the function)
function slugify(text) {
  return text
    .toString() // Convert to string if it's not already
    .normalize("NFD") // Normalize characters (important for accented characters)
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading and trailing spaces
    .replace(/[^a-z0-9 -]/g, "") // Remove non-alphanumeric characters except for space and hyphen
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace consecutive hyphens with a single hyphen
}

module.exports = slugify;
