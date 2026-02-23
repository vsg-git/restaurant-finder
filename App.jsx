import { useCallback, useEffect, useRef, useState } from "react";

// ── Styles ────────────────────────────────────────────────────────────────────
const css = String.raw`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0c0a;
    --surface: #161410;
    --surface2: #1e1b17;
    --border: rgba(255,220,120,0.12);
    --gold: #f5c842;
    --gold-dim: rgba(245,200,66,0.12);
    --green: #4caf7d;
    --red: #e05555;
    --text: #f0ead8;
    --text-muted: #8a8068;
    --radius: 4px;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
  #root { min-width: 100%; }
  .app { min-height: 100vh; position: relative; overflow-x: hidden; }
  .app::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 999; opacity: 0.4;
  }

  /* ── Header ── */
  .header { padding: 56px 48px 40px; border-bottom: 1px solid var(--border); }
  .eyebrow {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--gold); margin-bottom: 14px;
    display: flex; align-items: center; gap: 12px;
  }
  .eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--border); max-width: 100px; }
  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(40px, 6vw, 76px); font-weight: 900;
    line-height: 0.95; letter-spacing: -0.02em;
  }
  .header h1 em { font-style: italic; color: var(--gold); }
  .header-sub { margin-top: 16px; font-size: 13px; color: var(--text-muted); font-family: 'DM Mono', monospace; letter-spacing: 0.04em; }

  /* ── Controls ── */
  .controls { padding: 32px 48px; border-bottom: 1px solid var(--border); display: grid; gap: 24px; }

  /* Location row */
  .loc-row { display: flex; gap: 10px; align-items: stretch; }
  .loc-wrap { flex: 1; position: relative; }
  .loc-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--gold); font-size: 15px; pointer-events: none; }
  .loc-input {
    width: 100%;
    background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 10px 14px 10px 38px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
    transition: border-color 0.2s;
  }
  .loc-input::placeholder { color: var(--text-muted); }
  .loc-input:focus { border-color: var(--gold); }

  .loc-mode-btn {
    background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 10px 16px; color: var(--text-muted); font-family: 'DM Mono', monospace;
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    cursor: pointer; white-space: nowrap; transition: all 0.2s;
  }
  .loc-mode-btn:hover, .loc-mode-btn.active { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
  .loc-mode-btn.go-btn {
    background: var(--gold); color: #0d0c0a; border-color: var(--gold); font-weight: 500;
  }
  .loc-mode-btn.go-btn:hover { opacity: 0.85; }

  /* Controls top row */
  .controls-top { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
  .search-wrap { flex: 1; min-width: 180px; position: relative; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--gold); font-size: 16px; pointer-events: none; }
  .search-input {
    width: 100%;
    background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 10px 14px 10px 40px; color: var(--text);
    font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none;
    transition: border-color 0.2s;
  }
  .search-input::placeholder { color: var(--text-muted); }
  .search-input:focus { border-color: var(--gold); }

  .sel {
    background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 10px 30px 10px 14px; color: var(--text);
    font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.05em;
    outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23f5c842'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center;
    transition: border-color 0.2s;
  }
  .sel:focus { border-color: var(--gold); }

  /* ── Cuisine chips ── */
  .chips-section {}
  .chips-label {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; display: block;
  }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    background: var(--surface2); border: 1px solid var(--border); border-radius: 100px;
    padding: 5px 14px; font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 0.06em; color: var(--text-muted); cursor: pointer;
    transition: all 0.15s; user-select: none; display: flex; align-items: center; gap: 6px;
  }
  .chip:hover { border-color: rgba(245,200,66,0.4); color: var(--text); }
  .chip.active { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); }
  .chip-icon { font-size: 13px; }

  /* ── Filter pills row (open now + price) ── */
  .filter-pills { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
  .filter-label {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-muted); margin-right: 4px;
  }

  /* Toggle */
  .toggle-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .toggle-track {
    width: 36px; height: 20px; border-radius: 10px; background: var(--surface2);
    border: 1px solid var(--border); position: relative; transition: all 0.2s; flex-shrink: 0;
  }
  .toggle-track.on { background: var(--green); border-color: var(--green); }
  .toggle-thumb {
    position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
    border-radius: 50%; background: var(--text-muted); transition: all 0.2s;
  }
  .toggle-track.on .toggle-thumb { left: 18px; background: #fff; }
  .toggle-text {
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-muted); transition: color 0.2s;
  }
  .toggle-wrap:hover .toggle-text, .toggle-track.on ~ .toggle-text { color: var(--text); }

  /* Price pills */
  .price-pills { display: flex; gap: 4px; }
  .price-pill {
    background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 4px 10px; font-family: 'DM Mono', monospace; font-size: 11px;
    color: var(--text-muted); cursor: pointer; transition: all 0.15s; user-select: none;
  }
  .price-pill:hover { border-color: rgba(245,200,66,0.4); color: var(--text); }
  .price-pill.active { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); }

  /* ── Sliders ── */
  .sliders { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 20px; }
  .sg label { display: block; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
  .sg label span { color: var(--gold); }
  input[type=range] { width: 100%; -webkit-appearance: none; background: transparent; cursor: pointer; }
  input[type=range]::-webkit-slider-runnable-track {
    height: 2px;
    background: linear-gradient(90deg, var(--gold) var(--p,50%), var(--surface2) var(--p,50%));
    border-radius: 1px;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 14px; height: 14px;
    background: var(--gold); border-radius: 50%; margin-top: -6px;
    box-shadow: 0 0 0 3px rgba(245,200,66,0.2); transition: box-shadow 0.2s;
  }
  input[type=range]:focus::-webkit-slider-thumb { box-shadow: 0 0 0 5px rgba(245,200,66,0.35); }
  input[type=range]::-moz-range-track { height: 2px; background: var(--surface2); border-radius: 1px; }
  input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border: none; background: var(--gold); border-radius: 50%; }

  /* ── Results ── */
  .results-meta { padding: 24px 48px 0; display: flex; align-items: baseline; gap: 14px; flex-wrap: wrap; }
  .results-count { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: var(--gold); }
  .results-label { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); }
  .results-filters { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
  .active-filter {
    background: var(--gold-dim); border: 1px solid var(--border); border-radius: 100px;
    padding: 3px 10px; font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold);
  }

  .grid { padding: 28px 48px 64px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 2px; }

  /* ── Cards ── */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    padding: 28px 28px 22px; position: relative; overflow: hidden;
    transition: background 0.2s, box-shadow 0.2s; cursor: default;
    animation: up 0.4s ease both;
  }
  @keyframes up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .card:hover { background: var(--surface2); box-shadow: 0 0 0 1px var(--gold), 0 16px 40px rgba(0,0,0,0.5); z-index: 2; }

  .rank {
    position: absolute; top: 18px; right: 20px;
    font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900;
    color: var(--surface2); line-height: 1; user-select: none; transition: color 0.2s;
  }
  .card:hover .rank, .card.top .rank { color: var(--gold-dim); }

  .card-top-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
  .badge {
    display: inline-block; font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 0.2em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px;
    background: var(--gold); color: #0d0c0a; font-weight: 500;
  }
  .open-pill {
    display: inline-block; font-family: 'DM Mono', monospace; font-size: 9px;
    letter-spacing: 0.15em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px;
    font-weight: 500;
  }
  .open-pill.open { background: rgba(76,175,125,0.15); color: var(--green); border: 1px solid rgba(76,175,125,0.3); }
  .open-pill.closed { background: rgba(224,85,85,0.12); color: var(--red); border: 1px solid rgba(224,85,85,0.25); }

  .card-name {
    font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 700;
    line-height: 1.2; margin-bottom: 16px; padding-right: 40px;
  }

  .stats { display: flex; flex-direction: column; gap: 7px; }
  .stat { display: flex; align-items: center; gap: 10px; font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-muted); }
  .stat-ico { width: 18px; text-align: center; font-size: 13px; }
  .stat-val { color: var(--text); font-weight: 500; }

  .bar-wrap { margin-top: 18px; height: 2px; background: var(--surface2); border-radius: 1px; overflow: hidden; }
  .bar { height: 100%; background: linear-gradient(90deg, var(--gold), #e88040); border-radius: 1px; transition: width 0.5s ease; }

  /* ── Loading / empty ── */
  .loading { padding: 80px 48px; text-align: center; }
  .spinner { width: 38px; height: 38px; border: 2px solid var(--border); border-top-color: var(--gold); border-radius: 50%; margin: 0 auto 24px; animation: spin 0.75s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-txt { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); }

  .empty { padding: 80px 48px; text-align: center; font-family: 'DM Mono', monospace; color: var(--text-muted); font-size: 13px; letter-spacing: 0.1em; }
  .empty-glyph { display: block; font-family: 'Playfair Display', serif; font-size: 64px; font-weight: 900; color: var(--surface2); margin-bottom: 16px; }

  hr.rule { height: 1px; border: none; background: var(--border); margin: 0 48px; }

  @media (max-width: 640px) {
    .header, .controls, .results-meta, .grid { padding-left: 20px; padding-right: 20px; }
    hr.rule { margin: 0 20px; }
    .controls-top { flex-direction: column; }
    .search-wrap { min-width: 100%; }
    .loc-row { flex-direction: column; }
  }
`;

