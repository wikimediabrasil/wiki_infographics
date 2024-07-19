/**
 * Utility function to format URLs for display in DataTables.
 * @param {string} url - The URL to be formatted.
 * @returns {string} The formatted URL as an HTML link.
 */

export function formatURL(url) {
  let formattedText;
  if (url.includes('wikidata.org')) {
    const id = url.split('/').pop();
    formattedText = `wd:${id}`;
  } else if (url.includes('commons.wikimedia.org')) {
    const fileName = url.split('/').pop().replace(/%20/g, ' ');
    formattedText = `commons:${fileName}`;
  } else {
    formattedText = url;
  }
  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${formattedText}</a>`;
}
