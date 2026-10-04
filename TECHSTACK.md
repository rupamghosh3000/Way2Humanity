# Way2Humanity — Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- Map integration
- Three.js only if required by the supplied frontend design

## Backend

Recommended:

- Node.js
- TypeScript
- NestJS or Express with a strict modular architecture

For a production project, NestJS is preferred because it provides clear module, guard, validation, and dependency patterns.

## Database

- MongoDB Atlas
- Mongoose or Prisma with MongoDB support, selected once and used consistently

## Authentication

- JWT access/refresh strategy or secure server session strategy
- bcrypt/argon2 password hashing
- Google OAuth
- Email verification
- Password reset

Do not store plain passwords.

## Validation

- Zod on frontend/shared schemas where possible
- class-validator or Zod on backend
- Server-side validation is authoritative

## Storage

- AWS S3, Cloudflare R2, or Cloudinary
- CDN delivery for public/approved media
- private signed URLs for sensitive evidence

## AI

AI provider abstraction supporting:

- vision/image analysis
- structured extraction
- anomaly/risk signals
- duplicate/similarity workflow

Do not hard-code business truth into an AI model response.

## Maps

Google Maps Platform or Mapbox.

Required capabilities:

- map display
- geocoding
- reverse geocoding
- distance calculation
- optional directions

## Payments

India MVP:

- Razorpay

Future:

- Stripe
- PayPal

Payment provider integration must use signed webhooks.

## Email

Examples:

- Resend
- SendGrid
- Amazon SES

Choose one for MVP.

## Queue

Recommended:

- Redis + BullMQ

## Logging / Monitoring

- structured server logs
- Sentry or equivalent error tracking
- uptime monitoring
- provider webhook logs

## Deployment

Frontend:
- Vercel or equivalent

Backend:
- Railway, Render, AWS, or equivalent

Database:
- MongoDB Atlas

Storage:
- S3/R2/Cloudinary

Redis:
- managed Redis

## Development Tools

- Git
- GitHub
- ESLint
- Prettier
- Husky
- Vitest/Jest
- Playwright
- Postman/Insomnia

## Principle

Avoid adding a technology merely because it is trendy. Every dependency must solve a real product requirement.
