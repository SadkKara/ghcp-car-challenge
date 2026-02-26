"use strict";

const resorts = Object.freeze([
	{
		id: "chamonix",
		name: "Chamonix",
		country: "France",
		latitude: 45.9237,
		longitude: 6.8694,
		elevation: 1035,
	},
	{
		id: "verbier",
		name: "Verbier",
		country: "Suisse",
		latitude: 46.0968,
		longitude: 7.2286,
		elevation: 1500,
	},
	{
		id: "zermatt",
		name: "Zermatt",
		country: "Suisse",
		latitude: 46.0207,
		longitude: 7.7491,
		elevation: 1620,
	},
]);

const weatherMap = {
	0: { label: "Ciel dégagé", icon: "☀️" },
	1: { label: "Plutôt dégagé", icon: "🌤️" },
	2: { label: "Partiellement nuageux", icon: "⛅" },
	3: { label: "Couvert", icon: "☁️" },
	45: { label: "Brouillard", icon: "🌫️" },
	48: { label: "Brouillard givrant", icon: "🌫️" },
	51: { label: "Bruine légère", icon: "🌦️" },
	53: { label: "Bruine", icon: "🌦️" },
	55: { label: "Bruine forte", icon: "🌧️" },
	56: { label: "Bruine verglaçante", icon: "🌧️" },
	57: { label: "Bruine verglaçante forte", icon: "🌧️" },
	61: { label: "Pluie légère", icon: "🌧️" },
	63: { label: "Pluie", icon: "🌧️" },
	65: { label: "Pluie forte", icon: "🌧️" },
	66: { label: "Pluie verglaçante", icon: "🌧️" },
	67: { label: "Pluie verglaçante forte", icon: "🌧️" },
	71: { label: "Neige légère", icon: "🌨️" },
	73: { label: "Neige", icon: "❄️" },
	75: { label: "Neige forte", icon: "❄️" },
	77: { label: "Grains de neige", icon: "❄️" },
	80: { label: "Averses légères", icon: "🌦️" },
	81: { label: "Averses", icon: "🌧️" },
	82: { label: "Averses fortes", icon: "⛈️" },
	85: { label: "Averses de neige", icon: "🌨️" },
	86: { label: "Fortes averses de neige", icon: "❄️" },
	95: { label: "Orage", icon: "⛈️" },
	96: { label: "Orage grêle légère", icon: "⛈️" },
	99: { label: "Orage grêle forte", icon: "⛈️" },
};

const gridElement = document.getElementById("resortGrid");
const statusElement = document.getElementById("statusMessage");
const refreshButton = document.getElementById("refreshButton");

function weatherInfo(code) {
	return weatherMap[code] ?? { label: "Conditions inconnues", icon: "❔" };
}

function snowLevelClass(depth) {
	if (depth >= 100) {
		return "snow-good";
	}

	if (depth >= 40) {
		return "snow-medium";
	}

	return "snow-low";
}

function setStatus(message) {
	statusElement.textContent = message;
}

function clearGrid() {
	while (gridElement.firstChild) {
		gridElement.removeChild(gridElement.firstChild);
	}
}

function buildMetricRow(label, value, valueClass = "") {
	const row = document.createElement("li");
	row.className = "metric-row";

	const key = document.createElement("span");
	key.className = "metric-key";
	key.textContent = label;

	const metricValue = document.createElement("span");
	metricValue.className = `metric-value ${valueClass}`.trim();
	metricValue.textContent = value;

	row.append(key, metricValue);
	return row;
}

function buildResortCard(resort, weatherData) {
	const card = document.createElement("article");
	card.className = "resort-card";
	card.setAttribute("aria-label", `Météo ${resort.name}`);

	const top = document.createElement("div");
	top.className = "resort-top";

	const titleWrap = document.createElement("div");
	const title = document.createElement("h2");
	title.className = "resort-title";
	title.textContent = resort.name;

	const subtitle = document.createElement("p");
	subtitle.className = "resort-subtitle";
	subtitle.textContent = `${resort.country} • Alt. ${resort.elevation} m`;
	titleWrap.append(title, subtitle);

	const weatherIndicator = document.createElement("p");
	weatherIndicator.className = "weather-indicator";
	const icon = document.createElement("span");
	icon.className = "weather-icon";
	icon.textContent = weatherData.current.icon;
	icon.setAttribute("aria-hidden", "true");
	const label = document.createElement("span");
	label.textContent = weatherData.current.label;
	weatherIndicator.append(icon, label);

	top.append(titleWrap, weatherIndicator);

	const metrics = document.createElement("ul");
	metrics.className = "metric-list";
	metrics.append(
		buildMetricRow("Température", `${weatherData.current.temperature.toFixed(1)}°C`),
		buildMetricRow("Vent", `${Math.round(weatherData.current.wind)} km/h`),
		buildMetricRow("Neige aujourd'hui", `${weatherData.todaySnowfall.toFixed(1)} cm`),
		buildMetricRow(
			"Hauteur de neige",
			`${weatherData.currentSnowDepth.toFixed(0)} cm`,
			snowLevelClass(weatherData.currentSnowDepth)
		)
	);

	card.append(top, metrics);
	return card;
}

