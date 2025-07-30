// src/layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import {
  Page,
  Header,
  Nav,
  NavList,
  NavItem,
  Avatar,
  Footer,
  SiteLogo,
} from 'tabler-react';
import { Link, useLocation } from 'react-router-dom';
import { IconHome, IconUser, IconClock, IconSettings } from '@tabler/icons';

const DashboardLayout = ({ children }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: IconHome, label: 'Accueil', path: '/' },
    { icon: IconUser, label: 'Employés', path: '/employees' },
    { icon: IconClock, label: 'Pointages', path: '/pointages' },
    { icon: IconSettings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <Page>
      <Header>
        <Header.Holder>
          <Header.Toggler
            display="lg"
            onClick={() => setMenuOpen(!isMenuOpen)}
            active={isMenuOpen}
          />
          <SiteLogo to="/" alt="Système de Pointage" src="/logo.svg" />
          <Header.Nav>
            <Header.NavList>
              <Header.NavItem icon="bell" />
              <Header.NavItem icon="mail" />
            </Header.NavList>
          </Header.Nav>
          <Header.User>
            <Avatar
              size="md"
              imageURL="https://tabler.github.io/tabler/demo/faces/male/41.jpg"
            />
            <Header.UserName>Admin</Header.UserName>
          </Header.User>
        </Header.Holder>
      </Header>

      <Page.Main>
        <Nav collapse expand="lg" isMenuOpen={isMenuOpen}>
          <NavList>
            {menuItems.map((item, index) => (
              <NavItem
                key={index}
                to={item.path}
                icon={<item.icon />}
                active={location.pathname === item.path}
                RootComponent={Link}
              >
                {item.label}
              </NavItem>
            ))}
          </NavList>
        </Nav>

        <Page.Content>
          <div className="container-fluid p-4">
            {children}
          </div>
        </Page.Content>
      </Page.Main>

      <Footer>
        <Footer.Copyright>
          © 2025 Système de Pointage - Tous droits réservés
        </Footer.Copyright>
        <Footer.Nav>
          <Footer.NavItem>Support</Footer.NavItem>
          <Footer.NavItem>Documentation</Footer.NavItem>
          <Footer.NavItem>API</Footer.NavItem>
        </Footer.Nav>
      </Footer>
    </Page>
  );
};

export default DashboardLayout;