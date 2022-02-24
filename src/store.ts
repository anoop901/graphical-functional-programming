import { configureStore } from "@reduxjs/toolkit";
import { programReducer } from "./reducers/program";
import { editorReducer } from "./reducers/editor";
import { menuReducer } from "./reducers/menu";

export const store = configureStore({
  reducer: {
    program: programReducer,
    editor: editorReducer,
    menu: menuReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
