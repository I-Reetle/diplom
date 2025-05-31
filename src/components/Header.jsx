import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <header className="site-header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <img src="/img/logo/logo.png" alt="Last.fm" className="logo" />
        </Link>
        
        <nav className="main-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink to="/search" className="nav-link icon-link">
                <img src="/img/icons/search.svg" alt="Search" className="nav-icon" />
                <span className="sr-only">Search</span>
              </NavLink>
            </li>
            <li className="nav-item"><NavLink to="/" className="nav-link">Home</NavLink></li>
            <li className="nav-item"><a href="#" className="nav-link">Live</a></li>
            <li className="nav-item"><NavLink to="/" className="nav-link">Music</NavLink></li>
            <li className="nav-item"><a href="#" className="nav-link">Charts</a></li>
            <li className="nav-item"><a href="#" className="nav-link">Events</a></li>
            <li className="nav-item"><a href="#" className="nav-link">Features</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;