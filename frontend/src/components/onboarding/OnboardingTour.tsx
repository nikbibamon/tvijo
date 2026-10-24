"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
}

const BUBBLES_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Tvijo Bubbles!",
    content: "Create interactive concept maps to visualize trading strategies, risk analysis, and market relationships.",
    position: "center",
  },
  {
    id: "create-node",
    title: "Create Nodes",
    content: "Double-click anywhere on the canvas to create a new node. Drag nodes to organize your map.",
    target: ".graph-canvas",
    position: "bottom",
  },
  {
    id: "connect",
    title: "Connect Ideas",
    content: "Drag from one node to another to create a connection. Show relationships between concepts.",
    target: ".graph-canvas",
    position: "bottom",
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    content: "Stuck? Describe your idea and our AI will generate a complete structure for you.",
    target: ".ai-prompt-button",
    position: "left",
  },
  {
    id: "templates",
    title: "Start with Templates",
    content: "Choose from pre-made templates: Trading Strategy, Risk Analysis, Portfolio Planning, and more.",
    target: ".template-gallery",
    position: "right",
  },
  {
    id: "share",
    title: "Share Your Work",
    content: "Export as PNG, PDF, or share a link. Embed in articles or share on social media for +25 XP!",
    position: "center",
  },
];

interface OnboardingTourProps {
  steps?: OnboardingStep[];
  storageKey?: string;
  onComplete?: () => void;
  className?: string;
}

export function OnboardingTour({
  steps = BUBBLES_ONBOARDING_STEPS,
  storageKey = "bubbles-onboarding-completed",
  onComplete,
  className,
}: OnboardingTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding
    const completed = localStorage.getItem(storageKey);
    if (!completed) {
      setIsActive(true);
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, 300);
  }, [storageKey, onComplete]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsVisible(false);
    setTimeout(() => setIsActive(false), 300);
  }, [storageKey]);

  const restartTour = useCallback(() => {
    localStorage.removeItem(storageKey);
    setCurrentStep(0);
    setIsActive(true);
    setIsVisible(true);
  }, [storageKey]);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isActive) {
    // Return a button to restart tour
    return (
      <button
        onClick={restartTour}
        className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white transition-all ${className}`}
      >
        <Sparkles className="w-3 h-3" />
        Restart Tour
      </button>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Tooltip card */}
      <div className="relative w-full max-w-md mx-4 bg-[#071d24]/80 border border-emerald-400/15 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-2">{currentStepData.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{currentStepData.content}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/5">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-400 text-[#001b18] text-sm font-semibold rounded-lg hover:bg-emerald-300 transition-all"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1 pb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentStep
                  ? "bg-emerald-400 w-4"
                  : index < currentStep
                  ? "bg-emerald-400/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for programmatically controlling the tour
export function useOnboardingTour(storageKey = "bubbles-onboarding-completed") {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    setIsCompleted(!!completed);
  }, [storageKey]);

  const restart = useCallback(() => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  }, [storageKey]);

  const markCompleted = useCallback(() => {
    localStorage.setItem(storageKey, "true");
    setIsCompleted(true);
  }, [storageKey]);

  return { isCompleted, restart, markCompleted };
}
