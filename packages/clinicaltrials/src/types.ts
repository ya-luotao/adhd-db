/**
 * ClinicalTrials.gov API v2 Type Definitions
 * @see https://clinicaltrials.gov/data-api/api
 */

// ============================================
// API Response Types
// ============================================

export type TrialStatus =
  | 'RECRUITING'
  | 'ACTIVE_NOT_RECRUITING'
  | 'COMPLETED'
  | 'ENROLLING_BY_INVITATION'
  | 'NOT_YET_RECRUITING'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'WITHDRAWN'
  | 'AVAILABLE'
  | 'NO_LONGER_AVAILABLE'
  | 'TEMPORARILY_NOT_AVAILABLE'
  | 'APPROVED_FOR_MARKETING'
  | 'WITHHELD'
  | 'UNKNOWN';

export type TrialPhase =
  | 'EARLY_PHASE1'
  | 'PHASE1'
  | 'PHASE2'
  | 'PHASE3'
  | 'PHASE4'
  | 'NA';

export type StudyType =
  | 'INTERVENTIONAL'
  | 'OBSERVATIONAL'
  | 'EXPANDED_ACCESS';

// ============================================
// Study/Trial Types
// ============================================

export interface StudyLocation {
  facility?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: string;
}

export interface StudySponsor {
  name: string;
  class?: 'NIH' | 'FED' | 'OTHER_GOV' | 'INDUSTRY' | 'NETWORK' | 'OTHER';
}

export interface StudyIntervention {
  type: 'DRUG' | 'BIOLOGICAL' | 'DEVICE' | 'PROCEDURE' | 'RADIATION' | 'BEHAVIORAL' | 'DIETARY_SUPPLEMENT' | 'GENETIC' | 'COMBINATION_PRODUCT' | 'DIAGNOSTIC_TEST' | 'OTHER';
  name: string;
  description?: string;
  armGroupLabels?: string[];
}

export interface StudyOutcome {
  measure: string;
  description?: string;
  timeFrame?: string;
}

export interface Study {
  /** NCT identifier (e.g., NCT12345678) */
  nctId: string;

  /** Brief title */
  briefTitle: string;

  /** Official title */
  officialTitle?: string;

  /** Overall status */
  overallStatus: TrialStatus;

  /** Study phases */
  phases?: TrialPhase[];

  /** Study type */
  studyType?: StudyType;

  /** Brief summary */
  briefSummary?: string;

  /** Detailed description */
  detailedDescription?: string;

  /** Conditions being studied */
  conditions?: string[];

  /** Interventions */
  interventions?: StudyIntervention[];

  /** Primary outcomes */
  primaryOutcomes?: StudyOutcome[];

  /** Lead sponsor */
  leadSponsor?: StudySponsor;

  /** Collaborators */
  collaborators?: StudySponsor[];

  /** Study start date */
  startDate?: string;

  /** Primary completion date */
  primaryCompletionDate?: string;

  /** Study completion date */
  completionDate?: string;

  /** Enrollment count */
  enrollmentCount?: number;

  /** Enrollment type (actual or estimated) */
  enrollmentType?: 'ACTUAL' | 'ESTIMATED';

  /** Study locations */
  locations?: StudyLocation[];

  /** Last update date */
  lastUpdateSubmitDate?: string;

  /** Study first submit date */
  studyFirstSubmitDate?: string;

  /** Has results */
  hasResults?: boolean;

  /** Eligibility criteria */
  eligibilityCriteria?: string;

  /** Minimum age */
  minimumAge?: string;

  /** Maximum age */
  maximumAge?: string;

  /** Sex eligibility */
  sex?: 'ALL' | 'FEMALE' | 'MALE';

  /** Is FDA regulated drug */
  isFDARegulatedDrug?: boolean;

  /** Is FDA regulated device */
  isFDARegulatedDevice?: boolean;
}

// ============================================
// API Response Wrappers
// ============================================

