# Waste my time app 9000

### Spotify Auth
1. User arrives at home page
2. Click signup
  - FE: Redirect user to spotty auth page
  - User accepts/declines
3. Spotify redirects user to redirectUri with req.query.code
  - FE: @ /callback - post code to BE.lambda
  - BE: exchange code for token
  - BE: save token to ddb
4. Show user success signup
  - FE: store userId or something in localstorage so user doesn't need to re-auth again
    - Or could make an proper login system which I can store tokens against
5. Start using users tokens to do spotify guessing!

Move home brewed auth functions here from Lennie's thing

I should probably split these into different folders for different deploys
- But I think you can't deploy a new endpoint separate from the APIGateway resource right?

Do guess x4 people for x1 song
Allow song preview to play

https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigatewayv2-route.html#cfn-apigatewayv2-route-target
https://github.com/aws-samples/serverless-patterns
https://aws.amazon.com/blogs/compute/building-serverless-multi-region-websocket-apis/
https://github.com/aws-samples/multi-region-websocket-api/blob/main/src/lambda/websocket-response-handler.ts