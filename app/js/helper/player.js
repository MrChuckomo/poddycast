function CPlayer ()
{
    this.isPlaying = function (_FeedUrl) 
    {
        var PlayerSource = document.getElementsByTagName("source")[0]

        return (PlayerSource.getAttribute("src") == _FeedUrl)
    }
}


module.exports = CPlayer