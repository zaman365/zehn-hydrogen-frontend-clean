/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

// Extend Hydrogen's Env interface with custom environment variables
declare global {
  interface Env {
    OPENROUTER_API_KEY?: string;
    PUBLIC_META_PIXEL_ID?: string;
    RESEND_API_KEY?: string;
    STOREFRONT_PASSWORD?: string;
    SHOPIFY_WEBHOOK_SECRET?: string;
  }
}
