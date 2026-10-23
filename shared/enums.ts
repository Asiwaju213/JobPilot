/**
 * Shared enums and types for JobPilot.
 *
 * Used by both backend and frontend to keep values consistent across the
 * stack. These mirror the Prisma schema enums, which are defined separately
 * in backend/prisma/schema.prisma.
 *
 * IMPORTANT distinction (see architecture):
 * - OpportunityType = what kind of opportunity this is (career / life-stage
 *   sense). IT/Industrial Training, Internship, Graduate/Entry-level,
 *   Full-time, Part-time, Contract, Freelance.
 * - EmploymentType = the contractual employment arrangement of a role:
 *   permanent, fixed_term, temporary, self_employed, apprenticeship.
 * - WorkArrangement = where/how the work is performed: remote, hybrid, onsite.
 *
 * These three are independent dimensions. A job has all three.
 */

/** What kind of opportunity this is (career / life-stage sense). */
export const OpportunityType = {
  ItIndustrialTraining: "ItIndustrialTraining",
  Internship: "Internship",
  GraduateEntryLevel: "GraduateEntryLevel",
  FullTime: "FullTime",
  PartTime: "PartTime",
  Contract: "Contract",
  Freelance: "Freelance",
  Other: "Other",
} as const;
export type OpportunityType = (typeof OpportunityType)[keyof typeof OpportunityType];

/** The contractual employment arrangement of a role. */
export const EmploymentType = {
  Permanent: "Permanent",
  FixedTerm: "FixedTerm",
  Temporary: "Temporary",
  SelfEmployed: "SelfEmployed",
  Apprenticeship: "Apprenticeship",
  Other: "Other",
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

/** Where and how the work is performed. */
export const WorkArrangement = {
  Remote: "Remote",
  Hybrid: "Hybrid",
  OnSite: "OnSite",
  Unknown: "Unknown",
} as const;
export type WorkArrangement = (typeof WorkArrangement)[keyof typeof WorkArrangement];

/** Application lifecycle states. Approval-first: draft → ready_for_review → approved → submitted. */
export const ApplicationState = {
  Draft: "Draft",
  ReadyForReview: "ReadyForReview",
  Approved: "Approved",
  Submitted: "Submitted",
  Interview: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
  Other: "Other",
} as const;
export type ApplicationState = (typeof ApplicationState)[keyof typeof ApplicationState];

/** CV processing status. */
export const ProcessingStatus = {
  Uploaded: "Uploaded",
  Processing: "Processing",
  Ready: "Ready",
  Failed: "Failed",
} as const;
export type ProcessingStatus = (typeof ProcessingStatus)[keyof typeof ProcessingStatus];

/** Discovery status for a job seen by a profile. */
export const DiscoveryStatus = {
  New: "New",
  Seen: "Seen",
  Saved: "Saved",
  Dismissed: "Dismissed",
  Applied: "Applied",
  Other: "Other",
} as const;
export type DiscoveryStatus = (typeof DiscoveryStatus)[keyof typeof DiscoveryStatus];

/** Match recommendation. */
export const MatchRecommendation = {
  Relevant: "Relevant",
  Maybe: "Maybe",
  NotRelevant: "NotRelevant",
} as const;
export type MatchRecommendation = (typeof MatchRecommendation)[keyof typeof MatchRecommendation];

/** User account status. */
export const UserStatus = {
  Active: "Active",
  EmailUnverified: "EmailUnverified",
  Suspended: "Suspended",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** Profile status. */
export const ProfileStatus = {
  Active: "Active",
  Archived: "Archived",
} as const;
export type ProfileStatus = (typeof ProfileStatus)[keyof typeof ProfileStatus];

/** Notification types. */
export const NotificationType = {
  NewJobs: "NewJobs",
  ApplicationStatus: "ApplicationStatus",
  BrowserInputRequired: "BrowserInputRequired",
  EmailDraftReady: "EmailDraftReady",
  ScheduledSearchResults: "ScheduledSearchResults",
  Other: "Other",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/** Job source status. */
export const SourceStatus = {
  Active: "Active",
  Inactive: "Inactive",
} as const;
export type SourceStatus = (typeof SourceStatus)[keyof typeof SourceStatus];
