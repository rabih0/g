let currentQuote = null;
let currentCalculation = null;
let currentEditFurnitureId = null;

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');

  if (screenId === 'furniture-screen') {
    renderFurnitureList();
  } else if (screenId === 'backup-screen') {
    renderQuotesList();
  } else if (screenId === 'settings-screen') {
    loadSettingsForm();
  }
}

function saveSettings() {
  const settings = {
    grundpreis: parseFloat(document.getElementById('grundpreis').value),
    preisProKm: parseFloat(document.getElementById('preisProKm').value),
    preisProEtage: parseFloat(document.getElementById('preisProEtage').value),
    anzahlArbeiter: parseInt(document.getElementById('anzahlArbeiter').value) || 2,
    stundenlohnArbeiter: parseFloat(document.getElementById('stundenlohnArbeiter').value),
    stundenlohnTransport: parseFloat(document.getElementById('stundenlohnTransport').value),
    stundenlohn: parseFloat(document.getElementById('stundenlohn').value),
    preisniveau: document.getElementById('preisniveau').value,
    prozentAufschlag: parseFloat(document.getElementById('prozentAufschlag').value),
    mwst: document.getElementById('mwst').checked
  };

  Storage.saveSettings(settings);
  showNotification('Einstellungen gespeichert', 'success');
}

function loadSettingsForm() {
  const settings = Storage.getSettings();
  document.getElementById('grundpreis').value = settings.grundpreis;
  document.getElementById('preisProKm').value = settings.preisProKm;
  document.getElementById('preisProEtage').value = settings.preisProEtage;
  document.getElementById('anzahlArbeiter').value = settings.anzahlArbeiter || 2;
  document.getElementById('stundenlohnArbeiter').value = settings.stundenlohnArbeiter || 25;
  document.getElementById('stundenlohnTransport').value = settings.stundenlohnTransport || 15;
  document.getElementById('stundenlohn').value = settings.stundenlohn || settings.stundenlohnArbeiter;
  document.getElementById('preisniveau').value = settings.preisniveau;
  document.getElementById('prozentAufschlag').value = settings.prozentAufschlag;
  document.getElementById('mwst').checked = settings.mwst;
  updateAufschlagValue();
}

function renderFurnitureList() {
  const furniture = Storage.getFurniture();
  const list = document.getElementById('furniture-list');
  list.innerHTML = '';

  for (const [name, data] of Object.entries(furniture)) {
    const item = document.createElement('div');
    item.className = 'furniture-item';
    
    const sizeRows = [];
    for (const size of ['M', 'L', 'XL', 'XXL']) {
      const priceData = data[size];
      if (priceData) {
        sizeRows.push(`
          <div class="size-row">
            <span class="size-label">${size}</span>
            <div class="size-prices">
              <span class="price-item">
                <span class="level">M:</span>
                <span class="price">${PricingEngine.formatPrice(priceData.medium)}</span>
              </span>
              <span class="price-item">
                <span class="level">A:</span>
                <span class="price">${PricingEngine.formatPrice(priceData.above)}</span>
              </span>
              <span class="price-item">
                <span class="level">H:</span>
                <span class="price">${PricingEngine.formatPrice(priceData.high)}</span>
              </span>
            </div>
          </div>
        `);
      }
    }

    const montageDemontage = `
      <div class="montage-demontage">
        <span>Mont: ${PricingEngine.formatPrice(data.montage)}</span>
        <span>Demont: ${PricingEngine.formatPrice(data.demontage)}</span>
      </div>
    `;

    item.innerHTML = `
      <div class="furniture-info">
        <div class="furniture-name">${name}</div>
        <div class="furniture-sizes">
          ${sizeRows.join('')}
        </div>
        ${montageDemontage}
      </div>
      <div class="furniture-actions">
        <button class="edit-btn" onclick="openEditFurnitureModal('${name}')"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" onclick="deleteFurnitureQuick('${name}')"><i class="fas fa-trash"></i></button>
      </div>
    `;
    list.appendChild(item);
  }
}

function deleteFurnitureQuick(name) {
  if (confirm(`${name} löschen?`)) {
    Storage.deleteFurniture(name);
    renderFurnitureList();
    showNotification('Gelöscht', 'success');
  }
}

function openAddFurnitureModal() {
  openModal('add-furniture-modal');
  document.getElementById('new-furniture-name').value = '';
  document.querySelectorAll('#add-furniture-modal input[type="number"]').forEach(el => el.value = '');
}

