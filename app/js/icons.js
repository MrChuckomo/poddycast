
const s_PlayIcon =
`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
</svg>
`

const s_PauseIcon = 
`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/>
</svg>
`

const s_Heart = 
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
</svg>
`

const s_FullHeart = 
`
<svg class="set-favorite" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
`

const s_DeleteIcon =
`
<svg class="delete-icon" fill="#000000" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0V0z"/>
    <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
</svg>
`

/*
const s_AddEpisodeIcon =
`
<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
</svg>
`
*/

const s_AddEpisodeIcon =
`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M3 10H2V4.003C2 3.449 2.455 3 2.992 3h18.016A.99.99 0 0 1 22 4.003V10h-1v10.001a.996.996 0 0 1-.993.999H3.993A.996.996 0 0 1 3 20.001V10zm16 0H5v9h14v-9zM4 5v3h16V5H4zm5 7h6v2H9v-2z"/>
</svg>
`

const s_RemoveEpisodeIcon =
`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M20 3l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004L4 3h16zm0 6H4v10h16V9zm-8 1l4 4h-3v4h-2v-4H8l4-4zm6.764-5H5.236l-.999 2h15.527l-1-2z"/>
</svg>
`

/*
const s_RemoveEpisodeIcon =
`
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
</svg>
`
*/

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

/*
const s_GridView =
`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>
</svg>
`
*/

const s_GridView =
`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path d="M14 10v4h-4v-4h4zm2 0h5v4h-5v-4zm-2 11h-4v-5h4v5zm2 0v-5h5v4a1 1 0 0 1-1 1h-4zM14 3v5h-4V3h4zm2 0h4a1 1 0 0 1 1 1v4h-5V3zm-8 7v4H3v-4h5zm0 11H4a1 1 0 0 1-1-1v-4h5v5zM8 3v5H3V4a1 1 0 0 1 1-1h4z"/>
</svg>
`

const s_ListView =
`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="18px" height="18px">
    <path d="M0 0h24v24H0V0z" fill="none"/>
    <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
</svg>
`

const s_InfoIcon =
`
<svg fill="#fffff" style="isolation:isolate" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28px" height="28px">
    <path d="M12,2A10,10,0,1,0,22,12,10.01114,10.01114,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8.00917,8.00917,0,0,1,12,20Zm0-8.5a1,1,0,0,0-1,1v3a1,1,0,0,0,2,0v-3A1,1,0,0,0,12,11.5Zm0-4a1.25,1.25,0,1,0,1.25,1.25A1.25,1.25,0,0,0,12,7.5Z"/>
</svg>
`

const s_SearchNothingFoundIcon =
`
<svg viewBox="0 0 100 100" fill="white" width="80px" height="80px" class="dNWARe">
    <circle cx="50%" cy="50%" r="50" fill="#BDC1C6" width="100%" height="100%"></circle>
    <path d="M31 28h-1.59l-.55-.55C30.82 25.18 32 22.23 32 19c0-7.18-5.82-13-13-13S6 11.82 6 19s5.82 13 13 13c3.23 0 6.18-1.18 8.45-3.13l.55.55V31l10 9.98L40.98 38 31 28zm-12 0c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" transform="translate(25 25)"></path>
    <path d="M0 0h48v48H0z" fill="none"></path>
