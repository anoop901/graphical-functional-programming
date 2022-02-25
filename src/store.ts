import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers/root";

export const store = configureStore({
  reducer: rootReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

/**
 *  TODO: implement the following actions
 *
 *  startDraggingBlock
 *  dragBlock
 *  stopDraggingBlock
 *  startDrawingNewConnection
 *  updateNewConnection
 *  stopDrawingNewConnection
 *  hoverBlockOutput
 *  unhoverBlockOutput
 *  hoverBlockInput
 *  unhoverBlockInput
 *  setInputValues
 *  evaluateProgram
 *  openMenuOnBackground
 *  closeMenuOnBackground
 *  openMenuOnBlock
 *  closeMenuOnBlock
 *  hoverConnection
 *  unhoverConnection
 *  openMenuOnBlock
 *  closeMenuOnBlock
 *  startEditingDefinitionBlock
 *  stopEditingDefinitionBlock
 *  startEditingNumberInputBlock
 *  stopEditingNumberInputBlock
 *  startEditingNumberLiteralBlock
 *  stopEditingNumberLiteralBlock
 *  startEditingReferenceBlock
 *  stopEditingReferenceBlock
 *  removeBlock
 *  removeConnection
 *  create[...]Block
 */
