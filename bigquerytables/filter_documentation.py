"""
Filter BigQuery Documentation

This script filters the full BigQuery documentation to include only specified tables/views.
"""

import re
from typing import List, Dict, Set

# Configuration
INPUT_FILE = "bigquerytables/bigquery_documentation.md"
OUTPUT_FILE = "bigquerytables/bigquery_documentation_3tables.md"

# Target tables/views to keep (format: "dataset.table_name")
TARGET_TABLES = {
    "mkt_channels.tradedesk_stats_custom",
    "mkt_channels.pops_stats_custom",
    "mkt_channels.meta_stats_custom",
}


def extract_table_sections(content: str) -> Dict[str, Dict]:
    """
    Extract individual table/view sections from the markdown content.
    Returns a dict mapping "dataset.table" -> section info
    """
    sections = {}
    lines = content.split('\n')
    
    current_dataset = None
    current_table = None
    current_section = []
    in_table_section = False
    section_start_idx = 0
    
    for i, line in enumerate(lines):
        # Detect dataset headers (## dataset_name)
        dataset_match = re.match(r'^## ([a-zA-Z0-9_]+)\s*$', line)
        if dataset_match:
            # Save previous table section if exists
            if current_dataset and current_table and in_table_section:
                key = f"{current_dataset}.{current_table}"
                sections[key] = {
                    'dataset': current_dataset,
                    'table': current_table,
                    'content': '\n'.join(current_section),
                    'start_line': section_start_idx
                }
            
            current_dataset = dataset_match.group(1)
            current_table = None
            current_section = []
            in_table_section = False
            continue
        
        # Detect table/view headers (#### table_name)
        table_match = re.match(r'^#### ([a-zA-Z0-9_-]+)\s*$', line)
        if table_match and current_dataset:
            # Save previous table section if exists
            if current_table and in_table_section:
                key = f"{current_dataset}.{current_table}"
                sections[key] = {
                    'dataset': current_dataset,
                    'table': current_table,
                    'content': '\n'.join(current_section),
                    'start_line': section_start_idx
                }
            
            current_table = table_match.group(1)
            current_section = [line]
            in_table_section = True
            section_start_idx = i
            continue
        
        # Accumulate lines for current table section
        if in_table_section:
            # Check if we hit a separator or next table
            if line.strip() == '---' or re.match(r'^####\s', line):
                current_section.append(line)
                # End of current table section
                if current_dataset and current_table:
                    key = f"{current_dataset}.{current_table}"
                    sections[key] = {
                        'dataset': current_dataset,
                        'table': current_table,
                        'content': '\n'.join(current_section),
                        'start_line': section_start_idx
                    }
                    in_table_section = False
                    current_section = []
            else:
                current_section.append(line)
    
    # Save last section if exists
    if current_dataset and current_table and in_table_section:
        key = f"{current_dataset}.{current_table}"
        sections[key] = {
            'dataset': current_dataset,
            'table': current_table,
            'content': '\n'.join(current_section),
            'start_line': section_start_idx
        }
    
    return sections


def extract_dataset_headers(content: str, datasets: Set[str]) -> Dict[str, str]:
    """
    Extract dataset header sections for the datasets we need.
    Returns dict mapping dataset -> header content
    """
    headers = {}
    lines = content.split('\n')
    
    current_dataset = None
    current_header = []
    capturing = False
    
    for line in lines:
        # Detect dataset headers (## dataset_name)
        dataset_match = re.match(r'^## ([a-zA-Z0-9_]+)\s*$', line)
        if dataset_match:
            # Save previous header if it was one we wanted
            if current_dataset and capturing and current_dataset in datasets:
                headers[current_dataset] = '\n'.join(current_header)
            
            current_dataset = dataset_match.group(1)
            capturing = current_dataset in datasets
            current_header = [line] if capturing else []
            continue
        
        # Stop capturing at next section marker or table marker
        if capturing:
            if re.match(r'^###\s+Tables in', line) or re.match(r'^###\s+Views in', line):
                if current_dataset in datasets:
                    headers[current_dataset] = '\n'.join(current_header)
                capturing = False
                current_header = []
            else:
                current_header.append(line)
    
    return headers


