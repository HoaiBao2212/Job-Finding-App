# Copilot Instruction: Job Search App (React Native Expo + Firebase)

## Objective

Create a cross-platform job search application (Android/iOS) using
**React Native (Expo)** and **Firebase**.

## Requirements

### 1. Technologies

-   React Native + Expo
-   Firebase Authentication
-   Firebase Firestore
-   Firebase Storage

### 2. Features

-   User Authentication (login, register, logout)
-   Job listing with search + filter
-   Job detail screen
-   Apply for job (upload CV to Storage)
-   User Profile (update avatar, info, view applied jobs)
-   Employer section (optional): post/edit/delete jobs, view applicants

### 3. Code Requirements

-   Provide full project structure

-   Include:

    -   App.js
    -   Navigation (stack/tab)
    -   Screens: 
        Candidate: Login, Register, Home, FindJob, JobDetail, Profile, Apply,
        Admin: Dashboard, PostJob
    -   Components: JobCard, SearchBar, FilterModal
    -   firebaseConfig.js

-   Use React Hooks

-   Use AuthContext for user management

-   Should run after `npm install`

-   Supabase structure:

        /users
        /jobs
        /applications

-   Provide Firebase setup guide

-   Include sample data

### 4. UI Requirements

-   Modern UI (minimalistic)
-   Use React Native Paper or NativeWind

### 5. Output

-   Complete source code that runs immediately
-   Setup instructions
-   File structure
-   Sample Firestore data
