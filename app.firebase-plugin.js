const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin that:
 *  1. Adds `import FirebaseCore` + `FirebaseApp.configure()` to AppDelegate.swift
 *  2. Adds modular_headers pods to the Podfile for Firebase's transitive C deps
 */
const withFirebaseInit = (config) => {
  // --- Step 1: Patch AppDelegate.swift ---
  config = withDangerousMod(config, [
    'ios',
    (config) => {
      const appDelegatePath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        'AppDelegate.swift',
      );

      if (!fs.existsSync(appDelegatePath)) {
        console.warn('[firebase-plugin] AppDelegate.swift not found at', appDelegatePath);
        return config;
      }

      let contents = fs.readFileSync(appDelegatePath, 'utf-8');

      if (!contents.includes('import FirebaseCore')) {
        contents = contents.replace(
          'import Expo',
          'import Expo\nimport FirebaseCore',
        );
      }

      if (!contents.includes('FirebaseApp.configure()')) {
        contents = contents.replace(
          'didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {',
          'didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil\n  ) -> Bool {\n    FirebaseApp.configure()',
        );
      }

      fs.writeFileSync(appDelegatePath, contents);
      return config;
    },
  ]);

  // --- Step 2: Patch Podfile with modular_headers for Firebase deps ---
  config = withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );

      if (!fs.existsSync(podfilePath)) {
        console.warn('[firebase-plugin] Podfile not found at', podfilePath);
        return config;
      }

      let contents = fs.readFileSync(podfilePath, 'utf-8');

      if (!contents.includes('# Firebase modular headers')) {
        const modularHeadersPods = [
          '',
          '  # Firebase modular headers — required for Swift pods with static libraries',
          "  pod 'GoogleUtilities', :modular_headers => true",
          "  pod 'FirebaseCore', :modular_headers => true",
          "  pod 'FirebaseCoreInternal', :modular_headers => true",
          "  pod 'FirebaseInstallations', :modular_headers => true",
          "  pod 'GoogleDataTransport', :modular_headers => true",
          "  pod 'nanopb', :modular_headers => true",
        ].join('\n');

        contents = contents.replace(
          'use_expo_modules!',
          'use_expo_modules!' + modularHeadersPods,
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);

  return config;
};

module.exports = withFirebaseInit;
