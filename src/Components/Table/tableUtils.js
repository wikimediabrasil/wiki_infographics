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
