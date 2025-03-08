
// Remove the unused imports
// import useUI from '../contexts/UIContext';
// import React from 'react';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
