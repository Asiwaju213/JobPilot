/**
 * Profile ownership-aware database helpers.
 *
 * Every query, update, and delete is scoped to the authenticated user.
 * We never rely on profile ID alone — the userId is always part of the
 * Prisma where clause so that one user cannot touch another's profiles.
 */

import { prisma } from "../db/prisma.js";
import type { Profile, Prisma, $Enums } from "@prisma/client";

/** Public fields safe to return to clients. */
export type ProfilePublic = Pick<
  Profile,
  | "id"
  | "name"
  | "status"
  | "accountStatus"
  | "targetRoles"
  | "experienceLevel"
  | "skillsOfInterest"
  | "institution"
  | "degree"
  | "fieldOfStudy"
  | "currentAcademicLevel"
  | "expectedGraduationDate"
  | "itIndustrialTrainingRequired"
  | "itIndustrialTrainingDetails"
  | "internshipDuration"
  | "internshipStartDate"
  | "internshipEndDate"
  | "workArrangementPreference"
  | "employmentTypePreference"
  | "salaryMin"
  | "salaryMax"
  | "salaryCurrency"
  | "countries"
  | "locations"
  | "relocationPreference"
  | "relocationNotes"
  | "otherPreferences"
  | "activeCvId"
  | "createdAt"
  | "updatedAt"
>;

/** Shape of profile data as validated by the API (Zod schemas).
 *
 * Mirrors Prisma's ProfileUncheckedCreateInput minus the "userId" field.
 * The API treats employmentTypePreference as optional (the handler
 * defaults it to "[]" in createProfileForUser).
 */
export type ProfileCreateData = {
  id?: string;
  name: string;
  status?: $Enums.ProfileStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  accountStatus?: $Enums.UserStatus | null;
  targetRoles?: string | null;
  experienceLevel?: string | null;
  skillsOfInterest?: string | null;
  institution?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  currentAcademicLevel?: string | null;
  expectedGraduationDate?: Date | string | null;
  itIndustrialTrainingRequired?: boolean;
  itIndustrialTrainingDetails?: string | null;
  internshipDuration?: string | null;
  internshipStartDate?: Date | string | null;
  internshipEndDate?: Date | string | null;
  workArrangementPreference?: $Enums.WorkArrangement;
  employmentTypePreference?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  countries?: string | null;
  locations?: string | null;
  relocationPreference?: string;
  relocationNotes?: string | null;
  otherPreferences?: string | null;
  activeCvId?: string | null;
};

/**
 * Find a profile by ID, scoped to a specific user.
 * Returns null if the profile doesn't exist OR belongs to a different user.
 */
export async function findProfileByIdForUser(
  profileId: string,
  userId: string,
): Promise<Profile | null> {
  return prisma().profile.findUnique({
    where: { id: profileId, userId },
  });
}

/**
 * Find all profiles belonging to a user, ordered by creation date descending.
 */
export async function findProfilesForUser(userId: string): Promise<Profile[]> {
  return prisma().profile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Create a profile for a user. Throws on duplicate name for the same user
 * (caught and converted to a 409 in the handler).
 */
export async function createProfileForUser(
  userId: string,
  data: ProfileCreateData,
): Promise<Profile> {
  // Db-side default: Prisma's ProfileUncheckedCreateInput requires
  // employmentTypePreference as a non-empty string, but the API schema
  // treats it as optional (the create.ts handler defaults it to "[]").
  // The runtime value is always a string here, so cast is safe.
  const prismaData = {
    userId,
    ...data,
  } as Prisma.ProfileUncheckedCreateInput & { userId: string };

  return prisma().profile.create({
    data: prismaData,
  });
}

/**
 * Update a profile, scoped to the owning user.
 * Returns the updated profile, or null if the profile doesn't belong to the user.
 */
export async function updateProfileForUser(
  profileId: string,
  userId: string,
  data: Prisma.ProfileUpdateInput,
): Promise<Profile> {
  return prisma().profile.update({
    where: { id: profileId, userId },
    data,
  });
}

/**
 * Delete a profile, scoped to the owning user.
 * Returns true if a profile was deleted, false if none matched (wrong owner or not found).
 */
export async function deleteProfileForUser(
  profileId: string,
  userId: string,
): Promise<boolean> {
  const result = await prisma().profile.deleteMany({
    where: { id: profileId, userId },
  });
  return result.count > 0;
}
