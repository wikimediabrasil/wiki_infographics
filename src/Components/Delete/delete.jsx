/* eslint-disable react/prop-types */

import { useNavigate } from "react-router";
import api from "../../api/axios";

const Delete = ({ id }) => {
  const navigate = useNavigate();

  const deleteTodo = async () => {
    try {
      await api.delete(`/api/${id}`, {
        data: { id: id }
      });
      navigate("/todos");
    } catch (error) {
      console.error(error);
    }
  };

  let styles = { 
    backgroundColor: "red",
    color: "white"
  };

  return (
    <>      
      <button style={styles} onClick={deleteTodo}>Delete</button>
    </>
  );
};

export default Delete;
