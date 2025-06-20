import React, { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaUserCircle } from "react-icons/fa";

const Profile = () => {
  const localUser = JSON.parse(localStorage.getItem("userData"));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    city: "",
    cap: "",
    province: "",
    photoUrl: "",
  });

  const [cities, setCities] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ...user,
      }));
    }
  }, []);

  useEffect(() => {
    const fetchCityByCap = async () => {
      if (formData.cap.length === 5) {
        try {
          const response = await fetch(`https://api.zippopotam.us/it/${formData.cap}`);
          if (!response.ok) return;

          const data = await response.json();
          const places = data.places.map((place) => ({
            city: place["place name"],
            province: place["state abbreviation"],
          }));

          setCities(places);

          if (places.length > 0) {
            setFormData((prev) => ({
              ...prev,
              city: places[0].city,
              province: places[0].province,
            }));
          }
        } catch (error) {
          console.warn("Errore nel recupero città da CAP:", error);
        }
      }
    };

    fetchCityByCap();
  }, [formData.cap]);

  useEffect(() => {
    if (cities.length > 0 && formData.city) {
      const matched = cities.find((c) => c.city === formData.city);
      if (matched && matched.province !== formData.province) {
        setFormData((prev) => ({
          ...prev,
          province: matched.province,
        }));
      }
    }
  }, [formData.city, formData.province, cities]);

  useEffect(() => {
    const fetchAddressSuggestions = async () => {
      if (formData.address.length > 4 && formData.city) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(
              formData.address
            )}&city=${encodeURIComponent(formData.city)}&country=Italia&format=json&limit=5`
          );
          const data = await res.json();
          setAddressSuggestions(data.map((entry) => entry.display_name));
        } catch (error) {
          console.warn("Errore nel recupero suggerimenti indirizzo:", error);
        }
      } else {
        setAddressSuggestions([]);
      }
    };

    const delay = setTimeout(fetchAddressSuggestions, 500);
    return () => clearTimeout(delay);
  }, [formData.address, formData.city]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion,
    }));
    setAddressSuggestions([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!localUser) return;

    try {
      setSaving(true);
      const userRef = doc(db, "users", localUser.uid);
      await updateDoc(userRef, formData);

      const updatedUser = { ...localUser, ...formData };
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      setMessage("Profilo aggiornato con successo!");
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      setMessage("Errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Il tuo Profilo</h2>

      <div className="d-flex align-items-center mb-3 gap-3">
        {formData.photoUrl ? (
          <img
            src={formData.photoUrl}
            alt="Foto profilo"
            className="rounded-circle"
            width={80}
            height={80}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <FaUserCircle size={80} className="text-secondary" />
        )}
        <div>
          <strong>Foto Profilo</strong>
          <p className="mb-0 small text-muted">
            Al momento non è possibile caricare file. Puoi aggiornare la tua foto inserendo un URL.
          </p>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.toLowerCase().includes("errore") ? "alert-danger" : "alert-success"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="row g-4">
        <div className="col-md-12">
          <label className="form-label">URL immagine profilo</label>
          <input
            type="url"
            className="form-control"
            name="photoUrl"
            value={formData.photoUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            disabled
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Telefono</label>
          <input
            type="tel"
            className="form-control"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+39..."
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Data di nascita</label>
          <input
            type="date"
            className="form-control"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">CAP</label>
          <input
            type="text"
            className="form-control"
            name="cap"
            value={formData.cap}
            onChange={handleChange}
            maxLength={5}
            placeholder="Es. 70121"
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Città</label>
          {cities.length > 1 ? (
            <select
              className="form-select"
              name="city"
              value={formData.city}
              onChange={handleChange}
            >
              {cities.map((c, idx) => (
                <option key={idx} value={c.city}>
                  {c.city}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-control"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          )}
        </div>

        <div className="col-md-3">
          <label className="form-label">Provincia</label>
          <input
            type="text"
            className="form-control"
            name="province"
            value={formData.province}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-12 position-relative">
          <label className="form-label">Indirizzo</label>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Via e numero civico"
            autoComplete="off"
          />
          {addressSuggestions.length > 0 && (
            <ul className="list-group position-absolute w-100 shadow-sm z-3" style={{ top: "100%" }}>
              {addressSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleAddressSelect(suggestion)}
                  style={{ cursor: "pointer" }}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-12 d-flex justify-content-end">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
