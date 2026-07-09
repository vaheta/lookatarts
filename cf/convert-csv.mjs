// Convert the psql \copy CSV exports into SQLite INSERT statements for D1.
// Usage: node cf/convert-csv.mjs <export-dir> cf/data.sql
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const [, , exportDir, outFile] = process.argv;

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') rows.push(row);
  }
  return rows;
}

function sqlLit(v) {
  if (v === '') return 'NULL'; // psql csv renders NULL as empty (no quotes)
  if (/^-?\d+(\.\d+)?$/.test(v)) return v;
  return `'${v.replace(/'/g, "''")}'`;
}

const tables = ['images', 'events', 'counter'];
const out = [];

for (const t of tables) {
  const csv = readFileSync(join(exportDir, `lookatarts_${t}.csv`), 'utf8');
  const rows = parseCSV(csv);
  const header = rows.shift();
  const colList = header.map((c) => `"${c}"`).join(', ');
  for (let i = 0; i < rows.length; i += 20) {
    const chunk = rows.slice(i, i + 20);
    const values = chunk.map((r) => '(' + r.map(sqlLit).join(', ') + ')').join(',\n');
    out.push(`INSERT INTO ${t} (${colList}) VALUES\n${values};`);
  }
  console.log(t, rows.length, 'rows');
}

writeFileSync(outFile, out.join('\n') + '\n');
console.log('Wrote', outFile);
