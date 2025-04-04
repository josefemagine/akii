# Legacy Bedrock API Endpoints

These files have been retained for backward compatibility during migration to Next.js API routes.

## Migration Status

The API endpoints have been moved to `/pages/api/bedrock-next/`. These legacy endpoints in `/api/bedrock/` now serve as compatibility layers that provide basic functionality until the Next.js API routes fully take over.

## Why Two Implementations?

Vercel showed errors when we moved the API endpoints to the Next.js structure because:

1. The original endpoints were still being called by the frontend
2. Module resolution issues occurred when those files were moved

This compatibility layer maintains service availability during transition.

## Usage

All API requests should continue to be sent to:

- `/api/bedrock/instances` (GET)
- `/api/bedrock/provision-instance` (POST)
- `/api/bedrock/delete-instance` (POST)

They will be automatically routed to the new Next.js API routes via rewrite rules in `vercel.json` and `next.config.js`.

## Future Plans

Once the migration is complete and stable, these legacy files should be removed, and only the Next.js API routes in `/pages/api/bedrock-next/` should be maintained. 