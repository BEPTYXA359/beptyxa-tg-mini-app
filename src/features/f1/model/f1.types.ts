import { z } from 'zod';

export type F1SessionKind =
  | 'practice1'
  | 'practice2'
  | 'practice3'
  | 'sprintQualifying'
  | 'sprint'
  | 'qualifying'
  | 'race';

export interface F1SessionSchedule {
  id: string;
  season: number;
  round: number;
  kind: F1SessionKind;
  label: string;
  raceName?: string;
  startsAt: string;
  expectedEnd: string;
}

export interface F1ResultEntry {
  position: number | null;
  positionText: string;
  driverId?: string;
  driverNumber?: number;
  driverCode?: string;
  driverName: string;
  driverNameRu: string;
  constructorId?: string;
  constructorName: string;
  constructorNameRu: string;
  time?: string;
  gap?: string;
  laps?: number;
  status?: string;
  points?: number;
  segments?: Array<string | null>;
  dnf: boolean;
}

export interface F1StandingEntry {
  id: string;
  name: string;
  nameRu: string;
  position: number;
  previousPosition: number | null;
  positionDelta: number | null;
  points: number;
  pointsDelta: number | null;
}

export interface F1StandingsSnapshot {
  sessionId: string;
  capturedAt: string;
  drivers: F1StandingEntry[];
  constructors: F1StandingEntry[];
}

export interface F1OverviewRound {
  round: number;
  raceName: string;
  raceNameRu?: string;
  country: string;
  countryRu?: string;
  countryCode?: string;
  circuitName: string;
  startsAt: string;
  status: 'completed' | 'next' | 'upcoming';
}

export interface F1Overview {
  season: number;
  rounds: F1OverviewRound[];
  standings: F1StandingsSnapshot | null;
  lastCompletedGp: number | null;
  nextSession: F1SessionSchedule | null;
}

export interface F1GrandPrix {
  season: number;
  round: number;
  raceName: string;
  raceNameRu?: string;
  country: string;
  countryRu?: string;
  countryCode?: string;
  circuitName: string;
  circuitNameRu?: string;
  sessions: Array<F1SessionSchedule & { results: F1ResultEntry[] | null }>;
}

const remindersSchema = z
  .array(z.number().int().min(1).max(1440))
  .max(10)
  .refine((items) => new Set(items).size === items.length, 'Интервалы не должны повторяться')
  .transform((items) => [...items].sort((a, b) => a - b));

export const f1SettingsSchema = z.object({
  enabled: z.boolean().default(false),
  fullProtocols: z.boolean().default(false),
  reminders: remindersSchema.default([]),
});

export const updateF1SettingsSchema = z.object({
  enabled: z.boolean().optional(),
  fullProtocols: z.boolean().optional(),
  reminders: remindersSchema.optional(),
});

export type F1Settings = z.infer<typeof f1SettingsSchema>;
export type UpdateF1Settings = z.infer<typeof updateF1SettingsSchema>;

export const DEFAULT_F1_SETTINGS: F1Settings = {
  enabled: false,
  fullProtocols: false,
  reminders: [],
};

export const F1_REMINDER_PRESETS = [5, 15, 30, 60, 120] as const;
export const F1_TABS = ['calendar', 'standings', 'settings'] as const;
export type F1Tab = (typeof F1_TABS)[number];
