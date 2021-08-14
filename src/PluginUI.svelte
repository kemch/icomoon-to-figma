
<!--  TODO




states
* icon font not installed instructions
* not selection.json
* loading state for getting all components in document
* css class list todo


https://github.com/thomas-lowry/figma-plugin-ds-svelte



 -->

<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import FileInput from './FileInput.svelte';
	import ProgressBar from './ProgressBar.svelte';

	//import some Svelte Figma UI components
	import {
	Button
	,Icon
	,Section
	,Input
	,IconVisible
	,IconSpinner
	,IconCheck
	,IconWarning
	,Label
	,Type
	,SelectMenu } from 'figma-plugin-ds-svelte';

	var disabled = true;
	let icomoonJson = {};
	let fileInput = [];
	let cancelled = false;
	let workingState = false;
	let nodesCollected = false;

	$: disabled = fileInput.length === 0;
	$: error = '';


	let iconCount = 0;
	let message = {
		icon: '',
		text: ''
	}
	// $: message = message;
	console.log(message)
	let iconFontInstalled = false;

	onmessage = async (event) => {
		// LOCAL COMPONENTS
		// message = event.data.pluginMessage;
		if (event.data.pluginMessage.type === 'create-end' ) {
			iconCount = event.data.pluginMessage.count;
			message = {icon: 'load', text: `${event.data.pluginMessage.completed} created. ${event.data.pluginMessage.skipped} skipped.`}
			if (!cancelled) {
				createIcons()
			} else {
				cancelled = false;
			}
		}



		if (event.data.pluginMessage.type === 'nodes-collected' ) {
			nodesCollected = event.data.pluginMessage.nodesCollected;
			createIcons();
		}

		if (event.data.pluginMessage.type === 'loop-end' ) {
			workingState = event.data.pluginMessage.workingState;
			message = {icon: '', text: `Done`}
			console.log('all done');
		}

		if (event.data.pluginMessage.type === 'analyze-selection') {
			iconFontInstalled = event.data.pluginMessage.fontInstalled;
		}

		if (event.data.pluginMessage.type === 'results') {
			message = {icon: 'check', text: event.data.pluginMessage.message}
		}

	}

	function prepareIcons() {
		parent.postMessage({ pluginMessage: { 
			'type': 'load-fonts',
			'font': icomoonJson.preferences.fontPref.metadata.fontFamily
		} }, '*');
	}


    function collectNodes() {

    	workingState = true;
    	nodesCollected = false;


    	message = {
    		icon: 'load',
    		text: 'Analyzing document nodes...'
    	}
    	// setTimeout b/c sometimes plugin code gets called first
    	setTimeout(function(){
	    	parent.postMessage({ pluginMessage: { 
				'type': 'collect-nodes'
			} }, '*');
    	},1000);

    }

	function createIcons() {
		workingState = true;
		cancelled = false;
		parent.postMessage({ pluginMessage: { 
			'type': 'create-icon',
			'count' : iconCount,
			'icon': icomoonJson.icons[iconCount-1],
			'font': icomoonJson.preferences.fontPref.metadata.fontFamily,
			'building' : true,
			'prefix': icomoonJson.preferences.fontPref.prefix
		} }, '*');
	}

	function getSelection(event) {

        var reader = new FileReader();

        reader.onload = onReaderLoad;
		
        if (event.target.files.length) {
        	reader.readAsText(event.target.files[0]);
        	fileInput = event.target.files;
        } else {
        	fileInput = [];
        }
    }

    function onReaderLoad(event){
    	try {
	        icomoonJson = JSON.parse(event.target.result);
	    	iconCount = icomoonJson.icons.length;
	    	error = '';
	    	prepareIcons()
    	} 
    	catch (e) {
    		reset()
    		error = 'Not a valid file. Please find selection.json';
    		console.log(e);
    	}
    }

    function cancel() {
    	cancelled = true;
    }


    function reset() {
    	icomoonJson = {};
		fileInput = [];
		cancelled = false;
		iconCount = 0;
    }

    parent.postMessage({ pluginMessage: { 
		'type': 'init'
	} }, '*');

	console.log(iconCount)

