/* eslint-disable react/prop-types */
"use client";

import { useEffect, useState } from "react";
import { Toast } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";

/**
 * Notification component to display a toast message.
 * 
 * @param {string} message - The message to display in the toast.
 * @param {function} clearError - Function to clear the error after the toast hides.
 */
export function Notification({ message, clearError }) {
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
      clearError();
    }, 5000);

    return () => clearTimeout(timer);
  }, [clearError]);

  return (
    <>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-4">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
              <HiExclamation className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal text-red-600">{message}</div>
            <Toast.Toggle />
          </Toast>
        </div>
      )}
    </>
  );
}
