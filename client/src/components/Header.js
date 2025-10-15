import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Shield, Zap } from 'lucide-react';

const HeaderContainer = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: #3b82f6;
  }
`;

const LogoIcon = styled.div`
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

const NavLink = styled(Link)`
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    color: #3b82f6;
  }
`;

const CTAButton = styled(Link)`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  }
  
  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>
            <Mail size={20} />
          </LogoIcon>
          Gmail Agent
        </Logo>
        
        <Nav>
          <NavLink to="/privacy">
            <Shield size={16} />
            Privacy
          </NavLink>
          <NavLink to="/terms">
            <Zap size={16} />
            Terms
          </NavLink>
          <CTAButton to="/register">
            Get Started
          </CTAButton>
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;