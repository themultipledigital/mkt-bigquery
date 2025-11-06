"""
BigQuery Documentation Generator

This script connects to a BigQuery project, discovers all datasets, tables, and views,
analyzes relationships between them, and generates comprehensive markdown documentation.
"""

import re
from google.cloud import bigquery
from google.oauth2 import service_account
from collections import defaultdict
from typing import Dict, List, Set, Tuple
import json


# Configuration
CREDENTIALS_PATH = r"C:\Users\SeanGatt\OneDrive - The Multiple Group\Documents\Cursor\mkt-bigquery\bigquerytables\level-hope-462409-a8-ecd41c3d9d7e.json"
PROJECT_ID = "level-hope-462409-a8"
OUTPUT_FILE = "bigquery_documentation.md"


def init_bigquery_client():
    """Initialize and return a BigQuery client."""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=["https://www.googleapis.com/auth/bigquery.readonly"]
        )
        client = bigquery.Client(credentials=credentials, project=PROJECT_ID)
        print(f"  Authenticated as: {credentials.service_account_email}")
        print(f"  Project ID: {client.project}")
        return client
    except Exception as e:
        print(f"Error initializing BigQuery client: {e}")
        raise


def extract_table_references(sql_query: str, current_project: str) -> Set[Tuple[str, str, str]]:
    """
    Extract table/view references from a SQL query.
    Returns set of tuples: (project, dataset, table)
    """
    if not sql_query:
        return set()
    
    references = set()
    
    # Pattern 1: `project.dataset.table` or `project.dataset.table_name`
    pattern1 = r'`([^`]+)\.([^`]+)\.([^`]+)`'
    matches1 = re.findall(pattern1, sql_query)
    for match in matches1:
        references.add((match[0], match[1], match[2]))
    
    # Pattern 2: project.dataset.table (without backticks)
    pattern2 = r'\b([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\b'
    matches2 = re.findall(pattern2, sql_query)
    for match in matches2:
        # Filter out SQL functions that might match this pattern
        if match[0].upper() not in ['DATE', 'TIME', 'DATETIME', 'TIMESTAMP']:
            references.add((match[0], match[1], match[2]))
    
    # Pattern 3: dataset.table (assume current project)
    pattern3 = r'FROM\s+`?([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)`?'
    matches3 = re.findall(pattern3, sql_query, re.IGNORECASE)
    for match in matches3:
        references.add((current_project, match[0], match[1]))
    
    # Pattern 4: JOIN statements
    pattern4 = r'JOIN\s+`?([a-zA-Z0-9_.-]+)`?'
    matches4 = re.findall(pattern4, sql_query, re.IGNORECASE)
    for match in matches4:
        parts = match.split('.')
        if len(parts) == 3:
            references.add((parts[0], parts[1], parts[2]))
        elif len(parts) == 2:
            references.add((current_project, parts[0], parts[1]))
    
    return references


def get_dataset_info(client: bigquery.Client) -> List[Dict]:
    """Get information about all datasets in the project."""
    datasets = []
    
    try:
        dataset_list = list(client.list_datasets())
        print(f"  Raw dataset list count: {len(dataset_list)}")
        
        # If no datasets found via list_datasets, try accessing known dataset directly
        if len(dataset_list) == 0:
            print("  No datasets found via list_datasets(), trying direct access to known datasets...")
            known_datasets = ['mkt_channels']  # From user's example
            for ds_id in known_datasets:
                try:
                    dataset = client.get_dataset(f"{client.project}.{ds_id}")
                    print(f"  Found dataset via direct access: {ds_id}")
                    datasets.append({
                        'id': dataset.dataset_id,
                        'full_id': dataset.full_dataset_id,
                        'location': dataset.location,
                        'created': dataset.created,
                        'modified': dataset.modified,
                        'description': dataset.description or '',
                    })
                except Exception as e:
                    print(f"  Could not access {ds_id} directly: {e}")
        else:
            for dataset_ref in dataset_list:
                try:
                    dataset = client.get_dataset(dataset_ref.dataset_id)
                    datasets.append({
                        'id': dataset.dataset_id,
                        'full_id': dataset.full_dataset_id,
                        'location': dataset.location,
                        'created': dataset.created,
                        'modified': dataset.modified,
                        'description': dataset.description or '',
                    })
                except Exception as e:
                    print(f"  Warning: Could not access dataset {dataset_ref.dataset_id}: {e}")
    except Exception as e:
        print(f"Error listing datasets: {e}")
        print(f"Make sure the service account has the correct permissions.")
        print(f"Required permissions: bigquery.datasets.get, bigquery.tables.list, bigquery.tables.get")
    
    return datasets


