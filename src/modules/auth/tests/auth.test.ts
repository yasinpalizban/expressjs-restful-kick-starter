import bcrypt from "bcrypt";
import mongoose from "mongoose";
import request from "supertest";
import App from "../../../app";
import { AuthTestValidation } from "../validations/auth.test.validation";
import AuthRoute from "../routes/auth.route";
import UserModel from "@/modules/auth/models/user.model";

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe("Testing Auth", () => {
  describe("[POST] /signup", () => {
    it("response should have the Create userData", async () => {
      const userData: AuthTestValidation = {
        email: "test@email.com",
        password: "q1w2e3r4!",
        phone: "09186151344",
        userName: "yasin"
      };

      const authRoute = new AuthRoute();
      //const users = authRoute.controller.authService.userModel;
      const users = UserModel;
      users.findOne = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        _id: "60706478aad6c9ad19a31c84",
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10)
      });

      (mongoose as any).connect = jest.fn();
      const app = new App([authRoute]);
      return request(app.getServer()).post(`${authRoute.pathNested}signup`).send(userData);
    });
  });

  describe("[POST] /login", () => {
    it("response should have the Set-Cookie header with the Authorization token", async () => {
      const userData: AuthTestValidation = {
        email: "test@email.com",
        password: "q1w2e3r4!",
        phone: "09186151344",
        userName: "yasin"

      };

      const authRoute = new AuthRoute();
     // const users = authRoute.controller.authService.userModel;
      const users = UserModel;
      users.findOne = jest.fn().mockReturnValue({
        _id: "60706478aad6c9ad19a31c84",
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10)
      });

      (mongoose as any).connect = jest.fn();
      const app = new App([authRoute]);
      return request(app.getServer())
        .post(`${authRoute.pathNested}login`)
        .send(userData)
        .expect("Set-Cookie", /^Authorization=.+/);
    });
  });

  // describe('[POST] /logout', () => {
  //   it('logout Set-Cookie Authorization=; Max-age=0', async () => {
  //     const userData: User = {
  //       _id: '60706478aad6c9ad19a31c84',
  //       email: 'test@email.com',
  //       password: await bcrypt.hash('q1w2e3r4!', 10),
  //     };

  //     const authRoute = new AuthRoute();
  //     const users = authRoute.authController.authService.users;

  //     users.findOne = jest.fn().mockReturnValue(userData);

  //     (mongoose as any).connect = jest.fn();
  //     const app = new App([authRoute]);
  //     return request(app.getServer())
  //       .post(`${authRoute.path}logout`)
  //       .send(userData)
  //       .set('Set-Cookie', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ')
  //       .expect('Set-Cookie', /^Authorization=\; Max-age=0/);
  //   });
  // });
});
