import {useEffect} from "react";
import AuthenticationApi from "./AuthenticationApi.js";

export function useMyPermissions(callback, dependencies = []) {
    useEffect(() => {
        (async() => {
            let permissions = await AuthenticationApi.getMyPermissions();
            callback(permissions);
        })();
    }, dependencies);
}
