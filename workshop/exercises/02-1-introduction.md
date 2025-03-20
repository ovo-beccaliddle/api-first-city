---
layout: layout.njk
---

# Building Your City Service: Introduction

Hey there, awesome city developer! 👋

So you've designed your API contract in the previous exercise - congrats! Now comes the fun part: bringing your service to life with some actual code. This is where API-first really shines because you already have a clear roadmap of what you're building.

## What This Exercise Is All About

In this exercise, we're going to implement your city service based on the API contract you created. Whether you're building a Police Department, Fire Station, Power Plant, or any other city service, the process will be similar. We'll use TypeScript and Express to create a robust, well-structured service that follows modern development practices.

## What You'll Learn

By the time you finish this exercise, you'll be able to:

1. Build a TypeScript service that perfectly implements your OpenAPI specification
2. Use middleware to automatically validate requests and responses against your contract
3. Structure your code in a clean, maintainable way using layers (controllers, services, repositories)
4. Connect your service to the city service registry so others can discover it
5. Test that your implementation matches your API contract exactly

## Why API-First Makes Implementation Easier

When you follow the API-first approach, implementation becomes so much more straightforward:

- **Your API contract serves as your roadmap** - no more wondering what endpoints you need or what data structures should look like
- **Request and response validation happens automatically** - the OpenAPI validator will ensure your implementation matches your contract
- **You focus on business logic, not API structure** - the "what" is already decided, so you can focus on the "how"
- **Other teams can integrate with your service immediately** - they already know your API from the contract
- **Changes are more controlled** - if you need to modify something, you update the contract first, then the implementation

## Tools We'll Be Using

For this implementation, we'll use:

- **TypeScript** - For type safety and better developer experience
- **Express.js** - A lightweight web framework for Node.js
- **express-openapi-validator** - To validate requests and responses against your OpenAPI spec
- **Node.js** - Our runtime environment
- **In-memory storage** - For simplicity (in a real app, you'd use a database)

## A Quick Overview of What We'll Build

Here's the high-level structure we'll create:

```
services/your-service-name/
├── api/
│   └── openapi.yaml         # Your API specification
├── src/
│   ├── models/              # TypeScript interfaces matching your API schemas
│   ├── repositories/        # Data access layer (simulated with in-memory storage)
│   ├── services/            # Business logic layer
│   ├── controllers/         # API endpoint handlers
│   ├── middleware/          # Express middleware (validation, error handling)
│   └── index.ts             # Main application file
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## Ready to Start Coding?

Let's do this! We'll break this down into manageable steps, starting with exploring the sample service we've provided.

Head over to the next section: [Setting Up Your Service Structure](../02-2-setup) 