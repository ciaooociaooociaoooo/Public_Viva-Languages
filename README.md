## Production Live Demo
[https://viva-languages.vercel.app](https://viva-languages.vercel.app)

## Getting Started Locally
1. npm run dev
2. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack
- Next.js v15
- React v19
- TypeScript
- Auth.js v5
- Neon Serverless Postgres v1
- Zod v4
- Stripe (Test mode) v20
- Cloudinary v2
- Tailwind CSS v4
- GSAP v3
- Lottie
- Quill v2
- Recharts v3
- next-themes

## Features
- Admin Dashboard
- Google OAuth2 Authentication (with Auth.js)
    - User active-status validation during sign-in and protected page navigation
    - Callback URL handling for post-authentication redirects
- Role-Based Authorization (with Auth.js)
- Guest Cart (for unauthenticated users)
    - Sets a cookie for guest users when an item is first added to cart
    - Stores guest cart data in the database
    - Refreshes the cookie when guests add, update quantities, or remove cart items
- Stripe Webhook (Test mode)
    - Listens for Stripe payment_intent.succeeded event
    - Handles order creation after payment success
- Neon Serverless Postgres Transactions
    - Used during program deletion and order creation
- Parallax Effect
- Scroll Into View
    - Automatically scroll to the first problematic cart item in cart and during checkout
- Responsive Infinite Autoplay Carousel
    - Clickable on desktop; Clickable & Swipeable on mobile
- GSAP MorphSVG
    - Animated SVG transitions on About Us page 
- Dark Mode (Admin Dashboard)
- Accessibility Necessities
    - Skip-to-content navigation for faster keyboard access
    - Screen reader live announcements for dynamic state changes and action
    - ARIA attributes and Tailwind's sr-only used
