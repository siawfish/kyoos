import React, { useCallback } from 'react';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';

interface UpdateBannerProps {
  /** Called when user taps "Update Now" */
  onUpdate: () => void;
  /** Called when user dismisses the sheet */
  onDismiss: () => void;
}

export default function UpdateBanner({ onUpdate, onDismiss }: Readonly<UpdateBannerProps>) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const iconColor = isDark ? colors.dark.secondary : colors.light.secondary;

  const handleClose = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  const handleUpdate = useCallback(() => {
    onUpdate();
  }, [onUpdate]);

  return (
    <ConfirmActionSheet
      isOpen
      isOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
      caption="UPDATE AVAILABLE"
      title="A new version is available"
      description="We've made improvements and fixed bugs for a better experience. Update now to get the latest version."
      onConfirm={handleUpdate}
      onCancel={handleClose}
      confirmText="Update now"
      cancelText="Later"
      snapPoints={['44%']}
      icon={<Ionicons name="download-outline" size={56} color={iconColor} />}
    />
  );
}
