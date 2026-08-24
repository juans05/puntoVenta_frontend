import {createReducer} from "@reduxjs/toolkit";
import {IAlert} from "./interface";
import {IAlertType} from "./types/index";

const initialState : IAlert = {
    loading: false,
    message: "",
    errors: "",
    type: "",
    code: 0
}

export const alertReducer = createReducer(initialState,(builder) => {
    // @ts-ignore
    builder.addCase("ALERT", (state,action: IAlertType) => {
        return action.payload
    })
});
