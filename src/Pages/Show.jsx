import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Delete from "../Components/Delete/delete";
import Edit from "../Components/Edit/edit";
import api from "../api/axios";

const Show = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [todo, setTodo] = useState([]);
  const [updateTodo, setUpdateTodo] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await api.get(`/api/${id}`);
        setTodo(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchTodo();
  }, [id]);

  const handleChange = (event) => {
    setUpdateTodo(event.target.value);
  };

  const handleUpdateSubmit = async () => {
    try {
      await api.put(`/api/${id}`, {
        content: updateTodo
      });
      setUpdateTodo("");
      navigate("/todos");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = (event) => {
    event.preventDefault();
    handleUpdateSubmit();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateTodo(todo.content);
  };


  return (
    <div>
      {isEditing && <input type="text" value={updateTodo} onChange={handleChange} />}
      <div>{todo && todo.content}</div>
      {!isEditing && <Delete id={id} />}
      <Edit isEditing={isEditing} handleEdit={handleEdit} handleSave={handleSave} id={id} />
      <hr />
      <Link to="/todos">Back to todos</Link>
    </div>
  );
};

export default Show;
