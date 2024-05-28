import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as yup from "yup";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "../context/AuthContext";
import { Button } from "@mui/material";
export default function Login() {
    const {handleLogin}=useAuth()
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [serverErrors, setServerErrors] = useState(null);
  const [clientErrors, setClientErrors] = useState(null);

  const validationSchema = yup.object({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string()
      .required("Password is required")
      .min(8, "Password should contain at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (serverErrors) {
      setServerErrors(null);
    }
    if (clientErrors) {
      setClientErrors(null);
    }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientErrors(null);
    setServerErrors(null);

    try {
      await validationSchema.validate(form, { abortEarly: false });
      
      const formData = {
        email: form.email,
        password: form.password,
      };
      
      const response = await axios.post('http://localhost:4444/api/users/login', formData)
      localStorage.setItem('token',response.data.token)
      const userResponse = await axios.get('http://localhost:4444/api/users/account', { 
        headers : {
            Authorization: localStorage.getItem('token')
        }
    })
    console.log(userResponse.data)
    handleLogin(userResponse.data)
      
      if (response.status === 200) {
        toast.success("Login Successful");
        setForm({
          
          email: "",
          password: "",
         
        });
        navigate('/home');
      }
    } catch (err) {
        console.log(err)
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(error => { newErrors[error.path] = error.message });
        setClientErrors(newErrors);
        } else {
        setServerErrors({errors:err?.response});
     }
    }
    console.log(serverErrors)
  };
  const displayClientErrors = (errors, field) => {
    return errors && errors[field] && <span style={{ color: 'red' }}><li>{errors[field]}</li></span>;
  };
  const displayServerErrors = () => {
    return serverErrors && <span style={{ color: 'red' }}><li>{serverErrors?.errors?.data}</li></span>;
  };


  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label><br />
        <input
          type='text'
          id='email'
          value={form.email}
          name="email"
          onChange={handleChange}
        /><br />
        {displayClientErrors(clientErrors, 'email')}
        {!clientErrors && displayServerErrors()}
        <label htmlFor="password">Password</label><br />
        <input
          type='password'
          id='password'
          value={form.password}
          name="password"
          onChange={handleChange}
        /><br />
        {displayClientErrors(clientErrors, 'password')}
        {!clientErrors && displayServerErrors()}<br />
        <Button  variant="contained" color="primary" type='submit'>Login</Button>
      </form>
    </div>
  );
}
