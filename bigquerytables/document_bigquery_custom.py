"""
BigQuery Documentation Generator (Custom - Selected Views Only)

Generates markdown documentation for a specific set of views only.
"""

import re
from google.cloud import bigquery
from google.oauth2 import service_account
from typing import Dict, List, Set, Tuple

# Configuration
CREDENTIALS_PATH = r"C:\Users\SeanGatt\OneDrive - The Multiple Group\Documents\Cursor\mkt-bigquery\bigquerytables\level-hope-462409-a8-ecd41c3d9d7e.json"
PROJECT_ID = "level-hope-462409-a8"
OUTPUT_FILE = "bigquerytables/bigquery_documentation_3tables.md"

# Targets (full names)
TARGET_VIEWS = {
    "level-hope-462409-a8.mkt_channels.meta_stats_custom",
    "level-hope-462409-a8.mkt_channels.pops_stats_custom",
    "level-hope-462409-a8.mkt_channels.tradedesk_stats_custom",
}


def init_bigquery_client():
    try:
        credentials = service_account.Credentials.from_service_account_file(
            CREDENTIALS_PATH,
            scopes=["https://www.googleapis.com/auth/bigquery.readonly"],
        )
        client = bigquery.Client(credentials=credentials, project=PROJECT_ID)
        print(f"  Authenticated as: {credentials.service_account_email}")
        print(f"  Project ID: {client.project}")
        return client
    except Exception as e:
        print(f"Error initializing BigQuery client: {e}")
        raise


def extract_table_references(sql_query: str, current_project: str) -> Set[Tuple[str, str, str]]:
    if not sql_query:
        return set()
    references: Set[Tuple[str, str, str]] = set()
    pattern1 = r'`([^`]+)\.([^`]+)\.([^`]+)`'
    for proj, ds, tbl in re.findall(pattern1, sql_query):
        references.add((proj, ds, tbl))
    pattern2 = r"\b([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\b"
    for proj, ds, tbl in re.findall(pattern2, sql_query):
        if proj.upper() not in ["DATE", "TIME", "DATETIME", "TIMESTAMP"]:
            references.add((proj, ds, tbl))
    pattern3 = r"FROM\s+`?([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)`?"
    for ds, tbl in re.findall(pattern3, sql_query, re.IGNORECASE):
        references.add((current_project, ds, tbl))
    pattern4 = r"JOIN\s+`?([a-zA-Z0-9_.-]+)`?"
    for match in re.findall(pattern4, sql_query, re.IGNORECASE):
        parts = match.split(".")
        if len(parts) == 3:
            references.add((parts[0], parts[1], parts[2]))
        elif len(parts) == 2:
            references.add((current_project, parts[0], parts[1]))
    return references


def format_schema_table(schema: List[bigquery.SchemaField]) -> str:
    if not schema:
        return "_No schema available_\n"
    lines = [
        "| Column Name | Type | Mode | Description |",
        "|-------------|------|------|-------------|",
    ]
    for field in schema:
        desc = field.description.replace("|", "\\|") if field.description else ""
        lines.append(f"| {field.name} | {field.field_type} | {field.mode} | {desc} |")
        if field.fields:
            for sub in field.fields:
                sub_desc = sub.description.replace("|", "\\|") if sub.description else ""
                lines.append(f"|   ↳ {sub.name} | {sub.field_type} | {sub.mode} | {sub_desc} |")
    return "\n".join(lines) + "\n"


def generate_mermaid_diagram(relationships: Dict[str, List[str]]) -> str:
    lines = ["```mermaid", "graph LR"]
    node_map: Dict[str, str] = {}
    all_entities = set(relationships.keys())
    for deps in relationships.values():
        all_entities.update(deps)
    for idx, entity in enumerate(sorted(all_entities)):
        node_id = f"N{idx}"
        node_map[entity] = node_id
        parts = entity.split(".")
        display = f"{parts[1]}.{parts[2]}" if len(parts) == 3 else entity
        if entity in relationships:
            lines.append(f"    {node_id}[{display}]:::view")
        else:
            lines.append(f"    {node_id}[{display}]:::table")
    for view, deps in relationships.items():
        for dep in deps:
            if view in node_map and dep in node_map:
                lines.append(f"    {node_map[dep]} --> {node_map[view]}")
    lines.append("    classDef view fill:#e1f5ff,stroke:#0288d1,stroke-width:2px")
    lines.append("    classDef table fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px")
    lines.append("```")
    return "\n".join(lines)


