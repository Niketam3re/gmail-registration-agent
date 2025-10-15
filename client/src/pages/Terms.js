import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertTriangle, Shield } from 'lucide-react';

const TermsContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 4rem 0;
`;

const TermsContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const TermsCard = styled(motion.div)`
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

const WarningBox = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const Terms = () => {
  return (
    <TermsContainer>
      <TermsContent>
        <TermsCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>
            <FileText size={40} />
            Terms of Service
          </Title>
          <LastUpdated>Last updated: December 2024</LastUpdated>

          <Section>
            <SectionTitle>
              <Scale size={24} />
              Acceptance of Terms
            </SectionTitle>
            <SectionContent>
              <p>
                By accessing and using the Gmail Agent Registration System ("Service"), you accept and agree 
                to be bound by the terms and provision of this agreement. If you do not agree to abide by 
                the above, please do not use this service.
              </p>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Service Description</SectionTitle>
            <SectionContent>
              <p>
                The Gmail Agent Registration System provides secure OAuth 2.0 integration with Gmail accounts 
                for business purposes. Our service includes:
              </p>
              <ul>
                <li>Secure Gmail account authorization and token management</li>
                <li>Real-time email monitoring through Gmail watch subscriptions</li>
                <li>Webhook notifications for email events</li>
                <li>Automated token refresh and watch renewal</li>
                <li>API access for external system integration</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <Shield size={24} />
              User Responsibilities
            </SectionTitle>
            <SectionContent>
              <p>As a user of our service, you agree to:</p>
              <ul>
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful business purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not attempt to circumvent security measures</li>
                <li>Not use the service for spam, phishing, or malicious activities</li>
                <li>Respect Gmail's Terms of Service and API usage policies</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Gmail Integration</SectionTitle>
            <SectionContent>
              <p>
                Our service integrates with Gmail through Google's official APIs. By using our service, you acknowledge that:
              </p>
              <ul>
                <li>You are the owner or authorized user of the Gmail account being integrated</li>
                <li>You understand the permissions being granted to our service</li>
                <li>You can revoke access at any time through your Google account settings</li>
                <li>Our service will only access Gmail data as necessary to provide the requested functionality</li>
                <li>You are responsible for complying with Gmail's Terms of Service</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Data and Privacy</SectionTitle>
            <SectionContent>
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
                use, and protect your information. Key points include:
              </p>
              <ul>
                <li>We use OAuth 2.0 for secure authentication</li>
                <li>Your Gmail credentials are encrypted and never stored in plain text</li>
                <li>We only access Gmail data necessary for our service</li>
                <li>You can request data deletion at any time</li>
                <li>We comply with applicable data protection regulations</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Service Availability</SectionTitle>
            <SectionContent>
              <p>
                We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                Our service may be temporarily unavailable due to:
              </p>
              <ul>
                <li>Scheduled maintenance and updates</li>
                <li>Technical issues or system failures</li>
                <li>Third-party service disruptions (e.g., Google APIs)</li>
                <li>Force majeure events beyond our control</li>
              </ul>
              <p>
                We will make reasonable efforts to notify users of planned maintenance and resolve issues promptly.
              </p>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>
              <AlertTriangle size={24} />
              Limitations and Disclaimers
            </SectionTitle>
            <SectionContent>
              <WarningBox>
                <strong>Important:</strong> Our service is provided "as is" without warranties of any kind. 
                We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose.
              </WarningBox>
              
              <p>We are not responsible for:</p>
              <ul>
                <li>Loss of data or service interruptions</li>
                <li>Changes to Gmail APIs that may affect functionality</li>
                <li>Third-party service failures or limitations</li>
                <li>Unauthorized access to your Gmail account</li>
                <li>Any damages resulting from use of our service</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Prohibited Uses</SectionTitle>
            <SectionContent>
              <p>You may not use our service for:</p>
              <ul>
                <li>Any unlawful purpose or activity</li>
                <li>Spam, phishing, or other malicious activities</li>
                <li>Violating Gmail's Terms of Service or API policies</li>
                <li>Attempting to gain unauthorized access to systems</li>
                <li>Interfering with the proper functioning of the service</li>
                <li>Reverse engineering or attempting to extract source code</li>
                <li>Reselling or redistributing our service without permission</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Termination</SectionTitle>
            <SectionContent>
              <p>
                We may terminate or suspend your access to our service at any time, with or without notice, 
                for any reason, including violation of these terms. Upon termination:
              </p>
              <ul>
                <li>Your access to the service will be immediately revoked</li>
                <li>All Gmail integrations will be disconnected</li>
                <li>Your data will be deleted according to our data retention policy</li>
                <li>You remain responsible for any outstanding obligations</li>
              </ul>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Changes to Terms</SectionTitle>
            <SectionContent>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant 
                changes via email or through the service interface. Continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Governing Law</SectionTitle>
            <SectionContent>
              <p>
                These terms are governed by and construed in accordance with applicable laws. Any disputes 
                arising from these terms or your use of the service will be resolved through binding arbitration 
                or in the courts of competent jurisdiction.
              </p>
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Contact Information</SectionTitle>
            <SectionContent>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul>
                <li>Email: legal@example.com</li>
                <li>Address: 123 Legal Street, Terms City, TC 12345</li>
                <li>Phone: +1 (555) 123-4567</li>
              </ul>
            </SectionContent>
          </Section>
        </TermsCard>
      </TermsContent>
    </TermsContainer>
  );
};

export default Terms;