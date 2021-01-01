'use strict'

const s_PlayIcon =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`

const s_HeartFilled =
`
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
`

const s_Favorite =
`
<svg class="set-favorite" onclick="unsubscribeListElement(this)" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
`

const s_Delete =
`
<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
<path d="M0 0h24v24H0z" fill="none"></path>
`

const s_DeleteIcon =
`
<svg class="delete-icon" onclick="event.stopPropagation(); deleteEntryWithIcon(this)" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`

const s_AddEpisodeIcon =
`
<svg onclick="event.stopPropagation(); addToEpisodes(this)" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
</svg>
`

const s_MoreOption =
`
<path d="M0 0h24v24H0z" fill="none"/>
<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
`

const s_MoreOptionIcon =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
</svg>
`

const s_RemoveIcon =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
</svg>
`

const s_CheckBox =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
</svg>
`

const s_CheckBoxOutline =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`

const s_GridView =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 11h5V5H4v6zm0 7h5v-6H4v6zm6 0h5v-6h-5v6zm6 0h5v-6h-5v6zm-6-7h5V5h-5v6zm6-6v6h5V5h-5z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`

const s_ListView =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 14h4v-4H4v4zm0 5h4v-4H4v4zM4 9h4V5H4v4zm5 5h12v-4H9v4zm0 5h12v-4H9v4zM9 5v4h12V5H9z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`

const s_InfoIcon =
`
<svg fill="#000000" style="isolation:isolate" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="iconInfo"><path d="M0 0h24v24.001H0z"/></clipPath></defs>
    <g clip-path="url(#iconInfo)"><path d="M11.472.011a11.99 11.99 0 0 1 5.867 1.241c2.782 1.373 4.988 3.869 5.996 6.804.858 2.447.885 5.175.084 7.641a12.003 12.003 0 0 1-3.601 5.405 11.922 11.922 0 0 1-5.717 2.714 12.01 12.01 0 0 1-7.438-1.065 12 12 0 0 1-3.817-2.992 11.948 11.948 0 0 1-2.635-5.507 12.104 12.104 0 0 1 .198-5.371 11.961 11.961 0 0 1 2.563-4.784A12.013 12.013 0 0 1 7.663.808a12.04 12.04 0 0 1 3.809-.797zm.326 4.243a1.758 1.758 0 0 0-.843 3.159c.639.488 1.609.448 2.204-.092.531-.454.74-1.242.501-1.898-.248-.762-1.068-1.278-1.862-1.169zM8.572 9.693c-.004.396.001.791 0 1.187a.25.25 0 0 0 .26.262c.485.005.969 0 1.454.001v6.002l-1.448.001a.25.25 0 0 0-.266.262c-.005.342.005.683-.003 1.025.006.119-.022.264.077.354.078.082.199.067.302.073 2.054-.002 4.109 0 6.164-.001.136.016.297-.06.309-.21.02-.413.004-.827.006-1.239a.249.249 0 0 0-.26-.264c-.485.001-.97-.004-1.454.001.003-2.465.001-4.931.001-7.396.024-.159-.088-.336-.262-.321H8.835a.25.25 0 0 0-.263.263z"/></g>
</svg>
`
