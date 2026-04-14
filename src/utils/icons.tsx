import * as LucideIcons from 'lucide-react';

export const getIconComponent = (iconName: string | null | undefined) => {
  if (!iconName) {
    return LucideIcons.HelpCircle;
  }

  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.HelpCircle;
};
