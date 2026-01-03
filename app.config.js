module.exports = {
  expo: {
    name: "kyoos",
    slug: "kyoos",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "kyoos",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSSpeechRecognitionUsageDescription: "Allow $(PRODUCT_NAME) to use speech recognition.",
        NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to use the microphone.",
        NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access your camera",
        ITSAppUsesNonExemptEncryption: false,
      },
      bundleIdentifier: "com.divsandviews.kyoos",
      icon: {
        dark: "./assets/images/icon-dark.png",
        light: "./assets/images/icon-light.png",
        tinted: "./assets/images/icon-tinted.png",
      },
      buildNumber: "1.0.0",
      versionCode: 1,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
      ],
      package: "com.divsandviews.kyoos",
      buildNumber: "1.0.0",
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        },
      },
    },
    web: {
      output: "static",
      favicon: "./assets/images/icon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            image: "./assets/images/splash-icon-dark.png",
            backgroundColor: "#000000",
            imageWidth: 200,
            resizeMode: "contain",
          },
        },
      ],
      "expo-speech-recognition",
      "expo-video",
      "@react-native-community/datetimepicker",
      "react-native-vision-camera",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "fd6682b0-2099-4f1d-b51b-0d585ecba1a4",
      },
    },
    owner: "divsandviews",
  },
};

