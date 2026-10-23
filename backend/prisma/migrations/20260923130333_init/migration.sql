-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('ItIndustrialTraining', 'Internship', 'GraduateEntryLevel', 'FullTime', 'PartTime', 'Contract', 'Freelance', 'Other');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('Permanent', 'FixedTerm', 'Temporary', 'SelfEmployed', 'Apprenticeship', 'Other');

-- CreateEnum
CREATE TYPE "WorkArrangement" AS ENUM ('Remote', 'Hybrid', 'OnSite', 'Unknown');

-- CreateEnum
CREATE TYPE "ApplicationState" AS ENUM ('Draft', 'ReadyForReview', 'Approved', 'Submitted', 'Interview', 'Offer', 'Rejected', 'Withdrawn', 'Other');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('Uploaded', 'Processing', 'Ready', 'Failed');

-- CreateEnum
CREATE TYPE "DiscoveryStatus" AS ENUM ('New', 'Seen', 'Saved', 'Dismissed', 'Applied', 'Other');

-- CreateEnum
CREATE TYPE "MatchRecommendation" AS ENUM ('Relevant', 'Maybe', 'NotRelevant');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'EmailUnverified', 'Suspended');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('Active', 'Archived');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NewJobs', 'ApplicationStatus', 'BrowserInputRequired', 'EmailDraftReady', 'ScheduledSearchResults', 'Other');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('Active', 'Inactive');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountStatus" "UserStatus" DEFAULT 'Active',
    "targetRoles" TEXT,
    "experienceLevel" TEXT,
    "skillsOfInterest" TEXT,
    "institution" TEXT,
    "degree" TEXT,
    "fieldOfStudy" TEXT,
    "currentAcademicLevel" TEXT,
    "expectedGraduationDate" TIMESTAMP(3),
    "itIndustrialTrainingRequired" BOOLEAN NOT NULL DEFAULT false,
    "itIndustrialTrainingDetails" TEXT,
    "internshipDuration" TEXT,
    "internshipStartDate" TIMESTAMP(3),
    "internshipEndDate" TIMESTAMP(3),
    "workArrangementPreference" "WorkArrangement" NOT NULL DEFAULT 'Unknown',
    "employmentTypePreference" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "countries" TEXT,
    "locations" TEXT,
    "relocationPreference" TEXT NOT NULL DEFAULT 'not_willing',
    "relocationNotes" TEXT,
    "otherPreferences" TEXT,
    "activeCvId" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cvs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "storageUrl" TEXT,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'Uploaded',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cvs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_cvs" (
    "profileId" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,

    CONSTRAINT "profile_cvs_pkey" PRIMARY KEY ("profileId","cvId")
);

-- CreateTable
CREATE TABLE "extracted_cv_data" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT,
    "model" TEXT,
    "schemaVersion" TEXT NOT NULL DEFAULT '1.0.0',

    CONSTRAINT "extracted_cv_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "locationOriginal" TEXT,
    "locationNormalized" TEXT,
    "workArrangement" "WorkArrangement" NOT NULL,
    "opportunityType" "OpportunityType" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
    "salaryText" TEXT,
    "descriptionText" TEXT,
    "descriptionHtml" TEXT,
    "requiredSkills" TEXT,
    "applicationUrl" TEXT,
    "deadline" TIMESTAMP(3),
    "rawData" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adapterName" TEXT NOT NULL,
    "isActive" "SourceStatus" NOT NULL DEFAULT 'Active',
    "supportsOpportunityTypes" TEXT NOT NULL,
    "supportsLocations" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_discoveries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "status" "DiscoveryStatus" NOT NULL DEFAULT 'New',
    "lastMatchedAt" TIMESTAMP(3),

    CONSTRAINT "job_discoveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_matches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "hardFilterPassed" BOOLEAN NOT NULL,
    "hardFilterDetails" TEXT,
    "ruleBasedPassed" BOOLEAN,
    "ruleBasedDetails" TEXT,
    "matchScore" DOUBLE PRECISION,
    "relevance" TEXT,
    "matchReasons" TEXT,
    "missingRequirements" TEXT,
    "recommendation" "MatchRecommendation" NOT NULL DEFAULT 'NotRelevant',
    "matcherVersion" TEXT,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "aiPromptVersion" TEXT,
    "ruleBasedVersion" TEXT,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reMatchedAt" TIMESTAMP(3),

    CONSTRAINT "job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "methodDetails" TEXT,
    "state" "ApplicationState" NOT NULL DEFAULT 'Draft',
    "stateChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "notes" TEXT,
    "submittedSnapshot" TEXT,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cronExpression" TEXT,
    "intervalSec" INTEGER,
    "sourceIds" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stored_secrets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stored_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_name_key" ON "profiles"("userId", "name");

