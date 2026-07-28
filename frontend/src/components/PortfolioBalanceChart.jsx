import React, {useMemo} from "react";
import Chart from "react-apexcharts";
import {i18n} from "../libs/translations";

function getSnapshotBalance(snapshotKey, snapshot) {
  if (snapshot && !Array.isArray(snapshot) && snapshot.balance !== undefined) {
    return Number(snapshot.balance);
  }

  const balanceMatch = snapshotKey.match(/Balance:\s*(-?\d+(?:\.\d+)?)/);
  return balanceMatch ? Number(balanceMatch[1]) : NaN;
}

export default function PortfolioBalanceChart({portfolioSnapshots, chartId}) {
  const chartData = useMemo(() => {
    if (!portfolioSnapshots) return [];

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12);

    return Object.entries(portfolioSnapshots)
      .map(([snapshotKey, snapshot]) => {
        const dateText = snapshotKey.split(" - ")[0];
        return {
          date: new Date(dateText + "T00:00:00"),
          dateText,
          balance: getSnapshotBalance(snapshotKey, snapshot)
        };
      })
      .filter((snapshot) => (
        !Number.isNaN(snapshot.date.getTime()) &&
        !Number.isNaN(snapshot.balance) &&
        snapshot.date >= cutoff
      ))
      .sort((a, b) => a.date - b.date);
  }, [portfolioSnapshots]);

  const options = {
    chart: {
      id: chartId,
      toolbar: {show: false},
      zoom: {enabled: false}
    },
    xaxis: {
      categories: chartData.map((snapshot) => {
        const [year, month, day] = snapshot.dateText.split("-");
        return `${day}/${month}/${year}`;
      })
    },
    yaxis: {
      labels: {
        formatter: (value) => `${Number(value).toLocaleString("pt-PT")}€`
      }
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    markers: {
      size: 4
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (value) => Number(value).toLocaleString("pt-PT", {
          style: "currency",
          currency: "EUR"
        })
      }
    },
    noData: {
      text: i18n("No portfolio snapshots in the last 12 months.")
    },
    colors: ["#00BFFF"]
  };

  const series = [{
    name: i18n("Balance"),
    data: chartData.map((snapshot) => snapshot.balance)
  }];

  return (
    <div className="col-12 dashboard-section mb-3">
      <h3>{i18n("Portfolio Balance - Last 12 Months")}</h3>
      <Chart options={options} series={series} type="line" height={400} />
    </div>
  );
}
