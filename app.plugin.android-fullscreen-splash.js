const fs = require('fs');
const path = require('path');
const { withPlugins, withDangerousMod, withAndroidStyles, withStringsXml } = require('@expo/config-plugins');

const SPLASH_SOURCE = 'src/assets/splash.png';
const DRAWABLE_XML_NAME = 'splash_fullscreen.xml';
const NODPI_PNG_NAME = 'splash_fullscreen_bg.png';

/**
 * Android 12+ default splash uses a centered icon (Theme.SplashScreen), so full-bleed art looks tiny.
 * Replaces Theme.App.SplashScreen with windowBackground + fill bitmap so splash.png covers the screen.
 * iOS is unchanged (uses app.json / expo-splash-screen as before).
 */
function copyFullscreenSplashAssets(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const src = path.join(projectRoot, SPLASH_SOURCE);
      if (!fs.existsSync(src)) {
        throw new Error(
          `[android-fullscreen-splash] Missing ${SPLASH_SOURCE}. Add the file or update SPLASH_SOURCE in app.plugin.android-fullscreen-splash.js`
        );
      }

      const res = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res');
      const nodpi = path.join(res, 'drawable-nodpi');
      const drawable = path.join(res, 'drawable');
      await fs.promises.mkdir(nodpi, { recursive: true });
      await fs.promises.mkdir(drawable, { recursive: true });

      await fs.promises.copyFile(src, path.join(nodpi, NODPI_PNG_NAME));

      const layerList = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap
      android:gravity="fill"
      android:src="@drawable/splash_fullscreen_bg" />
  </item>
</layer-list>
`;
      await fs.promises.writeFile(path.join(drawable, DRAWABLE_XML_NAME), layerList);

      // Transparent icon drawable so Android 12+ system splash shows no centered icon
      const transparentIcon = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
  android:shape="rectangle">
  <size android:width="1dp" android:height="1dp" />
  <solid android:color="@android:color/transparent" />
</shape>
`;
      await fs.promises.writeFile(
        path.join(drawable, 'splash_icon_transparent.xml'),
        transparentIcon
      );

      // Android 12+ (API 31+) theme override to suppress centered icon splash
      const v31 = path.join(res, 'values-v31');
      await fs.promises.mkdir(v31, { recursive: true });
      const v31Styles = `<?xml version="1.0" encoding="utf-8"?>
<resources>
  <style name="Theme.App.SplashScreen" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:windowSplashScreenBackground">@color/splashscreen_background</item>
    <item name="android:windowSplashScreenAnimatedIcon">@drawable/splash_icon_transparent</item>
    <item name="android:windowBackground">@drawable/splash_fullscreen</item>
    <item name="android:windowDrawsSystemBarBackgrounds">true</item>
    <item name="android:statusBarColor">@android:color/transparent</item>
    <item name="android:navigationBarColor">@android:color/transparent</item>
    <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
  </style>
</resources>
`;
      await fs.promises.writeFile(path.join(v31, 'styles.xml'), v31Styles);

      return config;
    },
  ]);
}

function replaceSplashThemeWithFullscreenBackground(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults?.resources?.style;
    if (!Array.isArray(styles)) {
      return config;
    }

    const idx = styles.findIndex((s) => s.$?.name === 'Theme.App.SplashScreen');
    if (idx === -1) {
      return config;
    }

    styles[idx] = {
      $: {
        name: 'Theme.App.SplashScreen',
        parent: 'Theme.AppCompat.Light.NoActionBar',
      },
      item: [
        {
          $: { name: 'android:windowBackground' },
          _: '@drawable/splash_fullscreen',
        },
        {
          $: { name: 'android:windowDrawsSystemBarBackgrounds' },
          _: 'true',
        },
        {
          $: { name: 'android:statusBarColor' },
          _: '@android:color/transparent',
        },
        {
          $: { name: 'android:navigationBarColor' },
          _: '@android:color/transparent',
        },
        {
          $: { name: 'android:windowLayoutInDisplayCutoutMode' },
          _: 'shortEdges',
        },
      ],
    };

    return config;
  });
}

function setStatusBarTranslucent(config) {
  return withStringsXml(config, (config) => {
    const strings = config.modResults?.resources?.string;
    if (!Array.isArray(strings)) {
      return config;
    }

    const idx = strings.findIndex(
      (s) => s.$?.name === 'expo_splash_screen_status_bar_translucent'
    );
    if (idx !== -1) {
      strings[idx]._ = 'true';
    }

    return config;
  });
}

module.exports = function withAndroidFullscreenSplash(config) {
  return withPlugins(config, [
    copyFullscreenSplashAssets,
    replaceSplashThemeWithFullscreenBackground,
    setStatusBarTranslucent,
  ]);
};
