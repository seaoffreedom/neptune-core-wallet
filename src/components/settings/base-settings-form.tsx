/**
 * Base Settings Form Component
 *
 * Provides a reusable base for all settings forms to eliminate DRY violations.
 * Handles common patterns like field changes, form structure, and Zustand integration.
 */

import type { ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

/**
 * Base props for all settings forms
 */
export interface BaseSettingsFormProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T>;
  updateSettings: (settings: Partial<T>) => void;
  children: ReactNode;
}

/**
 * Base settings form component that provides common functionality
 */
export function BaseSettingsForm<T extends Record<string, unknown>>({
  form,
  children,
}: BaseSettingsFormProps<T>) {
  return (
    <Form {...form}>
      <form className="space-y-6">{children}</form>
    </Form>
  );
}

/**
 * Reusable form field components for common input types
 */
export const SettingsFormFields = {
  /**
   * Switch field for boolean values
   */
  Switch: <T extends Record<string, unknown>>({
    form,
    name,
    label,
    description,
    updateSettings,
    onValueChange,
  }: {
    form: UseFormReturn<T>;
    name: keyof T;
    label: string;
    description?: string;
    updateSettings: (settings: Partial<T>) => void;
    onValueChange?: (value: boolean) => void;
  }) => (
    <FormField
      control={form.control}
      name={name as string}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value ?? false}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                updateSettings({
                  [name]: checked,
                } as Partial<T>);
                onValueChange?.(checked);
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  ),

  /**
   * Select field for dropdown values
   */
  Select: <T extends Record<string, unknown>>({
    form,
    name,
    label,
    description,
    placeholder,
    options,
    updateSettings,
    onValueChange,
  }: {
    form: UseFormReturn<T>;
    name: keyof T;
    label: string;
    description?: string;
    placeholder?: string;
    options: Array<{ value: string; label: string }>;
    updateSettings: (settings: Partial<T>) => void;
    onValueChange?: (value: string) => void;
  }) => (
    <FormField
      control={form.control}
      name={name as string}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              updateSettings({ [name]: value } as Partial<T>);
              onValueChange?.(value);
            }}
            value={field.value ? String(field.value) : ''}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  /**
   * Input field for text/number values
   */
  Input: <T extends Record<string, unknown>>({
    form,
    name,
    label,
    description,
    type = 'text',
    placeholder,
    onValueChange,
  }: {
    form: UseFormReturn<T>;
    name: keyof T;
    label: string;
    description?: string;
    type?: 'text' | 'number' | 'email' | 'password';
    placeholder?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <FormField
      control={form.control}
      name={name as string}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onValueChange?.(e.target.value);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  /**
   * Card wrapper for form sections
   */
  Card: ({
    title,
    description,
    children,
  }: {
    title: string;
    description?: string;
    children: ReactNode;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  ),

  /**
   * Separator for visual grouping
   */
  Separator: () => <Separator />,
};
