const express = require("express");
const path = require("path");
const axios = require("axios");
const qs = require("querystring"); //built-in querystring module for manipulating query strings

//UNCOMMENT THE FOLLOWING TWO LINES IF USING SSL CERTS
//const fs = require("fs"); //file r/w module built-in to Node.js
//const https = require("https"); //built-in https module

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || "8888";


const key = process.env.GOOGLE_API_KEY;


//LOCAL SSL CERTS
/* var opts = {
  ca: [fs.readFileSync("<path_to_rootkey>"), fs.readFileSync("<path_to_rootpem")],
  key: fs.readFileSync("<path_to_key>"),
  cert: fs.readFileSync("<path_to_crt>")
}; */

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//set up static path (for use with CSS, client-side JS, and image files)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.get("/searchRecipes", (req, res) => {
  const searchQuery = req.query.r;
  if (!searchQuery) {
    res.redirect(302, "/");
    return;
  }

  searchR(searchQuery, res);
});

app.get("/recipeDetails/:id", (req, res) => {
  const searchId = req.params.id;
  if (!searchId) {
    res.redirect(302, "/");
    return;
  }

  searchD(searchId, res);
});

app.get("/restaurants", async (req, res, next) => {
  try {
    const category = req.query.t;
    if (!category) {
      res.redirect(302, "/");
      return;
    }
    const country = "canada";
    const city = "toronto";
    // const category = "burgers";
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${category}+${city}+${country}&type=restaurant&key=${key}`
    );
    // res.json(data);
    res.render("restaurants", {
      title: "Search Restaurants",
      restaurants: data.results,
      category,
    });
  } catch (err) {
    next(err);
  }
});


app.get("/authorize", (req, res) => {});

//HTTP server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
/*
//HTTPS server (comment out the HTTP server listening and uncomment 
//this section to use HTTPS (you need SSL certs)
var server = https.createServer(opts, app);

server.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});
*/


/**
 * Function to make a request to find the details of selected recipe
 * then render on the page.
 *
 * @param {Response} res The Response for the page to be the detail info of selected recipe.
 */
function searchD(searchId, res) {
  const options = {
    method: "GET",
    url: `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${searchId}/information`,
    headers: {
      "X-RapidAPI-Key": "a132185298mshc9c187e027389b8p18c495jsnbfa857f98884",
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    },
  };

  axios.request(options).then(function (response) {
    // console.log("response.data: ", JSON.stringify(response.data));
    res.render("recipeDetails", {
      title: "Recipe Details",
      details: response.data,
      searchId,
    });
  }).catch(function (error) {
    console.error(error);
  });

}

/**
 * Function to make a request to find the recipes
 * then render on the page.
 *
 * @param {Response} res The Response for the page to be a list of searched recipes.
 */
function searchR(searchQuery, res) {
  const options = {
    method: "GET",
    url: "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch",
    params: {
      query: searchQuery,
      instructionsRequired: "true",
      fillIngredients: "false",
      addRecipeInformation: "false",
      maxReadyTime: "30",
      ignorePantry: "true",
      sort: "calories",
      sortDirection: "asc",
      offset: "0",
      number: "10",
      limitLicense: "false",
      ranking: "2",
    },
    headers: {
      "X-RapidAPI-Key": "a132185298mshc9c187e027389b8p18c495jsnbfa857f98884",
      "X-RapidAPI-Host": "spoonacular-recipe-food-nutrition-v1.p.rapidapi.com",
    },
  };

  axios
    .request(options)
    .then(function (response) {
      // console.log("response.data: ", JSON.stringify(response.data.results));
      res.render("searchRecipes", {
        title: "Search Recipes",
        recipes: response.data.results,
        searchQuery,
      });
    })
    .catch(function (error) {
      console.error(error);
    });

}
