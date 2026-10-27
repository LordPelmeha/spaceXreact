const CACHE_TTL = 1000 * 60 * 60;
const cache = new Map();

function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() < entry.expiry) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCached(key, data) {
    cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

async function fetchJson(url) {
    const cached = getCached(url);
    if (cached !== null) {
        return cached;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API error ${response.status} for ${url}`);
    }
    const data = await response.json();
    setCached(url, data);
    return data;
}

function padCoords(pad) {
    if (!pad) {
        return null;
    }
    const location = pad.location || {};
    const latitude = pad.latitude != null ? pad.latitude : location.latitude;
    const longitude = pad.longitude != null ? pad.longitude : location.longitude;
    if (latitude == null || longitude == null) {
        return null;
    }
    return { latitude: Number(latitude), longitude: Number(longitude) };
}

class SpaceX {
    constructor(baseUrl = "https://ll.thespacedevs.com/2.3.0/") {
        this.baseUrl = baseUrl;
    }

    async launches() {
        const allResults = [];
        let url = `${this.baseUrl}launches/?lsp__id=121&limit=100&ordering=-net`;
        while (url) {
            const data = await fetchJson(url);
            const results = data.results != null ? data.results : data;
            allResults.push(...results);
            url = data.next;
        }
        return allResults;
    }

    async launchpads() {
        const data = await fetchJson(
            `${this.baseUrl}pads/?agencies_ids=121`
        );
        return data.results != null ? data.results : data;
    }

    static validPadIds(launchpads) {
        return new Set(launchpads.filter(pad => padCoords(pad)).map(pad => pad.id));
    }

    static filterValidPadLaunches(launches, validPadIds) {
        return launches.filter(launch => launch && launch.pad && validPadIds.has(launch.pad.id));
    }

    static extractLaunchpads(launchpads) {
        return launchpads
            .filter(pad => padCoords(pad))
            .map(pad => {
                const c = padCoords(pad);
                return {
                    id: pad.id,
                    name: pad.name,
                    latitude: c.latitude,
                    longitude: c.longitude,
                };
            });
    }

    static extractLaunchpadsFromLaunches(launches) {
        const seen = new Set();
        return launches
            .filter(l => l && l.pad && l.pad.latitude != null && l.pad.longitude != null)
            .filter(l => {
                if (seen.has(l.pad.id)) {
                    return false;
                }
                seen.add(l.pad.id);
                return true;
            })
            .map(l => {
                const p = l.pad;
                return {
                    id: p.id,
                    name: p.name,
                    latitude: Number(p.latitude),
                    longitude: Number(p.longitude),
                };
            });
    }

    static validPadIdsFromLaunches(launches) {
        return new Set(
            launches
                .filter(l => l && l.pad && l.pad.latitude != null && l.pad.longitude != null)
                .map(l => l.pad.id)
        );
    }
}

export { SpaceX };
