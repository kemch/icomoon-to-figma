<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';

	//import some Svelte Figma UI components
	import {
	Button
	,Icon
	,Section
	,Input
	,IconVisible
	,IconSpinner
	,IconWarning
	,Label
	,Type
	,SelectMenu } from 'figma-plugin-ds-svelte';

	var disabled = true;
	let icomoonJson = {};
	let fileInput = [];

	$: disabled = fileInput.length === 0;
	$: message = { icon: '', text: ''};

	let message = {
		icon: '',
		text: ''
	}

	onmessage = async (event) => {
		// LOCAL COMPONENTS
		message = event.data.pluginMessage;
	}


	// let fileInput = [];
	// var selectedShape;
	// var count = 5;

	//this is a reactive variable that will return false when a value is selected from
	//the select menu, its value is bound to the primary buttons disabled prop
	// $: disabled = selectedShape === null;

	function createIcons() {
		message.text = "Button pressed";
		parent.postMessage({ pluginMessage: { 
			'type': 'prepare-icons', 
			'icons' : icomoonJson
			// 'count': count,
			// 'shape': selectedShape.value
		} }, '*');
	}

	function getSelection(event) {
		// debugger
        var reader = new FileReader();
        reader.onload = onReaderLoad;
		
        // reader.onload = onReaderLoad;
        if (event.target.files.length) {
        	reader.readAsText(event.target.files[0]);
        	fileInput = event.target.files;
        } else {
        	fileInput = [];
        }
    }

    function onReaderLoad(event){
        icomoonJson = JSON.parse(event.target.result);
        console.log(icomoonJson);
    }

    function log() {
    	console.log(icomoonJson)
    }
    function test() {
    	parent.postMessage({ pluginMessage: { 
			'type': 'test'
		} }, '*');
    }
</script>


<div class="wrapper p-xxsmall">
	<button on:click={test}>test</button>

	<input type="file" on:change={getSelection} >

	<div class="info">
		{#if "icons" in icomoonJson && fileInput.length}
		<div>{icomoonJson.metadata.name} icons</div>
		<div>{icomoonJson.icons.length}</div>
			
			<div>{icomoonJson.preferences.fontPref.metadata.majorVersion}.{icomoonJson.preferences.fontPref.metadata.minorVersion}</div>
			<div>Select a frame to create icon components</div>
		{/if}
	</div>


	<div class="flex p-xxsmall mb-xsmall">
		<Button disabled={disabled} on:click={createIcons}>Create Icons</Button>
	</div>
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
			<div class="message__content">
				{message.text}
			</div>
		</div>
	{/if}
</div>


<style>


.message {
	color: var(--blue);
	display: flex;
	align-items: center;
	font-size: var(--font-size-xsmall);
}

</style>