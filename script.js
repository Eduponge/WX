// IDs para nomes dos aeroportos
const LOCATION_NAMES = ["GRU", "CGH", "VCP"];

// Campos a exibir na tabela (header, chave na API, unidade)
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

const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=-23.43555556,-23.62611111,-23.00694444&longitude=-46.47305556,-46.65638889,-47.13444444&hourly=visibility,temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,weather_code,pressure_msl,cloud_cover,surface_pressure,cloud_cover_low,cloud_cover_mid,cloud_cover_high,wind_speed_10m,wind_speed_80m,wind_direction_10m,wind_direction_80m,wind_gusts_10m,temperature_80m,surface_temperature,is_day,sunshine_duration,wet_bulb_temperature_2m,thunderstorm_probability,rain_probability,freezing_rain_probability,ice_pellets_probability,convective_inhibition,freezing_level_height,boundary_layer_height&models=gfs_seamless&timezone=America%2FSao_Paulo&forecast_hours=24&past_hours=24";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("tables-container");
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro de resposta da API.");
        const data = await response.json();
        if (!data.hourly) throw new Error("Dados inesperados da API.");

        // Gerar tabela para cada localização
        for (let loc = 0; loc < LOCATION_NAMES.length; loc++) {
            container.appendChild(makeTableSection(data, loc));
        }
    } catch (err) {
        container.innerHTML = `<div style="color:red;text-align:center;">Erro ao carregar dados: ${err.message}</div>`;
    }
});

function makeTableSection(data, locIdx) {
    const section = document.createElement("div");
    section.className = "table-section";
    section.innerHTML = `<h2>${LOCATION_NAMES[locIdx]}</h2>`;

    // Gera tabela
    const table = document.createElement("table");
    // Cabeçalho
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>${FIELDS.map(f => `<th>${f.label}</th>`).join("")}</tr>`;
    table.appendChild(thead);

    // Linhas
    const tbody = document.createElement("tbody");
    const times = data.hourly.time;
    // Considera que todos os campos têm o mesmo número de entradas e ordem
    for (let i = 0; i < times.length; i++) {
        const row = document.createElement("tr");
        row.innerHTML = FIELDS.map(f => {
            let value;
            if (f.key === "time") {
                // Remove o 'T'
                value = times[i].replace("T", " ");
            } else if (Array.isArray(data.hourly[f.key])) {
                // Se o campo é por localização, pega do locIdx
                if (Array.isArray(data.hourly[f.key][i])) {
                    value = data.hourly[f.key][i][locIdx];
                } else if (data.hourly[f.key].length === times.length * LOCATION_NAMES.length) {
                    // Caso a API retorne dados intercalados por localização
                    value = data.hourly[f.key][i * LOCATION_NAMES.length + locIdx];
                } else {
                    // Caso normal (por localização)
                    value = data.hourly[f.key][i][locIdx];
                }
            } else {
                value = "-";
            }
            // Unidade
            return `<td>${value !== undefined && value !== null ? value + (f.unit ? " " + f.unit : "") : "-"}</td>`;
        }).join("");
        tbody.appendChild(row);
    }
    table.appendChild(tbody);
    section.appendChild(table);
    return section;
}