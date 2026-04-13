// Note: RFPs are intentionally excluded from this tracker.
// RFPs are managed in a separate system.

export type SignalStrength = 'low' | 'medium' | 'high' | 'critical';
export type SignalStatus = 'new' | 'in_progress' | 'acted_upon' | 'closed';

export type SignalCategory =
  | 'website_engagement'
  | 'digital_activity'
  | 'intent_data'
  | 'event_triggers'
  | 'relationship_signals';

export type SignalType =
  | 'demo_request'
  | 'pricing_page_visit'
  | 'content_download'
  | 'trial_signup'
  | 'webinar_attendance'
  | 'email_engagement'
  | 'social_mention'
  | 'hiring_signal'
  | 'funding_round'
  | 'leadership_change'
  | 'competitive_research'
  | 'review_site_activity'
  | 'referral'
  | 'champion_identified'
  | 'budget_cycle'
  | 'technology_change';

export interface BuyingSignal {
  id: string;
  companyName: string;
  industry: string;
  contactName?: string;
  contactTitle?: string;
  signalType: SignalType;
  category: SignalCategory;
  strength: SignalStrength;
  source: string;
  description: string;
  detectedAt: string;
  status: SignalStatus;
  assignedTo: string;
  notes?: string;
  tags: string[];
}

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = {
  demo_request: 'Demo Request',
  pricing_page_visit: 'Pricing Page Visit',
  content_download: 'Content Download',
  trial_signup: 'Trial Signup',
  webinar_attendance: 'Webinar Attendance',
  email_engagement: 'Email Engagement',
  social_mention: 'Social Media Mention',
  hiring_signal: 'Hiring Signal',
  funding_round: 'Funding Round',
  leadership_change: 'Leadership Change',
  competitive_research: 'Competitive Research',
  review_site_activity: 'Review Site Activity',
  referral: 'Customer Referral',
  champion_identified: 'Champion Identified',
  budget_cycle: 'Budget Cycle Trigger',
  technology_change: 'Technology Change',
};

export const SIGNAL_CATEGORY_LABELS: Record<SignalCategory, string> = {
  website_engagement: 'Website Engagement',
  digital_activity: 'Digital Activity',
  intent_data: 'Intent Data',
  event_triggers: 'Event Triggers',
  relationship_signals: 'Relationship Signals',
};

export const SIGNAL_TYPES_BY_CATEGORY: Record<SignalCategory, SignalType[]> = {
  website_engagement: ['demo_request', 'pricing_page_visit', 'content_download', 'trial_signup'],
  digital_activity: ['webinar_attendance', 'email_engagement', 'social_mention'],
  intent_data: ['competitive_research', 'review_site_activity'],
  event_triggers: ['hiring_signal', 'funding_round', 'leadership_change', 'budget_cycle', 'technology_change'],
  relationship_signals: ['referral', 'champion_identified'],
};

export const CATEGORY_BY_TYPE: Record<SignalType, SignalCategory> = {
  demo_request: 'website_engagement',
  pricing_page_visit: 'website_engagement',
  content_download: 'website_engagement',
  trial_signup: 'website_engagement',
  webinar_attendance: 'digital_activity',
  email_engagement: 'digital_activity',
  social_mention: 'digital_activity',
  hiring_signal: 'event_triggers',
  funding_round: 'event_triggers',
  leadership_change: 'event_triggers',
  competitive_research: 'intent_data',
  review_site_activity: 'intent_data',
  referral: 'relationship_signals',
  champion_identified: 'relationship_signals',
  budget_cycle: 'event_triggers',
  technology_change: 'event_triggers',
};

export const STRENGTH_ORDER: Record<SignalStrength, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};
