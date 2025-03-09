/**
 * Noise configuration constants
 */

export interface NoiseConfig {
  enabled: boolean;
  patternSize: number;
  patternScaleX: number;
  patternScaleY: number;
  patternRefreshInterval: number;
  patternAlpha: number;
  animated: boolean;
}

// Default noise configuration
export const DEFAULT_NOISE_CONFIG: NoiseConfig = {
  enabled: true,
  patternSize: 250,
  patternScaleX: 1,
  patternScaleY: 1,
  patternRefreshInterval: 2,
  patternAlpha: 20,
  animated: false,
};

// Presets for different noise styles
export const NOISE_PRESETS = {
  default: DEFAULT_NOISE_CONFIG,
  subtle: {
    ...DEFAULT_NOISE_CONFIG,
    patternAlpha: 8,
    patternSize: 300,
  },
  bold: {
    ...DEFAULT_NOISE_CONFIG,
    patternAlpha: 25,
    patternSize: 200,
  },
  animated: {
    ...DEFAULT_NOISE_CONFIG,
    animated: true,
    patternRefreshInterval: 4,
  },
} as const;

// Current active noise configuration
// You can change this value at runtime to update noise settings globally
export let ACTIVE_NOISE_CONFIG: NoiseConfig = { ...DEFAULT_NOISE_CONFIG };

/**
 * Update the active noise configuration globally
 * @param config New configuration or preset name
 */
export function setNoiseConfig(config: Partial<NoiseConfig> | keyof typeof NOISE_PRESETS): void {
  if (typeof config === 'string') {
    // Using a preset
    ACTIVE_NOISE_CONFIG = { ...NOISE_PRESETS[config] };
  } else {
    // Merging with current config
    ACTIVE_NOISE_CONFIG = { ...ACTIVE_NOISE_CONFIG, ...config };
  }
} 