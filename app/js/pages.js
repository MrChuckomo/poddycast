
/*
 *  Body
 */

function clearBody() {
    $('#content-right #content-right-body #list').html('');
}

function setBody(bodyHtml) {
    $('#content-right #content-right-body #list').html(bodyHtml);
}

function getBody() {
    return $('#content-right #content-right-body #list').html();
}

/*
 *  Header
 */

function clearHeader() {
    $('#content-right #content-right-header h1').html('');
}

function setHeader(headerHtml, buttonHtml) {
    if(headerHtml != undefined)
        $('#content-right #content-right-header h1').html(headerHtml);

    if(buttonHtml != undefined)
        $('#content-right #content-right-header div').html(buttonHtml);
}

function getHeader() {
    return $('#content-right #content-right-header h1').html();
}

function generateHtmlTitle(title) {
    return '<span>' + i18n.__(title) + '</span>'
}

/*
 *  Page
 */

function showPage(headerHtml, bodyHtml) {
    setHeader(headerHtml)
    setBody(bodyHtml)
}
