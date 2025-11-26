const Storage = {
  SETTINGS_KEY: 'umzug_settings',
  FURNITURE_KEY: 'umzug_furniture',
  QUOTES_KEY: 'umzug_quotes',

  defaultSettings: {
    grundpreis: 50,
    preisProKm: 1.2,
    preisProEtage: 8,
    anzahlArbeiter: 2,
    stundenlohnArbeiter: 25,
    stundenlohnTransport: 15,
    stundenlohn: 25,
    preisniveau: 'medium',
    prozentAufschlag: 0,
    mwst: true
  },

  defaultFurniture: {
    "Bett": {
      M: { medium: 50, above: 60, high: 75 },
      L: { medium: 70, above: 85, high: 110 },
      XL: { medium: 90, above: 110, high: 140 },
      XXL: { medium: 120, above: 150, high: 180 },
      montage: 25,
      demontage: 20
    },
    "Sofa": {
      M: { medium: 40, above: 55, high: 70 },
      L: { medium: 60, above: 75, high: 95 },
      XL: { medium: 80, above: 100, high: 130 },
      XXL: { medium: 110, above: 130, high: 160 },
      montage: 0,
      demontage: 0
    },
    "Küchenschrank": {
      M: { medium: 50, above: 60, high: 80 },
      L: { medium: 70, above: 85, high: 110 },
      XL: { medium: 90, above: 110, high: 140 },
      XXL: { medium: 120, above: 150, high: 180 },
      montage: 30,
      demontage: 25
    },
    "Waschmaschine": {
      M: { medium: 50, above: 60, high: 80 },
      L: { medium: 70, above: 85, high: 110 },
      XL: { medium: 90, above: 110, high: 140 },
      XXL: { medium: 120, above: 150, high: 180 },
      montage: 15,
      demontage: 10
    },
    "Kartons": {
      M: { medium: 3, above: 4, high: 5 },
      L: { medium: 4, above: 5, high: 6 },
      XL: { medium: 5, above: 6, high: 7 },
      XXL: { medium: 6, above: 7, high: 8 },
      montage: 0,
      demontage: 0
    },
    "Lampe": {
      M: { medium: 5, above: 6, high: 8 },
      L: { medium: 5, above: 6, high: 8 },
      XL: { medium: 5, above: 6, high: 8 },
      XXL: { medium: 5, above: 6, high: 8 },
      montage: 2,
      demontage: 2
    },
    "Fitnessraum": {
      M: { medium: 50, above: 60, high: 80 },
      L: { medium: 70, above: 85, high: 110 },
      XL: { medium: 90, above: 110, high: 140 },
      XXL: { medium: 120, above: 150, high: 180 },
      montage: 15,
      demontage: 10
    },
    "Garten": {
      M: { medium: 30, above: 40, high: 50 },
      L: { medium: 50, above: 60, high: 70 },
      XL: { medium: 70, above: 85, high: 100 },
      XXL: { medium: 100, above: 120, high: 150 },
      montage: 10,
      demontage: 5
    },
    "Garage": {
      M: { medium: 40, above: 50, high: 60 },
      L: { medium: 60, above: 70, high: 85 },
      XL: { medium: 80, above: 100, high: 120 },
      XXL: { medium: 100, above: 120, high: 150 },
      montage: 10,
      demontage: 10
    },
    "Keller": {
      M: { medium: 50, above: 60, high: 75 },
      L: { medium: 70, above: 85, high: 110 },
      XL: { medium: 90, above: 110, high: 140 },
      XXL: { medium: 120, above: 150, high: 180 },
      montage: 20,
      demontage: 15
    }
  },

  initializeStorage() {
    if (!this.getSettings()) {
      this.saveSettings(this.defaultSettings);
    }
    if (!this.getFurniture()) {
      this.saveFurniture(this.defaultFurniture);
    }
  },

  getSettings() {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveSettings(settings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  },

  getFurniture() {
    const data = localStorage.getItem(this.FURNITURE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveFurniture(furniture) {
    localStorage.setItem(this.FURNITURE_KEY, JSON.stringify(furniture));
  },

  addFurniture(name, prices) {
    const furniture = this.getFurniture();
    furniture[name] = prices;
    this.saveFurniture(furniture);
  },

  updateFurniture(name, prices) {
    const furniture = this.getFurniture();
    furniture[name] = prices;
    this.saveFurniture(furniture);
  },

  deleteFurniture(name) {
    const furniture = this.getFurniture();
    delete furniture[name];
    this.saveFurniture(furniture);
  },

  addQuote(quote) {
    const quotes = this.getQuotes();
    quote.id = Date.now();
    quote.date = new Date().toLocaleString('de-DE');
    quotes.push(quote);
    localStorage.setItem(this.QUOTES_KEY, JSON.stringify(quotes));
    return quote;
  },

  getQuotes() {
    const data = localStorage.getItem(this.QUOTES_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteQuote(id) {
    let quotes = this.getQuotes();
    quotes = quotes.filter(q => q.id !== id);
    localStorage.setItem(this.QUOTES_KEY, JSON.stringify(quotes));
  },

  getQuote(id) {
    const quotes = this.getQuotes();
    return quotes.find(q => q.id === id);
  },

  createBackup() {
    return {
      settings: this.getSettings(),
      furniture: this.getFurniture(),
      quotes: this.getQuotes(),
      timestamp: new Date().toISOString()
    };
  },

  restoreBackup(backup) {
    if (backup.settings) this.saveSettings(backup.settings);
    if (backup.furniture) this.saveFurniture(backup.furniture);
    if (backup.quotes) localStorage.setItem(this.QUOTES_KEY, JSON.stringify(backup.quotes));
  }
};

Storage.initializeStorage();
