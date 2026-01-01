import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

export default function NetWorthChart({title, netWorthData}) {
  const [series, setSeries] = useState([]);
  // months array for x-axis labels must be filled with empty strings to match data length
  const months = Array.from({ length: netWorthData.length }, (_, i) => `Month ${i + 1}`);

  const chartOptions = {
    chart: {
      id: "net-worth-chart",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    title: {
      text: title,
      align: "center",
      style: { fontSize: "18px", fontWeight: "bold" }
    },
    xaxis: {
      categories: months,
      title: { text: "Month" }
    },
    yaxis: {
      title: { text: "Net Worth (€)" }
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    markers: {
      size: 5
    },
    dataLabels: {
      enabled: true
    },
    colors: ["#00BFFF"]
  };

  useEffect(() => {
    console.log("Net Worth Data:", netWorthData);
    setSeries([
      {
        name: "Net Worth",
        data: netWorthData
      }
    ]);
  }, [netWorthData]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Chart
        options={chartOptions}
        series={series}
        type="line"
        height={500}
      />
    </div>
  );
}
