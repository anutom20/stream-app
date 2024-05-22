import { v4 as uudiv4 } from "uuid";

export const handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Go Serverless v3.0! Your function executed successfully! , id=${uudiv4()}`,
      },
      null,
      2
    ),
  };
};
