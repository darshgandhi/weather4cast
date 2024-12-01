import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;  

  // degrees type
  const fahrenheit = ["United States", "Bahamas", "Cayman Islands", "Palau", "The Federated States of Micronesia", "Marshall Islands"]

  // Main Hooks
  const [location, setLocation] = useState("Loading...");
  const [date, setDate] = useState("Loading...");
  const [currentType, setCurrentType] = useState("Loading...");
  const [current, setCurrent] = useState("0");
  const [feelsLike, setFeelsLike] = useState("0");
  const [icon, setIcon] = useState("wb_+sunny");

  // Specific Hooks
  const [hourlyWeather, setHourlyWeather] = useState(Array(5).fill("0"));
  const [times, setTimes] = useState(Array(5).fill("0"));
  const [timesType, setTimesType] = useState(Array(5).fill("0"));
  const [hourlyIcon, setHourlyIcon] = useState(Array(5).fill("0"));

  // Date String Calculation
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const d = new Date();
  let dateString = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          let lat = position.coords.latitude;
          let long = position.coords.longitude;
  
          const weatherAPI = `${apiUrl}/forecast.json?key=${apiKey}&q=${lat},${long}&days=3&aqi=no&alerts=no`;
          getWeatherData(weatherAPI);
        },
        (err) => {
          if (err.code === 1) {
            alert('Permission denied. Please allow location access to get the weather.');
          } else {
            alert('Unable to retrieve your location: ' + err.message);
          }
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };
  

  const getWeatherData = (weatherAPI) => {
    fetch(weatherAPI)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then((data) => {
          let temp = data.current.temp_c;
          setLocation(data.location.name);
          setCurrent(Math.sign(temp) * Math.ceil(Math.sign(temp) * temp));
          setDate(dateString);
          setIcon(getWeatherIcon(data.current.condition.code))
          setCurrentType(data.current.condition.text);
          setFeelsLike(data.current.feelslike_c);
          console.log(data);
          console.log(data.forecast.forecastday[0].hour[21].temp_c);
          setForecast(data);  
        })
        .catch((error)=>{
          console.error('Failed to fetch data: ', error);
        })
  };

  const setForecast = (data) => {
    let hour = d.getHours();
    let day = 0;
    const newHourlyWeather = [];
    const newHourlyIcon = [];
    const newTimes = [];
    const newTimesType = [];

    for (let i = 0; i < 5; i++) {
      hour = (hour + 1) % 24
      if (hour == 0) {
        day = 1;
        newTimes.push(12);
      } else {
        newTimes.push(hour % 12);
      }

      let temp = data.forecast.forecastday[day].hour[hour].temp_c;
      newHourlyWeather.push(Math.sign(temp) * Math.ceil(Math.sign(temp) * temp))
      newHourlyIcon.push(getWeatherIcon(data.forecast.forecastday[day].hour[hour].condition.code));

      if (hour > 11) {
        newTimesType.push("PM");
      } else {
        newTimesType.push("AM");
      }
    }
    console.log(newHourlyWeather);
    console.log(newTimes);
    console.log(newHourlyIcon);
    console.log(newTimesType);
    setHourlyWeather(newHourlyWeather);
    setHourlyIcon(newHourlyIcon);
    setTimes(newTimes);
    setTimesType(newTimesType);
  }

  const getWeatherIcon = (code) => {
    if (code == 1000 || code == 1003 || code == 1006) {
      code += 1;
    }
    const iconMap = {
      1000: 'wb_sunny', // Sunny
      1001: 'dark_mode', // Night Clear
      1003: 'partly_cloudy_day', // Partly cloudy
      1004: 'partly_cloudy_night', // Partly cloudy night
      1006: 'cloud', // Cloudy
      1007: 'partly_cloudy_night', // cloudly night
      1009: 'cloud', // Overcast
      1030: 'mist', // Mist
      1063: 'rainy_light', // Patchy rain possible
      1066: 'ac_unit', // Patchy snow possible
      1069: 'rainy_snow', // Patchy sleet possible
      1072: 'rainy_snow', // Patchy freezing drizzle possible
      1087: 'thunderstorm', // Thundery outbreaks possible
      1114: 'ac_unit', // Blowing snow
      1117: 'snowing_heavy', // Blizzard
      1135: 'foggy', // Fog
      1147: 'foggy', // Freezing fog
      1150: 'rainy_light', // Patchy light drizzle
      1153: 'rainy_light', // Light drizzle
      1168: 'rainy_snow', // Freezing drizzle
      1171: 'rainy_snow', // Heavy freezing drizzle
      1180: 'rainy_light', // Patchy light rain
      1183: 'rainy_light', // Light rain
      1186: 'rainy_light', // Moderate rain at times
      1189: 'rainy_light', // Moderate rain
      1192: 'rainy', // Heavy rain at times
      1195: 'rainy', // Heavy rain
      1198: 'rainy', // Light freezing rain
      1201: 'rainy', // Moderate or heavy freezing rain
      1204: 'grain', // Light sleet
      1207: 'grain', // Moderate or heavy sleet
      1210: 'ac_unit', // Patchy light snow
      1213: 'ac_unit', // Light snow
      1216: 'ac_unit', // Patchy moderate snow
      1219: 'snowing_heavy', // Moderate snow
      1222: 'snowing_heavy', // Patchy heavy snow
      1225: 'snowing_heavy', // Heavy snow
      1237: 'grain', // Ice pellets
      1240: 'showers', // Light rain shower
      1243: 'showers', // Moderate or heavy rain shower
      1246: 'showers', // Torrential rain shower
      1249: 'grain', // Light sleet showers
      1252: 'grain', // Moderate or heavy sleet showers
      1255: 'ac_unit', // Light snow showers
      1258: 'ac_unit', // Heavy snow showers
      1261: 'grain', // Light showers of ice pellets
      1264: 'grain', // Heavy showers of ice pellets
      1273: 'thunderstorm', // Patchy light rain with thunder
      1276: 'thunderstorm', // Moderate or heavy rain with thunder
      1279: 'ac_unit', // Patchy light snow with thunder
      1282: 'ac_unit', // Moderate or heavy snow with thunder
    };
  
    // Return the icon name based on the code
    return iconMap[code] || 'help'; // Default icon if the code is not found
  };
  
  useEffect(() => {
    handleShareLocation();
  }, []);

  return (
    <div className="border">
      <div className="LocationInfo">
        <p className="location">{location}</p>
        <p className="dateTime">{date}</p>
      </div>
      <div className="typeIcon">
        <p className="type">{currentType}</p>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="mainInfo">
        <p className="currentWeather">{current}</p>
        <p className="degree">&deg;</p>
      </div>
      <p className="H">Feels Like: {feelsLike}&deg;C</p>
      <div className="weekView">
        <div className="hourView">
          <div className="time">
            <p className="hourViewTime">Now</p>
            <p className="ampm"></p>
          </div>
          <span className="material-symbols-outlined">{icon}</span>
          <p className="hourViewNum">{current}&deg;C</p>
        </div>
        <div className="hourView">
          <div className="time">
            <p className="hourViewTime">{times[0]}</p>
            <p className="ampm">{timesType[0]}</p>
          </div>
          <span className="material-symbols-outlined">{hourlyIcon[0]}</span>
          <p className="hourViewNum">{hourlyWeather[0]}&deg;C</p>
        </div>
        <div className="hourView">
          <div className="time">
            <p className="hourViewTime">{times[1]}</p>
            <p className="ampm">{timesType[1]}</p>
          </div>
          <span className="material-symbols-outlined">{hourlyIcon[1]}</span>
          <p className="hourViewNum">{hourlyWeather[1]}&deg;C</p>
        </div>
        <div className="hourView">
        < div className="time">
            <p className="hourViewTime">{times[2]}</p>
            <p className="ampm">{timesType[2]}</p>
          </div>
          <span className="material-symbols-outlined">{hourlyIcon[2]}</span>
          <p className="hourViewNum">{hourlyWeather[2]}&deg;C</p>
        </div>
        <div className="hourView">
          <div className="time">
            <p className="hourViewTime">{times[3]}</p>
            <p className="ampm">{timesType[3]}</p>
          </div>
          <span className="material-symbols-outlined">{hourlyIcon[3]}</span>
          <p className="hourViewNum">{hourlyWeather[3]}&deg;C</p>
        </div>
        <div className="hourView">
          <div className="time">
            <p className="hourViewTime">{times[4]}</p>
            <p className="ampm">{timesType[4]}</p>
          </div>
          <span className="material-symbols-outlined">{hourlyIcon[4]}</span>
          <p className="hourViewNum">{hourlyWeather[4]}&deg;C</p>
        </div>
      </div>
    </div>
  )
}

export default App