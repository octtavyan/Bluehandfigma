"use client";

import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-600',
          actionButton: 'group-[.toast]:bg-[#86C2FF] group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600',
          closeButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:border-gray-200 group-[.toast]:hover:bg-gray-200',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };