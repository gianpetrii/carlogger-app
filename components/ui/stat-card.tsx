import * as React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgClass?: string;
  className?: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = '#71717a',
  iconBgClass = 'bg-muted',
  className,
}: StatCardProps) {
  return (
    <View className={cn('rounded-xl border border-border bg-card p-4 gap-3', className)}>
      <View className="flex-row items-center justify-between">
        <Text variant="small" className="text-muted-foreground font-medium flex-1">{title}</Text>
        <View className={cn('w-8 h-8 rounded-lg items-center justify-center', iconBgClass)}>
          <Icon size={18} color={iconColor} />
        </View>
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      {description && (
        <Text variant="muted" className="text-xs">{description}</Text>
      )}
    </View>
  );
}

export { StatCard };
