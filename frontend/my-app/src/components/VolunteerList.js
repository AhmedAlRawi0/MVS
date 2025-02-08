import React, { useEffect, useState } from "react";
import { fetchVolunteers, sendEmails } from "../services/api";

const VolunteerList = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [selected, setSelected] = useState({});
  const [emailDetails, setEmailDetails] = useState({ subject: "", message: "" });
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchVolunteers().then(res => {
      setVolunteers(res.data);
      // Set initial checkbox state to false
      const initSelected = {};
      res.data.forEach(vol => {
        initSelected[vol.id] = false;
      });
      setSelected(initSelected);
    })
    .catch(err => console.error("Error fetching volunteers", err));
  }, []);

  const handleCheckbox = (id) => {
    setSelected({ ...selected, [id]: !selected[id] });
  };

  const handleEmailChange = (e) => {
    setEmailDetails({ ...emailDetails, [e.target.name]: e.target.value });
  };

  const handleSendEmail = async () => {
    const volunteerIds = Object.keys(selected).filter(id => selected[id]);
    if (volunteerIds.length === 0) {
      setResponse("No volunteers selected.");
      return;
    }
    try {
      const res = await sendEmails({ volunteerIds, subject: emailDetails.subject, message: emailDetails.message });
      setResponse(res.data.message);
    } catch (error) {
      console.error("Error sending emails", error);
      setResponse("Error sending emails.");
    }
  };

  return (
    <div>
      <h1>Volunteer List</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Select</th>
            <th>Volunteer Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((vol) => (
            <tr key={vol.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selected[vol.id] || false}
                  onChange={() => handleCheckbox(vol.id)}
                />
              </td>
              <td>{vol.name}</td>
              <td>{vol.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "20px" }}>
        <h3>Send Email</h3>
        <div>
          <label>Subject: </label>
          <input type="text" name="subject" value={emailDetails.subject} onChange={handleEmailChange} />
        </div>
        <div>
          <label>Message: </label>
          <textarea name="message" value={emailDetails.message} onChange={handleEmailChange} />
        </div>
        <button onClick={handleSendEmail}>Send Email</button>
        {response && <p>{response}</p>}
      </div>
    </div>
  );
};

export default VolunteerList;