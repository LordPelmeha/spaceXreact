import { LaunchList } from "./launchList";
import { Map } from "./map";
import { useEffect, useState } from "react";
import { SpaceX } from "../api/spacex";

function App() {
    const [launches, setLaunches] = useState([]);
    const [launchpads, setLaunchpads] = useState([]);
    const [highlighted, setHighlighted] = useState(null);
    const [error, setError] = useState(null);
    const spacex = new SpaceX();

    useEffect(() => {
        let mounted = true;
        setError(null);
        Promise.all([spacex.launches(), spacex.launchpads()])
            .then(([ls, ps]) => {
                if (!mounted) {
                    return;
                }
                const apiValidIds = SpaceX.validPadIds(ps);
                const launchValidIds = SpaceX.validPadIdsFromLaunches(ls);
                const validIds = new Set([...apiValidIds, ...launchValidIds]);
                const valid = SpaceX.filterValidPadLaunches(ls, validIds)
                    .filter(l => l && l.net && new Date(l.net) <= Date.now());
                setLaunches(valid);

                const apiPads = SpaceX.extractLaunchpads(ps);
                const launchPads = SpaceX.extractLaunchpadsFromLaunches(valid);
                const merged = [...apiPads];
                launchPads.forEach(p => {
                    if (!merged.find(existing => existing.id === p.id)) {
                        merged.push(p);
                    }
                });
                setLaunchpads(merged);
            })
            .catch((err) => {
                if (mounted) {
                    setError(err.message);
                }
            });
        return () => {
            mounted = false;
        };
    }, []);

    const retry = () => {
        setError(null);
        Promise.all([spacex.launches(), spacex.launchpads()])
            .then(([ls, ps]) => {
                const apiValidIds = SpaceX.validPadIds(ps);
                const launchValidIds = SpaceX.validPadIdsFromLaunches(ls);
                const validIds = new Set([...apiValidIds, ...launchValidIds]);
                const valid = SpaceX.filterValidPadLaunches(ls, validIds)
                    .filter(l => l && l.net && new Date(l.net) <= Date.now());
                setLaunches(valid);

                const apiPads = SpaceX.extractLaunchpads(ps);
                const launchPads = SpaceX.extractLaunchpadsFromLaunches(valid);
                const merged = [...apiPads];
                launchPads.forEach(p => {
                    if (!merged.find(existing => existing.id === p.id)) {
                        merged.push(p);
                    }
                });
                setLaunchpads(merged);
            })
            .catch((err) => setError(err.message));
    };

    return (
        <main className='main'>
            {error && (
                <div className="error">
                    Could not load data: {error}
                    <button onClick={retry} type="button">Retry</button>
                </div>
            )}
            <LaunchList launches={launches} onHover={id => setHighlighted(id)} />
            <Map launchpads={launchpads} highlighted={highlighted} />
        </main>
    )
}

export { App };
