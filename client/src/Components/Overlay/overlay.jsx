"use client";

import { Spinner } from "flowbite-react";

 function Overlay() {
  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
      
      <div className="text-center">
        <Spinner aria-label="Center-aligned spinner example" />
      </div>
    
    </div>
  );
}

export default Overlay;