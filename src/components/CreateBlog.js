import { useState } from "react";
import axios from "axios";
import * as yup from "yup";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Button from '@mui/material/Button';


export default function CreateBlog() {
  const [form, setForm] = useState({
    content: "",
    title: "",
    pic: ""
  });
  const [serverErrors, setServerErrors] = useState(null);
  const [clientErrors, setClientErrors] = useState(null);

  const validationSchema = yup.object({
    title: yup.string().required("Title is required"),
    content: yup.string().required("Content is required"),
    pic: yup.string().required("Pic URL is required")
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
        title: form.title,
        content: form.content,
        pic: form.pic
      };
      console.log(formData);
      
      // Change to the appropriate endpoint for creating a post
      const response = await axios.post('http://localhost:4444/api/posts', formData, { 
        headers: {
          Authorization: localStorage.getItem('token')
        }
      });
      console.log(response)
      toast.success("Post created successfully!");
      setForm({ title: "", content: "", pic: "" });
    } catch (err) {
      console.log(err);
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(error => { newErrors[error.path] = error.message });
        setClientErrors(newErrors);
      } else {
        setServerErrors({ errors: err?.response });
      }
    }
  };

  const displayClientErrors = (errors, field) => {
    return errors && errors[field] && <span style={{ color: 'red' }}><li>{errors[field]}</li></span>;
  };

  const displayServerErrors = () => {
    return serverErrors && <span style={{ color: 'red' }}><li>{serverErrors?.errors?.data}</li></span>;
  };

  return (
    <div>
      <h1>Create Blog</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label><br />
        <input
          type='text'
          id='title'
          value={form.title}
          name="title"
          onChange={handleChange}
        /><br />
        {displayClientErrors(clientErrors, 'title')}
        {!clientErrors && displayServerErrors()}
        <label htmlFor="content">Content</label><br />
        <textarea
          id='content'
          value={form.content}
          name="content"
          onChange={handleChange}
        /><br />
        {displayClientErrors(clientErrors, 'content')}
        {!clientErrors && displayServerErrors()}<br />
        <label htmlFor="pic">Pic URL</label><br />
        <input
          type='text'
          id='pic'
          value={form.pic}
          name="pic"
          onChange={handleChange}
        /><br />
        {displayClientErrors(clientErrors, 'pic')}
        {!clientErrors && displayServerErrors()}<br />
        <Button variant="contained" color='primary'type="submit">Submit</Button> 
      </form>
    </div>
  );
}
