import * as d3 from "d3";
import * as Geo from "../geo.json";
import { useRef, useEffect } from "react";

function Map({ launchpads = [], highlighted = null }) {
    const width = 1000;
    const height = 600;
    const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 100,
    };
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        let svg = d3.select(container).select("svg").node()
            ? d3.select(container).select("svg")
            : null;
        if (!svg) {
            svg = d3.select(container).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
            svg.append("g").attr("class", "map-g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            svg.append("g").attr("class", "pins-g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            const zoom = d3.zoom()
                .scaleExtent([1, 8])
                .on("zoom", (event) => {
                    svg.selectAll("g").attr("transform", event.transform);
                });
            svg.call(zoom);
        }

        const g = svg.select(".map-g");
        const projection = d3.geoMercator()
            .scale(70)
            .center([0, 20])
            .translate([width / 2 - margin.left, height / 2 - margin.top]);
        const path = d3.geoPath().projection(projection);

        g.selectAll("path")
            .data(Geo.features)
            .join("path")
            .attr("class", "topo")
            .attr("d", path)
            .style("opacity", 0.7);

        const projX = (d) => {
            const p = projection([d.longitude, d.latitude]);
            return p ? p[0] : 0;
        };
        const projY = (d) => {
            const p = projection([d.longitude, d.latitude]);
            return p ? p[1] : 0;
        };

        const pins = svg.select(".pins-g");
        pins.selectAll("circle")
            .data(launchpads, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("class", d => (d.id === highlighted ? "pin highlighted" : "pin"))
                    .attr("r", 5)
                    .attr("fill", d => (d.id === highlighted ? "#d62728" : "#1f77b4"))
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                    .attr("cx", projX)
                    .attr("cy", projY),
                update => update
                    .attr("class", d => (d.id === highlighted ? "pin highlighted" : "pin"))
                    .attr("r", d => (d.id === highlighted ? 8 : 5))
                    .attr("fill", d => (d.id === highlighted ? "#d62728" : "#1f77b4"))
                    .attr("cx", projX)
                    .attr("cy", projY),
                exit => exit.remove()
            );
    }, [launchpads, highlighted]);

    return (
        <div className="mapContainer map" ref={containerRef}>
        </div>
    )
}

export { Map };