export interface StudySearchResponse {
  studies: Array<{
    protocolSection: {
      identificationModule: {
        nctId: string;
        briefTitle: string;
        officialTitle?: string;
      };
      statusModule: {
        overallStatus: TrialStatus;
        startDateStruct?: { date: string };
        primaryCompletionDateStruct?: { date: string };
        completionDateStruct?: { date: string };
        lastUpdateSubmitDate?: string;
        studyFirstSubmitDate?: string;
      };
      designModule?: {
        studyType?: StudyType;
        phases?: TrialPhase[];
      };
      descriptionModule?: {
        briefSummary?: string;
        detailedDescription?: string;
      };
      conditionsModule?: {
        conditions?: string[];
      };
      armsInterventionsModule?: {
        interventions?: Array<{
          type: string;
          name: string;
          description?: string;
        }>;
      };
      outcomesModule?: {
        primaryOutcomes?: StudyOutcome[];
      };
      sponsorCollaboratorsModule?: {
        leadSponsor?: {
          name: string;
          class?: string;
        };
        collaborators?: Array<{
          name: string;
          class?: string;
        }>;
      };
      eligibilityModule?: {
        eligibilityCriteria?: string;
        minimumAge?: string;
        maximumAge?: string;
        sex?: string;
      };
      contactsLocationsModule?: {
        locations?: Array<{
          facility?: string;
          city?: string;
          state?: string;
          country?: string;
          status?: string;
        }>;
      };
      designModule2?: {
        enrollmentInfo?: {
          count?: number;
          type?: string;
        };
      };
    };
    hasResults?: boolean;
  }>;
  nextPageToken?: string;
  totalCount?: number;
}

// ============================================
// ADHD-DB Specific Types
// ============================================

export interface ADHDTrialSummary {
  /** Drug ID from our database */
  drugId: string;

  /** Generic drug name */
  drugName: string;

  /** Total number of trials */
  totalTrials: number;

  /** Number of recruiting trials */
  recruitingTrials: number;

  /** Number of active trials */
  activeTrials: number;

  /** Number of completed trials (last 2 years) */
  recentlyCompleted: number;

  /** Notable/highlighted trials */
  notableTrials: Study[];

  /** Last data update */
  lastUpdated: string;
}

export interface ClinicalTrialsData {
  /** All trials for this drug */
  trials: Study[];

  /** Summary statistics */
  summary: {
    total: number;
    recruiting: number;
    active: number;
    completed: number;
    byPhase: Record<string, number>;
  };

  /** Last data update */
  lastUpdated: string;
}

// ============================================
// Drug Mapping Configuration
// ============================================

export interface ADHDDrugTrialMapping {
  /** Internal drug ID */
  drugId: string;

  /** Drug name for search */
  drugName: string;

  /** Alternative search terms */
  searchTerms: string[];

  /** Brand names to include */
  brandNames?: string[];
}

/**
 * ADHD Drug to ClinicalTrials.gov search mappings
 */
export const ADHD_DRUG_TRIAL_MAPPINGS: ADHDDrugTrialMapping[] = [
  {
    drugId: 'methylphenidate',
    drugName: 'methylphenidate',
    searchTerms: ['methylphenidate', 'methylphenidate hydrochloride'],
    brandNames: ['Concerta', 'Ritalin', 'Metadate', 'Daytrana']
  },
  {
    drugId: 'amphetamine-mixed-salts',
    drugName: 'amphetamine',
    searchTerms: ['amphetamine', 'mixed amphetamine salts', 'dextroamphetamine'],
    brandNames: ['Adderall', 'Mydayis']
  },
  {
    drugId: 'lisdexamfetamine',
    drugName: 'lisdexamfetamine',
    searchTerms: ['lisdexamfetamine', 'lisdexamfetamine dimesylate'],
    brandNames: ['Vyvanse']
  },
  {
    drugId: 'atomoxetine',
    drugName: 'atomoxetine',
    searchTerms: ['atomoxetine', 'atomoxetine hydrochloride'],
    brandNames: ['Strattera']
  },
  {
    drugId: 'guanfacine',
    drugName: 'guanfacine',
    searchTerms: ['guanfacine', 'guanfacine extended release'],
    brandNames: ['Intuniv', 'Tenex']
  },
  {
    drugId: 'clonidine',
    drugName: 'clonidine',
    searchTerms: ['clonidine', 'clonidine extended release'],
    brandNames: ['Kapvay', 'Catapres']
  },
  {
    drugId: 'viloxazine',
    drugName: 'viloxazine',
    searchTerms: ['viloxazine', 'viloxazine extended release'],
    brandNames: ['Qelbree']
  }
];
