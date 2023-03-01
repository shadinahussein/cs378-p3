import './App.css';
import React, { useState , useEffect, useRef} from "react";
import { Container, Row, Col, Table} from "react-bootstrap";




function setGeoUrl(locationName) {
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${locationName}`

  return geoURL
}

function setWeatherURL (lat, lon) {
  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m`
  return weatherURL
}

async function pullJson(url) {
  const response = await fetch (url)
  const responseData = await response.json()
  console.log(responseData)
  return responseData
}

async function getWeather(location) {
  const weatherURL = setWeatherURL(location.latitude, location.longitude)
  const weathData = await pullJson(weatherURL)
  return weathData
}

function getHours(hourlyData, currentWeatherTime) {
  console.log("hourlyData", hourlyData);
  const currentTimeIndex = hourlyData.time.indexOf(currentWeatherTime);
  const next12Hours = hourlyData.time.slice(currentTimeIndex + 1, currentTimeIndex + 13);

  const formattedTimes = next12Hours.map((dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const amPm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes}${amPm}`;
  });

  return formattedTimes
}

function getHourlyTemperatures(hourlyData, currentWeatherTime) {
  console.log("hourlyData", hourlyData);
  const currentTimeIndex = hourlyData.time.indexOf(currentWeatherTime);
  const next12HoursData = hourlyData.temperature_2m.slice(
    currentTimeIndex + 1,
    currentTimeIndex + 13
  );
  return next12HoursData;
}



function App() {

  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current.click();
  }, []);
  
  const [weatherData, setWeatherData] = useState({});
  const [city, setCity] = useState("");
  // const [coordinates, setCoordinates] = useState({
  //   lat: null,
  //   lon: null,
  //   cityName: "",
  // });
  const [cityName, setCityName] = useState("")
  const [hourTime, setHourTime] = useState([])
  const [hourlyTemperatures, setHourlyTemperatures] = useState([]);
  
  //Runs Geo API and output 
  async function searchLocation (event){
    if (event.key === "Enter" || event.type=== "click") {
      if(city.trim() === "") return

      try {
      const geoUrl = setGeoUrl(city)
      const geoData = await pullJson(geoUrl)
      const location = geoData.results[0]
      console.log("location entry", location, location.latitude, location.name)
      // setCoordinates({lat: location.latitude,
      //                 lon: location.longitude, 
      //                 cityName: location.name})
      setCityName(location.name)
      console.log("cityName", cityName)
      const weatherData1 = await getWeather(location)
      setWeatherData(weatherData1);

      //now get hourly forcast
      const curTime = weatherData1.current_weather.time
      // console.log("cur time", curTime)
      const forcastHours = await getHours(weatherData1.hourly, curTime)
      setHourTime(forcastHours)
      console.log("hours of day", forcastHours)
      const forcastTemps = getHourlyTemperatures(weatherData1.hourly, curTime)
      setHourlyTemperatures(forcastTemps)
      console.log("temps for hrs", forcastTemps)

      setCity("");
    } catch (error){
      alert("Could not find location. Please try again.");
    }

    }
  }

  //This function use
  async function savedButtonWeather(cityButton) {
  
    try {
      const geoUrl = setGeoUrl(cityButton);
      const geoData = await pullJson(geoUrl);
      const location = geoData.results[0];
      console.log("location entry", location, location.latitude, location.name);
      setCityName(location.name);
      console.log("cityName", cityName);
      const weatherData1 = await getWeather(location);
      setWeatherData(weatherData1);
    
      //now get hourly forcast
      const curTime = weatherData1.current_weather.time;
      const forcastHours = await getHours(weatherData1.hourly, curTime);
      setHourTime(forcastHours);
      console.log("hours of day", forcastHours);
      const forcastTemps = getHourlyTemperatures(weatherData1.hourly, curTime);
      setHourlyTemperatures(forcastTemps);
      console.log("temps for hrs", forcastTemps);
    
      setCity("");
  } catch (error){
    alert("Could not find location. Please try again.");
  }
  }

  




  return (
    <div className="app">
    <Container> 
      <div className="threeButtons">
        <div className="Row">
          {/* <button onClick={loadAustin}>Austin</button>
          <button onClick={loadHouston}>Houston</button> */}
          <div className='col'>
            <button ref={buttonRef} onClick={() => savedButtonWeather("Austin")}>Austin</button>
          </div>
          <div className='col'>
            <button onClick={() => savedButtonWeather("Houston")}>Houston</button>
          </div>
          <div className='col'>
            <button onClick={() => savedButtonWeather("Dallas")}>Dallas</button>
          </div>
        </div>

      </div>
      <div className="searchLocation">
        <input
          type="text"
          value={city}
          placeholder="Enter city"
          onKeyPress={searchLocation}
          onChange={(event) => setCity(event.target.value)}
          
        />
        <button className="addShortcut" onClick={searchLocation}>+</button>
      </div>

      <div className="top">
        <div className="location">
          <h2>{cityName}</h2>
        </div>
        <div className="currentTemp">
          {weatherData.current_weather ? (
            <h1> {weatherData.current_weather.temperature} <sup style={{ fontSize: "0.7em" }}>ºC</sup>
            </h1> ) : null}
        </div>
      </div>
     
      {hourlyTemperatures && hourlyTemperatures.length > 0 && (
        <Table className='HourlyForcast' striped bordered hover>
          <thead>
            <tr>
              <th>Time</th>
              <th>Temperature</th>
            </tr>
          </thead>
          <tbody>
             {hourlyTemperatures.map((temp, index) => (
            <tr key={index}>
            <td>{hourTime[index]}</td>
            <td>{`${temp}ºC`}</td>
            </tr>
               ))}
          </tbody>
          
        </Table>
    )}
      </Container>
    </div>
   
  );
}

export default App;