// ── Constants ─────────────────────────────────────────────────────────────────
const CUISINES = [
  { label: "Italian",   icon: "🍝", keyword: "italian"    },
  { label: "Japanese",  icon: "🍣", keyword: "japanese"   },
  { label: "Chinese",   icon: "🥢", keyword: "chinese"    },
  { label: "Indian",    icon: "🍛", keyword: "indian"     },
  { label: "Mexican",   icon: "🌮", keyword: "mexican"    },
  { label: "Thai",      icon: "🍜", keyword: "thai"       },
  { label: "Burgers",   icon: "🍔", keyword: "burger"     },
  { label: "Pizza",     icon: "🍕", keyword: "pizza"      },
  { label: "Seafood",   icon: "🦞", keyword: "seafood"    },
  { label: "Vegan",     icon: "🥗", keyword: "vegan"      },
  { label: "Brunch",    icon: "🥞", keyword: "brunch"     },
  { label: "BBQ",       icon: "🔥", keyword: "bbq"        },
];

const PRICE_LABELS = ["$", "$$", "$$$", "$$$$"];

function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371, r = d => d * Math.PI / 180;
  const dLat = r(lat2-lat1), dLon = r(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Waiting for Google Maps…");

  // Search & location
  const [locInput, setLocInput] = useState("");
  const [usingGPS, setUsingGPS] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Grid / sort
  const [gridSize, setGridSize] = useState(5);
  const [sortBy, setSortBy] = useState("rating");

  // Filters (all client-side except searchTerm which goes to API)
  const [activeCuisines, setActiveCuisines] = useState([]);
  const [openNow, setOpenNow] = useState(false);
  const [activePrices, setActivePrices] = useState([]);
  const [minRating, setMinRating] = useState(4);
  const [maxDistance, setMaxDistance] = useState(7);
  const [minReviews, setMinReviews] = useState(300);

  // Refs to avoid stale closures inside fetchGrid
  const geocoderRef = useRef(null);
  const centerRef   = useRef(null);  // always current center
  const gridRef     = useRef(5);
  const searchRef   = useRef("");

  // Keep refs in sync with state
  useEffect(() => { gridRef.current = gridSize; }, [gridSize]);
  useEffect(() => { searchRef.current = searchTerm; }, [searchTerm]);

  // ── Bootstrap: wait for Google Maps, then auto-locate ──
  useEffect(() => {
    const iv = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(iv);
        geocoderRef.current = new window.google.maps.Geocoder();
        gpsLocate();
      }
    }, 500);
  }, []); // eslint-disable-line

  // Re-fetch when grid size or keyword search term changes
  useEffect(() => {
    if (centerRef.current) fetchGrid(centerRef.current);
  }, [gridSize, searchTerm]); // eslint-disable-line

  // ── Location helpers ──────────────────────────────────────────────────────
  const gpsLocate = () => {
    setUsingGPS(true);
    setLoading(true);
    setStatusMsg("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        centerRef.current = c;
        fetchGrid(c);
      },
      () => { setLoading(false); setStatusMsg("Location access denied."); }
    );
  };

  const geocodeAddress = () => {
    const query = locInput.trim();
    if (!query || !geocoderRef.current) return;
    setUsingGPS(false);
    setLoading(true);
    setStatusMsg(`Searching "${query}"…`);
    geocoderRef.current.geocode({ address: query }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        const c = { lat: loc.lat(), lng: loc.lng() };
        centerRef.current = c;
        fetchGrid(c);
      } else {
        setLoading(false);
        setStatusMsg(`Address not found: "${query}". Try being more specific.`);
      }
    });
  };

  // ── Core fetch — reads from refs so it never has stale values ─────────────
  const fetchGrid = useCallback(async (c) => {
    setLoading(true);
    const gs = gridRef.current;
    const kw = searchRef.current || undefined; // only free-text keyword hits the API
                                               // cuisine chips filter client-side → more results
    setStatusMsg(`Scanning ${gs}×${gs} grid…`);

    const map = new window.google.maps.Map(document.createElement("div"));
    const svc = new window.google.maps.places.PlacesService(map);
    const half = Math.floor(gs / 2);

    const promises = [];
    for (let la = -half; la <= half; la++)
      for (let lo = -half; lo <= half; lo++)
        promises.push(new Promise(res => {
          svc.nearbySearch(
            {
              location: { lat: c.lat + la * 0.01, lng: c.lng + lo * 0.01 },
              radius: 1500,
              type: "restaurant",
              keyword: kw,
              // intentionally NOT passing openNow to API — filter client-side
              // so places with missing hours_data are not silently dropped
            },
            (results, status) =>
              res(status === window.google.maps.places.PlacesServiceStatus.OK ? results : [])
          );
        }));

    const all = (await Promise.all(promises)).flat();
    const uniq = {};
    all.forEach(r => { uniq[r.place_id] = r; });

    setRestaurants(
      Object.values(uniq).map(p => ({
        ...p,
        distance: calcDist(c.lat, c.lng, p.geometry.location.lat(), p.geometry.location.lng()),
        isOpen: p.opening_hours?.open_now ?? null,
        // Normalise types to lowercase strings for cuisine matching
        placeTypes: (p.types || []).map(t => t.toLowerCase()),
      }))
    );
    setLoading(false);
  }, []); // stable — reads from refs, not state

  // ── Client-side filtering ─────────────────────────────────────────────────
  // Cuisine chips: match against the `types` array Google returns per place.
  // Each CUISINE entry has a `typeMatch` substring we look for in place.types.
  const filtered = restaurants
    .filter(r => (r.rating || 0) >= minRating)
    .filter(r => r.distance <= maxDistance)
    .filter(r => (r.user_ratings_total || 0) >= minReviews)
    .filter(r => !openNow || r.isOpen === true)
    .filter(r => activePrices.length === 0 || activePrices.includes(r.price_level))
    .filter(r => {
      if (activeCuisines.length === 0) return true;
      // Match if any active cuisine keyword appears in the place's name or types
      return activeCuisines.some(label => {
        const cu = CUISINES.find(c => c.label === label);
        if (!cu) return false;
        const kw = cu.keyword.toLowerCase();
        return (
          r.name?.toLowerCase().includes(kw) ||
          r.placeTypes.some(t => t.includes(kw)) ||
          r.vicinity?.toLowerCase().includes(kw)
        );
      });
    });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating")  return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "reviews") return (b.user_ratings_total || 0) - (a.user_ratings_total || 0);
    return a.distance - b.distance;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const sp = (v, min, max) => ({ "--p": `${((v - min) / (max - min)) * 100}%` });
  const toggleCuisine = label => setActiveCuisines(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  const togglePrice   = idx   => setActivePrices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);

  const activeFilterTags = [
    ...(openNow ? ["Open Now"] : []),
    ...(activePrices.map(i => PRICE_LABELS[i])),
    ...activeCuisines,
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="eyebrow">Restaurant Radar</div>
          <h1>Find the <em>best</em><br />spots near you</h1>
          <p className="header-sub">
            Grid search · Real-time · Google Places — {restaurants.length} venues indexed
          </p>
        </header>

        {/* Controls */}
        <section className="controls">

          {/* ① Location row */}
          <div className="loc-row">
            <div className="loc-wrap">
              <span className="loc-icon">◎</span>
              <input
                className="loc-input"
                placeholder="Enter neighborhood, city, or address…"
                value={locInput}
                onChange={e => setLocInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { setUsingGPS(false); geocodeAddress(); } }}
              />
            </div>
            <button
              className={`loc-mode-btn go-btn`}
              onClick={() => { setUsingGPS(false); geocodeAddress(); }}
            >
              Search
            </button>
            <button
              className={`loc-mode-btn${usingGPS ? " active" : ""}`}
              onClick={() => { setUsingGPS(true); gpsLocate(); }}
              title="Use my current location"
            >
              ⌖ GPS
            </button>
          </div>

          {/* ② Keyword + grid + sort */}
          <div className="controls-top">
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                className="search-input"
                placeholder="Keyword search… press Enter"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") setSearchTerm(searchInput); }}
              />
            </div>
            <select className="sel" value={gridSize} onChange={e => setGridSize(Number(e.target.value))}>
              <option value={3}>3 × 3 — 9 calls</option>
              <option value={5}>5 × 5 — 25 calls</option>
              <option value={7}>7 × 7 — 49 calls</option>
            </select>
            <select className="sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="nearest">Nearest First</option>
            </select>
          </div>

          {/* ③ Cuisine chips */}
          <div className="chips-section">
            <span className="chips-label">Cuisine</span>
            <div className="chips">
              {CUISINES.map(cu => (
                <button
                  key={cu.label}
                  className={`chip${activeCuisines.includes(cu.label) ? " active" : ""}`}
                  onClick={() => toggleCuisine(cu.label)}
                >
                  <span className="chip-icon">{cu.icon}</span>
                  {cu.label}
                </button>
              ))}
            </div>
          </div>

          {/* ④ Open Now + Price */}
          <div className="filter-pills">
            <span className="filter-label">Filters</span>

            {/* Open Now toggle */}
            <div className="toggle-wrap" onClick={() => setOpenNow(v => !v)}>
              <div className={`toggle-track${openNow ? " on" : ""}`}>
                <div className="toggle-thumb" />
              </div>
              <span className="toggle-text">Open Now</span>
            </div>

            {/* Price level pills */}
            <div className="price-pills">
              {PRICE_LABELS.map((label, i) => (
                <button
                  key={i}
                  className={`price-pill${activePrices.includes(i) ? " active" : ""}`}
                  onClick={() => togglePrice(i)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ⑤ Sliders */}
          <div className="sliders">
            <div className="sg">
              <label>Min Rating <span>{minRating.toFixed(1)} ★</span></label>
              <input type="range" min="0" max="5" step="0.1" value={minRating}
                style={sp(minRating, 0, 5)} onChange={e => setMinRating(Number(e.target.value))} />
            </div>
            <div className="sg">
              <label>Max Distance <span>{maxDistance} km</span></label>
              <input type="range" min="0" max="7" step="0.5" value={maxDistance}
                style={sp(maxDistance, 0, 7)} onChange={e => setMaxDistance(Number(e.target.value))} />
            </div>
            <div className="sg">
              <label>Min Reviews <span>{minReviews.toLocaleString()}</span></label>
              <input type="range" min="0" max="10000" step="100" value={minReviews}
                style={sp(minReviews, 0, 10000)} onChange={e => setMinReviews(Number(e.target.value))} />
            </div>
          </div>

        </section>

        <hr className="rule" />

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p className="loading-txt">{statusMsg}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="empty">
            <span className="empty-glyph">∅</span>
            No restaurants match your filters — try loosening the constraints.
          </div>
        ) : (
          <>
            <div className="results-meta">
              <span className="results-count">{sorted.length}</span>
              <span className="results-label">restaurants found</span>
              {activeFilterTags.length > 0 && (
                <div className="results-filters">
                  {activeFilterTags.map(tag => (
                    <span key={tag} className="active-filter">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid">
              {sorted.map((r, i) => (
                <div
                  key={r.place_id}
                  className={`card${i < 3 ? " top" : ""}`}
                  style={{ animationDelay: `${Math.min(i * 0.035, 0.7)}s` }}
                >
                  <span className="rank">{String(i + 1).padStart(2, "0")}</span>

                  <div className="card-top-row">
                    {i < 3 && <span className="badge">Top pick</span>}
                    {r.isOpen === true  && <span className="open-pill open">Open</span>}
                    {r.isOpen === false && <span className="open-pill closed">Closed</span>}
                  </div>

                  <h3 className="card-name">{r.name}</h3>

                  <div className="stats">
                    <div className="stat">
                      <span className="stat-ico">★</span>
                      <span className="stat-val">{r.rating?.toFixed(1)}</span>
                      <span>rating</span>
                    </div>
                    <div className="stat">
                      <span className="stat-ico">◈</span>
                      <span className="stat-val">{(r.user_ratings_total || 0).toLocaleString()}</span>
                      <span>reviews</span>
                    </div>
                    <div className="stat">
                      <span className="stat-ico">◎</span>
                      <span className="stat-val">{r.distance.toFixed(2)} km</span>
                      <span>away</span>
                    </div>
                    {r.price_level != null && (
                      <div className="stat">
                        <span className="stat-ico">◇</span>
                        <span className="stat-val">{PRICE_LABELS[r.price_level]}</span>
                        <span>price</span>
                      </div>
                    )}
                  </div>

                  <div className="bar-wrap">
                    <div className="bar" style={{ width: `${((r.rating || 0) / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}