import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Users,
  Clock,
  Lock
} from 'lucide-react';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 10;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 640px) {
    font-size: 1.125rem;
  }
`;

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const PrimaryButton = styled(Link)`
  background: white;
  color: #3b82f6;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
`;

const SecondaryButton = styled(Link)`
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border: 2px solid white;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: white;
    color: #3b82f6;
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 0;
  background: #f8fafc;
`;

const FeaturesContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const FeatureDescription = styled.p`
  color: #64748b;
  line-height: 1.6;
`;

const StatsSection = styled.section`
  background: #1e293b;
  color: white;
  padding: 4rem 0;
`;

const StatsContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: #3b82f6;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1.125rem;
  color: #94a3b8;
`;

const Home = () => {
  const features = [
    {
      icon: <Shield size={24} />,
      title: 'Secure OAuth 2.0',
      description: 'Industry-standard authentication with encrypted token storage and automatic refresh capabilities.'
    },
    {
      icon: <Zap size={24} />,
      title: 'Real-time Monitoring',
      description: 'Gmail watch subscriptions with automatic renewal and push notifications for email events.'
    },
    {
      icon: <Users size={24} />,
      title: 'Easy Integration',
      description: 'Webhook-based notifications and RESTful APIs for seamless integration with your existing systems.'
    },
    {
      icon: <Clock size={24} />,
      title: 'Automated Management',
      description: 'Automated token refresh and watch renewal with comprehensive audit logging and monitoring.'
    },
    {
      icon: <Lock size={24} />,
      title: 'Enterprise Security',
      description: 'GDPR compliant with data encryption, secure sessions, and comprehensive security measures.'
    },
    {
      icon: <Mail size={24} />,
      title: 'Gmail API Access',
      description: 'Full access to Gmail API with read, compose, and modify permissions for comprehensive email management.'
    }
  ];

  return (
    <>
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Secure Gmail Integration
            <br />
            Made Simple
          </HeroTitle>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect your Gmail account securely with our OAuth 2.0 system. 
            Get real-time email monitoring, automated management, and seamless integration.
          </HeroSubtitle>
          
          <CTAButtons
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <PrimaryButton to="/register">
              Get Started Free
              <ArrowRight size={20} />
            </PrimaryButton>
            <SecondaryButton to="/privacy">
              Learn More
            </SecondaryButton>
          </CTAButtons>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <FeaturesContent>
          <SectionTitle>Why Choose Our Gmail Agent?</SectionTitle>
          <SectionSubtitle>
            Built with security, reliability, and ease of use in mind. 
            Perfect for businesses that need robust Gmail integration.
          </SectionSubtitle>
          
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </FeaturesContent>
      </FeaturesSection>

      <StatsSection>
        <StatsContent>
          <StatsGrid>
            <StatItem>
              <StatNumber>99.9%</StatNumber>
              <StatLabel>Uptime</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>&lt;30s</StatNumber>
              <StatLabel>Registration Time</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>256-bit</StatNumber>
              <StatLabel>Encryption</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>24/7</StatNumber>
              <StatLabel>Monitoring</StatLabel>
            </StatItem>
          </StatsGrid>
        </StatsContent>
      </StatsSection>
    </>
  );
};

export default Home;