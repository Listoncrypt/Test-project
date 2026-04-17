# Engagement Platform Frontend

A modern engagement platform built with Angular 17, Tailwind CSS, and standalone components.

## Features

- **Signup/Login Pages**: User authentication with email and social login support
- **Onboarding Flow**: Telegram channel integration for user onboarding
- **User Dashboard**: Engagement portal with tasks and withdrawal management
- **Responsive Design**: Built with Tailwind CSS for mobile-first approach
- **Modern Architecture**: Angular 17 with standalone components and lazy loading

## Tech Stack

- **Framework**: Angular 17
- **Styling**: Tailwind CSS 3.3
- **Language**: TypeScript 5.2
- **Package Manager**: npm

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── signup/        # Signup page component
│   │   ├── login/         # Login page component
│   │   ├── onboarding/    # Onboarding page component
│   │   └── dashboard/     # User dashboard component
│   ├── app.component.ts   # Root component
│   ├── app.routes.ts      # Application routing
│   └── app.config.ts      # Application configuration
├── index.html             # Main HTML file
└── styles.css             # Global styles with Tailwind directives
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm start
```

The app will be available at `http://localhost:4200/`

### Build

Build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Available Commands

- `npm start` or `npm run dev` - Start development server (with auto-open)
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run tests
- `npm run lint` - Run linter

## Pages Overview

### Signup Page (`/signup`)

- Email and password registration
- Social login with Twitter/X
- Form validation
- Link to login page

### Login Page (`/login`)

- Email/handle and password login
- Social login support
- "Forgot password" functionality
- Link to signup page

### Onboarding Page (`/onboarding`)

- Telegram channel join flow
- Onboarding checklist
- Gate access to dashboard until channel joined

### Dashboard Page (`/dashboard`)

- User profile with balance display
- Verification status
- Available engagement tasks
- Task engagement system
- Withdrawal request form
- Sidebar navigation

## Configuration

### Tailwind CSS

Tailwind CSS is preconfigured. Customize your theme in `tailwind.config.js`.

### Environment Variables

Create a `.env` file in the root directory for environment-specific variables:

```
API_URL=your_api_url
```

## Future Enhancements

- [ ] Authentication service integration
- [ ] API backend integration
- [ ] User profile management
- [ ] Task completion tracking
- [ ] Payment/withdrawal processing
- [ ] User settings page
- [ ] Analytics dashboard

## License

This project is proprietary.
