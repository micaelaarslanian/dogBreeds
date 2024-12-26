// Import express and axios
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";


// Create an express app and set the port number.
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));


// Use the public folder for static files.
app.use(express.static("public"));
const API_URL = "https://dogapi.dog/api/v2";

async function getBreedsforGroup(groupResponse){
  let breedsData = groupResponse.data.data.relationships.breeds.data;
  let breeds = [];

  //traverse through the object inside 'relationships.breeds.data' and get all the ids inside that obj
  for (let indexofIDInsideSelectedIDGroup = 0; indexofIDInsideSelectedIDGroup < breedsData.length; indexofIDInsideSelectedIDGroup++)
    {
      const breedId = breedsData[indexofIDInsideSelectedIDGroup].id;
      const breedRepsonse = await axios.get(API_URL + "/breeds/" + breedId);
      breeds.push(breedRepsonse.data.data);
    }
    
  return breeds;
}

async function renderPage(req, res) {
  try {
    // Get the data from the API and assigns it to the variable 'breedsByGroups'
    const groupsResult = await axios.get(API_URL + "/groups");
    const breedsByGroups = groupsResult.data.data;

    //gets from the backend the option selected by the user on the dropdown
    //stores as a string the option selected by the user on the dropdown by a req.body
    let groupSelected = null;

    if (req.body) {
      groupSelected = req.body.selectedGroupId;
    }

    let breeds = [];
    
    if (groupSelected) {
      //inside https://dogapi.dog/api/v2/groups, we have the id of the group selected by the user, so we can traverse through the object inside 'relationships.breeds.data' and get all the ids inside that obj
      const groupResponse = await axios.get(API_URL + "/groups/" + groupSelected);
      breeds = await getBreedsforGroup(groupResponse);
    }

    //render the index.ejs file with the breeds array and the breedsByGroups array
    res.render("index.ejs", { breedsByGroups, breeds });
  }

  catch (error ) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
}


//When the user goes to the home page it should render the index.ejs file.
app.get("/", async (req, res) => {
  await renderPage(req, res);
});

app.post("/", async (req, res) => {
  await renderPage(req, res);
});

// Listen on your predefined port and start the server.
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
