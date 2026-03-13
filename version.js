const CONFIG = {
    version: "1.0.5" 
};

document.addEventListener("DOMContentLoaded", () => {
    const versionElement = document.getElementById("app-version");
    if (versionElement) {
        versionElement.textContent = CONFIG.version;
    }
});
