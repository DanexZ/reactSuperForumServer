import { isThreadBodyValid } from "../validators/ThreadValidators";
import { QueryArrayResult } from "./QueryArrayResult";
import { ThreadItem } from "./ThreadItem";
import { User } from "./User";
import { Thread } from "./Thread";

export const createThreadItem = async (
    user_id: string | undefined | null,
    thread_id: string,
    body: string
): Promise<QueryArrayResult<ThreadItem>> => {

  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) return { messages: [bodyMsg] }
  
  if (!user_id) return { messages: ["Użytkownik nie jest zalogowany."] }
  
  const user = await User.findOneBy({ id: user_id });
  if (!user) return { messages: ["Brak użytkownika"]}

  const thread = await Thread.findOneBy({ id: thread_id })
  if (!thread) return { messages: ["Nie znaleziono wątku."] }
  
  const threadItem = await ThreadItem.create({
    body,
    user,
    thread,
  }).save();

  if (!threadItem) return { messages: ["Nie udało się utworzyć odpowiedzi (ThreadItem)."] }

  return { messages: ["Odpowiedź została pomyślnie zapisana w bazie."] }
};

export const getThreadItemsByThreadId = async (thread_id: string): Promise<QueryArrayResult<ThreadItem>> => {

    const threadItems = await ThreadItem.createQueryBuilder("ti")
        .where(`ti."threadId" = :threadId`, { thread_id })
        .leftJoinAndSelect("ti.thread", "thread")
        .orderBy("ti.createdOn", "DESC")
        .getMany();

    if (!threadItems) return { messages: ["Nie znaleziono odpowiedzi (ThreadItem) do wątku."] }
    
    return { entities: threadItems }
}