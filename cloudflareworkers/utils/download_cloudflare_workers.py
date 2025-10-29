#!/usr/bin/env python3
"""
Cloudflare Workers Download Script

This script connects to your Cloudflare account, retrieves all Workers,
and saves each worker's code to a separate .js file in the cloudflareworkers folder.

The script automatically cleans downloaded worker files by:
- Extracting JavaScript code from multipart form data responses
- Removing boundary markers and other API response artifacts
"""

import os
import re
import requests
import sys
from pathlib import Path


class CloudflareWorkerDownloader:
    def __init__(self, api_token, account_id):
        """
        Initialize the Cloudflare API client.
        
        Args:
            api_token: Your Cloudflare API token
            account_id: Your Cloudflare account ID
        """
        self.api_token = api_token
        self.account_id = account_id
        self.base_url = "https://api.cloudflare.com/client/v4"
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        
    def get_workers(self):
        """
        Retrieve list of all workers in the account.
        
        Returns:
            list: List of worker objects
        """
        url = f"{self.base_url}/accounts/{self.account_id}/workers/scripts"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get("success"):
                return data.get("result", [])
            else:
                print(f"Error: {data.get('errors', 'Unknown error')}")
                return []
        except requests.exceptions.RequestException as e:
            print(f"Failed to retrieve workers: {e}")
            return []
    
    def get_worker_script(self, worker_name):
        """
        Retrieve the script content for a specific worker.
        
        Args:
            worker_name: Name of the worker
            
        Returns:
            str: Worker script content, or None if failed
        """
        url = f"{self.base_url}/accounts/{self.account_id}/workers/scripts/{worker_name}"
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.text
        except requests.exceptions.RequestException as e:
            print(f"Failed to retrieve script for {worker_name}: {e}")
            return None
    
    def clean_worker_code(self, content):
        """
        Clean worker code by removing multipart form data headers and boundary markers.
        
        Args:
            content: Raw worker script content from API
            
        Returns:
            str: Cleaned JavaScript code
        """
        if not content:
            return content
        
        # Step 1: Extract code from multipart form data if present
        # Check if this is a multipart response
        if content.startswith('--') or 'Content-Disposition:' in content[:200]:
            # Find the worker.js section
            # Pattern: Content-Disposition: form-data; name="worker.js"
            # followed by blank lines, then the actual code, ending with boundary
            worker_match = re.search(
                r'Content-Disposition:\s*form-data;\s*name="worker\.js"\s*\n\s*\n(.*?)(?:\n--[a-f0-9]{40,}--|\Z)',
                content,
                re.DOTALL
            )
            
            if worker_match:
                content = worker_match.group(1)
        
        # Step 2: Remove any remaining boundary markers
        # Remove trailing boundary markers
        content = re.sub(r'\s*\n--[a-f0-9]{40,}--\s*$', '', content)
        
        # Remove standalone boundary lines anywhere in the file
        lines = content.split('\n')
        cleaned_lines = [line for line in lines if not re.match(r'^\s*--[a-f0-9]{40,}--\s*$', line)]
        content = '\n'.join(cleaned_lines)
        
        # Remove trailing whitespace
        content = content.rstrip()
        
        return content
    
    def save_workers_to_files(self, output_dir=None):
        """
        Download all workers and save them to files.
        
        Args:
            output_dir: Directory where worker files will be saved (defaults to parent directory)
        """
        # Default to parent directory (since script is in cloudflareworkers/utils/)
        if output_dir is None:
            output_dir = Path(__file__).parent.parent
        
        # Create output directory if it doesn't exist
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        # Get list of all workers
        print("Fetching list of workers...")
        workers = self.get_workers()
        
        if not workers:
            print("No workers found or unable to retrieve workers.")
            return
        
        print(f"Found {len(workers)} worker(s).\n")
        
        # Download and save each worker
        success_count = 0
        for worker in workers:
            worker_id = worker.get("id")
            
            if not worker_id:
                print(f"Skipping worker with no ID: {worker}")
                continue
            
            print(f"Downloading: {worker_id}...")
            script_content = self.get_worker_script(worker_id)
            
            if script_content:
                # Clean the worker code (remove multipart headers and boundaries)
                cleaned_content = self.clean_worker_code(script_content)
                
                # Save to file
                file_path = output_path / f"{worker_id}.js"
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_content)
                print(f"  ✓ Saved to {file_path}")
                success_count += 1
            else:
                print(f"  ✗ Failed to download {worker_id}")
        
        print(f"\n{'='*50}")
        print(f"Download complete!")
        print(f"Successfully saved {success_count}/{len(workers)} workers to {output_path.absolute()}")


def main():
    """Main function to run the script."""
    print("Cloudflare Workers Download Script")
    print("=" * 50)
    
    # Get API credentials from environment variables or prompt user
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    
    if not api_token:
        print("\nCloudflare API Token not found in environment variables.")
        print("Please enter your Cloudflare API Token:")
        print("(You can create one at: https://dash.cloudflare.com/profile/api-tokens)")
        api_token = input("API Token: ").strip()
    
    if not account_id:
        print("\nCloudflare Account ID not found in environment variables.")
        print("Please enter your Cloudflare Account ID:")
        print("(Find it in your Cloudflare dashboard URL or Workers & Pages overview)")
        account_id = input("Account ID: ").strip()
    
    if not api_token or not account_id:
        print("\nError: API Token and Account ID are required.")
        sys.exit(1)
    
    # Create downloader and fetch workers
    downloader = CloudflareWorkerDownloader(api_token, account_id)
    downloader.save_workers_to_files()


if __name__ == "__main__":
    main()

