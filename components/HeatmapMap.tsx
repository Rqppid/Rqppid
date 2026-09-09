"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { SEVERITY_TIERS } from "@/lib/heatmapTypes";
import type { HeatmapPoint } from "@/lib/heatmapTypes";

const NI_CENTER: L.LatLngTuple = [54.62, -6.65];
const NI_INITIAL_ZOOM = 8;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function daysSince(isoDate: string): number | null {
  const recorded = Date.parse(isoDate + "T00:00:00Z");
  if (Number.isNaN(recorded)) return null;
  const todayUtc = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  return Math.max(0, Math.round((todayUtc - recorded) / 86_400_000));
}

function popupHtml(p: HeatmapPoint): string {
  const sourceLabel = p.source === "DFI_SURFACE_DEFECT" ? "DfI Roads (recorded defect)" : "Public enquiry (unconfirmed)";
  const days = p.recordedDate ? daysSince(p.recordedDate) : null;
  const recordedLine =
    p.recordedDate && days !== null
      ? `${p.recordedDate} (${days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`})`
      : "Unknown";
  return `
    <div style="font: 13px system-ui, sans-serif; line-height: 1.5; min-width: 200px;">
      <div style="font-weight: 700; margin-bottom: 2px;">${escapeHtml(p.defectType)}</div>
      <div>Priority: <strong>${escapeHtml(p.severityLabel)}</strong></div>
      <div>Road: ${escapeHtml(p.road)}</div>
      <div>Council: ${escapeHtml(p.council)}</div>
      <div>Recorded: ${escapeHtml(recordedLine)}</div>
      <div>Status: ${escapeHtml(p.status)}</div>
      <div style="margin-top:4px; color:#666;">${escapeHtml(sourceLabel)}</div>
    </div>
  `;
}

export function HeatmapMap({
  points,
  viewMode,
}: {
  points: HeatmapPoint[];
  viewMode: "heat" | "points";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const overlayRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: NI_CENTER,
      zoom: NI_INITIAL_ZOOM,
      minZoom: 7,
      maxZoom: 18,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }

    if (points.length === 0) return;

    if (viewMode === "heat") {
      const heatPoints: [number, number, number][] = points.map((p) => [p.lat, p.lon, p.severityScore / 5]);
      const heat = L.heatLayer(heatPoints, { radius: 14, blur: 18, maxZoom: 15, max: 1 });
      heat.addTo(map);
      overlayRef.current = heat;
    } else {
      const cluster = L.markerClusterGroup({ chunkedLoading: true, spiderfyOnMaxZoom: true, maxClusterRadius: 50 });
      for (const p of points) {
        const color = SEVERITY_TIERS[p.severityScore]?.color ?? "#a1a1aa";
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 6,
          weight: 1,
          color: "#0b1a1c",
          fillColor: color,
          fillOpacity: 0.9,
        });
        marker.bindPopup(popupHtml(p));
        cluster.addLayer(marker);
      }
      cluster.addTo(map);
      overlayRef.current = cluster;
    }
  }, [points, viewMode]);

  return <div ref={containerRef} className="h-full w-full" />;
}
