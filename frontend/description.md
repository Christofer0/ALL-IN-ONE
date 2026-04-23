# Frontend Project Description

This is a modern, responsive frontend application built with **Vue 3**, **Vite**, and **Tailwind CSS v4**. It serves a dual purpose: a public-facing portfolio/blog website and a private, authenticated dashboard system.

## Tech Stack Overview

- **Framework:** Vue 3 (Composition API with `<script setup>`)
- **Build Tool:** Vite (configured for fast HMR and optimized builds)
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS v4 (with custom `@theme` directives and global scoping)
- **Routing:** Vue Router (handling both public and private route layers)
- **Icons:** Lucide Vue Next
- **UI Components:** Reka UI & standard HTML elements with Tailwind

## Architecture & Layout System

The application is structurally divided into two distinct environments to ensure clean separation of concerns and styling:

1. **Public Website (`.public`)**
   - **Purpose:** Personal portfolio, project showcase, blog, and contact page.
   - **Views:** `Home`, `About`, `Projects`, `ProjectDetail`, `Blog`, `Contact`.
   - **Theme:** Supports a highly customized Dark/Light mode toggle. Features aesthetic elements like a static grain noise background, sticky scroll-spy Table of Contents, and scroll-reveal intersection observers.

2. **Private Dashboard (`.private`)**
   - **Purpose:** An administrative interface to manage content (CMS), notes, habits, etc.
   - **Layout:** Features a persistent Sidebar and Navbar navigation structure.
   - **Views:** `Dashboard`, and various CMS/Utility pages.
   - **Theme:** Forced dark-mode aesthetic with custom component styling (cards, tables, badges) tailored for a dense information layout.

## Styling Strategy

To prevent CSS collisions between the highly stylized public portfolio and the complex private dashboard, the project relies on **Namespace Scoping in the Global Stylesheet (`style.css`)** rather than heavy use of Vue's `<style scoped>`.

- **`.public` Scope:** All custom styles for the landing pages (like `.article-card`, `.project-card`, `.prose` typography, and animations) are wrapped inside the `.public` selector in the root `style.css`.
- **`.private` Scope:** All dashboard-specific styling (like `.main-content`, `.sidebar`, `.stat-card`) is wrapped inside the `.private` selector.
- **Root Layout Binding:** The top-level root `<div class="public">` or `<div class="private">` is applied in the templates to enforce these stylistic boundaries.

## Performance Optimizations

- **Static Noise Texture:** The initial SVG turbulence filter for the background grain was optimized into a static, repeating PNG Data URI. Combined with hardware acceleration (`transform: translateZ(0)`), this ensures buttery smooth 60fps Dark/Light mode transitions without CPU overhead.
- **Targeted Transitions:** CSS transitions strictly target specific properties (e.g., `transform`, `box-shadow`) instead of using `transition: all`, preventing unnecessary layout recalculations.
- **Lazy Animations:** `IntersectionObserver` is utilized across public pages to only animate elements (`.reveal`) when they scroll into the viewport.

## Getting Started

To run the frontend environment locally:

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev

# Build for production
npm run build
```