def get_table_info(client: bigquery.Client, dataset_id: str) -> Tuple[List[Dict], List[Dict]]:
    """
    Get information about all tables and views in a dataset.
    Returns: (tables_list, views_list)
    """
    tables = []
    views = []
    
    dataset_ref = client.dataset(dataset_id)
    
    for table_ref in client.list_tables(dataset_ref):
        try:
            table = client.get_table(table_ref)
        except Exception as e:
            print(f"    Warning: Could not access table {table_ref.table_id}: {e}")
            continue
        
        # Build schema information
        schema = []
        for field in table.schema:
            schema.append({
                'name': field.name,
                'type': field.field_type,
                'mode': field.mode,
                'description': field.description or '',
                'fields': [
                    {
                        'name': subfield.name,
                        'type': subfield.field_type,
                        'mode': subfield.mode,
                        'description': subfield.description or ''
                    }
                    for subfield in (field.fields or [])
                ]
            })
        
        table_info = {
            'name': table.table_id,
            'full_name': f"{table.project}.{table.dataset_id}.{table.table_id}",
            'type': table.table_type,
            'created': table.created,
            'modified': table.modified,
            'num_rows': table.num_rows,
            'num_bytes': table.num_bytes,
            'schema': schema,
            'description': table.description or '',
        }
        
        if table.table_type == 'VIEW':
            table_info['view_query'] = table.view_query
            views.append(table_info)
        else:
            tables.append(table_info)
    
    return tables, views


def build_relationship_graph(views: List[Dict], project_id: str) -> Dict[str, List[str]]:
    """
    Build a relationship graph from view dependencies.
    Returns: dict mapping view_full_name -> list of dependent table/view full names
    """
    relationships = {}
    
    for view in views:
        view_full_name = view['full_name']
        dependencies = extract_table_references(view.get('view_query', ''), project_id)
        
        if dependencies:
            relationships[view_full_name] = [
                f"{proj}.{ds}.{tbl}" for proj, ds, tbl in dependencies
            ]
    
    return relationships


def format_bytes(num_bytes: int) -> str:
    """Format bytes into human-readable string."""
    if num_bytes is None:
        return "N/A"
    
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if num_bytes < 1024.0:
            return f"{num_bytes:.2f} {unit}"
        num_bytes /= 1024.0
    return f"{num_bytes:.2f} PB"


def format_schema_table(schema: List[Dict]) -> str:
    """Format schema as a markdown table."""
    if not schema:
        return "_No schema available_\n"
    
    lines = ["| Column Name | Type | Mode | Description |", "|-------------|------|------|-------------|"]
    
    for field in schema:
        name = field['name']
        field_type = field['type']
        mode = field['mode']
        description = field['description'].replace('|', '\\|') if field['description'] else ''
        
        lines.append(f"| {name} | {field_type} | {mode} | {description} |")
        
        # Add nested fields if present (for RECORD types)
        if field.get('fields'):
            for subfield in field['fields']:
                sub_name = f"  ↳ {subfield['name']}"
                sub_type = subfield['type']
                sub_mode = subfield['mode']
                sub_desc = subfield['description'].replace('|', '\\|') if subfield['description'] else ''
                lines.append(f"| {sub_name} | {sub_type} | {sub_mode} | {sub_desc} |")
    
    return '\n'.join(lines) + '\n'


def generate_mermaid_diagram(relationships: Dict[str, List[str]], all_tables: Set[str]) -> str:
    """Generate a Mermaid diagram showing table/view relationships."""
    lines = ["```mermaid", "graph LR"]
    
    # Create node IDs (sanitized for Mermaid)
    node_map = {}
    counter = 0
    
    # Add all entities
    all_entities = set(relationships.keys())
    for deps in relationships.values():
        all_entities.update(deps)
    
    for entity in sorted(all_entities):
        node_id = f"N{counter}"
        node_map[entity] = node_id
        
        # Extract just dataset.table for display
        parts = entity.split('.')
        display_name = f"{parts[1]}.{parts[2]}" if len(parts) == 3 else entity
        
        # Different styling for tables vs views
        if entity in relationships:
            lines.append(f"    {node_id}[{display_name}]:::view")
        else:
            lines.append(f"    {node_id}[{display_name}]:::table")
        
        counter += 1
    
    # Add relationships
    for view, dependencies in relationships.items():
        view_id = node_map.get(view)
        if view_id:
            for dep in dependencies:
                dep_id = node_map.get(dep)
                if dep_id:
                    lines.append(f"    {dep_id} --> {view_id}")
    
    # Add styling
    lines.append("    classDef view fill:#e1f5ff,stroke:#0288d1,stroke-width:2px")
    lines.append("    classDef table fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px")
    lines.append("```")
    
    return '\n'.join(lines)


