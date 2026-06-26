import { z } from 'zod';

export const TrophySchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  category: z.string(),
  date: z.string(),
  icon: z.string()
}).passthrough();

export const ActionPlanSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  status: z.string(),
  reason: z.string(),
  dateCreated: z.string(),
  planText: z.string().optional()
}).passthrough();

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  employeeNumber: z.string().optional(),
  dept: z.string(),
  hours: z.number().optional().default(0),
  memberships: z.number().optional().default(0),
  creditCards: z.number().optional().default(0),
  warranty: z.number().optional().default(0),
  surveys: z.number().optional().default(0),
  rph: z.number().optional().default(0),
  transactions: z.number().optional().default(0),
  gap: z.string().optional(),
  basket: z.number().optional().default(0),
  m365: z.number().optional().default(0),
  audio: z.number().optional().default(0),
  opportunityGap: z.string().optional(),
  lastUpdated: z.number().optional(),
  trophies: z.array(TrophySchema).optional().default([]),
  actionPlans: z.array(ActionPlanSchema).optional().default([])
}).passthrough();

export const ShiftHourSchema = z.object({
  hourNumber: z.number().optional(),
  hour: z.string().optional(),
  startRevenue: z.union([z.number(), z.string()]).optional(),
  endRevenue: z.union([z.number(), z.string()]).optional(),
  revenue: z.union([z.number(), z.string()]).optional().default(0),
  apps: z.number().optional().default(0),
  pms: z.number().optional().default(0)
}).passthrough();

export const ShiftWinSchema = z.object({
  id: z.string(),
  empId: z.string(),
  type: z.enum(['app', 'pm']),
  timestamp: z.number()
}).passthrough();

export const ZoneAssignmentsSchema = z.record(z.string(), z.array(z.string()));

export const ShiftSchema = z.object({
  id: z.string(),
  date: z.string(),
  leader: z.string(),
  revenueGoal: z.number(),
  appsGoal: z.number(),
  pmsGoal: z.number(),
  hours: z.array(ShiftHourSchema).optional().default([]),
  wins: z.array(ShiftWinSchema).optional().default([]),
  zoneAssignments: ZoneAssignmentsSchema.optional().default({})
}).passthrough();

export const CoachingLogSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  employeeId: z.string(),
  employeeName: z.string().optional(),
  customerName: z.string(),
  category: z.string(),
  score: z.number(),
  notes: z.string(),
  avatar: z.string().optional(),
  timestamp: z.number().optional(),
  coachName: z.string().optional()
}).passthrough();

export const RosterSchema = z.array(EmployeeSchema);

export type EmployeeType = z.infer<typeof EmployeeSchema>;
export type ShiftHourType = z.infer<typeof ShiftHourSchema>;
export type ShiftWinType = z.infer<typeof ShiftWinSchema>;
export type ZoneAssignmentsType = z.infer<typeof ZoneAssignmentsSchema>;
export type ShiftType = z.infer<typeof ShiftSchema>;
export type CoachingLogType = z.infer<typeof CoachingLogSchema>;
export type RosterType = z.infer<typeof RosterSchema>;
export type TrophyType = z.infer<typeof TrophySchema>;
export type ActionPlanType = z.infer<typeof ActionPlanSchema>;
