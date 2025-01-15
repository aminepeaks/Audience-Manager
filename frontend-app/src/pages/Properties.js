import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Properties.css';

const Properties = ({ onNavigate }) => {
  const { accountName } = useParams();
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const accountDisplayName = location.state?.accountDisplayName || accountName;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/accounts/${accountName}/properties`);
        setProperties(response.data);
      } catch (err) {
        setError('Error fetching properties');
        console.error('Error fetching properties:', err);
      }
    };

    fetchProperties();
  }, [accountName]);

  return (
    <div className="properties-container">
      <h2>Properties for account:  {accountDisplayName}</h2>
      {error && <p className="error-message">{error}</p>}
      <ul className="properties-list">
        {properties.map(property => {
          const propertyId = property.name.split('/').pop();
          const fullPath = `/accounts/${accountName}/properties/${propertyId}`;
          
          return (
            <li key={property.name}>
              <Link 
                to={fullPath}
                onClick={() => onNavigate(fullPath, property.displayName)}
              >
                {property.displayName}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Properties;