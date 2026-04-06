const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

const globalCache = globalThis.__plantingCache || new Map();
globalThis.__plantingCache = globalCache;

const CROPS = [
  { vegetable: 'Tomato', idealIndoorTemp: '70–80', startIndoorsWeeks: [8, 6], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [0, 1] }, notes: 'Warm-season transplant.' },
  { vegetable: 'Pepper', idealIndoorTemp: '75–85', startIndoorsWeeks: [10, 8], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [1, 2] }, notes: 'Needs warmer nights than tomato.' },
  { vegetable: 'Cucumber', idealIndoorTemp: '70–80', startIndoorsWeeks: [4, 3], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [0, 1] }, notes: 'Can also be direct sown outdoors.' },
  { vegetable: 'Zucchini / Squash', idealIndoorTemp: '70–80', startIndoorsWeeks: [3, 2], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [0, 1] }, notes: 'Do not start too early indoors.' },
  { vegetable: 'Green Beans', idealIndoorTemp: '65–75', startIndoorsWeeks: null, outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [0, 1] }, notes: 'Usually direct sow.' },
  { vegetable: 'Peas', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [6, 4] }, notes: 'Cool-season direct sow.' },
  { vegetable: 'Lettuce', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Cool-season direct sow.' },
  { vegetable: 'Spinach', idealIndoorTemp: '55–65', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [6, 4] }, notes: 'Cool-season direct sow.' },
  { vegetable: 'Broccoli', idealIndoorTemp: '60–70', startIndoorsWeeks: [6, 4], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [2, 1] }, notes: 'Cool-season transplant.' },
  { vegetable: 'Cabbage', idealIndoorTemp: '60–70', startIndoorsWeeks: [6, 4], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Cool-season transplant.' },
  { vegetable: 'Cauliflower', idealIndoorTemp: '60–70', startIndoorsWeeks: [6, 4], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [2, 1] }, notes: 'Cool-season transplant.' },
  { vegetable: 'Brussels Sprouts', idealIndoorTemp: '60–70', startIndoorsWeeks: [6, 4], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Spring timing shown; often stronger as a fall crop.' },
  { vegetable: 'Carrot', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Direct sow only.' },
  { vegetable: 'Radish', idealIndoorTemp: '55–65', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [6, 4] }, notes: 'Fast cool-season direct sow.' },
  { vegetable: 'Beet', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Cool-season direct sow.' },
  { vegetable: 'Onion', idealIndoorTemp: '65–75', startIndoorsWeeks: [10, 8], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Transplant or sets.' },
  { vegetable: 'Garlic', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [8, 6] }, notes: 'Best planted in fall; spring window shown only as a fallback.' },
  { vegetable: 'Leek', idealIndoorTemp: '65–75', startIndoorsWeeks: [10, 8], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Cool-season transplant.' },
  { vegetable: 'Red Potato', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Plant seed potatoes early.' },
  { vegetable: 'Eggplant', idealIndoorTemp: '75–85', startIndoorsWeeks: [10, 8], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [1, 2] }, notes: 'Very heat-loving.' },
  { vegetable: 'Okra', idealIndoorTemp: '75–90', startIndoorsWeeks: [4, 3], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [2, 3] }, notes: 'Needs real heat.' },
  { vegetable: 'Swiss Chard', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Cool-season direct sow or transplant.' },
  { vegetable: 'Celery', idealIndoorTemp: '65–75', startIndoorsWeeks: [12, 10], outdoorRule: { anchor: 'lastFrost', direction: 'after', weeks: [0, 1] }, notes: 'Slow starter.' },
  { vegetable: 'Asparagus', idealIndoorTemp: '60–70', startIndoorsWeeks: null, outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [4, 2] }, notes: 'Usually planted as crowns.' },
  { vegetable: 'Artichoke', idealIndoorTemp: '65–75', startIndoorsWeeks: [10, 8], outdoorRule: { anchor: 'lastFrost', direction: 'before', weeks: [2, 1] }, notes: 'Cooler outdoor start than warm crops.' },
  { vegetable: 'Pumpkin', idealIndoorTemp: '70–85', startIndoorsWeeks: [3, 2], outdoorRule: { anchor: 'safeWarm', direction: 'after', weeks: [1, 2] }, notes: 'Warm-season crop with long vines.' }
];

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=43200, stale-while-revalidate=86400');
  res.end(JSON.stringify(payload));
}

