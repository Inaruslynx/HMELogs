$(document).ready(function () {
    const body = document.body;
    const toc = "#TableOfContents"
    if ($(toc).length > 0) {
        $(body).attr("data-bs-target", toc);
        $(body).attr("data-bs-offset", "0");
        $(body).scrollspy({target: toc})
    }
});