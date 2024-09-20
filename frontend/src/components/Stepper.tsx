import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Step {
	id: string;
	label: string;
}
interface StepperProps {
	steps: Step[];
	currentStep: number;
	completedSteps: boolean[];
	goToStep: (step: number) => void;
}

const activeStyles = 'border-yellow-500 text-yellow-500';
const completedStyles = 'border-yellow-500 bg-yellow-500';

export const Stepper = ({ steps, currentStep, completedSteps, goToStep }: StepperProps) => {
	return (
		<div className="bg-white border-1 order-cool-gray-30 shadow-sm flex flex-row rounded py-3 px-6 justify-around items-center">
			{steps.map((step, index) => {
				const isActive = index === currentStep;
				const isCompleted = completedSteps[index];

				return (
					<div
						key={step.id}
						onClick={() => goToStep(index)}
						className={`flex-1 flex flex-row gap-2 items-center justify-center ${isCompleted ? 'hover:cursor-pointer' : 'cursor-not-allowed'}`}
					>
						<div
							className={`border-2 border-cool-gray-300 w-8 h-8 rounded-[50%] flex justify-center items-center  whitespace-nowrap text-cool-gray-400 text-sm ${isActive && activeStyles} ${isCompleted && completedStyles}`}
						>
							{/* show check icon if completed, otherwise show step number with '0' in front if step < 9 -> (01, 02, ..., 09, 10) */}
							{isCompleted ? (
								<CheckIcon width={20} height={20} color="white" />
							) : (
								`${index < 9 ? '0' : ''}${index + 1}`
							)}
						</div>
						<p
							className={`hidden md:block text-sm text-cool-gray-500 ${isActive && 'text-yellow-600'} ${isCompleted && 'text-cool-gray-900 hover:text-yellow-600'}`}
						>
							{step.label}
						</p>
					</div>
				);
			})}
		</div>
	);
};
