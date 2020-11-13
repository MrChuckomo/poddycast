
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

function setNothingToShowBody(icon, id) {
    if(!id || !$('#' + id).get(0)) {
        //if(getHeader() == generateHtmlTitle('Favorites')) 
        //    setHeaderViewAction("");
        
        id = !id ? '' : id;

        setGridLayout(false);
        let $body = '<span id="' + id + '" style="text-align:center; width: 100%; display:inline-block; font-size: 20px">' +
                        '<br>' +
                        icon +
                        '<br><br>' +
                        i18n.__('Nothing to show') +
                    '</span>';
        setBody($body);
    }
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

function notPlaylistHeader() {
    return Boolean($('#content-right #content-right-header h1 span').get(0));
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

function setScrollPositionOnTop() {
    $('#content-right-body').scrollTop(0);
}