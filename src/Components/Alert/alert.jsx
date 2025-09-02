/* eslint-disable react/prop-types */

"use client";

import { Alert } from "flowbite-react";


export function InfoAlert({alertText}) {
  return (
    <Alert color="info" className="bg-slate-100" >
      {alertText}
    </Alert>
  );
}

export function ErrorAlert({alertText}) {
  return (
    <Alert color="failure">
      {alertText}
    </Alert>
  );
}
