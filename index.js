import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "worlds",
  password: "Tushar@1510",
  port: 5432,
});

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "red" },
  { id: 2, name: "Jack", color: "blue" },
];

async function checkVisited(currentUserId) {
  try {
    const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1",[currentUserId]);
    
    let countries = [];
   
    result.rows.forEach((country) => {
      countries.push(country.country_code);
    });
    //console.log(countries);
    return countries;
  } catch (error) {
    console.error("Error fetching visited countries:", error);
    throw error;
  }
}


app.get("/", async (req, res) => {
  
  const countries = await checkVisited(currentUserId);
  //console.log(countries);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: users[currentUserId-1]?.color,
  });
  
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];
  
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    
    const data = result.rows[0];
    const countryCode = data.country_code;
    
    try {
       db.query(
        "INSERT INTO visited_countries (country_code,user_id) VALUES ($1,$2)",
        [countryCode,currentUserId]
      );
      
      res.redirect("/");
    } catch (err) {
      console.log("entered2");
      console.log(err);
    }
  } catch (err) {
    console.log("entered1")
    console.log(err);
  }
});

app.post("/user", (req, res) => {
  if(req.body.add) res.render("new.ejs");
  else{
  currentUserId = req.body.user; // Extract user ID from form submission
  res.redirect("/");
  }
  
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  let name = req.body.name;
  let c = req.body.color;
  let newid = users.length+1;
  let arr = {id : newid,name : name,color : c};
  //console.log(arr);    
  users.push(arr);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