</script>


<div class="wrapper">

	<!-- progress bar -->
	{#if "icons" in icomoonJson && fileInput.length}
		<ProgressBar percent={`${((icomoonJson.icons.length-iconCount-1)/(icomoonJson.icons.length-1)).toFixed(2)*100}%`} />
	{/if}

	<!-- default / empty -->
	{#if fileInput.length === 0}
		<div class="p-small">
			<div class="instructions font-size-xsmall text-center">
				Find your Icomoon project’s selection.json. 
			</div>


			<div class="text-center p-small">
				<FileInput on:change={getSelection} text="Import Icomoon Project" />

				{#if error !== ''}
					<div class="error">{error}</div>
				{/if}

				<p class="instructions2 font-size-xsmall text-center">
					Note: If the .ttf font exported with your icomoon project is not installed as a system font, first install it and then restart Figma.
				</p>
			</div>
		</div>

	{/if}

	<!-- valid selection.json selected -->
	{#if "icons" in icomoonJson && fileInput.length}
		<div class="p-small main-content">
			<div class="load-info">
				<div class="load-info__name">
					{icomoonJson.metadata.name}
				</div>
				<div class="load-info__field">
					<div class="info-label">Font Family</div>	
					<div class="info-value">{icomoonJson.preferences.fontPref.metadata.fontFamily}</div>	
				</div>
				<div class="load-info__field">
					<div class="info-label">Number of Icons</div>	
					<div class="info-value">{icomoonJson.icons.length - 1}</div>
				</div>
			</div>
			<!-- selection.json -->
			{#if iconFontInstalled && !workingState}
				<div class="center">
					<Button on:click={collectNodes}>Build Components</Button>
				</div>
			{:else if !iconFontInstalled && nodesCollected}
				<div class="warning">
					<Icon class="icon" iconName={IconWarning} color="red" /> Font Not Installed
				</div>			
				<div class="instructions2 font-size-xsmall text-center">
					The font "{icomoonJson.preferences.fontPref.metadata.fontFamily}" must be installed on your system before building components. Install the .ttf font exported with your Icomoon project then restart Figma.
				</div>
			{/if}
		</div>
	{/if}


	{#if (message.text.length)}
		<div class="message">
			{#if (message.icon == 'load')}
				<div class="message__icon">
					<Icon class="icon" iconName={IconSpinner} color="blue" spin/>
				</div>
			{/if}
			{#if (message.icon == 'warning')}
				<div class="message__icon">
					<Icon class="icon" iconName={IconWarning} color="blue"/>
				</div>
			{/if}
			{#if (message.icon == 'check')}
				<div class="message__icon">
					<Icon class="icon" iconName={IconCheck} color="blue"/>
				</div>
			{/if}
			<div class="message__content">
				{message.text}
			</div>
		</div>
	{/if}
</div>


<style>
	.text-center {
		text-align: center;
	}
	.load-info {
		display: flex;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}
	.load-info > div {
		flex:  0 0 50%;
		max-width: 50%;
		width:  50%;
		text-align: center;
	}

	.load-info > div.load-info__name {
		flex:  0 0 100%;
		max-width: 100%;
		width: 100%;
		margin-bottom: 16px;
	}
	.info-label	{
		font-size:  var(--font-size-xsmall);
		font-weight:  600;		
	}
	.info-value {
		font-size:  var(--font-size-xsmall);
		margin-top:  8px;
	}



.font-size-xsmall {
	font-size:  var(--font-size-xsmall);
}
.warning,
.message {
	color: var(--blue);
	display: flex;
	align-items: center;
	font-size: var(--font-size-small);
	justify-content: center;
}

.error {
	font-size: var(--font-size-small);
	color:  var(--red);
}

.warning {
	color:  var(--red);
}
.warning > div {
	width:  16px;
	height:  16px;
}


.center {
	display: flex;
	justify-content: center;
	align-items:  center;
}

.instructions2 {
	margin-top:  16px;
	color:  #888;
}

.instructions {
	color:  var(--black8);
	font-size:  var(--font-size-large);
}
.main-content {
	padding-bottom:  0;
}

</style>