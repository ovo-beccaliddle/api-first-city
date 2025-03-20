---
layout: layout.njk
---

# Exercise 1: Welcome to API-First Development in City Services!

Hey there, future city service developer! 👋 

In this first exercise, we're going to dive into the exciting world of API-first development using our City Services project. Whether you're building police dispatch systems, power plants, or traffic cameras, the principles we cover here will help you create robust, well-designed APIs.

## What You'll Learn

By the time you finish this exercise, you'll be able to:

1. Understand why API-first development is awesome (and why we use it)
2. Create your own API specification using OpenAPI 3.0
3. Make sure your API spec is valid and well-formed
4. Generate slick documentation that other teams can actually use

## What's This API-First Thing Anyway?

API-first development is an approach where we design and agree on the API contract *before* writing any code. It's like having architectural plans before building a house—you wouldn't just start laying bricks, would you?

Here's why it's cool:

- **Work in parallel**: While you're building your service, product teams can already start designing UIs against your API
- **Clear contracts**: Everyone knows exactly what data is going in and out
- **Consistency**: All city services follow the same patterns (no weird surprises!)
- **Documentation that doesn't suck**: Your API docs are always up-to-date
- **Cool tools**: Generate code, tests, and mocks right from your spec

## The City Services Project

Our city is full of different services that need to talk to each other. Imagine:

- An ambulance needs to find the nearest hospital with available beds
- A power plant needs to report energy usage to financial reporting
- Traffic cameras need to notify the fines system when someone runs a red light

All these services will have their own APIs, but they need to communicate through a central registry so they can find each other.

## Let's Get Started!

### 1. Check Out the Sample Service

We've built a sample service to show you how things work. Take a look:

1. Open the sample service API specification at `services/sample/api/openapi.yaml`
2. Look at the endpoints, request/response structures, and security settings
3. Notice how the API is organized around resources and actions

The sample service is your friend! It shows our standard patterns and will help you implement your own service.

### 2. Make Sure the Sample API Is Valid

Before using the sample as a reference, let's make sure it's valid:

```bash
cd services/sample
npm run validate-api
```

If you see any errors, fix them. This is a good way to learn the OpenAPI format.

### 3. Create Your Own API Specification

Now it's your turn! Based on the service your team has been assigned (Police, Fire, Power Plant, Traffic Cameras, etc.), create an API specification:

1. Create a directory for your service: `services/your-service-name`
2. Create an API spec file: `services/your-service-name/api/openapi.yaml`
3. Define your key resources and endpoints based on the service description
4. Include request parameters, response schemas, and examples
5. Add security requirements (we use OAuth2)
6. Validate your specification

Need inspiration? Look at your service description in the Product document to see what resources and actions you need to support.

### 4. Generate Documentation and Share It

Once your API spec is ready, generate documentation to share with your team:

```bash
npm run generate-docs
```

This will create beautiful, interactive documentation that shows all your endpoints, data models, and examples.

## Bonus Challenges

If you're racing ahead:

1. Add detailed examples that show how your API works in real scenarios
2. Define error responses for different failure scenarios
3. Add schema validation rules like minimum/maximum values 
4. Set up a mock server so others can test against your API without real implementation:
   ```bash
   npm run mock-api
   ```

## Helpful Resources

- Check out the OpenAPI docs: https://swagger.io/specification/
- Play with the Swagger Editor: https://editor.swagger.io/
- Ask questions! We're all learning together.

## What's Next?

In the next exercise, you'll implement your service based on the API contract you just created. You'll see how the API-first approach makes implementation straightforward and ensures you deliver exactly what you promised.

Ready to move on? Head to [Exercise 2: Implementing Your City Service](../../02-1-introduction)
