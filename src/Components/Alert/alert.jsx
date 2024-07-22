
"use client";

import { Alert } from "flowbite-react";

export function InfoAlert() {
  return (
    <Alert color="info" className="bg-slate-100" >
      <span className="font-medium">Info!</span> No data available
    </Alert>
  );
}
