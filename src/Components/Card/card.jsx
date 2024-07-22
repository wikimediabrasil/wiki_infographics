/* eslint-disable react/prop-types */
import { Link } from "react-router-dom"

const Card = ({ listOfTodos }) => {
  return (
    <>

      {listOfTodos.map(todo => (
          <ul key={todo.id}>
            <li>
              <Link to={`/todos/${todo.id}`}>{todo.content}</Link>
            </li>
          </ul>
        )
      )}

    </>
  )
}

export default Card