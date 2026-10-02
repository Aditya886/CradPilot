import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import StepsSlider from './components/StepSlider';
import { navigate } from '../../navigation/NavigationUtils';
import { CommonBg } from '../../ui/common/CommonBg';
import { SignupCard } from '../../ui/cards/SignupCard';
import { resAvarage } from '../../utils/responsive';
import { OtpCard } from '../../ui/cards/OtpCard';
import { NameCard } from '../../ui/cards/NameCard';
import { ParentCard } from '../../ui/cards/ParentCard';
import { ParentDetailCard } from '../../ui/cards/ParentDetailCard';
import { ParentTickCard } from '../../ui/cards/ParentTickCard';
import { BillingCard } from '../../ui/cards/BillingCard';
import { BankCard } from '../../ui/cards/BankCard';
import { OrderSummaryCard } from '../../ui/cards/OrderSummaryCard';

const Slider = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOtp, setShowOtp] = useState(false);
  const [showParentDetail, setShowParentDetail] = useState(false);
  const [showParentTick, setShowParentTick] = useState(false);
  const [paymentView, setPaymentView] = useState<'card' | 'bank' | 'summary'>('card');
  const [prevPaymentView, setPrevPaymentView] = useState<'card' | 'bank'>('card');

  // Define your steps
  const steps = [
    { id: 1, label: 'Account' },
    { id: 2, label: 'Basic Info' },
    { id: 3, label: 'Parent account' },
    { id: 4, label: 'Payment setup' },
  ];

  const handleStepChange = (newStep: any) => {
    setCurrentStep(newStep);
    console.log('Current step changed to:', newStep);
    if (newStep !== 0) {
      setShowOtp(false);
    }
    if (newStep !== 2) {
      setShowParentDetail(false);
    }
    if (newStep === 3) {
      setPaymentView('card');
    }
  };

  return (
    <CommonBg style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        {/* Steps Slider Component */}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <StepsSlider
            currentStep={currentStep}
            onStepChange={handleStepChange}
            steps={steps}
          />
          {currentStep === 0 && !showOtp && (
            <SignupCard onNext={() => setShowOtp(true)} />
          )}
          {(currentStep === 0 || currentStep === 2) && showOtp && (
            <OtpCard
              onPreview={() => setShowOtp(false)}
              onOtpComplete={otp => {
                setTimeout(() => {
                  if (currentStep === 2) {
                    setShowOtp(false);
                    setShowParentDetail(false);
                    setShowParentTick(false);
                    handleStepChange(3);
                  } else {
                    handleStepChange(1);
                    setShowOtp(false);
                  }
                }, 2000);
              }}
            />
          )}
        </View>
        {currentStep === 1 && (
          <NameCard
            onBack={() => handleStepChange(0)}
            onNext={() => handleStepChange(2)}
          />
        )}
        {currentStep === 2 &&
          !showParentDetail &&
          !showParentTick &&
          !showOtp && (
            <ParentCard
              onBack={() => handleStepChange(1)}
              onNext={() => setShowParentDetail(true)}
            />
          )}
        {currentStep === 2 && showParentDetail && !showParentTick && (
          <ParentDetailCard
            onBack={() => setShowParentDetail(false)}
            onNext={() => setShowParentTick(true)}
          />
        )}
        {currentStep === 2 && showParentTick && (
          <ParentTickCard
            onBack={() => {
              setShowParentTick(false);
              setShowParentDetail(true);
            }}
            onNext={() => {
              setShowOtp(true);
              setShowParentDetail(false);
              setShowParentTick(false);
            }}
          />
        )}
        {currentStep === 3 && paymentView === 'card' && (
          <BillingCard
            onBack={() => {
              handleStepChange(2);
              setShowParentTick(true);
              setShowParentDetail(false);
              setShowOtp(false);
            }}
            onNext={() => {
              setPrevPaymentView('card');
              setPaymentView('summary');
            }}
            onSelectBank={() => setPaymentView('bank')}
          />
        )}
        {currentStep === 3 && paymentView === 'bank' && (
          <BankCard
            onBack={() => {
              handleStepChange(2);
              setShowParentTick(true);
              setShowParentDetail(false);
              setShowOtp(false);
            }}
            onNext={() => {
              setPrevPaymentView('bank');
              setPaymentView('summary');
            }}
            onSelectCard={() => setPaymentView('card')}
          />
        )}
        {currentStep === 3 && paymentView === 'summary' && (
          <OrderSummaryCard
            paymentMethod={prevPaymentView}
            onBack={() => {
              setPaymentView(prevPaymentView);
            }}
            onNext={() => {
              navigate('Complete');
            }}
          />
        )}
      </ScrollView>
    </CommonBg>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: resAvarage(3),
    paddingBottom: resAvarage(4),
  },
});

export default Slider;
