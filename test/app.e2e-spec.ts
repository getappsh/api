import { SuperAgentTest, agent as supertest } from 'supertest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as dotenv from "dotenv";
import * as fs from "fs";
import { LOGIN, REFRESH } from '@app/common/utils/paths';
import { createProjectUntilUploadTest, discoveryUntilDeployTest, importCreateTest } from './tests';


dotenv.config();

expect.extend({
  async toBeValidWithClassValidator(received, expectedClass) {
    const receivedObject = plainToInstance(expectedClass, received);
    const validationErrors = await validate(receivedObject);
    const pass = validationErrors.length === 0;

    return {
      pass,
      message: () => {
        if (pass) {
          return `Expected object not to be valid with class-validator`;
        } else {
          const formattedErrors = validationErrors
            .map((error) => Object.values(error.constraints))
            .join(', ');
          return `Expected object to be valid with class-validator, but got validation errors: ${formattedErrors}`;
        }
      },
    };
  },
});



describe('Integration Test', () => {
  let request: SuperAgentTest;
  let awsReq: SuperAgentTest;

  beforeAll(async () => {
    awsReq = supertest("");


    // request = supertest(process.env.GETAPP_URL, {ca: fs.readFileSync(process.env.CA_CERT_PATH)});
    // const loginResponse = await request.post(LOGIN).send({
    //   "username": process.env.TEST_USERNAME,
    //   "password": process.env.TEST_PASSWORD
    // }).expect(201)

    // const refreshResponse = await request.post(LOGIN + REFRESH).send({
    //   refreshToken: loginResponse.body.refreshToken
    // }).expect(201)

    // request.auth(refreshResponse.body.accessToken, { type: 'bearer' })


    request = supertest(process.env.GETAPP_URL);
    request.ca(fs.readFileSync(process.env.CA_CERT_PATH))
    request.cert(fs.readFileSync(process.env.SERVER_CERT_PATH))
    request.key(fs.readFileSync(process.env.SERVER_KEY_PATH))
    request.set({ "integration_test": true })
  });

  // it("From project creating until upload version test", async () => createProjectUntilUploadTest(request, awsReq))
  // it("From discovery until deploy test", async () => discoveryUntilDeployTest(request))
  it("Get map import create test", async () => importCreateTest(request))

});

