/**
 * USE MY CREATOR - Pricing & Sentiment Logic
 * * This file contains the "Fair Market Value" (FMV) logic for the Nigerian market.
 * All amounts are in Naira (₦).
 */

export const PRICING_CONFIG = {
  // Average Cost Per 1,000 Views in Nigeria
  baseCPM: 2500,

  // Production Stipend: Covers data, power, and basic equipment costs
  productionStipend: 15000,

  // Market Volatility Buffer: A 10% safety margin for Naira fluctuations
  marketVolatilityIndex: 1.1,

  // Niche Multipliers: Based on audience conversion value
  nicheMultipliers: {
    tech: 1.6,
    business: 1.5,
    real_estate: 1.5,
    lifestyle: 1.0,
    beauty: 1.0,
    comedy: 0.8,
    entertainment: 0.7,
  },

  // Usage Rights Multipliers
  usageMultipliers: {
    organic: 1.0,      // One-time post
    ad_usage_30d: 1.3, // Used as a sponsored ad
    perpetual: 2.5     // Full ownership
  },

  // Influence Verification Multiplier
  verificationMultiplier: {
    verified: 1.2,    // Creator has submitted proof of stats
    unverified: 1.0   // Standard self-reported stats
  }
};

/**
 * Static list of Niches for the UI
 */
export const NICHES = [
  { id: 'tech', label: 'Tech & Gadgets', icon: '📱' },
  { id: 'business', label: 'Business & Finance', icon: '💰' },
  { id: 'real_estate', label: 'Real Estate', icon: '🏠' },
  { id: 'lifestyle', label: 'Lifestyle & Travel', icon: '✈️' },
  { id: 'beauty', label: 'Beauty & Fashion', icon: '💄' },
  { id: 'comedy', label: 'Comedy & Skits', icon: '😂' },
  { id: 'entertainment', label: 'Entertainment', icon: '🍿' }
];

/**
 * THE CALCULATION ENGINE
 * Calculates the suggested Fair Market Value (FMV)
 */
export const calculateFairPrice = (avgViews, niche, isVerified = false, usageType = 'organic') => {
  // 1. Calculate base value from reach
  const viewValue = (avgViews / 1000) * PRICING_CONFIG.baseCPM;

  // 2. Add stipend and apply inflation buffer
  const baseRate = (viewValue + PRICING_CONFIG.productionStipend) * PRICING_CONFIG.marketVolatilityIndex;

  // 3. Apply Multipliers
  const nicheMult = PRICING_CONFIG.nicheMultipliers[niche] || 1.0;
  const verifiedMult = isVerified ? PRICING_CONFIG.verificationMultiplier.verified : 1.0;
  const usageMult = PRICING_CONFIG.usageMultipliers[usageType] || 1.0;

  const finalTotal = baseRate * nicheMult * verifiedMult * usageMult;

  // Round to nearest 500 for professional look
  return Math.ceil(finalTotal / 500) * 500;
};