export function loginVia(value: string): string {

  let regexEmail = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  if (!isNaN(Number(value))) {
    return "phone";
  } else if (regexEmail.test(value)) {
    return "email";
  } else {
    return "username";

  }
}
