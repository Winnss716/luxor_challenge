# Luxor Mobile App

A React Native mobile application built with Expo for the Luxor Challenge platform, enabling users to manage accounts, browse collections, and place bids.

## Purpose
The Luxor Mobile App provides a mobile interface for users to interact with the Luxor Challenge bidding system, offering a seamless way to register, explore collections, and participate in bidding on iOS and Android devices.

## Functionality
- **User Authentication**: Sign up, log in, and manage user profiles.
- **Collection Browsing**: View collections with details like name, description, and price.
- **Bidding System**: Place and manage bids on collections.
- **Cross-Platform**: Runs on iOS, Android, and web with a consistent experience.

## Dependencies
- `@react-native-async-storage/async-storage@1.23.1`: Local storage for user data
- `@react-native-picker/picker@^2.11.0`: Dropdown picker for selections
- `@react-navigation/native@^7.1.6`: Navigation framework
- `@react-navigation/native-stack@^7.3.10`: Stack-based navigation
- `expo@~52.0.43`: Framework for building and running the app
- `expo-linear-gradient@~14.0.2`: Gradient UI elements
- `expo-status-bar@~2.0.1`: Status bar customization
- `react@18.3.1`: Core React library
- `react-hook-form@^7.55.0`: Form handling and validation
- `react-native@0.76.9`: Native mobile app framework
- **Dev Dependencies**:
  - `@babel/core@^7.25.2`: JavaScript transpiler
  - `@types/react@~18.3.12`: TypeScript types for React
  - `typescript@^5.3.3`: Type checking

## Prerequisites
- **Node.js**: v18.17 or later ([nodejs.org](https://nodejs.org/)) – Expo SDK 52 requires Node 18 or newer for optimal compatibility
- **npm**: v9.8 or later (included with Node.js)
- **Java**: JDK 17 (OpenJDK recommended) – Required for Android builds
- **Git**: For cloning the repository
- **Expo CLI**: v7.17 or later (installed with `npm install -g expo-cli`)
- **iOS/Android Emulator** or physical device:
  - **Android**: Android Studio (Flamingo or later) with Android SDK 34 for emulators
  - **iOS**: Xcode 16 or later (macOS only) for simulators
- **Expo Go**: App for testing on physical devices (available on iOS App Store or Google Play)

## Getting Started

### 1. Clone the Repository

Clone the `luxor_mobile_app` branch from the `luxor_challenge` repository:

git clone -b luxor_mobile_app https://github.com/your-username/luxor_challenge.git
cd luxor_challenge.

### 2. Install NPM and EXPO
in terminal run: npx expo install

### 3. Start Application
in terminal run: npx expo start
