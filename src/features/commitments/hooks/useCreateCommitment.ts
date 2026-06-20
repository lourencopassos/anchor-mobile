import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Localization from 'expo-localization';
import * as commitmentsApi from '@api/endpoints/commitments.api';
import type {
  CreateCommitmentRequest,
  CreateCommitmentResponse,
  TemplateType,
  SupporterRole,
  VerificationAuthorityType,
  FrequencyType,
  DayOfWeek,
} from '@api/types';
import {
  TEMPLATE_FREQUENCY_DEFAULTS,
  TEMPLATE_SCHEDULE_DEFAULTS,
} from '@api/types/commitment.types';
import { COMMITMENTS_QUERY_KEY } from './useCommitments';

// Generate UUID for idempotency key
function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Pending supporter invite (not yet sent to API)
export interface PendingSupporterInvite {
  id: string; // Local ID for list management
  email?: string;
  phone?: string;
  role: SupporterRole;
}

export interface WizardStep {
  templateType: TemplateType | null;
  startDate: string | null;
  endDate: string | null;
  stakeAmountCents: number;
  charityPercent: number;
  supportersPercent: number;
  // Frequency & Schedule (Commitment Templates feature)
  frequencyType: FrequencyType;
  frequencyTargetCount: number;
  frequencySpecificDays: DayOfWeek[];
  preferredTime: string | null;
  reminderMinutesBefore: number;
  reminderAtTime: boolean;
  whyNote: string;
  // Payment fields (country is auto-detected from IP by backend)
  customerDocument: string | null; // CPF for Brazil (shown based on device locale)
  customerEmail: string | null;
  // Supporters to invite after commitment is created
  pendingSupporters: PendingSupporterInvite[];
  // Verification settings - who can vote to fail the commitment
  verificationAuthorityType: VerificationAuthorityType;
  // Custodian mode (Closed Alpha)
  custodianEmail: string | null;
}

const INITIAL_WIZARD_STATE: WizardStep = {
  templateType: null,
  startDate: null,
  endDate: null,
  stakeAmountCents: 5000, // $50 default
  charityPercent: 50,
  supportersPercent: 50,
  // Frequency & Schedule defaults
  frequencyType: 'DAILY',
  frequencyTargetCount: 3,
  frequencySpecificDays: [],
  preferredTime: null,
  reminderMinutesBefore: 15,
  reminderAtTime: true,
  whyNote: '',
  customerDocument: null, // CPF for Brazil (shown based on device locale)
  customerEmail: null,
  pendingSupporters: [],
  verificationAuthorityType: 'SELF_ONLY', // Default: only owner can fail
  // Custodian mode (Closed Alpha)
  custodianEmail: null,
};

