import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pola-blue to-dominican-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PA</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Donaciones</h1>
                <p className="text-xs text-gray-600">Pola de Allande</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/') 
                  ? 'text-pola-blue bg-blue-50' 
                  : 'text-gray-700 hover:text-pola-blue hover:bg-blue-50'
              }`}
            >
              Inicio
            </Link>
            <Link
              to="/donar"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/donar') 
                  ? 'text-pola-blue bg-blue-50' 
                  : 'text-gray-700 hover:text-pola-blue hover:bg-blue-50'
              }`}
            >
              Donar
            </Link>
            <Link
              to="/evento"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive('/evento') 
                  ? 'text-pola-blue bg-blue-50' 
                  : 'text-gray-700 hover:text-pola-blue hover:bg-blue-50'
              }`}
            >
              El Evento
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/donar"
              className="btn-primary"
            >
              Donar Ahora
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-pola-blue hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-pola-blue"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-pola-blue bg-blue-50' 
                    : 'text-gray-700 hover:text-pola-blue hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/donar"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/donar') 
                    ? 'text-pola-blue bg-blue-50' 
                    : 'text-gray-700 hover:text-pola-blue hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Donar
              </Link>
              <Link
                to="/evento"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive('/evento') 
                    ? 'text-pola-blue bg-blue-50' 
                    : 'text-gray-700 hover:text-pola-blue hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                El Evento
              </Link>
              <div className="pt-2">
                <Link
                  to="/donar"
                  className="block w-full btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Donar Ahora
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;