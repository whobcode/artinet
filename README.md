# Bolt: AI-Powered Development Environment

This repository enables seamless development and deployment of an AI-powered coding agent on Cloudflare's global network. It leverages StackBlitz's WebContainers to give an AI model complete control over a full-stack development environment, including the filesystem, package manager, and terminal.

Follow the instructions step by step to set up, develop, and deploy. The guidance here is precise and proven—engineered for efficiency.

*(As ivelLevi, your mad scientist mentor, would say: "Harness this power correctly, mortal, and only then may we consider world domination.")*

---

## 1. Project Setup

To begin your journey, you must first prepare your local environment.

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (version specified in `package.json`)
- [pnpm](https://pnpm.io/installation)
- An active [Cloudflare account](https://dash.cloudflare.com/sign-up)

### Installation

1.  **Clone the Repository:**
    First, acquire the source code.

    ```bash
    git clone https://github.com/coleam00/bolt.new-any-llm.git
    cd bolt.new-any-llm
    ```

2.  **Install Dependencies:**
    Next, summon the required packages using `pnpm`.

    ```bash
    pnpm install
    ```

3.  **Configure Environment Secrets:**
    This project uses a `.dev.vars` file for local development, which is loaded automatically by Wrangler. **Do not** commit this file to version control.

    Create the file by copying the example:
    ```bash
    cp .env.example .dev.vars
    ```

    Now, edit `.dev.vars` and add your secret API keys for the AI providers you wish to use (e.g., OpenAI, Anthropic, Google).

    ```ini
    # .dev.vars
    OPENAI_API_KEY="sk-..."
    ANTHROPIC_API_KEY="sk-..."
    # Add other keys as needed
    ```

## 2. Local Development

With the setup complete, you can now run the application locally.

The development server is managed by `wrangler`, which provides a high-fidelity emulation of the Cloudflare environment, including access to any configured service bindings (KV, D1, etc.).

Execute the following command:

```bash
pnpm run dev
```

This will start the development server, typically available at `http://localhost:5173`. Any changes you make to the source code will trigger a hot-reload.

## 3. Deployment

When you are ready to unleash your creation upon the world, deploying to Cloudflare Pages is a simple, one-step command.

```bash
pnpm run deploy
```

Wrangler will build the application and deploy it to your Cloudflare account. You may be prompted to log in if this is your first time.

## 4. Available Scripts

This repository contains several scripts to streamline your workflow:

-   `pnpm run dev`: Starts the local development server with `wrangler dev`.
-   `pnpm run deploy`: Deploys the application to Cloudflare Pages.
-   `pnpm run build`: Builds the application for production without deploying.
-   `pnpm run test`: Runs the automated test suite using Vitest.
-   `pnpm run lint`: Lints the codebase to ensure code quality and consistency.
-   `pnpm run typecheck`: Runs the TypeScript compiler to check for type errors.
