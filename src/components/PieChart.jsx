import React from "react";
import { Pie } from "react-chartjs-2";

function PieChart({ title, categories = {} }) {
  const hasData = Object.keys(categories).length > 0;

  return (
    <div className="col-md-4">
      <h4>{title}</h4>

      {hasData ? (
        <Pie
          data={{
            labels: Object.keys(categories),
            datasets: [
              {
                label: "Totale per Categoria",
                data: Object.values(categories),
                backgroundColor: [
                  "rgba(255, 99, 132, 0.6)",
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                  "rgba(75, 192, 192, 0.6)",
                  "rgba(153, 102, 255, 0.6)",
                  "rgba(255, 159, 64, 0.6)",
                ],
              },
            ],
          }}
        />
      ) : (
        <p>Nessun dato disponibile.</p>
      )}
    </div>
  );
}

export default PieChart;
