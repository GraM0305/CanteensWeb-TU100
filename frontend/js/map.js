
"use strict";

// =========================================
// TU Canteen Finder - Dynamic Leaflet Map
// =========================================

const L = window.L;

export const CanteenMap = (() => {

  let map = null;
  let markerGroup = null;
  let watchId = null;
  let userMarker = null;
  let accuracyCircle = null;
  let hasCenteredOnUser = false;
  let touching = false;
  let pendingPosition = null;

  const MAP_CENTER = [14.0735, 100.6050];
  const MAP_ZOOM = 15;


  // Initialize map
  function init() {

    if (map) return;

    map = L.map("map", {
      touchZoom: true,
      dragging: true,
      bounceAtZoomLimits: false
    }).setView(
      MAP_CENTER,
      MAP_ZOOM
    );

    // ระหว่างที่นิ้วแตะแผนที่ ห้ามอัปเดต layer (หมุด/วงกลม) เพราะจะรบกวน pinch-zoom
    // เก็บตำแหน่งล่าสุดไว้ แล้วค่อยวาดเมื่อยกนิ้ว
    const container = map.getContainer();
    const onTouchEnd = event => {
      if (event.touches.length === 0) {
        touching = false;
        flushPosition();
      }
    };
    container.addEventListener("touchstart", () => { touching = true; }, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

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


  // ===== ตำแหน่งผู้ใช้แบบ real time (อยู่ในเบราว์เซอร์เท่านั้น) =====
  function startTracking({ onUpdate, onError } = {}) {

    if (!map || watchId !== null) return;

    if (!("geolocation" in navigator)) {
      onError?.("UNSUPPORTED");
      return;
    }

    hasCenteredOnUser = false;

    watchId = navigator.geolocation.watchPosition(
      position => {
        pendingPosition = position;
        onPositionUpdate = onUpdate;
        if (!touching) flushPosition();
      },
      error => {
        const code =
          error.code === 1 ? "DENIED" :
          error.code === 2 ? "UNAVAILABLE" : "TIMEOUT";

        // ปฏิเสธสิทธิ์ = หยุดติดตาม; ข้อผิดพลาดอื่นให้ลองต่อ
        if (code === "DENIED") stopTracking();

        onError?.(code);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000
      }
    );

  }


  let onPositionUpdate = null;

  function flushPosition() {

    const position = pendingPosition;
    pendingPosition = null;

    if (!position || !map || watchId === null) return;

    {
        const latlng = [
          position.coords.latitude,
          position.coords.longitude
        ];

        if (!userMarker) {
          userMarker = L.marker(latlng, {
            icon: L.divIcon({
              className: "user-location-marker",
              html: '<div class="user-location-dot"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            }),
            title: "ตำแหน่งของคุณ",
            alt: "ตำแหน่งของคุณ",
            zIndexOffset: 1000,
            interactive: false,
            keyboard: false
          }).addTo(map);

          accuracyCircle = L.circle(latlng, {
            radius: position.coords.accuracy,
            color: "#f97316",
            weight: 1,
            fillColor: "#f97316",
            fillOpacity: 0.12,
            interactive: false
          }).addTo(map);
        } else {
          userMarker.setLatLng(latlng);
          accuracyCircle.setLatLng(latlng);
          accuracyCircle.setRadius(position.coords.accuracy);
        }

        // เลื่อนแผนที่ไปหาผู้ใช้เฉพาะครั้งแรกเท่านั้น
        if (!hasCenteredOnUser) {
          hasCenteredOnUser = true;
          map.setView(latlng, Math.max(map.getZoom(), 17), { animate: false });
        }

        onPositionUpdate?.({
          latitude: latlng[0],
          longitude: latlng[1],
          accuracy: position.coords.accuracy
        });
    }

  }


  function stopTracking() {

    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }

    pendingPosition = null;
    userMarker?.remove();
    accuracyCircle?.remove();
    userMarker = null;
    accuracyCircle = null;

  }


  function isTracking() {
    return watchId !== null;
  }


  return {
    init,
    renderMarkers,
    focus,
    startTracking,
    stopTracking,
    isTracking
  };

})();