function parseQuery(raw) {
  return String(raw || '').trim();
}

function isZipQuery(value) {
  return /^\d{5}$/.test(value);
}

function isCityStateQuery(value) {
  return /^[A-Za-z .'-]+,\s*[A-Za-z]{2}$/.test(value);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shiftWeeks(date, weeks, direction) {
  const d = new Date(date);
  const sign = direction === 'before' ? -1 : 1;
  d.setDate(d.getDate() + weeks * 7 * sign);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function rangeText(a, b) {
  return `${formatDate(a)} - ${formatDate(b)}`;
}

function makeYearDateFromMMDD(mmdd) {
  if (!mmdd || typeof mmdd !== 'string' || !mmdd.includes('/')) return null;
  const [month, day] = mmdd.split('/').map(Number);
  if (!month || !day) return null;
  const year = new Date().getFullYear();
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function fetchJson(url, { timeoutMs = 8000, retries = 2, headers = {} } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...headers
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      clearTimeout(timeout);
      return json;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 250 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Request failed.');
}

async function fetchZipLocation(zip) {
  const data = await fetchJson(`https://api.zippopotam.us/us/${zip}`);
  const place = data && Array.isArray(data.places) && data.places[0] ? data.places[0] : null;

  if (!place) {
    throw new Error('ZIP location not found.');
  }

  return {
    city: place['place name'] || '',
    state: place['state abbreviation'] || place['state'] || ''
  };
}

async function fetchZipCandidatesFromCityState(query) {
  const parts = query.split(',');
  const city = (parts[0] || '').trim();
  const state = (parts[1] || '').trim().toUpperCase();

  if (!city || !state) {
    throw new Error('City, State format is invalid.');
  }

  const url = `https://api.zippopotam.us/us/${encodeURIComponent(state)}/${encodeURIComponent(city)}`;
  const data = await fetchJson(url, { timeoutMs: 8000, retries: 2 });

  if (!data || !Array.isArray(data.places) || !data.places.length) {
    throw new Error('City, State lookup returned no ZIP codes.');
  }

  const zipSet = new Set();

  if (data['post code'] && /^\d{5}$/.test(String(data['post code']))) {
    zipSet.add(String(data['post code']));
  }

  for (const place of data.places) {
    const zip = place && place['post code'] ? String(place['post code']) : '';
    if (/^\d{5}$/.test(zip)) {
      zipSet.add(zip);
    }
  }

  const zips = [...zipSet];
  if (!zips.length) {
    throw new Error('City, State lookup did not return a valid 5-digit ZIP code.');
  }

  return {
    zips,
    city: city,
    state: state
  };
}

async function fetchZone(zip) {
  const data = await fetchJson(`https://phzmapi.org/${zip}.json`);
  if (!data || !data.zone) {
    throw new Error('Zone result missing.');
  }
  return data.zone;
}

async function fetchFrost(zip) {
  const json = await fetchJson(`https://apis.joelgrant.dev/api/v1/frost/${zip}`);
  const data = json && json.data ? json.data : null;
  const spring = data && data.frost_dates && data.frost_dates.last_frost_32f ? data.frost_dates.last_frost_32f : null;

  if (!spring) {
    throw new Error('Last frost result missing.');
  }

  const medianRaw = spring['50'] || spring['50%'] || null;
  const lastFrostDate = makeYearDateFromMMDD(medianRaw);
  if (!lastFrostDate) {
    throw new Error('Median last frost result missing or invalid.');
  }

  return {
    lastFrostDate,
    weatherStation: data && data.weather_station && data.weather_station.name ? data.weather_station.name : '',
    stationDistanceKm:
      data && data.weather_station && data.weather_station.distance_km != null
        ? Number(data.weather_station.distance_km).toFixed(1)
        : ''
  };
}

function buildCalendar(lastFrostDate) {
  const safeWarmStart = addDays(lastFrostDate, 14);

  return CROPS.map(crop => {
    const startIndoors = crop.startIndoorsWeeks
      ? rangeText(
          shiftWeeks(lastFrostDate, crop.startIndoorsWeeks[0], 'before'),
          shiftWeeks(lastFrostDate, crop.startIndoorsWeeks[1], 'before')
        )
      : 'Direct sow';

    const anchorDate = crop.outdoorRule.anchor === 'safeWarm' ? safeWarmStart : lastFrostDate;
    const outdoorStart = shiftWeeks(anchorDate, crop.outdoorRule.weeks[0], crop.outdoorRule.direction);
    const outdoorEnd = shiftWeeks(anchorDate, crop.outdoorRule.weeks[1], crop.outdoorRule.direction);

    return {
      vegetable: crop.vegetable,
      startIndoors,
      idealIndoorTemp: crop.idealIndoorTemp,
      plantOutside: rangeText(outdoorStart, outdoorEnd),
      notes: crop.notes
    };
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, {
      ok: false,
      error: 'Method not allowed.'
    });
  }

  const query = parseQuery(req.query && req.query.query);

  if (!query) {
    return sendJson(res, 400, {
      ok: false,
      error: 'Enter a ZIP code or City, State.'
    });
  }

  const cacheKey = query.toLowerCase();
  const cached = globalCache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return sendJson(res, 200, cached.payload);
  }

  try {
    let candidateZips = [];
    let inputLocation = null;

    if (isZipQuery(query)) {
      candidateZips = [query];
    } else if (isCityStateQuery(query)) {
      inputLocation = await fetchZipCandidatesFromCityState(query);
      candidateZips = inputLocation.zips;
    } else {
      return sendJson(res, 400, {
        ok: false,
        error: 'Use either a 5-digit ZIP code or City, State with a 2-letter state code.'
      });
    }

    let chosenZip = '';
    let frostValue = null;
    let locationValue = null;
    let zoneValue = null;
    const tried = [];

    for (const zip of candidateZips) {
      tried.push(zip);

      const [zipLocationResult, zoneResult, frostResult] = await Promise.allSettled([
        fetchZipLocation(zip),
        fetchZone(zip),
        fetchFrost(zip)
      ]);

      const frostCandidate = frostResult.status === 'fulfilled' ? frostResult.value : null;
      if (!frostCandidate) {
        continue;
      }

      chosenZip = zip;
      frostValue = frostCandidate;
      locationValue = zipLocationResult.status === 'fulfilled'
        ? zipLocationResult.value
        : inputLocation
          ? { city: inputLocation.city, state: inputLocation.state }
          : null;
      zoneValue = zoneResult.status === 'fulfilled' ? zoneResult.value : null;
      break;
    }

    if (!frostValue || !chosenZip) {
      return sendJson(res, 502, {
        ok: false,
        error: `The backend could not verify the median last spring frost date for this search after trying these ZIP codes: ${tried.join(', ')}.`
      });
    }

    const safeWarmStart = addDays(frostValue.lastFrostDate, 14);
    const verification = zoneValue && locationValue ? 'verified' : 'partial';

    let lookupNote = '';
    if (verification === 'verified') {
      lookupNote = frostValue.stationDistanceKm
        ? `Zone, location, and frost results were verified. Frost timing is based on a median last spring frost date from the nearest matched station (${frostValue.stationDistanceKm} km away). Warm-season crops use a safer outdoor anchor 14 days after that frost date.`
        : 'Zone, location, and frost results were verified. Warm-season crops use a safer outdoor anchor 14 days after that frost date.';
    } else {
      const missing = [];
      if (!locationValue) missing.push('location');
      if (!zoneValue) missing.push('zone');

      lookupNote = `The calendar was built because the frost date was verified, but ${missing.join(' and ')} could not be fully verified for this search. Values that could not be verified are shown as unavailable.`;
    }

    const payload = {
      ok: true,
      verification,
      input: query,
      zip: chosenZip,
      locationDisplay: locationValue ? [locationValue.city, locationValue.state].filter(Boolean).join(', ') || '—' : 'Unavailable',
      zone: zoneValue || 'Unavailable',
      lastFrostDisplay: formatDate(frostValue.lastFrostDate),
      safeWarmStartDisplay: formatDate(safeWarmStart),
      weatherStation: frostValue.weatherStation || '—',
      lookupNote,
      calendar: buildCalendar(frostValue.lastFrostDate)
    };

    globalCache.set(cacheKey, {
      savedAt: Date.now(),
      payload
    });

    return sendJson(res, 200, payload);
  } catch (error) {
    console.error(error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Live lookup failed for this search. The backend did not return values because it could not verify the required frost data.';

    return sendJson(res, 502, {
      ok: false,
      error: message
    });
  }
};
