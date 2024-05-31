import React, { useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container } from '@mui/material';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Account from './components/Account';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import Unauthorized from './components/Unauthorized';
import CreateBlog from './components/CreateBlog';
import ListBlogs from './components/ListBlogs';
import SingleBlog from './components/SingleBlog';
import MyBlogs from './components/MyBlogs';
import blog from './assets/blog.gif';
import './App.css';

export default function App() {
  const { user, handleLogout, handleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      (async () => {
        try {
          const response = await axios.get('http://localhost:4444/api/users/account', {
            headers: {
              authorization: localStorage.getItem('token'),
            },
          });
          handleLogin(response.data);
        } catch (error) {
          console.error('Error fetching user data', error);
          localStorage.removeItem('token');
          navigate('/login');
        }
      })();
    }
  }, [handleLogin, navigate]);

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    handleLogout();
   
    navigate('/home')
    window.location.reload()
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <img src={blog} className="App-logo" alt="logo" style={{ marginRight: '10px', height: '50px' }} />
          
          <Button color="inherit" component={Link} to="/all-blogs">
            See Blogs
          </Button>
          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/home">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/home">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/account">
                Account
              </Button>
              <Button color="inherit" component={Link} to="/create-blog">
                Create Blog
              </Button>
              <Button color="inherit" component={Link} to="/my-blogs">
                My Blogs
              </Button>
              <Button color="inherit" onClick={handleLogoutClick}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/all-blogs" element={<ListBlogs />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/single-blog/:id" element={<SingleBlog />} />
          <Route
            path="/account"
            element={
              <PrivateRoute permittedRoles={['user']}>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-blog"
            element={
              <PrivateRoute permittedRoles={['user']}>
                <CreateBlog />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-blogs"
            element={
              <PrivateRoute permittedRoles={['user']}>
                <MyBlogs />
              </PrivateRoute>
            }
          />
        </Routes>
      </Container>
    </div>
  );
}
