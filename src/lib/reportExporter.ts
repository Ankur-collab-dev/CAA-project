import { ReportRecord } from '../types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateHtmlReport(report: ReportRecord): string {
  const sourcesTableRows = report.sources.length
    ? report.sources
        .map(
          (src) =>
            `<tr><td>${escapeHtml(src.title)}</td><td class="num">${src.percent.toFixed(1)}%</td></tr>`
        )
        .join('')
    : '<tr><td colspan="2">No matching passages were found.</td></tr>';

  const sentencesHtml = report.sentences
    .map((s) => {
      const text = escapeHtml(s.text);
      return s.matched
        ? `<mark${s.source ? ` title="Matches: ${escapeHtml(s.source.title)}"` : ''}>${text}</mark>`
        : `<span>${text}</span>`;
    })
    .join(' ');

  const matchedItemsList = report.sentences
    .filter((s) => s.matched)
    .map(
      (s) => `<li>
        <p class="quote">&ldquo;${escapeHtml(s.text)}&rdquo;</p>
        <p class="meta">Similarity ${s.similarity.toFixed(0)}%${s.source ? ` &middot; Source: ${escapeHtml(s.source.title)}` : ''}</p>
        ${s.source ? `<p class="excerpt">Matched text: ${escapeHtml(s.source.excerpt)}</p>` : ''}
      </li>`
    )
    .join('');

  const dateStr = new Date(report.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Plagiarism Report - ${escapeHtml(report.title)}</title>
<style>
  body { margin: 0; font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #0f172a; background: #f8fafc; line-height: 1.5; }
  .page { max-width: 880px; margin: 0 auto; padding: 48px 24px; }
  header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 32px; }
  .brand { color: #2563eb; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 12px; }
  h1 { font-size: 28px; margin: 8px 0 4px; line-height: 1.2; }
  .muted { color: #475569; font-size: 14px; }
  .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
  .card { background: #ffffff; border: 1px solid #dbeafe; border-radius: 12px; padding: 20px; }
  .card .label { font-size: 12px; text-transform: uppercase; color: #475569; letter-spacing: 0.06em; }
  .card .value { font-size: 28px; font-weight: 700; color: #1d4ed8; margin-top: 4px; }
  h2 { font-size: 18px; color: #1e3a8a; margin: 32px 0 12px; }
  table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; }
  th, td { text-align: left; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  th { background: #eff6ff; color: #1e3a8a; }
  td.num { text-align: right; font-weight: 600; color: #1d4ed8; }
  .document { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; font-size: 15px; line-height: 1.8; color: #334155; }
  mark { background: #fef3c7; color: #0f172a; padding: 2px 4px; border-radius: 4px; box-shadow: inset 0 -2px 0 0 #f59e0b; }
  ul.matches { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
  ul.matches li { background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; }
  .quote { font-style: italic; color: #0f172a; margin: 0 0 8px; font-size: 15px; }
  .meta { color: #1d4ed8; font-size: 12px; font-weight: 600; margin: 0; }
  .excerpt { color: #64748b; font-size: 13px; margin: 6px 0 0; }
  footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>
<div class="page">
  <header>
    <div class="brand">OriginCheck Plagiarism Report</div>
    <h1>${escapeHtml(report.title)}</h1>
    <div class="muted">Checked on ${dateStr} &middot; Compared against ${escapeHtml(report.reference_label)}</div>
  </header>
  
  <div class="summary">
    <div class="card">
      <div class="label">Similarity Score</div>
      <div class="value">${report.similarity.toFixed(1)}%</div>
    </div>
    <div class="card">
      <div class="label">Total Words</div>
      <div class="value">${report.word_count.toLocaleString('en-US')}</div>
    </div>
    <div class="card">
      <div class="label">Matching Sources</div>
      <div class="value">${report.sources.length}</div>
    </div>
  </div>

  <h2>Source Breakdown</h2>
  <table>
    <thead>
      <tr><th>Reference Source</th><th style="text-align: right;">Overlap</th></tr>
    </thead>
    <tbody>
      ${sourcesTableRows}
    </tbody>
  </table>

  <h2>Document with Highlighted Matches</h2>
  <div class="document">
    ${sentencesHtml}
  </div>

  <h2>Matched Passages Detail</h2>
  <ul class="matches">
    ${matchedItemsList || '<li style="border-left-color: #94a3b8;"><p class="quote">No matched passages.</p></li>'}
  </ul>

  <footer>Generated by OriginCheck. Similarity scores indicate textual overlap and should be reviewed by a person.</footer>
</div>
</body>
</html>`;
}

export function downloadHtmlReport(report: ReportRecord): void {
  const html = generateHtmlReport(report);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = report.title
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  a.href = url;
  a.download = `plagiarism-report-${safeTitle || report.id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

