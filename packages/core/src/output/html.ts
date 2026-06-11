import type { SemanticChange } from '../types/index.js';

export function formatHtml(changes: SemanticChange[]): string {
  const breaking = changes.filter(c => c.severity === 'breaking');
  const warning = changes.filter(c => c.severity === 'warning');
  const info = changes.filter(c => c.severity === 'info');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Semantic API Diff Report</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
  }
  h1 {
    color: #222;
    border-bottom: 2px solid #eaeaea;
    padding-bottom: 0.5rem;
  }
  .summary {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
  }
  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    flex: 1;
    text-align: center;
    border-top: 4px solid #ccc;
  }
  .stat-card.breaking { border-top-color: #e53e3e; }
  .stat-card.warning { border-top-color: #d69e2e; }
  .stat-card.info { border-top-color: #3182ce; }
  .stat-card .value {
    font-size: 2rem;
    font-weight: bold;
    margin: 0.5rem 0;
  }
  .stat-card .label {
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.05em;
    color: #666;
  }
  .change-list {
    list-style: none;
    padding: 0;
  }
  .change-item {
    background: white;
    margin-bottom: 1rem;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  .change-header {
    padding: 1rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-left: 4px solid #ccc;
  }
  .change-item.breaking .change-header { border-left-color: #e53e3e; }
  .change-item.warning .change-header { border-left-color: #d69e2e; }
  .change-item.info .change-header { border-left-color: #3182ce; }
  
  .change-title {
    font-weight: 600;
  }
  .change-body {
    padding: 1rem;
    border-top: 1px solid #eaeaea;
    background: #fafafa;
    display: none;
  }
  .open .change-body {
    display: block;
  }
  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: bold;
    background: #eee;
  }
  .badge.breaking { background: #fee2e2; color: #991b1b; }
  .badge.warning { background: #fef3c7; color: #92400e; }
  .badge.info { background: #dbeafe; color: #1e40af; }
  
  .detail-row {
    margin-bottom: 0.5rem;
  }
  .detail-label {
    font-weight: 600;
    color: #555;
    width: 100px;
    display: inline-block;
  }
  code {
    background: #edf2f7;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.9em;
  }
</style>
<script>
  function toggleChange(el) {
    el.parentElement.classList.toggle('open');
  }
</script>
</head>
<body>

<h1>API Diff Report</h1>

<div class="summary">
  <div class="stat-card breaking">
    <div class="label">Breaking</div>
    <div class="value">${breaking.length}</div>
  </div>
  <div class="stat-card warning">
    <div class="label">Warnings</div>
    <div class="value">${warning.length}</div>
  </div>
  <div class="stat-card info">
    <div class="label">Info</div>
    <div class="value">${info.length}</div>
  </div>
</div>

<h2>All Changes</h2>
<ul class="change-list">
  ${changes.map(renderChange).join('\n')}
</ul>

</body>
</html>
  `.trim();
}

function renderChange(c: SemanticChange): string {
  let locStr = `<code>${c.location.method} ${c.location.path}</code>`;
  if (c.location.paramName) locStr += ` (param: <code>${c.location.paramName}</code>)`;
  if (c.location.field) locStr += ` (field: <code>${c.location.field}</code>)`;

  return `
  <li class="change-item ${c.severity}">
    <div class="change-header" onclick="toggleChange(this)">
      <div class="change-title">${c.message}</div>
      <span class="badge ${c.severity}">${c.severity}</span>
    </div>
    <div class="change-body">
      <div class="detail-row"><span class="detail-label">Location:</span> ${locStr}</div>
      <div class="detail-row"><span class="detail-label">Category:</span> ${c.category}</div>
      <div class="detail-row"><span class="detail-label">Rule:</span> <code>${c.ruleId}</code></div>
      ${c.consequence ? `<div class="detail-row"><span class="detail-label">Impact:</span> ${c.consequence}</div>` : ''}
      ${c.migration ? `<div class="detail-row"><span class="detail-label">Migration:</span> ${c.migration}</div>` : ''}
    </div>
  </li>
  `;
}
