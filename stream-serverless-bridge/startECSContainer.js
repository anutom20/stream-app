const {
  ECSClient,
  LaunchType,
  RunTaskCommand,
  AssignPublicIp,
} = require("@aws-sdk/client-ecs");
module.exports.handler = async (event) => {
  const client = new ECSClient({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.ANUTOM_AWS_ACCESS_KEY,
      secretAccessKey: process.env.ANUTOM_AWS_SECRET,
    },
  });

  const input = {
    taskDefinition: "test-task",
    cluster: "stream_app_cluster",
    capacityProviderStrategy: [
      {
        capacityProvider: "FARGATE",
        base: 0,
        weight: 1,
      },
    ],
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [
          "subnet-0da65f4d7d1e0008c",
          "subnet-096844134d60cfadc",
          "subnet-0b667b69862064e4a",
        ],
        AssignPublicIp: AssignPublicIp.ENABLED,
        securityGroups: ["sg-0138d2cd5a6f8e559"],
      },
    },
  };

  const command = new RunTaskCommand(input);
  const response = await client.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "container created hypothetically",
      response: response,
    }),
  };
};
