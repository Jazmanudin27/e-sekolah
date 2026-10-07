/**
 * Master Data Print Helper Utility
 * Generates and triggers printable window for Master Data (Siswa, Guru, Kelas, Mapel, Jadwal, Ekskul).
 */

export function printMasterData({ title, subtitle, columns, data, orientation = 'portrait' }) {
  if (!data || data.length === 0) {
    alert('Tidak ada data yang dapat dicetak.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Harap izinkan pop-up di browser Anda.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const headerTh = columns.map(col => `
    <th style="${col.style || ''}">${col.label}</th>
  `).join('');

  const bodyTr = data.map((row, idx) => {
    const tds = columns.map(col => {
      let val = '';
      if (col.key === 'no') {
        val = idx + 1;
      } else if (typeof col.render === 'function') {
        val = col.render(row, idx);
      } else {
        val = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-';
      }
      return `<td style="${col.tdStyle || col.style || ''}">${val}</td>`;
    }).join('');

    return `<tr>${tds}</tr>`;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - SMK ARTANITA</title>
      <meta charset="utf-8" />
      <style>
        @page {
          size: A4 ${orientation};
          margin: 12mm 15mm;
        }
        body {
          font-family: 'Arial', sans-serif;
          color: #000000;
          background: #ffffff;
          margin: 0;
          padding: 10px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .report-header-box {
          text-align: center;
          margin-bottom: 18px;
          border-bottom: 2px solid #000000;
          padding-bottom: 10px;
        }
        .report-header-box h2 {
          font-size: 18px;
          margin: 0 0 4px 0;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .report-header-box p {
          font-size: 12px;
          margin: 0;
          color: #333333;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-top: 10px;
        }
        .report-table th, .report-table td {
          border: 1px solid #333333;
          padding: 6px 8px;
        }
        .report-table th {
          background-color: #f1f5f9;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
        }
        .report-footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
        }
        .report-footer-sign {
          text-align: center;
          width: 200px;
        }
        .report-footer-sign .space {
          height: 60px;
        }
      </style>
    </head>
    <body>
      <div class="report-header-box">
        <h2>${title}</h2>
        <p>${subtitle || `SMK ARTANITA • DITERBITKAN PADA ${dateStr.toUpperCase()}`}</p>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            ${headerTh}
          </tr>
        </thead>
        <tbody>
          ${bodyTr}
        </tbody>
      </table>

      <div class="report-footer">
        <div>Dicetak pada: ${dateStr}</div>
        <div class="report-footer-sign">
          <div>Kepala Sekolah</div>
          <div class="space"></div>
          <div><strong>(________________________)</strong></div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