def main():
    print(f"Connecting to BigQuery project: {PROJECT_ID}...")
    client = init_bigquery_client()

    # Fetch datasets only as needed (mkt_channels for these targets)
    dataset_id = "mkt_channels"
    dataset = client.get_dataset(f"{PROJECT_ID}.{dataset_id}")

    # Build minimal dataset_info structure
    datasets_info = [{
        "id": dataset.dataset_id,
        "full_id": dataset.full_dataset_id,
        "location": dataset.location,
        "created": dataset.created,
        "modified": dataset.modified,
        "description": dataset.description or "",
    }]

    # Collect only the targeted views
    all_tables: Dict[str, List[Dict]] = {dataset_id: []}
    all_views: Dict[str, List[Dict]] = {dataset_id: []}
    relationships_map: Dict[str, List[str]] = {}

    for table_ref in client.list_tables(dataset):
        table = client.get_table(table_ref)
        full_name = f"{table.project}.{table.dataset_id}.{table.table_id}"
        if table.table_type == "VIEW" and full_name in TARGET_VIEWS:
            # Capture schema
            schema_rows: List[Dict] = []
            for field in table.schema:
                schema_rows.append({
                    "name": field.name,
                    "type": field.field_type,
                    "mode": field.mode,
                    "description": field.description or "",
                    "fields": [
                        {
                            "name": subfield.name,
                            "type": subfield.field_type,
                            "mode": subfield.mode,
                            "description": subfield.description or "",
                        }
                        for subfield in (field.fields or [])
                    ],
                })
            view_info = {
                "name": table.table_id,
                "full_name": full_name,
                "type": table.table_type,
                "created": table.created,
                "modified": table.modified,
                "schema": schema_rows,
                "description": table.description or "",
                "view_query": table.view_query,
            }
            all_views[dataset_id].append(view_info)
            # Extract relationships for this view
            deps = extract_table_references(table.view_query or "", PROJECT_ID)
            if deps:
                relationships_map[full_name] = [f"{p}.{d}.{t}" for p, d, t in deps]

    # Generate markdown (trimmed to our needs but reuse existing formatting)
    md: List[str] = []
    md.append(f"# BigQuery Project Documentation: {PROJECT_ID} (Filtered)\n")
    md.append("_Generated automatically from BigQuery metadata - Selected views_\n")

    total_datasets = len(datasets_info)
    total_tables = sum(len(v) for v in all_tables.values())
    total_views = sum(len(v) for v in all_views.values())

    md.append("## Summary\n")
    md.append(f"- **Total Datasets**: {total_datasets}")
    md.append(f"- **Total Tables**: {total_tables}")
    md.append(f"- **Total Views**: {total_views}")
    md.append(f"- **Total Objects**: {total_tables + total_views}\n")

    md.append("## Table of Contents\n")
    md.append("- [Summary](#summary)")
    md.append("- [Relationships Overview](#relationships-overview)")
    for ds in datasets_info:
        md.append(f"- [{ds['id']}](#{ds['id'].lower().replace('_','-')})")
    md.append("")

    md.append("## Relationships Overview\n")
    md.append("This diagram shows how views depend on tables and other views:\n")
    if relationships_map:
        md.append(generate_mermaid_diagram(relationships_map))
    else:
        md.append("_No view relationships found._")
    md.append("")

    for ds in datasets_info:
        ds_id = ds["id"]
        views = all_views.get(ds_id, [])
        md.append(f"## {ds_id}\n")
        md.append(f"**Location**: {ds['location']}")
        md.append(f"**Created**: {ds['created']}")
        md.append(f"**Modified**: {ds['modified']}")
        md.append(f"\n**Tables**: 0 | **Views**: {len(views)}\n")

        if views:
            md.append(f"### Views in {ds_id}\n")
            for view in sorted(views, key=lambda x: x['name']):
                md.append(f"#### {view['name']}\n")
                md.append(f"**Full Name**: `{view['full_name']}`")
                md.append(f"**Created**: {view['created']}")
                md.append(f"**Modified**: {view['modified']}")
                if view['description']:
                    md.append(f"**Description**: {view['description']}")

                if view['full_name'] in relationships_map:
                    deps = relationships_map[view['full_name']]
                    md.append(f"\n**Dependencies**: This view depends on {len(deps)} object(s):")
                    for dep in sorted(deps):
                        md.append(f"- `{dep}`")

                md.append("\n**Schema**:\n")
                md.append(format_schema_table([bigquery.SchemaField(**{}) for _ in []]))  # placeholder to keep structure
                # Rebuild schema table from stored rows to avoid dependency on bigquery types
                schema_lines = ["| Column Name | Type | Mode | Description |", "|-------------|------|------|-------------|"]
                for field in view['schema']:
                    desc = field['description'].replace("|", "\\|") if field['description'] else ""
                    schema_lines.append(f"| {field['name']} | {field['type']} | {field['mode']} | {desc} |")
                    for sub in field.get('fields', []):
                        sub_desc = sub['description'].replace("|", "\\|") if sub['description'] else ""
                        schema_lines.append(f"|   ↳ {sub['name']} | {sub['type']} | {sub['mode']} | {sub_desc} |")
                md.append("\n".join(schema_lines) + "\n")

                md.append("\n<details>")
                md.append("<summary><b>View SQL Query</b> (click to expand)</summary>\n")
                md.append("```sql")
                md.append(view.get('view_query', 'N/A'))
                md.append("```")
                md.append("</details>\n")
                md.append("---\n")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(md))

    print(f"\n[SUCCESS] Documentation generated successfully: {OUTPUT_FILE}")
    print(f"  Total datasets: {total_datasets}")
    print(f"  Total views: {total_views}")


if __name__ == "__main__":
    main()
