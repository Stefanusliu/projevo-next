"use client";

import { useState } from "react";
import Link from "next/link";
import ProjectMarketplace from "./main-content/ProjectMarketplace";
import HomePage from "./main-content/HomePage";
import Profile from "./main-content/Profile";

// Note: For client components, we'll handle SEO with next/head
import Head from 'next/head';

export default function VendorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [activeView, setActiveView] = useState("projects"); // Add state for active view

  const locations = [
    "All Locations",
    "Jakarta Selatan",
    "Jakarta Pusat",
    "Jakarta Barat",
    "Jakarta Utara",
    "Jakarta Timur",
    "Depok",
    "Tangerang",
    "Bekasi",
    "Bogor",
  ];

  return (
    <>
      <Head>
        <title>Vendor Dashboard - Find Projects & Submit Proposals | Projevo</title>
        <meta 
          name="description" 
          content="Browse construction and design projects, submit proposals, track your bids, and grow your business on Projevo's Vendor Dashboard. Find your next project opportunity." 
        />
        <meta 
          name="keywords" 
          content="vendor dashboard, construction projects, contractor marketplace, submit proposals, project bidding, vendor opportunities" 
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://projevo.com/dashboard/vendor" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Top Header with Logo and Menu */}
        <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Projevo
                  </span>
                </Link>
              </div>

              {/* Top Menu */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/how-it-works"
                  className="text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 font-medium transition-colors"
                >
                  How it Works?
                </Link>
                <Link
                  href="/contact"
                  className="text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 font-medium transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  href="/about"
                  className="text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 font-medium transition-colors"
                >
                  About Us
                </Link>
                <Link
                  href="/partners"
                  className="text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 font-medium transition-colors"
                >
                  Partners
                </Link>
                <Link
                  href="/promotions"
                  className="text-slate-600 hover:text-green-600 dark:text-slate-300 dark:hover:text-green-400 font-medium transition-colors"
                >
                  Promotions
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Secondary Header with Actions */}
        <div className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setActiveView("projects")}
                  className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mr-4 ${
                    activeView === "projects"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400"
                  }`}
                >
                  Find Projects
                </button>
                <button
                  onClick={() => setActiveView("home")}
                  className={`p-2.5 rounded-lg transition-colors mr-4 ${
                    activeView === "home"
                      ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
                      : "text-slate-600 hover:text-green-600 hover:bg-green-50 dark:text-slate-300 dark:hover:text-green-400 dark:hover:bg-green-900/20"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </button>
                <div className="flex items-center flex-1">
                  <div className="relative flex-1 mr-2">
                    <input
                      type="text"
                      placeholder="Search Projects"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mr-2"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <button className="p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <button className="p-2.5 rounded-lg text-slate-600 hover:text-green-600 hover:bg-green-50 dark:text-slate-300 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-colors relative mr-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                <button className="p-2.5 rounded-lg text-slate-600 hover:text-green-600 hover:bg-green-50 dark:text-slate-300 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-colors relative mr-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    5
                  </span>
                </button>
                <div className="flex items-center">
                  <button 
                    onClick={() => setActiveView("profile")}
                    className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="text-white text-sm font-medium">AS</span>
                  </button>
                  <div className="hidden sm:block">
                    <button 
                      onClick={() => setActiveView("profile")}
                      className="text-left hover:bg-green-50 dark:hover:bg-slate-700 p-1 rounded transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400">
                        Alex Smith
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Contractor
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {activeView === "projects" ? <ProjectMarketplace /> : activeView === "profile" ? <Profile /> : <HomePage />}
      </div>
    </>
  );
}
