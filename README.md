# Re:Earth CMS CSV Importer

A web application for importing CSV data into Re:Earth CMS models with field mapping and validation.

## Features

- **CSV File Upload**: Drag-and-drop or click to upload CSV files (up to 50,000 rows)
- **Automatic Field Analysis**: Detects field types (text, number, date, boolean) from CSV data
- **Dual Import Modes**:
  - **Create New Model**: Create a new CMS model from CSV columns
  - **Import to Existing Model**: Map CSV fields to existing model fields
- **Real-time Progress**: Monitor import progress with live updates
- **Error Handling**: Detailed error reporting with downloadable error CSV
- **Privacy-First**: All processing happens in the browser (CSV data never leaves your machine)

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **@reearth/cms-api** - Official Re:Earth CMS SDK
- **PapaParse** - CSV parsing
- **Web Workers** - Non-blocking CSV processing
- **p-queue** - API rate limiting

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Re:Earth CMS account with API access
- API key and workspace ID from Re:Earth CMS

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd reearth-cms-csv-importer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## Usage

### 1. Setup (Step 1)

- Enter your Re:Earth CMS **API Key**
- Enter your **Workspace ID**
- Upload your **CSV file**

The application will automatically analyze your CSV file and detect field types.

### 2. Configure Import (Step 2)

- **Select Project**: Choose which Re:Earth CMS project to import into
- **Choose Import Mode**:
  - **Create New Model**: Define a new model based on your CSV columns
  - **Import to Existing Model**: Map CSV fields to an existing model's fields

### 3. Import Process (Step 3)

Monitor the import process in real-time with:
- Progress bar showing completion percentage
- Current row being processed
- Success/error counts

### 4. Results (Step 4)

View import results:
- Total rows processed
- Successful imports
- Failed rows with error details
- Download error report as CSV for failed rows

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── WizardProvider.tsx
│   ├── WizardContainer.tsx
│   ├── Input.tsx, Select.tsx, Button.tsx
│   └── FileUpload.tsx, Table.tsx, ProgressBar.tsx
├── steps/               # Wizard step components
│   ├── StepOne.tsx      # Setup & CSV upload
│   ├── StepTwo.tsx      # Configure import
│   ├── StepThree.tsx    # Import process
│   └── StepFour.tsx     # Results
├── services/            # Business logic
│   ├── csvParser.ts     # CSV parsing
│   ├── cmsApi.ts        # Re:Earth CMS API wrapper
│   ├── fieldMapper.ts   # Field mapping & validation
│   ├── importService.ts # Import orchestration
│   ├── validators.ts    # Input validation
│   └── storage.ts       # Session storage
├── types/               # TypeScript types
├── utils/               # Utility functions
├── workers/             # Web Workers
│   └── csvParser.worker.ts
├── hooks/               # Custom React hooks
└── test/                # Test utilities
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Security

- **API Credentials**: Stored in sessionStorage (cleared when browser tab closes)
- **Data Privacy**: CSV files are processed entirely in the browser
- **Input Validation**: All user inputs are validated before processing
- **XSS Prevention**: All user-provided data is sanitized before display

## Performance

- **Web Workers**: CSV parsing runs in background thread (non-blocking)
- **Code Splitting**: Lazy-loaded wizard steps for optimal bundle size
- **Rate Limiting**: API requests are throttled (5-10 requests/second)
- **Supports large files**: Up to 50,000 rows with progress tracking

## Deployment

> **⚠️ Important**: The Re:Earth CMS API doesn't allow CORS requests from arbitrary domains. **You need a proxy server** for the application to work in production.

### Vercel (Recommended) 🚀

**Best for:** Fastest deployment, zero configuration, all-in-one solution

Vercel is the **easiest way to deploy** - it handles both static hosting AND the API proxy automatically.

**One-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/airslice/reearth-cms-csv-importer)

That's it! Your app will be live in 2 minutes.

**Or deploy via CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod
```

**📖 Full Vercel deployment guide**: See [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

**Features:**
- ✅ Zero configuration needed
- ✅ Auto-deploy on git push
- ✅ Static hosting + serverless functions together
- ✅ 100GB bandwidth/month (free)
- ✅ Global CDN
- ✅ Custom domains
- ✅ HTTPS automatically

### Other Platforms

**Compatible platforms:**
- ✅ **Vercel** (recommended - easiest)
- ✅ Netlify (similar to Vercel)
- ✅ Cloudflare Pages (with Workers)
- ✅ Google Cloud (Functions + Firebase/Cloud Storage)
- ✅ AWS (Lambda + S3)
- ❌ GitHub Pages alone
- ❌ Simple static hosting alone

## Troubleshooting

### "API key appears to be invalid"
- Verify your API key is correct
- Check that the API key has access to the workspace

### "Failed to fetch projects"
- Verify your workspace ID is correct
- Check your internet connection
- Verify API endpoint is accessible

### "CSV file contains no data rows"
- Ensure CSV file has headers and data rows
- Check CSV file is properly formatted

### Import errors
- Review error details in Step 4
- Download error report for specific row issues
- Verify field type compatibility

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
