const { v4: uuidv4 } = require("uuid");

module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Go Serverless v3.0! Your function executed successfully! , id = ${uuidv4()}`,
      },
      null,
      2
    ),
  };
};
