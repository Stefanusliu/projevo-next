'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-50 bg-black border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="Projevo Logo" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-white">
                Projevo
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-white hover:text-blue-400 transition-colors font-medium">
              How it Works?
            </a>
            <Link href="/boq-maker" className="text-white hover:text-blue-400 transition-colors font-medium">
              BOQ Maker
            </Link>
            <Link href="/contact" className="text-white hover:text-blue-400 transition-colors font-medium">
              Contact Us
            </Link>
            <a href="#about-us" className="text-white hover:text-blue-400 transition-colors font-medium">
              About Us
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-white hover:text-blue-400 font-medium">
              Sign In
            </Link>
            <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-white hover:bg-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-700 mt-4 pt-4">
            <div className="flex flex-col space-y-4">
              <a href="#how-it-works" className="text-white hover:text-blue-400 font-medium">
                How it Works?
              </a>
              <Link href="/boq-maker" className="text-white hover:text-blue-400 font-medium">
                BOQ Maker
              </Link>
              <Link href="/contact" className="text-white hover:text-blue-400 font-medium">
                Contact Us
              </Link>
              <a href="#about-us" className="text-white hover:text-blue-400 font-medium">
                About Us
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
                <Link href="/login" className="text-left text-white hover:text-blue-400 font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg text-center">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
