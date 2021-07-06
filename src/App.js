import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core";
import Map from "./Map";
import React, { useEffect, useState } from "react";
import "./App.css";
import InfoBox from "./InfoBox";
import Table from "./Table";
import LineGraph from "./LineGraph";
import numeral from "numeral";

const prettyPrintStat = (stat) =>
  stat ? `+${numeral(stat).format("0.0a")}` : "+0";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [totalCountryInfo, setTotalCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 }); //[51.505, -0.09]//{lat: 34.80746, lng: -40.4796} //[34, -40]
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setmapCountries] = useState(3);
  const [casesType, setCasesType] = useState("cases");
  const [countryVaccine, setCountryVaccine] = useState();
  const [countriesVaccine, setCountriesVaccine] = useState();
  const [totalVaccine, setTotalVaccine] = useState();
  const [dailyTotalVaccine, setdailyTotalVaccine] = useState();


  //vaccined data
  useEffect(() => {
    fetch(
      `https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=30&fullData=true`
    )
      .then((response) => response.json())
      .then((data) => {
        let acc = 0,
          dailyAcc = 0;
        data.map((country) => {
          //country[timeline]
          const len = country["timeline"].length - 1;
          acc += country["timeline"][len].total;
          //console.log(country["timeline"][len].total);

          dailyAcc += country["timeline"][len].daily;
        });
        setTotalVaccine(acc);
        setdailyTotalVaccine(dailyAcc);
        setCountryVaccine(data);
      });
  }, []);
  //console.log(countryVaccine);


  //Total summarized data
  useEffect(() => {
    fetch(`https://disease.sh/v3/covid-19/all`)
      .then((response) => response.json())
      .then((data) => {
        setTotalCountryInfo(data);
      });
  }, []);
  console.log(totalCountryInfo);

  // data of every each of country
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => {
            //difference between map and for each is map would return the object
            return {
              name: country.country,
              value: country.countryInfo.iso2,
            };
          });
          const sortedData = data.sort((a, b) => b.cases - a.cases);
          setTableData(sortedData); // data of every each of country
          setCountries(countries); // data of every each of country's name and code
          setmapCountries(data); // data of every each of country
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? `https://disease.sh/v3/covid-19/all`
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
        setTotalCountryInfo(data);
        setCountry(countryCode);
        setMapCenter(
          countryCode === "worldwide"
            ? [34, -40]
            : [data.countryInfo.lat, data.countryInfo.long]
        );
        setMapZoom(countryCode === "worldwide"? 3 : 4);
      });

    if (countryCode !== "worldwide") {
      let vacUrl = `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${countryCode}?lastdays=30&fullData=true`;
      await fetch(vacUrl)
        .then((response) => response.json())
        .then((data) => {
          const len = data["timeline"].length - 1;
          //console.log(data["timeline"][len]);
          setCountriesVaccine(data["timeline"][len]);
        });
    }
  };
  //console.log(countryInfo);
  //console.log(countriesVaccine?.total);
  //console.log("COUNTRYINFO>>>>>>>>>>>>>>>>>", countriesVaccine);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onClick={onCountryChange}
            >
              {/* Loop through all the countries and show a drop down list of the options */}
              <MenuItem value="worldwide">Worldwide</MenuItem>{" "}
              {/* value match name => set countrycode as value -> display country name */}
              {countries.map((country) => {
                return (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            active={casesType === "cases"}
            isRed
            title="Coronavirus Cases"
            cases={prettyPrintStat(totalCountryInfo.todayCases)}
            total={prettyPrintStat(totalCountryInfo.cases)}
          />

          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            active={casesType === "recovered"}
            title="Recovered"
            cases={prettyPrintStat(totalCountryInfo.todayRecovered)}
            total={prettyPrintStat(totalCountryInfo.recovered)}
          />

          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            active={casesType === "deaths"}
            isRed
            title="Deaths"
            cases={prettyPrintStat(totalCountryInfo.todayDeaths)}
            total={prettyPrintStat(totalCountryInfo.deaths)}
          />
          <InfoBox
            isVaccined
            title="Vaccined"
            cases={prettyPrintStat(
              country === "worldwide"
                ? dailyTotalVaccine
                : countriesVaccine?.daily
            )}
            total={prettyPrintStat(
              country === "worldwide" ? totalVaccine : countriesVaccine?.total
            )}
          />
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
