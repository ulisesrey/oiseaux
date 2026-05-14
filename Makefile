# Variables
PLATFORM ?= android

# Default action
all: help

## help: Show this help message
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '^##' Makefile | sed 's/## //g'

## install: Install project dependencies
install:
	npm install

## build-development: Run a local EAS development build
build-development:
	@echo "Starting local development build for $(PLATFORM)..."
	eas build --profile development --platform $(PLATFORM) --local

# preview and production are standalone
build-preview:
	@echo "Starting local preview build for $(PLATFORM)..."
	eas build --profile preview --platform $(PLATFORM) --local

# standalone
build-production:
	@echo "Starting local production build for $(PLATFORM)..."
	eas build --profile production --platform $(PLATFORM) --local

## deploy-web: Export and deploy Oiseaux to GitHub Pages
deploy-web:
	@echo "Launching Oiseaux to the web..."
	npm run deploy
	@echo "Success! Check your URL in a few minutes."

## clean: Remove build artifacts and web exports
clean:
	rm -rf *.apk *.aab dist/* builds/*
	@echo "Cleaned build artifacts."

## dev: Run the development server (can't use expo go unless expo go mode (pres "s" to switch between modes))
dev:
	npx expo start
	@echo '!! Cannot use Expo Go unless Expo Go mode (press "s" to switch modes)'

.PHONY: all help install build-development build-preview build-production deploy-web clean dev