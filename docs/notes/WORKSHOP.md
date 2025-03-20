# API First Workshop: Building Reusable, Evolving APIs

## Overview

This hands-on workshop explores the **API-first approach**, enabling Engineering and Product teams to work **in parallel** while building APIs as products. The focus is on **reusable patterns, flexibility, and long-term API evolution** over rigid governance.

### **Key Takeaways**

#### **Engineering Teams**

- Learn how to **rapidly implement API-first services** without extensive product requirements.
- Understand how **some services can be built based on known domains** without lengthy planning.
- Experience how **API-first practices enable iteration** without excessive upfront work.
- Use a **walking skeleton** to quickly bootstrap an API and get to work immediately.

#### **Product Teams**

- Work **across domains** to design APIs **collaboratively** with other product managers.
- Learn to **define APIs through exploration**, rather than waiting for months of refinement.
- See how **contract-first API design** allows teams to work independently while aligning on a shared vision.
- Understand how **API design impacts service interoperability** across different teams.

#### **Both Teams Together**

- Experience how **cross-team alignment** leads to better, faster product delivery.
- Learn to **document APIs effectively** so that engineering and product teams can communicate through contracts.
- Understand that **incremental API evolution** is possible—even when cross-team dependencies exist.

---

## **Workshop Agenda (240 minutes)**

### **1. API First Foundations (30 min)**

- **Kickoff:** Introduction to API-first, why it matters, and how it enables fast iteration.
- **City Metaphor:** How different teams (departments) can own services but still collaborate.
- **Walking Skeleton:** How it ensures everyone starts with a functioning API.

### **2. Engineering + Product Breakout (90 min)**

#### **Engineering: Implementing ‘Known’ Domain Services**

- Teams receive **a pre-defined service** (e.g., police, fire, utilities).
- **Define API contracts** quickly based on known domain knowledge.
- **Goal:** Show that **APIs don’t need extensive product planning** to start delivering value.

#### **Product: Exploring Cross-Domain Services**

- Product managers **collaborate to define services that span multiple domains**.
- **Exercise:** Identify APIs that require **shared access**, e.g., permit applications that involve both fire and police.
- **Goal:** Show that **API design can be iterative**, refining over time rather than requiring everything upfront.

### **3. First Integration & Feedback Round (20 min)**

- Teams **exchange API contracts** and discuss integration points.
- Engineering and Product teams **adjust contracts where needed**.
- **Goal:** Show that **cross-team collaboration doesn’t require waiting on perfect documentation**.

### **4. API Lifecycle: Change Management & Testing (60 min)**

- **Versioning:** How to **extend an API without breaking consumers**.
- **Testing:** **Contract & integration testing** to ensure APIs meet expectations.
- **Monitoring & Metrics:** Setting up **basic API health checks**.
- **Goal:** Reinforce the idea that APIs are **evolving products, not static contracts**.

### **5. Final Integration & Cross-Team Review (20 min)**

- Product teams **show how cross-domain services evolved**.
- Engineering teams **demonstrate working APIs**.
- **Goal:** Experience how **iterative API development leads to better alignment**.

### **6. Debrief & Lessons Learned (20 min)**

- **What worked?** What was easier than expected?
- **Where were the biggest struggles?**
- **Did API-first reduce dependencies or create new ones?**
- **How did API-first enable long-term flexibility?**
- **Final thoughts:** What can we take into our own teams?

---

## **Technical Implementation & Tools**

### **Technology Stack**

- **Node.js + TypeScript** for API development
- **Express.js** for API routing
- **OpenAPI 3.0** for API contract definition
- **Docker + k3d** for local Kubernetes-based deployments
- **Gravitee API Gateway** for API management
- **OAuth 2.0** for authentication
- **Google Pub-Sub** for event-driven communication
- **Firebase** as a document database
- **Swagger UI** for API documentation

### **Walking Skeleton: Bootstrapping APIs Quickly**

A **walking skeleton** is provided to ensure:

- A working **service registry** for service discovery.
- A **central IAM service** for authentication.
- A **Gravitee API Gateway** for managing API routing.
- **Standardized error handling**, logging, and testing frameworks.

### **Testing & API Quality**

- **Contract Testing** ensures API implementations match OpenAPI specs.
- **Integration Testing** validates inter-service communication.
- **Unit Testing** covers business logic and models.
- **End-to-End Testing** simulates user interactions across services.
- **CI/CD** with GitHub Actions (or similar) ensures repeatable deployments.

---

## **Closing Thoughts**

This workshop is designed to **challenge common misconceptions** about API-first development. By working in **parallel** and embracing **iteration**, teams will experience firsthand how APIs can be built **efficiently, flexibly, and with long-term evolution in mind**.

This isn’t just about writing APIs—it's about **changing how we think about building services**.

---

## **Next Steps**

- [ ] Finalize workshop materials & pre-configured environments.
- [ ] Test the walking skeleton setup with a pilot group.
- [ ] Document real-world API-first case studies to inspire participants.
- [ ] Define follow-up exercises for teams to continue practicing post-workshop.

🚀 **API-first isn’t a process—it’s a mindset shift. Let’s get started.**
