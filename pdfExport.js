const PDFExport = {
  async generatePDF(quote, calculation) {
    const doc = new PDFKit({
      size: 'A4',
      margin: 40
    });

    const stream = doc.pipe(require('fs').createWriteStream('offer.pdf'));

    doc.fontSize(24).text('UmzugMeister', 50, 50);
    doc.fontSize(12).text('Umzugsangebot', 50, 80);

    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    doc.fontSize(14).text('Angebotsinformationen', 50, 120);
    doc.fontSize(10);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 50, 140);
    doc.text(`ID: ${quote.id || 'N/A'}`, 50, 160);

    doc.moveTo(50, 180).lineTo(550, 180).stroke();

    doc.fontSize(12).text('Möbelstücke', 50, 200);
    let yPos = 220;
    for (const item of quote.items) {
      doc.fontSize(10).text(`${item.name} (${item.size})`, 50, yPos);
      yPos += 15;
    }

    yPos += 10;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

    doc.fontSize(12).text('Preisaufschlüsselung', 50, yPos + 20);
    yPos += 40;

    const lines = [
      { label: 'Grundpreis:', value: calculation.breakdown.grundpreis },
      { label: 'Möbel:', value: calculation.breakdown.moebel },
      { label: 'Kilometer:', value: calculation.breakdown.km },
      { label: 'Etagen:', value: calculation.breakdown.etagen },
      { label: 'Stunden:', value: calculation.breakdown.stunden },
      { label: 'Aufschlag:', value: calculation.breakdown.aufschlag },
      { label: 'Subtotal:', value: calculation.subtotal },
      { label: 'MwSt (19%):', value: calculation.breakdown.mwst }
    ];

    doc.fontSize(10);
    for (const line of lines) {
      doc.text(line.label, 50, yPos);
      doc.text(PricingEngine.formatPrice(line.value), 450, yPos, { align: 'right' });
      yPos += 20;
    }

    yPos += 10;
    doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

    doc.fontSize(14).text('GESAMT', 50, yPos + 20);
    doc.text(PricingEngine.formatPrice(calculation.total), 450, yPos + 20, { align: 'right' });

    doc.end();

    return new Promise((resolve) => {
      stream.on('finish', () => {
        resolve('PDF erstellt');
      });
    });
  },

  generatePDFSimple(quote, calculation) {
    const content = this.generatePDFContent(quote, calculation);
    
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Angebot_${quote.id || Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  generatePDFContent(quote, calculation) {
    let content = '%PDF-1.4\n';
    content += `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n`;
    content += `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n`;
    content += `3 0 obj<</Type/Page/Parent 2 0 R/Resources 4 0 R/MediaBox[0 0 612 792]/Contents 5 0 R>>endobj\n`;
    content += `4 0 obj<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>endobj\n`;
    content += `5 0 obj<</Length 1200>>stream\nBT\n`;
    content += `/F1 24 Tf\n50 750 Td\n(UmzugMeister) Tj\nET\n`;
    content += `BT\n/F1 12 Tf\n50 720 Td\n(Umzugsangebot) Tj\nET\n`;
    content += `endstream\nendobj\n`;
    content += `xref\n0 6\n0000000000 65535 f\n`;
    content += `0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n`;
    content += `0000000210 00000 n\n0000000273 00000 n\ntrailer<</Size 6/Root 1 0 R>>\n`;
    content += `startxref\n1573\n%%EOF`;
    
    return content;
  },

  downloadAsJSON(quote, calculation) {
    const data = {
      quote,
      calculation,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Angebot_${quote.id || Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
