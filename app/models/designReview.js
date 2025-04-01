import mongoose from 'mongoose';

const designReviewSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  application_status: {
    type: String,
    required: true,
    enum: ['In design phase', 'In production', 'Not started']
  },
  model_ready: {
    type: String,
    required: true
  },
  project_description: {
    type: String,
    required: true
  },
  skill_level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Expert', 'Never used before', 'Other']
  },
  requirements: [{
    type: String,
    enum: [
      'Transactional guarantees',
      'Full-Text Search',
      'Cross-Region HA',
      'Cloud to on-prem replication (or vice versa)',
      'Time series capabilities',
      'Data tiering',
      'Multi-cloud',
      'Data modeling guidance',
      'Development assistance/guidance',
      'Edge database (mobile or otherwise)',
      'Other'
    ]
  }],
  data_size: {
    type: String,
    required: true
  },
  uptime_sla: {
    type: String,
    required: true
  },
  cloud_provider: {
    type: String,
    required: true
  },
  team_members: {
    type: String,
    required: true
  },
  team_goals: {
    type: String,
    required: true
  },
  sample_documents: [{
    type: String // URLs to uploaded files
  }],
  sample_queries: [{
    type: String // URLs to uploaded files
  }],
  status: {
    type: String,
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'REPORT_SENT'],
    default: 'SUBMITTED'
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completeness_score: Number,
  skill_level_score: Number,
  application_status_score: Number,
  use_case_score: Number,
  data_volume_score: Number,
  uptime_sla_score: Number,
  previous_interaction_score: Number,
  total_score: Number,
  opportunity_level: {
    type: String,
    enum: ['High', 'Medium', 'Low']
  },
  submitted_at: {
    type: Date,
    default: Date.now
  },
  review_started_at: Date,
  accepted_at: Date,
  rejected_at: Date,
  assigned_at: Date,
  scheduled_at: Date,
  completed_at: Date,
  report_sent_at: Date
}, {
  timestamps: true
});

// Calculate scores before saving
designReviewSchema.pre('save', function(next) {
  // Calculate completeness score
  this.completeness_score = 0;
  if (this.full_name) this.completeness_score += 5;
  if (this.company_name) this.completeness_score += 5;
  if (this.application_status) this.completeness_score += 5;
  if (this.project_description) this.completeness_score += 5;
  if (this.sample_documents?.length) this.completeness_score += 5;
  if (this.sample_queries?.length) this.completeness_score += 5;
  if (this.model_ready && this.model_ready.toLowerCase() !== 'yes') this.completeness_score -= 5;

  // Calculate skill level score
  switch (this.skill_level) {
    case 'Expert': this.skill_level_score = 15; break;
    case 'Intermediate': this.skill_level_score = 10; break;
    case 'Beginner': this.skill_level_score = 5; break;
    default: this.skill_level_score = 0;
  }

  // Calculate application status score
  switch (this.application_status) {
    case 'In production': this.application_status_score = 15; break;
    case 'In design phase': this.application_status_score = 10; break;
    default: this.application_status_score = 0;
  }

  // Calculate use case score
  this.use_case_score = (this.requirements?.length || 0) * 2;

  // Calculate data volume score
  if (this.data_size) {
    const size = parseInt(this.data_size.replace(/[^0-9]/g, ''));
    if (size >= 1000) this.data_volume_score = 10;
    else if (size >= 100) this.data_volume_score = 5;
    else this.data_volume_score = 0;
  }

  // Calculate uptime SLA score
  if (this.uptime_sla) {
    const uptime = parseFloat(this.uptime_sla);
    if (uptime >= 99.99) this.uptime_sla_score = 5;
    else this.uptime_sla_score = 0;
  }

  // Calculate previous interaction score
  this.previous_interaction_score = this.team_members ? 5 : 0;

  // Calculate total score
  this.total_score = (
    this.completeness_score +
    this.skill_level_score +
    this.application_status_score +
    this.use_case_score +
    this.data_volume_score +
    this.uptime_sla_score +
    this.previous_interaction_score
  );

  // Determine opportunity level
  if (this.total_score >= 80) this.opportunity_level = 'High';
  else if (this.total_score >= 50) this.opportunity_level = 'Medium';
  else this.opportunity_level = 'Low';

  next();
});

const DesignReview = mongoose.models.DesignReview || mongoose.model('DesignReview', designReviewSchema);

export default DesignReview; 