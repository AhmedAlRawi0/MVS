import React, { useEffect, useState } from "react";
import { fetchApplications } from "../services/api";

const Applications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications().then(res => {
      setApplications(res.data);
    }).catch(err => console.error("Error fetching applications", err));
  }, []);

  return (
    <div>
      <h1>Volunteer Applications</h1>
      <ul>
        {applications.map(app => (
          <li key={app.id}>
            <strong>{app.volunteer_name}</strong> - {app.details}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Applications;