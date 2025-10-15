import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Mail, 
  Shield, 
  Zap, 
  ArrowRight,
  Copy,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const SuccessContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const SuccessCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const SuccessIcon = styled(motion.div)`
  width: 5rem;
  height: 5rem;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1e293b;
  
  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ClientInfo = styled.div`
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #374151;
`;

const InfoValue = styled.span`
  color: #64748b;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
`;

const CopyButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.5rem;
  border: 1px solid #bae6fd;
`;

const FeatureIcon = styled.div`
  color: #3b82f6;
  flex-shrink: 0;
`;

const FeatureText = styled.span`
  color: #1e40af;
  font-weight: 500;
  font-size: 0.875rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #3b82f6;
  padding: 1rem 2rem;
  border: 2px solid #3b82f6;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);

  useEffect(() => {
    // Check if we have client data from the OAuth callback
    const urlParams = new URLSearchParams(location.search);
    const clientId = urlParams.get('clientId');
    
    if (clientId) {
      // In a real app, you might fetch client data here
      // For now, we'll use mock data
      setClientData({
        id: clientId,
        name: 'John Doe',
        email: 'john@example.com',
        gmailAddress: 'john.doe@gmail.com',
        registeredAt: new Date().toISOString()
      });
    }
  }, [location]);

  const handleCopyId = () => {
    if (clientData?.id) {
      navigator.clipboard.writeText(clientData.id);
      toast.success('Client ID copied to clipboard');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewDocs = () => {
    // In a real app, this would open documentation
    toast.success('Documentation will open in a new tab');
  };

  return (
    <SuccessContainer>
      <SuccessContent>
        <SuccessCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SuccessIcon
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
          >
            <CheckCircle size={32} />
          </SuccessIcon>

          <Title>Registration Successful!</Title>
          <Subtitle>
            Your Gmail account has been successfully connected and authorized. 
            You can now use our integration services.
          </Subtitle>

          {clientData && (
            <ClientInfo>
              <InfoRow>
                <InfoLabel>Client ID:</InfoLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <InfoValue>{clientData.id}</InfoValue>
                  <CopyButton onClick={handleCopyId}>
                    <Copy size={12} />
                    Copy
                  </CopyButton>
                </div>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Name:</InfoLabel>
                <InfoValue>{clientData.name}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Email:</InfoLabel>
                <InfoValue>{clientData.email}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Gmail Address:</InfoLabel>
                <InfoValue>{clientData.gmailAddress}</InfoValue>
              </InfoRow>
            </ClientInfo>
          )}

          <FeaturesList>
            <FeatureItem>
              <FeatureIcon>
                <Shield size={20} />
              </FeatureIcon>
              <FeatureText>OAuth 2.0 Authorization Complete</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>
                <Mail size={20} />
              </FeatureIcon>
              <FeatureText>Gmail Watch Subscription Active</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>
                <Zap size={20} />
              </FeatureIcon>
              <FeatureText>Webhook Notifications Enabled</FeatureText>
            </FeatureItem>
          </FeaturesList>

          <ActionButtons>
            <PrimaryButton onClick={handleGoHome}>
              <ArrowRight size={20} />
              Continue to Dashboard
            </PrimaryButton>
            <SecondaryButton onClick={handleViewDocs}>
              <ExternalLink size={20} />
              View Documentation
            </SecondaryButton>
          </ActionButtons>
        </SuccessCard>
      </SuccessContent>
    </SuccessContainer>
  );
};

export default Success;