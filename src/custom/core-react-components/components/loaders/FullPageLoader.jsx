// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from "prop-types";

export default function FullPageLoader({visible, dark}) {
    return (
        <>
            {visible && <div className={`full-page-loader-container ${dark ? "dark" : "light"}`} hidden={!visible}>
                <div className="css-loader-1">
                    <div className={`${dark ? "dark" : "light"}`}></div>
                    <div className={`${dark ? "dark" : "light"}`}></div>
                </div>
            </div>}
        </>
    );
}

FullPageLoader.propTypes = {
    visible: PropTypes.bool.isRequired,
    dark: PropTypes.bool
};
