const APIkey = 'f760f3e64dd745e65cce1374291ab7bd';
const formInputEl = document.getElementById('search-input');
const currentWeatherEl = document.getElementById('current-weather');
const forecastEl = document.getElementById('forecast');
const searchHistoryEl = document.getElementById('search-history');
let searchHistoryButtons;
const dates = [dayjs().format('MMM/D/YYYY'),dayjs().add(1, 'day').format('MMM/D/YYYY'), dayjs().add(2, 'day').format('MMM/D/YYYY'), dayjs().add(3, 'day').format('MMM/D/YYYY'), dayjs().add(4, 'day').format('MMM/D/YYYY'), dayjs().add(5, 'day').format('MMM/D/YYYY')];
let searchHistory = [];
let lat;
let long;

if (localStorage.getItem('searchHistory')) { // Checks if search history exists and adds it if so.
    searchHistory = JSON.parse(localStorage.getItem('searchHistory'));
    for (let i = 0; i < searchHistory.length; i++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'rounded-lg', 'my-4', 'search');
        button.textContent = `${searchHistory[i].city.name}`;
        searchHistoryEl.append(button);
        searchHistoryButtons = document.getElementsByClassName('search');
        button.addEventListener('click', function() {
            displayToday(searchHistory[[...searchHistoryButtons].indexOf(button)]);
            displayForecast(searchHistory[[...searchHistoryButtons].indexOf(button)]);
        })
    }
    
}

if (localStorage.getItem('currentCity')) { // Checks if any weather data is in local storage and sets it if so.
    let currentCity = JSON.parse(localStorage.getItem('currentCity'));
    displayToday(currentCity);
    displayForecast(currentCity);
}

document.getElementById('clear-history').addEventListener('click', function() { // Adds clear search history function to bottom left button.
    searchHistoryEl.innerHTML = '';
    searchHistory = [];
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
})

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const city = formInputEl.value;
    formInputEl.value = '';
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${APIkey}`) // First we perform a fetch to retrieve the lat and long based on city.
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            lat = data[0].lat.toFixed(2); // Converting coordinates to two decimal points to follow documentation format.
            long = data[0].lon.toFixed(2);
            fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${APIkey}`) // Then we have to perform another fetch using the coordinate variables to receive weather data.
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    displayToday(data);
                    displayForecast(data);
                    addSearchHistory(data);
                    localStorage.setItem('currentCity', JSON.stringify(data));
                });
    });
})

function temperatureConverter(num) { // API data returns Kelvin, function to convert to Fahrenheit.
    return ((num-273.15)*1.8)+32;
  }

function speedConverter(num) { // API data returns meters per second, function converts to miles. 
    return (num*0.00062137);
}

function displayToday(data) { // Function that sets the HTML content of the current day forecast.
    currentWeatherEl.innerHTML = `<div class = 'flex'><h2 class = 'font-bold text-2xl'>${data.city.name} (${dates[0]})</h2><img class = 'weather-icon-main' src = 'https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png'></div>
                                                    <h3 class = 'text-lg font-medium'>Temp: ${temperatureConverter(data.list[0].main.temp).toFixed(2)}°F</h3>
                                                    <h3 class = 'text-lg font-medium'>Wind: ${(speedConverter(data.list[0].wind.speed)*3600).toFixed(2)} MPH</h3>
                                                    <h3 class = 'text-lg font-medium'>Humidity: ${data.list[0].main.humidity} %</h3>`
}

function displayForecast(data) { // Generates the five cards that contain the future 5-day forecast.
    forecastEl.innerHTML = '';
    for (let i = 1; i < 6; i++) {
        let card = document.createElement('div');
        card.classList.add('bg-gray-500', 'mt-4', 'w-full', 'md:w-1/6', 'h-1/4', 'flex', 'flex-col', 'justify-evenly', 'p-4')
        card.innerHTML += `<h3 class = 'text-white font-bold text-lg'>${dates[i]}</h3>
                            <img class = 'weather-icon-main' src = 'https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}@2x.png'>
                            <h3 class = 'text-white'>Temp: ${temperatureConverter(data.list[i].main.temp).toFixed(2)}°F</h3>
                            <h3 class = 'text-white'>Wind: ${(speedConverter(data.list[i].wind.speed)*3600).toFixed(2)} MPH</h3>
                            <h3 class = 'text-white'>Humidity: ${data.list[i].main.humidity} %</h3>`
        forecastEl.append(card);
    }
}

function addSearchHistory(data) { // Generates a new button with every search.
    searchHistory.push(data);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    const button = document.createElement('button');
    button.classList.add('btn', 'rounded-lg', 'mt-6', 'search');
    button.textContent = `${data.city.name}`;
    searchHistoryEl.append(button);
    searchHistoryButtons = document.getElementsByClassName('search');
    button.addEventListener('click', function() {
        displayToday(searchHistory[[...searchHistoryButtons].indexOf(button)]);
        displayForecast(searchHistory[[...searchHistoryButtons].indexOf(button)]);
    })
}

