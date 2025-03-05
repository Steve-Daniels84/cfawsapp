const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const fs = require("fs");
const path = require("path");

const UPLOAD_TEMP_PATH = path.join(__dirname, "../temp");

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  endpoint: "http://localhost:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
  forcePathStyle: true,
});

const listObjectsParams = {
  Bucket: "test-bucket-steve",
};

//List all objects in the bucket
async function getObjects(req, res) {
  try {
    const command = new ListObjectsV2Command(listObjectsParams);
    const data = await s3Client.send(command);
    res.status(200).json(data); // send the data to the client
  } catch (error) {
    console.error(error);
    res.status(500).send("Error listing objects");
  }
}

//Add object to the bucket
async function addObject(req, res) {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.files.image;
    const fileName = file.name;
    const tempPath = path.join(UPLOAD_TEMP_PATH, fileName);

    // Ensure the temp directory exists
    if (!fs.existsSync(UPLOAD_TEMP_PATH)) {
      fs.mkdirSync(UPLOAD_TEMP_PATH, { recursive: true });
    }

    // Move the file to the temp directory
    await file.mv(tempPath);

    // Upload the file to S3
    const fileStream = fs.createReadStream(tempPath);
    const command = new PutObjectCommand({
      Bucket: "test-bucket-steve",
      Key: fileName,
      Body: fileStream,
    });

    await s3Client.send(command);

    // Remove the temporary file
    fs.unlinkSync(tempPath);

    res.status(200).send("Object added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding object");
  }
}

//get an object from the bucket
async function getObject(req, res) {
  const getObjectParams = {
    Bucket: "test-bucket-steve",
    Key: req.params.key,
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const { Body } = await s3Client.send(command); // `Body` is a stream

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.params.key}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Pipe the S3 object stream to the response
    Body.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting object: " + error);
  }
}

module.exports = {
  getObjects,
  addObject,
  getObject,
};
