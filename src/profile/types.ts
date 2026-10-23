/**
 * Candidate profile types.
 *
 * The canonical structured representation of a candidate in JobPilot.
 * Every later module — matching, application drafting, email generation —
 * references this shape.
 *
 * Fields are optional where a CV may not contain them, so the type is
 * forgiving of incomplete data. The AI extraction layer (not yet built)
 * will populate these from raw CV text.
 */

/**
 * A single skill, optionally categorized.
 */
export type Skill = {
  /** The skill name, e.g. "TypeScript", "React", "PostgreSQL" */
  name: string;
  /**
   * Optional category for grouping, e.g. "languages", "frameworks",
   * "tools", "soft". Used by the matching module later.
   */
  category?: string;
  /**
   * Optional self-assessed proficiency or years of experience.
   * Not required — the AI layer may leave this empty.
   */
  level?: string;
};

/**
 * A single role in the candidate's work history.
 */
export type ExperienceRole = {
  /** Job title, e.g. "Senior Frontend Engineer" */
  title: string;
  /** Company or organization name */
  organization: string;
  /** Location as written on the CV, e.g. "Berlin, Germany" or "Remote" */
  location?: string;
  /** Start date as written on the CV, e.g. "2021-03" or "March 2021" */
  startDate?: string;
  /** End date or "Present" as written on the CV */
  endDate?: string;
  /** Short description of responsibilities and achievements */
  description?: string;
  /** Technologies or skills mentioned in this role */
  technologies?: string[];
};

/**
 * A single education entry.
 */
export type EducationEntry = {
  /** Degree or qualification, e.g. "M.Sc. Computer Science" */
  degree: string;
  /** Institution name */
  institution: string;
  /** Location of the institution */
  location?: string;
  /** Start date as written on the CV */
  startDate?: string;
  /** End date or "Present" */
  endDate?: string;
  /** Field of study or notes */
  notes?: string;
};

/**
 * Links relevant to the candidate (LinkedIn, GitHub, portfolio, etc.)
 */
export type Link = {
  /** Label, e.g. "GitHub", "LinkedIn", "Portfolio" */
  label: string;
  /** URL */
  url: string;
};

/**
 * The full structured candidate profile.
 */
export type CandidateProfile = {
  /**
   * The raw CV text this profile was extracted from, retained for
   * traceability and re-extraction later.
   */
  sourceText?: string;

  /** Full name as extracted from the CV */
  name?: string;

  /** Professional summary or tagline */
  summary?: string;

  /** Contact details extracted from the CV */
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    links?: Link[];
  };

  /** Skills extracted from the CV */
  skills?: Skill[];

  /** Work experience extracted from the CV, most recent first preferred */
  experience?: ExperienceRole[];

  /** Education extracted from the CV */
  education?: EducationEntry[];

  /** Languages mentioned in the CV */
  languages?: string[];

  /** Metadata about the extraction process */
  metadata?: {
    /** When the profile was built */
    builtAt: Date;
    /** Which extraction method produced this profile */
    extractionMethod?: string;
    /** Version of the profile schema */
    schemaVersion: string;
  };
};
