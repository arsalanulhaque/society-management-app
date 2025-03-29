
# Welcome to your Lovable project - Maintenance System

## Project info

**URL**: https://lovable.dev/projects/66259d24-29dd-4416-9532-1115f621cd8a

## Project Overview

This is a maintenance system application for managing housing society operations. It includes:

- User authentication with role-based access control
- Dashboard with key metrics and charts
- Plot management
- Receivables tracking
- Expense management
- Reporting

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Setup Instructions

### Frontend Setup

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Backend Setup

```sh
# Step 1: Navigate to the server directory
cd src/server

# Step 2: Install server dependencies
npm install

# Step 3: Create an .env file based on .env.example
# Copy .env.example to .env and edit as needed

# Step 4: Set up the database
npm run setup-db

# Step 5: Start the server
npm run dev
```

## Database Setup

The application uses MySQL. The setup script will:

1. Create the database if it doesn't exist
2. Create all required tables
3. Create necessary views for the dashboard
4. Insert seed data for testing

## Default Users

After setup, you can log in with the following credentials:

- **Admin**: 
  - Username: admin
  - Password: password123
  
- **Manager**: 
  - Username: manager
  - Password: password123
  
- **Staff**: 
  - Username: staff
  - Password: password123
  
- **Resident**: 
  - Username: resident
  - Password: password123

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/66259d24-29dd-4416-9532-1115f621cd8a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/66259d24-29dd-4416-9532-1115f621cd8a) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
