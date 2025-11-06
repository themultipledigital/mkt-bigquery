import re
from pathlib import Path

MD_PATH = Path("bigquerytables/bigquery_documentation_3tables.md")

content = MD_PATH.read_text(encoding="utf-8")

# 1) Remove Relationships Overview section entirely
content = re.sub(r"^## Relationships Overview[\s\S]*?(?=^## )", "", content, flags=re.MULTILINE)

# 2) Remove any '_No schema available_' lines
content = re.sub(r"^_No schema available_\s*$", "", content, flags=re.MULTILINE)

# 3) Clean malformed dependency bullets in pops_stats_custom section
# Strategy: within the pops_stats_custom block, remove any bullet lines starting with '- `' that are not full qualified table refs
# Also remove stray code-like bullets that came from SQL fragments

def clean_pops_section(text: str) -> str:
    pattern = re.compile(r"^(####\s+pops_stats_custom[\s\S]*?)(^####\s+|\Z)", re.MULTILINE)
    def repl(m):
        section = m.group(1)
        lines = section.splitlines()
        cleaned = []
        in_dependencies = False
        for line in lines:
            if line.strip().startswith("**Dependencies**:"):
                in_dependencies = True
                cleaned.append(line)
                continue
            if in_dependencies:
                # Stop dependencies block when hitting Schema or details or a header
                if line.strip().startswith("**Schema**:") or line.strip().startswith("<details>") or line.startswith("#### "):
                    in_dependencies = False
                    cleaned.append(line)
                    continue
                # Keep only bullets that look like backticked full names project.dataset.table
                if line.strip().startswith("-"):
                    mfull = re.search(r"`[\w-]+\.[\w-]+\.[\w-]+`", line)
                    if mfull:
                        cleaned.append(line)
                    # else drop malformed bullet
                    continue
                # Drop any other junk line inside dependencies
                continue
            cleaned.append(line)
        return "\n".join(cleaned) + ("\n" if not cleaned[-1].endswith("\n") else "")
    return pattern.sub(repl, text)

content = clean_pops_section(content)

MD_PATH.write_text(content, encoding="utf-8")
print("[CLEANUP] Updated", MD_PATH)
