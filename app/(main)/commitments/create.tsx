import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Localization from "expo-localization";
import { SafeScreen } from "@/shared/components/layout/SafeScreen";
import { Header } from "@/shared/components/layout/Header";
import { Card } from "@/shared/components/ui/Card";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { DatePickerButton } from "@/shared/components/ui/DatePickerButton";
import { TemplateSelector } from "@/features/commitments/components/TemplateSelector";
import {
  CpfInput,
  isValidCpf,
} from "@/features/commitments/components/CpfInput";
import { PixPaymentModal } from "@/features/commitments/components/PixPaymentModal";
import { AddSupportersStep } from "@/features/commitments/components/AddSupportersStep";
import { VerificationSettingsStep } from "@/features/commitments/components/wizard/VerificationSettingsStep";
import { FrequencyStep } from "@/features/commitments/components/wizard/FrequencyStep";
import { ScheduleStep } from "@/features/commitments/components/wizard/ScheduleStep";
import { MotivationStep } from "@/features/commitments/components/wizard/MotivationStep";
import { CustodianStep } from "@/features/commitments/components/wizard/CustodianStep";
import { useCreateCommitment } from "@/features/commitments/hooks/useCreateCommitment";
import {
  formatCurrency,
  getCurrencySymbol,
  isBrazilianLocale,
} from "@/shared/utils/format.utils";
import type { TemplateType } from "@api/types";
import { formatFrequency } from "@api/types/commitment.types";
import { useHideTabBar } from "@/shared/contexts/TabBarVisibilityContext";

// Get default country from device locale
function getDefaultCountry(): string {
  const locales = Localization.getLocales();
  const isBrazilian = locales.some(
    (locale) =>
      locale.languageTag?.startsWith("pt-BR") || locale.regionCode === "BR"
  );
  return isBrazilian ? "BR" : "US";
}

const TEMPLATE_LABELS: Record<
  TemplateType,
  | "templates.quit_smoking"
  | "templates.exercise"
  | "templates.meditation"
  | "templates.diet"
  | "templates.sleep"
  | "templates.custom"
> = {
  QUIT_SMOKING: "templates.quit_smoking",
  EXERCISE: "templates.exercise",
  MEDITATION: "templates.meditation",
  DIET: "templates.diet",
  SLEEP: "templates.sleep",
  CUSTOM: "templates.custom",
};

