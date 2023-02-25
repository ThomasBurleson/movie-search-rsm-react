# MovieSearch (React Platform)

MovieSearch is a React SPA that demonstrates the benefits of using Reactive State Management (RSM).

MovieSearch presents a non-trivial UX with requirements for complex filtering, paginated data, computed properties, and custom interactions between two (2) reactive stores.

![](https://user-images.githubusercontent.com/210413/212772247-112e3802-94ac-4500-80b8-ae62d8342f7b.png)

This React SPA uses Tailwind CSS, CVA stylings, Facades, Presentation components, and View Models to demonstrate the beauty and benefit of SoC in React applications.

Additional features include:

- local data cache persistence,
- bi-directional bookmarks support

---

![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

This CodeLab is the **[starting](https://githubbox.com/ThomasBurleson/)** point for a hands-on FE coding session. Developers leverage their understandings of **Reactive State Management** using Elf + custom Stores/Facades.

> The repository "start" branch solution uses mock data with a `useMovieFacade` hook and does not use any reactive state management.

This 4-hour code jam exercise enables developers to practice implementing those ideas using `concepts-to-practice` lab examples.

Click links below to open the desired Lab instructions:

- [Lab 1: Implement `MovieStore`](./labs/lab-1.md)
- [Lab 2: Implement `MovieFacade`](./labs/lab-2.md)
- [Lab 3: Implement `useMovieFacade`](./labs/lab-3.md)
- [Lab 4: Use `freezeStores()`](./labs/lab-4.md)

---

## Reactive State Management

This repository contains labs and solutions for implementing Reactive State Management (RSM) within the **React** MovieSearch application using either:

- [@ngneat/Elf](https://ngneat.github.io/elf/docs/store): branch `store-elf-start`
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction): branch `store-zustand-start`

## Concepts

Reactive State Management (RSM) uses a `Facade-Store-DataService` engine and publishes a `ViewModel` for consumption in the UI layers.

See the diagram below for illustration:

![](https://user-images.githubusercontent.com/210413/221055002-0d90088b-af56-40ae-aac5-7119fb01c9cf.png)

Within React, we implement a custom React Hook to manage the facade usage and publishing the `[vm, genre]` Tuple in the UI layers.

#### The Magic Secret

![](https://user-images.githubusercontent.com/210413/220787522-6da0155d-9e6f-439b-94ab-016324aed2d4.png)

As you implement the RSM code in the business layer, you should note that you are delivering powerful features... WITHOUT changing the UI code.

In fact, we can easily replace the **Elf**-based RSM solution with **Zustand**...without changing the UI or view models.

> All the power of RSM is hidden inside the business layer and exposed via the ViewModel.

![](https://user-images.githubusercontent.com/210413/220697616-0559ac4d-2f2b-494f-8c0e-b7305b8eab9d.png)

With well-defined ViewModel APIs, we have a separation of concerns (SoC) between the UI and business layers. And this SoC means that we can implement the UI _in parallel_ with implementation of the custom RSM engine.

---

## Why Reactive State Management

Developers often wonder "**Why** Reactive State Management (RSM) is critical for complex web applications?"

![](https://user-images.githubusercontent.com/210413/221086286-1637b748-e60e-4827-ab91-f2cb42af423e.png)

Here are key bullet point answers to "**When** to use Reactive State Management?":

#### Classic SPA Problems/Debt

- Business logic is enmeshed with UI making changes complex and prone to bugs
- Sharing data between 1..n components (often not within a parent-child relationship)
- Multiple ‘sources of truth’ in code causes bugs and complexity
- Unintended side-effects when implementing new functionality
  - Quickly leads to "spaghetti" code.
- Multiple, redundant calls to server for data fetchings
- Distributed data transformations
- Mutable, unprotected data
  - Classic nightmare: "Who is change what and when?"

#### Architecture Goals

- UI Layers

  - Move business logic out of the UI layer
  - Minimize impacts to UI-specific code (HTML + CSS)
  - Trigger UI rerenders correctly and consistently
  - Avoid manual RxJS subscribes in UI components
  - Separation of concerns from UI code vs Business Logic
  - Minimal imperative code in UI components

- Business Layers
  - Data stores for data that already exists in our system to have a single source of truth when we are editing it.
  - Centralized code with a single source of truth
  - Support for paginated data with client-side caching, prefetching, and invalidation
  - Bidirectional support for bookmarks (url updates RSM, RSM updates url)
  - Support for immutable data and client-side persistence (if needed)
  - Support for computed/derived data properties
  - Support for extensive non-UI testing of business logic and change notifications

#### RSM Training Slides

- [Reactive Solutions (Part 1)](https://slides.com/thomasburleson/reactive-architectures-part-1?token=IPeX6Q07)
- [Reactive Solutions (Part 2)](https://slides.com/thomasburleson/reactives-solutions-part-2?token=Qc1pZ_AN)

---

## RxJS Experts Required?

Elf is really challenging IF the developer does NOT know RxJS!

Even with RxJS experience, "raw" Elf code is very hard to implement correctly. Hence the creation of the RSM library at `/utils/rsm/**/*.ts`

![RSM Library](https://user-images.githubusercontent.com/210413/220992228-48c47168-cfb1-406a-b339-fc2be342a811.png)

#### Implementing Custom RSM

Now here is what an organization should do when considering RSM solutions within their products:

- Developers should first 'plan' for RSM features
  - review UX to identify shared data and data flows
  - define the ViewModel API based on UI workflows

<br/>

- Separate responsibilities of UI from RSM.
  - 1 team develops the custom Stores
    - implements Jest tests for Stores.
    - **requires RxJS expertise**
  - Other teams use the Stores
    - implements Cypress tests for UI
    - **NO RxJs** expertise needed and workflows

---

## Running Locally

```terminal
npm i && npm start
```

---

## License

MIT © [Thomas Burleson](https://github.com/ThomasBurleson), FE Architect
