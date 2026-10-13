// Reader from the previously deployed HTML; keep its V1 checks unchanged.
module.exports = async function fetchAutomaticKbCatalog(fetch, url) {
  const response = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Catalogo automatico: HTTP ${response.status}`);
  const snapshot = await response.json();
  if (snapshot.schemaVersion !== 1 || !snapshot.documentId || !snapshot.catalog) {
    throw new Error("Catalogo automatico invalido.");
  }
  for (const key of ["2016", "2019", "2022", "2025"]) {
    if (!/^KB\d{7}$/.test(snapshot.catalog[key]?.kb || "")) {
      throw new Error(`Catalogo automatico sem KB valido para ${key}.`);
    }
  }
  return snapshot;
};
