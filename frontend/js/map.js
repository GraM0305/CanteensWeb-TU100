
"use strict";

// =========================================
// TU Canteen Finder - Dynamic Leaflet Map
// =========================================

const L = window.L;

export const CanteenMap = (() => {

  let map = null;
  let markerGroup = null;

  const MAP_CENTER = [14.0735, 100.6050];
  const MAP_ZOOM = 15;


  // Initialize map
  function init() {

    if (map) return;

    map = L.map("map").setView(
      MAP_CENTER,
      MAP_ZOOM
    );

    L.tileLayer(
      "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors, tiles &copy; openstreetmap.de"
      }
    ).addTo(map);


    // Cluster overlapping markers
    markerGroup = L.markerClusterGroup({

      maxClusterRadius: 8,

      spiderfyOnMaxZoom: true,

      spiderfyDistanceMultiplier: 1.5,

      zoomToBoundsOnClick: false,

      showCoverageOnHover: false,

      spiderLegPolylineOptions: {
        weight: 1.5,
        color: "#64748b",
        opacity: 0.7
      }

    });


    // Click cluster to separate overlapping markers
    markerGroup.on("clusterclick", event => {
      event.layer.spiderfy();
    });

    map.addLayer(markerGroup);

  }


  // Build marker popup
  function createPopup(canteen) {

    const container = document.createElement("div");
    container.className = "map-popup";

    const title = document.createElement("h3");
    title.className = "map-popup__title";
    title.textContent = canteen.name;

    const description = document.createElement("p");
    description.className = "map-popup__description";
    description.textContent =
      canteen.description || "ไม่มีรายละเอียด";


    const periodLabels = {
      DAY: "☀️ ช่วงกลางวัน",
      NIGHT: "🌙 ช่วงกลางคืน",
      ALL: "🕒 ทุกช่วงเวลา"
    };

    const period = document.createElement("p");
    period.className = "map-popup__period";
    period.textContent =
      periodLabels[canteen.operating_period] || "ไม่ระบุช่วงเวลา";


    const link = document.createElement("a");

    link.href =
      `canteen.html?id=${encodeURIComponent(canteen.id)}`;

    link.textContent = "ดูข้อมูลโรงอาหารและร้านค้าภายใน →";

    link.className = "map-popup__link";


    container.append(
      title,
      description,
      period,
      link
    );

    return container;

  }


  // Render all canteen markers from RDS API data
  function renderMarkers(canteens) {

    if (!map || !markerGroup) return;

    markerGroup.clearLayers();


    const markers = [];

    canteens.forEach(canteen => {

      const latitude = Number(canteen.latitude);
      const longitude = Number(canteen.longitude);

      // Validate GPS coordinates
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        console.warn(
          "Invalid coordinates:",
          canteen.id,
          canteen.name
        );
        return;
      }


      const marker = L.marker(
        [latitude, longitude],
        {
          title: canteen.name,
          alt: canteen.name
        }
      );

      marker.bindPopup(
        createPopup(canteen),
        {
          maxWidth: 260
        }
      );

      markers.push(marker);

    });


    markerGroup.addLayers(markers);


    // Fit map to all markers
    if (markers.length > 0) {

      const bounds = markerGroup.getBounds();

      if (bounds.isValid()) {

        map.fitBounds(
          bounds,
          {
            padding: [40, 40],
            maxZoom: 16
          }
        );

      }

    }

    console.log(
      `Rendered ${markers.length} canteen markers`
    );

  }


  // Focus on a canteen
  function focus(canteen) {

    if (!map || !canteen) return;

    const latitude = Number(canteen.latitude);
    const longitude = Number(canteen.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    map.flyTo(
      [latitude, longitude],
      17,
      {
        duration: 1
      }
    );

  }


  return {
    init,
    renderMarkers,
    focus
  };

})();
