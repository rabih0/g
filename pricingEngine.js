const PricingEngine = {
  priceNiveauFactors: {
    medium: 1.0,
    above: 1.15,
    high: 1.3
  },

  parseFurnitureFromText(text) {
    const furniture = Storage.getFurniture();
    const foundItems = [];
    const textLower = text.toLowerCase();

    for (const [name, _] of Object.entries(furniture)) {
      const nameLower = name.toLowerCase();
      if (textLower.includes(nameLower)) {
        foundItems.push({
          name: name,
          sizes: this.extractSizes(text, name),
          count: (textLower.match(new RegExp(nameLower, 'g')) || []).length
        });
      }
    }

    return foundItems;
  },

  extractSizes(text, furnitureName) {
    const sizes = [];
    const textLower = text.toLowerCase();
    const sizePatterns = {
      'M': /\bm\b|\bmedium\b/i,
      'L': /\bl\b|\blarge\b/i,
      'XL': /\bxl\b|\bx-large\b|\bxlarge\b/i,
      'XXL': /\bxxl\b|\bxx-large\b|\bxxlarge\b/i
    };

    for (const [size, pattern] of Object.entries(sizePatterns)) {
      if (pattern.test(textLower)) {
        sizes.push(size);
      }
    }

    return sizes.length > 0 ? sizes : null;
  },

  calculatePrice(quote) {
    const settings = Storage.getSettings();
    let total = 0;

    const breakdown = {
      grundpreis: settings.grundpreis,
      moebel: 0,
      km: quote.km * settings.preisProKm,
      etagen: quote.etagen * settings.preisProEtage,
      etageDiff: quote.etageDiff * settings.preisProEtage * 1.5,
      parkplatzDistance: (quote.parkplatzDistance || 0) * 0.005,
      parkplatzReservation: (quote.parkplatzReservation ? 10 : 0),
      stundenArbeiter: quote.stunden * settings.stundenlohnArbeiter * settings.anzahlArbeiter,
      stundenTransport: quote.stunden * settings.stundenlohnTransport,
      aufschlag: 0,
      parkplatzSurcharge: 0,
      etageSurcharge: 0,
      mwst: 0
    };

    total += breakdown.grundpreis;
    total += breakdown.km;
    total += breakdown.etagen;
    total += breakdown.etageDiff;
    total += breakdown.parkplatzDistance;
    total += breakdown.parkplatzReservation;
    total += breakdown.stundenArbeiter;
    total += breakdown.stundenTransport;

    for (const item of quote.items) {
      const furnitureData = Storage.getFurniture()[item.name];
      if (furnitureData) {
        const priceData = furnitureData[item.size];
        if (priceData) {
          const price = priceData[settings.preisniveau];
          total += price;
          breakdown.moebel += price;

          if (item.montage) total += furnitureData.montage;
          if (item.demontage) total += furnitureData.demontage;
        }
      }
    }

    const niveauFactor = this.priceNiveauFactors[settings.preisniveau];
    total *= niveauFactor;

    const aufschlag = (total * settings.prozentAufschlag) / 100;
    breakdown.aufschlag = aufschlag;
    total += aufschlag;

    if (quote.etageDiff > 0) {
      breakdown.etageSurcharge = total * 0.10;
      total += breakdown.etageSurcharge;
    }

    let subtotal = total;
    if (settings.mwst) {
      const mwst = total * 0.19;
      breakdown.mwst = mwst;
      total += mwst;
    }

    return {
      breakdown,
      subtotal,
      total: Math.round(total * 100) / 100
    };
  },

  formatPrice(price) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
};
