# Variables
BUILD_PROFILE = preview
PLATFORM = android

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

## build: Run a local EAS production build
build:
	@echo "Starting local $(BUILD_PROFILE) build for $(PLATFORM)..."
	eas build --profile $(BUILD_PROFILE) --platform $(PLATFORM) --local

## deploy-web: Export and deploy Oiseaux to GitHub Pages
deploy-web:
	@echo "Launching Oiseaux to the web..."
	npm run deploy
	@echo "Success! Check your URL in a few minutes."

## clean: Remove build artifacts and web exports
clean:
	rm -rf *.apk *.aab dist
	@echo "Cleaned build artifacts."

## dev: Run the development server
dev:
	npx expo start

.PHONY: all help install build deploy-web clean dev