import React from 'react';
import Nav from './Nav';
import Logout from './Logout';
import Brand from './Brand';

export default function Header() {
  return (
    <header className="header">
      <Brand />
      <Nav />
      <Logout />
    </header>
  );
} 