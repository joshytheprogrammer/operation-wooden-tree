// ~/composables/useFingerprint.js
export default function useFingerprint() {
  const generateFingerprint = async () => {
    try {
      // Load the FingerprintJS agent
      const fp = await (await import('@fingerprintjs/fingerprintjs')).load();
      const result = await fp.get();

      // Remove only the specified problematic components
      delete result.components.canvas;
      delete result.components.webGlBasics; 
      delete result.components.webGlExtensions;
      delete result.components.math;
      delete result.components.plugins;

      // Flatten arrays to comma-separated strings
      const flattenArrays = (obj) => {
        if (Array.isArray(obj)) {
          return obj.flat().join(','); // Flatten nested arrays and join
        }
        return obj;
      };

      // Process components to flatten arrays
      const processedComponents = {};
      for (const [key, value] of Object.entries(result.components)) {
        processedComponents[key] = {
          ...value,
          value: flattenArrays(value.value)
        };
      }

      // Enhanced data with screen info
      const enhancedData = {
        visitorId: result.visitorId,
        confidence: result.confidence,
        version: result.version,
        components: processedComponents,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          colorDepth: window.screen.colorDepth,
          pixelRatio: window.devicePixelRatio
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        languages: navigator.languages.join(','),
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: navigator.deviceMemory || 0,
        sessionStorage: !!window.sessionStorage,
        localStorage: !!window.localStorage,
        indexedDB: !!window.indexedDB,
        touchSupport: 'ontouchstart' in window,
        timestamp: new Date().toISOString()
      };

      return enhancedData;
    } catch (err) {
      console.error('Fingerprint generation failed:', err);
      return {
        error: 'fingerprint_failed',
        timestamp: new Date().toISOString()
      };
    }
  };

  return {
    generateFingerprint
  };
}