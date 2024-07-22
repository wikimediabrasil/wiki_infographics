import { useState, useEffect } from 'react';
import Card from '../Components/Card/card';
import Form from '../Components/Form/form';
import { useNavigate } from 'react-router';
import api from '../api/axios';

const TodoPage = () => {
  const [todo, setTodo] = useState([]);
  const [addTodo, setAddTodo] = useState("");
  const [userName, setUserName] = useState("")
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await api.get("/user-info");
        if (response.data.username) {
          setUserName(response.data.username)
          console.log("user authenticated " + response.data.username);
        } else {
          console.log('User is not authenticated');
        }
      } catch (error) {
        console.error('Error checking authentication', error);
      }
    };
    checkUser();
  },[])

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await api.get('/api');
        setTodo(response.data);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate("/");
        } else {
          console.log(err);
        }
      }
    };

    fetchTodos();
  }, [navigate]);

  const handleFormChange = (inputValue) => {
    setAddTodo(inputValue);
  };

  const handleFormSubmit = async () => {
    try {
      const response = await api.post('/api/create', { content: addTodo });
      console.log(response.data);
      setAddTodo("");
      await getLastestTodos();
    } catch (err) {
      console.log(err);
    }
  };

  const getLastestTodos = async () => {
    try {
      const response = await api.get('/api');
      setTodo(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/");
      } else {
        console.error(err);
        window.location.href = "/";
      }
    }
  };

  const logout = async () => {
    try {
      await api.get('/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <>
      <h3> Welcome {userName} </h3>
      <button onClick={logout}>Logout</button>
      <Form userInput={addTodo} onFormChange={handleFormChange} onFormSubmit={handleFormSubmit}/>
      <Card listOfTodos={todo}/>
    </>
  );
};

export default TodoPage;