def generate_markdown(datasets_info: List[Dict], all_tables: Dict, all_views: Dict, 
                      relationships: Dict[str, List[str]]) -> str:
    """Generate the complete markdown documentation."""
    md = []
    
    # Title and overview
    md.append(f"# BigQuery Project Documentation: {PROJECT_ID}\n")
    md.append(f"_Generated automatically from BigQuery metadata_\n")
    
    # Summary statistics
    total_datasets = len(datasets_info)
    total_tables = sum(len(tables) for tables in all_tables.values())
    total_views = sum(len(views) for views in all_views.values())
    
    md.append("## Summary\n")
    md.append(f"- **Total Datasets**: {total_datasets}")
    md.append(f"- **Total Tables**: {total_tables}")
    md.append(f"- **Total Views**: {total_views}")
    md.append(f"- **Total Objects**: {total_tables + total_views}\n")
    
    # Table of contents
    md.append("## Table of Contents\n")
    md.append("- [Summary](#summary)")
    md.append("- [Relationships Overview](#relationships-overview)")
    for dataset in datasets_info:
        dataset_id = dataset['id']
        md.append(f"- [{dataset_id}](#{dataset_id.lower().replace('_', '-')})")
    md.append("")
    
    # Relationships overview with Mermaid diagram
    md.append("## Relationships Overview\n")
    md.append("This diagram shows how views depend on tables and other views:\n")
    
    all_table_names = set()
    for tables in all_tables.values():
        for table in tables:
            all_table_names.add(table['full_name'])
    
    if relationships:
        md.append(generate_mermaid_diagram(relationships, all_table_names))
    else:
        md.append("_No view relationships found._")
    md.append("")
    
    # Dataset details
    for dataset in datasets_info:
        dataset_id = dataset['id']
        tables = all_tables.get(dataset_id, [])
        views = all_views.get(dataset_id, [])
        
        md.append(f"## {dataset_id}\n")
        md.append(f"**Location**: {dataset['location']}")
        md.append(f"**Created**: {dataset['created']}")
        md.append(f"**Modified**: {dataset['modified']}")
        if dataset['description']:
            md.append(f"**Description**: {dataset['description']}")
        md.append(f"\n**Tables**: {len(tables)} | **Views**: {len(views)}\n")
        
        # Tables
        if tables:
            md.append(f"### Tables in {dataset_id}\n")
            for table in sorted(tables, key=lambda x: x['name']):
                md.append(f"#### {table['name']}\n")
                md.append(f"**Full Name**: `{table['full_name']}`")
                md.append(f"**Rows**: {table['num_rows']:,}" if table['num_rows'] is not None else "**Rows**: N/A")
                md.append(f"**Size**: {format_bytes(table['num_bytes'])}")
                md.append(f"**Created**: {table['created']}")
                md.append(f"**Modified**: {table['modified']}")
                if table['description']:
                    md.append(f"**Description**: {table['description']}")
                md.append("\n**Schema**:\n")
                md.append(format_schema_table(table['schema']))
                md.append("---\n")
        
        # Views
        if views:
            md.append(f"### Views in {dataset_id}\n")
            for view in sorted(views, key=lambda x: x['name']):
                md.append(f"#### {view['name']}\n")
                md.append(f"**Full Name**: `{view['full_name']}`")
                md.append(f"**Created**: {view['created']}")
                md.append(f"**Modified**: {view['modified']}")
                if view['description']:
                    md.append(f"**Description**: {view['description']}")
                
                # Dependencies
                if view['full_name'] in relationships:
                    deps = relationships[view['full_name']]
                    md.append(f"\n**Dependencies**: This view depends on {len(deps)} object(s):")
                    for dep in sorted(deps):
                        md.append(f"- `{dep}`")
                
                md.append("\n**Schema**:\n")
                md.append(format_schema_table(view['schema']))
                
                md.append("\n<details>")
                md.append("<summary><b>View SQL Query</b> (click to expand)</summary>\n")
                md.append("```sql")
                md.append(view.get('view_query', 'N/A'))
                md.append("```")
                md.append("</details>\n")
                md.append("---\n")
    
    return '\n'.join(md)


def main():
    """Main execution function."""
    print(f"Connecting to BigQuery project: {PROJECT_ID}...")
    client = init_bigquery_client()
    
    print("Discovering datasets...")
    all_datasets = get_dataset_info(client)
    
    # Filter out analytics datasets
    datasets_info = [ds for ds in all_datasets if not ds['id'].startswith('analytics_')]
    skipped_count = len(all_datasets) - len(datasets_info)
    
    print(f"Found {len(all_datasets)} dataset(s), using {len(datasets_info)} (skipped {skipped_count} analytics datasets)")
    
    all_tables = {}
    all_views = {}
    all_views_list = []
    
    for dataset in datasets_info:
        dataset_id = dataset['id']
        print(f"  Processing dataset: {dataset_id}...")
        
        tables, views = get_table_info(client, dataset_id)
        all_tables[dataset_id] = tables
        all_views[dataset_id] = views
        all_views_list.extend(views)
        
        print(f"    Found {len(tables)} table(s) and {len(views)} view(s)")
    
    print("\nAnalyzing relationships...")
    relationships = build_relationship_graph(all_views_list, PROJECT_ID)
    print(f"Found {len(relationships)} view dependencies")
    
    print(f"\nGenerating markdown documentation...")
    markdown_content = generate_markdown(datasets_info, all_tables, all_views, relationships)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    
    print(f"\n[SUCCESS] Documentation generated successfully: {OUTPUT_FILE}")
    print(f"  Total datasets: {len(datasets_info)}")
    print(f"  Total tables: {sum(len(t) for t in all_tables.values())}")
    print(f"  Total views: {sum(len(v) for v in all_views.values())}")


if __name__ == "__main__":
    main()

