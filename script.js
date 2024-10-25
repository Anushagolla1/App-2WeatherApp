// let weather = {
//     apiKey:"29bd84e33289f196e453fde9559b7bbd",
//     fetchWeather: function (city) {
//       fetch(
//         "https://api.openweathermap.org/data/2.5/weather?q="
//         +city
//         +"&units=metric&appid="
//         + this.apiKey
//       )
//         .then((response) => {
//           if (!response.ok) {
//             alert("No weather found.");
//             throw new Error("No weather found.");
//           } 
//           return response.json();
//         })
//         .then((data) => this.displayWeather(data));
//     },
//     displayWeather: function (data) {
//       const { name } = data ;
//       const { icon, description } = data.weather[0];
//       const { temp,feels_like, humidity } = data.main;
//       const { speed } = data.wind;
//       document.querySelector(".city").innerText = "Weather in " + name;
//       document.querySelector(".icon").src =
//         "https://openweathermap.org/img/wn/" + icon + ".png";
//       document.querySelector(".description").innerText = description;
//       document.querySelector(".temp").innerText = temp + "°C";
//       document.querySelector(".temp-feels-like").innerText ="Feels like: "+feels_like + "°C";
//       document.querySelector(".humidity").innerText =
//         "Humidity: " + humidity + "%";
//       document.querySelector(".wind").innerText =
//         "Wind speed: " + speed + " km/h";
//       document.querySelector(".weather").classList.remove("loading");
//       document.body.style.backgroundImage = url(`https://www.pexels.com/search/mumbai/`);
//     },
//     search: function () {
//       this.fetchWeather(document.querySelector(".search-bar").value);
//     },
//   };
//   document.querySelector(".search button").addEventListener("click", function () {
//     weather.search();
//   });
  
//   document
//     .querySelector(".search-bar")
//     .addEventListener("keyup", function (event) {
//       if (event.key == "Enter") {
//         weather.search();
//       }
//     });
  
//   weather.fetchWeather("Bangalore");







const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key

const form = document.getElementById('weatherForm');
const citySelect = document.getElementById('city');
const unitSelect = document.getElementById('unit');
const tempElement = document.getElementById('temp');
const feelsLikeElement = document.getElementById('feels_like');
const conditionElement = document.getElementById('condition');
const lastUpdateElement = document.getElementById('last_update');
const alertMessageElement = document.getElementById('alertMessage');
const avgTempElement = document.getElementById('avg_temp');
const maxTempElement = document.getElementById('max_temp');
const minTempElement = document.getElementById('min_temp');
const dominantConditionElement = document.getElementById('dominant_condition');

let weatherData = [];  // Store all retrieved weather data for rollup and aggregate calculations

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const city = citySelect.value;
    const unit = unitSelect.value === 'Celsius' ? 'metric' : 'imperial';
    
    // Fetch weather data from OpenWeatherMap API
    const weather = await fetchWeather(city, unit);
    if (weather) {
        displayWeather(weather, unit);
        processWeatherData(weather, unit);
    }
});

async function fetchWeather(city, unit) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

function displayWeather(weather, unit) {
    tempElement.textContent = `${weather.main.temp}° ${unit}`;
    feelsLikeElement.textContent = `${weather.main.feels_like}° ${unit}`;
    conditionElement.textContent = weather.weather[0].main;
    lastUpdateElement.textContent = new Date(weather.dt * 1000).toLocaleString();
}

function processWeatherData(weather, unit) {
    const currentWeather = {
        temp: weather.main.temp,
        condition: weather.weather[0].main,
        timestamp: weather.dt
    };
    
    // Push the current weather data into the weatherData array
    weatherData.push(currentWeather);
    
    // Calculate rollups and aggregates
    const dailySummary = calculateDailySummary(weatherData);
    displayDailySummary(dailySummary);

    // Check for alert conditions
    checkAlerts(currentWeather);
}

function calculateDailySummary(data) {
    if (data.length === 0) return {};

    const temperatures = data.map(d => d.temp);
    const conditions = data.map(d => d.condition);

    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    
    // Find the most frequent weather condition
    const conditionFrequency = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});
    const dominantCondition = Object.keys(conditionFrequency).reduce((a, b) => conditionFrequency[a] > conditionFrequency[b] ? a : b);

    return {
        avgTemp,
        maxTemp,
        minTemp,
        dominantCondition
    };
}

function displayDailySummary(summary) {
    avgTempElement.textContent = `${summary.avgTemp.toFixed(2)}°`;
    maxTempElement.textContent = `${summary.maxTemp}°`;
    minTempElement.textContent = `${summary.minTemp}°`;
    dominantConditionElement.textContent = summary.dominantCondition;
}

function checkAlerts(currentWeather) {
    const tempThreshold = 35;  // Example threshold
    if (currentWeather.temp > tempThreshold) {
        alertMessageElement.textContent = `Alert: Temperature exceeds ${tempThreshold}°C!`;
    } else {
        alertMessageElement.textContent = 'No alerts.';
    }
}
