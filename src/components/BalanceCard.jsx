import React from "react";

const BalanceCard = ({ title, amount }) => (
  <div className="card text-center">
    <div className="card-header">{title}</div>
    <div className="card-body">
      <h5 className="card-title">{amount.toFixed(2)} €</h5>
    </div>
  </div>
);

export default BalanceCard;
