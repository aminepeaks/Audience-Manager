import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Accounts.css';

const Accounts = ({ onNavigate }) => {
    console.log('Accounts.js');
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + '/accounts');
        setAccounts(response.data);
      } catch (err) {
        setError('Error fetching accounts');
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="accounts-container">
      <h2>Accounts</h2>
      {error && <p className="error-message">{error}</p>}
      <ul className="accounts-list">
        {accounts.map(account => (
          <li key={account.name}>
            <Link 
              to={`${account.name}/properties`} 
              state={{ accountDisplayName: account.displayName }}
              onClick={() => onNavigate(`${account.name}/properties`, account.displayName)}
            >
              {account.displayName}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Accounts;