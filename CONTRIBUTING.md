# Contributing to ChessRoot

Thanks for your interest in contributing!

## Getting started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/chess-app.git`
3. Install dependencies: `yarn install`
4. Run the dev server: `ng serve`

## Development

### Project structure

```
src/
  app/
    components/     -- UI components
    services/       -- API services, auth
    state/          -- NgRx store
    model/          -- Types and interfaces
    utils/          -- Pure utility functions
    achievements/   -- Achievement definitions and checkers
```

### Code style

- TypeScript with strict mode
- Angular standalone components (no NgModules)
- Signals for state management
- Run `yarn lint` before committing
- Run `yarn prettier` to format code

### Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: correct a bug
refactor: restructure without changing behaviour
docs: update documentation
```

## Pull request process

1. Create a feature branch from `main`
2. Make your changes
3. Run `yarn lint` and `yarn build` to verify
4. Open a PR targeting `main`
5. A maintainer will review and merge

## Questions?

Open a [discussion](https://github.com/PawelGawlikDev/chess-app/discussions) or contact the maintainer directly.