</svg>
`

const s_ArrowUpIcon = 
`
<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
</svg>
`

const s_PlaylistNothingFoundIcon = 
`
<svg id="master-artboard" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" style="enable-background:new 0 0 336 235.2;" width="80px" height="80px">
	<rect id="ee-background" x="0" y="0" width="80" height="80" style="fill: white; fill-opacity: 0; pointer-events: none;"/>
	<defs>
		<style id="ee-google-fonts">@import url(https://fonts.googleapis.com/css?family=Audiowide:400);</style>
		<linearGradient x1="0" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse" id="color-1">
			<stop offset="0" stop-color="#000000" stop-opacity="0"/>
			<stop offset="1" stop-color="#000000" stop-opacity="0"/>
		</linearGradient>
		<filter id="dropshadow-base">
			<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .8 0"/> 
			<feOffset dx="0" dy="1"/> 
			<feGaussianBlur stdDeviation="1"/> 
			<feComposite in="SourceGraphic"/>
		</filter>
		<filter id="dropshadow-banner" x="-10%" y="-10%" width="120%" height="130%">
			<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .4 0"/> 
			<feOffset dx="0" dy="1"/> 
			<feGaussianBlur stdDeviation="0.5"/> 
			<feComposite in="SourceGraphic"/>
		</filter>
	</defs>
	<g transform="matrix(1.8127284320135602, 0, 0, 1.811854600906372, -3.5489268843213098, -3.5120863914489746)">
		<g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
			<path d="M2,24c0,-12.15026 9.84974,-22 22,-22c12.15026,0 22,9.84974 22,22c0,12.15026 -9.84974,22 -22,22c-12.15026,0 -22,-9.84974 -22,-22z" id="base 1 5" fill="#bdc1c6" stroke-width="1"/>
			<path d="M48.66998,42.14173h-14.24345l-19.32868,-19.32868v-2.37391h14.24345l19.32868,19.32868zM48.66998,35.02v2.37391l-19.32868,-19.32868v-2.37391zM15.09784,27.56086v-2.37391l19.32868,19.32868v2.37391z" fill="url(#color-1)" stroke-width="1"/>
			<path d="M15.09784,20.43914h14.24345v2.37391h-14.24345zM15.09784,15.69132h14.24345v2.37391h-14.24345zM15.09784,25.18695h9.49564v2.37391h-9.49564zM32.90216,28.74782l-5.93477,3.56086v-7.12173z" fill="none" stroke-width="0"/>
			<path d="M15.09784,20.43914h14.24345v2.37391h-14.24345zM15.09784,15.69132h14.24345v2.37391h-14.24345zM15.09784,25.18695h9.49564v2.37391h-9.49564zM32.90216,28.74782l-5.93477,3.56086v-7.12173z" fill="#ffffff" stroke-width="0"/>
			<path d="M2,24c0,-12.15026 9.84974,-22 22,-22c12.15026,0 22,9.84974 22,22c0,12.15026 -9.84974,22 -22,22c-12.15026,0 -22,-9.84974 -22,-22z" id="base 1 1 1" fill="none" stroke-width="1"/><g fill="#000000" stroke-width="1" font-family="Roboto, sans-serif" font-weight="400" font-size="14" text-anchor="start"/>
			<path d="M 2 2 H 46 V 24 H 2 V 2 Z" fill="none" stroke-width="1"/><path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/>
			<path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/><path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/>
			<path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/>
		</g>
	</g>
</svg>
`

const s_NewEpisodesNothingFoundIcon = 
`
<svg id="master-artboard" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd">
	<defs>
		<linearGradient x1="0" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse" id="color-1">
			<stop offset="1" stop-color="#000000" stop-opacity="0"/>
			<stop offset="1" stop-color="#000000" stop-opacity="0"/>
		</linearGradient>
		<filter id="dropshadow-base">
			<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .8 0"/> 
			<feOffset dx="0" dy="1"/> 
			<feGaussianBlur stdDeviation="1"/> 
			<feComposite in="SourceGraphic"/>
		</filter>
		<filter id="dropshadow-banner" x="-10%" y="-10%" width="120%" height="130%">
			<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .4 0"/> 
			<feOffset dx="0" dy="1"/> 
			<feGaussianBlur stdDeviation="0.5"/> 
			<feComposite in="SourceGraphic"/>
		</filter>
	</defs>
	<rect id="ee-background" x="0" y="0" width="80" height="80" style="fill: white; fill-opacity: 0; pointer-events: none;"/>
	<metadata id="CorelCorpID_0Corel-Layer"/>
	<g transform="matrix(1.8181819915771487, 0, 0, 1.8181819915771487, -3.780379295349121, -3.6793244679768904)">
		<g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
			<path d="M2,24c0,-12.15026 9.84974,-22 22,-22c12.15026,0 22,9.84974 22,22c0,12.15026 -9.84974,22 -22,22c-12.15026,0 -22,-9.84974 -22,-22z" id="base 1 5" fill="#bdc1c6" stroke-width="1"/>
			<path d="" fill="url(#color-1)" stroke-width="1"/>
			<path d="M28.65243,30.28078v3.02408h-9.30486v-3.02408c0,-1.28407 2.08429,-2.32622 4.65243,-2.32622c2.56814,0 4.65243,1.04214 4.65243,2.32622zM24,18.41708c3.34031,0 6.04816,2.70785 6.04816,6.04816c0,1.16311 -0.32567,2.25178 -0.89327,3.17296l-1.43295,-1.27477c0.29776,-0.5676 0.46524,-1.21894 0.46524,-1.89819c0,-2.32622 -1.86097,-4.18719 -4.18719,-4.18719c-2.32622,0 -4.18719,1.86097 -4.18719,4.18719c0,0.67926 0.16749,1.3306 0.46524,1.89819l-1.43295,1.27477c-0.5676,-0.92118 -0.89327,-2.00985 -0.89327,-3.17296c0,-3.34031 2.70785,-6.04816 6.04816,-6.04816zM24,14.69514c5.39588,0 9.77011,4.37423 9.77011,9.77011c0,2.12151 -0.67926,4.08484 -1.82375,5.68527l-1.39573,-1.25616c0.85605,-1.26546 1.35851,-2.79146 1.35851,-4.42912c0,-4.36809 -3.54104,-7.90913 -7.90913,-7.90913c-4.36809,0 -7.90913,3.54104 -7.90913,7.90913c0,1.63766 0.50246,3.16365 1.35851,4.42912l-1.39573,1.25616c-1.18779,-1.65759 -1.82566,-3.64604 -1.82375,-5.68527c0,-5.39588 4.37423,-9.77011 9.77011,-9.77011zM24,22.13903c1.28473,0 2.32622,1.04148 2.32622,2.32622c0,1.28473 -1.04148,2.32622 -2.32622,2.32622c-1.28473,0 -2.32622,-1.04148 -2.32622,-2.32622c0,-1.28473 1.04148,-2.32622 2.32622,-2.32622z" fill="none" stroke-width="0"/>
			<path d="M28.65243,33.30486h-9.30486v-3.02408c0,-1.28407 2.08429,-2.32622 4.65243,-2.32622c2.56814,0 4.65243,1.04214 4.65243,2.32622zM30.04816,24.46524c0,1.16311 -0.32567,2.25178 -0.89327,3.17296l-1.43295,-1.27477c0.29776,-0.5676 0.46524,-1.21894 0.46524,-1.89819c0,-2.32622 -1.86097,-4.18719 -4.18719,-4.18719c-2.32622,0 -4.18719,1.86097 -4.18719,4.18719c0,0.67926 0.16749,1.3306 0.46524,1.89819l-1.43295,1.27477c-0.5676,-0.92118 -0.89327,-2.00985 -0.89327,-3.17296c0,-3.34031 2.70785,-6.04816 6.04816,-6.04816c3.34031,0 6.04816,2.70785 6.04816,6.04816zM33.77011,24.46524c0,2.12151 -0.67926,4.08484 -1.82375,5.68527l-1.39573,-1.25616c0.85605,-1.26546 1.35851,-2.79146 1.35851,-4.42912c0,-4.36809 -3.54104,-7.90913 -7.90913,-7.90913c-4.36809,0 -7.90913,3.54104 -7.90913,7.90913c0,1.63766 0.50246,3.16365 1.35851,4.42912l-1.39573,1.25616c-1.18779,-1.65759 -1.82566,-3.64604 -1.82375,-5.68527c0,-5.39588 4.37423,-9.77011 9.77011,-9.77011c5.39588,0 9.77011,4.37423 9.77011,9.77011zM24,22.13903c1.28473,0 2.32622,1.04148 2.32622,2.32622c0,1.28473 -1.04148,2.32622 -2.32622,2.32622c-1.28473,0 -2.32622,-1.04148 -2.32622,-2.32622c0,-1.28473 1.04148,-2.32622 2.32622,-2.32622z" fill="#ffffff" stroke-width="0"/>
			<path d="M2,24c0,-12.15026 9.84974,-22 22,-22c12.15026,0 22,9.84974 22,22c0,12.15026 -9.84974,22 -22,22c-12.15026,0 -22,-9.84974 -22,-22z" id="base 1 1 1" fill="none" stroke-width="1"/>
			<g fill="#000000" stroke-width="1" font-family="Roboto, sans-serif" font-weight="400" font-size="14" text-anchor="start"/>
			<path d="M 2 2 H 46 V 24 H 2 V 2 Z" fill="none" stroke-width="1"/>
			<path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/><path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/>
			<path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/><path d="M2,24v-22h44v22z" fill="none" stroke-width="1"/>
		</g>
	</g>
</svg>
`

const s_ArchiveNothingFoundIcon = 
`
<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" height="80" viewBox="0 0 80 80" width="80" version="1.1"
   id="svg6" sodipodi:docname="inbox-24px.svg" inkscape:version="1.0.1 (3bc2e813f5, 2020-09-07)">
   <metadata id="metadata12">
      <rdf:RDF>
         <cc:Work rdf:about="">
            <dc:format>image/svg+xml</dc:format>
            <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
            <dc:title></dc:title>
         </cc:Work>
      </rdf:RDF>
   </metadata>
   <defs id="defs10" />
   <sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10"
      gridtolerance="10" guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2"
      inkscape:window-width="1920" inkscape:window-height="1016" id="namedview8" showgrid="false"
      inkscape:zoom="4.15625" inkscape:cx="34.765659" inkscape:cy="17.467417" inkscape:window-x="0"
      inkscape:window-y="0" inkscape:window-maximized="1" inkscape:current-layer="g842" />
   <circle style="fill:#bdc1c6;stroke-width:209.832;stroke-opacity:0.873911;fill-opacity:1" id="path844" cx="40" cy="40"
      r="40" />
   <g id="g842" transform="translate(28,28)">
      <path d="M 0,0 H 24 V 24 H 0 Z" fill="none" id="path2" />
      <path
         d="M 25.611111,-5.5 H -1.6305556 c -2.1583333,0 -3.85,1.7305556 -3.85,3.8888889 L -5.5,25.611111 C -5.5,27.75 -3.7888889,29.5 -1.6305556,29.5 H 25.611111 C 27.75,29.5 29.5,27.75 29.5,25.611111 V -1.6111111 C 29.5,-3.7694444 27.75,-5.5 25.611111,-5.5 Z m 0,23.333333 h -7.777778 c 0,3.227778 -2.625,5.833334 -5.833333,5.833334 -3.208333,0 -5.833333,-2.605556 -5.833333,-5.833334 H -1.6305556 V -1.6111111 H 25.611111 Z"
         id="path4" style="fill:#ffffff;stroke-width:1.94444" />
      <rect style="opacity:0;fill:#ffffff;stroke-width:292.691;stroke-opacity:0.873911" id="rect837" width="80"
         height="80" x="-28" y="-28" rx="182.05968" ry="240.0775" />
   </g>
</svg>
`

const s_FavoritesNothingFoundIcon = 
`
<svg id="master-artboard" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
    style="enable-background:new 0 0 1400 980;" width="80px" height="80px">
    <defs>
        <linearGradient x1="0" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse" id="color-1">
            <stop offset="1" stop-color="#000000" stop-opacity="0" />
            <stop offset="1" stop-color="#000000" stop-opacity="0" />
        </linearGradient>
        <filter id="dropshadow-base">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .8 0" />
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="1" />
            <feComposite in="SourceGraphic" />
        </filter>
        <filter id="dropshadow-banner" x="-10%" y="-10%" width="120%" height="130%">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .4 0" />
            <feOffset dx="0" dy="1" />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in="SourceGraphic" />
        </filter>
    </defs>
    <rect id="ee-background" x="0" y="0" width="80" height="80"
        style="fill: white; fill-opacity: 0; pointer-events: none;" />
    <g transform="matrix(1.8030302463625543, 0, 0, 1.8030302463625543, -3.2727260467717394, -3.2727234241673693)">
        <g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt"
            stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none"
            font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal">
            <path
                d="M2,24c0,-12.15026 9.84974,-22 22,-22c12.15026,0 22,9.84974 22,22c0,12.15026 -9.84974,22 -22,22c-12.15026,0 -22,-9.84974 -22,-22z"
                id="base 1 5" fill="#bdc1c6" stroke-width="1" />
            <path d="" fill="url(#color-1)" stroke-width="1" />
            <path transform="translate(-2.859,-3.02221) scale(1.11913,1.11913)"
                d="M24,31.79167l-1.20833,-1.1c-4.29167,-3.89167 -7.125,-6.45833 -7.125,-9.60833c0,-2.56667 2.01667,-4.58333 4.58333,-4.58333c1.45,0 2.84167,0.675 3.75,1.74167c0.90833,-1.06667 2.3,-1.74167 3.75,-1.74167c2.56667,0 4.58333,2.01667 4.58333,4.58333c0,3.15 -2.83333,5.71667 -7.125,9.61667z"
                fill="none" stroke-width="0" />
            <path
                d="M24,32.55664l-1.35228,-1.23104c-4.80291,-4.35526 -7.97377,-7.22768 -7.97377,-10.75293c0,-2.87242 2.2569,-5.12932 5.12932,-5.12932c1.62273,0 3.18018,0.75541 4.19672,1.94914c1.01654,-1.19373 2.57399,-1.94914 4.19672,-1.94914c2.87242,0 5.12932,2.2569 5.12932,5.12932c0,3.52524 -3.17085,6.39767 -7.97377,10.76225z"
                fill="#ffffff" stroke-width="0" />
            <path
                d="M2,24c0,-12.15026 9.84974,-22 22,-22c12.15026,0 22,9.84974 22,22c0,12.15026 -9.84974,22 -22,22c-12.15026,0 -22,-9.84974 -22,-22z"
                id="base 1 1 1" fill="none" stroke-width="1" />
            <g fill="#000000" stroke-width="1" font-family="Roboto, sans-serif" font-weight="400" font-size="14"
                text-anchor="start" />
            <path d="M 2 2 H 46 V 24 H 2 V 2 Z" fill="none" stroke-width="1" />
            <path d="M2,24v-22h44v22z" fill="none" stroke-width="1" />
            <path d="M2,24v-22h44v22z" fill="none" stroke-width="1" />
            <path d="M2,24v-22h44v22z" fill="none" stroke-width="1" />
            <path d="M2,24v-22h44v22z" fill="none" stroke-width="1" />
        </g>
    </g>
</svg>
`