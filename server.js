/**
 * import modules
 */
const express = require("express");
const cors = require("cors");
const accountSid = "AC9bd28c37ffc54f1cc5fda32bbfcc6bfb";
const authToken = "1a201cd6d0a958853f614539da1a3d70";
const client = require("twilio")(accountSid, authToken);

/**
 * app config
 */
const app = express();
const PORT = process.env.PORT || 8000;

/**
 * middleware
 */
app.use(cors());
app.use(express.json());

/**
 * function to check slot availability
 */
isslotavailable = data => {
  let slotsArray = [];

  for (let i = 0; i < data.length; i++) {
    if (data[i].sessions) {
      for (let j = 0; j < data[i].sessions.length; j++) {
        if (
          data[i].sessions[j].min_age_limit == 18 &&
          data[i].sessions[j].available_capacity > 0
        ) {
          let obj = {
            address: data[i].address,
            block_name: data[i].block_name,
            slots: data[i].sessions[j].slots
          };
          slotsArray.push(obj);
        }
      }
    }
  }

  return slotsArray;
};

/**
 * api routes
 */
app.post("/findslots", (req, res) => {
  let result = isslotavailable(req.body.data);

  if (result.length == 0) {
    result = "No slots available today";
  }
  let dataToArray = JSON.stringify(result);
  dataToArray = result.split(",").map(item => item.trim());
  dataToArray = dataToArray.join("\n");

  console.log(dataToArray);
  console.log('phone number: ', req.body.phonenumber)

  client.messages
    .create({
      body: dataToArray,
      from: "whatsapp:+14155238886",
      to: `whatsapp:+91${req.body.phonenumber}`
    })
    .then(message => {
        console.log(message.sid)
        res.send('message sent successfully')
    })
    .catch(error => {
        console.error(error)
        res.error('something went wrong while sending message')
    })
    .done();
});

app.get("/", (req, res) => {
  res.send("Welcome to COWINBACKEND server !!!! ");
});

/**
 * listen to port
 */
app.listen(PORT, () => {
  console.log(`info: Our app is running on port ${PORT}`);
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION! Shutting down...");
  process.exit(1);
});
