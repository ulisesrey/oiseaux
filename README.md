# Welcome to Oiseaux
## Master the sounds of language.

Oiseaux is a cross-platform application built with React Native and Expo designed to help students master difficult phonetic contrasts

## 🚀 Quick Start

Oiseaux uses a Hybrid Build System. I use package.json for JavaScript-specific tasks and a Makefile to orchestrate complex workflows.

### 1. Development Mode

To start the local development server and test on your phone (via Expo Go) or browser:

```bash
make dev
```

### 2. Android Deployment (Native APK)
I use EAS (Expo Application Services) to build native binaries. Unlike web files, an APK must be compiled into machine code. This triggers a Local Build. It uses your computer’s resources to package the app into a .apk file that can be manually installed on any Android device.

```bash
make build-android
```

### 3. Web Deployment (GitHub Pages)

Oiseaux is hosted live as a **static site**.

### How it works

1. **Export**  
   The app is transpiled into standard HTML/JS/CSS files in a `/dist` folder.

2. **.nojekyll trick**  
   An empty `.nojekyll` file is added to prevent GitHub from hiding folders that start with underscores (like `_expo`).

3. **gh-pages branch**  
   The contents of `/dist` are pushed to a separate, isolated branch called `gh-pages`.  
   GitHub detects this branch and hosts it at your public URL.

### Command

```bash
make deploy-web
```

See: [https://github.com/ulisesrey/oiseaux/tree/gh-pages](https://github.com/ulisesrey/oiseaux/tree/gh-pages)

The drawback of this is that the repository has to be public.

## 🛠 Project Structure

- **app/**: The core logic and screens (file-based routing)
- **assets/**: Images, icons, and splash screens
- **data/**: JSON files containing the `wordBank` and `practiceRules` (the "Data Science" layer)
- **Makefile**: The master controller for all deployment tasks

## 🌍 Availability

- **Web**: https://ulisesrey.github.io/oiseaux/
- **Android**: Download the latest `.apk` from the releases/builds folder

