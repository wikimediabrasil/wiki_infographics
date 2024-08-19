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


/**
 * Formats an ISO date string into a human-readable format.
 *
 * Converts a date string in the ISO 8601 format (e.g., "1872-01-01T00:00:00Z") 
 * into a more readable format (e.g., "1 January 1872").
 *
 * @param {string} dateString - The ISO date string to format.
 * @returns {string} - The formatted date string in the form "1 August 2000".
 *
 * @example
 * formatDate("1872-01-01T00:00:00Z");
 * // returns "1 January 1872"
 */
export function formatDate(dateString) {
  const date = new Date(dateString);

  const options = { day: 'numeric', month: 'long', year: 'numeric' };

  // Format the date using the specified options and return the formatted date string
  return date.toLocaleDateString('en-US', options);
}


/**
 * Downloads data as a CSV file
 * 
 * @param {Object} data - The data object containing `columns` (array) and `data` (array of objects)
 * 
 * @example
 * const data = {
 *   columns: ['state', 'capitalLabel', 'population', 'year'],
 *   data: [
 *     { state: 'http://www.wikidata.org/entity/Q43783', capitalLabel: 'Aracaju', population: '461534', year: '2000' },
 *     { state: 'http://www.wikidata.org/entity/Q43783', capitalLabel: 'Aracaju', population: '571149', year: '2010' },
 *     { state: 'http://www.wikidata.org/entity/Q43783', capitalLabel: 'Aracaju', population: '632744', year: '2020' }
 *   ]
 * };
 * downloadCSV(data);
 */
export function downloadCSV(data) {
  try {
    const columns = data.columns;
    const rows = data.data;

    // Create CSV string
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += columns.join(",") + "\n";

    rows.forEach(row => {
      let rowContent = columns.map(col => row[col] || '').join(",");
      csvContent += rowContent + "\n";
    });

    // Encode URI and create a link to trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("An error occurred while downloading the CSV:", error);
    alert("An error occurred while trying to download the CSV. Please try again.");
  }
}
