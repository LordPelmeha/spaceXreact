import * as d3 from "d3";
import * as Geo from "../geo.json";
import { useMemo } from "react";

function Map({ launchpads, hoveredPadId }) {
    const width = 1000;
    const height = 600;

    const projection = useMemo(() => {
        return d3
            .geoMercator()
            .scale(130)
            .center([0, 20])
            .translate([width / 2, height / 2]);
    }, []);

    const path = d3.geoPath().projection(projection);

    const project = ([lon, lat]) => {
        const p = projection([lon, lat]);
        return p ? [p[0], p[1]] : null;
    };

    return (
        <div className="mapContainer map">
            <svg width={width} height={height} className="map-svg">
                {Geo.features.map(feature => (
                    <path
                        key={feature.id}
                        className="topo"
                        d={path(feature)}
                    />
                ))}
                {launchpads.map(pad => {
                    const pos = pad.latitude != null && pad.longitude != null
                        ? project([pad.longitude, pad.latitude])
                        : null;
                    if (!pos) return null;
                    const highlighted = pad.id === hoveredPadId;
                    return (
                        <circle
                            key={pad.id}
                            className={`launchpad ${highlighted ? "highlighted" : ""}`}
                            cx={pos[0]}
                            cy={pos[1]}
                            r={highlighted ? 8 : 5}
                        />
                    );
                })}
            </svg>
        </div>
    );
}

export { Map };
