// Dynamic import defers all shared-module imports until after the Module
// Federation runtime has negotiated versions — prevents the
// "Shared module is not available for eager consumption" error.
import('./bootstrap').catch((err) => console.error('[Shell] Bootstrap error:', err));
