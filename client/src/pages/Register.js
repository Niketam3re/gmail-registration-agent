import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Mail, 
  User, 
  Building, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import axios from 'axios';

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem 0;
`;

const RegisterContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;

const RegisterCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 640px) {
    padding: 2rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #1e293b;
  
  @media (max-width: 640px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 1.125rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &.error {
    border-color: #ef4444;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #3b82f6;
`;

const CheckboxLabel = styled.label`
  color: #374151;
  font-size: 0.875rem;
  line-height: 1.5;
  cursor: pointer;
  
  a {
    color: #3b82f6;
    text-decoration: underline;
    
    &:hover {
      color: #1d4ed8;
    }
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.125rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoIcon = styled.div`
  color: #3b82f6;
  margin-top: 0.125rem;
`;

const InfoText = styled.div`
  color: #1e40af;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'oauth', 'success'

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const consentGiven = watch('consentGiven');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Step 1: Pre-register (save form data)
      const preRegisterResponse = await axios.post('/api/auth/pre-register', data);
      
      if (preRegisterResponse.data.success) {
        // Step 2: Start OAuth flow
        const oauthResponse = await axios.get('/api/auth/google');
        
        if (oauthResponse.data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = oauthResponse.data.authUrl;
        } else {
          throw new Error('Failed to get OAuth URL');
        }
      } else {
        throw new Error(preRegisterResponse.data.error || 'Pre-registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(
        error.response?.data?.error || 
        error.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterContent>
        <RegisterCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Connect Your Gmail</Title>
          <Subtitle>
            Securely authorize Gmail access for your business integration
          </Subtitle>

          <InfoBox>
            <InfoIcon>
              <Shield size={20} />
            </InfoIcon>
            <InfoText>
              <strong>Your data is secure:</strong> We use OAuth 2.0 for secure authorization. 
              Your Gmail credentials are encrypted and never stored in plain text. 
              You can revoke access at any time.
            </InfoText>
          </InfoBox>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormGroup>
              <Label>
                <User size={20} />
                Full Name *
              </Label>
              <Input
                type="text"
                placeholder="Enter your full name"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  {errors.name.message}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                <Mail size={20} />
                Email Address *
              </Label>
              <Input
                type="email"
                placeholder="Enter your email address"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  {errors.email.message}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                <Building size={20} />
                Company (Optional)
              </Label>
              <Input
                type="text"
                placeholder="Enter your company name"
                {...register('company')}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Mail size={20} />
                Gmail Address *
              </Label>
              <Input
                type="email"
                placeholder="Enter your Gmail address"
                {...register('gmailAddress', { 
                  required: 'Gmail address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@gmail\.com$/i,
                    message: 'Must be a valid Gmail address'
                  }
                })}
                className={errors.gmailAddress ? 'error' : ''}
              />
              {errors.gmailAddress && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  {errors.gmailAddress.message}
                </ErrorMessage>
              )}
            </FormGroup>

            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="consent"
                {...register('consentGiven', { 
                  required: 'You must agree to the terms to continue' 
                })}
              />
              <CheckboxLabel htmlFor="consent">
                I agree to the{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                . I understand that this will grant access to my Gmail account for business integration purposes.
              </CheckboxLabel>
            </CheckboxGroup>
            {errors.consentGiven && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.consentGiven.message}
              </ErrorMessage>
            )}

            <SubmitButton type="submit" disabled={isLoading || !consentGiven}>
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connecting to Gmail...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Authorize Gmail Access
                </>
              )}
            </SubmitButton>
          </Form>
        </RegisterCard>
      </RegisterContent>
    </RegisterContainer>
  );
};

export default Register;