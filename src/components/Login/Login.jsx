import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/LOGO/image.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // const response = await fetch('http://localhost/finance_desktop_new_be-main/finance_desktop_new_be-main/super_admin_api/verify_agent.php', {

      const response = await fetch('https://vebbox.in/srimangalavinayagacollector/be/super_admin_api/verify_agent.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_id: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.message === 'success') {
        // Save token and user details to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', email);
        localStorage.setItem('user_id_num', data.id);
        localStorage.setItem('name', data.name);
        localStorage.setItem('issuperadmin', data.super_admin || "false");
        
        console.log('Login successful:', data);
        navigate('/new-entry');
      } else {
        setErrorMsg(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMsg('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src={logo} alt="Sri Mangala Vinayagar Logo" className="logo" />
        </div>
        
        <h1 className="login-title">Sri Mangala Vinayagar</h1>
        <h2 className="login-subtitle">Agent Login</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
          
          <div className="forgot-password">
            <a href="#forgot">Forget Password</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
