from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import uvicorn
import os
import json
from fastapi.middleware.cors import CORSMiddleware  

origins = [
    "http://localhost:3000", # React
]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # allow all origins
    allow_methods=["*"],    # allow all methods
    allow_headers=["*"],    # allow all headers
)   

# Get the current working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Create a directory in the current working directory to store the uploaded files
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

# Create the directory if it doesn't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)

# @app.get("/")
# def read_root():
#     return {"Hello": "World"}

# Data to be written

dict = {
    "file name": "",
    "file type": "",
    "size": "",
    "id": ""
}

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    # fs = await file.read()
    print("new file uploaded: " + file.filename)   # print the name of the uploaded file
    dict["file name"] = file.filename
    dict["file type"] = file.content_type
    dict["size"] = file.size
    dict["id"] = file.filename
    print(dict)

    # save the file in the uploads directory
    file_path = os.path.join(UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # serializing to json
    json_object = json.dumps(dict, indent=4)

    # Writing to sample.json
    with open("sample.json", "r+") as outfile:
        try:
            data = json.load(outfile)
        except json.decoder.JSONDecodeError: # if the file is empty , initialize it with an empty list
            data = []

        if not any(d["file name"] == file.filename for d in data): # check if the file data is already in the list
            data.append(dict) # add the new data to the existing data

        outfile.seek(0)   # move the cursor to the beginning of the file
        json.dump(data, outfile, indent=4) # write the updated data to the file
        outfile.truncate()  # remove any remaining content
    return {"filename": file.filename,"file_size": file.size}


# print("dict: ", dict)


# display the meta data of the uploaded files
@app.get("/", response_class=JSONResponse)
async def read_files():
    try:
        # get the list of files in the uploads directory
        with open("sample.json", "r") as outfile:
            content = outfile.read().strip()
            data = json.loads(content) if content else []
        return data
    except FileNotFoundError:
        return JSONResponse(status_code=404, content={"message": "File not found"})
    except json.JSONDecodeError:
        return JSONResponse(status_code=400, content={"message": "Invalid JSON format"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

@app.delete("/delete/{file_id}")  # delete a file by its id
async def delete_file(file_id: str):   
    with open("sample.json", "r+") as outfile:   # open the file in read .and write mode
        data = json.load(outfile)                # load the data from the file
        id_exists = False
        for i in range(len(data)):               # iterate through the data
            if data[i]["id"] == file_id:         # check if the id matches the file id
                data.pop(i)
                id_exists = True
                break
        if not id_exists:                        # if the id does not exist
            return {"message": "file not found"}
        outfile.seek(0)                          # move the cursor to the beginning of the file
        json.dump(data, outfile, indent=4)      # write the updated data to the file
        outfile.truncate()
    file_path = os.path.join(UPLOADS_DIR, file_id)  # get the file path of the file to be deleted
    if os.path.exists(file_path):                   # check if the file exists
        os.remove(file_path)                          # delete the file from the uploads directory
    else:
        return {"message": "file not found"}
    return {"message": "file deleted successfully"}


if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)

# source venv/Scripts/activate
