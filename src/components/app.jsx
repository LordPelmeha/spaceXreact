import { LaunchList } from "./launchList";
import { Map } from "./map";
import { useEffect, useState, useRef } from "react";
import { SpaceX } from "../api/spacex";

function App() {
    const [launches, setLaunches] = useState([]);
    const [launchpads, setLaunchpads] = useState([]);
    const [hoveredPadId, setHoveredPadId] = useState(null);
    const clearTimeoutRef = useRef(null);
    const spacex = new SpaceX();

    useEffect(() => {
        let mounted = true;
        spacex.launches().then(data => {
            if (mounted) setLaunches(data);
        });
        spacex.launchpads().then(data => {
            if (mounted) setLaunchpads(data);
        });
        return () => { mounted = false; };
    }, []);

    const padById = {};
    launchpads.forEach(pad => {
        padById[pad.id] = pad;
    });

    const launchPadId = launch => {
        const pad = launch.pad || {};
        return pad.id || null;
    };

    const uniquePads = [];
    const seen = new Set();
    launches.forEach(launch => {
        const id = launchPadId(launch);
        if (id && !seen.has(id)) {
            seen.add(id);
            const pad = padById[id] || {};
            if (!pad.latitude && launch.pad && launch.pad.latitude != null) {
                uniquePads.push({
                    id,
                    name: pad.name || (launch.pad && launch.pad.name),
                    latitude: launch.pad.latitude,
                    longitude: launch.pad.longitude,
                });
            } else {
                uniquePads.push(pad || { id, name: launch.pad && launch.pad.name });
            }
        }
    });

    const handleHover = id => {
        if (clearTimeoutRef.current) {
            clearTimeout(clearTimeoutRef.current);
            clearTimeoutRef.current = null;
        }
        setHoveredPadId(id);
    };

    const handleClear = () => {
        clearTimeoutRef.current = setTimeout(() => {
            setHoveredPadId(null);
            clearTimeoutRef.current = null;
        }, 150);
    };

    return (
        <main className="main">
            <LaunchList
                launches={launches}
                launchPadId={launchPadId}
                hoveredPadId={hoveredPadId}
                onHover={handleHover}
                onClear={handleClear}
            />
            <Map launchpads={uniquePads} hoveredPadId={hoveredPadId} />
        </main>
    );
}

export { App };
