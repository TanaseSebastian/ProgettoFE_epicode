import React from "react";
import { Line } from "react-chartjs-2";

const LineChart = ({ title, data }) => (
  <div className="col-md-12 mt-4">
    <h4>{title}</h4>
    <Line data={data} />
  </div>
);

export default LineChart;