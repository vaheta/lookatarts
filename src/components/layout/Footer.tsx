import React from "react";

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`text-center py-8 ${className}`}>
      <p className="text-sm text-gray-600">Picture of the day - Today</p>
    </footer>
  );
} 