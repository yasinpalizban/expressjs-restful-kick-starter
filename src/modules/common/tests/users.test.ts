import bcrypt from "bcrypt";
import mongoose from "mongoose";
import request from "supertest";
import App from "../../../app";
import UserRoute from "../routes/user.route";
import { UsersPostValidation } from "../validations/users.post.validation";
import UserService from "../services/user.service";

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe("Testing Users", () => {
  describe("[GET] /users", () => {
    it("response fineAll Users", async () => {
      const usersRoute = new UserRoute();
   //   const users = usersRoute.controller.userService.userModel;
      const users = new UserService().userModel;

      users.find = jest.fn().mockReturnValue([
        {
          _id: "qpwoeiruty",
          email: "a@email.com",
          password: await bcrypt.hash("q1w2e3r4!", 10)
        },
        {
          _id: "alskdjfhg",
          email: "b@email.com",
          password: await bcrypt.hash("a1s2d3f4!", 10)
        },
        {
          _id: "zmxncbv",
          email: "c@email.com",
          password: await bcrypt.hash("z1x2c3v4!", 10)
        }
      ]);

      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).get(`${usersRoute.pathNested}`).expect(200);
    });
  });

  describe("[GET] /users/:id", () => {
    it("response findOne User", async () => {
      const userId = "qpwoeiruty";

      const usersRoute = new UserRoute();
      //const users = usersRoute.controller.userService.userModel;
      const users = new UserService().userModel;

      users.findOne = jest.fn().mockReturnValue({
        _id: "qpwoeiruty",
        email: "a@email.com",
        password: await bcrypt.hash("q1w2e3r4!", 10)
      });

      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).get(`${usersRoute.pathNested}/${userId}`).expect(200);
    });
  });

  describe("[POST] /users", () => {
    it("response Create User", async () => {
      const userData: UsersPostValidation = {
        email: "test@email.com",
        password: "q1w2e3r4",
        phone: "09186151344",
        userName: "yasin",
        role: "admin",
        firstName:'sss',
        lastName:'eee'

      };

      const usersRoute = new UserRoute();
     // const users = usersRoute.controller.userService.userModel;
      const users = new UserService().userModel;

      users.findOne = jest.fn().mockReturnValue(null);
      users.create = jest.fn().mockReturnValue({
        _id: "60706478aad6c9ad19a31c84",
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10)
      });

      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).post(`${usersRoute.pathNested}`).send(userData).expect(201);
    });
  });

  describe("[PUT] /users/:id", () => {
    it("response Update User", async () => {
      const userId = "60706478aad6c9ad19a31c84";
      const userData: UsersPostValidation = {
        email: "test@email.com",
        password: "q1w2e3r4",
        phone: "09186151344",
        userName: "yasin",
        role:'admin',
        firstName:'sss',
        lastName:'eee'
      };

      const usersRoute = new UserRoute();
    //  const users = usersRoute.controller.userService.userModel;
      const users = new UserService().userModel;

      if (userData.email) {
        users.findOne = jest.fn().mockReturnValue({
          _id: userId,
          email: userData.email,
          password: await bcrypt.hash(userData.password, 10)
        });
      }

      users.findByIdAndUpdate = jest.fn().mockReturnValue({
        _id: userId,
        email: userData.email,
        password: await bcrypt.hash(userData.password, 10)
      });

      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).put(`${usersRoute.pathNested}/${userId}`).send(userData);
    });
  });

  describe("[DELETE] /users/:id", () => {
    it("response Delete User", async () => {
      const userId = "60706478aad6c9ad19a31c84";

      const usersRoute = new UserRoute();
     // const users = usersRoute.controller.userService.userModel;
      const users = new UserService().userModel;

      users.findByIdAndDelete = jest.fn().mockReturnValue({
        _id: "60706478aad6c9ad19a31c84",
        email: "test@email.com",
        password: await bcrypt.hash("q1w2e3r4!", 10)
      });

      (mongoose as any).connect = jest.fn();
      const app = new App([usersRoute]);
      return request(app.getServer()).delete(`${usersRoute.pathNested}/${userId}`).expect(200);
    });
  });
});
