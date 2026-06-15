const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;

function escapeText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function fmt(value) {
  return Number(value).toFixed(2);
}

class SimplePdf {
  constructor(title) {
    this.title = title || "Monthly Report";
    this.pages = [];
    this.addPage();
  }

  addPage() {
    this.pages.push([]);
    this.y = MARGIN;
  }

  current() {
    return this.pages[this.pages.length - 1];
  }

  ensureSpace(height) {
    if (this.y + height > PAGE_HEIGHT - MARGIN) {
      this.addPage();
    }
  }

  raw(command) {
    this.current().push(command);
  }

  text(value, x, y, options = {}) {
    const size = options.size || 10;
    const font = options.bold ? "F2" : "F1";
    this.raw(`BT /${font} ${size} Tf ${fmt(x)} ${fmt(PAGE_HEIGHT - y)} Td (${escapeText(value)}) Tj ET`);
  }

  line(x1, y1, x2, y2) {
    this.raw(`${fmt(x1)} ${fmt(PAGE_HEIGHT - y1)} m ${fmt(x2)} ${fmt(PAGE_HEIGHT - y2)} l S`);
  }

  rect(x, y, width, height, fill = false) {
    this.raw(`${fmt(x)} ${fmt(PAGE_HEIGHT - y - height)} ${fmt(width)} ${fmt(height)} re ${fill ? "f" : "S"}`);
  }

  setStroke(r, g, b) {
    this.raw(`${fmt(r)} ${fmt(g)} ${fmt(b)} RG`);
  }

  setFill(r, g, b) {
    this.raw(`${fmt(r)} ${fmt(g)} ${fmt(b)} rg`);
  }

  heading(value) {
    this.ensureSpace(34);
    this.text(value, MARGIN, this.y, {size: 16, bold: true});
    this.y += 24;
  }

  subheading(value) {
    this.ensureSpace(28);
    this.text(value, MARGIN, this.y, {size: 13, bold: true});
    this.y += 20;
  }

  keyValue(label, value) {
    this.ensureSpace(18);
    this.text(`${label}:`, MARGIN, this.y, {size: 10, bold: true});
    this.text(value, 220, this.y, {size: 10});
    this.y += 16;
  }

  table(headers, rows, columnWidths) {
    const rowHeight = 20;
    this.ensureSpace(rowHeight * (rows.length + 2));
    const x = MARGIN;
    const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

    this.setFill(0.93, 0.95, 0.97);
    this.rect(x, this.y - 13, totalWidth, rowHeight, true);
    this.setFill(0, 0, 0);

    let cx = x;
    headers.forEach((header, index) => {
      this.text(header, cx + 5, this.y, {size: 9, bold: true});
      cx += columnWidths[index];
    });
    this.y += rowHeight;

    rows.forEach((row) => {
      this.ensureSpace(rowHeight + 4);
      cx = x;
      row.forEach((cell, index) => {
        this.text(cell, cx + 5, this.y, {size: 9});
        cx += columnWidths[index];
      });
      this.line(x, this.y + 5, x + totalWidth, this.y + 5);
      this.y += rowHeight;
    });
    this.y += 12;
  }

  lineChart(title, points) {
    this.ensureSpace(210);
    this.text(title, MARGIN, this.y, {size: 11, bold: true});
    this.y += 18;
    const x = MARGIN;
    const y = this.y;
    const width = 500;
    const height = 150;
    this.setStroke(0.15, 0.15, 0.15);
    this.line(x, y + height, x + width, y + height);
    this.line(x, y, x, y + height);

    if (points.length > 0) {
      const values = points.map((point) => Number(point.value) || 0);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const span = max - min || 1;
      const step = points.length > 1 ? width / (points.length - 1) : width;
      const coords = points.map((point, index) => ({
        x: x + (points.length > 1 ? index * step : width / 2),
        y: y + height - (((Number(point.value) || 0) - min) / span) * (height - 20) - 10,
        label: point.label,
        value: Number(point.value) || 0
      }));

      this.setStroke(0.05, 0.44, 0.75);
      this.raw(coords.map((coord, index) => `${fmt(coord.x)} ${fmt(PAGE_HEIGHT - coord.y)} ${index === 0 ? "m" : "l"}`).join(" ") + " S");
      this.setFill(0.05, 0.44, 0.75);
      coords.forEach((coord) => {
        this.rect(coord.x - 2, coord.y - 2, 4, 4, true);
        this.setFill(0, 0, 0);
        this.text(coord.label, coord.x - 18, y + height + 14, {size: 7});
        this.text(formatCurrency(coord.value), coord.x - 24, coord.y - 8, {size: 7});
        this.setFill(0.05, 0.44, 0.75);
      });
      this.setFill(0, 0, 0);
    }

    this.y += height + 34;
  }

  barChart(title, bars) {
    this.ensureSpace(210);
    this.text(title, MARGIN, this.y, {size: 11, bold: true});
    this.y += 18;
    const x = MARGIN;
    const y = this.y;
    const width = 500;
    const height = 150;
    const max = Math.max(...bars.map((bar) => Number(bar.value) || 0), 1);
    const barWidth = bars.length ? Math.min(70, (width / bars.length) - 18) : 40;
    const gap = bars.length ? (width - (barWidth * bars.length)) / (bars.length + 1) : 0;

    this.setStroke(0.15, 0.15, 0.15);
    this.line(x, y + height, x + width, y + height);
    this.line(x, y, x, y + height);
    this.setFill(0.18, 0.55, 0.34);

    bars.forEach((bar, index) => {
      const value = Number(bar.value) || 0;
      const h = (value / max) * (height - 20);
      const bx = x + gap + index * (barWidth + gap);
      const by = y + height - h;
      this.rect(bx, by, barWidth, h, true);
      this.setFill(0, 0, 0);
      this.text(bar.label, bx - 2, y + height + 14, {size: 7});
      this.text(formatCurrency(value), bx - 4, by - 8, {size: 7});
      this.setFill(0.18, 0.55, 0.34);
    });
    this.setFill(0, 0, 0);

    this.y += height + 34;
  }

  build() {
    const objects = [];
    const addObject = (content) => {
      objects.push(content);
      return objects.length;
    };

    const catalogId = addObject("");
    const pagesId = addObject("");
    const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
    const pageIds = [];

    this.pages.forEach((commands) => {
      const stream = commands.join("\n");
      const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
      const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });

    objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

    let output = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(output, "utf8"));
      output += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(output, "utf8");
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i++) {
      output += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    output += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(output, "utf8");
  }
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2})} EUR`;
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

module.exports = {
  SimplePdf,
  formatCurrency,
  formatPercent
};
