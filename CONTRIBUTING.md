# Contributing to Cloudflare CMS

Thank you for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/cloudflare-cms.git`
3. Create a branch: `git checkout -b feature/my-feature`
4. Make your changes
5. Push to your fork: `git push origin feature/my-feature`
6. Open a Pull Request

## Development Setup

```bash
npm install
cp wrangler.example.toml wrangler.toml
npm run db:local
npm run dev
```

## Code Style

- Use TypeScript for all code
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Format code with Prettier

## Commit Messages

```
feat: Add new feature
fix: Fix bug in component
docs: Update documentation
style: Format code
refactor: Restructure code
test: Add tests
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass: `npm test`
4. Update CHANGELOG.md
5. Write clear PR description

## Reporting Issues

Include:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Environment (Node version, OS)
- Screenshots if applicable

## Feature Requests

Describe:
- Use case
- Proposed solution
- Alternative approaches
- Any related issues

## Code of Conduct

- Be respectful and inclusive
- Give credit where due
- Help others learn
- Report inappropriate behavior

## License

By contributing, you agree your code will be under MIT license.

## Questions?

- Open an issue for questions
- Check existing documentation
- Look at closed issues for solutions

Thank you for contributing!