function addFurniture() {
  const name = document.getElementById('new-furniture-name').value.trim();
  if (!name) {
    showNotification('Bitte einen Namen eingeben', 'error');
    return;
  }

  const prices = {
    M: {
      medium: parseFloat(document.getElementById('new-furniture-m-medium').value) || 0,
      above: parseFloat(document.getElementById('new-furniture-m-above').value) || 0,
      high: parseFloat(document.getElementById('new-furniture-m-high').value) || 0
    },
    L: {
      medium: parseFloat(document.getElementById('new-furniture-l-medium').value) || 0,
      above: parseFloat(document.getElementById('new-furniture-l-above').value) || 0,
      high: parseFloat(document.getElementById('new-furniture-l-high').value) || 0
    },
    XL: {
      medium: parseFloat(document.getElementById('new-furniture-xl-medium').value) || 0,
      above: parseFloat(document.getElementById('new-furniture-xl-above').value) || 0,
      high: parseFloat(document.getElementById('new-furniture-xl-high').value) || 0
    },
    XXL: {
      medium: parseFloat(document.getElementById('new-furniture-xxl-medium').value) || 0,
      above: parseFloat(document.getElementById('new-furniture-xxl-above').value) || 0,
      high: parseFloat(document.getElementById('new-furniture-xxl-high').value) || 0
    },
    montage: parseFloat(document.getElementById('new-furniture-montage').value) || 0,
    demontage: parseFloat(document.getElementById('new-furniture-demontage').value) || 0
  };

  Storage.addFurniture(name, prices);
  closeModal();
  renderFurnitureList();
  showNotification(`${name} hinzugefügt`, 'success');
}

function openEditFurnitureModal(name) {
  const furniture = Storage.getFurniture()[name];
  currentEditFurnitureId = name;

  document.getElementById('edit-furniture-id').value = name;
  document.getElementById('edit-furniture-name').value = name;
  
  document.getElementById('edit-furniture-m-medium').value = furniture.M.medium;
  document.getElementById('edit-furniture-m-above').value = furniture.M.above;
  document.getElementById('edit-furniture-m-high').value = furniture.M.high;
  
  document.getElementById('edit-furniture-l-medium').value = furniture.L.medium;
  document.getElementById('edit-furniture-l-above').value = furniture.L.above;
  document.getElementById('edit-furniture-l-high').value = furniture.L.high;
  
  document.getElementById('edit-furniture-xl-medium').value = furniture.XL.medium;
  document.getElementById('edit-furniture-xl-above').value = furniture.XL.above;
  document.getElementById('edit-furniture-xl-high').value = furniture.XL.high;
  
  document.getElementById('edit-furniture-xxl-medium').value = furniture.XXL.medium;
  document.getElementById('edit-furniture-xxl-above').value = furniture.XXL.above;
  document.getElementById('edit-furniture-xxl-high').value = furniture.XXL.high;
  
  document.getElementById('edit-furniture-montage').value = furniture.montage;
  document.getElementById('edit-furniture-demontage').value = furniture.demontage;

  openModal('edit-furniture-modal');
}

function saveFurniture() {
  const oldName = currentEditFurnitureId;
  const newName = document.getElementById('edit-furniture-name').value.trim();

  const prices = {
    M: {
      medium: parseFloat(document.getElementById('edit-furniture-m-medium').value) || 0,
      above: parseFloat(document.getElementById('edit-furniture-m-above').value) || 0,
      high: parseFloat(document.getElementById('edit-furniture-m-high').value) || 0
    },
    L: {
      medium: parseFloat(document.getElementById('edit-furniture-l-medium').value) || 0,
      above: parseFloat(document.getElementById('edit-furniture-l-above').value) || 0,
      high: parseFloat(document.getElementById('edit-furniture-l-high').value) || 0
    },
    XL: {
      medium: parseFloat(document.getElementById('edit-furniture-xl-medium').value) || 0,
      above: parseFloat(document.getElementById('edit-furniture-xl-above').value) || 0,
      high: parseFloat(document.getElementById('edit-furniture-xl-high').value) || 0
    },
    XXL: {
      medium: parseFloat(document.getElementById('edit-furniture-xxl-medium').value) || 0,
      above: parseFloat(document.getElementById('edit-furniture-xxl-above').value) || 0,
      high: parseFloat(document.getElementById('edit-furniture-xxl-high').value) || 0
    },
    montage: parseFloat(document.getElementById('edit-furniture-montage').value) || 0,
    demontage: parseFloat(document.getElementById('edit-furniture-demontage').value) || 0
  };

  if (oldName !== newName) {
    Storage.deleteFurniture(oldName);
  }

  Storage.updateFurniture(newName, prices);
  closeModal();
  renderFurnitureList();
  showNotification('Gespeichert', 'success');
}

