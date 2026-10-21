(function () {
  'use strict';

  const palette = {
    orange: '#F58220', charcoal: '#262A2D', gray: '#F0F1F2',
    grid: '#DDE0E2', muted: '#626A70', paper: '#FFFFFF'
  };
  const observed = new Map();
  const grades = [
    { label: 'A+', value: 1, color: palette.orange },
    { label: 'A', value: 13, color: palette.orange },
    { label: 'A−', value: 9, color: palette.orange },
    { label: 'B+', value: 7, color: palette.charcoal },
    { label: 'B', value: 2, color: '#9EA5AA' }
  ];
  const terms = [
    { label: 'Grade 9 · Fall', full: 'Grade 9, Fall 2024', value: 5 },
    { label: 'Grade 9 · Spring', full: 'Grade 9, Spring 2025', value: 5 },
    { label: 'Grade 10 · Fall', full: 'Grade 10, Fall 2025', value: 7 },
    { label: 'Grade 10 · Spring', full: 'Grade 10, Spring 2026', value: 6 }
  ];

  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const text = (x, y, value, cls = '', extra = '') => `<text x="${x}" y="${y}" class="${cls}" ${extra}>${escape(value)}</text>`;
  const line = (x1, y1, x2, y2, cls = 'pc-grid') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}" />`;
  const table = (caption, headers, rows) => `<details class="pc-data"><summary>Explore the data <span aria-hidden="true">+</span></summary><div class="pc-table-wrap"><table><caption>${escape(caption)}</caption><thead><tr>${headers.map(value => `<th scope="col">${escape(value)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((value, i) => `<${i ? 'td' : 'th scope="row"'}>${escape(value)}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div></details>`;
  const svg = (width, height, id, title, description, content) => `<svg class="pc-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(description)}</desc>${content}</svg>`;
  const targetAttributes = label => `tabindex="0" class="pc-target" role="img" aria-label="${escape(label)}" data-value="${escape(label)}"`;
  const widthOf = host => Math.max(280, Math.min(920, Math.round(host.getBoundingClientRect().width || 640)));

  function frame(host, { eyebrow, title, stat, subtitle, graph, caption, data, legend = '' }) {
    host.innerHTML = `<figure class="pc-figure"><div class="pc-head"><div><p class="pc-eyebrow">${escape(eyebrow)}</p><h3 class="pc-title">${escape(title)}</h3></div>${stat ? `<div class="pc-stat">${stat}</div>` : ''}</div><p class="pc-subtitle">${escape(subtitle)}</p>${legend}<div class="pc-plot">${graph}<div class="pc-tooltip" role="tooltip" aria-hidden="true" hidden></div></div><figcaption class="pc-caption">${escape(caption)}</figcaption>${data}</figure>`;
    connectTooltips(host);
  }

  function connectTooltips(host) {
    const plot = host.querySelector('.pc-plot');
    const tooltip = host.querySelector('.pc-tooltip');
    function show(node, event) {
      tooltip.textContent = node.dataset.value;
      tooltip.hidden = false;
      const box = plot.getBoundingClientRect();
      const point = node.getBoundingClientRect();
      const x = event && Number.isFinite(event.clientX) ? event.clientX - box.left : point.left + point.width / 2 - box.left;
      const y = event && Number.isFinite(event.clientY) ? event.clientY - box.top : point.top - box.top;
      const half = tooltip.offsetWidth / 2;
      tooltip.style.left = `${Math.min(box.width - half - 4, Math.max(half + 4, x))}px`;
      tooltip.style.top = `${Math.max(8, y - tooltip.offsetHeight - 12)}px`;
    }
    host.querySelectorAll('.pc-target').forEach(node => {
      node.addEventListener('pointerenter', event => show(node, event));
      node.addEventListener('pointermove', event => show(node, event));
      node.addEventListener('pointerleave', () => { if (document.activeElement !== node) tooltip.hidden = true; });
      node.addEventListener('focus', () => show(node));
      node.addEventListener('blur', () => { tooltip.hidden = true; });
      node.addEventListener('keydown', event => { if (event.key === 'Escape') tooltip.hidden = true; });
    });
  }

  function renderGrades(host) {
    const w = widthOf(host), h = 286;
    const left = 34, right = 10, top = 24, bottom = 48;
    const plotW = w - left - right, plotH = h - top - bottom;
    const max = 16, step = plotW / grades.length;
    const barWidth = Math.min(68, step * .60);
    const y = value => top + plotH - value / max * plotH;
    let drawing = '';
    [0, 4, 8, 12, 16].forEach(value => {
      drawing += line(left, y(value), w - right, y(value));
      drawing += text(left - 10, y(value) + 4, value, 'pc-tick', 'text-anchor="end"');
    });
    grades.forEach((grade, i) => {
      const x = left + step * (i + .5), barY = y(grade.value);
      drawing += `<rect x="${x - barWidth / 2}" y="${barY}" width="${barWidth}" height="${plotH * grade.value / max}" rx="5" fill="${grade.color}" ${targetAttributes(`${grade.label}: ${grade.value} semester grade${grade.value === 1 ? '' : 's'} out of 32`)}><title>${escape(`${grade.label}: ${grade.value} semester grades`)}</title></rect>`;
      drawing += text(x, barY - 10, grade.value, 'pc-value', 'text-anchor="middle"');
      drawing += text(x, top + plotH + 23, grade.label, 'pc-category', 'text-anchor="middle"');
    });
    drawing += text(left, 12, 'Semester grades', 'pc-axis-label');
    frame(host, {
      eyebrow: 'The academic record', title: 'Consistency, in numbers.',
      stat: '<strong>23<span>/32</span></strong><small>A-range grades</small>',
      subtitle: 'Every completed high-school semester, counted once.',
      graph: svg(w, h, 'pc-grades', 'High-school semester grade distribution', 'A plus: 1. A: 13. A minus: 9. B plus: 7. B: 2. Twenty-three of 32 grades are in the A range.', drawing),
      caption: 'Grades 9–10 only · Fall 2024–Spring 2026 · 32 semester grades, including PE. A-range means A+, A, or A−. These are counts, not a GPA calculation.',
      data: table('High-school semester grade distribution', ['Letter grade', 'Semester grades', 'Share of 32'], grades.map(grade => [grade.label, grade.value, `${(grade.value / 32 * 100).toFixed(1)}%`]))
    });
  }

  function renderTerms(host) {
    const w = widthOf(host), h = 286;
    const compact = w < 450;
    const left = compact ? 14 : 137, right = 42, top = 14, rowH = 54;
    const plotW = w - left - right;
    const x = value => left + plotW * value / 8;
    let drawing = '';
    const axisTop = top + 28, axisBottom = top + rowH * 4 - 3;
    [0, 2, 4, 6, 8].forEach(value => {
      drawing += line(x(value), axisTop, x(value), axisBottom);
      drawing += text(x(value), axisBottom + 25, value, 'pc-tick', 'text-anchor="middle"');
    });
    terms.forEach((term, i) => {
      const rowY = top + i * rowH;
      const barY = rowY + 20;
      drawing += text(compact ? left : left - 13, compact ? rowY + 12 : barY + 14, term.label, 'pc-term-label', compact ? '' : 'text-anchor="end"');
      drawing += `<rect x="${left}" y="${barY}" width="${plotW}" height="20" rx="4" fill="${palette.gray}" />`;
      drawing += `<rect x="${left}" y="${barY}" width="${plotW * term.value / 8}" height="20" rx="4" fill="${palette.orange}" ${targetAttributes(`${term.full}: ${term.value} of 8 A-range grades, ${term.value / 8 * 100}%`)}><title>${escape(`${term.full}: ${term.value} of 8 A-range grades`)}</title></rect>`;
      drawing += text(w - 5, barY + 15, `${term.value}/8`, 'pc-value', 'text-anchor="end"');
    });
    drawing += text(left, h - 4, 'A-range semester grades', 'pc-axis-label');
    frame(host, {
      eyebrow: 'Semester by semester', title: 'A view of the progress.',
      subtitle: 'The same eight-course lens across four semesters.',
      graph: svg(w, h, 'pc-terms', 'A-range semester grades over four semesters', 'Grade 9 Fall: 5 of 8. Grade 9 Spring: 5 of 8. Grade 10 Fall: 7 of 8. Grade 10 Spring: 6 of 8.', drawing),
      caption: 'Grades 9–10 only · 32 semester grades total. Each bar counts A+, A, and A− marks out of eight recorded courses. Counts do not represent GPA.',
      data: table('A-range grades by semester', ['Semester', 'A-range grades', 'Recorded grades', 'Share'], terms.map(term => [term.full, term.value, 8, `${term.value / 8 * 100}%`]))
    });
  }

  const renderers = { 'grade-chart': renderGrades, 'term-chart': renderTerms };
  function renderAll() {
    Object.entries(renderers).forEach(([id, render]) => {
      const host = document.getElementById(id);
      if (!host) return;
      render(host);
      if (!observed.has(host) && typeof ResizeObserver !== 'undefined') {
        const state = { width: widthOf(host), scheduled: false };
        const observer = new ResizeObserver(() => {
          const width = widthOf(host);
          if (Math.abs(width - state.width) < 2 || state.scheduled) return;
          state.width = width;
          state.scheduled = true;
          requestAnimationFrame(() => { state.scheduled = false; if (host.isConnected) render(host); });
        });
        observer.observe(host);
        observed.set(host, observer);
      }
    });
  }
  window.PortfolioCharts = Object.freeze({ renderAll });
}());