export function useCreateCommitment() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardStep>(INITIAL_WIZARD_STATE);
  const [idempotencyKey] = useState(generateIdempotencyKey);

  const mutation = useMutation({
    mutationFn: (request: CreateCommitmentRequest) =>
      commitmentsApi.create(request, idempotencyKey),
    onSuccess: async () => {
      // Invalidate and refetch to ensure the list is updated before navigation
      await queryClient.invalidateQueries({ queryKey: COMMITMENTS_QUERY_KEY });
    },
  });

  const updateWizardData = useCallback((updates: Partial<WizardStep>) => {
    setWizardData((prev) => ({ ...prev, ...updates }));
  }, []);

  // Apply template defaults when template type changes
  const setTemplateType = useCallback((templateType: TemplateType) => {
    const frequencyDefaults = TEMPLATE_FREQUENCY_DEFAULTS[templateType];
    const scheduleDefaults = TEMPLATE_SCHEDULE_DEFAULTS[templateType];

    setWizardData((prev) => ({
      ...prev,
      templateType,
      frequencyType: frequencyDefaults.type,
      frequencyTargetCount: frequencyDefaults.targetCount ?? 3,
      frequencySpecificDays: frequencyDefaults.specificDays ?? [],
      preferredTime: scheduleDefaults.preferredTime ?? null,
      reminderMinutesBefore: scheduleDefaults.reminderMinutesBefore ?? 15,
      reminderAtTime: scheduleDefaults.reminderAtTime ?? true,
    }));
  }, []);

  // Total steps: Template, Dates, Frequency, Schedule, Motivation, Stake, Distribution, Supporters, Custodian, Verification, Review
  const totalSteps = 11;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setWizardData(INITIAL_WIZARD_STATE);
  }, []);

  // Supporter management functions
  const addPendingSupporter = useCallback((supporter: Omit<PendingSupporterInvite, 'id'>) => {
    const newSupporter: PendingSupporterInvite = {
      ...supporter,
      id: generateIdempotencyKey(),
    };
    setWizardData((prev) => ({
      ...prev,
      pendingSupporters: [...prev.pendingSupporters, newSupporter],
    }));
  }, []);

  const removePendingSupporter = useCallback((id: string) => {
    setWizardData((prev) => ({
      ...prev,
      pendingSupporters: prev.pendingSupporters.filter((s) => s.id !== id),
    }));
  }, []);

  // Custodian management function
  const setCustodianEmail = useCallback((email: string | null) => {
    setWizardData((prev) => ({
      ...prev,
      custodianEmail: email,
    }));
  }, []);

  const submitCommitment = useCallback((): Promise<CreateCommitmentResponse> | undefined => {
    if (!wizardData.templateType || !wizardData.startDate || !wizardData.endDate) {
      return;
    }

    // Get device timezone
    const timezone = Localization.getCalendars()[0]?.timeZone ?? 'UTC';

    // Build frequency config
    const frequencyConfig = {
      type: wizardData.frequencyType,
      ...(wizardData.frequencyType === 'TIMES_PER_WEEK' || wizardData.frequencyType === 'TIMES_PER_MONTH'
        ? { targetCount: wizardData.frequencyTargetCount }
        : {}),
      ...(wizardData.frequencyType === 'SPECIFIC_DAYS' && wizardData.frequencySpecificDays.length > 0
        ? { specificDays: wizardData.frequencySpecificDays }
        : {}),
    };

    // Build schedule config (only if preferred time is set)
    const scheduleConfig = wizardData.preferredTime
      ? {
          preferredTime: wizardData.preferredTime,
          reminderMinutesBefore: wizardData.reminderMinutesBefore,
          reminderAtTime: wizardData.reminderAtTime,
        }
      : undefined;

    const request: CreateCommitmentRequest = {
      templateType: wizardData.templateType,
      timezone,
      startDate: wizardData.startDate,
      endDate: wizardData.endDate,
      stakeAmountCents: wizardData.stakeAmountCents,
      distributionConfig: {
        charityPercent: wizardData.charityPercent,
        supportersPercent: wizardData.supportersPercent,
      },
      // Frequency & Schedule
      frequencyConfig,
      ...(scheduleConfig && { scheduleConfig }),
      ...(wizardData.whyNote.trim() && { whyNote: wizardData.whyNote.trim() }),
      // Payment fields (country is auto-detected from IP by backend)
      ...(wizardData.customerDocument && {
        customerDocument: wizardData.customerDocument.replace(/\D/g, ''), // Send raw digits
      }),
      ...(wizardData.customerEmail && {
        customerEmail: wizardData.customerEmail,
      }),
      // Include initial supporters if any were added
      ...(wizardData.pendingSupporters.length > 0 && {
        initialSupporters: wizardData.pendingSupporters.map((s) => ({
          email: s.email,
          phone: s.phone,
          role: s.role,
        })),
      }),
      // Include verification authority type
      verificationAuthorityType: wizardData.verificationAuthorityType,
      // Custodian mode (Closed Alpha) - backend will lookup user by email
      ...(wizardData.custodianEmail && {
        custodianEmail: wizardData.custodianEmail.trim().toLowerCase(),
      }),
    };

    return mutation.mutateAsync(request);
  }, [wizardData, mutation]);

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        // Template selection
        return wizardData.templateType !== null;
      case 2:
        // Date selection
        return wizardData.startDate !== null && wizardData.endDate !== null;
      case 3:
        // Frequency configuration
        if (wizardData.frequencyType === 'SPECIFIC_DAYS') {
          return wizardData.frequencySpecificDays.length > 0;
        }
        if (wizardData.frequencyType === 'TIMES_PER_WEEK') {
          return wizardData.frequencyTargetCount >= 1 && wizardData.frequencyTargetCount <= 7;
        }
        if (wizardData.frequencyType === 'TIMES_PER_MONTH') {
          return wizardData.frequencyTargetCount >= 1 && wizardData.frequencyTargetCount <= 30;
        }
        return true; // DAILY always valid
      case 4:
        // Schedule configuration - optional, always can proceed
        return true;
      case 5:
        // Motivation/Why note - optional, always can proceed
        return true;
      case 6:
        // Stake amount
        return (
          wizardData.stakeAmountCents >= 500 &&
          wizardData.stakeAmountCents <= 100000
        );
      case 7:
        // Distribution config
        return wizardData.charityPercent + wizardData.supportersPercent === 100;
      case 8:
        // Supporters step - can proceed with or without supporters
        return true;
      case 9:
        // Custodian step - optional, always can proceed (custodian email is validated on submit)
        return true;
      case 10:
        // Verification settings - validate supporter requirements
        // If user selected a voting option that requires supporters, they must have at least one
        const requiresSupporters = wizardData.verificationAuthorityType !== 'SELF_ONLY';
        if (requiresSupporters && wizardData.pendingSupporters.length === 0) {
          return false;
        }
        return true;
      case 11:
        // Review step - always can proceed
        return true;
      default:
        return false;
    }
  }, [currentStep, wizardData]);

  return {
    currentStep,
    totalSteps,
    wizardData,
    updateWizardData,
    setTemplateType, // Apply template defaults when selecting a template
    nextStep,
    prevStep,
    resetWizard,
    submitCommitment,
    canProceed,
    addPendingSupporter,
    removePendingSupporter,
    setCustodianEmail,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
