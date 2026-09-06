# Tripder

Collaborative travel planning for groups.

## The Problem

Traditional travel planning is usually centralized around one person. Someone takes charge, researches, and makes decisions — while the rest of the group simply goes along. This leads to one-sided itineraries, skipped compromise, and trips that don't actually reflect what everyone wants.

## The Idea

Tripder is inspired by swipe-style interfaces (think dating apps, but for destinations and activities). We studied a competitor, **SwipeSights**, and identified a key limitation: it aggregates group preferences but gives no insight into the **"why"** behind any of them.

## Our Solution

Tripder's primary goal is to surface the why behind every preference. When a group is planning together, understanding the reason behind each choice is what makes genuine compromise and consensus possible — turning a pile of individual "yeses" into a final itinerary everyone feels good about.

Each user swipes on places and activities, and instead of just collecting a preference, Tripder captures the reasoning behind it. From there, the group can see where people align, where they differ, and why — making it easier to negotiate and land on a day that keeps everyone happy.

## MVP

This is the core MVP: a swipe-driven flow that captures each member's preferences *and* the reasoning behind them, then merges everything into a shared itinerary with the context needed to reach consensus.

## Setup

### Prerequisites

- Node.js
- Supabase project (for edge function proxy)

### Environment Variables

Create a `.env` file with:

```
VITE_PLACES_PROXY_URL=https://<your-project-ref>.supabase.co/functions/v1/places-autocomplete
```

### Supabase Edge Function

The places autocomplete proxy lives in `supabase/functions/places-autocomplete/`. Deploy it with:

```bash
supabase functions deploy places-autocomplete --no-verify-jwt
```

Set these secrets on your Supabase project:

```bash
supabase secrets set SERP_API_KEY=<your-serpapi-key>
supabase secrets set STATIC_MAP_KEY=<your-google-maps-static-api-key>
```

### Local Development

```bash
npm install
npm run dev
```
