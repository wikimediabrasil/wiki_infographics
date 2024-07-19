/* eslint-disable react/prop-types */
import { useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";

import { HiPlay } from "react-icons/hi"

/**
 * A simple code editor with syntax highlighting.
 * @param {function} onCodeChange - Updates parent component with new code.
 * @param {function} handleFetchChartData - Handles fetching chart data.
 */
function CodeEditor({ onCodeChange, handleFetchChartData }) {
  const [code, setCode] = useState("");

  const handleValueChange = (newCode) => {
    setCode(newCode);
    onCodeChange(newCode);
  };

  return (
    <>
      <div>
        <Editor
          value={code}
          padding={10}
          onValueChange={handleValueChange}
          highlight={(code) => highlight(code, languages.js)}
          placeholder="(Add your query here)"
          style={{
            fontFamily: "monospace",
            fontSize: 17,
            border: "1px solid black",
          }}
        />
      </div>
      <div className="flex mt-2 text-3xl cursor-pointer">
        <HiPlay onClick={handleFetchChartData} />
      </div>
    </>
  );
}

export default CodeEditor;
