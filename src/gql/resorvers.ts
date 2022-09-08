import { IResolvers } from "graphql-tools";
import CategoryThread from "../repo/CategoryThread";
import { getTopCategoryThread } from "../repo/CategoryThreadRepo";
import { QueryOneResult, QueryArrayResult } from "../repo/QueryArrayResult";
import { Thread } from "../repo/Thread";
import { ThreadCategory } from "../repo/ThreadCategory";
import { getAllCategories } from "../repo/ThreadCategoryRepo";
import { ThreadItem } from "../repo/ThreadItem";
import { updateThreadItemPoint } from "../repo/ThreadItemPointRepo";
import { createThreadItem, getThreadItemsByThreadId } from "../repo/ThreadItemRepo";
import { updateThreadPoint } from "../repo/ThreadPointRepo";
import { getThreadById, createThread, getThreadsByCategoryId, getThreadsLatest } from "../repo/ThreadRepo";
import { User } from "../repo/User";
import { changePassword, login, logout, me, register, UserResult } from "../repo/UserRepo";
import { GqlContext } from "./GqlContext";

const STANDARD_ERROR = "An error has occurred";

interface EntityResult {
    messages: string[]
}

const resolvers: IResolvers = {
    UserResult: {
        __resolveType(obj: any, context: GqlContext, info: any) {

            if (obj.messages) return "EntityResult";
            return "User";
        }
    },

    ThreadResult: {
        __resolveType(obj: any, context: GqlContext, info: any) {

            if (obj.messages) return "EntityResult";
            return "User";
        }
    },

    ThreadArrayResult: {
        __resolveType(obj: any, context: GqlContext, info: any) {
            
            if (obj.messages) return "EntityResult"
            return "ThreadArray";
        },
    },
    
    Query: {
        getThreadById: async (
            obj: any,
            args: { id: string },
            ctx: GqlContext,
            info: any
        ): Promise<Thread | EntityResult> => {

            let thread: QueryOneResult<Thread>;

            try {
                thread = await getThreadById(args.id);
        
                if (thread.entity) return thread.entity;
                
                return { messages: thread.messages ? thread.messages : [STANDARD_ERROR]}

            } catch (e) {
                console.log(e.message);
                throw e;
            }
        },

        getThreadsLatest: async (
            obj: any,
            args: null,
            ctx: GqlContext,
            info: any
        ): Promise<{ threads: Array<Thread> } | EntityResult> => {

            let threads: QueryArrayResult<Thread>;

            try {
                threads = await getThreadsLatest();

                if (threads.entities) return { threads: threads.entities }
                
                return { messages: threads.messages ? threads.messages : [STANDARD_ERROR] }

            } catch (ex) {
              throw ex;
            }
        },

        getThreadsByCategoryId: async (
            obj: any,
            args: { categoryId: string },
            ctx: GqlContext,
            info: any
        ): Promise<{ threads: Array<Thread> } | EntityResult> => {

            let threads: QueryArrayResult<Thread>;

            try {
                threads = await getThreadsByCategoryId(args.categoryId);

                if (threads.entities) return { threads: threads.entities }
                
                return { messages: threads.messages ? threads.messages : [STANDARD_ERROR] }

            } catch (e) {
              throw e;
            }
        },

        getThreadItemByThreadId: async (
            obj: any,
            args: { thread_id: string },
            ctx: GqlContext,
            info: any
          ): Promise<{ threadItems: Array<ThreadItem> } | EntityResult> => {

            let threadItems: QueryArrayResult<ThreadItem>;

            try {
              threadItems = await getThreadItemsByThreadId(args.thread_id);

              if (threadItems.entities) return { threadItems: threadItems.entities }
              
              return {
                messages: threadItems.messages
                  ? threadItems.messages
                  : [STANDARD_ERROR],
              };

            } catch (ex) { throw ex }
        },

        getAllCategories: async (
          obj: any,
          args: null,
          ctx: GqlContext,
          info: any
        ): Promise<Array<ThreadCategory> | EntityResult> => {

          let categories: QueryArrayResult<ThreadCategory>;

          try {
            categories = await getAllCategories();

            if (categories.entities) return categories.entities;
            
            return {
              messages: categories.messages
                ? categories.messages
                : [STANDARD_ERROR],
            }

          } catch (e) { throw e }
        },

        getTopCategoryThread: async (
          obj: any,
          args: null,
          ctx: GqlContext,
          info: any
        ): Promise<Array<CategoryThread>> => {
            try {
                return await getTopCategoryThread();
            } catch (e) {
                console.log(e.message);
                throw e;
            }
        },

        me: async (
            obj: any,
            args: null,
            ctx: GqlContext,
            info: any
        ): Promise<User | EntityResult> => {

            let user: UserResult;

            try {
                if (!ctx.req.session?.user_id)  return { messages: ["Użytkownik nie jest zalogowany."] }
                
                user = await me(ctx.req.session.user_id);

                if (user && user.user) return user.user;
                
                return { messages: user.messages ? user.messages : [STANDARD_ERROR] }

            } catch (e) { throw e }
        }

    },

    Mutation: {
        createThread: async (
          obj: any,
          args: { userId: string; categoryId: string; title: string; body: string },
          ctx: GqlContext,
          info: any
        ): Promise<EntityResult> => {

            let result: QueryOneResult<Thread>;
            
            try {
                result = await createThread(args.userId, args.categoryId, args.title, args.body);

                return { messages: result.messages ? result.messages : [STANDARD_ERROR] }

            } catch (e) {
                console.log(e);
                throw e;
            }
        },

        createThreadItem: async (
            obj: any,
            args: { userId: string; threadId: string; body: string },
            ctx: GqlContext,
            info: any
        ): Promise<EntityResult> => {

            let result: QueryOneResult<ThreadItem>;

            try {
                result = await createThreadItem(args.userId, args.threadId, args.body);

                return { messages: result.messages ? result.messages : [STANDARD_ERROR] }
            } catch (e) {
                console.log(e);
                throw e;
            }
        },

        updateThreadPoint: async (
            obj: any,
            args: { threadId: string; increment: boolean },
            ctx: GqlContext,
            info: any
        ): Promise<string> => {

            let result = "";

            try {
                if (!ctx.req.session || !ctx.req.session?.user_id) return "Musisz być zalogowany, by ustawiać polubienia.";
              
                result = await updateThreadPoint(
                    ctx.req.session!.user_id,
                    args.threadId,
                    args.increment
                );

                return result;

            } catch (e) { throw e }
        },

        updateThreadItemPoint: async (
            obj: any,
            args: { threadItemId: string; increment: boolean },
            ctx: GqlContext,
            info: any
        ): Promise<string> => {

            let result = "";

            try {
                if (!ctx.req.session || !ctx.req.session?.user_id) return "Musisz być zalogowany, by ustawiać polubienia.";
              
                result = await updateThreadItemPoint(
                    ctx.req.session!.user_id,
                    args.threadItemId,
                    args.increment
                );

                return result;

            } catch (e) { throw e }
        },

        register: async (
            obj: any,
            args: { email: string; userName: string; password: string },
            ctx: GqlContext,
            info: any
        ): Promise<string> => {

            let user: UserResult;

            try {
              user = await register(args.email, args.userName, args.password);

              if (user && user.user) return "Pomyślnie zarejestrowano użytkownika.";
              
              return user && user.messages ? user.messages[0] : STANDARD_ERROR;

            } catch (e) { throw e }
        },

        login: async (
            obj: any,
            args: { userName: string; password: string },
            ctx: GqlContext,
            info: any
        ): Promise<string> => {
            let user: UserResult;

            try {

                user = await login(args.userName, args.password);

                if (user && user.user) {
                    ctx.req.session!.user_id = user.user.id;
                    return `Pomyślnie zalogowano użytkownika ${ctx.req.session!.user_id}.`;
                } 

                return user && user.messages ? user.messages[0] : STANDARD_ERROR;

            } catch (ex) {
              console.log(ex.message);
              throw ex;
            }
        },

        logout: async (
            obj: any,
            args: { userName: string },
            ctx: GqlContext,
            info: any
        ): Promise<string> => {

            try {
                let result = await logout(args.userName);

                ctx.req.session?.destroy((err: any) => {
                    if (err) {
                        console.log("nie udało się usunąć sesji");
                        return;
                    }
                    console.log("sesja została usunięta", ctx.req.session?.user_id);
                });

                return result;

            } catch (e) { throw e }
        },

        changePassword: async (
            obj: any,
            args: { newPassword: string },
            ctx: GqlContext,
            info: any
        ): Promise<string> => {

            try {

                if (!ctx.req.session || !ctx.req.session!.user_id) return "Aby zmienić hasło, musisz się najpierw zalogować.";
                
                let result = await changePassword(
                    ctx.req.session!.user_id,
                    args.newPassword
                );
        
                return result;

            } catch (e) { throw e }
        }
    }
}

export default resolvers