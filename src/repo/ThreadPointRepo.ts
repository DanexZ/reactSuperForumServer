import { AppDataSource } from "../data-source";
import { Thread } from "./Thread";
import { ThreadPoint } from "./ThreadPoint";
import { User } from "./User";

export const updateThreadPoint = async (
    user_id: string,
    thread_id: string,
    increment: boolean
): Promise<string> => {

    if (!user_id || user_id === "0") return "Użytkownik nie został uwierzytelniony";

    let message = "Nie udało się inkrementować liczby punktów wątku.";

    const thread = await Thread.findOne({
        where: { id: thread_id },
        relations: ["user"],
    });

    if (thread!.user!.id === user_id) {
        message = "Błąd: użytkownik nie może oceniać swojego wątku.";
        return message;
    }

    const user = await User.findOne({ where: { id: user_id } });

    const existingPoint = await ThreadPoint.findOne({
        where: {
            thread: { id: thread_id },
            user: { id: user_id },
        },
        relations: ["thread"],
    });

    await AppDataSource.transaction(async () => {

        if (existingPoint) {

            if (increment) {
                if (existingPoint.isDecrement) {
                    await ThreadPoint.remove(existingPoint);
                    thread!.points = Number(thread!.points) + 1;
                    thread!.lastModifiedOn = new Date();
                    await thread!.save();
                }
            } else {
                if (!existingPoint.isDecrement) {
                    await ThreadPoint.remove(existingPoint);
                    thread!.points = Number(thread!.points) - 1;
                    thread!.lastModifiedOn = new Date();
                    await thread!.save();
                }
            }

        } else {

            if (thread && user) {
        
                await ThreadPoint.create({
                    thread,
                    isDecrement: !increment,
                    user,
                }).save();

            }

            if (increment) {
                thread!.points = Number(thread!.points) + 1;
            } else {
                thread!.points = Number(thread!.points) - 1;
            }

            thread!.lastModifiedOn = new Date();
            await thread!.save();
        }

        message = `Pomyślnie ${increment ? "dodano" : "odjęto"} punkt.`;
    });

    return message;
};
