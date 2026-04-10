# Sober Start

Sober Start is a mobile recovery support app built to help people stay grounded, track progress, and build healthier daily habits. The app combines sobriety tracking, daily check-ins, journaling, and coping tools in one simple experience.

## Features

- Daily sobriety tracking
- Check-ins to log how you are feeling
- Personal journal entries
- Recovery tools for cravings and difficult moments
- Progress insights and streak tracking
- Account and profile management

## Tech Stack

- Expo / React Native frontend
- Express API backend
- Prisma ORM
- PostgreSQL database

## Running Locally

1. Install frontend dependencies:
```bash
npm install
Install server dependencies:
bash

npm --prefix server install
Start the app and API together:
bash

npm run dev
This starts:

The Expo development server
The backend API on http://localhost:4000
Project Structure
text

app/          Expo Router screens
components/   Reusable UI components
server/       Express API and Prisma backend
store/        App state management
theme.ts      Shared design tokens
utils/        Utility helpers
Main Screens
Home dashboard
Daily check-in
Journal
Recovery tools
Account
API Overview
GET /me
GET /journal
POST /journal
PUT /journal/:id
DELETE /journal/:id
Purpose
Sober Start was created as a recovery-focused mobile application designed to support users with reflection, accountability, and practical in-the-moment tools.


