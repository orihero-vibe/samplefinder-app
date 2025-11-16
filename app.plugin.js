const { withAndroidManifest } = require('@expo/config-plugins');

const withGoogleMapsApiKey = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const { manifest } = androidManifest;

    if (!manifest.application) {
      return config;
    }

    const application = manifest.application[0];
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Get API key from config
    const apiKey = config.android?.config?.googleMaps?.apiKey;

    if (!apiKey) {
      console.warn('Google Maps API key not found in app.json android.config.googleMaps.apiKey');
      return config;
    }

    // Check if API key already exists
    const existingApiKeyIndex = application['meta-data'].findIndex(
      (meta) => meta.$ && meta.$['android:name'] === 'com.google.android.geo.API_KEY'
    );

    const metaDataEntry = {
      $: {
        'android:name': 'com.google.android.geo.API_KEY',
        'android:value': apiKey,
      },
    };

    if (existingApiKeyIndex !== -1) {
      // Update existing entry
      application['meta-data'][existingApiKeyIndex] = metaDataEntry;
    } else {
      // Add new entry
      application['meta-data'].push(metaDataEntry);
    }

    return config;
  });
};

module.exports = withGoogleMapsApiKey;

