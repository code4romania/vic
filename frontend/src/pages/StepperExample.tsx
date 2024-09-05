import React, { useMemo, useState } from 'react';
import { Stepper } from '../components/Stepper';
import Button from '../components/Button';
import { CardsExample } from '../components/CardsExample';
import { useTranslation } from 'react-i18next';

export const StepperExample = () => {
  const { t } = useTranslation('stepper');
  const steps = useMemo(
    () => [
      { id: '1', label: t('choose_template') },
      { id: '2', label: t('choose_volunteers') },
      { id: '3', label: t('fill') },
      { id: '4', label: t('attachments') },
      { id: '5', label: t('complete') },
    ],
    [],
  );

  //? do we take the step from the query params?
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Array(steps.length).fill(false));

  const goToStep = (index: number) => {
    if (index <= currentStep) {
      setCurrentStep(index);
    }
  };

  const handleNext = () => {
    // mark the current step as completed
    const updatedSteps = [...completedSteps];
    updatedSteps[currentStep] = true;
    setCompletedSteps(updatedSteps);

    // move to the next step if possible
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <p>Stepper Example</p>
      <Stepper
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        goToStep={goToStep}
      />
      <div className="flex flex-row gap-4 justify-end">
        <Button label="Pasul anterior" onClick={handlePrevious} className="text-yellow" />
        <Button
          label="Pasul urmator"
          onClick={handleNext}
          className="bg-yellow text-white self-center p-2 rounded"
        />
      </div>
      <CardsExample />
    </div>
  );
};
