import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as yup from "yup";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@mui/material";
export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    bio: ""
  });
  const [serverErrors, setServerErrors] = useState(null);
  const [checkEmail, setCheckEmail] = useState({});
  const [clientErrors, setClientErrors] = useState(null);

  const validationSchema = yup.object({
    username: yup.string().required("Username is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup.string()
      .required("Password is required")
      .min(8, "Password should contain at least 8 characters")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    bio: yup.string().required("Bio is required")
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

  const handleEmail = async () => {
    const response = await axios.get(`http://localhost:4444/checkemail/?email=${form.email}`);
    setCheckEmail(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientErrors(null);
    setServerErrors(null);

    try {
      await validationSchema.validate(form, { abortEarly: false });
      
      const formData = {
        username: form.username,
        email: form.email,
        password: form.password,
        bio: form.bio
      };
      
      const response = await axios.post('http://localhost:4444/api/users/register', formData);
      
      if (response.status === 201) {
        toast.success("Registration Successful");
        setForm({
          username: "",
          email: "",
          password: "",
          bio: ""
        });
        navigate('/login');
      }
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(error => { newErrors[error.path] = error.message });
        setClientErrors(newErrors);
      } else {
        setServerErrors(err?.response?.data?.errors);
      }
    }
  };

  const displayErrors = (errors, field) => {
    return errors && errors[field] && <span style={{ color: 'red' }}><li>{errors[field]}</li></span>;
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label><br />
        <input
          type='text'
          id='username'
          value={form.username}
          name="username"
          onChange={handleChange}
        /><br />
        {displayErrors(clientErrors, 'username')}
        {!clientErrors && displayErrors(serverErrors, 'username')}<br />
        
        <label htmlFor="email">Email</label><br />
        <input
          type='text'
          id='email'
          value={form.email}
          name="email"
          onChange={handleChange}
          onBlur={handleEmail}
        /><br />
        {displayErrors(clientErrors, 'email')}
        {!clientErrors && displayErrors(serverErrors, 'email')}
        {!clientErrors && checkEmail.status === true && <span style={{ color: 'red' }}>Email already exists</span>}<br />
        
        <label htmlFor="password">Password</label><br />
        <input
          type='password'
          id='password'
          value={form.password}
          name="password"
          onChange={handleChange}
        /><br />
        {displayErrors(clientErrors, 'password')}
        {!clientErrors && displayErrors(serverErrors, 'password')}<br />
        
        <label htmlFor="bio">Bio</label><br />
        <input
          type='text'
          id='bio'
          value={form.bio}
          name="bio"
          onChange={handleChange}
        /><br />
        {displayErrors(clientErrors, 'bio')}
        {!clientErrors && displayErrors(serverErrors, 'bio')}<br />
        
        <Button variant='contained' color="primary" type='submit'>Register</Button>
      </form>
    </div>
  );
}
