import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ModalProps as RNModalProps,
} from 'react-native';

interface ModalProps extends Omit<RNModalProps, 'children'> {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
  showCloseButton?: boolean;
}

export function Modal({
  children,
  title,
  visible,
  onClose,
  showCloseButton = true,
  ...props
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <TouchableWithoutFeedback>
            <View className="bg-white rounded-2xl w-full max-w-md p-6">
              {(title || showCloseButton) && (
                <View className="flex-row justify-between items-center mb-4">
                  {title && (
                    <Text className="text-xl font-bold text-neutral-900">
                      {title}
                    </Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      onPress={onClose}
                      className="p-2 -m-2"
                      accessibilityLabel="Close modal"
                      accessibilityRole="button"
                    >
                      <Text className="text-2xl text-neutral-400">×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}
