const LOCATIONS = [
    {
        name: "GRU",
        latitude: -23.43555556,
        longitude: -46.47305556
    },
    {
        name: "CGH",
        latitude: -23.62611111,
        longitude: -46.65638889
    },
    {
        name: "VCP",
        latitude: -23.00694444,
        longitude: -47.13444444
    }
];

const FIELDS = [
    { label: "Hora", key: "time", unit: "" },
    { label: "Visibilidade (m)", key: "visibility", unit: "m" },
    { label: "Temp. Aparente (°C)", key: "apparent_temperature", unit: "°C" },
    { label: "Prob. Precipitação (%)", key: "precipitation_probability", unit: "%" },
    { label: "Precipitação (mm)", key: "precipitation", unit: "mm" },
    { label: "Pancadas (mm)", key: "showers", unit: "mm" },
    { label: "Weather Code", key: "weather_code", unit: "" },
    { label: "Nuvens (%)", key: "cloud_cover", unit: "%" },
    { label: "Nuvens Baixas (%)", key: "cloud_cover_low", unit: "%" },
    { label: "Vento 80m (km/h)", key: "wind_speed_80m", unit: "km/h" },
    { label: "Dir. Vento 80m (°)", key: "wind_direction_80m", unit: "°" },
];

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const PARAMS =
    "hourly=visibility,apparent_temperature,precipitation_probability,precipitation,showers,weather_code,cloud_cover,cloud_cover_low,wind_speed_80m,wind_direction_80m" +
    "&models=gfs_seamless&timezone=America%2FSao_Paulo&forecast_hours=24&past_hours=24";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("tables-container");
    container.innerHTML = "<div style='text-align:center;'>Carregando...</div>";
    try {
        const tables = await Promise.all(
            LOCATIONS.map(loc => fetchLocationDataAndTable(loc))
        );
        container.innerHTML = "";
        tables.forEach(tableSection => container.appendChild(tableSection));
    } catch (err) {
        container.innerHTML = `<div style="color:red;text-align:center;">Erro ao carregar dados: ${err.message}</div>`;
    }
});

async function fetchLocationDataAndTable(location) {
    const url = `${BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&${PARAMS}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ao buscar dados para ${location.name}`);
    const data = await response.json();
    return makeTableSection(data, location.name);
}

function makeTableSection(data, locationName) {
    const section = document.createElement("div");
    section.className = "table-section";
    section.innerHTML = `<h2>${locationName}</h2>`;

    const table = document.createElement("table");
    // Cabeçalho
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>${FIELDS.map(f => `<th>${f.label}</th>`).join("")}</tr>`;
    table.appendChild(thead);

    // Linhas
    const tbody = document.createElement("tbody");
    const times = data.hourly.time;
    for (let i = 0; i < times.length; i++) {
        const row = document.createElement("tr");
        row.innerHTML = FIELDS.map(f => {
            let value;
            if (f.key === "time") {
                value = times[i].replace("T", " ");
            } else if (Array.isArray(data.hourly[f.key])) {
                value = data.hourly[f.key][i];
            } else {
                value = "-";
            }
            return `<td>${value !== undefined && value !== null ? value + (f.unit ? " " + f.unit : "") : "-"}</td>`;
        }).join("");
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    section.appendChild(table);
    return section;
}