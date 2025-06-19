'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const menuItems = ['Project', 'Portfolio', 'Saved', 'History'];

  // Helper function to get the correct href for each menu item
  const getMenuHref = (item) => {
    switch (item) {
      case 'Portfolio':
        return '/dashboard/project-owner/portfolio';
      case 'Project':
        return '/dashboard/project-owner/home';
      default:
        return `/dashboard/project-owner/${item.toLowerCase()}`;
    }
  };

  // Helper function to check if menu item is active
  const isActive = (item) => {
    const href = getMenuHref(item);
    return pathname === href;
  };

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item}
              href={getMenuHref(item)}
              className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive(item)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20'
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
