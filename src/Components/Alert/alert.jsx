/* eslint-disable react/prop-types */

"use client";

import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";


export function InfoAlert({alertText}) {
  return (
    <Alert color="info" className="bg-slate-100" >
      <span className="font-medium">Info!</span> {alertText}
    </Alert>
  );
}

export function ErrorAlert({alertText}) {
  return (
    <Alert color="failure">
      <span className="font-medium">Error!</span> {alertText}
    </Alert>
  );
}



export function AlertWithContent() {
  return (
    <Alert additionalContent={<Content />} color="success" icon={HiInformationCircle}>
      For now <span className="font-medium">data</span> must span across <span className="font-medium">years</span> for <span className="font-medium">best</span> output.
      <br />
      Bar Chart Race will work only with this table structure like 3(min) - 6(max) columns required:
    </Alert>
  );
}

function Content() {
  return (
    <>
      <div className="mb-4 mt-2 text-sm text-cyan-700 dark:text-cyan-800">
        | itemName(category) | subPropertyName(name) | Numeric value(value) | Date(date) |
        <br />
        OR
        <br/>
        | item(wikidata item) | itemName(category) | subProperty(wikidata item) | subPropertyName (name) | Numeric value(value) | Date(date) |
        <br />
        Links like items(wd:Q485258, commons:Ccandowner2003.jpg, etc) are not considered valid names.
      </div>
     
    </>
  );
}

