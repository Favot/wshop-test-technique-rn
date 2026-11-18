# Welcome to the WShop Technical Test — React Native Developer

## Introduction

- **Developer:** Corentin Favot
- **Date:** 18/11/2026

This repository contains the full implementation of the technical test for the React Native developer position.

## Exercises

Each exercise is linked to a pull request, with more detail and context on how I solved it.

- Part 1:
  - QCM: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/1)

- Part 2:
  - Exercise 1: Custom hook `useFetch`: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/3)
  - Exercise 2: Optimise FlatList: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/4)
  - Exercise 3: Zustand Store: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/5)
  - Exercise 4: Unit tests: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/6)

- Part 3:
  - Stores List: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/8)
  - Store Detail: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/9)
  - Favorites List: [PR](https://github.com/Favot/wshop-test-technique-rn/pull/10)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the server (JSON server on port 3001)

   ```bash
   npm run server:start
   ```

3. Build and start the app

   ```bash
   npm run android
   ```

   or (for iOS)

   ```bash
   npm run ios
   ```

## Checks

```bash
npm run test:run   # unit tests
npm run lint       # lint
npm run tsc:check  # typecheck
```