function deleteFurniture() {
  if (confirm('Wirklich löschen?')) {
    Storage.deleteFurniture(currentEditFurnitureId);
    closeModal();
    renderFurnitureList();
    showNotification('Gelöscht', 'success');
  }
}

function calculateEtageDiff() {
  const auszugEtage = parseInt(document.getElementById('quote-auszug-etage').value) || 0;
  const einzugEtage = parseInt(document.getElementById('quote-einzug-etage').value) || 0;
  const etageDiff = Math.abs(einzugEtage - auszugEtage);
  document.getElementById('quote-etage-diff-display').value = etageDiff;
}

function analyzeQuote() {
  const text = document.getElementById('quote-text').value;
  const km = parseFloat(document.getElementById('quote-km').value) || 0;
  const etagen = parseInt(document.getElementById('quote-etagen').value) || 0;
  const stunden = parseFloat(document.getElementById('quote-stunden').value) || 0;
  const auszugEtage = parseInt(document.getElementById('quote-auszug-etage').value) || 0;
  const einzugEtage = parseInt(document.getElementById('quote-einzug-etage').value) || 0;
  const etageDiff = Math.abs(einzugEtage - auszugEtage);
  const parkplatzDistance = parseFloat(document.getElementById('quote-parkplatz-distance').value) || 0;
  const parkplatzReservation = document.getElementById('quote-parkplatz-reservation').checked;

  if (!text.trim()) {
    showNotification('Bitte Text eingeben', 'error');
    return;
  }

  const parsedItems = PricingEngine.parseFurnitureFromText(text);

  if (parsedItems.length === 0) {
    showNotification('Keine Möbel erkannt. Bitte überprüfen Sie die Eingabe.', 'error');
    return;
  }

  const quote = {
    id: Date.now(),
    text: text,
    km: km,
    etagen: etagen,
    stunden: stunden,
    etageDiff: etageDiff,
    parkplatzDistance: parkplatzDistance,
    parkplatzReservation: parkplatzReservation,
    items: []
  };

  let itemsWithoutSize = parsedItems.filter(item => !item.sizes || item.sizes.length === 0);

  if (itemsWithoutSize.length > 0) {
    selectSizesForItems(itemsWithoutSize, 0, parsedItems.filter(item => item.sizes && item.sizes.length > 0), quote);
  } else {
    createQuoteFromParsed(parsedItems, quote);
  }
}

function selectSizesForItems(itemsWithoutSize, index, itemsWithSize, quote) {
  if (index >= itemsWithoutSize.length) {
    const allItems = [...itemsWithSize, ...itemsWithoutSize];
    createQuoteFromParsed(allItems, quote);
    return;
  }

  const item = itemsWithoutSize[index];
  showSizeSelection(item.name, (size) => {
    item.sizes = [size];
    selectSizesForItems(itemsWithoutSize, index + 1, itemsWithSize, quote);
  });
}

function showSizeSelection(furnitureName, callback) {
  const modal = document.getElementById('size-modal');
  const optionsContainer = document.getElementById('size-options');
  optionsContainer.innerHTML = '';

  const sizes = ['M', 'L', 'XL', 'XXL'];
  for (const size of sizes) {
    const btn = document.createElement('div');
    btn.className = 'modal-option';
    btn.textContent = size;
    btn.onclick = () => {
      closeModal();
      callback(size);
    };
    optionsContainer.appendChild(btn);
  }

  openModal('size-modal');
}

function createQuoteFromParsed(parsedItems, quote) {
  for (const item of parsedItems) {
    if (item.sizes && item.sizes.length > 0) {
      const size = item.sizes[0];
      quote.items.push({
        name: item.name,
        size: size,
        montage: false,
        demontage: false
      });
    }
  }

  currentQuote = quote;
  currentCalculation = PricingEngine.calculatePrice(quote);
  displayResult();
  showScreen('result-screen');
}

