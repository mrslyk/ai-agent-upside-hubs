export type AccessTier = 'free' | 'agent_hub'

export type AccessClaims = {
  sub: string
  email: string
  tier: AccessTier
  iat: number
  exp: number
}

export type UpsideOfferingType = 'reg_cf' | 'reg_d_506b' | 'reg_d_506c'

export type UpsideRequest = {
  id: string
  createdAt: string
  status: 'pending_review' | 'approved' | 'rejected'
  hubName: string
  hubSubdomain: string
  humanPrincipal: string
  email: string
  entityType: 'individual' | 'llc' | 'corp' | 'other'
  offeringType: UpsideOfferingType
  accreditedInvestor?: boolean
  agentOperator?: string
  contributionSummary?: string
  riskAcknowledged: boolean
  disclosuresAcknowledged: boolean
}
