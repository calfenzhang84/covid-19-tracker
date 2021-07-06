import numeral from "numeral";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-moment";

const options = {
  interaction: {
    intersect: false,
    mode: "index",
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          //console.log(tooltipItem.raw.y);
          //console.log(tooltipItem["raw"]["x"]);
          //console.log(tooltipItem.dataset.data);
          return numeral(tooltipItem.raw.y).format("+0,0");
        },
      },
    },
  },

  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,

  scales: {
    xAxisx: {
      type: "time",
      time: {
        // Luxon format string
        tooltipFormat: "ll",
        unit: "day",
        displayFormats: {
          day: "ll",
        },
      },
    },
    yAxis: {
      grid: {
        display: false,
      },
      ticks: {
        callback: function (value, index, values) {
          return numeral(value).format("0a");
        },
      },
    },
  },
};

function LineGraph({ casesType = "cases", ...props }) {
  const [data, setData] = useState();
  //console.log(casesType);

  const buildChartData = (data) => {
    const chartData = [];
    let lastDataPoint;
    // Object.keys(data[casesType]).forEach( e => {
    //     console.log(e, ">>>>>>>>", data[casesType][e]);
    // })

    //console.log(data["cases"]);
    //console.log(data[casesType]);
    Object.keys(data[casesType]).forEach((date) => {
      if (lastDataPoint) {
        const newDataPoint = {
          x: date,
          y: data[casesType][date] - lastDataPoint,
        };
        chartData.push(newDataPoint);
      }
      lastDataPoint = data[casesType][date];
    });
    return chartData;
  };

  useEffect(() => {
    fetch(`https://disease.sh/v3/covid-19/historical/all?lastdays=120`)
      .then((response) => response.json())
      .then((data) => {
        const chartData = buildChartData(data);
        setData(chartData);
      });
  }, [casesType]);

  return (
    <div className={props.className}>
      {data?.length > 0 && (
        <Line
          // options
          options={options}
          // data
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204,16,52,0.5)",
                fill: true,
                borderColor: "#cc1034",
                data: data,
              },
            ],
          }}
        />
      )}
    </div>
  );
}

export default LineGraph;
