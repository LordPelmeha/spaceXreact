const PROXY_BASE = "http://localhost:3001/proxy";

const CACHE_TTL = 60 * 60 * 1000;
const cache = new Map();

function cacheKey(url) {
    return 'spacex-cache:' + url;
}

function readCache(url) {
    const entry = cache.get(cacheKey(url));
    if (entry && entry.expires > Date.now()) return entry.value;
    return null;
}

function writeCache(url, value) {
    cache.set(cacheKey(url), { value: value, expires: Date.now() + CACHE_TTL });
}

async function cachedFetch(url) {
    const cached = readCache(url);
    if (cached) return cached;
    const response = await fetch(url);
    if (!response.ok) throw new Error("request failed: " + response.status);
    const data = await response.json();
    writeCache(url, data);
    return data;
}

class SpaceX {
    constructor(launchesUrl = `${PROXY_BASE}/launches`, padsUrl = `${PROXY_BASE}/pads`) {
        this.launchesUrl = launchesUrl;
        this.padsUrl = padsUrl;
    }

    launches() {
        return cachedFetch(this.launchesUrl)
            .then(data => Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
            .catch(() => []);
    }

    launchpads() {
        return cachedFetch(this.padsUrl)
            .then(data => Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []))
            .catch(() => []);
    }
}

export { SpaceX };
