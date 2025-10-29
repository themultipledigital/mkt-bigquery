# Cloudflare Workers Utilities

This folder contains utility scripts for managing Cloudflare Workers.

## Download Script

The `download_cloudflare_workers.py` script downloads all your Cloudflare Workers and saves them to the parent directory (`cloudflareworkers/`).

### Features

- **Automatic Cleaning**: Removes multipart form data headers and boundary markers
- **Batch Download**: Downloads all workers in your account at once
- **Secure**: Uses API tokens (read-only access)

### Setup

1. **Install Dependencies**

```bash
pip install -r requirements.txt
```

2. **Get Your Cloudflare Credentials**

- **API Token**: Create at https://dash.cloudflare.com/profile/api-tokens
  - Use "Edit Cloudflare Workers" template or add `Account > Workers Scripts > Read` permission
- **Account ID**: Find in your Cloudflare dashboard URL or Workers & Pages overview

### Usage

#### Option 1: Set Environment Variables (Recommended)

**PowerShell:**
```powershell
$env:CLOUDFLARE_API_TOKEN="your_api_token_here"
$env:CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
python download_cloudflare_workers.py
```

**Command Prompt:**
```cmd
set CLOUDFLARE_API_TOKEN=your_api_token_here
set CLOUDFLARE_ACCOUNT_ID=your_account_id_here
python download_cloudflare_workers.py
```

**macOS/Linux:**
```bash
export CLOUDFLARE_API_TOKEN="your_api_token_here"
export CLOUDFLARE_ACCOUNT_ID="your_account_id_here"
python download_cloudflare_workers.py
```

#### Option 2: Interactive Mode

Simply run the script and it will prompt you for credentials:

```bash
python download_cloudflare_workers.py
```

### Output

Workers are saved to the parent directory (`../`) as `worker-name.js` files.

### Security Note

⚠️ **Keep your API token secure!** Never commit it to version control or share it publicly.

