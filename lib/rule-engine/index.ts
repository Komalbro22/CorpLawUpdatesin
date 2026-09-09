export { executeRule, extractVariablesFromPrompt, validatePlacementDSL } from './router';
export type { PlacementDSL } from './router';
export * from './dpt3-engine';
export * from './spice-engine';
export {
  type HalfYearPeriod,
  type CompanyClassification,
  type Pas6DelaySlab,
  type Pas6ComplianceMilestone,
  type Pas6CalculationParams,
  type Pas6CalculationResult,
  PAS6_DELAY_SLABS,
  PAS6_COMPLIANCE_ROADMAP,
  getPas6DueDate,
  getPas6NormalFee,
  getPas6LateMultiplier,
  evaluatePas6Exemption,
  calculateSection450Penalty,
  calculatePas6Compliance
} from './pas6-engine';
export * from './msme1-engine';