function buildErrorCard(resort, message) {
	const card = document.createElement("article");
	card.className = "resort-card card-error";

	const title = document.createElement("h2");
	title.className = "resort-title";
	title.textContent = resort.name;

	const subtitle = document.createElement("p");
	subtitle.className = "resort-subtitle";
	subtitle.textContent = `${resort.country} • Données indisponibles`;

	const details = document.createElement("p");
	details.className = "status-message";
	details.textContent = message;

	card.append(title, subtitle, details);
	return card;
}

async function fetchResortWeather(resort) {
	const endpoint = new URL("https://api.open-meteo.com/v1/forecast");
	endpoint.searchParams.set("latitude", String(resort.latitude));
	endpoint.searchParams.set("longitude", String(resort.longitude));
	endpoint.searchParams.set("current", "temperature_2m,weather_code,wind_speed_10m");
	endpoint.searchParams.set("daily", "snowfall_sum");
	endpoint.searchParams.set("hourly", "snow_depth");
	endpoint.searchParams.set("timezone", "auto");
	endpoint.searchParams.set("forecast_days", "1");

	const controller = new AbortController();
	const timeoutId = window.setTimeout(() => controller.abort(), 10000);

	try {
		const response = await fetch(endpoint, {
			method: "GET",
			signal: controller.signal,
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Réponse API invalide (${response.status})`);
		}

		const data = await response.json();

		const current = data?.current;
		const daily = data?.daily;
		const hourly = data?.hourly;

		if (!current || !daily || !hourly) {
			throw new Error("Réponse météo incomplète");
		}

		const weather = weatherInfo(current.weather_code);
		const snowfall = Number(daily.snowfall_sum?.[0] ?? 0);

		const currentTime = current.time;
		const hourlyTimes = Array.isArray(hourly.time) ? hourly.time : [];
		const snowDepthValues = Array.isArray(hourly.snow_depth) ? hourly.snow_depth : [];
		const timeIndex = hourlyTimes.indexOf(currentTime);
		const rawDepth = timeIndex >= 0 ? snowDepthValues[timeIndex] : snowDepthValues[0];
		const currentSnowDepth = Number.isFinite(rawDepth) ? Number(rawDepth) : 0;

		return {
			current: {
				temperature: Number(current.temperature_2m),
				wind: Number(current.wind_speed_10m),
				label: weather.label,
				icon: weather.icon,
			},
			todaySnowfall: Number.isFinite(snowfall) ? snowfall : 0,
			currentSnowDepth,
		};
	} finally {
		window.clearTimeout(timeoutId);
	}
}

async function loadWeather() {
	refreshButton.disabled = true;
	setStatus("Mise à jour des conditions en cours…");
	clearGrid();

	const fetchTasks = resorts.map(async (resort) => {
		try {
			const data = await fetchResortWeather(resort);
			return { resort, data, error: null };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Erreur inconnue";
			return { resort, data: null, error: message };
		}
	});

	const results = await Promise.all(fetchTasks);
	let successCount = 0;

	for (const result of results) {
		if (result.error) {
			gridElement.appendChild(buildErrorCard(result.resort, result.error));
			continue;
		}

		successCount += 1;
		gridElement.appendChild(buildResortCard(result.resort, result.data));
	}

	if (successCount === resorts.length) {
		setStatus(`Dernière mise à jour: ${new Date().toLocaleTimeString("fr-CH")}`);
	} else if (successCount > 0) {
		setStatus(`Données partielles: ${successCount}/${resorts.length} stations mises à jour.`);
	} else {
		setStatus("Impossible de charger les données météo pour le moment.");
	}

	refreshButton.disabled = false;
}

refreshButton.addEventListener("click", () => {
	void loadWeather();
});

void loadWeather();
