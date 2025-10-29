"""
BigQuery Views Exporter

This script connects to a BigQuery project, retrieves all views from specific datasets
(mkt_channels, reports, tradedesk), and exports each view's SQL definition to individual .sql files.
"""

import os
from google.cloud import bigquery
from google.oauth2 import service_account
from typing import List, Dict


# Configuration
CREDENTIALS_PATH = r"C:\Users\SeanGatt\OneDrive - The Multiple Group\Documents\Cursor\mkt-bigquery\bigquerytables\level-hope-462409-a8-ecd41c3d9d7e.json"
PROJECT_ID = "level-hope-462409-a8"
TARGET_DATASETS = ["mkt_channels", "reports", "tradedesk"]
OUTPUT_DIR = "bigqueryviews"


def init_bigquery_client():
    """Initialize and return a BigQuery client."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=["https://www.googleapis.com/auth/bigquery.readonly"]
        )
        client = bigquery.Client(credentials=credentials, project=PROJECT_ID)
        print(f"[OK] Authenticated as: {credentials.service_account_email}")
        print(f"[OK] Project ID: {client.project}")
        return client
    except Exception as e:
        print(f"Error initializing BigQuery client: {e}")
        raise


def get_views_from_dataset(client: bigquery.Client, dataset_id: str) -> List[Dict]:
    """
    Get all views from a specific dataset.
    Returns: list of view dictionaries with name and query
    """
    views = []
    
    try:
        dataset_ref = client.dataset(dataset_id)
        
        for table_ref in client.list_tables(dataset_ref):
            try:
                table = client.get_table(table_ref)
                
                # Only process views
                if table.table_type == 'VIEW':
                    views.append({
                        'name': table.table_id,
                        'full_name': f"{table.project}.{table.dataset_id}.{table.table_id}",
                        'dataset': dataset_id,
                        'query': table.view_query,
                        'description': table.description or '',
                    })
                    
            except Exception as e:
                print(f"  [!] Warning: Could not access table {table_ref.table_id}: {e}")
                continue
                
    except Exception as e:
        print(f"  [X] Error accessing dataset {dataset_id}: {e}")
    
    return views


def create_output_directory():
    """Create the output directory if it doesn't exist."""
    # Get the parent directory (project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    output_path = os.path.join(parent_dir, OUTPUT_DIR)
    
    if not os.path.exists(output_path):
        os.makedirs(output_path)
        print(f"[OK] Created output directory: {output_path}")
    else:
        print(f"[OK] Output directory exists: {output_path}")
    
    return output_path


def save_view_to_file(view: Dict, output_path: str):
    """Save a view's SQL query to a .sql file."""
    # Use just the view name for the filename
    filename = f"{view['name']}.sql"
    filepath = os.path.join(output_path, filename)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            # Add a comment header with metadata
            f.write(f"-- View: {view['full_name']}\n")
            f.write(f"-- Dataset: {view['dataset']}\n")
            if view['description']:
                f.write(f"-- Description: {view['description']}\n")
            f.write(f"--\n\n")
            
            # Write the actual view query
            f.write(view['query'])
        
        print(f"  [OK] Saved: {filename}")
        return True
    except Exception as e:
        print(f"  [X] Error saving {filename}: {e}")
        return False


def main():
    """Main execution function."""
    print(f"\n{'='*60}")
    print(f"BigQuery Views Exporter")
    print(f"{'='*60}\n")
    
    print(f"Connecting to BigQuery project: {PROJECT_ID}...")
    client = init_bigquery_client()
    
    print(f"\nCreating output directory...")
    output_path = create_output_directory()
    
    print(f"\nTarget datasets: {', '.join(TARGET_DATASETS)}\n")
    
    all_views = []
    total_saved = 0
    
    for dataset_id in TARGET_DATASETS:
        print(f"Processing dataset: {dataset_id}...")
        views = get_views_from_dataset(client, dataset_id)
        all_views.extend(views)
        print(f"  Found {len(views)} view(s)\n")
    
    if all_views:
        print(f"Saving {len(all_views)} view(s) to .sql files...")
        for view in all_views:
            if save_view_to_file(view, output_path):
                total_saved += 1
    else:
        print("No views found in the specified datasets.")
    
    print(f"\n{'='*60}")
    print(f"[SUCCESS] Export completed!")
    print(f"{'='*60}")
    print(f"Total views exported: {total_saved}/{len(all_views)}")
    print(f"Output directory: {output_path}\n")


if __name__ == "__main__":
    main()

