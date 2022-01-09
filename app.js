//jshint esverion:6

// required node modules
const express = require("express");
const app = express();
const port = 3000;

const https = require("https");

var bodyParser = require("body-parser");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// creating root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/signup.html");
});

// setting up post requests on root route
app.post("/", (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  // setting up Mailchimp API
  const mailchimp = require("@mailchimp/mailchimp_marketing");

  mailchimp.setConfig({
    apiKey: "b63ad1a9fba77d2bd46a695d943bd82a-us10",
    server: "us10",
  });

  const listId = "c9434cfe6a";

  async function run() {
    const response = await mailchimp.lists.addListMember(listId, {
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    });

    console.log(
      `Successfully added contact as an audience member. The contact's id is ${response.id}.`
    );
  }

  run();

  // actions after signup success or failure
  const url = "https://us10.api.mailchimp.com/3.0/lists/c9434cfe6a";
  const options = {
    method: "POST",
    auth: "Newsletter_NodeJS:b63ad1a9fba77d2bd46a695d943bd82a-us10",
  };

  const request = https.request(url, options, function (response) {
    if (response.statusCode == 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function (data) {
      console.log("Data: ", JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
});

// setting up local and heroku servers
app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/* mailchimp api key
b63ad1a9fba77d2bd46a695d943bd82a-us10

my list id
c9434cfe6a 

*/