export default function CreateCommitmentScreen() {
  useHideTabBar();
  const router = useRouter();
  const { t } = useTranslation("commitments");
  const insets = useSafeAreaInsets();

  const {
    currentStep,
    totalSteps,
    wizardData,
    updateWizardData,
    setTemplateType,
    nextStep,
    prevStep,
    resetWizard,
    submitCommitment,
    canProceed,
    isSubmitting,
    isSuccess,
    error,
    addPendingSupporter,
    removePendingSupporter,
    setCustodianEmail,
  } = useCreateCommitment();

  // PIX payment modal state
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    copyPaste: string;
    expiresAt: string;
  } | null>(null);

  // Payment error state (commitment created but payment failed)
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [createdCommitmentId, setCreatedCommitmentId] = useState<string | null>(
    null
  );

  // Show CPF input for Brazilian users (based on device locale)
  // Backend auto-detects country from IP for payment routing
  const showCpfInput = getDefaultCountry() === "BR";

  const handleTemplateSelect = (templateType: TemplateType) => {
    // Use setTemplateType to apply template-specific defaults for frequency/schedule
    setTemplateType(templateType);
  };

  const handleSubmit = async () => {
    // Clear any previous payment error
    setPaymentError(null);
    setCreatedCommitmentId(null);

    try {
      const response = await submitCommitment();

      // Check if there was a payment error (commitment created but payment failed)
      if (response?.paymentError) {
        setPaymentError(response.paymentError);
        setCreatedCommitmentId(response.id);
        // Don't navigate away - show error state with retry option
        return;
      }

      // Manual-custody routing by state:
      //  - PENDING_DEPOSIT: a custodian is already set -> go pay the deposit.
      //  - PENDING_CUSTODIAN: no money-holder yet -> open the commitment so the
      //    creator can assign/invite one (the deposit doesn't exist yet, so the
      //    deposit screen would 404).
      if (response?.id && response.state === 'PENDING_DEPOSIT') {
        router.replace({
          pathname: "/(main)/commitments/[id]/deposit",
          params: { id: response.id },
        });
      } else if (response?.id && response.state === 'PENDING_CUSTODIAN') {
        router.replace({
          pathname: "/(main)/commitments/[id]",
          params: { id: response.id },
        });
      } else if (
        // Check if PIX payment is required
        response?.pixQrCode &&
        response?.pixCopyPaste &&
        response?.paymentExpiresAt
      ) {
        setPixData({
          qrCode: response.pixQrCode,
          copyPaste: response.pixCopyPaste,
          expiresAt: response.paymentExpiresAt,
        });
        setShowPixModal(true);
      } else {
        // No PIX required, navigate to commitments list
        router.replace("/(main)/commitments");
      }
    } catch (err) {
      console.error("Failed to create commitment:", err);
    }
  };

  const handlePaymentErrorDismiss = () => {
    // Navigate to commitment list - user can retry payment from there
    setPaymentError(null);
    setCreatedCommitmentId(null);
    router.replace("/(main)/commitments");
  };

  const handlePixModalClose = () => {
    setShowPixModal(false);
    setPixData(null);
    router.replace("/(main)/commitments");
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.replace("/(main)/commitments");
    } else {
      prevStep();
    }
  };

  const handleCancel = () => {
    resetWizard();
    router.replace("/(main)/commitments");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text className="text-lg font-semibold text-neutral-700 mb-4">
              {t("wizard.step1")}
            </Text>
            <TemplateSelector
              selectedTemplate={wizardData.templateType}
              onSelect={handleTemplateSelect}
            />
          </>
        );

      case 2:
        // Calculate date constraints
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDateValue = wizardData.startDate
          ? new Date(wizardData.startDate)
          : null;

        const endDateValue = wizardData.endDate
          ? new Date(wizardData.endDate)
          : null;

        // Minimum end date is day after start date (or tomorrow if no start)
        const minEndDate = startDateValue
          ? new Date(startDateValue.getTime() + 24 * 60 * 60 * 1000)
          : new Date(today.getTime() + 24 * 60 * 60 * 1000);

        return (
          <>
            <Text className="text-lg font-semibold text-neutral-700 mb-4">
              {t("wizard.step2")}
            </Text>
            <View className="mb-4">
              <DatePickerButton
                label={t("wizard.startDate")}
                value={startDateValue}
                onChange={(date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  updateWizardData({ startDate: dateStr });
                  // Clear end date if it's now invalid (before new start date)
                  if (endDateValue && date >= endDateValue) {
                    updateWizardData({ endDate: null });
                  }
                }}
                placeholder={t("wizard.selectStartDate")}
                minimumDate={today}
                helperText={t("wizard.startDateHelper")}
              />
            </View>
            <View>
              <DatePickerButton
                label={t("wizard.endDate")}
                value={endDateValue}
                onChange={(date) => {
                  const dateStr = date.toISOString().split("T")[0];
                  updateWizardData({ endDate: dateStr });
                }}
                placeholder={t("wizard.selectEndDate")}
                minimumDate={minEndDate}
                helperText={t("wizard.endDateHelper")}
                error={
                  startDateValue &&
                  endDateValue &&
                  endDateValue <= startDateValue
                    ? t("wizard.endDateError")
                    : undefined
                }
              />
            </View>
          </>
        );

      case 3:
        // Frequency configuration step
        return (
          <FrequencyStep
            frequencyType={wizardData.frequencyType}
            targetCount={wizardData.frequencyTargetCount}
            specificDays={wizardData.frequencySpecificDays}
            onFrequencyTypeChange={(type) =>
              updateWizardData({ frequencyType: type })
            }
            onTargetCountChange={(count) =>
              updateWizardData({ frequencyTargetCount: count })
            }
            onSpecificDaysChange={(days) =>
              updateWizardData({ frequencySpecificDays: days })
            }
          />
        );

      case 4:
        // Schedule configuration step
        return (
          <ScheduleStep
            preferredTime={wizardData.preferredTime}
            reminderMinutesBefore={wizardData.reminderMinutesBefore}
            reminderAtTime={wizardData.reminderAtTime}
            onPreferredTimeChange={(time) =>
              updateWizardData({ preferredTime: time })
            }
            onReminderMinutesChange={(minutes) =>
              updateWizardData({ reminderMinutesBefore: minutes })
            }
            onReminderAtTimeChange={(enabled) =>
              updateWizardData({ reminderAtTime: enabled })
            }
          />
        );

      case 5:
        // Motivation step (before financial commitment)
        return (
          <MotivationStep
            templateType={wizardData.templateType}
            whyNote={wizardData.whyNote}
            onWhyNoteChange={(note) => updateWizardData({ whyNote: note })}
          />
        );

      case 6:
        // Use i18n language for currency (not device locale)
        const isBrLocale = isBrazilianLocale();
        const currencySymbol = getCurrencySymbol();
        const minStake = isBrLocale ? 2500 : 500; // R$25 or $5
        const maxStake = isBrLocale ? 500000 : 100000; // R$5000 or $1000

        // Preset amounts based on i18n language
        const presetAmounts = isBrLocale
          ? [2500, 5000, 10000, 25000, 50000] // R$25, R$50, R$100, R$250, R$500
          : [500, 1000, 2500, 5000, 10000]; // $5, $10, $25, $50, $100

        const isCustomAmount = !presetAmounts.includes(
          wizardData.stakeAmountCents
        );

        return (
          <>
            <Text className="text-lg font-semibold text-neutral-700 mb-6">
              {t("wizard.stepStake")}
            </Text>

            {/* Main stake display with editable input */}
            <Card variant="elevated" className="mb-6">
              <View className="items-center py-4">
                <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
                  {t("wizard.stakeAmount")}
                </Text>

                {/* Large editable amount */}
                <View className="flex-row items-baseline justify-center mb-3">
                  <Text className="text-3xl font-bold text-primary-600 mr-2">
                    {currencySymbol}
                  </Text>
                  <TextInput
                    className="text-4xl font-bold text-primary-600 w-[120px] text-left p-0"
                    keyboardType="numeric"
                    maxLength={4}
                    value={String(
                      Math.round(wizardData.stakeAmountCents / 100)
                    )}
                    onChangeText={(text) => {
                      const numericValue =
                        parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
                      const cents = Math.min(
                        Math.max(numericValue * 100, minStake),
                        maxStake
                      );
                      updateWizardData({ stakeAmountCents: cents });
                    }}
                    selectTextOnFocus
                    accessibilityLabel={t("wizard.stakeAmount")}
                  />
                </View>

                {/* Range indicator */}
                <Text className="text-sm text-neutral-400">
                  {t("wizard.stakeRange")}
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-neutral-100 mx-4" />

              {/* Quick select presets */}
              <View className="pt-4 pb-2">
                <Text className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-2">
                  {t("wizard.quickSelect")}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 8 }}
                >
                  <View className="flex-row gap-2">
                    {presetAmounts.map((amount) => (
                      <Pressable
                        key={amount}
                        onPress={() =>
                          updateWizardData({ stakeAmountCents: amount })
                        }
                        className={`px-5 py-3 rounded-xl border ${
                          wizardData.stakeAmountCents === amount
                            ? "border-primary-500 bg-primary-500"
                            : "border-neutral-200 bg-neutral-50"
                        }`}
                      >
                        <Text
                          className={`text-sm font-bold ${
                            wizardData.stakeAmountCents === amount
                              ? "text-white"
                              : "text-neutral-700"
                          }`}
                        >
                          {formatCurrency(amount)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </Card>

            {/* Stake locking warning */}
            <View className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-start gap-3">
                <View className="w-7 h-7 rounded-full bg-warning-500 items-center justify-center">
                  <Text className="text-white text-base font-bold">!</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-warning-700 mb-1">
                    {t("wizard.stakeLockInfoTitle")}
                  </Text>
                  <Text className="text-sm text-neutral-600 leading-relaxed">
                    {t("wizard.stakeLockInfo")}
                  </Text>
                </View>
              </View>
            </View>

            {/* CPF Input for Brazilian users */}
            {showCpfInput && (
              <View>
                <CpfInput
                  label={t("wizard.cpf")}
                  value={wizardData.customerDocument || ""}
                  onChange={(value) =>
                    updateWizardData({ customerDocument: value })
                  }
                  placeholder={t("wizard.cpfPlaceholder")}
                  helperText={t("wizard.cpfRequired")}
                  error={
                    wizardData.customerDocument &&
                    !isValidCpf(wizardData.customerDocument)
                      ? t("wizard.cpfInvalid")
                      : undefined
                  }
                />
              </View>
            )}
          </>
        );

      case 7:
        // Distribution configuration step
        return (
          <>
            <Text className="text-lg font-semibold text-neutral-700 mb-4">
              {t("wizard.stepDistribution")}
            </Text>
            <Card variant="outlined" className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-700">
                  {t("wizard.charityPercent")}
                </Text>
                <Text className="text-lg font-bold text-neutral-900">
                  {wizardData.charityPercent}%
                </Text>
              </View>
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary-500"
                  style={{ width: `${wizardData.charityPercent}%` }}
                />
              </View>
            </Card>
            <Card variant="outlined">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-neutral-700">
                  {t("wizard.supportersPercent")}
                </Text>
                <Text className="text-lg font-bold text-neutral-900">
                  {wizardData.supportersPercent}%
                </Text>
              </View>
              <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-warning"
                  style={{ width: `${wizardData.supportersPercent}%` }}
                />
              </View>
            </Card>
            <View className="flex-row justify-between mt-4 gap-3">
              {[
                { charity: 100, supporters: 0, label: "100/0" },
                { charity: 75, supporters: 25, label: "75/25" },
                { charity: 50, supporters: 50, label: "50/50" },
                { charity: 25, supporters: 75, label: "25/75" },
                { charity: 0, supporters: 100, label: "0/100" },
              ].map(({ charity, supporters, label }) => (
                <Pressable
                  key={label}
                  onPress={() =>
                    updateWizardData({
                      charityPercent: charity,
                      supportersPercent: supporters,
                    })
                  }
                  className={`flex-1 py-2 rounded-lg border ${
                    wizardData.charityPercent === charity
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200"
                  }`}
                >
                  <Text
                    className={`text-center text-xs font-medium ${
                      wizardData.charityPercent === charity
                        ? "text-primary-600"
                        : "text-neutral-700"
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        );

      case 8:
        // Supporters step
        return (
          <AddSupportersStep
            pendingSupporters={wizardData.pendingSupporters}
            onAddSupporter={addPendingSupporter}
            onRemoveSupporter={removePendingSupporter}
          />
        );

      case 9:
        // Custodian step (Closed Alpha)
        return (
          <CustodianStep
            custodianEmail={wizardData.custodianEmail}
            onSetCustodianEmail={setCustodianEmail}
          />
        );

      case 10:
        // Verification settings step
        return (
          <VerificationSettingsStep
            selectedAuthority={wizardData.verificationAuthorityType}
            onSelectAuthority={(authority) =>
              updateWizardData({ verificationAuthorityType: authority })
            }
            supporterCount={wizardData.pendingSupporters.length}
          />
        );

      case 11:
        // Review step - show summary of all configuration
        return (
          <>
            <Text className="text-lg font-semibold text-neutral-700 mb-4">
              {t("wizard.stepReview")}
            </Text>
            <Card variant="elevated">
              <Text className="text-xl font-bold text-neutral-900 mb-4">
                {t("wizard.reviewTitle")}
              </Text>

              <View className="gap-3">
                {/* Template */}
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">{t("wizard.template")}</Text>
                  <Text className="text-neutral-900 font-medium">
                    {wizardData.templateType
                      ? t(TEMPLATE_LABELS[wizardData.templateType])
                      : "-"}
                  </Text>
                </View>

                {/* Dates */}
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.startDate")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {wizardData.startDate || "-"}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.endDate")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {wizardData.endDate || "-"}
                  </Text>
                </View>

                {/* Frequency */}
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.frequency")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {formatFrequency({
                      type: wizardData.frequencyType,
                      targetCount: wizardData.frequencyTargetCount,
                      specificDays: wizardData.frequencySpecificDays,
                    })}
                  </Text>
                </View>

                {/* Schedule (only if set) */}
                {wizardData.preferredTime && (
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">
                      {t("wizard.preferredTime")}
                    </Text>
                    <Text className="text-neutral-900 font-medium">
                      {wizardData.preferredTime}
                    </Text>
                  </View>
                )}

                {/* Why note (only if set) */}
                {wizardData.whyNote.trim() && (
                  <View>
                    <Text className="text-neutral-600 mb-1">
                      {t("wizard.motivation")}
                    </Text>
                    <Text className="text-neutral-900 font-medium text-sm italic">
                      "{wizardData.whyNote.trim()}"
                    </Text>
                  </View>
                )}

                {/* Divider */}
                <View className="h-px bg-neutral-100 my-2" />

                {/* Financial */}
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.stakeAmount")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {formatCurrency(wizardData.stakeAmountCents)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.charityPercent")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {wizardData.charityPercent}%
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.supportersPercent")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {wizardData.supportersPercent}%
                  </Text>
                </View>

                {/* Supporters and Verification */}
                {wizardData.pendingSupporters.length > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">
                      {t("wizard.supportersCount")}
                    </Text>
                    <Text className="text-neutral-900 font-medium">
                      {wizardData.pendingSupporters.length}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-neutral-600">
                    {t("wizard.verificationAuthority")}
                  </Text>
                  <Text className="text-neutral-900 font-medium">
                    {t(
                      `verification.${wizardData.verificationAuthorityType.toLowerCase()}.short` as any
                    )}
                  </Text>
                </View>

                {/* Custodian (Closed Alpha) */}
                {wizardData.custodianEmail && (
                  <View className="flex-row justify-between">
                    <Text className="text-neutral-600">Custodian</Text>
                    <Text className="text-neutral-900 font-medium">
                      {wizardData.custodianEmail}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {error && (
              <Text className="text-error text-center mt-4">
                {t("wizard.createError")}
              </Text>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeScreen edges={['top']}>
      <Header
        title={t("createNew")}
        showBack
        onBackPress={handleBack}
        rightAction={
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-primary-500 font-medium">
              {t("reportFailure.cancel")}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {renderStepContent()}
      </ScrollView>

      <View className="flex-row gap-3 mt-4" style={{ paddingBottom: insets.bottom + 16 }}>
        {currentStep > 1 && (
          <View style={{ flex: 1 }}>
            <Button
              title={t("wizard.back")}
              onPress={prevStep}
              variant="outline"
              fullWidth
            />
          </View>
        )}
        {currentStep < totalSteps ? (
          <View style={{ flex: 1 }}>
            <Button
              title={t("wizard.next")}
              onPress={nextStep}
              disabled={!canProceed()}
              fullWidth
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Button
              title={t("wizard.createCommitment")}
              onPress={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        )}
      </View>

      {/* PIX Payment Modal */}
      {pixData && (
        <PixPaymentModal
          visible={showPixModal}
          onClose={handlePixModalClose}
          qrCode={pixData.qrCode}
          copyPaste={pixData.copyPaste}
          expiresAt={pixData.expiresAt}
        />
      )}

      {/* Payment Error Modal */}
      <Modal
        visible={!!paymentError}
        title={t("wizard.paymentErrorTitle")}
        onClose={handlePaymentErrorDismiss}
      >
        <View className="gap-4">
          <Text className="text-neutral-700 text-base">
            {t("wizard.paymentErrorMessage")}
          </Text>
          <Card variant="outlined" className="bg-warning/10 border-warning">
            <Text className="text-neutral-600 text-sm">{paymentError}</Text>
          </Card>
          <Text className="text-neutral-500 text-sm">
            {t("wizard.paymentErrorRetry")}
          </Text>
          <Button
            title={t("wizard.goToCommitments")}
            onPress={handlePaymentErrorDismiss}
            className="mt-2"
          />
        </View>
      </Modal>
    </SafeScreen>
  );
}
