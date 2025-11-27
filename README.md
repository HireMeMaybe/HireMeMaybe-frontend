This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, build the project:

```bash
npm run build
```

Finally, start the production server:

```bash
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Code Quality Analysis

This project includes SonarQube configuration for code quality analysis.

### Prerequisites

1. Install SonarQube Scanner globally:

   ```bash
   npm install -g sonarqube-scanner
   ```

2. Set up SonarQube server (local or cloud)

### Running SonarQube Analysis

#### Option 1: Local SonarQube with Docker (Recommended)

1. Start Docker Desktop
2. Start SonarQube server:
   ```bash
   npm run sonar:start
   ```
3. Wait for SonarQube to be ready (check logs with `npm run sonar:logs`)
4. **First-time setup**:
   - Open http://localhost:9000 in your browser
   - Login with default credentials: `admin` / `admin`
   - You'll be prompted to change the password - set a new password
   - Go to My Account → Security → Generate Tokens
   - Create a new token (e.g., "scanner-token") and copy it
5. Run analysis with your token:
   ```bash
   npm run sonar:local -- -Dsonar.token=YOUR_TOKEN_HERE
   ```
6. Stop SonarQube when done:
   ```bash
   npm run sonar:stop
   ```

#### Option 2: SonarCloud (Free for Open Source) ✅ **WORKING**

1. Sign up at https://sonarcloud.io with your GitHub account
2. Create a new project and get your organization key
3. Generate a token in SonarCloud
4. Run analysis:
   ```bash
   npm run sonar:cloud
   ```
   _Note: Configuration is already set up for the `hirememaybe` organization_

#### Option 3: Remote SonarQube server

```bash
npm run sonar -- -Dsonar.host.url=YOUR_SONAR_URL -Dsonar.token=YOUR_TOKEN
```

### Troubleshooting

- **"Failed to fetch server version"**: Make sure SonarQube server is running
- **Docker not found**: Install Docker Desktop and make sure it's running
- **Connection refused**: Check if the SonarQube URL is correct and accessible
- **"You must define sonar.organization"**: Use the working `npm run sonar:cloud` command
- **Quality Gate FAILED**: This is normal for projects without tests - check SonarCloud dashboard for details

### Configuration Files

- `sonar-project.properties` - Main SonarQube configuration (for local/remote server)
- `sonar-project.cloud.properties` - SonarCloud specific configuration
- `.sonarignore` - Files and directories to exclude from analysis
- `docker-compose.sonar.yml` - Docker configuration for local SonarQube
- `.github/workflows/sonarqube.yml` - Automated CI/CD analysis (requires secrets setup)

### Setting up GitHub Actions for Automated Analysis

**Automatic SonarCloud analysis** runs on:

- Pushes to `main` or `develop` branches
- Pull requests

**Required GitHub Secrets:**

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add these repository secrets:
   - `SONAR_TOKEN` - Your SonarCloud authentication token
   - `SONAR_HOST_URL` - Set to `https://sonarcloud.io` (for SonarCloud)

**View Results:**

- SonarCloud Dashboard: https://sonarcloud.io/dashboard?id=hirememaybe-frontend
- GitHub Actions tab: See workflow execution logs

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
