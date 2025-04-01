'use client';

import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  FormHelperText
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const steps = ['Basic Information', 'Project Details', 'Technical Details', 'Additional Information'];

const requirements = [
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
];

export default function DesignReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    application_status: '',
    model_ready: '',
    project_description: '',
    skill_level: '',
    requirements: [],
    data_size: '',
    uptime_sla: '',
    cloud_provider: '',
    team_members: '',
    team_goals: '',
    sample_documents: [],
    sample_queries: []
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementsChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({ ...prev, requirements: value }));
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/design-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit design review request');
      }
      
      setSuccess(true);
      setFormData({
        full_name: '',
        company_name: '',
        application_status: '',
        model_ready: '',
        project_description: '',
        skill_level: '',
        requirements: [],
        data_size: '',
        uptime_sla: '',
        cloud_provider: '',
        team_members: '',
        team_goals: '',
        sample_documents: [],
        sample_queries: []
      });
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.full_name && formData.company_name;
      case 1:
        return formData.application_status && formData.model_ready && formData.project_description;
      case 2:
        return formData.skill_level && formData.data_size && formData.uptime_sla && formData.cloud_provider;
      case 3:
        return formData.team_members && formData.team_goals;
      default:
        return true;
    }
  };
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    router.push('/login');
    return null;
  }
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Application Status</InputLabel>
                <Select
                  name="application_status"
                  value={formData.application_status}
                  onChange={handleChange}
                  label="Application Status"
                >
                  <MenuItem value="In design phase">In design phase</MenuItem>
                  <MenuItem value="In production">In production</MenuItem>
                  <MenuItem value="Not started">Not started</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Model Ready"
                name="model_ready"
                value={formData.model_ready}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                helperText="Do you have a logical model, relational schema or draft document model ready to discuss?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Project Description"
                name="project_description"
                value={formData.project_description}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                variant="outlined"
                helperText="Project name and short description (business function, tech stack and immediate challenges)"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>MongoDB Skill Level</InputLabel>
                <Select
                  name="skill_level"
                  value={formData.skill_level}
                  onChange={handleChange}
                  label="MongoDB Skill Level"
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Expert">Expert</MenuItem>
                  <MenuItem value="Never used before">Never used before</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Requirements</InputLabel>
                <Select
                  multiple
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleRequirementsChange}
                  input={<OutlinedInput label="Requirements" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {requirements.map((req) => (
                    <MenuItem key={req} value={req}>
                      {req}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select all that apply</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Data Size"
                name="data_size"
                value={formData.data_size}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                helperText="Please share an estimate of the size of existing application data (GB/TB/PB)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Uptime SLA"
                name="uptime_sla"
                value={formData.uptime_sla}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                helperText="Any uptime SLAs this application needs guaranteed?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Cloud Provider"
                name="cloud_provider"
                value={formData.cloud_provider}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                helperText="What cloud provider will this application be deployed in?"
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Team Members"
                name="team_members"
                value={formData.team_members}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={2}
                variant="outlined"
                helperText="Is there anyone else from your team here today that you would like to be included in the session?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Team Goals"
                name="team_goals"
                value={formData.team_goals}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={2}
                variant="outlined"
                helperText="Could you provide further details on what goals your team is pursuing?"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Note: File upload functionality will be implemented in a future update.
              </Typography>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Request a Design Review
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Submit your MongoDB schema, architecture, or query patterns for an AI-powered review.
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!validateStep(activeStep)}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Design review request submitted successfully!
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Container>
  );
}
