# EmbedQA UI

Angular 17 frontend for EmbedQA - Professional API Testing Platform.

## Features

- Request Builder with HTTP methods, headers, params, body, auth
- Response Viewer with formatting and timing
- Collections management
- Environment variables
- Request history

## Development

```bash
# Install dependencies
npm install

# Start dev server (proxies to backend at localhost:8085)
npm start

# Build for production
npm run build:prod
```

## Project Structure

```
src/
├── app/
│   ├── core/           # Services, models, interceptors
│   ├── shared/         # Shared components
│   └── features/       # Feature modules
├── assets/
├── environments/
└── styles.scss
```