-- CreateIndex
CREATE INDEX "cvs_userId_idx" ON "cvs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cvs_userId_label_storagePath_key" ON "cvs"("userId", "label", "storagePath");

-- CreateIndex
CREATE UNIQUE INDEX "extracted_cv_data_cvId_key" ON "extracted_cv_data"("cvId");

-- CreateIndex
CREATE INDEX "jobs_sourceId_idx" ON "jobs"("sourceId");

-- CreateIndex
CREATE INDEX "jobs_opportunityType_idx" ON "jobs"("opportunityType");

-- CreateIndex
CREATE INDEX "jobs_workArrangement_idx" ON "jobs"("workArrangement");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_sourceId_sourceJobId_key" ON "jobs"("sourceId", "sourceJobId");

-- CreateIndex
CREATE UNIQUE INDEX "sources_name_key" ON "sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sources_adapterName_key" ON "sources"("adapterName");

-- CreateIndex
CREATE INDEX "job_discoveries_profileId_idx" ON "job_discoveries"("profileId");

-- CreateIndex
CREATE INDEX "job_discoveries_jobId_idx" ON "job_discoveries"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "job_discoveries_profileId_jobId_key" ON "job_discoveries"("profileId", "jobId");

-- CreateIndex
CREATE INDEX "job_matches_profileId_idx" ON "job_matches"("profileId");

-- CreateIndex
CREATE INDEX "job_matches_jobId_idx" ON "job_matches"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "job_matches_profileId_jobId_key" ON "job_matches"("profileId", "jobId");

-- CreateIndex
CREATE INDEX "applications_userId_idx" ON "applications"("userId");

-- CreateIndex
CREATE INDEX "applications_profileId_idx" ON "applications"("profileId");

-- CreateIndex
CREATE INDEX "applications_jobId_idx" ON "applications"("jobId");

-- CreateIndex
CREATE INDEX "applications_state_idx" ON "applications"("state");

-- CreateIndex
CREATE UNIQUE INDEX "applications_profileId_jobId_key" ON "applications"("profileId", "jobId");

-- CreateIndex
CREATE INDEX "scheduled_searches_userId_idx" ON "scheduled_searches"("userId");

-- CreateIndex
CREATE INDEX "scheduled_searches_profileId_idx" ON "scheduled_searches"("profileId");

-- CreateIndex
CREATE INDEX "scheduled_searches_nextRunAt_idx" ON "scheduled_searches"("nextRunAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "stored_secrets_userId_idx" ON "stored_secrets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stored_secrets_userId_purpose_key" ON "stored_secrets"("userId", "purpose");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_cvs" ADD CONSTRAINT "profile_cvs_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_cvs" ADD CONSTRAINT "profile_cvs_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_cv_data" ADD CONSTRAINT "extracted_cv_data_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_discoveries" ADD CONSTRAINT "job_discoveries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_discoveries" ADD CONSTRAINT "job_discoveries_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_discoveries" ADD CONSTRAINT "job_discoveries_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_searches" ADD CONSTRAINT "scheduled_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_searches" ADD CONSTRAINT "scheduled_searches_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_secrets" ADD CONSTRAINT "stored_secrets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
