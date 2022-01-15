// eslint-disable-next-line no-unused-vars
import React from "react";
import {HomeIcon, UserIcon, ShieldCheckIcon} from "@heroicons/react/solid";

import DashboardSidebar from "./DashboardSidebar.jsx";
import UserPage from "../pages/user/UserPage.jsx";
import PermissionsPage from "../pages/permissions/PermissionsPage.jsx";
import "../style.css";

export default function DashboardPage() {
    let [active, setActive] = React.useState("home");
    let [activePage, setActivePage] = React.useState(null);

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
            default:
                nextPage = <div>Unknown page</div>;
                break;
        }
        setActivePage(nextPage);
    }, [active]);

    return (
        <div className="dashboard-page">
            <DashboardSidebar
                entries={[
                    {
                        key: "home",
                        label: "Home",
                        icon: <HomeIcon height={16} width={16} />
                    },
                    {
                        key: "users",
                        label: "Users",
                        icon: <UserIcon height={16} width={16} />
                    },
                    {
                        key: "permissions",
                        label: "Permissions",
                        icon: <ShieldCheckIcon height={16} width={16} />
                    }
                ]}
                active={active}
                onEntryClick={(entry) => setActive(entry.key)} />

            <div className="dashboard-content">
                {activePage}
            </div>
        </div>
    );
}
