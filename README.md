# MovieSearch (React Platform)

MovieSearch is a React SPA that demonstrates the benefits of using Reactive State Management (RSM).

MovieSearch presents a non-trivial UX with requirements for complex filtering, paginated data, computed properties, and custom interactions between two (2) reactive stores.

![](https://user-images.githubusercontent.com/210413/212772247-112e3802-94ac-4500-80b8-ae62d8342f7b.png)

This React SPA uses Tailwind CSS, CVA stylings, Facades, Presentation components, and View Models to demonstrate the beauty and benefit of SoC in React applications.

Additional features include:

- local data cache persistence,
- bi-directional bookmarks support

This repository contains labs and solutions for implementing Reactive State Management (RSM) within the **React** MovieSearch application using either:

- [@ngneat/Elf](https://ngneat.github.io/elf/docs/store): branch `store-finish-elf`
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction): branch `store-finish-zustand`

---

## Reactive Stores

[![Learn about Reactive Stores](https://user-images.githubusercontent.com/210413/221891263-19b62efa-720d-494a-99d8-368bec98faca.png)](./docs/reactive-stores.md)

Learn more here: [Reactive Stores](./docs/reactive-stores.md)

---

![](https://user-images.githubusercontent.com/210413/220787979-7c594623-1902-4c0e-a99c-bea0e06d8981.png)

This CodeLab is the **[starting](https://githubbox.com/ThomasBurleson/)** point for a hands-on FE coding session. Developers leverage their understandings of **Reactive State Management** using Elf + custom Stores/Facades.

> The repository "start" branch solution uses mock data with a `useMovieFacade` hook and does not use any reactive state management.

These two 4-hour code jams include lab exercises that enables developers to practice implementing those ideas using `concepts-to-practice` lab examples. Click links below to open the desired Lab instructions:

#### Reactive Stores with Zustand

- [Lab 1: Implement `MovieStore`](./labs/zustand/lab-1.md)
- [Lab 2: Implement Offline Cache and Immutability](./labs/zustand/lab-2.md)
- [Lab 3: Implement `Bookmark` features](./labs/zustand/lab-3.md)
- [Lab 4: Implement `Pagination` features](./labs/zustand/lab-4.md)

#### Reactive Stores with Elf

- [Lab 1: Implement `MovieStore`](./labs/elf/lab-1.md)
- [Lab 2: Implement `MovieFacade`](./labs/elf/lab-2.md)
- [Lab 3: Implement `useMovieFacade`](./labs/elf/lab-3.md)
- [Lab 4: Use `freezeStores()`](./labs/elf/lab-4.md)

---

## Running Locally

```terminal
npm i && npm start
```

---

## License

MIT © [Thomas Burleson](https://github.com/ThomasBurleson), FE Architect
