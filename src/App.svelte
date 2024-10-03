<script >
  import Editor from "./Editor.svelte";
  let text = $state("")
  function typeCheck() {
      console.log("TYPE CHECK")
  }

  function updateText(str) {
      text = str
  }
</script>

<main class="flex flex-col h-full">
  <nav class="p-2 flex items-center gap-2 border-stone-700 border-b-2">
    <button class="border-stone-700 border-2 bg-lime-400 font-bold py-1 px-2" onclick={typeCheck}>TYPE CHECK</button>
    <button class="border-stone-700 border-2 bg-violet-300 font-bold py-1 px-2" >GENERATE PROLOG</button>

  </nav>
  <div class="w-full h-full flex ">
    <div class="flex-grow flex-1 relative">
      <Editor updateText={updateText}></Editor>
    </div>
    <div class="flex-1 relative border-l-2 border-stone-700">
      <h1>{text}</h1>
    </div>
  </div>
</main>