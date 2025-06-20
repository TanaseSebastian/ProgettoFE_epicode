import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileIcon = () => {
  const navigate = useNavigate();

  return (
    <button
      className="btn btn-outline-secondary d-flex align-items-center gap-2"
      onClick={() => navigate("/profile")}
      title="Vai al tuo profilo"
    >
      <FaUserCircle size={22} />
      <span className="d-none d-md-inline">Profilo</span>
    </button>
  );
};

export default ProfileIcon;
