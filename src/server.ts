process.env["NODE_CONFIG_DIR"] = __dirname + "/core/configs";
import "dotenv/config";
import App from "./app";

import IndexRoute from "./modules/home/routes/index.route";

import AuthRoute from "./modules/auth/routes/auth.route";

import UserRoute from "./modules/common/routes/user.route";
import ProfileRoute from "./modules/common/routes/profile.route";
import SettingRoute from "./modules/common/routes/setting.route";
import validateEnv from "./core/utils/validateEnv";
import GraphRoute from "./modules/app/routes/graph.route";
import OverViewRoute from "./modules/app/routes/over.view.route";
import PermissionRoute from "./modules/auth/routes/permission.route";
import GroupPermissionRoute from "./modules/auth/routes/group.permission.route";
import UserPermissionRoute from "./modules/auth/routes/user.permission.route";
import GroupRoute from "./modules/auth/routes/group.route";

validateEnv();

const app = new App(
  [
    // home module routes
    new IndexRoute(),

    // auth module routes
    new AuthRoute(),
    new GroupRoute(),
    new PermissionRoute(),
    new GroupPermissionRoute(),
    new UserPermissionRoute(),

    // common module routes
    new UserRoute(),
    new ProfileRoute(),
    new SettingRoute(),

    // app module routes
    new OverViewRoute(),
    new GraphRoute()
  ]);

app.listen();

