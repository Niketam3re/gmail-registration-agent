import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

const PrivacyContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 4rem 0;
`;

const PrivacyContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const PrivacyCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 3rem;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

const LastUpdated = styled.p`
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 0.875rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionContent = styled.div`
  color: #64748b;
  line-height: 1.7;
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  strong {
    color: #374151;
    font-weight: 600;
  }
`;

const HighlightBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const ContactInfo = styled.div`
  background: #f8fafc;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid #e2e8f0;
`;

const Privacy = () => {
  return (
    <PrivacyContainer>
      <PrivacyContent>
        <PrivacyCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>
            <Shield size={40} />
            Privacy Policy
          </Title>
          <LastUpdated>Last updated: December 2024</LastUpdated>

          <Section>
            <SectionTitle>
              <Eye size={24} />
              Information We Collect
            </SectionTitle>
            <SectionContent>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                register for our services, or contact us for support.
              </p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, company name</li>
                <li><strong>Gmail Data:</strong> OAuth tokens for accessing your Gmail account</li>
                <li><strong>Usage Data:</strong> Information about how you use our services</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <Lock size={24} />
              How We Use Your Information
            </SectionTitle>
            <SectionContent>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process your Gmail integration requests</li>
                <li>Send you technical notifications and updates</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <Database size={24} />
              Data Security
            </SectionTitle>
            <SectionContent>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul>
                <li><strong>Encryption:</strong> All sensitive data is encrypted at rest and in transit</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication requirements</li>
                <li><strong>Regular Audits:</strong> Regular security audits and vulnerability assessments</li>
                <li><strong>Secure Infrastructure:</strong> Industry-standard security practices</li>
              </ul>
              
              <HighlightBox>
                <strong>OAuth 2.0 Security:</strong> We use OAuth 2.0 for Gmail authorization, which means 
                we never store your Gmail password. You can revoke access at any time through your Google account settings.
              </HighlightBox>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <UserCheck size={24} />
              Your Rights
            </SectionTitle>
            <SectionContent>
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Data Retention</SectionTitle>
            <SectionContent>
              <p>
                We retain your personal information only as long as necessary to provide our services 
                and fulfill the purposes outlined in this privacy policy. Specifically:
              </p>
              <ul>
                <li>Account information is retained while your account is active</li>
                <li>OAuth tokens are retained until you revoke access or delete your account</li>
                <li>Audit logs are retained for 90 days for security purposes</li>
                <li>All data is permanently deleted within 30 days of account deletion</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Third-Party Services</SectionTitle>
            <SectionContent>
              <p>
                We may use third-party services to help us provide our services. These services are 
                bound by their own privacy policies and security standards:
              </p>
              <ul>
                <li><strong>Google APIs:</strong> For Gmail integration (subject to Google's privacy policy)</li>
                <li><strong>Cloud Infrastructure:</strong> For hosting and data storage</li>
                <li><strong>Analytics:</strong> For usage analytics and monitoring</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Changes to This Policy</SectionTitle>
            <SectionContent>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new privacy policy on this page and updating the "Last updated" date. 
                Your continued use of our services after any changes constitutes acceptance of the new policy.
              </p>
            </SectionContent>
          </Section>

          <ContactInfo>
            <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Contact Us</h3>
            <p style={{ marginBottom: '0.5rem' }}>
              If you have any questions about this privacy policy or our data practices, please contact us:
            </p>
            <ul style={{ marginBottom: '0' }}>
              <li>Email: privacy@example.com</li>
              <li>Address: 123 Privacy Street, Data City, DC 12345</li>
              <li>Phone: +1 (555) 123-4567</li>
            </ul>
          </ContactInfo>
        </PrivacyCard>
      </PrivacyContent>
    </PrivacyContainer>
  );
};

export default Privacy;