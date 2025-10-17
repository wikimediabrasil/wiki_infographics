/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useContext } from "react";
import Editor from "@monaco-editor/react";
import { HiPlay, HiStop } from "react-icons/hi";
import { useSearchParams } from 'react-router-dom';
import "./codeEditor.css";
import { DarkModeContext } from "../../context/DarkModeContext";

/**
 * A code editor component with syntax highlighting and error decoration.
 * @param {function} onCodeChange - Callback for code change events.
 * @param {function} handleFetchChartData - Callback for fetching chart data.
 * @param {boolean} isLoading - Flag indicating if data is loading.
 * @param {string} errorMessage - Error message to highlight in the editor.
 */
function CodeEditor({ onCodeChange, handleFetchChartData, isLoading, errorMessage }) {
  const [code, setCode] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const [searchParams, _] = useSearchParams();
  const {darkMode} = useContext(DarkModeContext);

  useEffect(() => {
    const queryParam = searchParams.get("query")
    if (queryParam !== '')  {
      handleValueChange(queryParam);
    };
  }, [searchParams]);

  /**
   * Handles changes in code and clears previous error decorations.
   * @param {string} newCode - The updated code.
   */
  const handleValueChange = (newCode) => {
    setCode(newCode);
    onCodeChange(newCode);

    // Clear previous decorations
    if (editorRef.current) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  /**
   * Sets the editor and monaco instances.
   * @param {object} editor - The editor instance.
   * @param {object} monaco - The Monaco instance.
   */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Schedule the cursor positioning after a short delay
    setTimeout(() => {
      editor.setPosition({ lineNumber: 3, column: 1 });
      editor.focus();
    }, 0);
  };
  

  /**
   * Parses an error message to extract line and column numbers.
   * @param {string} errorMessage - The error message.
   * @returns {object|null} - An object with lineNumber and columnNumber or null if parsing fails.
   */
  const parseErrorMessage = (errorMessage) => {
    const match = errorMessage?.match(/line (\d+), column (\d+)/);
    if (match) {
      return {
        lineNumber: parseInt(match[1], 10),
        columnNumber: parseInt(match[2], 10),
      };
    }
    return null;
  };

  /**
   * Applies error decorations to the editor.
   * @param {number} lineNumber - The line number of the error.
   * @param {number} columnNumber - The column number of the error.
   */
  const markErrorInEditor = (lineNumber, columnNumber) => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      const totalLines = model.getLineCount();
      const lineLength = model.getLineLength(lineNumber);

      if (lineNumber <= totalLines) {
        const lineDecoration = {
          range: new monacoRef.current.Range(lineNumber, 1, lineNumber, lineLength + 1),
          options: {
            className: 'lineDecoration',
            isWholeLine: true,
          },
        };

        const columnDecoration = {
          range: new monacoRef.current.Range(lineNumber, columnNumber, lineNumber, columnNumber + 1),
          options: {
            className: 'columnDecoration',
            isWholeLine: false,
          },
        };

        const newDecorations = editorRef.current.deltaDecorations([], [lineDecoration, columnDecoration]);
        decorationsRef.current = newDecorations;
      } else {
        console.error(`Error line number out of bounds: line ${lineNumber}`);
      }
    }
  };

  useEffect(() => {
    if (errorMessage) {
      const errorPosition = parseErrorMessage(errorMessage);
      if (errorPosition) {
        markErrorInEditor(errorPosition.lineNumber, errorPosition.columnNumber);
      }
    }
  }, [errorMessage]);

  return (
    <>
      <div>
        <Editor
          height="80vh"
          language="sparql"
          theme={darkMode ? 'vs-dark' : 'light'}
          onChange={handleValueChange}
          onMount={handleEditorDidMount}
          defaultValue={`# Write your SPARQL query here...`}
          value={code}
          options={{
            inlineSuggest: true,
            fontSize: "15.5px",
            formatOnType: true,
            autoClosingBrackets: true,
            minimap: { enabled: false },
            wordWrap: "on"
          }}
        />
      </div>
      <div className="flex mt-2 mb-2 pl-2 text-4xl cursor-pointer dark:text-white" style={{justifyContent: "flex-end"}}>
        {isLoading ? <HiStop /> : <HiPlay onClick={handleFetchChartData} />}  
      </div>
    </>
  );
}

export default CodeEditor;
