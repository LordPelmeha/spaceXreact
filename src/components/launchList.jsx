function LaunchList({ launches = [], onHover }) {
    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>
            <div id="listContainer">
                <ul>
                    {launches.map(launch => {
                        const pad = launch && launch.pad;
                        const padId = pad ? pad.id : null;
                        const rocketName = launch.name.split(" | ")[0];
                        return {
                            launch,
                            pad,
                            padId,
                            rocketName,
                        };
                    })
                    .reduce((unique, item) => {
                        const key = item.rocketName + "||" + (item.padId || "");
                        if (!unique.some(u => u.key === key)) {
                            unique.push({ ...item, key });
                        }
                        return unique;
                    }, [])
                    .map(({ launch, pad, padId, rocketName }) => {
                        return (
                            <li
                                key={launch.id}
                                data-pad={padId || ""}
                                onMouseEnter={() => onHover && onHover(padId)}
                                onMouseLeave={() => onHover && onHover(null)}
                                style={{
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                }}
                            >
                                {rocketName}
                                {padId && ` — ${pad.name || ""}`}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    )
}

export { LaunchList }
