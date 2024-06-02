import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [responseData, setResponseData] = useState(null);

  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false); // for submit successful

  const [data, setData] = useState([]); // to store fetched data for viewing my list

  useEffect(() => {
    // for handling the data from get request to view the list in json
    const fetchData = async () => {
      const response = await fetch("http://localhost:8000/"); // wait to fetch from endpoint

      if (response.status === 204) {
        //check if the status is 204 from GET
        console.log("No content returned from server");
        setData([]); // set dato to an empty array
      } else if (response.ok) {
        const data = await response.json();
        setData(data);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the form from being submitted in the traditional way
    const { fileInput } = event.target.elements; // Access form elements

    console.log(`Selected File: ${fileInput.files[0].name}`);
    // Here you can handle the form submission. For example, you can send the data to a server.

    const formData = new FormData();
    formData.append("file", fileInput.files[0]); // Add the file to the form data

    try {
      // Send the form data to the server
      const response = await fetch("http://localhost:8000/uploadfile/", {
        method: "POST",
        body: formData,
      });

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Log the response from the server
      const data = await response.json();
      console.log(data);
      setResponseData(data); // Set the response data in the state

      setIsSubmitSuccessful(true); // set form successful status to succesful

      // setData((prevData) => [...prevData, fileInput.files[0].name]); // Add the new file to the data state
    } catch (error) {
      console.error("An error occurred while making the fetch request:", error);
    }
  };

  const handleDelete = async (index) => {
    // Copy the data array
    const newData = [...data];

    // Remove the item at the specified index
    newData.splice(index, 1);

    // Update the state
    setData(newData);

    // Send a delete request to the server
    const response = await fetch(`http://localhost:8000/delete/${data[index].id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      // If the response is not ok, add the item back to the data array at the same index
      newData.splice(index, 0, data[index]);
      setData(newData);
      alert('Failed to delete item');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="fileInput">File:</label>
          <br />
          <input type="file" id="fileInput" name="fileInput" required />
          <input type="submit" value="Submit" />
        </form>

        {isSubmitSuccessful && <div>File upload was successful!</div>}
        {responseData && (
          <div>
            <p>You uploaded:</p>
            {responseData.filename} of size{" "}
            {(responseData.file_size / 1024 / 1024).toFixed(2)} MB
            <br />
            <p>refresh the page to see updated list</p>
          </div>
        )}

        {/* {data.map((item, index) => (
            <div key={index}>
              <p>File Name: {item['file name']}</p>
              <p>File Type: {item['file type']}</p>
              <p>Size: {item.size}</p>
              <p>ID: {item.id}</p>
            </div>
          ))} */}

        {/* to display the file list */}
        {data === null && <p>Loading...</p>}
        {/* {data && data.length === 0 && <p>No files have been uploaded yet</p>} // to show  amessage when no files have been uploaded yet */}
        {Array.isArray(data) &&
          data.length > 0 && (
            <table>
              <thead>
                <tr>
                  {Object.keys(data[0]).map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index}>
                    {Object.values(item).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                    <td>
                      <button onClick={() => handleDelete(index)}>X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}


      </header>
    </div>
  );
}

export default App;
