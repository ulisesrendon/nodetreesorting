const sessionStatus = async function () {
    const actualSession = localStorage.getItem('session');
    const response = await fetch(`http://api.localhost/v2/auth/session/${actualSession}`);
    const { status } = await response.json();
    return status === "Active" ? true : false;
};

document.addEventListener('DOMContentLoaded', async function () {
    const SessionStatus = await sessionStatus();
    if (!localStorage.getItem('session') || !SessionStatus) {
        window.location.href = 'login.html';
    }
});