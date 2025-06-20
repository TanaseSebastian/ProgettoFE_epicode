import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ title, data }) => (
  <div className="col-md-12 mt-4">
    <h4>{title}</h4>
    <Bar data={data} />
  </div>
);

export default BarChart;