function displayResult() {
  const itemsContainer = document.getElementById('result-items');
  itemsContainer.innerHTML = '';

  for (const item of currentQuote.items) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <span>${item.name} (${item.size})</span>
      <span>${PricingEngine.formatPrice(Storage.getFurniture()[item.name][item.size][Storage.getSettings().preisniveau])}</span>
    `;
    itemsContainer.appendChild(div);
  }

  document.getElementById('calc-grundpreis').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.grundpreis);
  document.getElementById('calc-moebel').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.moebel);
  document.getElementById('calc-km').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.km);
  document.getElementById('calc-etagen').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.etagen);
  document.getElementById('calc-etage-diff').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.etageDiff);
  
  const stundenArbeiter = currentCalculation.breakdown.stundenArbeiter || 0;
  const stundenTransport = currentCalculation.breakdown.stundenTransport || 0;
  const stundenGesamt = stundenArbeiter + stundenTransport;
  
  document.getElementById('calc-stunden-arbeiter').textContent = PricingEngine.formatPrice(stundenArbeiter);
  document.getElementById('calc-stunden-transport').textContent = PricingEngine.formatPrice(stundenTransport);
  document.getElementById('calc-stunden').textContent = PricingEngine.formatPrice(stundenGesamt);
  
  document.getElementById('calc-parkplatz-distance').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.parkplatzDistance);
  document.getElementById('calc-parkplatz-reservation').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.parkplatzReservation);
  document.getElementById('calc-aufschlag').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.aufschlag);
  document.getElementById('calc-etage-surcharge').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.etageSurcharge);
  document.getElementById('calc-subtotal').textContent = PricingEngine.formatPrice(currentCalculation.subtotal);
  document.getElementById('calc-mwst').textContent = PricingEngine.formatPrice(currentCalculation.breakdown.mwst);
  document.getElementById('calc-total').textContent = PricingEngine.formatPrice(currentCalculation.total);
}

function copyOffer() {
  const text = `UmzugMeister Angebot\n\n${currentCalculation.total.toFixed(2)}€\n\nDetails:\n${currentQuote.text}`;
  navigator.clipboard.writeText(text);
  showNotification('Kopiert', 'success');
}

function exportPDF() {
  PDFExport.downloadAsJSON(currentQuote, currentCalculation);
  showNotification('Als JSON exportiert', 'success');
}

function saveOffer() {
  currentQuote.total = currentCalculation.total;
  Storage.addQuote(currentQuote);
  showNotification('Angebot gespeichert', 'success');
}

function renderQuotesList() {
  const quotes = Storage.getQuotes();
  const list = document.getElementById('quotes-list');
  list.innerHTML = '';

  if (quotes.length === 0) {
    list.innerHTML = '<p style="color: var(--primary-color);">Keine gespeicherten Angebote</p>';
    return;
  }

  for (const quote of quotes) {
    const div = document.createElement('div');
    div.className = 'quote-item';
    div.innerHTML = `
      <div class="quote-item-info">
        <div class="quote-item-title">Angebot #${quote.id}</div>
        <div class="quote-item-date">${quote.date}</div>
      </div>
      <div class="quote-item-price">${PricingEngine.formatPrice(quote.total)}</div>
      <div class="quote-item-actions">
        <button class="delete-quote-btn" onclick="deleteQuoteItem(${quote.id})">Löschen</button>
      </div>
    `;
    list.appendChild(div);
  }
}

function deleteQuoteItem(id) {
  if (confirm('Angebot löschen?')) {
    Storage.deleteQuote(id);
    renderQuotesList();
    showNotification('Gelöscht', 'success');
  }
}

function saveBackup() {
  const backup = Storage.createBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `umzug_backup_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showNotification('Backup erstellt', 'success');
}

function loadBackup() {
  const file = document.getElementById('backup-file').files[0];
  if (!file) {
    showNotification('Keine Datei ausgewählt', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const backup = JSON.parse(e.target.result);
      Storage.restoreBackup(backup);
      showNotification('Backup wiederhergestellt', 'success');
      renderQuotesList();
    } catch (error) {
      showNotification('Fehler beim Laden des Backups', 'error');
    }
  };
  reader.readAsText(file);
}

function openModal(modalId) {
  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById(modalId).classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = type === 'error' ? 'error-message' : type === 'success' ? 'success-message' : 'error-message';
  notification.textContent = message;

  const screen = document.querySelector('.screen.active');
  screen.insertBefore(notification, screen.firstChild);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function updateAufschlagValue() {
  const value = document.getElementById('prozentAufschlag').value;
  document.getElementById('aufschlag-value').textContent = value + '%';
}

document.getElementById('prozentAufschlag')?.addEventListener('input', updateAufschlagValue);
document.getElementById('modal-overlay')?.addEventListener('click', closeModal);
document.getElementById('quote-text')?.addEventListener('input', updateCharCount);

function updateCharCount() {
  const textarea = document.getElementById('quote-text');
  const charCount = document.getElementById('char-count');
  if (textarea && charCount) {
    charCount.textContent = `${textarea.value.length} Zeichen`;
  }
}

showScreen('home-screen');
