# Project Proposal

**Project Title:** OwnStore – A Full-Stack E-Commerce SaaS Platform & Marketplace  
**Course Name:** [Insert Course Name]  
**Submitted To:** [Insert Teacher/Professor's Name]  
**Submitted By:** [Insert Your Name and Roll/Student Number]  
**Date:** [Insert Date]  

---

## 1. Introduction
With the rapid growth of e-commerce, independent creators and small businesses often struggle to establish an online presence due to the technical complexity of setting up standalone stores. **OwnStore** is a comprehensive, full-stack Software as a Service (SaaS) e-commerce platform designed to solve this issue. It acts as a dual-sided platform: it provides merchants with a seamless "Mini-Shopify" experience to manage their business, while simultaneously aggregating their products into a global marketplace for consumers.

## 2. Problem Statement
- **For Sellers:** Existing solutions are often expensive or require technical expertise to set up, manage products, and handle discounts. 
- **For Buyers:** Finding curated, high-quality products from independent creators is difficult because these stores are scattered across the internet.

## 3. Proposed Solution
The proposed project, **OwnStore**, bridges this gap by offering an all-in-one platform. It features a decoupled architecture (React frontend + PHP backend) that ensures high performance and scalability. Sellers can quickly create an account, upload products, and manage their store via a dedicated Admin Dashboard. Buyers can browse a unified, aesthetically pleasing marketplace, add items to a wishlist, and experience a streamlined checkout process.

## 4. Key Modules and Features

### A. Merchant (Seller) Module
1. **Admin Dashboard:** A centralized, secure hub for merchants to oversee their store.
2. **Product Management:** Full CRUD (Create, Read, Update, Delete) capabilities for store inventory.
3. **Discount Management:** A system to create and manage promotional campaigns.
4. **Subscription Plans:** A tiered pricing model representation (Basic, Pro, Plus) for SaaS monetization.

### B. Consumer (Buyer) Module
1. **Global Marketplace:** A responsive, visually engaging product grid with search and filtering capabilities.
2. **Wishlist System:** Allows users to save favorite products across sessions.
3. **Cart & Checkout Modal:** A frictionless, high-conversion checkout interface.

### C. System & Security Module
1. **Authentication:** Secure user login and registration system with JWT (JSON Web Tokens).
2. **Role-Based Access Control:** Differentiating between standard users (buyers) and admin users (sellers).

## 5. Technology Stack & Architecture
The project utilizes a modern, decoupled tech stack to separate the user interface from business logic:
- **Frontend Layer (Client-Side):** 
  - **React.js 19 & Vite:** For a fast, responsive, and dynamic Single Page Application (SPA).
  - **Tailwind CSS v4 & Framer Motion:** For modern UI styling, responsive design, and smooth micro-animations.
- **Backend Layer (Server-Side API):**
  - **PHP:** Lightweight, RESTful API endpoints handling business logic, authentication, and routing.
- **Database Layer:**
  - **SQLite:** A portable, serverless database for efficient and reliable data storage.

## 6. Project Objectives & Learning Outcomes
By completing this project, the following objectives will be achieved:
1. Practical application of building a decoupled **RESTful API** architecture.
2. Mastery of modern frontend state management and dynamic UI routing.
3. Implementation of secure user authentication flows (JWT).
4. Experience in database design and relational data management using SQLite.

---
**Approval Signature:** ___________________________  
**Date:** ___________________________
