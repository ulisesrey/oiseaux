# Variables
BUILD_PROFILE = preview # reads from eas.json build "profiles"
PLATFORM = android
BUILD_COMMAND = eas build --profile $(BUILD_PROFILE) --platform $(PLATFORM) --local

# Default action when you just type 'make'
all: help

## help: Show this help message
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@sed -n 's/^##//p' Makefile

## install: Install project dependencies
install:
	npm install

## build: Run a local EAS production build for Android
build:
	@echo "Starting local $(BUILD_PROFILE) build for $(PLATFORM)..."
	$(BUILD_COMMAND)

## clean: Remove the local build artifacts (APKs/AABs)
clean:
	rm -rf *.apk *.aab
	@echo "Cleaned local build files."

## dev: Run the development server
dev:
	npx expo start

# Define the web export command
export-web:
	@echo "Exporting Oiseaux for the web..."
	npx expo export -p web
	@echo "Web files are ready in the /dist folder."
	
.PHONY: all help install build clean dev web