def filter_mermaid_diagram(content: str, target_tables: Set[str]) -> str:
    """
    Filter the Mermaid diagram to show only relationships involving target tables.
    """
    lines = content.split('\n')
    in_mermaid = False
    mermaid_lines = []
    
    # Extract mermaid section
    for line in lines:
        if '```mermaid' in line:
            in_mermaid = True
            continue
        elif in_mermaid and '```' in line:
            break
        elif in_mermaid:
            mermaid_lines.append(line)
    
    if not mermaid_lines:
        return ""
    
    # Parse nodes and relationships
    nodes = {}
    relationships = []
    
    for line in mermaid_lines:
        line = line.strip()
        if line.startswith('N') and '[' in line and ']' in line:
            # Node definition
            node_id = line.split('[')[0]
            node_label = line.split('[')[1].split(']')[0]
            nodes[node_id] = node_label
        elif '-->' in line:
            # Relationship
            relationships.append(line)
    
    # Filter to only include target tables
    relevant_nodes = {}
    for node_id, label in nodes.items():
        # Check if this node is one of our targets
        for target in target_tables:
            dataset, table = target.split('.')
            if f"{dataset}.{table}" in label or label == table:
                relevant_nodes[node_id] = label
    
    # Filter relationships to only those involving relevant nodes
    relevant_relationships = []
    for rel in relationships:
        parts = rel.strip().split()
        if len(parts) >= 3:
            source = parts[0]
            target = parts[2]
            if source in relevant_nodes or target in relevant_nodes:
                relevant_relationships.append(rel)
    
    if not relevant_nodes:
        return "_No relationships found for the specified tables._"
    
    # Build filtered mermaid
    result = ["```mermaid", "graph LR"]
    for node_id, label in sorted(relevant_nodes.items()):
        style = ":::view" if "view" in label.lower() else ":::table"
        result.append(f"    {node_id}[{label}]{style}")
    
    for rel in relevant_relationships:
        result.append(f"    {rel}")
    
    result.append("    classDef view fill:#e1f5ff,stroke:#0288d1,stroke-width:2px")
    result.append("    classDef table fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px")
    result.append("```")
    
    return '\n'.join(result)


def generate_filtered_documentation(content: str, target_tables: Set[str]) -> str:
    """
    Generate filtered documentation containing only target tables.
    """
    # Extract all table sections
    all_sections = extract_table_sections(content)
    
    # Get datasets we need
    needed_datasets = set()
    for target in target_tables:
        dataset = target.split('.')[0]
        needed_datasets.add(dataset)
    
    # Extract dataset headers
    dataset_headers = extract_dataset_headers(content, needed_datasets)
    
    # Build filtered documentation
    output = []
    
    # Header
    output.append("# BigQuery Project Documentation: level-hope-462409-a8 (Filtered)")
    output.append("")
    output.append("_Generated automatically from BigQuery metadata - Filtered for specific tables_")
    output.append("")
    
    # Summary
    table_count = sum(1 for t in target_tables if t in all_sections and 'View' not in all_sections.get(t, {}).get('content', ''))
    view_count = sum(1 for t in target_tables if t in all_sections and 'View' in all_sections.get(t, {}).get('content', ''))
    
    output.append("## Summary")
    output.append("")
    output.append(f"- **Total Datasets**: {len(needed_datasets)}")
    output.append(f"- **Total Tables**: {table_count}")
    output.append(f"- **Total Views**: {view_count}")
    output.append(f"- **Total Objects**: {len(target_tables)}")
    output.append("")
    
    # Table of contents
    output.append("## Table of Contents")
    output.append("")
    output.append("- [Summary](#summary)")
    output.append("- [Relationships Overview](#relationships-overview)")
    for dataset in sorted(needed_datasets):
        output.append(f"- [{dataset}](#{dataset.lower().replace('_', '-')})")
    output.append("")
    
    # Relationships
    output.append("## Relationships Overview")
    output.append("")
    output.append("This diagram shows how views depend on tables and other views:")
    output.append("")
    mermaid = filter_mermaid_diagram(content, target_tables)
    output.append(mermaid)
    output.append("")
    
    # Dataset sections
    for dataset in sorted(needed_datasets):
        # Dataset header
        if dataset in dataset_headers:
            output.append(dataset_headers[dataset])
            output.append("")
        else:
            output.append(f"## {dataset}")
            output.append("")
        
        # Separate tables and views
        dataset_tables = []
        dataset_views = []
        
        for target in target_tables:
            if target.startswith(f"{dataset}."):
                if target in all_sections:
                    section = all_sections[target]
                    if 'View SQL Query' in section['content']:
                        dataset_views.append(section)
                    else:
                        dataset_tables.append(section)
        
        # Tables section
        if dataset_tables:
            output.append(f"### Tables in {dataset}")
            output.append("")
            for section in sorted(dataset_tables, key=lambda x: x['table']):
                output.append(section['content'])
                output.append("")
        
        # Views section
        if dataset_views:
            output.append(f"### Views in {dataset}")
            output.append("")
            for section in sorted(dataset_views, key=lambda x: x['table']):
                output.append(section['content'])
                output.append("")
    
    return '\n'.join(output)


def main():
    """Main execution function."""
    print(f"Reading {INPUT_FILE}...")
    
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"Filtering documentation for {len(TARGET_TABLES)} tables/views:")
    for table in sorted(TARGET_TABLES):
        print(f"  - {table}")
    
    filtered_content = generate_filtered_documentation(content, TARGET_TABLES)
    
    print(f"\nWriting filtered documentation to {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(filtered_content)
    
    print(f"\n[SUCCESS] Filtered documentation created: {OUTPUT_FILE}")
    
    # Count lines for comparison
    original_lines = len(content.split('\n'))
    filtered_lines = len(filtered_content.split('\n'))
    print(f"  Original: {original_lines:,} lines")
    print(f"  Filtered: {filtered_lines:,} lines")
    print(f"  Reduction: {((original_lines - filtered_lines) / original_lines * 100):.1f}%")


if __name__ == "__main__":
    main()

