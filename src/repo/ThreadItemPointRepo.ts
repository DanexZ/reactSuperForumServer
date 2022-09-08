import { AppDataSource } from "../data-source";
import { ThreadItem } from "./ThreadItem";
import { ThreadItemPoint } from "./ThreadItemPoint";
import { User } from "./User";

export const updateThreadItemPoint = async (
    user_id: string,
    threadItem_id: string,
    increment: boolean
): Promise<string> => {

    if (!user_id || user_id === "0") return "Użytkownik nie został uwierzytelniony";

    let message = "Nie udało się inkrementować liczby punktów wątku.";

    const threadItem = await ThreadItem.findOne({
        where: { id: threadItem_id },
        relations: ["user"],
    });

    if (threadItem!.user!.id === user_id) {
        message = "Błąd: użytkownik nie może oceniać swojego wątku.";
        return message;
    }

    const user = await User.findOne({ where: { id: user_id } });

    const existingPoint = await ThreadItemPoint.findOne({
        where: {
            threadItem: { id: threadItem_id },
            user: { id: user_id },
        },
        relations: ["threadItem"],
    });

    await AppDataSource.transaction(async (transactionEntityManager) => {

        if (existingPoint) {

            if (increment) {
                if (existingPoint.isDecrement) {
                    await ThreadItemPoint.remove(existingPoint);
                    threadItem!.points = Number(threadItem!.points) + 1;
                    threadItem!.lastModifiedOn = new Date();
                    await threadItem!.save();
                }

            } else {
                if (!existingPoint.isDecrement) {
                    await ThreadItemPoint.remove(existingPoint);
                    threadItem!.points = Number(threadItem!.points) - 1;
                    threadItem!.lastModifiedOn = new Date();
                    await threadItem!.save();
                }
            }

        } else {

            if (threadItem && user) {

                await ThreadItemPoint.create({
                    threadItem,
                    isDecrement: !increment,
                    user,
                }).save();
            }

            if (increment) {
                threadItem!.points = Number(threadItem!.points) + 1;
            } else {
                threadItem!.points = Number(threadItem!.points) - 1;
            }
            threadItem!.lastModifiedOn = new Date();
            await threadItem!.save();
        }

        message = `Pomyślnie ${
        increment ? "dodano" : "usunięto"
        } punkt.`;
  });

  return message;
};