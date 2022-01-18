// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import {HomeIcon, UserIcon, ShieldCheckIcon, LogoutIcon, TranslateIcon} from "@heroicons/react/solid";

import DashboardSidebar from "./DashboardSidebar.jsx";
import UserPage from "../pages/user/UserPage.jsx";
import PermissionsPage from "../pages/permissions/PermissionsPage.jsx";
import TranslatePage from "../pages/translate/TranslatePage.jsx";

import LocalizationApi from "../../../../core-localization/web/src/LocalizationApi.js";

import "../style.css";

export default function DashboardPage() {
    let [active, setActive] = React.useState("home");
    let [activePage, setActivePage] = React.useState(null);
    let [t, setTranslations] = React.useState({});
    let [entries, setEntries] = React.useState([]);

    React.useEffect(() => {
        let nextPage;
        switch(active) {
            case "home":
                nextPage = <div>Home</div>;
                break;
            case "users":
                nextPage = <UserPage/>;
                break;
            case "permissions":
                nextPage = <PermissionsPage/>;
                break;
            case "localization":
                nextPage = <TranslatePage/>;
                break;
            case "logout":
                location.href = "logout";
                break;
            default:
                nextPage = <div>Unknown page</div>;
                break;
        }
        setActivePage(nextPage);
    }, [active]);

    useEffect(() => {
        setEntries([
            {
                key: "home",
                label: t["CORE.DASHBOARD.SIDEBAR.HOME"],
                icon: <HomeIcon height={24} width={24} />
            },
            {
                key: "users",
                label: t["CORE.DASHBOARD.SIDEBAR.USERS"],
                icon: <UserIcon height={24} width={24} />
            },
            {
                key: "permissions",
                label: t["CORE.DASHBOARD.SIDEBAR.PERMISSIONS"],
                icon: <ShieldCheckIcon height={24} width={24} />
            },
            {
                key: "localization",
                label: t["CORE.DASHBOARD.SIDEBAR.LOCALIZATION"],
                icon: <TranslateIcon height={24} width={24} />
            },
            {
                key: "logout",
                label: t["CORE.DASHBOARD.SIDEBAR.LOGOUT"],
                icon: <LogoutIcon height={24} width={24} />
            }
        ]);
    }, [t]);

    useEffect(() => {
        (async() => {
            LocalizationApi.massTranslate(await LocalizationApi.getLanguage(), [
                "CORE.DASHBOARD.SIDEBAR.HOME",
                "CORE.DASHBOARD.SIDEBAR.USERS",
                "CORE.DASHBOARD.SIDEBAR.PERMISSIONS",
                "CORE.DASHBOARD.SIDEBAR.LOCALIZATION",
                "CORE.DASHBOARD.SIDEBAR.LOGOUT"
            ]).then(setTranslations);
        })();
    }, []);

    return (
        <div className="dashboard-page">
            <DashboardSidebar
                entries={entries}
                active={active}
                onEntryClick={(entry) => setActive(entry.key)} />

            <div className="dashboard-content">
                {activePage}
            </div>
        </div>
    );
}
