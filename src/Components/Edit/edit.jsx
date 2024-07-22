/* eslint-disable react/prop-types */

const Edit = ({ isEditing, handleEdit, handleSave }) => {

  let styles = {
    backgroundColor: "cadetblue",
    color: "white",
    marginLeft: "10px"
  }

  return (
    <>      
      <button style={styles} onClick={isEditing ? handleSave : handleEdit} >{isEditing? "Save" : "Edit"}</button>
    </>
  )
}

export default Edit