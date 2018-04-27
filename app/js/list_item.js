
var eLayout =
{
    table1: 'list-item-table1-layout',
    table2: 'list-item-table2-layout',
    table3: 'list-item-table3-layout',
    table4: 'list-item-table4-layout',
    table5: 'list-item-table5-layout',
    table6: 'list-item-table6-layout',
    table7: 'list-item-table7-layout',
    box: 'list-item-box-layout',
}

function buildListItem(_Part1, _Part2, _Part3, _Part4, _Part5, _Part6, _Part7, _Layout)
{
    var Container = document.createElement("li")

    // console.log(arguments);
    // console.log(arguments[5]);
    // console.log(typeof _Part1 === 'object');
    // console.log(typeof arguments[5] === 'string');

    for (var i = 0; i < arguments.length; i ++)
    {
        if (typeof arguments[i] === 'string')
        {
            Container.classList.add(arguments[i])
        }
        else
        {
            switch (i)
            {
                case 0: Container.append(_Part1); break;
                case 1: Container.append(_Part2); break;
                case 2: Container.append(_Part3); break;
                case 3: Container.append(_Part4); break;
                case 4: Container.append(_Part5); break;
                case 5: Container.append(_Part6); break;
                case 6: Container.append(_Part7); break;
                default: break;
            }
        }
    }

    // Container.append(_Part1)
    // Container.append(_Part2)
    // Container.append(_Part3)
    // Container.append(_Part4)
    // Container.append(_Part5)
    // Container.append(_Part6)
    // Container.append(_Part7)
    //
    // console.log(_Layout);
    //
    // Container.classList.add(_Layout)

    console.log(Container);

    return Container
}

// ---------------------------------------------------------------------------------------------------------------------

function getImagePart(_Artwork)
{
    var ImageElement = document.createElement("img")

    ImageElement.src = _Artwork

    return ImageElement
}

function getBoldTextPart(_Text)
{
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-bold-text")

    return TextElement
}

function getTextPart(_Text)
{
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-text")

    return TextElement
}

function getFlagPart(_Text, _Color)
{
    var FlagElement = document.createElement("div")

    FlagElement.innerHTML = _Text
    FlagElement.style.backgroundColor = _Color
    FlagElement.classList.add("list-item-flag")

    return FlagElement
}

function getTextButtonPart(_Text)
{
    var ButtonElement = document.createElement("button")

    ButtonElement.text = _Text

    return ButtonElement
}

function getIconButtonPart(_Icon)
{
    var IconButtonElement = document.createElement("svg")

    IconButtonElement.innerHTML = _Text

    return IconButtonElement
}
