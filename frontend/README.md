# MediRemind Modern React Frontend

This directory contains the modern React single-page application for MediRemind, built with React 19, Vite, and Lucide icons.

## Features
- **Modern Glassmorphism Theme**: Dark purple/blue mesh background with subtle glow, frosted cards, and smooth micro-animations.
- **Dose Celebration**: Interactive confetti animation on marking doses as taken.
- **Family Profiles**: Quick profile switching pills across the application.
- **Adherence Heatmap**: 35-day consistency calendar with visual compliance indicators.
- **Caregivers & Mentors Portal**:
  - 1-click shareable Caregiver Link Code (`MTR-XXXXXXXX`).
  - Read-only supervision dashboard for mentees (live adherence %, streak, daily timeline, prescriptions).
  - Threaded encouragement notes with quick-reply chips (`Great job! 🔥`, `Evening dose 💊`, `Check-in ❤️`, `Stay hydrated 💧`).
- **Inventory & Refill Alerts**: Low stock alerts with 1-click refill.

## Development

Run the Vite dev server with proxy to Spring Boot (`http://localhost:8080`):

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:3000`

## Production Build

Build the production assets directly into Spring Boot's static folder (`../src/main/resources/static`):

```bash
npm run build
```
