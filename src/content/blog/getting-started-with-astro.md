---
title: Getting Started with Astro
description: Learn how to build fast, content-focused websites with Astro. This guide covers the basics of setting up your first Astro project.
pubDate: 2024-01-15
author: john-doe
image: /images/blog/astro-intro.jpg
tags:
  - Astro
  - Web Development
  - Tutorial
categories:
  - Tutorials
draft: false
showToc: true
---

Astro is a modern static site generator that delivers lightning-fast performance by shipping zero JavaScript by default. In this guide, we'll walk through the basics of getting started with Astro.

<!-- toc -->

## Why Astro?

Astro is designed for building content-focused websites like blogs, marketing sites, and documentation. It offers several key advantages:

- **Zero JavaScript by default**: Your pages load faster because there's no JavaScript bundle to download
- **Component Islands**: Use your favorite UI framework (React, Vue, Svelte) only where you need interactivity
- **Content Collections**: Built-in support for organizing and validating your content

## Setting Up Your First Project

Getting started with Astro is straightforward. Open your terminal and run:

```bash
npm create astro@latest
```

Follow the prompts to configure your project. Astro will set up a new directory with everything you need to start building.

## Project Structure

A typical Astro project looks like this:

```
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
└── package.json
```

## Next Steps

Now that you have your project set up, explore the [Astro documentation](https://docs.astro.build) to learn more about components, layouts, and content collections.

Happy building!
