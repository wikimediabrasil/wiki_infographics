/* eslint-disable react/prop-types */

"use client";

import { Alert } from "flowbite-react";


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
