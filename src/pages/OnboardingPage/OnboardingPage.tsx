import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm, AvatarPicker } from '@/features/auth';
import './OnboardingPage.css';

type Step = 'register' | 'avatar';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('register');

  return (
    <div className="ob-page">
      {/* Indicador de pasos */}
      <div className="ob-progress">
        <div className={`ob-dot ${step === 'register' ? 'active' : 'done'}`} />
        <div className={`ob-dot ${step === 'avatar' ? 'active' : ''}`} />
      </div>

      {step === 'register' && (
        <RegisterForm onComplete={() => setStep('avatar')} />
      )}

      {step === 'avatar' && (
        <AvatarPicker onComplete={() => navigate('/')} />
      )}
    </div>
  );
}