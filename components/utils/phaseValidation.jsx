import { BusinessPlan } from '@/src/api/entities';
import { BetaTester } from '@/src/api/entities';

// Centralized phase validation logic
export const validatePhaseTransition = async (venture, targetPhase, additionalData = {}) => {
  const validations = {
    business_plan: () => {
      return { valid: true };
    },
    
    mvp: async () => {
      if (venture.business_plan_completion !== 100) {
        return { 
          valid: false, 
          message: 'Business Plan must be 100% complete before proceeding to MVP phase.',
          requiredAction: 'Complete your Business Plan',
          redirectTo: 'BusinessPlan'
        };
      }
      return { valid: true };
    },
    
    mlp: () => {
      if (!venture.mvp_uploaded) {
        return { 
          valid: false, 
          message: 'MVP must be uploaded before proceeding to MLP phase.',
          requiredAction: 'Upload your MVP',
          redirectTo: 'MVPDevelopment'
        };
      }
      if (!venture.revenue_model_completed) {
        return { 
          valid: false, 
          message: 'Revenue Modeling must be completed before proceeding to MLP phase.',
          requiredAction: 'Complete Revenue Modeling',
          redirectTo: 'RevenueModeling-Experience'
        };
      }
      return { valid: true };
    },
    
    beta: () => {
      if (!venture.mlp_completed) {
        return { 
          valid: false, 
          message: 'MLP must be completed before proceeding to Beta phase.',
          requiredAction: 'Complete your MLP',
          redirectTo: 'MLPDevelopment'
        };
      }
      return { valid: true };
    },
    
    growth: async () => {
      const betaTesters = await BetaTester.filter({ venture_id: venture.id });
      if (betaTesters.length < 50) {
        return { 
          valid: false, 
          message: `You need at least 50 beta testers to proceed to Growth phase. You currently have ${betaTesters.length}.`,
          requiredAction: 'Get more beta testers',
          redirectTo: 'BetaTesting'
        };
      }
      return { valid: true };
    },
    
    ma: () => {
      if ((venture.virtual_capital || 0) < 500000) {
        return { 
          valid: false, 
          message: 'You need significant funding (at least $500K virtual capital) before proceeding to M&A phase.',
          requiredAction: 'Secure more funding',
          redirectTo: 'Dashboard'
        };
      }
      return { valid: true };
    }
  };

  if (validations[targetPhase]) {
    return await validations[targetPhase]();
  }
  
  return { valid: true };
};

export const canAccessFeature = (venture, feature) => {
  const featureRequirements = {
    'vc_marketplace': {
      phases: ['beta', 'growth', 'ma'],
      additionalChecks: (v) => v.pitch_created === true
    },
    'angel_arena': {
      phases: ['mvp', 'mlp', 'beta', 'growth', 'ma'],
      additionalChecks: (v) => true
    },
    'beta_testing': {
      phases: ['beta', 'growth', 'ma'],
      additionalChecks: (v) => true
    },
    'promotion_center': {
      phases: ['beta', 'growth', 'ma'],
      additionalChecks: (v) => true
    }
  };

  const requirement = featureRequirements[feature];
  if (!requirement) return true;
  
  const phaseValid = requirement.phases.includes(venture.phase);
  const additionalValid = requirement.additionalChecks(venture);
  
  return phaseValid && additionalValid;
};