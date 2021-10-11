export function routeController(path: string): string {
  const explode: string[] = path.split("/");
  let RouteName: string = "";
  explode.forEach(item => {
    if (item && item != ":id" && item != ":subId" && item != "api") {
      RouteName = item;
    }
  });

  return RouteName;
}
