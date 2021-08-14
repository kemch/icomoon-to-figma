<script>
// import { createEventDispatcher } from 'svelte';
// const dispatch = createEventDispatcher();
import {onMount} from 'svelte';

export let text = "Choose File";
// export let files = [];
// export let filechange = ()=>{};

// function change(event) {
//     filechange(event)
//     console.log(event.target.files[0].name)
//     text = `File: ${event.target.files[0].name}`;
// }

</script>

<label class="file">
    <input class="file-input" on:change type="file">
    <span class="file-custom">{text}</span>
</label>

<style>

.file  {
    position: relative;
    display: inline-block;
    cursor: pointer;
    height: var(--size-medium);
}
    
.file-custom {
	position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5;
    min-width: 200px;

    text-align: center;
    justify-content: center;

    display: flex;
    align-items: center;
    border-radius: var(--border-radius-large);
    color: var(--white);
    flex-shrink: 0;
    font-family: var(--font-stack);
    font-size: var(--font-size-xsmall);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--font-letter-spacing-neg-small);
    line-height: var(--font-line-height);
    height: var(--size-medium);
    padding: 0 var(--size-xsmall) 0 var(--size-xsmall);
    text-decoration: none;
    outline: none;
    border: 2px solid transparent;
    /* user-select: none; */
	
    background-color: var(--white);
    border: 1px solid var(--black8);
    color: var(--black8);
    padding: 0 calc(var(--size-xsmall) + 1px) 0 calc(var(--size-xsmall) + 1px);
    letter-spacing: var(--font-letter-spacing-pos-small);
}

.file-input {
	min-width: 14rem;
    margin: 0;
    opacity: 0;
}
</style>