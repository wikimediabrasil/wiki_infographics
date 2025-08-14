/**
 * Parses error message to extract line and column numbers.
 * @param {string} errorMessage - The error message to parse.
 * @returns {object} - Contains lineNumber and columnNumber if parsing is successful.
 */
export const parseErrorMessage = (errorMessage) => {
  const match = errorMessage?.match(/line (\d+), column (\d+)/);
  if (match) {
    const lineNumber = parseInt(match[1], 10);
    const columnNumber = parseInt(match[2], 10);
    console.log(`Parsed error at line: ${lineNumber}, column: ${columnNumber}`);
    return { lineNumber, columnNumber };
  }
  return null;
};

/**
 * Marks error in the editor with decorations.
 * @param {object} editor - The editor instance.
 * @param {object} monaco - The monaco instance.
 * @param {array} decorations - Array to store current decorations.
 * @param {number} lineNumber - Line number where the error occurred.
 * @param {number} columnNumber - Column number where the error occurred.
 */
export const markErrorInEditor = (editor, monaco, decorationsRef, lineNumber, columnNumber) => {
  if (editor && monaco) {
    const totalLines = editor.getModel().getLineCount();
    const lineLength = editor.getModel().getLineLength(lineNumber);

    // Check if the error position is out of bounds
    if (lineNumber <= totalLines) {
      if (columnNumber <= lineLength && columnNumber > 0) {
        // Apply underline to the entire line
        const lineDecoration = {
          range: new monaco.Range(lineNumber, 1, lineNumber, lineLength + 1),
          options: {
            className: 'lineDecoration', // For underlining the line
            isWholeLine: true,
          }
        };

        // Apply background color to the specific column
        const columnDecoration = {
          range: new monaco.Range(lineNumber, columnNumber, lineNumber, columnNumber + 1),
          options: {
            className: 'columnDecoration', // For highlighting the column
            isWholeLine: false,
          }
        };

        // Apply both decorations
        const newDecorations = editor.deltaDecorations([], [lineDecoration, columnDecoration]);

        // Store the new decorations
        decorationsRef = newDecorations;
      } else if (columnNumber > 1) {
        // If columnNumber is out of bounds but greater than 1, highlight the previous column
        const adjustedColumnNumber = Math.max(columnNumber - 1, 1); // Avoid going below column 1

        const lineDecoration = {
          range: new monaco.Range(lineNumber, 1, lineNumber, lineLength + 1),
          options: {
            className: 'lineDecoration', // For underlining the line
            isWholeLine: true,
          }
        };

        const columnDecoration = {
          range: new monaco.Range(lineNumber, adjustedColumnNumber, lineNumber, adjustedColumnNumber + 1),
          options: {
            className: 'columnDecoration', // For highlighting the column
            isWholeLine: false,
          }
        };

        // Apply both decorations
        const newDecorations = editor.deltaDecorations([], [lineDecoration, columnDecoration]);

        // Store the new decorations
        decorationsRef = newDecorations;
      } else {
        console.log(`Error position out of bounds: line ${lineNumber}, column ${columnNumber}`);
      }
    } else {
      console.log(`Error line number out of bounds: line ${lineNumber}`);
    }
  }
};
