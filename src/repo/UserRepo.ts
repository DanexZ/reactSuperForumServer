import { User } from "./User";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../validators/PasswordValidator";
import { isEmailValid } from "../validators/EmailValidator";

const saltRounds = 10;

export class UserResult {
    constructor(public messages?: string[], public user?: User) {}
}

export const register = async (email: string, userName: string, password: string): Promise<UserResult> => {
    const result = isPasswordValid(password);

    if (!result.isValid) return {
        messages: [
            result.message
        ]
    }

    const trimmedEmail = email.trim().toLocaleLowerCase();
    const emailErrorMsg = isEmailValid(trimmedEmail);

    if (emailErrorMsg) return { messages: [emailErrorMsg] }

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userEntity = await User.create({
        email: trimmedEmail,
        userName,
        password: hashedPassword
    }).save();

    userEntity.password = ""; //ze względów bezpieczeństwa

    return { user: userEntity }
}


export const login = async (userName: string, password: string): Promise<UserResult> => {

    const user = await User.findOne({
        where: { userName }
    });

    if (!user) return { messages: [userNotFound(userName)] }
    if (!user.confirmed) return { messages: ["User didn't confirm e-mail yet."]}

    const passwordMatch = await bcrypt.compare(password, user?.password);
    if (!passwordMatch) return { messages: ["Uncorrect password"]}

    return { user }
}


export const logout = async (userName: string): Promise<string> => {

    const user = await User.findOne({
      where: { userName },
    });
  
    if (!user) return userNotFound(userName);
  
    return "User was logout.";
};


export const me = async (id: string): Promise<UserResult> => {

    const user = await User.findOne({
        where: { id },
        relations: [
            "threads",
            "threads.threadItems",
            "threadItems",
            "threadItems.thread",
        ],
    });
  
    if (!user) return { messages: ["Nie znaleziono użytkownika."] }
    if (!user.confirmed) return { messages: ["Użytkownik jeszcze nie potwierdził swojego adresu e-mail."] }
  
    user.password = "";
    
    return { user }
}


export const changePassword = async (id: string, newPassword: string): Promise<string> => {

    const user = await User.findOne({
        where: { id },
    });
  
    if (!user) return "Nie znaleziono użytkownika.";
    if (!user.confirmed) return "Użytkownik jeszcze nie potwierdził swojego adresu e-mail.";
  
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.save();

    return "Hasło zostało prawidłowo zmienione.";
};


const userNotFound = (userName: string): string => `There's no such userName: "${userName}".`;