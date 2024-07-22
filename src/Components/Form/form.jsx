/* eslint-disable react/prop-types */


const Form = ({ userInput, onFormChange, onFormSubmit }) => {

  const handleChange = (event) => {
    onFormChange(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onFormSubmit()
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="text" required value={userInput} onChange={handleChange} />
        <input type="submit"/>
      </form>
    </>
  )
}

export default Form