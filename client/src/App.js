import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Success from './pages/Success';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled(main)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Footer = styled.footer`
  background: #1e293b;
  color: #e2e8f0;
  padding: 2rem 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FooterLink = styled.a`
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #e2e8f0;
  }
`;

const Copyright = styled.p`
  color: #64748b;
  font-size: 0.875rem;
`;

function App() {
  return (
    <AppContainer>
      <Header />
      <Main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </Main>
      <Footer>
        <FooterContent>
          <FooterLinks>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="mailto:support@example.com">Support</FooterLink>
          </FooterLinks>
          <Copyright>
            © 2024 Gmail Agent Registration System. All rights reserved.
          </Copyright>
        </FooterContent>
      </Footer>
    </AppContainer>
  );
}

export default App;