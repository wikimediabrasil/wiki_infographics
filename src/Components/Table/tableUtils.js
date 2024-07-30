/**
 * Formats a URL to a specific text format.
 * @param {string} url - The URL to format.
 * @returns {string} The formatted text.
 */
export const formatURL = (url) => {
  if (url.startsWith("http://www.wikidata.org/entity/")) {
    const entityId = url.split("/").pop();
    return `wd:${entityId}`;
  } else if (url.startsWith("http://commons.wikimedia.org/wiki/Special:FilePath/")) {
    const fileName = url.split("/").pop().replace(/%20/g, " ");
    return `commons:${fileName}`;
  } else {
    return url;
  }
};
