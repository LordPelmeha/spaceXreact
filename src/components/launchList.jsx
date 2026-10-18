function LaunchList({ launches, launchPadId, hoveredPadId, onHover, onClear }) {
    return (
        <aside className="aside" id="launchesContainer">
            <h3>Launches</h3>
            <div id="listContainer">
                <ul>
                    {launches.map(launch => {
                        const padId = launchPadId(launch);
                        const active = padId === hoveredPadId;
                        return (
                            <li
                                key={launch.id}
                                className={active ? "launch-item active" : "launch-item"}
                                onMouseEnter={() => onHover(padId)}
                                onMouseLeave={onClear}
                            >
                                {launch.name}
                                {padId ? <span className="pad-label">({padId})</span> : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </aside>
    );
}

export { LaunchList };
