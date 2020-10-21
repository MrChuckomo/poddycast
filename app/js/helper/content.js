function CContentHelper ()
{
    // ---------------------------------------------------------------------------------------------------------------------
    // RIGHT COLUMN
    // ---------------------------------------------------------------------------------------------------------------------

    this.clearContent = function () 
    {
        document.getElementById("list").innerHTML = ""
    }

    this.clearListSelection = function ()
    {
        var ListItems = document.getElementById("list").getElementsByTagName("li")

        for (var i = 0; i < ListItems.length; i++)
        {
            ListItems[i].classList.remove("select-episode")
        }
    }

    this.setHeader = function (_Title) 
    {
        var Header = document.getElementById("content-right").getElementsByTagName("h1")[0]

        Header.innerHTML = _Title
    }
}


module.exports = CContentHelper