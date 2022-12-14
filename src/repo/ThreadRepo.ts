import { isThreadBodyValid, isThreadTitleValid } from "../validators/ThreadValidators";
import { QueryArrayResult, QueryOneResult } from "./QueryArrayResult";
import { Thread } from "./Thread";
import { ThreadCategory } from "./ThreadCategory";
import { User } from "./User";
  
export const createThread = async (
    user_id: string | undefined | null,
    category_id: string,
    title: string,
    body: string
): Promise<QueryOneResult<Thread>> => {

    const titleMsg = isThreadTitleValid(title);
    if (titleMsg) return { messages: [titleMsg] };

    const bodyMsg = isThreadBodyValid(body);
    if (bodyMsg) return { messages: [bodyMsg] };
    if (!user_id) return { messages: ["Użytkownik nie jest zalogowany."] };
    
    const user = await User.findOneBy({ id: user_id });
    if (!user) return {messages : ["Brak użytkownika"]}

    const category = await ThreadCategory.findOneBy({ id: category_id });
    if (!category) return { messages: ["Nie znaleziono kategorii."] };
    
    const thread = await Thread.create({
        title,
        body,
        user,
        category,
    }).save();

    if (!thread) return { messages: ["Nie udało się utworzyć wątku."] };

    return { messages: ["Wątek został pomyślnie utworzony."] }
}

export const getThreadById = async (id: string): Promise<QueryOneResult<Thread>> => {

    const thread = await Thread.findOneBy({ id });
    if (!thread) return { messages: ["Nie udało się znaleźć wątku."] }

    return { entity: thread }
}

export const getThreadsByCategoryId = async (categoryId: string): Promise<QueryArrayResult<Thread>> => {

    const threads = await Thread.createQueryBuilder("thread")
        .where(`thread."categoryId" = :categoryId`, { categoryId })
        .leftJoinAndSelect("thread.category", "category")
        .orderBy("thread.createdOn", "DESC")
        .getMany();

    if (!threads || threads.length === 0) return { messages: ["Nie udało się znaleźć wątków w podanej kategorii."] }

    return { entities: threads }
}

export const getThreadsLatest = async (): Promise<QueryArrayResult<Thread>> => {

    const threads = await Thread.createQueryBuilder("thread")
      .leftJoinAndSelect("thread.category", "category")
      .leftJoinAndSelect("thread.user", "user")
      .leftJoinAndSelect("thread.threadItems", "threadItems")
      .orderBy("thread.createdOn", "DESC")
      .take(10)
      .getMany();
  
    if (!threads || threads.length === 0) return { messages: ["Nie znaleziono żadnych wątków."] }
    
    return { entities: threads }
}