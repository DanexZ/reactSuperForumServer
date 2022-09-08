export const isEmailValid = (email: string) => {

    if (!email) return "E-mail address cannot be empty";
    if (!email.includes("@")) return "E-main address is not correct";
    if (/\s+/g.test(email)) return "You can't use spaces in an e-mail adress";

    return ""
}